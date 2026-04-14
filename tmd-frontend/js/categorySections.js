/**
 * categorySections.js — Dynamic "Browse by Section" category blocks
 */

import { apiFetch, categoryUrl, esc } from './utils.js';
import { categoriesCache } from './categories.js';
import { createFullCard, createSmallCard } from './cards.js';
import { observeSection, revealChildren } from './reveal.js';

function createCategorySection(category, articles) {
  if (!articles.length) return null;

  const [main, ...secondary] = articles;
  const catSlug = category.slug || category.name.toLowerCase();
  const hasSidebar = secondary.length > 0;

  const section = document.createElement('section');
  section.className = 'category-section reveal-section';
  section.id = `cat-section-${category._id}`;
  section.setAttribute('aria-labelledby', `cat-heading-${category._id}`);

  // Header
  const header = document.createElement('header');
  header.className = 'max-w-screen-xl mx-auto px-4 mb-5';
  header.innerHTML = `
    <div class="category-label">${esc(category.name)}</div>
    <h2 id="cat-heading-${category._id}" class="category-heading">${esc(category.name)}</h2>
  `;

  // Article grid — 2-col when sidebar exists, single-col otherwise
  const grid = document.createElement('div');
  grid.className = `max-w-screen-xl mx-auto px-4${hasSidebar ? ' cat-article-grid' : ''}`;

  const leftCard = createFullCard(main);
  leftCard.querySelector('.card-image-wrap')?.classList.add(hasSidebar ? 'aspect-[4/3]' : 'aspect-video');
  if (!hasSidebar) leftCard.style.maxWidth = '640px';
  grid.appendChild(leftCard);

  if (hasSidebar) {
    const rightCol = document.createElement('div');
    rightCol.className = 'flex flex-col gap-4 divide-y divide-border';
    secondary.slice(0, 2).forEach(art => {
      const c = createSmallCard(art);
      c.classList.add('pt-4', 'first:pt-0');
      rightCol.appendChild(c);
    });
    grid.appendChild(rightCol);
  }

  // Footer — "View more" link
  const footer = document.createElement('footer');
  footer.className = 'max-w-screen-xl mx-auto px-4 mt-5';
  footer.innerHTML = `
    <a href="${categoryUrl(catSlug)}" class="view-more-btn" aria-label="View more ${esc(category.name)} articles">
      View more
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
    </a>
  `;

  section.appendChild(header);
  section.appendChild(grid);
  section.appendChild(footer);

  observeSection(section);
  revealChildren(grid, 'article');

  return section;
}

export async function loadCategorySections() {
  const container = document.getElementById('categories-sections');

  // Wait up to 5s for categories to be loaded
  await new Promise(resolve => {
    if (categoriesCache.length) return resolve();
    const wait = setInterval(() => {
      if (categoriesCache.length) { clearInterval(wait); resolve(); }
    }, 200);
    setTimeout(() => { clearInterval(wait); resolve(); }, 5000);
  });

  if (!categoriesCache.length) {
    container.innerHTML = '<p class="text-muted text-sm py-10 text-center max-w-screen-xl mx-auto px-4">No categories found.</p>';
    return;
  }

  // Section heading
  const heading = document.createElement('div');
  heading.className = 'max-w-screen-xl mx-auto px-4 pt-12 pb-4';
  heading.innerHTML = `
    <h2 class="font-serif text-2xl font-bold tracking-tight text-center mb-2">Categories</h2>
    <p class="text-muted text-xs text-center uppercase tracking-widest">Browse by section</p>
  `;
  container.appendChild(heading);

  // Fetch articles for all categories in parallel
  const fetches = categoriesCache.map(cat =>
    apiFetch(`/article?category=${cat._id}&limit=3`).then(({ data }) => ({
      category: cat,
      articles: data ? (Array.isArray(data) ? data : (data.data || data.articles || [])) : [],
    }))
  );

  const results = await Promise.all(fetches);

  results.forEach(({ category, articles }) => {
    const section = createCategorySection(category, articles);
    if (section) container.appendChild(section);
  });
}
