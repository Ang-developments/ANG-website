(() => {
  const frame = document.querySelector('#studio .stack');
  if (!frame) return;
  const cards = [...frame.querySelectorAll('.ph')];
  let order = cards.slice();
  let changing = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...frame.querySelectorAll('video')];
  let inView = !('IntersectionObserver' in window);
  function syncVideo() {
    for (const video of videos) {
      if (inView && !document.hidden && !changing && order[0].contains(video)) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncVideo();
    }).observe(frame);
  }
  document.addEventListener('visibilitychange', syncVideo);
  function render() {
    order.forEach((card, position) => {
      card.dataset.p = position;
      card.tabIndex = position === 0 ? 0 : -1;
      card.setAttribute('aria-hidden', position === 0 ? 'false' : 'true');
      card.style.pointerEvents = position === 0 ? 'auto' : 'none';
    });
  }
  function next() {
    if (changing) return;
    changing = true;
    syncVideo();
    const outgoing = order[0];
    const restoreFocus = document.activeElement === outgoing;
    outgoing.classList.add('leaving');
    setTimeout(() => {
      order.push(order.shift());
      render();
      outgoing.classList.remove('leaving');
      if (restoreFocus) order[0].focus({preventScroll:true});
      changing = false;
      syncVideo();
    }, reducedMotion.matches ? 0 : 600);
  }
  cards.forEach(card => card.addEventListener('click', next));
  render();
  syncVideo();
})();
