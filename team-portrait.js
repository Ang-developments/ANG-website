const portrait = document.querySelector('.portrait-motion');
const video = portrait.querySelector('video');
let requested = false;
let activationPointer = '';

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
portrait.addEventListener('pointerdown', event => {
  activationPointer = event.pointerType;
});
portrait.addEventListener('click', event => {
  // Some browsers report a touch activation as a MouseEvent.
  const pointer = event.detail === 0 ? '' : activationPointer || event.pointerType;
  activationPointer = '';
  if (requested && pointer !== 'mouse') stopPortrait();
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
