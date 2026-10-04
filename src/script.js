'use strict';
const i18n = window.AMB_I18N;

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const projects = [...document.querySelectorAll('[data-category]')];
const filterStatus = document.getElementById('filter-status');
function filterProjects(category) {
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  let visible = 0;
  projects.forEach(project => {
    project.hidden = category !== 'all' && project.dataset.category !== category;
    if (!project.hidden) visible++;
  });
  const selected = filterButtons.find(button => button.dataset.filter === category);
  const label = category === 'all' ? i18n.text('allWork') : selected.textContent.replace(/\d+/g, '').trim();
  filterStatus.textContent = i18n.text('filterStatus', { count: visible, label });
  scheduleFrame();
}
filterButtons.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));

// Showcase links remain useful after filtering the portfolio.
document.querySelectorAll('.world[href], .system-world[href]').forEach(link => {
  link.addEventListener('click', () => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    if (target.hidden) filterProjects('all');
    const detail = target.querySelector('details');
    if (detail) detail.open = true;
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const smallScreen = window.matchMedia('(max-width: 700px)');
const motionToggle = document.getElementById('motion-toggle');
const parallaxImages = [...document.querySelectorAll('[data-parallax]')];
const progress = document.querySelector('.scroll-progress');
const heroSlides = [...document.querySelectorAll('.hero-slide')];
const sceneButtons = [...document.querySelectorAll('[data-scene-index]')];
const sceneName = document.getElementById('scene-name');
const sceneStatus = document.getElementById('scene-status');
const slideshowToggle = document.getElementById('slideshow-toggle');
const sceneControls = document.querySelector('.scene-controls');
let activeScene = 0;
let slideshowPaused = false;
let slideshowTimer = null;
let heroInView = true;
let controlsFocused = false;
let slideshowObserver;
let motionRequested = true;
let framePending = false;
let revealObserver;

function motionAllowed() {
  return motionRequested && !reducedMotion.matches;
}
function updateMotion() {
  const allowed = motionAllowed();
  document.body.classList.toggle('motion-off', !allowed);
  motionToggle.setAttribute('aria-pressed', String(allowed));
  motionToggle.textContent = i18n.text(allowed ? 'motionOn' : 'motionOff');
  motionToggle.disabled = reducedMotion.matches;
  motionToggle.title = i18n.text(reducedMotion.matches ? 'reducedTitle' : 'motionTitle');
  if (!allowed) parallaxImages.forEach(image => image.style.removeProperty('transform'));
  scheduleSlideshow();
  scheduleFrame();
}
function updateFrame() {
  framePending = false;
  const viewport = window.innerHeight;
  const header = document.querySelector('.site-header');
  if (header) {
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
    progress.style.top = `${header.offsetHeight - 1}px`;
  }
  const pageRange = document.documentElement.scrollHeight - viewport;
  const amount = pageRange > 0 ? Math.min(1, Math.max(0, window.scrollY / pageRange)) : 0;
  progress.style.transform = `scaleX(${amount})`;
  if (!motionAllowed()) return;
  parallaxImages.forEach(image => {
    const scene = image.closest('.hero-art, .world-image');
    const rect = scene.getBoundingClientRect();
    if (rect.bottom < -80 || rect.top > viewport + 80) return;
    const speed = Number(image.dataset.parallax);
    const limit = Math.min(smallScreen.matches ? 18 : 64, rect.height * 0.07);
    const offset = Math.max(-limit, Math.min(limit, (viewport / 2 - rect.top - rect.height / 2) * speed));
    image.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
  });
}
function scheduleFrame() {
  if (framePending) return;
  framePending = true;
  window.requestAnimationFrame(updateFrame);
}
motionToggle.addEventListener('click', () => {
  motionRequested = !motionRequested;
  updateMotion();
});
reducedMotion.addEventListener('change', updateMotion);
smallScreen.addEventListener('change', scheduleFrame);
window.addEventListener('scroll', scheduleFrame, { passive: true });
window.addEventListener('resize', scheduleFrame, { passive: true });
window.addEventListener('load', scheduleFrame, { once: true });

// Default content is visible; reveal enhancement is enabled only with observer support.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.section-heading, .world, .system-world, .about-grid, .disciplines article').forEach(element => {
    element.classList.add('is-observed');
    revealObserver.observe(element);
  });
}
// Background scenes are decorative. Automatic changes are not announced.
function showScene(index, manual = false) {
  activeScene = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === activeScene));
  sceneButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === activeScene)));
  sceneName.textContent = heroSlides[activeScene].dataset.scene;
  if (manual) sceneStatus.textContent = i18n.text('background', { name: sceneName.textContent });
  scheduleSlideshow();
  scheduleFrame();
}
function scheduleSlideshow() {
  if (slideshowTimer !== null) window.clearTimeout(slideshowTimer);
  slideshowTimer = null;
  const enabled = motionAllowed();
  slideshowToggle.disabled = !enabled;
  slideshowToggle.setAttribute('aria-pressed', String(slideshowPaused || !enabled));
  slideshowToggle.textContent = i18n.text(!enabled ? 'slideshowPaused' : slideshowPaused ? 'resume' : 'pause');
  if (!enabled || slideshowPaused || document.hidden || !heroInView || controlsFocused || heroSlides.length < 2) return;
  slideshowTimer = window.setTimeout(() => {
    slideshowTimer = null;
    showScene(activeScene + 1);
  }, 9000);
}
sceneButtons.forEach(button => button.addEventListener('click', () => showScene(Number(button.dataset.sceneIndex), true)));
slideshowToggle.addEventListener('click', () => {
  slideshowPaused = !slideshowPaused;
  scheduleSlideshow();
});
document.addEventListener('visibilitychange', scheduleSlideshow);
sceneControls.addEventListener('focusin', () => {
  controlsFocused = true;
  scheduleSlideshow();
});
sceneControls.addEventListener('focusout', event => {
  controlsFocused = sceneControls.contains(event.relatedTarget);
  scheduleSlideshow();
});
if ('IntersectionObserver' in window) {
  slideshowObserver = new IntersectionObserver(entries => {
    heroInView = entries[0].isIntersecting;
    scheduleSlideshow();
  }, { threshold: 0.05 });
  slideshowObserver.observe(document.getElementById('home'));
}
updateMotion();


// Refresh dynamic labels without resetting the visitor's controls or projects.
document.addEventListener('amb:languagechange', () => {
  const selected = filterButtons.find(button => button.getAttribute('aria-pressed') === 'true');
  filterProjects(selected ? selected.dataset.filter : 'all');
  updateMotion();
  if (sceneStatus.textContent) sceneStatus.textContent = i18n.text('background', { name: sceneName.textContent });
});
