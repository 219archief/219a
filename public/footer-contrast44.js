/* Render uitsluitend lettervormen als een grijs geïnverteerd venster op de pagina.
   De echte tekst blijft in de documentstroom, selecteerbaar en toegankelijk. */
(function () {
  const backdrop = CSS.supports('backdrop-filter', 'invert(1)') || CSS.supports('-webkit-backdrop-filter', 'invert(1)');
  const masking = CSS.supports('mask-image', 'url("")') || CSS.supports('-webkit-mask-image', 'url("")');
  if (!backdrop || !masking) return;
  const selector = '.colophon';
  const entries = new Map(), layers = new Map();
  const canvas = document.createElement('canvas'), context = canvas.getContext('2d');
  if (!context) return;
  let frame = 0, dirty = true, settlingUntil = 0;
  function layerFor(source) {
    const host = source.closest('dialog') || document.body;
    if (!layers.has(host)) {
      const layer = document.createElement('div');
      layer.className = 'text-contrast-layer footer-contrast-layer';
      layer.setAttribute('aria-hidden', 'true');
      host.append(layer);
      layers.set(host, layer);
    }
    return layers.get(host);
  }
  function register(source, label = false) {
    if (entries.has(source)) return;
    const overlay = document.createElement('span');
    overlay.className = 'text-contrast-glyphs footer-contrast-base';
    layerFor(source).append(overlay);
    const effect=overlay.cloneNode();effect.className="text-contrast-glyphs footer-contrast-effect";layerFor(source).append(effect); entries.set(source, { source, overlay, effect, label, signature: '' });
  }
  function discover() {
    document.querySelectorAll('.colophon .honk-label').forEach(label => register(label, true));
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        return node.textContent.trim() && parent?.closest(selector) &&
          !parent.closest('.honk-label,.text-contrast-source,.text-contrast-layer,script,style')
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const source = document.createElement('span');
      source.className = 'text-contrast-source';
      node.replaceWith(source);
      source.append(node);
      register(source);
    }
  }
  function fontFor(style, family = style.fontFamily) {
    return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${family}`;
  }
  function transformText(text, style) {
    return style.textTransform === 'lowercase' ? text.toLowerCase() : style.textTransform === 'uppercase' ? text.toUpperCase() : text;
  }
  function ancestorOpacity(source) {
    let opacity = 1;
    for (let parent = source.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (style.visibility === 'hidden' || style.display === 'none') return 0;
      opacity *= Number(style.opacity);
    }
    return opacity;
  }
  function paint(entry, force) {
    const { source, overlay, effect, label } = entry;
    if (!source.isConnected) { overlay.remove(); effect.remove(); entries.delete(source); return; }
    const dialog = source.closest('dialog');
    const range = document.createRange();
    range.selectNodeContents(label ? source.querySelector('.honk-original') : source);
    const rect = range.getBoundingClientRect();
    const style = getComputedStyle(source);
    const opacity = ancestorOpacity(source);
    if (!rect.width || !rect.height || rect.bottom < -20 || rect.top > innerHeight + 20 ||
      style.visibility === 'hidden' || opacity === 0 || (dialog && !dialog.open)) {
      overlay.hidden = true;effect.hidden=true;
      return;
    }
    const link = label && source.closest('a');
    const hovered = link && ((matchMedia('(hover:hover)').matches && link.matches(':hover')) || link.matches(':focus-visible'));
    const font = fontFor(style, hovered ? '"Instrument Serif"' : style.fontFamily);
    const text = transformText(source.textContent, style);
    const signature = [rect.width, rect.height, font, text, style.letterSpacing, hovered, devicePixelRatio].join('|');
    let pad = entry.pad || 3;
    if (force || signature !== entry.signature) {
      context.font = font;
      const textWidth = hovered ? context.measureText(text).width : rect.width;
      pad = Math.max(3, Math.ceil(textWidth - rect.width) + 3);
      const dpr = Math.min(devicePixelRatio || 1, 3);
      const width = Math.ceil(rect.width + pad * 2), height = Math.ceil(rect.height + pad * 2);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.font = font;
      context.fillStyle = '#fff';
      context.textBaseline = 'alphabetic';
      const metrics = context.measureText('Mg');
      const ascent = metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
      const descent = metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;
      function baseline(box) { return pad + box.top - rect.top + (box.height - ascent - descent) / 2 + ascent; }
      if (hovered) {
        const x = link.closest('header>nav') ? (rect.width - textWidth) / 2 : 0;
        context.fillText(text, pad + x, baseline(rect));
      } else {
        const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          let offset = 0;
          for (const character of node.textContent) {
            range.setStart(node, offset);
            offset += character.length;
            range.setEnd(node, offset);
            const box = range.getBoundingClientRect();
            if (box.width && box.height) context.fillText(transformText(character, style), pad + box.left - rect.left, baseline(box));
          }
        }
      }
      const mask = `url("${canvas.toDataURL()}")`;
      overlay.style.maskImage = mask;
      overlay.style.webkitMaskImage = mask;
      overlay.style.width = width + 'px';
      overlay.style.height = height + 'px';
      entry.signature = signature;
      entry.pad = pad;
      source.classList.add(label ? 'text-contrast-label-ready' : 'text-contrast-source-ready');
    }
    overlay.style.left = rect.left - pad + 'px';
    overlay.style.top = rect.top - pad + 'px';
    overlay.style.opacity = opacity;
        overlay.hidden = false;effect.hidden=false;effect.style.cssText=overlay.style.cssText;
    const left=rect.left-pad,top=rect.top-pad,w=parseFloat(overlay.style.width),h=parseFloat(overlay.style.height);
    const images=document.querySelector('.project-color-overlay')?.querySelectorAll('.project-transition-photo')||document.querySelectorAll('.photo img,.project-row img');
    const boxes=[];
    for(const img of images){if(!img.complete||!img.naturalWidth||!img.getClientRects().length||ancestorOpacity(img)<.001)continue;const r=img.getBoundingClientRect();const x=Math.max(left,r.left)-left,y=Math.max(top,r.top)-top,right=Math.min(left+w,r.right)-left,bottom=Math.min(top+h,r.bottom)-top;if(right>x&&bottom>y)boxes.push({x,y,r:right,b:bottom})}
    const ys=[...new Set(boxes.flatMap(r=>[r.y,r.b]))].sort((a,b)=>a-b),parts=[];
    const n=v=>Number(v.toFixed(3)),pathRect=(x,y,r,b)=>`M${n(x)} ${n(y)}H${n(r)}V${n(b)}H${n(x)}Z`;
    for(let i=0;i<ys.length-1;i++){const y=ys[i],b=ys[i+1],spans=boxes.filter(r=>r.y<=y&&r.b>=b).map(r=>[r.x,r.r]).sort((a,b)=>a[0]-b[0]);let merged;for(const span of spans){if(merged&&span[0]<=merged[1])merged[1]=Math.max(merged[1],span[1]);else{if(merged)parts.push(pathRect(merged[0],y,merged[1],b));merged=[...span]}}if(merged)parts.push(pathRect(merged[0],y,merged[1],b))}
    const path=parts.join('');overlay.style.clipPath=path?`path(evenodd, '${pathRect(0,0,w,h)+path}')`:'inset(0)';effect.style.clipPath=path?`path('${path}')`:'inset(50%)';
  }
  function render() {
    frame = 0;
    const force = dirty;
    dirty = false;
    discover();
    entries.forEach(entry => paint(entry, force));
    if (performance.now() < settlingUntil || document.querySelector('.photo.is-zooming,.project-row figure.is-zooming,.project-color-overlay')) schedule();
  }
  function schedule(force = false) {
    dirty ||= force;
    if (!frame) frame = requestAnimationFrame(render);
  }
  Promise.all([document.fonts.load('13px "SUSE Mono"'), document.fonts.load('13px "Instrument Serif"')]).then(() => {
    document.body.classList.add('footer-contrast-active');
    settlingUntil = performance.now() + 1000;
    schedule(true);
    new MutationObserver(records => {
      if (records.some(record => !(record.target.parentElement || record.target).closest?.('.text-contrast-layer'))) schedule(true);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('scroll', () => schedule(), { passive: true });
    window.addEventListener('resize', () => schedule(true), { passive: true });
    window.addEventListener('pageshow', () => schedule(true));
    window.addEventListener('hashchange', () => {settlingUntil=performance.now()+2500;schedule(true)});window.addEventListener('project-background-ready',()=>{settlingUntil=performance.now()+2500;schedule()});
    document.addEventListener('pointerover', () => schedule());
    document.addEventListener('pointerout', () => schedule());
    document.addEventListener('focusin', () => schedule());
    document.addEventListener('focusout', () => schedule());
    document.addEventListener('click', () => schedule(true));
    document.addEventListener('close', () => schedule(true), true);
    document.fonts.addEventListener('loadingdone', () => schedule(true));
  }).catch(() => { /* Laat de oorspronkelijke tekst staan als fontladen mislukt. */ });
})();

