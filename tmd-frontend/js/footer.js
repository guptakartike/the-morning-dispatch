/**
 * footer.js — Footer year + static section reveal
 */

import { observeSection } from './reveal.js';

export function initFooter() {
  const year = document.getElementById('footer-year');
  if (year) year.textContent = new Date().getFullYear();
}

export function observeStaticSections() {
  document.querySelectorAll('.reveal-section').forEach(observeSection);
}
