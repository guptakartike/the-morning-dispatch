/**
 * mustRead.js — Must Read section (static placeholder)
 */

export function loadMustRead() {
  const skeleton = document.getElementById('must-read-skeleton');
  const empty = document.getElementById('must-read-empty');

  if (skeleton) skeleton.remove();
  if (empty) empty.classList.remove('hidden');
}
