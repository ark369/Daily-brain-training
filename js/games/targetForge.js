/**
 * Target Forge (Compute Pillar — Number Bonds, Flexible Mental Decomposition & Factor Forge)
 * Active construction math game where kids build equations from tactile number cards
 * to hit a Target Number — ANY valid combination using available cards is accepted!
 * - Tier 1 (Sprout): Part-part-whole number bonds (pick 2 cards that add to target 6–18).
 * - Tier 2 (Explorer): 2-card addition & subtraction forge (target 8–48).
 * - Tier 3 (Challenger): Factor Pair Forge (×) & 2-step Combo Forge (+, −, ×).
 * - Tier 4 (Trailblazer): 3-card expression forge ((a op b) op c = target) with +, −, ×!
 */

import { randInt, pickOne, shuffle } from './utils.js';
import { getRecentPuzzleSigs, recordRecentPuzzleSigs } from '../storage.js';

export const meta = {
  id: 'target-forge',
  title: 'Target Forge',
  pillar: 'compute',
  pillarLabel: 'Compute',
  shortDesc: 'Combine number cards (+, −, ×) to forge exact target numbers and factor pairs.',
  scienceNote: 'Constructive target-number building develops flexible mental arithmetic and factor fluency.',
  timed: false,
};

function makeUniqueCards(required, totalCount, minV, maxV) {
  const cards = [...required];
  let guard = 0;
  while (cards.length < totalCount && guard < 80) {
    guard += 1;
    const v = randInt(minV, maxV);
    if (!cards.includes(v)) cards.push(v);
  }
  while (cards.length < totalCount) {
    cards.push(randInt(minV, maxV));
  }
  return shuffle(cards);
}

function makeBondRound() {
  const target = randInt(6, 17);
  const a = randInt(2, Math.floor(target / 2));
  const b = target - a;
  const cards = makeUniqueCards([a, b], 5, 1, Math.max(9, target - 1));
  return {
    kind: 'two-card',
    ops: ['+'],
    defaultOp: '+',
    target,
    cards,
    sampleSolution: `${a} + ${b} = ${target}`,
    signature: `tf1:${target}:${a}+${b}`,
    prompt: `Pick 2 cards that ADD up to ${target}!`,
    speakPrompt: `Pick two number cards that add up to ${target}!`,
    strategyTip: `Pick one card and count on to ${target} — see if the number you need is sitting in the tray!`,
  };
}

function makeAddSubRound() {
  const isSub = Math.random() < 0.45;
  if (isSub) {
    const target = randInt(8, 28);
    const b = randInt(4, 15);
    const a = target + b;
    const cards = makeUniqueCards([a, b], 5, 3, a + 6);
    return {
      kind: 'two-card',
      ops: ['+', '−'],
      defaultOp: '−',
      target,
      cards,
      sampleSolution: `${a} − ${b} = ${target}`,
      signature: `tf2:sub:${target}:${a}-${b}`,
      prompt: `Use 2 cards (+ or −) to forge ${target}!`,
      speakPrompt: `Combine two number cards with plus or minus to make ${target}!`,
      strategyTip: `Can two smaller cards add up to ${target}, or can you subtract a smaller card from a bigger card?`,
    };
  }
  const target = randInt(16, 46);
  const a = randInt(6, target - 6);
  const b = target - a;
  const cards = makeUniqueCards([a, b], 5, 4, target - 2);
  return {
    kind: 'two-card',
    ops: ['+', '−'],
    defaultOp: '+',
    target,
    cards,
    sampleSolution: `${a} + ${b} = ${target}`,
    signature: `tf2:add:${target}:${Math.min(a, b)}+${Math.max(a, b)}`,
    prompt: `Use 2 cards (+ or −) to forge ${target}!`,
    speakPrompt: `Combine two number cards with plus or minus to make ${target}!`,
    strategyTip: `Look at the ones digits first! Which two cards have ones digits that combine to make ${target % 10}?`,
  };
}

function makeFactorRound() {
  const a = randInt(3, 9);
  const b = randInt(4, 9);
  const target = a * b;
  const cards = makeUniqueCards([a, b], 5, 2, 12);
  return {
    kind: 'two-card',
    ops: ['×'],
    defaultOp: '×',
    target,
    cards,
    sampleSolution: `${a} × ${b} = ${target}`,
    signature: `tf3:fac:${target}:${Math.min(a, b)}x${Math.max(a, b)}`,
    prompt: `Factor Forge! Pick 2 cards that MULTIPLY to ${target}!`,
    speakPrompt: `Factor forge! Pick two cards that multiply together to equal ${target}.`,
    strategyTip: `Test the cards one by one: which card divides evenly into ${target}?`,
  };
}

function makeThreeCardRound(tier) {
  const a = randInt(2, tier >= 4 ? 9 : 7);
  const b = randInt(3, tier >= 4 ? 9 : 7);
  const c = randInt(2, tier >= 4 ? 12 : 9);
  const op2 = pickOne(['+', '−']);
  const prod = a * b;
  const actualOp2 = op2 === '−' && prod <= c + 2 ? '+' : op2;
  const target = actualOp2 === '+' ? prod + c : prod - c;
  const cards = makeUniqueCards([a, b, c], 5, 2, Math.max(11, c + 2));

  return {
    kind: 'three-card',
    ops: ['+', '−', '×'],
    target,
    cards,
    sampleSolution: `(${a} × ${b}) ${actualOp2} ${c} = ${target}`,
    signature: `tf3c:${target}:${Math.min(a, b)}x${Math.max(a, b)}${actualOp2}${c}`,
    prompt: `Forge ${target} using 3 cards!`,
    speakPrompt: `Build a three-card equation using plus, minus, or times to make ${target}!`,
    strategyTip: `Try multiplying two cards to get CLOSE to ${target}, then add or subtract the third card to land right on it!`,
  };
}

export function evalOp(a, op, b) {
  if (op === '+') return a + b;
  if (op === '−') return a - b;
  return a * b;
}

export function generateSession(tier = 1, profile = null) {
  const scopeKey = `target-forge:${tier}`;
  const recentSigs = getRecentPuzzleSigs(profile, scopeKey);
  const sessionSigs = new Set();

  const blueprints = {
    1: [makeBondRound, makeBondRound, makeBondRound, makeBondRound, makeBondRound],
    2: [makeAddSubRound, makeAddSubRound, makeAddSubRound, makeAddSubRound, makeAddSubRound],
    3: [makeFactorRound, () => makeThreeCardRound(3), makeFactorRound, () => makeThreeCardRound(3), makeFactorRound],
    4: [() => makeThreeCardRound(4), makeFactorRound, () => makeThreeCardRound(4), () => makeThreeCardRound(4), () => makeThreeCardRound(4)],
  };

  const rounds = (blueprints[tier] || blueprints[4]).map((fn) => {
    let fallback = null;
    for (let a = 0; a < 24; a++) {
      const cand = fn();
      if (!sessionSigs.has(cand.signature)) {
        fallback = cand;
        if (!recentSigs.includes(cand.signature)) {
          sessionSigs.add(cand.signature);
          return cand;
        }
      }
    }
    const chosen = fallback || fn();
    sessionSigs.add(chosen.signature);
    return chosen;
  });

  recordRecentPuzzleSigs(profile, scopeKey, Array.from(sessionSigs), 28);
  return rounds;
}

export function renderRound(container, round, callbacks) {
  const isThree = round.kind === 'three-card';
  let slots = isThree ? [null, null, null] : [null, null]; // card indices into round.cards
  let op1 = round.defaultOp || '×';
  let op2 = '+';
  let solved = false;
  let hadMistake = false;

  const wrap = document.createElement('div');
  wrap.className = 'forge-stage';
  container.appendChild(wrap);

  function computeCurrent() {
    if (slots.some((s) => s === null)) return null;
    const v0 = round.cards[slots[0]];
    const v1 = round.cards[slots[1]];
    const mid = evalOp(v0, op1, v1);
    if (!isThree) return mid;
    return evalOp(mid, op2, round.cards[slots[2]]);
  }

  function render() {
    const curResult = computeCurrent();
    const usedSet = new Set(slots.filter((x) => x !== null));

    const slotBtn = (idx) => {
      const cardIdx = slots[idx];
      const val = cardIdx !== null ? round.cards[cardIdx] : '?';
      return `<button type="button" class="forge-slot ${cardIdx !== null ? 'filled' : ''}" data-slot="${idx}" ${solved ? 'disabled' : ''}>${val}</button>`;
    };

    const opPicker = (which, activeVal) => {
      if (round.ops.length === 1) {
        return `<span class="forge-op-fixed">${activeVal}</span>`;
      }
      return `
        <div class="forge-op-group" data-op-which="${which}">
          ${round.ops
            .map(
              (op) =>
                `<button type="button" class="forge-op-btn ${activeVal === op ? 'active' : ''}" data-op="${op}" ${solved ? 'disabled' : ''}>${op}</button>`
            )
            .join('')}
        </div>
      `;
    };

    wrap.innerHTML = `
      <div class="forge-target-banner">
        <span class="forge-target-label">TARGET</span>
        <span class="forge-target-num">${round.target}</span>
      </div>

      <div class="forge-equation-card">
        ${isThree ? '<span class="forge-paren">(</span>' : ''}
        ${slotBtn(0)}
        ${opPicker(1, op1)}
        ${slotBtn(1)}
        ${isThree ? `<span class="forge-paren">)</span>${opPicker(2, op2)}${slotBtn(2)}` : ''}
        <span class="forge-op-fixed">=</span>
        <span class="forge-result ${curResult === round.target ? 'match' : ''}">${curResult === null ? '?' : curResult}</span>
      </div>

      <div class="forge-cards-tray" id="forge-tray">
        ${round.cards
          .map(
            (val, idx) => `
          <button type="button"
                  class="forge-num-card ${usedSet.has(idx) ? 'used' : ''}"
                  data-card-idx="${idx}"
                  ${usedSet.has(idx) || solved ? 'disabled' : ''}>
            ${val}
          </button>`
          )
          .join('')}
      </div>

      <div class="rotate-controls">
        <button type="button" class="btn btn-secondary" id="btn-forge-clear" ${usedSet.size === 0 || solved ? 'disabled' : ''}>Clear Cards</button>
        <button type="button" class="btn btn-primary" id="btn-forge-check" ${curResult === null || solved ? 'disabled' : ''}>Forge It!</button>
      </div>
    `;

    wrap.querySelectorAll('[data-card-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (solved) return;
        const idx = Number(btn.dataset.cardIdx);
        const emptySlot = slots.findIndex((s) => s === null);
        if (emptySlot === -1) return;
        callbacks.playClick();
        slots[emptySlot] = idx;
        render();
      });
    });

    wrap.querySelectorAll('[data-slot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (solved) return;
        const sIdx = Number(btn.dataset.slot);
        if (slots[sIdx] === null) return;
        callbacks.playClick();
        slots[sIdx] = null;
        render();
      });
    });

    wrap.querySelectorAll('.forge-op-group').forEach((grp) => {
      const which = Number(grp.dataset.opWhich);
      grp.querySelectorAll('[data-op]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (solved) return;
          callbacks.playClick();
          if (which === 1) op1 = btn.dataset.op;
          else op2 = btn.dataset.op;
          render();
        });
      });
    });

    wrap.querySelector('#btn-forge-clear').addEventListener('click', () => {
      if (solved) return;
      callbacks.playClick();
      slots = isThree ? [null, null, null] : [null, null];
      render();
    });

    wrap.querySelector('#btn-forge-check').addEventListener('click', () => {
      if (solved) return;
      const val = computeCurrent();
      if (val === round.target) {
        solved = true;
        render();
        const expr = isThree
          ? `(${round.cards[slots[0]]} ${op1} ${round.cards[slots[1]]}) ${op2} ${round.cards[slots[2]]} = ${round.target}`
          : `${round.cards[slots[0]]} ${op1} ${round.cards[slots[1]]} = ${round.target}`;
        callbacks.onCorrect(!hadMistake, `Forged! ${expr}!`);
      } else {
        hadMistake = true;
        const diffHint = val < round.target ? `too small (${val} < ${round.target})` : `too big (${val} > ${round.target})`;
        callbacks.onRetry(`That makes ${val}, which is ${diffHint}. Try swapping a card or operator!`);
      }
    });
  }

  render();
}
