/**
 * Clue Grid Detective (Analyze Pillar — Multi-Clue Deductive Logic Grids)
 * Procedurally generates hundreds of themed "Who Has What?" mysteries and
 * runs an exact permutation solver so EVERY mystery is mathematically guaranteed
 * to have EXACTLY ONE valid solution!
 * - Tier 1 (Sprout): 3 critters × 3 items, clear direct + elimination clues, direct row matcher.
 * - Tier 2 (Explorer): 3×3 interactive Logic Grid (tap cells: blank -> ✕ -> ✓).
 * - Tier 3 (Challenger): 4×4 interactive Logic Grid with elimination & "Either/Or" clues!
 * - Tier 4 (Trailblazer): 4×4 pure deduction Logic Grid (zero direct giveaways; "Neither/Nor", "Either/Or", & elimination!).
 */

import { pickOne, shuffle } from './utils.js';
import { getRecentPuzzleSigs, recordRecentPuzzleSigs } from '../storage.js';

export const meta = {
  id: 'clue-grid',
  title: 'Clue Grid Detective',
  pillar: 'analyze',
  pillarLabel: 'Analyze',
  shortDesc: 'Use crisp logic clues to crack "Who Has What?" deduction grids.',
  scienceNote: 'Deductive logic grids train systematic elimination, working memory, and constraint satisfaction.',
  timed: false,
};

const THEMES = [
  { id: 'snacks', verb: 'packed', article: 'the ', itemLabel: 'Snack', items: ['Apple', 'Pretzel', 'Banana', 'Muffin'] },
  { id: 'camp', verb: 'brought', article: 'the ', itemLabel: 'Gear', items: ['Lantern', 'Compass', 'Map', 'Binoculars'] },
  { id: 'pets', verb: 'adopted', article: 'the ', itemLabel: 'Pet', items: ['Turtle', 'Hamster', 'Parrot', 'Goldfish'] },
  { id: 'music', verb: 'plays', article: 'the ', itemLabel: 'Instrument', items: ['Drum', 'Flute', 'Piano', 'Violin'] },
  { id: 'space', verb: 'studied', article: '', itemLabel: 'Planet', items: ['Mars', 'Saturn', 'Jupiter', 'Neptune'] },
  { id: 'art', verb: 'painted', article: '', itemLabel: 'Color', items: ['Teal', 'Gold', 'Coral', 'Indigo'] },
  { id: 'sports', verb: 'loves', article: '', itemLabel: 'Sport', items: ['Soccer', 'Tennis', 'Swimming', 'Skating'] },
  { id: 'garden', verb: 'planted', article: 'the ', itemLabel: 'Flower', items: ['Tulip', 'Daisy', 'Sunflower', 'Rose'] },
];

const CHARACTERS = ['Fox', 'Owl', 'Otter', 'Panda', 'Dino', 'Koala', 'Penguin', 'Hedgehog'];

// Generate all permutations of [0..n-1] (3! = 6, 4! = 24 — instant!)
function getPermutations(n) {
  const res = [];
  const used = Array(n).fill(false);
  const cur = [];
  function backtrack() {
    if (cur.length === n) {
      res.push([...cur]);
      return;
    }
    for (let i = 0; i < n; i++) {
      if (!used[i]) {
        used[i] = true;
        cur.push(i);
        backtrack();
        cur.pop();
        used[i] = false;
      }
    }
  }
  backtrack();
  return res;
}

const PERMS_3 = getPermutations(3);
const PERMS_4 = getPermutations(4);

function satisfiesClue(perm, clue) {
  if (clue.type === 'is') return perm[clue.c] === clue.item;
  if (clue.type === 'not') return perm[clue.c] !== clue.item;
  if (clue.type === 'either') return perm[clue.c1] === clue.item || perm[clue.c2] === clue.item;
  if (clue.type === 'neither') return perm[clue.c1] !== clue.item && perm[clue.c2] !== clue.item;
  return true;
}

export function countValidAssignments(clues, n) {
  const perms = n === 3 ? PERMS_3 : PERMS_4;
  let count = 0;
  for (const p of perms) {
    if (clues.every((cl) => satisfiesClue(p, cl))) {
      count += 1;
    }
  }
  return count;
}

function buildClueText(clue, chars, items, verb, article = '') {
  const noun = `${article}${items[clue.item]}`;
  if (clue.type === 'is') {
    return `${chars[clue.c]} ${verb} ${noun}.`;
  }
  if (clue.type === 'not') {
    return `${chars[clue.c]} did NOT choose ${noun}.`;
  }
  if (clue.type === 'either') {
    return `Either ${chars[clue.c1]} or ${chars[clue.c2]} ${verb} ${noun}.`;
  }
  return `Neither ${chars[clue.c1]} nor ${chars[clue.c2]} ${verb} ${noun}.`;
}

function makeMysteryRound(tier) {
  const n = tier <= 2 ? 3 : 4;
  const theme = pickOne(THEMES);
  const chars = shuffle(CHARACTERS).slice(0, n);
  const items = shuffle(theme.items).slice(0, n);
  // Ground-truth bijection: truth[charIdx] = itemIdx
  const truth = shuffle(Array.from({ length: n }, (_, i) => i));

  // Build candidate clues that are strictly true under `truth`
  const candidates = [];
  for (let c = 0; c < n; c++) {
    // Direct anchor clues ONLY in Tier 1 (3x3 starter) and Tier 3 (4x4 intro) — pure deduction in Tier 2 (3x3) and Tier 4 (4x4)!
    if (tier === 1 || tier === 3) {
      candidates.push({ type: 'is', c, item: truth[c], weight: 1 });
    }
    for (let it = 0; it < n; it++) {
      if (truth[c] !== it) {
        candidates.push({ type: 'not', c, item: it, weight: tier >= 4 ? 3 : 2 });
      }
    }
  }
  if (tier >= 3) {
    for (let c1 = 0; c1 < n; c1++) {
      for (let c2 = c1 + 1; c2 < n; c2++) {
        for (let it = 0; it < n; it++) {
          if (truth[c1] === it || truth[c2] === it) {
            candidates.push({ type: 'either', c1, c2, item: it, weight: 1 });
          } else {
            candidates.push({ type: 'neither', c1, c2, item: it, weight: 1 });
          }
        }
      }
    }
  }

  // Greedily pick clues that cut down remaining valid permutations until EXACTLY 1 solution remains!
  const chosen = [];
  let directCount = 0;
  const maxDirect = tier === 1 || tier === 3 ? 1 : 0;

  let remaining = (n === 3 ? PERMS_3 : PERMS_4).slice();
  const shuffledCands = shuffle(candidates).sort((a, b) => a.weight - b.weight);

  // Give Tier 1 (3x3) and Tier 3 (4x4 intro) one crisp anchor clue so T3 never collapses into T4 pure-deduction difficulty
  if (tier === 1 || tier === 3) {
    const firstIs = shuffledCands.find((c) => c.type === 'is');
    if (firstIs) {
      chosen.push(firstIs);
      directCount += 1;
      remaining = remaining.filter((p) => satisfiesClue(p, firstIs));
    }
  }

  // For Tier 4, seed with a compound either/neither clue first so every 11+ puzzle guarantees rich relational deduction
  if (tier >= 4) {
    const firstCompound = shuffledCands.find((c) => c.type === 'either' || c.type === 'neither');
    if (firstCompound) {
      chosen.push(firstCompound);
      remaining = remaining.filter((p) => satisfiesClue(p, firstCompound));
    }
  }

  let guard = 0;
  while (remaining.length > 1 && guard < 40) {
    guard += 1;
    let best = null;
    let bestDrop = 0;
    for (const cand of shuffle(shuffledCands)) {
      if (cand.type === 'is' && directCount >= maxDirect) continue;
      if (chosen.includes(cand)) continue;
      const nextRem = remaining.filter((p) => satisfiesClue(p, cand));
      const drop = remaining.length - nextRem.length;
      if (drop > bestDrop && nextRem.length >= 1) {
        bestDrop = drop;
        best = cand;
        if (drop >= Math.ceil(remaining.length / 2)) break;
      }
    }
    if (!best) break;
    chosen.push(best);
    if (best.type === 'is') directCount += 1;
    remaining = remaining.filter((p) => satisfiesClue(p, best));
  }

  // Prune any redundant clue while keeping count === 1 (and preserving the anchor clue on T1/T3)
  for (let i = chosen.length - 1; i >= 0; i--) {
    if ((tier === 1 || tier === 3) && chosen[i].type === 'is') continue;
    const without = chosen.filter((_, idx) => idx !== i);
    if (without.length >= 2 && countValidAssignments(without, n) === 1) {
      chosen.splice(i, 1);
    }
  }

  const clueTexts = chosen.map((cl) => buildClueText(cl, chars, items, theme.verb, theme.article));
  const sig = `cg${tier}:${theme.id}:${chars.join('-')}:${truth.join('')}`;

  return {
    kind: tier === 1 ? 'direct-match' : 'logic-grid',
    signature: sig,
    size: n,
    themeId: theme.id,
    themeVerb: theme.verb,
    chars,
    items,
    truth,
    clues: chosen,
    clueTexts,
    prompt: `Crack the ${theme.itemLabel} Mystery! Match every friend!`,
    speakPrompt: `Use these clues to match each friend! ${clueTexts.join(' ')}`,
    strategyTip:
      tier === 1
        ? 'Start with the clue that tells you a SURE match first, then cross off what is left!'
        : 'Mark ✕ for every "NOT" clue first! When a row or column has only one open box left, that MUST be a ✓!',
  };
}

export function generateSession(tier = 1, profile = null) {
  const scopeKey = `clue-grid:${tier}`;
  const recentSigs = getRecentPuzzleSigs(profile, scopeKey);
  const sessionSigs = new Set();
  const rounds = [];

  for (let i = 0; i < 4; i++) {
    let chosen = null;
    let fallback = null;
    for (let a = 0; a < 18; a++) {
      const cand = makeMysteryRound(tier);
      if (!sessionSigs.has(cand.signature) && !rounds.some((r) => r.themeId === cand.themeId)) {
        fallback = cand;
        if (!recentSigs.includes(cand.signature)) {
          chosen = cand;
          break;
        }
      }
    }
    const r = chosen || fallback || makeMysteryRound(tier);
    sessionSigs.add(r.signature);
    rounds.push(r);
  }

  recordRecentPuzzleSigs(profile, scopeKey, Array.from(sessionSigs), 24);
  return rounds;
}

export function renderRound(container, round, callbacks) {
  if (round.kind === 'direct-match') {
    renderDirectMatcher(container, round, callbacks);
  } else {
    renderLogicGrid(container, round, callbacks);
  }
}

/**
 * Tier 1 Friendly Direct Row Matcher (5–6 year olds pick 1 item button per critter)
 */
function renderDirectMatcher(container, round, callbacks) {
  const picks = Array(round.size).fill(-1);
  let solved = false;
  let hadMistake = false;

  const wrap = document.createElement('div');
  wrap.className = 'clue-stage';
  container.appendChild(wrap);

  function render() {
    const allPicked = picks.every((p) => p !== -1);
    wrap.innerHTML = `
      <div class="clue-list-card">
        <div class="clue-list-title">Detective Clues</div>
        <ul class="clue-list">
          ${round.clueTexts.map((txt) => `<li>${txt}</li>`).join('')}
        </ul>
      </div>
      <div class="matcher-rows">
        ${round.chars
          .map(
            (ch, cIdx) => `
          <div class="matcher-row">
            <span class="matcher-char">${ch}</span>
            <div class="matcher-options">
              ${round.items
                .map(
                  (it, iIdx) => `
                <button type="button"
                        class="matcher-btn ${picks[cIdx] === iIdx ? 'selected' : ''}"
                        data-c="${cIdx}" data-i="${iIdx}" ${solved ? 'disabled' : ''}>
                  ${it}
                </button>`
                )
                .join('')}
            </div>
          </div>`
          )
          .join('')}
      </div>
      <button type="button" class="btn btn-primary" id="btn-clue-check" ${!allPicked || solved ? 'disabled' : ''}>Check Mystery!</button>
    `;

    wrap.querySelectorAll('.matcher-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (solved) return;
        callbacks.playClick();
        const c = Number(btn.dataset.c);
        const it = Number(btn.dataset.i);
        // If another character currently holds this item, swap/clear cleanly
        const other = picks.indexOf(it);
        if (other !== -1 && other !== c) picks[other] = -1;
        picks[c] = picks[c] === it ? -1 : it;
        render();
      });
    });

    wrap.querySelector('#btn-clue-check').addEventListener('click', () => {
      if (solved) return;
      const isRight = round.truth.every((val, idx) => picks[idx] === val);
      if (isRight) {
        solved = true;
        render();
        const summary = round.chars.map((c, i) => `${c} → ${round.items[round.truth[i]]}`).join(' · ');
        callbacks.onCorrect(!hadMistake, `Case closed! ${summary}`);
      } else {
        hadMistake = true;
        const brokenIdx = round.clues.findIndex((cl) => !satisfiesClue(picks, cl));
        const hint =
          brokenIdx !== -1
            ? `Double-check this clue: "${round.clueTexts[brokenIdx]}"`
            : 'Make sure every friend gets a different item and matches all clues!';
        callbacks.onRetry(hint);
      }
    });
  }

  render();
}

/**
 * Tiers 2–4 Interactive Logic Grid (tap cells to cycle: blank -> ✕ -> ✓ -> blank)
 */
function renderLogicGrid(container, round, callbacks) {
  const n = round.size;
  // 0 = blank, -1 = ruled out (✕), 1 = matched (✓)
  const marks = Array.from({ length: n }, () => Array(n).fill(0));
  let solved = false;
  let hadMistake = false;

  const wrap = document.createElement('div');
  wrap.className = 'clue-stage';
  container.appendChild(wrap);

  function getSelectedAssignment() {
    const perm = [];
    for (let r = 0; r < n; r++) {
      const checks = [];
      for (let c = 0; c < n; c++) if (marks[r][c] === 1) checks.push(c);
      if (checks.length !== 1) return null;
      perm.push(checks[0]);
    }
    if (new Set(perm).size !== n) return null;
    return perm;
  }

  function render() {
    const readyPerm = getSelectedAssignment();
    let matchedCount = 0;
    for (let r = 0; r < n; r++) {
      if (marks[r].includes(1)) matchedCount += 1;
    }
    wrap.innerHTML = `
      <div class="clue-list-card">
        <div class="clue-list-title">Detective Clues (Tap grid boxes: 1st tap = ✕ ruled out · 2nd tap = ✓ match!)</div>
        <ul class="clue-list">
          ${round.clueTexts.map((txt) => `<li>${txt}</li>`).join('')}
        </ul>
      </div>

      <div class="logic-grid-wrap">
        <table class="logic-grid-table" aria-label="Deduction logic grid">
          <thead>
            <tr>
              <th></th>
              ${round.items.map((it) => `<th>${it}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${round.chars
              .map(
                (ch, r) => `
              <tr>
                <th>${ch}</th>
                ${round.items
                  .map((_, c) => {
                    const m = marks[r][c];
                    const cls = m === 1 ? 'is-yes' : m === -1 ? 'is-no' : '';
                    const sym = m === 1 ? '✓' : m === -1 ? '✕' : '';
                    return `<td><button type="button" class="lg-cell ${cls}" data-r="${r}" data-c="${c}" ${solved ? 'disabled' : ''}>${sym}</button></td>`;
                  })
                  .join('')}
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div style="font-size:0.84rem;font-weight:600;color:var(--ink-secondary);">
        ${readyPerm ? `All ${n} friends matched! Tap Check Case to verify.` : `${matchedCount} of ${n} friends matched with ✓`}
      </div>

      <div class="rotate-controls">
        <button type="button" class="btn btn-secondary" id="btn-lg-clear" ${solved ? 'disabled' : ''}>Clear Grid</button>
        <button type="button" class="btn btn-primary" id="btn-lg-check" ${!readyPerm || solved ? 'disabled' : ''}>Check Case!</button>
      </div>
    `;

    wrap.querySelectorAll('.lg-cell').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (solved) return;
        callbacks.playClick();
        const r = Number(btn.dataset.r);
        const c = Number(btn.dataset.c);
        // Cycle: blank (0) -> ruled out (-1) -> matched (1) -> blank (0)
        if (marks[r][c] === 0) {
          marks[r][c] = -1;
        } else if (marks[r][c] === -1) {
          // Clear conflicting ✓ in same row/col when placing a ✓
          for (let k = 0; k < n; k++) {
            if (marks[r][k] === 1) marks[r][k] = 0;
            if (marks[k][c] === 1) marks[k][c] = 0;
          }
          marks[r][c] = 1;
        } else {
          marks[r][c] = 0;
        }
        render();
      });
    });

    wrap.querySelector('#btn-lg-clear').addEventListener('click', () => {
      if (solved) return;
      callbacks.playClick();
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) marks[r][c] = 0;
      render();
    });

    wrap.querySelector('#btn-lg-check').addEventListener('click', () => {
      if (solved) return;
      const perm = getSelectedAssignment();
      if (!perm) return;
      const ok = round.truth.every((val, idx) => perm[idx] === val);
      if (ok) {
        solved = true;
        render();
        const summary = round.chars.map((c, i) => `${c} → ${round.items[round.truth[i]]}`).join(' · ');
        callbacks.onCorrect(!hadMistake, `Case closed! ${summary}`);
      } else {
        hadMistake = true;
        const brokenIdx = round.clues.findIndex((cl) => !satisfiesClue(perm, cl));
        const hint =
          brokenIdx !== -1
            ? `One match conflicts with this clue: "${round.clueTexts[brokenIdx]}"`
            : 'Check each clue carefully against your ✓ marks!';
        callbacks.onRetry(hint);
      }
    });
  }

  render();
}
