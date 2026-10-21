/* Render uitsluitend lettervormen als een grijs geïnverteerd venster op de pagina.
   De echte tekst blijft in de documentstroom, selecteerbaar en toegankelijk. */
(function () {
  document.querySelectorAll('header>nav>a').forEach(link=>{const diamond=document.createElement('span');diamond.className='menu-diamond';diamond.setAttribute('aria-hidden','true');link.append(diamond)});
  const backdrop = CSS.supports('backdrop-filter', 'invert(1)') || CSS.supports('-webkit-backdrop-filter', 'invert(1)');
  const masking = CSS.supports('mask-image', 'url("")') || CSS.supports('-webkit-mask-image', 'url("")');
  if (!backdrop || !masking) return;
  const selector = 'header>nav';
  const entries = new Map(), layers = new Map();
  const canvas = document.createElement('canvas'), context = canvas.getContext('2d');
  if (!context) return;
  let frame = 0, dirty = true, settlingUntil = 0;
  function layerFor(source) {
    const host = source.closest('dialog') || document.body;
    if (!layers.has(host)) {
      const layer = document.createElement('div');
      layer.className = 'text-contrast-layer menu-contrast-layer';
      layer.setAttribute('aria-hidden', 'true');
      host.append(layer);
      layers.set(host, layer);
    }
    return layers.get(host);
  }
  function register(source, label = false, shape = false) {
    if (entries.has(source)) return;
    const overlay = document.createElement('span');
    overlay.className = 'text-contrast-glyphs menu-contrast-base';
    layerFor(source).append(overlay);
    const effect=overlay.cloneNode();effect.className="text-contrast-glyphs menu-contrast-effect";layerFor(source).append(effect); entries.set(source, { source, overlay, effect, label, shape, signature: '' });
  }
  function discover() {
    document.querySelectorAll('header>nav .menu-diamond').forEach(diamond=>register(diamond,false,true));
    document.querySelectorAll('header>nav .honk-label').forEach(label => register(label, true));
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
  function fontFor(style, family = style.fontFamily, scale = 1) {
    return `${style.fontStyle} ${style.fontWeight} ${parseFloat(style.fontSize)*scale}px ${family}`;
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
    const { source, overlay, effect, label, shape } = entry;
    if (!source.isConnected) { overlay.remove(); effect.remove(); entries.delete(source); return; }
    const dialog = source.closest('dialog');
    const range = document.createRange();
    range.selectNodeContents(label ? source.querySelector('.honk-original') : source);
    const rect = shape ? source.getBoundingClientRect() : range.getBoundingClientRect();
    const style = getComputedStyle(source);
    const opacity = ancestorOpacity(source);
    if (!rect.width || !rect.height || rect.bottom < -20 || rect.top > innerHeight + 20 ||
      style.visibility === 'hidden' || opacity === 0 || (dialog && !dialog.open)) {
      overlay.hidden = true;effect.hidden=true;
      return;
    }
    const link = label && source.closest('a');
    const hovered = link && ((matchMedia('(hover:hover)').matches && link.matches(':hover')) || link.matches(':focus-visible'));
    const scale=parseFloat(getComputedStyle(source.closest('header>nav')).scale)||1;
    if(hovered){entry.hoverStarted??=performance.now()}else{entry.hoverStarted=undefined}
    const hoverFonts=['"Instrument Serif"','Arial','Georgia','"Courier New"','"Helvetica Neue", Helvetica, sans-serif','Baskerville, "Times New Roman", serif'];
    const cycling=matchMedia('(prefers-reduced-motion:no-preference)').matches;
    const family=hoverFonts[cycling&&hovered?Math.floor((performance.now()-entry.hoverStarted)/150)%hoverFonts.length:0];
    const font = fontFor(style, hovered ? family : style.fontFamily, scale);
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
      if(shape){context.fillRect(pad,pad,rect.width,rect.height);}else if (hovered) {
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
      entry.glyph=document.createElement('canvas');entry.glyph.width=canvas.width;entry.glyph.height=canvas.height;entry.glyph.getContext('2d').drawImage(canvas,0,0);
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
    const boxes=[];
    for(const r of window.PortfolioImageBounds.get()){const x=Math.max(left,r.left)-left,y=Math.max(top,r.top)-top,right=Math.min(left+w,r.right)-left,bottom=Math.min(top+h,r.bottom)-top;if(right>x&&bottom>y)boxes.push({x,y,r:right,b:bottom})}
    // The photo union is intersected with glyph alpha, rather than rectangular clipping.
    const imageKey=JSON.stringify([entry.signature,boxes]);
    if(entry.imageKey!==imageKey){
      entry.imageKey=imageKey;const dpr=Math.min(devicePixelRatio||1,3);
      canvas.width=entry.glyph.width;canvas.height=entry.glyph.height;context.setTransform(dpr,0,0,dpr,0,0);context.fillStyle='#fff';
      for(const r of boxes)context.fillRect(r.x,r.y,r.r-r.x,r.b-r.y);
      context.globalCompositeOperation='destination-in';context.drawImage(entry.glyph,0,0,canvas.width/dpr,canvas.height/dpr);
      const photoMask=`url("${canvas.toDataURL()}")`;effect.style.maskImage=photoMask;effect.style.webkitMaskImage=photoMask;
      context.globalCompositeOperation='source-over';context.clearRect(0,0,w,h);context.drawImage(entry.glyph,0,0,canvas.width/dpr,canvas.height/dpr);
      context.globalCompositeOperation='destination-out';for(const r of boxes)context.fillRect(r.x,r.y,r.r-r.x,r.b-r.y);
      const pageMask=`url("${canvas.toDataURL()}")`;overlay.style.maskImage=pageMask;overlay.style.webkitMaskImage=pageMask;context.globalCompositeOperation='source-over';
      entry.photoMask=photoMask;entry.pageMask=pageMask;
    }
    // effect.cssText copies the base geometry each frame; restore its distinct alpha mask.
    overlay.style.maskImage=overlay.style.webkitMaskImage=entry.pageMask;
    effect.style.maskImage=effect.style.webkitMaskImage=entry.photoMask;
    overlay.style.clipPath=effect.style.clipPath='none';
  }
  function updatePageContrast() {
    // Normal page text stays dark; grayscale image-only inversion is unchanged.
    const color=getComputedStyle(document.documentElement).getPropertyValue('--page-ink').trim()||'#161616';
    if(document.documentElement.style.getPropertyValue('--footer-ink')!==color)document.documentElement.style.setProperty('--footer-ink',color);
  }
  let themeKey=document.documentElement.style.getPropertyValue('--page-bg');
  new MutationObserver(()=>{
    const next=document.documentElement.style.getPropertyValue('--page-bg');
    if(next===themeKey)return;
    themeKey=next;settlingUntil=performance.now()+2500;schedule();
  }).observe(document.documentElement,{attributes:true,attributeFilter:['style']});
  function render() {
    updatePageContrast();
    frame = 0;
    const force = dirty;
    dirty = false;
    if(force)discover();
    entries.forEach(entry => paint(entry, force));
    if (performance.now() < settlingUntil || document.querySelector('.photo.is-zooming,.project-row figure.is-zooming,.project-color-overlay') || (matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches && document.querySelector('header>nav>a:hover,header>nav>a:focus-visible'))) schedule();
  }
  function schedule(force = false) {
    dirty ||= force;
    if (!frame) frame = requestAnimationFrame(render);
  }
  Promise.all([document.fonts.load('13px "SUSE Mono"'), document.fonts.load('13px "Instrument Serif"')]).then(() => {
    document.body.classList.add('menu-contrast-active');
    settlingUntil = performance.now() + 1000;
    schedule(true);
    new MutationObserver(records => {
      if (records.some(record => !(record.target.parentElement || record.target).closest?.('.text-contrast-layer'))) schedule(true);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('scroll', () => {settlingUntil=Math.max(settlingUntil,performance.now()+650);schedule()}, { passive: true });
    window.addEventListener('portfolio-composition-change',()=>schedule());
    window.addEventListener('resize', () => schedule(true), { passive: true });
    window.addEventListener('pageshow', () => schedule(true));
    window.addEventListener('hashchange', () => {settlingUntil=performance.now()+2500;schedule(true)});window.addEventListener('project-background-ready',()=>{settlingUntil=performance.now()+2500;schedule()});
    document.addEventListener('pointerover', () => schedule());
    document.addEventListener('pointerout', () => schedule());
    document.addEventListener('focusin', () => schedule());
    document.addEventListener('focusout', () => schedule());
    document.addEventListener('click', () => schedule(true));
    document.addEventListener('close', () => schedule(true), true);
    document.addEventListener('load', event => {if(event.target.tagName==='IMG')schedule(true)}, true);
    document.fonts.addEventListener('loadingdone', () => schedule(true));
  }).catch(() => { /* Laat de oorspronkelijke tekst staan als fontladen mislukt. */ });
})();





