/**
 * auth.js — Login modal + session restore
 */

import { API_BASE } from './config.js';
import { showToast } from './toast.js';

export function openLoginModal() {
  const modal = document.getElementById('login-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('login-email')?.focus();
}

export function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

export function initLoginModal() {
  const modal = document.getElementById('login-modal');
  const closeBtn = document.getElementById('modal-close');
  const form = document.getElementById('login-form');
  const errMsg = document.getElementById('login-error');

  closeBtn.addEventListener('click', closeLoginModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLoginModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLoginModal();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
      errMsg.textContent = 'Please enter both email and password.';
      errMsg.classList.remove('hidden');
      return;
    }

    errMsg.classList.add('hidden');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (res.ok && json.token) {
        localStorage.setItem('tmd_token', json.token);
        localStorage.setItem('tmd_user', JSON.stringify(json.user || {}));
        showToast('Signed in successfully.', 'success');
        closeLoginModal();
        document.getElementById('nav-login-btn').textContent = json.user?.name || 'Account';
      } else {
        errMsg.textContent = json.message || 'Invalid credentials. Please try again.';
        errMsg.classList.remove('hidden');
      }
    } catch {
      errMsg.textContent = 'Could not connect to the server. Please try again.';
      errMsg.classList.remove('hidden');
    } finally {
      submitBtn.textContent = 'Sign In';
      submitBtn.disabled = false;
    }
  });
}

export function restoreSession() {
  try {
    const user = JSON.parse(localStorage.getItem('tmd_user'));
    const token = localStorage.getItem('tmd_token');
    if (user && token) {
      const loginBtn = document.getElementById('nav-login-btn');
      if (loginBtn) loginBtn.textContent = user.name || 'Account';
    }
  } catch { /* no-op */ }
}
