/**
 * categories.js — Category tab bar + footer categories
 */

import { apiFetch, categoryUrl, esc } from './utils.js';

/** Shared cache — other modules wait for this to be populated */
export let categoriesCache = [];

export async function loadCategories() {
  const bar = document.getElementById('category-bar');
  const mobileList = document.getElementById('mobile-menu-categories');
  const footerList = document.getElementById('footer-categories');

  const { data, error } = await apiFetch('/categories');
  if (error || !data) return;

  const cats = Array.isArray(data) ? data : (data.data || data.categories || []);
  categoriesCache = cats;

  // Clear skeleton
  bar.innerHTML = '';

  // Build tab buttons
  cats.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = `cat-tab${i === 0 ? ' active' : ''}`;
    btn.role = 'tab';
    btn.id = `cat-tab-${cat._id || i}`;
    btn.setAttribute('aria-selected', String(i === 0));
    btn.textContent = cat.name;
    btn.dataset.catId = cat._id;
    btn.dataset.catSlug = cat.slug || cat.name.toLowerCase();

    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const section = document.getElementById(`cat-section-${cat._id}`);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    bar.appendChild(btn);
  });

  // Mobile menu
  mobileList.innerHTML = '';
  cats.forEach(cat => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = categoryUrl(cat.slug || cat.name.toLowerCase());
    a.className = 'block py-2 text-muted hover:text-ink transition-colors uppercase tracking-wide text-xs font-semibold';
    a.textContent = cat.name;
    li.appendChild(a);
    mobileList.appendChild(li);
  });

  // Footer categories
  footerList.innerHTML = '';
  cats.forEach(cat => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = categoryUrl(cat.slug || cat.name.toLowerCase());
    a.className = 'hover:text-white transition-colors';
    a.textContent = cat.name;
    li.appendChild(a);
    footerList.appendChild(li);
  });
}
