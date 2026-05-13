/**
 * heroSlider.js — Hero image carousel (static placeholder)
 */

export function loadHeroSlider() {
  const skeleton = document.getElementById('hero-skeleton');
  const container = document.getElementById('slides-container');

  if (skeleton) skeleton.remove();
  if (container) {
    container.innerHTML = `<div class="flex h-full items-center justify-center text-white/40 text-sm">No featured stories available.</div>`;
    container.classList.remove('hidden');
  }
}
