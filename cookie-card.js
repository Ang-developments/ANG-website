const cookieCard = document.querySelector('.cookies-card');
const cookiePreferenceKey = 'ang-cookie-preference';

const footer = document.querySelector('.ang-footer-bottom');
const settings = document.createElement('button');
settings.type = 'button';
settings.className = 'cookie-settings';
settings.textContent = 'Cookie settings';

if (footer) {
  footer.insertBefore(settings, footer.querySelector('a:last-child'));
  settings.addEventListener('click', () => {
    cookieCard.hidden = false;
    cookieCard.querySelector('.cookie-button').focus({ preventScroll: true });
  });
}

try {
  const preference = localStorage.getItem(cookiePreferenceKey);
  cookieCard.hidden = preference === 'accepted' || preference === 'rejected';
} catch {
  cookieCard.hidden = false;
}

cookieCard.addEventListener('click', event => {
  const choice = event.target.closest('[data-cookie-choice]');
  if (!choice) return;

  try {
    localStorage.setItem(cookiePreferenceKey, choice.dataset.cookieChoice);
  } catch {
    // The card can still be dismissed for this page when storage is unavailable.
  }
  cookieCard.hidden = true;
  (footer ? settings : document.querySelector('.policy-download')).focus({ preventScroll: true });
});
