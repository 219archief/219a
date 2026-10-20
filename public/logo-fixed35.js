/* Het logo blijft op zijn vaste CSS-positie; uitsluitend schaal verandert. */
(function () {
  const logo = document.querySelector('.identity'), menu = document.querySelector('header > nav');
  if (!logo) return;
  logo.style.removeProperty('transform');
  logo.style.removeProperty('translate');
  const finePointer = matchMedia('(any-hover: hover)');
  let wasScrolled, hovered = false, lastScale, lastOffset, homeScrolling = false, scrollEndTimer = 0;
  function update() {
    const scrolled = window.scrollY > 0;
    const onHome = document.body.classList.contains('living-home');
    const baseScale = (onHome ? homeScrolling : scrolled) ? 0.8 : 1;
    const scale = baseScale * (hovered ? 0.98 : 1);
    // Compensate half the hover shrink on each axis, preserving the visual centre.
    // The separate scroll scale retains its original top-left anchor.
    const inset = hovered ? baseScale * 0.01 : 0;
    const offset = `${logo.clientWidth * inset}px ${logo.clientHeight * inset}px`;
    if (offset !== lastOffset) {
      logo.style.setProperty('--logo-hover-offset', offset);
      lastOffset = offset;
    }
    if (scale !== lastScale) {
      logo.style.scale = String(scale);
      lastScale = scale;
    }
    if (menu && scrolled !== wasScrolled) menu.style.scale = scrolled ? '1' : '1.2';
    wasScrolled = scrolled;
  }
  logo.addEventListener('pointerenter', event => {
    if (!finePointer.matches || !['mouse', 'pen'].includes(event.pointerType)) return;
    hovered = true;
    update();
  });
  function leave() { hovered = false; update(); }
  logo.addEventListener('pointerleave', leave);
  logo.addEventListener('pointercancel', leave);
  window.addEventListener('blur', leave);
  finePointer.addEventListener('change', leave);
  function endHomeScroll() {
    clearTimeout(scrollEndTimer);
    homeScrolling = false;
    update();
  }
  window.addEventListener('portfolio-home-scroll', () => {
    if (!document.body.classList.contains('living-home')) return;
    homeScrolling = true;
    update();
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(endHomeScroll, 240);
  });
  window.addEventListener('blur', endHomeScroll);
  window.addEventListener('hashchange', () => { endHomeScroll(); requestAnimationFrame(update); });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('pageshow', update);
  window.addEventListener('hashchange', update);
  update();
})();

