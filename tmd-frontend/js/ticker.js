/**
 * ticker.js — Breaking news ticker bar
 */

import { apiFetch, articleUrl, esc } from './utils.js';

export async function loadBreakingTicker() {
  const bar = document.getElementById('breaking-bar');
  const content = document.getElementById('breaking-content');

  const { data } = await apiFetch('/article?breaking=true&limit=6');
  if (!data) return;

  const articles = Array.isArray(data) ? data : (data.data || data.articles || []);
  if (!articles.length) return;

  content.innerHTML = articles.map(a =>
    `<a href="${articleUrl(a.slug)}" class="inline-block hover:underline underline-offset-2">${esc(a.title)}</a>`
  ).join('<span class="mx-6 text-white/30">&#183;</span>');

  bar.classList.remove('hidden');
}
