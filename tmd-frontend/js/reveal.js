/**
 * reveal.js — Scroll-reveal animations via IntersectionObserver
 */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ isIntersecting, target }) => {
    if (!isIntersecting) return;
    target.classList.add('is-visible');
    revealObserver.unobserve(target);
  });
}, { threshold: 0.08 });

/** Observe a section for scroll-reveal */
export function observeSection(el) {
  if (el) revealObserver.observe(el);
}

/** Stagger-reveal direct child cards inside a parent */
export function revealChildren(parent, selector = '.article-card, .trending-small-card') {
  const children = parent.querySelectorAll(selector);
  children.forEach((child, i) => {
    child.classList.add('reveal-child');
    child.style.transitionDelay = `${i * 0.07}s`;
    revealObserver.observe(child);
  });
}
