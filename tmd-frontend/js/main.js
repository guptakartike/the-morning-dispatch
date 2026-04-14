/**
 * main.js — Application entry point
 * Imports all modules and boots the page.
 */

import { initNavbar }            from './navbar.js';
import { initLoginModal, restoreSession } from './auth.js';
import { initNewsletter }        from './newsletter.js';
import { initFooter, observeStaticSections } from './footer.js';
import { loadCategories }        from './categories.js';
import { loadBreakingTicker }    from './ticker.js';
import { loadHeroSlider }        from './heroSlider.js';
import { loadMustRead }          from './mustRead.js';
import { loadTrending }          from './trending.js';
import { loadCategorySections }  from './categorySections.js';

document.addEventListener('DOMContentLoaded', async () => {

  // ── Synchronous inits ──────────────────────────────
  initNavbar();
  initLoginModal();
  initNewsletter();
  initFooter();
  restoreSession();
  observeStaticSections();

  // ── Parallel loads (independent of each other) ────
  await Promise.all([
    loadCategories(),
    loadBreakingTicker(),
    loadHeroSlider(),
  ]);

  // ── Content loads (after categories are ready) ────
  await Promise.all([
    loadMustRead(),
    loadTrending(),
    loadCategorySections(),
  ]);

});
