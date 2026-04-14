/**
 * cards.js — Article card components
 */

import { imgSrc, placeholderImg, timeAgo, formatViews, articleUrl, esc } from './utils.js';
import { lazyImg } from './lazyLoad.js';

/**
 * Full card — image on top, title + summary below.
 * Used in Must Read grid and Category sections (main article).
 */
export function createFullCard(article) {
  const { title = 'Untitled', slug, summary, image, category, createdAt, views } = article;
  const url = articleUrl(slug);
  const imgUrl = imgSrc(image) || placeholderImg(title);
  const catName = category?.name || '';

  const card = document.createElement('article');
  card.className = 'article-card bg-white border border-border';
  card.setAttribute('aria-label', title);

  const imgWrap = document.createElement('div');
  imgWrap.className = 'card-image-wrap aspect-video';
  imgWrap.appendChild(lazyImg(imgUrl, title, placeholderImg(title)));

  const body = document.createElement('div');
  body.className = 'p-4 flex flex-col gap-1.5 flex-1';
  body.innerHTML = `
    ${catName ? `<span class="card-category">${esc(catName)}</span>` : ''}
    <h3 class="card-title">
      <a href="${url}" class="hover:text-accent transition-colors duration-200 focus-visible:outline-accent">${esc(title)}</a>
    </h3>
    ${summary ? `<p class="card-summary line-clamp-2">${esc(summary)}</p>` : ''}
    <div class="card-meta">
      <time datetime="${createdAt}">${timeAgo(createdAt)}</time>
      ${views ? `<span class="card-meta-sep"></span><span>${formatViews(views)}</span>` : ''}
    </div>
  `;

  card.appendChild(imgWrap);
  card.appendChild(body);
  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    window.location.href = url;
  });

  return card;
}

/**
 * Small horizontal card — thumbnail left, text right.
 * Used in Category section sidebar.
 */
export function createSmallCard(article) {
  const { title = 'Untitled', slug, image, category, createdAt } = article;
  const url = articleUrl(slug);
  const imgUrl = imgSrc(image) || placeholderImg(title);
  const catName = category?.name || '';

  const card = document.createElement('article');
  card.className = 'flex gap-3 items-start cursor-pointer group py-1';
  card.setAttribute('aria-label', title);

  const imgWrap = document.createElement('div');
  imgWrap.className = 'card-image-wrap w-20 h-16 shrink-0';
  imgWrap.appendChild(lazyImg(imgUrl, title, placeholderImg(title)));

  const body = document.createElement('div');
  body.className = 'flex-1 min-w-0';
  body.innerHTML = `
    ${catName ? `<span class="card-category">${esc(catName)}</span>` : ''}
    <h3 class="card-title-sm group-hover:text-accent transition-colors duration-200 line-clamp-3">
      <a href="${url}" class="focus-visible:outline-accent">${esc(title)}</a>
    </h3>
    <div class="card-meta mt-1">
      <time datetime="${createdAt}">${timeAgo(createdAt)}</time>
    </div>
  `;

  card.appendChild(imgWrap);
  card.appendChild(body);
  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    window.location.href = url;
  });

  return card;
}
