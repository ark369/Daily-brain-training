/**
 * Shared math, randomization, and choice utilities for mini-games.
 */

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickMany(arr, count) {
  return shuffle(arr).slice(0, count);
}

/**
 * Generates `count` unique integer choices containing `answer`, tightly spaced
 * around the answer without going below `minVal`.
 */
export function makeNumericChoices(answer, count = 4, minVal = 1, maxSpread = 4) {
  const set = new Set([answer]);
  const offsets = shuffle([-3, -2, -1, 1, 2, 3, -4, 4, -5, 5, 6, -6]);
  for (const off of offsets) {
    if (set.size >= count) break;
    if (Math.abs(off) <= maxSpread) {
      const candidate = answer + off;
      if (candidate >= minVal) set.add(candidate);
    }
  }
  let bump = 1;
  while (set.size < count) {
    if (answer + bump >= minVal) set.add(answer + bump);
    bump += 1;
  }
  return Array.from(set).sort((a, b) => a - b);
}

export function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
