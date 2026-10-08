// Native fragment links work without JavaScript. This only keeps the sticky
// header offset and the current-section indicator in sync with ordinary scrolling.
const header = document.querySelector('.site-header');
const sections = [...document.querySelectorAll('main > section[id]')];
const links = [...header.querySelectorAll('nav a')];
let framePending = false;

function updateCurrentSection() {
  framePending = false;
  const threshold = header.getBoundingClientRect().bottom + 32;
  let current = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= threshold) current = section;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    current = sections.at(-1);
  }
  for (const link of links) {
    if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

window.addEventListener('scroll', () => {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(updateCurrentSection);
  }
}, { passive: true });

new ResizeObserver(() => {
  document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
  updateCurrentSection();
}).observe(header);

window.addEventListener('hashchange', updateCurrentSection);
updateCurrentSection();
