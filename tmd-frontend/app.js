// /**
//  * app.js — The Morning Dispatch (TMD) Frontend
//  * Vanilla JS, modular, no frameworks
//  * API Base: http://localhost:2005/api
//  */

// 'use strict';

// /* ═══════════════════════════════════════════════════════
//    CONFIG
// ═══════════════════════════════════════════════════════ */
// const API_BASE = 'http://localhost:2005/api';

// /* ═══════════════════════════════════════════════════════
//    UTILITIES
// ═══════════════════════════════════════════════════════ */

// /**
//  * Fetch wrapper with error handling.
//  * Returns { data, error }
//  */
// async function apiFetch(path) {
//   try {
//     const res = await fetch(`${API_BASE}${path}`);
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);
//     const json = await res.json();
//     return { data: json, error: null };
//   } catch (err) {
//     console.warn(`[TMD] apiFetch failed: ${API_BASE}${path}`, err.message);
//     return { data: null, error: err.message };
//   }
// }

// /** Image URL resolver */
// function imgSrc(path) {
//   if (!path) return null;
//   if (path.startsWith('http')) return path;
//   return `http://localhost:2005${path}`;
// }

// /** Fallback placeholder SVG */
// function placeholderImg(title = 'TMD') {
//   const initials = title.trim().slice(0, 2).toUpperCase();
//   return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect fill='%23d9d5cf' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' font-family='Georgia%2C serif' font-size='52' fill='%236b6560' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(initials)}%3C/text%3E%3C/svg%3E`;
// }

// /** Format date string */
// function formatDate(dateStr) {
//   if (!dateStr) return '';
//   return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
// }

// /** Time ago from date string */
// function timeAgo(dateStr) {
//   if (!dateStr) return '';
//   const diff = (Date.now() - new Date(dateStr)) / 1000;
//   if (diff < 60) return 'Just now';
//   if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
//   if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
//   if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
//   return formatDate(dateStr);
// }

// /** Article page URL */
// function articleUrl(slug) {
//   return `article.html?slug=${encodeURIComponent(slug)}`;
// }

// /** Category page URL */
// function categoryUrl(slug) {
//   return `category.html?slug=${encodeURIComponent(slug)}`;
// }

// /** Escape HTML for safe rendering */
// function esc(str) {
//   return String(str || '').replace(/[&<>"']/g, c => ({
//     '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
//   }[c]));
// }

// /** Format view count */
// function formatViews(n) {
//   if (!n) return '';
//   if (n >= 1000) return `${(n / 1000).toFixed(1)}k views`;
//   return `${n} views`;
// }

// /* ═══════════════════════════════════════════════════════
//    TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════ */
// function showToast(msg, type = 'info') {
//   const container = document.getElementById('toast-container');
//   if (!container) return;
//   const toast = document.createElement('div');
//   toast.className = `toast ${type}`;
//   toast.textContent = msg;
//   container.appendChild(toast);
//   setTimeout(() => toast.remove(), 3700);
// }

// /* ═══════════════════════════════════════════════════════
//    LAZY IMAGE LOADING
// ═══════════════════════════════════════════════════════ */
// const lazyImageObserver = new IntersectionObserver((entries) => {
//   entries.forEach(({ isIntersecting, target }) => {
//     if (!isIntersecting) return;
//     const src = target.dataset.src;
//     if (!src) return;
//     const tempImg = new Image();
//     tempImg.onload = () => {
//       target.src = src;
//       target.classList.add('loaded');
//     };
//     tempImg.onerror = () => {
//       target.src = target.dataset.fallback || placeholderImg('TMD');
//       target.classList.add('loaded');
//     };
//     tempImg.src = src;
//     lazyImageObserver.unobserve(target);
//   });
// }, { rootMargin: '200px' });

// /** Create a lazy-loaded img element */
// function lazyImg(src, alt = '', fallback = '') {
//   const img = document.createElement('img');
//   img.className = 'lazy card-image';
//   img.alt = alt;
//   img.dataset.src = src || fallback || placeholderImg(alt);
//   img.dataset.fallback = fallback || placeholderImg(alt);
//   img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1px placeholder
//   lazyImageObserver.observe(img);
//   return img;
// }

// /* ═══════════════════════════════════════════════════════
//    SCROLL REVEAL (Intersection Observer)
// ═══════════════════════════════════════════════════════ */
// const revealObserver = new IntersectionObserver((entries) => {
//   entries.forEach(({ isIntersecting, target }) => {
//     if (!isIntersecting) return;
//     target.classList.add('is-visible');
//     revealObserver.unobserve(target);
//   });
// }, { threshold: 0.08 });

// function observeSection(el) {
//   if (el) revealObserver.observe(el);
// }

// /** Staggered child reveal */
// function revealChildren(parent, selector = '.article-card, .trending-small-card') {
//   const children = parent.querySelectorAll(selector);
//   children.forEach((child, i) => {
//     child.classList.add('reveal-child');
//     child.style.transitionDelay = `${i * 0.07}s`;
//     revealObserver.observe(child);
//   });
// }

// /* ═══════════════════════════════════════════════════════
//    ARTICLE CARD COMPONENTS
// ═══════════════════════════════════════════════════════ */

// /**
//  * Full card: image top, title + summary below
//  */
// function createFullCard(article) {
//   const { title = 'Untitled', slug, summary, image, category, createdAt, views } = article;
//   const url = articleUrl(slug);
//   const imgUrl = imgSrc(image) || placeholderImg(title);
//   const catName = category?.name || '';

//   const card = document.createElement('article');
//   card.className = 'article-card bg-white border border-border';
//   card.setAttribute('aria-label', title);

//   const imgWrap = document.createElement('div');
//   imgWrap.className = 'card-image-wrap aspect-video';

//   const img = lazyImg(imgUrl, title, placeholderImg(title));
//   imgWrap.appendChild(img);

//   const body = document.createElement('div');
//   body.className = 'p-4 flex flex-col gap-1.5 flex-1';

//   body.innerHTML = `
//     ${catName ? `<span class="card-category">${esc(catName)}</span>` : ''}
//     <h3 class="card-title">
//       <a href="${url}" class="hover:text-accent transition-colors duration-200 focus-visible:outline-accent">${esc(title)}</a>
//     </h3>
//     ${summary ? `<p class="card-summary line-clamp-2">${esc(summary)}</p>` : ''}
//     <div class="card-meta">
//       <time datetime="${createdAt}">${timeAgo(createdAt)}</time>
//       ${views ? `<span class="card-meta-sep"></span><span>${formatViews(views)}</span>` : ''}
//     </div>
//   `;

//   card.appendChild(imgWrap);
//   card.appendChild(body);

//   // Make whole card clickable (not just link)
//   card.addEventListener('click', (e) => {
//     if (e.target.closest('a')) return;
//     window.location.href = url;
//   });

//   return card;
// }

// /**
//  * Small horizontal card: small image left, text right
//  */
// function createSmallCard(article) {
//   const { title = 'Untitled', slug, image, category, createdAt, views } = article;
//   const url = articleUrl(slug);
//   const imgUrl = imgSrc(image) || placeholderImg(title);
//   const catName = category?.name || '';

//   const card = document.createElement('article');
//   card.className = 'flex gap-3 items-start cursor-pointer group py-1';
//   card.setAttribute('aria-label', title);

//   const imgWrap = document.createElement('div');
//   imgWrap.className = 'card-image-wrap w-20 h-16 shrink-0';
//   const img = lazyImg(imgUrl, title, placeholderImg(title));
//   imgWrap.appendChild(img);

//   const body = document.createElement('div');
//   body.className = 'flex-1 min-w-0';
//   body.innerHTML = `
//     ${catName ? `<span class="card-category">${esc(catName)}</span>` : ''}
//     <h3 class="card-title-sm group-hover:text-accent transition-colors duration-200 line-clamp-3">
//       <a href="${url}" class="focus-visible:outline-accent">${esc(title)}</a>
//     </h3>
//     <div class="card-meta mt-1">
//       <time datetime="${createdAt}">${timeAgo(createdAt)}</time>
//     </div>
//   `;

//   card.appendChild(imgWrap);
//   card.appendChild(body);

//   card.addEventListener('click', (e) => {
//     if (e.target.closest('a')) return;
//     window.location.href = url;
//   });

//   return card;
// }

// /* ═══════════════════════════════════════════════════════
//    NAVBAR
// ═══════════════════════════════════════════════════════ */
// function initNavbar() {
//   const navbar = document.getElementById('navbar');
//   const menuToggle = document.getElementById('menu-toggle');
//   const mobileMenu = document.getElementById('mobile-menu');

//   // Sticky shadow on scroll
//   const scrollHandler = () => {
//     navbar.classList.toggle('scrolled', window.scrollY > 4);
//   };
//   window.addEventListener('scroll', scrollHandler, { passive: true });

//   // Mobile menu toggle
//   menuToggle.addEventListener('click', () => {
//     const isOpen = mobileMenu.classList.toggle('open');
//     menuToggle.setAttribute('aria-expanded', String(isOpen));
//   });

//   // Close mobile menu on outside click
//   document.addEventListener('click', (e) => {
//     if (!navbar.contains(e.target)) {
//       mobileMenu.classList.remove('open');
//       menuToggle.setAttribute('aria-expanded', 'false');
//     }
//   });

//   // Login button
//   const loginBtn = document.getElementById('nav-login-btn');
//   loginBtn.addEventListener('click', (e) => {
//     e.preventDefault();
//     openLoginModal();
//   });
// }

// /* ═══════════════════════════════════════════════════════
//    CATEGORIES
// ═══════════════════════════════════════════════════════ */
// let categoriesCache = [];

// async function loadCategories() {
//   const bar = document.getElementById('category-bar');
//   const mobileList = document.getElementById('mobile-menu-categories');
//   const footerList = document.getElementById('footer-categories');

//   const { data, error } = await apiFetch('/categories');
//   if (error || !data) return;

//   // Normalize response
//   const cats = Array.isArray(data) ? data : (data.data || data.categories || []);
//   categoriesCache = cats;

//   // Clear skeletons
//   bar.innerHTML = '';

//   // Build tab bar
//   cats.forEach((cat, i) => {
//     const btn = document.createElement('button');
//     btn.className = `cat-tab${i === 0 ? ' active' : ''}`;
//     btn.role = 'tab';
//     btn.id = `cat-tab-${cat._id || i}`;
//     btn.setAttribute('aria-selected', String(i === 0));
//     btn.textContent = cat.name;
//     btn.dataset.catId = cat._id;
//     btn.dataset.catSlug = cat.slug || cat.name.toLowerCase();

//     btn.addEventListener('click', () => {
//       document.querySelectorAll('.cat-tab').forEach(t => {
//         t.classList.remove('active');
//         t.setAttribute('aria-selected', 'false');
//       });
//       btn.classList.add('active');
//       btn.setAttribute('aria-selected', 'true');
//       // Smooth scroll to category section
//       const section = document.getElementById(`cat-section-${cat._id}`);
//       if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     });

//     bar.appendChild(btn);
//   });

//   // Mobile menu
//   mobileList.innerHTML = '';
//   cats.forEach(cat => {
//     const li = document.createElement('li');
//     const a = document.createElement('a');
//     a.href = categoryUrl(cat.slug || cat.name.toLowerCase());
//     a.className = 'block py-2 text-muted hover:text-ink transition-colors uppercase tracking-wide text-xs font-semibold';
//     a.textContent = cat.name;
//     li.appendChild(a);
//     mobileList.appendChild(li);
//   });

//   // Footer categories
//   footerList.innerHTML = '';
//   cats.forEach(cat => {
//     const li = document.createElement('li');
//     const a = document.createElement('a');
//     a.href = categoryUrl(cat.slug || cat.name.toLowerCase());
//     a.className = 'hover:text-white transition-colors';
//     a.textContent = cat.name;
//     li.appendChild(a);
//     footerList.appendChild(li);
//   });
// }

// /* ═══════════════════════════════════════════════════════
//    BREAKING TICKER
// ═══════════════════════════════════════════════════════ */
// async function loadBreakingTicker() {
//   const bar = document.getElementById('breaking-bar');
//   const content = document.getElementById('breaking-content');

//   const { data } = await apiFetch('/article?breaking=true&limit=6');
//   if (!data) return;

//   const articles = Array.isArray(data) ? data : (data.data || data.articles || []);
//   if (!articles.length) return;

//   content.innerHTML = articles.map(a =>
//     `<a href="${articleUrl(a.slug)}" class="inline-block hover:underline underline-offset-2">${esc(a.title)}</a>`
//   ).join('<span class="mx-6 text-white/30">&#183;</span>');

//   bar.classList.remove('hidden');
// }

// /* ═══════════════════════════════════════════════════════
//    HERO SLIDER
// ═══════════════════════════════════════════════════════ */
// let sliderIndex = 0;
// let sliderTotal = 0;
// let sliderTimer = null;
// let sliderArticles = [];

// function createSlide(article) {
//   const { title = 'Untitled', slug, image, category, summary, createdAt } = article;
//   const imgUrl = imgSrc(image) || placeholderImg(title);
//   const catName = category?.name || '';

//   const slide = document.createElement('div');
//   slide.className = 'slide';
//   slide.setAttribute('role', 'tabpanel');
//   slide.setAttribute('aria-label', title);

//   slide.innerHTML = `
//     <img
//       src="${imgUrl}"
//       alt="${esc(title)}"
//       class="slide-image"
//       loading="eager"
//       decoding="async"
//     />
//     <div class="slide-overlay"></div>
//     <div class="slide-content">
//       ${catName ? `<span class="slide-category">${esc(catName)}</span>` : ''}
//       <h2 class="slide-title">
//         <a href="${articleUrl(slug)}" class="hover:opacity-90 focus-visible:outline focus-visible:outline-white">${esc(title)}</a>
//       </h2>
//       ${summary ? `<p class="text-white/60 text-sm leading-relaxed font-body line-clamp-2 mb-2">${esc(summary)}</p>` : ''}
//       <div class="slide-meta">
//         <time datetime="${createdAt}">${formatDate(createdAt)}</time>
//       </div>
//     </div>
//   `;

//   return slide;
// }

// function goToSlide(index) {
//   const slides = document.querySelectorAll('.slide');
//   const dots = document.querySelectorAll('.slider-dot');
//   if (!slides.length) return;

//   slides[sliderIndex].classList.remove('active');
//   dots[sliderIndex]?.classList.remove('active');

//   sliderIndex = (index + sliderTotal) % sliderTotal;

//   slides[sliderIndex].classList.add('active');
//   dots[sliderIndex]?.classList.add('active');
// }

// function startSliderTimer() {
//   clearInterval(sliderTimer);
//   sliderTimer = setInterval(() => goToSlide(sliderIndex + 1), 5000);
// }

// function pauseSlider() { clearInterval(sliderTimer); }

// async function loadHeroSlider() {
//   const skeleton = document.getElementById('hero-skeleton');
//   const container = document.getElementById('slides-container');
//   const dotsEl = document.getElementById('slider-dots');
//   const prevBtn = document.getElementById('slider-prev');
//   const nextBtn = document.getElementById('slider-next');

//   const { data } = await apiFetch('/article?featured=true&limit=6');

//   let articles = [];
//   if (data) {
//     articles = Array.isArray(data) ? data : (data.data || data.articles || []);
//   }

//   // Fallback: latest articles
//   if (!articles.length) {
//     const { data: fallback } = await apiFetch('/article?limit=6');
//     if (fallback) articles = Array.isArray(fallback) ? fallback : (fallback.data || fallback.articles || []);
//   }

//   skeleton.remove();

//   if (!articles.length) {
//     container.innerHTML = `<div class="flex h-full items-center justify-center text-white/40 text-sm">No featured stories available.</div>`;
//     container.classList.remove('hidden');
//     return;
//   }

//   sliderArticles = articles;
//   sliderTotal = articles.length;

//   // Create slides
//   articles.forEach((art, i) => {
//     const slide = createSlide(art);
//     if (i === 0) slide.classList.add('active');
//     container.appendChild(slide);
//   });

//   // Create dots
//   dotsEl.innerHTML = '';
//   articles.forEach((_, i) => {
//     const dot = document.createElement('button');
//     dot.className = `slider-dot${i === 0 ? ' active' : ''}`;
//     dot.role = 'tab';
//     dot.setAttribute('aria-label', `Slide ${i + 1}`);
//     dot.addEventListener('click', () => { goToSlide(i); startSliderTimer(); });
//     dotsEl.appendChild(dot);
//   });

//   // Show controls
//   container.classList.remove('hidden');
//   if (sliderTotal > 1) {
//     prevBtn.classList.remove('hidden');
//     nextBtn.classList.remove('hidden');
//     dotsEl.classList.remove('hidden');
//   }

//   // Prev/Next
//   prevBtn.addEventListener('click', () => { goToSlide(sliderIndex - 1); startSliderTimer(); });
//   nextBtn.addEventListener('click', () => { goToSlide(sliderIndex + 1); startSliderTimer(); });

//   // Pause on hover
//   const heroSection = document.getElementById('hero-section');
//   heroSection.addEventListener('mouseenter', pauseSlider);
//   heroSection.addEventListener('mouseleave', startSliderTimer);

//   // Keyboard
//   heroSection.addEventListener('keydown', (e) => {
//     if (e.key === 'ArrowLeft') { goToSlide(sliderIndex - 1); startSliderTimer(); }
//     if (e.key === 'ArrowRight') { goToSlide(sliderIndex + 1); startSliderTimer(); }
//   });

//   // Touch swipe
//   let touchStartX = 0;
//   heroSection.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
//   heroSection.addEventListener('touchend', e => {
//     const dx = e.changedTouches[0].clientX - touchStartX;
//     if (Math.abs(dx) > 40) { goToSlide(sliderIndex + (dx < 0 ? 1 : -1)); startSliderTimer(); }
//   }, { passive: true });

//   startSliderTimer();
// }

// /* ═══════════════════════════════════════════════════════
//    MUST READ SECTION
// ═══════════════════════════════════════════════════════ */
// async function loadMustRead() {
//   const skeleton = document.getElementById('must-read-skeleton');
//   const grid = document.getElementById('must-read-grid');
//   const empty = document.getElementById('must-read-empty');
//   const section = document.getElementById('must-read-section');

//   const { data } = await apiFetch('/article?limit=6');

//   skeleton.remove();

//   const articles = data ? (Array.isArray(data) ? data : (data.data || data.articles || [])) : [];

//   if (!articles.length) {
//     empty.classList.remove('hidden');
//     return;
//   }

//   articles.forEach(art => grid.appendChild(createFullCard(art)));
//   grid.style.display = '';

//   observeSection(section);
//   revealChildren(grid);
// }

// /* ═══════════════════════════════════════════════════════
//    TRENDING SECTION
// ═══════════════════════════════════════════════════════ */
// async function loadTrending() {
//   const skeleton = document.getElementById('trending-skeleton');
//   const contentEl = document.getElementById('trending-content');
//   const empty = document.getElementById('trending-empty');
//   const section = document.getElementById('trending-section');

//   const { data } = await apiFetch('/article/trending');

//   skeleton.remove();

//   const articles = data ? (Array.isArray(data) ? data : (data.data || data.articles || [])) : [];

//   if (!articles.length) {
//     empty.classList.remove('hidden');
//     return;
//   }

//   const [hero, ...rest] = articles;

//   // Left: big hero
//   const heroUrl = articleUrl(hero.slug);
//   const heroImgUrl = imgSrc(hero.image) || placeholderImg(hero.title);

//   const heroCard = document.createElement('article');
//   heroCard.className = 'trending-hero relative bg-zinc-900';
//   heroCard.setAttribute('aria-label', hero.title);

//   const heroImg = document.createElement('img');
//   heroImg.className = 'lazy card-image w-full h-full object-cover min-h-[300px] md:min-h-[360px]';
//   heroImg.alt = hero.title || '';
//   heroImg.dataset.src = heroImgUrl;
//   heroImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
//   lazyImageObserver.observe(heroImg);

//   const catName = hero.category?.name || '';

//   heroCard.innerHTML = `
//     <div class="trending-hero-overlay"></div>
//     <div class="absolute inset-0 flex items-end p-5">
//       <div>
//         ${catName ? `<span class="slide-category">${esc(catName)}</span>` : ''}
//         <h3 class="font-serif text-xl font-bold text-white leading-tight mt-1">
//           <a href="${heroUrl}" class="hover:opacity-90 focus-visible:outline focus-visible:outline-white">${esc(hero.title)}</a>
//         </h3>
//         <div class="card-meta text-white/45 mt-2">
//           <time datetime="${hero.createdAt}">${timeAgo(hero.createdAt)}</time>
//           ${hero.views ? `<span class="card-meta-sep"></span><span>${formatViews(hero.views)}</span>` : ''}
//         </div>
//       </div>
//     </div>
//   `;
//   heroCard.prepend(heroImg);
//   heroCard.addEventListener('click', (e) => {
//     if (e.target.closest('a')) return;
//     window.location.href = heroUrl;
//   });

//   // Right: stacked small cards (only render if we have secondary articles)
//   const sideArticles = rest.slice(0, 4);

//   if (sideArticles.length) {
//     const rightCol = document.createElement('div');
//     rightCol.className = 'flex flex-col divide-y divide-border bg-white border border-border';

//     sideArticles.forEach((art, i) => {
//       const item = document.createElement('article');
//       item.className = 'trending-small-card px-4';
//       item.setAttribute('aria-label', art.title);

//       const rank = document.createElement('span');
//       rank.className = 'trending-rank';
//       rank.textContent = String(i + 2).padStart(2, '0');
//       rank.setAttribute('aria-hidden', 'true');

//       const body = document.createElement('div');
//       body.className = 'flex-1 min-w-0 py-1';
//       const artCat = art.category?.name || '';
//       body.innerHTML = `
//         ${artCat ? `<span class="card-category">${esc(artCat)}</span>` : ''}
//         <h3 class="card-title-sm line-clamp-3">
//           <a href="${articleUrl(art.slug)}" class="hover:text-accent transition-colors">${esc(art.title)}</a>
//         </h3>
//         <div class="card-meta mt-1">
//           <time datetime="${art.createdAt}">${timeAgo(art.createdAt)}</time>
//           ${art.views ? `<span class="card-meta-sep"></span><span>${formatViews(art.views)}</span>` : ''}
//         </div>
//       `;

//       item.appendChild(rank);
//       item.appendChild(body);
//       item.addEventListener('click', (e) => {
//         if (e.target.closest('a')) return;
//         window.location.href = articleUrl(art.slug);
//       });
//       rightCol.appendChild(item);
//     });

//     contentEl.appendChild(heroCard);
//     contentEl.appendChild(rightCol);
//     contentEl.classList.add('trending-grid');
//   } else {
//     // Only one article — hero spans full width, no grid
//     contentEl.appendChild(heroCard);
//   }

//   contentEl.classList.remove('hidden');

//   observeSection(section);
// }

// /* ═══════════════════════════════════════════════════════
//    CATEGORY SECTIONS (Dynamic)
// ═══════════════════════════════════════════════════════ */
// function createCategorySection(category, articles) {
//   if (!articles.length) return null;

//   const [main, ...secondary] = articles;
//   const section = document.createElement('section');
//   section.className = 'category-section reveal-section';
//   section.id = `cat-section-${category._id}`;
//   section.setAttribute('aria-labelledby', `cat-heading-${category._id}`);

//   const catSlug = category.slug || category.name.toLowerCase();

//   // Header
//   const header = document.createElement('header');
//   header.className = 'max-w-screen-xl mx-auto px-4 mb-5';
//   header.innerHTML = `
//     <div class="category-label">${esc(category.name)}</div>
//     <h2 id="cat-heading-${category._id}" class="category-heading">${esc(category.name)}</h2>
//   `;

//   // Use 2-col only when secondary articles are available
//   const hasSidebar = secondary.length > 0;
//   const grid = document.createElement('div');
//   grid.className = `max-w-screen-xl mx-auto px-4${hasSidebar ? ' cat-article-grid' : ''}`;

//   // Left: large card
//   const leftCard = createFullCard(main);
//   // Use landscape aspect when sidebar is present, else taller
//   leftCard.querySelector('.card-image-wrap')?.classList.add(hasSidebar ? 'aspect-[4/3]' : 'aspect-video');
//   if (!hasSidebar) leftCard.style.maxWidth = '640px';
//   grid.appendChild(leftCard);

//   // Right: 2 smaller cards stacked
//   if (hasSidebar) {
//     const rightCol = document.createElement('div');
//     rightCol.className = 'flex flex-col gap-4 divide-y divide-border';
//     secondary.slice(0, 2).forEach(art => {
//       const c = createSmallCard(art);
//       c.classList.add('pt-4', 'first:pt-0');
//       rightCol.appendChild(c);
//     });
//     grid.appendChild(rightCol);
//   }

//   // Footer: View More
//   const footer = document.createElement('footer');
//   footer.className = 'max-w-screen-xl mx-auto px-4 mt-5';
//   footer.innerHTML = `
//     <a href="${categoryUrl(catSlug)}" class="view-more-btn" aria-label="View more ${esc(category.name)} articles">
//       View more
//       <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
//     </a>
//   `;

//   section.appendChild(header);
//   section.appendChild(grid);
//   section.appendChild(footer);

//   observeSection(section);
//   revealChildren(grid, 'article');

//   return section;
// }

// async function loadCategorySections() {
//   const container = document.getElementById('categories-sections');

//   // Wait for categories to be available
//   await new Promise(resolve => {
//     if (categoriesCache.length) return resolve();
//     const wait = setInterval(() => {
//       if (categoriesCache.length) { clearInterval(wait); resolve(); }
//     }, 200);
//     setTimeout(() => { clearInterval(wait); resolve(); }, 5000);
//   });

//   if (!categoriesCache.length) {
//     container.innerHTML = '<p class="text-muted text-sm py-10 text-center max-w-screen-xl mx-auto px-4">No categories found.</p>';
//     return;
//   }

//   // Add section heading
//   const heading = document.createElement('div');
//   heading.className = 'max-w-screen-xl mx-auto px-4 pt-12 pb-4';
//   heading.innerHTML = `
//     <h2 class="font-serif text-2xl font-bold tracking-tight text-center mb-2">Categories</h2>
//     <p class="text-muted text-xs text-center uppercase tracking-widest">Browse by section</p>
//   `;
//   container.appendChild(heading);

//   // Load each category in parallel
//   const fetches = categoriesCache.map(cat =>
//     apiFetch(`/article?category=${cat._id}&limit=3`).then(({ data }) => ({
//       category: cat,
//       articles: data ? (Array.isArray(data) ? data : (data.data || data.articles || [])) : [],
//     }))
//   );

//   const results = await Promise.all(fetches);

//   results.forEach(({ category, articles }) => {
//     const section = createCategorySection(category, articles);
//     if (section) container.appendChild(section);
//   });
// }

// /* ═══════════════════════════════════════════════════════
//    LOGIN MODAL
// ═══════════════════════════════════════════════════════ */
// function openLoginModal() {
//   const modal = document.getElementById('login-modal');
//   modal.classList.add('open');
//   document.body.style.overflow = 'hidden';
//   document.getElementById('login-email')?.focus();
// }

// function closeLoginModal() {
//   const modal = document.getElementById('login-modal');
//   modal.classList.remove('open');
//   document.body.style.overflow = '';
// }

// function initLoginModal() {
//   const modal = document.getElementById('login-modal');
//   const closeBtn = document.getElementById('modal-close');
//   const form = document.getElementById('login-form');
//   const errMsg = document.getElementById('login-error');

//   closeBtn.addEventListener('click', closeLoginModal);

//   modal.addEventListener('click', (e) => {
//     if (e.target === modal) closeLoginModal();
//   });

//   document.addEventListener('keydown', (e) => {
//     if (e.key === 'Escape') closeLoginModal();
//   });

//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const email = document.getElementById('login-email').value.trim();
//     const password = document.getElementById('login-password').value.trim();

//     if (!email || !password) {
//       errMsg.textContent = 'Please enter both email and password.';
//       errMsg.classList.remove('hidden');
//       return;
//     }

//     errMsg.classList.add('hidden');
//     const submitBtn = form.querySelector('button[type="submit"]');
//     submitBtn.textContent = 'Signing in...';
//     submitBtn.disabled = true;

//     try {
//       const res = await fetch(`${API_BASE}/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });
//       const json = await res.json();

//       if (res.ok && json.token) {
//         localStorage.setItem('tmd_token', json.token);
//         localStorage.setItem('tmd_user', JSON.stringify(json.user || {}));
//         showToast('Signed in successfully.', 'success');
//         closeLoginModal();
//         document.getElementById('nav-login-btn').textContent = json.user?.name || 'Account';
//       } else {
//         errMsg.textContent = json.message || 'Invalid credentials. Please try again.';
//         errMsg.classList.remove('hidden');
//       }
//     } catch {
//       errMsg.textContent = 'Could not connect to the server. Please try again.';
//       errMsg.classList.remove('hidden');
//     } finally {
//       submitBtn.textContent = 'Sign In';
//       submitBtn.disabled = false;
//     }
//   });
// }

// /* ═══════════════════════════════════════════════════════
//    NEWSLETTER FORM
// ═══════════════════════════════════════════════════════ */
// function initNewsletter() {
//   const form = document.getElementById('newsletter-form');
//   const msg = document.getElementById('newsletter-msg');

//   form.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const email = document.getElementById('newsletter-email').value.trim();
//     if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       msg.textContent = 'Please enter a valid email address.';
//       msg.classList.remove('hidden');
//       return;
//     }
//     // Simulate subscription (no backend endpoint defined)
//     msg.textContent = 'You are subscribed. Thank you.';
//     msg.classList.remove('hidden');
//     form.querySelector('input').value = '';
//     showToast('Subscribed to the newsletter.', 'success');
//   });
// }

// /* ═══════════════════════════════════════════════════════
//    FOOTER: Year + Observe Sections
// ═══════════════════════════════════════════════════════ */
// function initFooter() {
//   const year = document.getElementById('footer-year');
//   if (year) year.textContent = new Date().getFullYear();
// }

// /* ═══════════════════════════════════════════════════════
//    OBSERVE ALL STATIC SECTIONS
// ═══════════════════════════════════════════════════════ */
// function observeStaticSections() {
//   document.querySelectorAll('.reveal-section').forEach(observeSection);
// }

// /* ═══════════════════════════════════════════════════════
//    INIT (Session Restore)
// ═══════════════════════════════════════════════════════ */
// function restoreSession() {
//   try {
//     const user = JSON.parse(localStorage.getItem('tmd_user'));
//     const token = localStorage.getItem('tmd_token');
//     if (user && token) {
//       const loginBtn = document.getElementById('nav-login-btn');
//       if (loginBtn) loginBtn.textContent = user.name || 'Account';
//     }
//   } catch { /* no-op */ }
// }

// /* ═══════════════════════════════════════════════════════
//    BOOT
// ═══════════════════════════════════════════════════════ */
// document.addEventListener('DOMContentLoaded', async () => {
//   // Sync — no async needed
//   initNavbar();
//   initLoginModal();
//   initNewsletter();
//   initFooter();
//   restoreSession();
//   observeStaticSections();

//   // Parallel async loads — independent of each other
//   await Promise.all([
//     loadCategories(),
//     loadBreakingTicker(),
//     loadHeroSlider(),
//   ]);

//   // Sequential loads after categories resolve
//   await Promise.all([
//     loadMustRead(),
//     loadTrending(),
//     loadCategorySections(),
//   ]);
// });
