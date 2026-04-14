/**
 * trending.js — Trending section (hero card + ranked sidebar)
 */

import { apiFetch, imgSrc, placeholderImg, timeAgo, formatViews, articleUrl, esc } from './utils.js';
import { lazyImageObserver } from './lazyLoad.js';
import { observeSection } from './reveal.js';

export async function loadTrending() {
  const skeleton = document.getElementById('trending-skeleton');
  const contentEl = document.getElementById('trending-content');
  const empty = document.getElementById('trending-empty');
  const section = document.getElementById('trending-section');

  const { data } = await apiFetch('/article/trending');

  skeleton.remove();

  const articles = data ? (Array.isArray(data) ? data : (data.data || data.articles || [])) : [];

  if (!articles.length) {
    empty.classList.remove('hidden');
    return;
  }

  const [hero, ...rest] = articles;

  // ── Hero card (left / full-width) ────────────────────
  const heroUrl = articleUrl(hero.slug);
  const heroImgUrl = imgSrc(hero.image) || placeholderImg(hero.title);
  const catName = hero.category?.name || '';

  const heroCard = document.createElement('article');
  heroCard.className = 'trending-hero relative bg-zinc-900';
  heroCard.setAttribute('aria-label', hero.title);

  const heroImg = document.createElement('img');
  heroImg.className = 'lazy card-image w-full h-full object-cover min-h-[300px] md:min-h-[360px]';
  heroImg.alt = hero.title || '';
  heroImg.dataset.src = heroImgUrl;
  heroImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  lazyImageObserver.observe(heroImg);

  heroCard.innerHTML = `
    <div class="trending-hero-overlay"></div>
    <div class="absolute inset-0 flex items-end p-5">
      <div>
        ${catName ? `<span class="slide-category">${esc(catName)}</span>` : ''}
        <h3 class="font-serif text-xl font-bold text-white leading-tight mt-1">
          <a href="${heroUrl}" class="hover:opacity-90 focus-visible:outline focus-visible:outline-white">${esc(hero.title)}</a>
        </h3>
        <div class="card-meta text-white/45 mt-2">
          <time datetime="${hero.createdAt}">${timeAgo(hero.createdAt)}</time>
          ${hero.views ? `<span class="card-meta-sep"></span><span>${formatViews(hero.views)}</span>` : ''}
        </div>
      </div>
    </div>
  `;
  heroCard.prepend(heroImg);
  heroCard.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    window.location.href = heroUrl;
  });

  // ── Sidebar: ranked small cards (only if secondary articles exist) ──
  const sideArticles = rest.slice(0, 4);

  if (sideArticles.length) {
    const rightCol = document.createElement('div');
    rightCol.className = 'flex flex-col divide-y divide-border bg-white border border-border';

    sideArticles.forEach((art, i) => {
      const item = document.createElement('article');
      item.className = 'trending-small-card px-4';
      item.setAttribute('aria-label', art.title);

      const rank = document.createElement('span');
      rank.className = 'trending-rank';
      rank.textContent = String(i + 2).padStart(2, '0');
      rank.setAttribute('aria-hidden', 'true');

      const body = document.createElement('div');
      body.className = 'flex-1 min-w-0 py-1';
      const artCat = art.category?.name || '';
      body.innerHTML = `
        ${artCat ? `<span class="card-category">${esc(artCat)}</span>` : ''}
        <h3 class="card-title-sm line-clamp-3">
          <a href="${articleUrl(art.slug)}" class="hover:text-accent transition-colors">${esc(art.title)}</a>
        </h3>
        <div class="card-meta mt-1">
          <time datetime="${art.createdAt}">${timeAgo(art.createdAt)}</time>
          ${art.views ? `<span class="card-meta-sep"></span><span>${formatViews(art.views)}</span>` : ''}
        </div>
      `;

      item.appendChild(rank);
      item.appendChild(body);
      item.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        window.location.href = articleUrl(art.slug);
      });
      rightCol.appendChild(item);
    });

    contentEl.appendChild(heroCard);
    contentEl.appendChild(rightCol);
    contentEl.classList.add('trending-grid');
  } else {
    // Single article — hero spans full width
    contentEl.appendChild(heroCard);
  }

  contentEl.classList.remove('hidden');
  observeSection(section);
}
