/**
 * newsletter.js — Newsletter subscription form
 */

import { showToast } from './toast.js';

export function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const msg = document.getElementById('newsletter-msg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = 'Please enter a valid email address.';
      msg.classList.remove('hidden');
      return;
    }

    msg.textContent = 'You are subscribed. Thank you.';
    msg.classList.remove('hidden');
    form.querySelector('input').value = '';
    showToast('Subscribed to the newsletter.', 'success');
  });
}
