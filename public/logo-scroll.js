/* Het logo blijft op zijn vaste CSS-positie; uitsluitend schaal verandert. */
(function () {
  const logo = document.querySelector('.identity');
  if (!logo) return;
  logo.style.removeProperty('transform');
  logo.style.removeProperty('translate');
  function update() {
    logo.style.scale = window.scrollY > 0 ? '0.8' : '1';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('pageshow', update);
  window.addEventListener('hashchange', update);
  update();
})();
