/**
 * navbar.js — Sticky navbar + mobile menu
 */

import { openLoginModal } from './auth.js';

export function initNavbar() {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  // Sticky shadow on scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 4);
  }, { passive: true });

  // Mobile menu toggle
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Login button
  document.getElementById('nav-login-btn').addEventListener('click', (e) => {
    e.preventDefault();
    openLoginModal();
  });
}
