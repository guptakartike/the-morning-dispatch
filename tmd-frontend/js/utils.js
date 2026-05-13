/**
 * utils.js — Shared utility functions
 */

/** Format date string e.g. "Apr 13, 2026" */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/** Relative time e.g. "2h ago" */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

/** Build article page URL */
export function articleUrl(slug) {
  return `article.html?slug=${encodeURIComponent(slug)}`;
}

/** Build category page URL */
export function categoryUrl(slug) {
  return `category.html?slug=${encodeURIComponent(slug)}`;
}

/** Escape HTML special characters */
export function esc(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/** Format view count e.g. "1.2k views" */
export function formatViews(n) {
  if (!n) return '';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k views`;
  return `${n} views`;
}
