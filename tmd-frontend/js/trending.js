/**
 * trending.js — Trending section (static placeholder)
 */

export function loadTrending() {
  const skeleton = document.getElementById('trending-skeleton');
  const empty = document.getElementById('trending-empty');

  if (skeleton) skeleton.remove();
  if (empty) empty.classList.remove('hidden');
}
