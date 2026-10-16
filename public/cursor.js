/* Klikcursor alleen zolang er daadwerkelijk een muisknop ingedrukt is. */
(function () {
  let pressed = false;
  function setPressed(next) {
    if (next === pressed) return;
    pressed = next;
    document.documentElement.classList.toggle('is-cursor-pressed', pressed);
  }
  function sync(event) {
    if (event.pointerType === 'mouse') setPressed(event.buttons > 0);
  }
  window.addEventListener('pointerdown', sync, { passive: true });
  window.addEventListener('pointerup', sync, { passive: true });
  window.addEventListener('pointermove', sync, { passive: true });
  window.addEventListener('pointercancel', () => setPressed(false), { passive: true });
  window.addEventListener('blur', () => setPressed(false));
  document.addEventListener('pointerleave', () => setPressed(false));
  document.addEventListener('visibilitychange', () => { if (document.hidden) setPressed(false); });
})();
