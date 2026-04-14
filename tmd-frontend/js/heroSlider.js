/**
 * heroSlider.js — Hero image carousel
 */

import { apiFetch, imgSrc, placeholderImg, formatDate, articleUrl, esc } from './utils.js';

let sliderIndex = 0;
let sliderTotal = 0;
let sliderTimer = null;

function createSlide(article) {
  const { title = 'Untitled', slug, image, category, summary, createdAt } = article;
  const imgUrl = imgSrc(image) || placeholderImg(title);
  const catName = category?.name || '';

  const slide = document.createElement('div');
  slide.className = 'slide';
  slide.setAttribute('role', 'tabpanel');
  slide.setAttribute('aria-label', title);

  slide.innerHTML = `
    <img
      src="${imgUrl}"
      alt="${esc(title)}"
      class="slide-image"
      loading="eager"
      decoding="async"
    />
    <div class="slide-overlay"></div>
    <div class="slide-content">
      ${catName ? `<span class="slide-category">${esc(catName)}</span>` : ''}
      <h2 class="slide-title">
        <a href="${articleUrl(slug)}" class="hover:opacity-90 focus-visible:outline focus-visible:outline-white">${esc(title)}</a>
      </h2>
      ${summary ? `<p class="text-white/60 text-sm leading-relaxed font-body line-clamp-2 mb-2">${esc(summary)}</p>` : ''}
      <div class="slide-meta">
        <time datetime="${createdAt}">${formatDate(createdAt)}</time>
      </div>
    </div>
  `;

  return slide;
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dot');
  if (!slides.length) return;

  slides[sliderIndex].classList.remove('active');
  dots[sliderIndex]?.classList.remove('active');

  sliderIndex = (index + sliderTotal) % sliderTotal;

  slides[sliderIndex].classList.add('active');
  dots[sliderIndex]?.classList.add('active');
}

function startSliderTimer() {
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => goToSlide(sliderIndex + 1), 5000);
}

function pauseSlider() {
  clearInterval(sliderTimer);
}

export async function loadHeroSlider() {
  const skeleton = document.getElementById('hero-skeleton');
  const container = document.getElementById('slides-container');
  const dotsEl = document.getElementById('slider-dots');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');

  const { data } = await apiFetch('/article?featured=true&limit=6');
  let articles = data ? (Array.isArray(data) ? data : (data.data || data.articles || [])) : [];

  // Fallback to latest articles if none are featured
  if (!articles.length) {
    const { data: fallback } = await apiFetch('/article?limit=6');
    if (fallback) articles = Array.isArray(fallback) ? fallback : (fallback.data || fallback.articles || []);
  }

  skeleton.remove();

  if (!articles.length) {
    container.innerHTML = `<div class="flex h-full items-center justify-center text-white/40 text-sm">No featured stories available.</div>`;
    container.classList.remove('hidden');
    return;
  }

  sliderTotal = articles.length;

  articles.forEach((art, i) => {
    const slide = createSlide(art);
    if (i === 0) slide.classList.add('active');
    container.appendChild(slide);
  });

  // Dots
  dotsEl.innerHTML = '';
  articles.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `slider-dot${i === 0 ? ' active' : ''}`;
    dot.role = 'tab';
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => { goToSlide(i); startSliderTimer(); });
    dotsEl.appendChild(dot);
  });

  container.classList.remove('hidden');

  if (sliderTotal > 1) {
    prevBtn.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
    dotsEl.classList.remove('hidden');
  }

  prevBtn.addEventListener('click', () => { goToSlide(sliderIndex - 1); startSliderTimer(); });
  nextBtn.addEventListener('click', () => { goToSlide(sliderIndex + 1); startSliderTimer(); });

  const heroSection = document.getElementById('hero-section');
  heroSection.addEventListener('mouseenter', pauseSlider);
  heroSection.addEventListener('mouseleave', startSliderTimer);

  heroSection.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { goToSlide(sliderIndex - 1); startSliderTimer(); }
    if (e.key === 'ArrowRight') { goToSlide(sliderIndex + 1); startSliderTimer(); }
  });

  // Touch swipe
  let touchStartX = 0;
  heroSection.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  heroSection.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { goToSlide(sliderIndex + (dx < 0 ? 1 : -1)); startSliderTimer(); }
  }, { passive: true });

  startSliderTimer();
}
