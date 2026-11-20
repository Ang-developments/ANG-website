const people = [...document.querySelectorAll('.person')];
const profile = document.querySelector('.profile');
const names = ["Angelos Angelopoulos", "Georgios", "Dimitris Odysseus Perkizas", "MD Aziz Hmad"];
const roles = ['Architecture', 'Design', 'Project coordination', 'Technical design'];
const biographies = [
  'Explores the relationship between architecture and landscape, with an eye for thoughtful proportions, natural materials, and spaces shaped around everyday life.',
  'Brings together materials, light, and detail to develop spaces with a clear identity and a quiet connection to their surroundings.',
  'Connects people and ideas throughout the design process, helping each stage of a project come together with care and clarity.',
  'Develops the technical details behind each design, considering how materials, structure, and construction work together.'
];
let active = 0;
let wheelTotal = 0;
let lastChange = 0;
let profileTimer;
let ignoreClickUntil = 0;
function selectPerson(index) {
  const next = (index + people.length) % people.length;
  if (next === active) return;
  active = next;
  render();
}
function render() {
  people.forEach((person, index) => {
    const slot = (index - active + 3 + people.length) % people.length;
    person.style.setProperty('--slot', slot);
    person.classList.toggle('active', index === active);
    person.setAttribute('aria-label', names[index] + ', ' + roles[index]);
    person.setAttribute('aria-current', index === active ? 'true' : 'false');
  });
  document.querySelector('.count').textContent = String(active + 1).padStart(2, '0') + ' / 04';
  profile.classList.add('changing');
  clearTimeout(profileTimer);
  const selected = active;
  profileTimer = setTimeout(() => {
    profile.querySelector('h2').textContent = names[selected];
    profile.querySelector('small').textContent = roles[selected];
    profile.querySelector('.profile-bio').textContent = biographies[selected];
    profile.querySelector('.profile-index').textContent = String(selected + 1).padStart(2, '0');
    profile.classList.remove('changing');
  }, 220);
}
people.forEach((person, index) => {
  person.addEventListener('click', () => {
    if (performance.now() >= ignoreClickUntil) selectPerson(index);
  });
});
document.querySelector('main').addEventListener('wheel', event => {
  if (event.ctrlKey) return;
  event.preventDefault();
  const now = performance.now();
  if (now - lastChange < 850) { wheelTotal = 0; return; }
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
  if (Math.sign(delta) !== Math.sign(wheelTotal)) wheelTotal = 0;
  wheelTotal += delta * unit;
  if (Math.abs(wheelTotal) < 45) return;
  selectPerson(active + Math.sign(wheelTotal));
  wheelTotal = 0;
  lastChange = now;
}, {passive:false});
document.addEventListener('keydown', event => {
  if (event.target.closest('input,textarea,select')) return;
  if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) {
    event.preventDefault();
    selectPerson(active + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1));
  } else if ((event.key === 'Enter' || event.key === ' ') && people.includes(event.target)) {
    event.preventDefault();
    selectPerson(people.indexOf(event.target));
  }
});
let startX;
document.querySelector('.portraits').addEventListener('pointerdown', event => { startX = event.clientX; });
window.addEventListener('pointerup', event => {
  if (startX === undefined) return;
  const distance = startX - event.clientX;
  startX = undefined;
  if (Math.abs(distance) > 35) {
    ignoreClickUntil = performance.now() + 300;
    selectPerson(active + Math.sign(distance));
    lastChange = performance.now();
  }
});
window.addEventListener('pointercancel', () => { startX = undefined; });
render();
