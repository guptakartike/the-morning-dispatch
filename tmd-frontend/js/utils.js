/**
 * utils.js — Shared utility functions
 */

import { API_BASE } from './config.js';

/** Fetch wrapper — returns { data, error } */
export async function apiFetch(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: json, error: null };
  } catch (err) {
    console.warn(`[TMD] apiFetch failed: ${API_BASE}${path}`, err.message);
    return { data: null, error: err.message };
  }
}

/** Resolve image URL — handles relative /uploads paths */
export function imgSrc(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:2005${path}`;
}

/** SVG placeholder when no image is available */
export function placeholderImg(title = 'TMD') {
  const initials = title.trim().slice(0, 2).toUpperCase();
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect fill='%23d9d5cf' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' font-family='Georgia%2C serif' font-size='52' fill='%236b6560' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(initials)}%3C/text%3E%3C/svg%3E`;
}

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
