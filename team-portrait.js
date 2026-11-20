const portrait = document.querySelector('.portrait-motion');
const video = portrait.querySelector('video');
let requested = false;

function startPortrait() {
  if (requested) return;
  requested = true;
  portrait.setAttribute('aria-pressed', 'true');
  video.play().catch(() => {
    // A pointer may have already left while playback was loading.
    if (video.paused) stopPortrait();
  });
}

function stopPortrait() {
  requested = false;
  portrait.removeAttribute('data-playing');
  portrait.setAttribute('aria-pressed', 'false');
  video.pause();
  video.currentTime = 0;
}

portrait.addEventListener('pointerenter', event => {
  if (event.pointerType === 'mouse') startPortrait();
});
portrait.addEventListener('pointerleave', event => {
  if (event.pointerType === 'mouse') stopPortrait();
});
portrait.addEventListener('click', event => {
  if (event.detail !== 0 && (event.pointerType === 'mouse' ||
      (!event.pointerType && matchMedia('(hover: hover)').matches))) return;
  if (requested) stopPortrait();
  else startPortrait();
});
video.addEventListener('playing', () => {
  if (requested) portrait.setAttribute('data-playing', '');
});
video.addEventListener('ended', stopPortrait);
video.addEventListener('error', stopPortrait);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && requested) stopPortrait();
});
