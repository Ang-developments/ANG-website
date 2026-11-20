const lightbox = document.querySelector('.project-lightbox');
const photoCaption = lightbox.querySelector('p');
const photos = Array.from(document.querySelectorAll('.board-photo img'));
lightbox.querySelector('img').remove();
lightbox.classList.add('stack-viewer');
const stage = document.createElement('div');
stage.className = 'photo-stack';
lightbox.insertBefore(stage, photoCaption);
const cards = photos.map((photo, index) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'photo-stack-card';
  card.setAttribute('aria-label', 'View ' + photo.alt);
  const image = document.createElement('img');
  image.alt = photo.alt;
  image.draggable = false;
  image.decoding = 'async';
  card.append(image);
  card.addEventListener('click', () => { if (!dragged) showPhoto(index); });
  stage.append(card);
  return card;
});
const controls = document.createElement('div');
controls.className = 'photo-stack-controls';
controls.innerHTML = '<button type="button" aria-label="Previous photo">←</button><span aria-live="polite"></span><button type="button" aria-label="Next photo">→</button>';
lightbox.append(controls);
const [previous, next] = controls.querySelectorAll('button');
let current = 0;
let lastWheel = -Infinity;
let pointerStart = null;
let dragged = false;
function showPhoto(index) {
  current = Math.max(0, Math.min(index, photos.length - 1));
  cards.forEach((card, i) => {
    const offset = i - current;
    const visible = offset === 0;
    card.style.setProperty('--offset', Math.max(-4, Math.min(4, offset)));
    card.style.setProperty('--depth', Math.min(4, Math.abs(offset)));
    card.style.zIndex = 10 - Math.abs(offset);
    card.classList.toggle('is-current', offset === 0);
    card.classList.toggle('is-outside', !visible);
    card.tabIndex = visible && offset !== 0 ? 0 : -1;
    card.setAttribute('aria-hidden', String(!visible));
    if (Math.abs(offset) <= 1 && !card.firstChild.getAttribute('src')) card.firstChild.src = photos[i].src;
  });
  photoCaption.textContent = photos[current].alt;
  controls.querySelector('span').textContent = `${current + 1} / ${photos.length}`;
  previous.disabled = current === 0;
  next.disabled = current === photos.length - 1;
}
function openPhoto(index) {
  showPhoto(index);
  lastWheel = -Infinity;
  pointerStart = null;
  dragged = false;
  lightbox.showModal();
}

const feature = document.querySelector('.editorial-feature');
if (feature) {
  const featureImage = feature.querySelector('img');
  const count = document.querySelector('.editorial-count');
  const buttons = photos.map(photo => photo.closest('button'));
  let selected = 0;

  function selectPhoto(index) {
    selected = (index + photos.length) % photos.length;
    const photo = photos[selected];
    featureImage.src = photo.src;
    featureImage.alt = photo.alt;
    count.textContent = String(selected + 1).padStart(2, '0') + ' / ' + String(photos.length).padStart(2, '0');
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
  }

  buttons.forEach((button, index) => button.addEventListener('click', () => selectPhoto(index)));
  document.querySelectorAll('.editorial-controls [data-step]').forEach(button => {
    button.addEventListener('click', () => selectPhoto(selected + Number(button.dataset.step)));
  });
  feature.addEventListener('click', () => openPhoto(selected));
  selectPhoto(0);
} else {
  photos.forEach((photo, index) => {
    const button = photo.closest('button');
    button.addEventListener('click', () => openPhoto(Number(button.dataset.openPhoto ?? index)));
  });
}
previous.addEventListener('click', () => showPhoto(current - 1));
next.addEventListener('click', () => showPhoto(current + 1));
lightbox.addEventListener('wheel', event => {
  if (event.ctrlKey) return;
  event.preventDefault();
  event.stopPropagation();
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerWidth : 1;
  const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * unit;
  if (event.timeStamp - lastWheel > 650 && Math.abs(delta) > 8) {
    lastWheel = event.timeStamp;
    showPhoto(current + Math.sign(delta));
  }
}, { passive: false });
stage.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  pointerStart = { x: event.clientX, y: event.clientY };
  dragged = false;
});
stage.addEventListener('pointermove', event => {
  if (pointerStart && Math.abs(event.clientX - pointerStart.x) > 12) {
    dragged = true;
    stage.setPointerCapture(event.pointerId);
  }
});
stage.addEventListener('pointerup', event => {
  if (!pointerStart) return;
  const x = event.clientX - pointerStart.x;
  const y = event.clientY - pointerStart.y;
  pointerStart = null;
  if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y)) showPhoto(current - Math.sign(x));
});
stage.addEventListener('pointercancel', () => { pointerStart = null; });
lightbox.querySelector('.project-lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('keydown', event => {
  event.stopPropagation();
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPhoto(current + (event.key === 'ArrowRight' ? 1 : -1));
  }
});

lightbox.addEventListener('close', () => { pointerStart = null; dragged = false; });
