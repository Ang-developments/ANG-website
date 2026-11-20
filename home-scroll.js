(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let position = 0;
  let target = 0;
  let lastTime = 0;

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function glide(time) {
    const limit = document.documentElement.scrollHeight - innerHeight;
    target = Math.min(target, Math.max(0, limit));
    const elapsed = Math.min(48, time - lastTime);
    lastTime = time;
    position += (target - position) * (1 - Math.exp(-elapsed / 90));
    const finished = Math.abs(target - position) < .6;
    window.scrollTo({ top: finished ? target : position, behavior: 'instant' });
    frame = finished ? 0 : requestAnimationFrame(glide);
  }

  window.addEventListener('wheel', event => {
    if (reducedMotion.matches || event.defaultPrevented || !event.cancelable ||
        event.ctrlKey || event.metaKey || event.shiftKey ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
        event.target.closest('input, textarea, select, [contenteditable], dialog, .sq-row, .cookies-card')) return;
    // Leave pixel-precise trackpad gestures to the browser.
    if (event.deltaMode === 0 && (Math.abs(event.deltaY) < 50 || !Number.isInteger(event.deltaY))) {
      stop();
      return;
    }
    const limit = document.documentElement.scrollHeight - innerHeight;
    if (limit <= 0) return;
    event.preventDefault();
    if (!frame) {
      target = position = scrollY;
      lastTime = performance.now();
      frame = requestAnimationFrame(glide);
    }
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    const impulse = Math.max(-innerHeight, Math.min(innerHeight, event.deltaY * unit));
    target = Math.max(0, Math.min(limit, target + impulse));
  }, { passive: false });

  for (const event of ['pointerdown', 'keydown', 'resize', 'hashchange', 'pagehide']) {
    window.addEventListener(event, stop, { passive: true });
  }
  reducedMotion.addEventListener('change', stop);
})();
