/**
 * auth.js — Login modal (no backend connection)
 */

export function openLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('login-email')?.focus();
  }
}

export function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

export function initLoginModal() {
  const modal = document.getElementById('login-modal');
  const closeBtn = document.getElementById('modal-close');

  if (closeBtn) closeBtn.addEventListener('click', closeLoginModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLoginModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLoginModal();
  });
}

export function restoreSession() {
  // No backend connection — no session to restore
}
