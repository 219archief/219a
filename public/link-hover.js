/* Bewaar de normale tekstmaat, zodat de hovertekst geen links verplaatst. */
(function () {
  const selector = 'header nav a,.back-link,.project-navigation a,footer a,.colophon a';
  function prepareLinks() {
    document.querySelectorAll(selector).forEach(link => {
      if (link.classList.contains('honk-link')) return;
      if(link.matches('.footer-action')){const label=link.querySelector('.footer-action-label'),text=label.textContent,copy=document.createElement('span');copy.className='honk-original';copy.textContent=text;label.replaceChildren(copy);label.classList.add('honk-label');label.dataset.text=text;link.classList.add('honk-link');return;}
      const part = link.matches('.back-link,.project-navigation a,footer a') ? PortfolioDetails.split(link.textContent) : {text:link.textContent};
      const text = part.text;
      const label = document.createElement('span');
      label.className = 'honk-label';
      label.dataset.text = text;
      const original = document.createElement('span');
      original.className = 'honk-original';
      original.textContent = text;
      label.append(original);
      link.replaceChildren();
      if(part.name){link.classList.add('pixel-control');if(part.leading)link.append(PortfolioDetails.icon(part.name));}
      link.append(label);
      if(part.name&&!part.leading)link.append(PortfolioDetails.icon(part.name));
      link.classList.add('honk-link');
    });
  }
  prepareLinks();
  // Drive explicit font values in both the CSS fallback and contrast renderer.
  const menuFonts=['"Instrument Serif", serif','Arial, sans-serif','Georgia, serif','"Courier New", monospace','"Helvetica Neue", Helvetica, sans-serif','Baskerville, "Times New Roman", serif'];
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let activeMenu=null,fontTimer=0,fontIndex=0;
  function stopMenuFonts(){clearInterval(fontTimer);fontTimer=0;activeMenu?.style.removeProperty('--menu-hover-font');activeMenu=null}
  function startMenuFonts(link){
    if(activeMenu===link)return;stopMenuFonts();activeMenu=link;fontIndex=0;
    const paint=()=>{link.style.setProperty('--menu-hover-font',menuFonts[fontIndex%menuFonts.length]);fontIndex++;window.dispatchEvent(new Event('portfolio-menu-font-change'))};
    paint();if(!reduced.matches)fontTimer=setInterval(paint,150);
  }
  document.querySelectorAll('header>nav>a').forEach(link=>{
    link.addEventListener('pointerenter',event=>{if(['mouse','pen'].includes(event.pointerType))startMenuFonts(link)});
    link.addEventListener('pointerleave',()=>{if(activeMenu===link)stopMenuFonts()});
    link.addEventListener('focus',()=>{if(link.matches(':focus-visible'))startMenuFonts(link)});
    link.addEventListener('blur',()=>{if(activeMenu===link)stopMenuFonts()});
  });
  window.addEventListener('blur',stopMenuFonts);window.addEventListener('hashchange',stopMenuFonts);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMenuFonts()});
  const navigation = document.querySelector('#project-navigation');
  if (navigation) new MutationObserver(prepareLinks).observe(navigation, { childList: true });
})();

