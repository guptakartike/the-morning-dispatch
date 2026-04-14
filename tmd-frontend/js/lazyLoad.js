/**
 * lazyLoad.js — Lazy image loading via IntersectionObserver
 */

import { placeholderImg } from './utils.js';

export const lazyImageObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ isIntersecting, target }) => {
    if (!isIntersecting) return;
    const src = target.dataset.src;
    if (!src) return;
    const tempImg = new Image();
    tempImg.onload = () => {
      target.src = src;
      target.classList.add('loaded');
    };
    tempImg.onerror = () => {
      target.src = target.dataset.fallback || placeholderImg('TMD');
      target.classList.add('loaded');
    };
    tempImg.src = src;
    lazyImageObserver.unobserve(target);
  });
}, { rootMargin: '200px' });

/** Create a lazy-loaded <img> element */
export function lazyImg(src, alt = '', fallback = '') {
  const img = document.createElement('img');
  img.className = 'lazy card-image';
  img.alt = alt;
  img.dataset.src = src || fallback || placeholderImg(alt);
  img.dataset.fallback = fallback || placeholderImg(alt);
  // Transparent 1px GIF as initial placeholder
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  lazyImageObserver.observe(img);
  return img;
}
