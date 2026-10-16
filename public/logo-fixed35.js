/* Het logo blijft op zijn vaste CSS-positie; uitsluitend schaal verandert. */
(function () {
  const logo = document.querySelector('.identity'), menu = document.querySelector('header > nav');
  if (!logo) return;
  logo.style.removeProperty('transform');
  logo.style.removeProperty('translate');
  const finePointer = matchMedia('(any-hover: hover)');
  let wasScrolled, hovered = false, lastScale, lastOffset;
  function update() {
    const scrolled = window.scrollY > 0;
    const baseScale = scrolled ? 0.8 : 1;
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
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('pageshow', update);
  window.addEventListener('hashchange', update);
  update();
})();

