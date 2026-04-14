/**
 * mustRead.js — Must Read section
 */

import { apiFetch } from './utils.js';
import { createFullCard } from './cards.js';
import { observeSection, revealChildren } from './reveal.js';

export async function loadMustRead() {
  const skeleton = document.getElementById('must-read-skeleton');
  const grid = document.getElementById('must-read-grid');
  const empty = document.getElementById('must-read-empty');
  const section = document.getElementById('must-read-section');

  const { data } = await apiFetch('/article?limit=6');

  skeleton.remove();

  const articles = data ? (Array.isArray(data) ? data : (data.data || data.articles || [])) : [];

  if (!articles.length) {
    empty.classList.remove('hidden');
    return;
  }

  articles.forEach(art => grid.appendChild(createFullCard(art)));
  grid.style.display = '';

  observeSection(section);
  revealChildren(grid);
}
