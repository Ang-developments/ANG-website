const gallery = document.querySelector('.track');
const isProject = document.querySelector('link[href="project.css"]') !== null;
const easeTime = isProject ? 58 : 185;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let destination = gallery.scrollLeft;
let position = destination;
let easedDestination = destination;
let animation = 0;
let lastFrame = 0;

function stopMotion() {
  cancelAnimationFrame(animation);
  animation = 0;
  easedDestination = position = destination = gallery.scrollLeft;
  lastFrame = 0;
}

function animateScroll(time) {
  const elapsed = lastFrame ? Math.min(time - lastFrame, 48) : 16;
  lastFrame = time;
  // Ease wheel impulses before moving the project track.
  easedDestination = isProject
    ? easedDestination + (destination - easedDestination) * (1 - Math.exp(-elapsed / 30))
    : destination;
  position += (easedDestination - position) * (1 - Math.exp(-elapsed / easeTime));
  gallery.scrollLeft = position;
  if (Math.abs(destination - position) > 0.5) {
    animation = requestAnimationFrame(animateScroll);
  } else {
    gallery.scrollLeft = destination;
    animation = 0;
  }
}

function moveBy(distance) {
  if (!animation) easedDestination = position = destination = gallery.scrollLeft;
  const maximum = gallery.scrollWidth - gallery.clientWidth;
  const lead = gallery.clientWidth * 0.65;
  const next = Math.max(position - lead, Math.min(position + lead, destination + distance));
  destination = Math.max(0, Math.min(maximum, next));
  if (reducedMotion.matches) {
    stopMotion();
    gallery.scrollLeft = Math.max(0, Math.min(maximum, gallery.scrollLeft + distance));
  } else if (!animation) {
    lastFrame = 0;
    animation = requestAnimationFrame(animateScroll);
  }
}

document.querySelector('main').addEventListener('wheel', event => {
  if (event.ctrlKey || document.querySelector('dialog[open]')) return;
  // Tall presentation boards need normal vertical page scrolling.
  if (gallery.closest('.portfolio-spreads') && !event.shiftKey &&
      Math.abs(event.deltaY) > Math.abs(event.deltaX) &&
      document.documentElement.scrollHeight > window.innerHeight + 1) return;

  // Let a long text panel remain readable on small screens.
  const panel = event.target.closest('.notes');
  if (panel && panel.scrollHeight > panel.clientHeight + 1 &&
      Math.abs(event.deltaY) >= Math.abs(event.deltaX) &&
      ((event.deltaY > 0 && panel.scrollTop + panel.clientHeight < panel.scrollHeight - 1) ||
       (event.deltaY < 0 && panel.scrollTop > 1))) {
    stopMotion();
    return;
  }
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? gallery.clientWidth : 1;
  const distance = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * unit;
  if (!distance) return;
  const maximum = gallery.scrollWidth - gallery.clientWidth;
  if (maximum <= 1 || (distance < 0 && gallery.scrollLeft <= 0 && destination <= 0) ||
      (distance > 0 && gallery.scrollLeft >= maximum - 1 && destination >= maximum - 1)) return;
  event.preventDefault();
  moveBy(distance);
}, { passive: false });

gallery.addEventListener('pointerdown', stopMotion, { passive: true });
window.addEventListener('resize', stopMotion);
document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey || document.querySelector('dialog[open]')) return;
  if (event.target.closest('input, textarea, select, [contenteditable="true"]') ||
      !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  moveBy(event.key === 'ArrowLeft' ? -160 : 160);
});

window.addEventListener('pagehide', stopMotion);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopMotion(); });
reducedMotion.addEventListener('change', stopMotion);
