/**
 * Balance Lab (Analyze Pillar — Pre-Algebraic Equivalence & Deductive Reasoning)
 * Animated brass & wood pan balance scales:
 * - Tier 1 (Sprout): Compare weights & fill missing blocks (1–10) to level the scale.
 * - Tier 2 (Explorer): Transitive 2-scale comparison ("Which gem is heaviest?") & missing addends.
 * - Tier 3 (Challenger): Visual algebra (2 gems + 3 = 11 -> find 1 gem; teaches cancellation!).
 * - Tier 4 (Trailblazer): Two-scale linear systems (find Star on Scale 1, then Moon on Scale 2).
 */

import { randInt, pickOne, shuffle, makeNumericChoices } from './utils.js';

export const meta = {
  id: 'balance-lab',
  title: 'Balance Lab',
  pillar: 'analyze',
  pillarLabel: 'Analyze',
  shortDesc: 'Use tipping balance scales to deduce weights and solve visual algebra puzzles.',
  scienceNote: 'Pan-balance puzzles build relational equivalence and pre-algebraic reasoning.',
  timed: false,
};

const WEIGHT_ITEMS = {
  star: { label: 'Gold Star', short: 'Star', color: '#E9A825', stroke: '#9E6D08' },
  gem: { label: 'Teal Gem', short: 'Gem', color: '#2E9690', stroke: '#1B625E' },
  berry: { label: 'Coral Berry', short: 'Berry', color: '#E46B49', stroke: '#A33E22' },
  leaf: { label: 'Sage Acorn', short: 'Acorn', color: '#4B9B64', stroke: '#2B683E' },
};

function renderItemTokenSvg(item, cx, cy) {
  if (item.type === 'num') {
    return `
      <g transform="translate(${cx}, ${cy})">
        <rect x="-18" y="-24" width="36" height="24" rx="6" fill="#5D6778" stroke="#232733" stroke-width="1.8"/>
        <text x="0" y="-7" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="14" font-weight="700" fill="#FFF">${item.value}</text>
      </g>
    `;
  }
  if (item.type === 'mystery') {
    return `
      <g transform="translate(${cx}, ${cy})">
        <rect x="-18" y="-24" width="36" height="24" rx="6" fill="#FFF4D6" stroke="#C98810" stroke-width="2" stroke-dasharray="4 2"/>
        <text x="0" y="-7" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="15" font-weight="700" fill="#9E6D08">?</text>
      </g>
    `;
  }
  const info = WEIGHT_ITEMS[item.kind] || WEIGHT_ITEMS.gem;
  if (item.kind === 'star') {
    return `
      <g transform="translate(${cx}, ${cy - 14})">
        <path d="M0,-14 L4,-5 L14,-4 L6,3 L9,13 L0,7 L-9,13 L-6,3 L-14,-4 L-4,-5 Z"
              fill="${info.color}" stroke="${info.stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      </g>
    `;
  }
  if (item.kind === 'gem') {
    return `
      <g transform="translate(${cx}, ${cy - 13})">
        <polygon points="0,-14 13,-3 8,12 -8,12 -13,-3"
                 fill="${info.color}" stroke="${info.stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      </g>
    `;
  }
  if (item.kind === 'berry') {
    return `
      <g transform="translate(${cx}, ${cy - 12})">
        <circle cx="0" cy="0" r="12" fill="${info.color}" stroke="${info.stroke}" stroke-width="1.8"/>
        <path d="M-3,-12 Q0,-18 5,-14" fill="none" stroke="#3C7D50" stroke-width="2.2" stroke-linecap="round"/>
      </g>
    `;
  }
  return `
    <g transform="translate(${cx}, ${cy - 13})">
      <ellipse cx="0" cy="2" rx="11" ry="11" fill="${info.color}" stroke="${info.stroke}" stroke-width="1.8"/>
      <rect x="-12" y="-12" width="24" height="7" rx="3" fill="#7D5A44" stroke="#232733" stroke-width="1.6"/>
    </g>
  `;
}

function renderScaleSvg(scale) {
  // tilt: negative = left heavier (left dips down), positive = right heavier, 0 = balanced
  const angle = scale.tilt < 0 ? -9 : scale.tilt > 0 ? 9 : 0;

  const drawPanItems = (items, centerX, panY) => {
    const count = items.length;
    const spacing = count >= 4 ? 26 : 34;
    const startX = centerX - ((count - 1) * spacing) / 2;
    return items.map((it, idx) => renderItemTokenSvg(it, startX + idx * spacing, panY - 4)).join('');
  };

  const statusLabel =
    scale.tilt === 0 ? 'BALANCED (=)' : scale.tilt < 0 ? 'LEFT IS HEAVIER' : 'RIGHT IS HEAVIER';
  const pillFill = scale.tilt === 0 ? '#E3F4EB' : '#F4EFE6';
  const pillText = scale.tilt === 0 ? '#1E6E46' : '#585F6D';

  return `
    <svg class="scale-svg" viewBox="0 0 400 172" role="img" aria-label="Pan balance scale: ${statusLabel}">
      <!-- Wooden Base -->
      <rect x="135" y="128" width="130" height="12" rx="6" fill="#8C6244" stroke="#232733" stroke-width="2"/>
      <rect x="192" y="64" width="16" height="66" rx="4" fill="#A67653" stroke="#232733" stroke-width="2"/>
      <!-- Beam + Pans -->
      <g class="scale-beam-group" style="transform: rotate(${angle}deg);">
        <line x1="68" y1="66" x2="332" y2="66" stroke="#232733" stroke-width="6" stroke-linecap="round"/>
        <!-- Left Pan -->
        <line x1="78" y1="66" x2="62" y2="104" stroke="#6E7685" stroke-width="2"/>
        <line x1="78" y1="66" x2="94" y2="104" stroke="#6E7685" stroke-width="2"/>
        <path d="M 32 104 L 124 104 L 112 116 L 44 116 Z" fill="#E8C268" stroke="#232733" stroke-width="2" stroke-linejoin="round"/>
        ${drawPanItems(scale.left, 78, 104)}
        <!-- Right Pan -->
        <line x1="322" y1="66" x2="306" y2="104" stroke="#6E7685" stroke-width="2"/>
        <line x1="322" y1="66" x2="338" y2="104" stroke="#6E7685" stroke-width="2"/>
        <path d="M 276 104 L 368 104 L 356 116 L 288 116 Z" fill="#E8C268" stroke="#232733" stroke-width="2" stroke-linejoin="round"/>
        ${drawPanItems(scale.right, 322, 104)}
      </g>
      <!-- Pivot pin -->
      <circle cx="200" cy="66" r="8" fill="#E9A825" stroke="#232733" stroke-width="2.2"/>
      <!-- Clean status pill below base -->
      <rect x="136" y="147" width="128" height="22" rx="11" fill="${pillFill}" stroke="#D8D0C4" stroke-width="1.2"/>
      <text x="200" y="162" text-anchor="middle" font-family="Lexend, sans-serif" font-size="11" font-weight="700" fill="${pillText}">
        ${statusLabel}
      </text>
    </svg>
  `;
}

function makeCompareRound(tier) {
  const kinds = shuffle(['star', 'gem', 'berry', 'leaf']).slice(0, 3);
  const [heaviest, middle, lightest] = kinds;
  const askLightest = tier >= 2 && Math.random() < 0.4;

  // Scale 1 compares heaviest vs middle; Scale 2 compares middle vs lightest
  const flip1 = Math.random() < 0.5;
  const flip2 = Math.random() < 0.5;
  const scale1 = flip1
    ? { left: [{ type: 'shape', kind: middle }], right: [{ type: 'shape', kind: heaviest }], tilt: 1 }
    : { left: [{ type: 'shape', kind: heaviest }], right: [{ type: 'shape', kind: middle }], tilt: -1 };
  const scale2 = flip2
    ? { left: [{ type: 'shape', kind: lightest }], right: [{ type: 'shape', kind: middle }], tilt: 1 }
    : { left: [{ type: 'shape', kind: middle }], right: [{ type: 'shape', kind: lightest }], tilt: -1 };

  const scales = shuffle([scale1, scale2]);
  const answerKind = askLightest ? lightest : heaviest;
  const options = shuffle(kinds).map((k) => ({
    key: k,
    label: WEIGHT_ITEMS[k].label,
  }));

  return {
    kind: 'compare',
    scales,
    options,
    answerKey: answerKind,
    prompt: askLightest ? 'Which object is the LIGHTEST?' : 'Which object is the HEAVIEST?',
    speakPrompt: askLightest
      ? 'Look at both balance scales. Which object is the lightest?'
      : 'Look at both balance scales. Remember, the heavier side goes DOWN! Which object is the heaviest?',
    strategyTip: askLightest
      ? 'The heavier side pushes DOWN and the lighter side rises UP! Find the one that goes UP and never pushes another down.'
      : 'The heavier side pushes DOWN! Find the object that pushes down on one scale and never gets beaten on the other.',
  };
}

function makeMissingWeightRound(tier) {
  const total = tier === 1 ? randInt(5, 10) : randInt(10, 18);
  const known = randInt(2, total - 2);
  const missing = total - known;

  const left =
    tier === 1
      ? [{ type: 'num', value: total }]
      : [
          { type: 'num', value: Math.floor(total / 2) },
          { type: 'num', value: total - Math.floor(total / 2) },
        ];
  const right = [{ type: 'num', value: known }, { type: 'mystery' }];

  return {
    kind: 'numeric',
    scales: [{ left, right, tilt: -1 }],
    solvedScale: { left, right: [{ type: 'num', value: known }, { type: 'num', value: missing }], tilt: 0 },
    choices: makeNumericChoices(missing, 4, 1, 4),
    answer: missing,
    prompt: 'Which weight balances both pans evenly?',
    speakPrompt: `Make both sides equal! The left side totals ${total}. The right side has ${known} plus mystery weight. What number makes it balance?`,
    strategyTip: `Find the total on the left side (${total}), then ask: ${known} plus what equals ${total}?`,
  };
}

function makeVisualAlgebraRound() {
  const shapeKind = pickOne(['star', 'gem', 'berry']);
  const info = WEIGHT_ITEMS[shapeKind];
  const xVal = randInt(3, 9);
  const count = pickOne([2, 3]);
  const extra = randInt(2, 7);
  const rightTotal = count * xVal + extra;

  const left = [
    ...Array.from({ length: count }, () => ({ type: 'shape', kind: shapeKind })),
    { type: 'num', value: extra },
  ];
  const right = [{ type: 'num', value: rightTotal }];

  return {
    kind: 'numeric',
    scales: [{ left, right, tilt: 0 }],
    choices: makeNumericChoices(xVal, 4, 1, 4),
    answer: xVal,
    prompt: `The scale is balanced! How much does 1 ${info.short} weigh?`,
    speakPrompt: `The scale is balanced! There are ${count} ${info.short}s plus ${extra} on the left, balancing ${rightTotal} on the right. How much does 1 ${info.short} weigh?`,
    strategyTip: `Take ${extra} off BOTH sides so it stays balanced! That leaves ${count} ${info.short}s = ${rightTotal - extra}, so 1 ${info.short} = ${(rightTotal - extra) / count}.`,
  };
}

function makeTwoScaleSystemRound() {
  const [kindA, kindB] = shuffle(['star', 'gem', 'berry', 'leaf']).slice(0, 2);
  const infoA = WEIGHT_ITEMS[kindA];
  const infoB = WEIGHT_ITEMS[kindB];
  const valA = randInt(3, 8);
  const valB = randInt(2, 9);
  const countA = pickOne([2, 3]);
  const countB = 2;

  const scale1 = {
    left: Array.from({ length: countA }, () => ({ type: 'shape', kind: kindA })),
    right: [{ type: 'num', value: countA * valA }],
    tilt: 0,
  };
  const scale2 = {
    left: [
      { type: 'shape', kind: kindA },
      ...Array.from({ length: countB }, () => ({ type: 'shape', kind: kindB })),
    ],
    right: [{ type: 'num', value: valA + countB * valB }],
    tilt: 0,
  };

  return {
    kind: 'numeric',
    scales: [scale1, scale2],
    choices: makeNumericChoices(valB, 4, 1, 4),
    answer: valB,
    prompt: `Both scales are balanced! How much does 1 ${infoB.short} weigh?`,
    speakPrompt: `Both scales are balanced. Use the top scale to find the ${infoA.short} first, then solve for 1 ${infoB.short}.`,
    strategyTip: `From Scale 1: ${countA} ${infoA.short}s = ${countA * valA}, so 1 ${infoA.short} = ${valA}. Plug ${valA} into Scale 2 and subtract it from ${valA + countB * valB}!`,
  };
}

export function generateSession(tier = 1) {
  const rounds = [];
  for (let i = 0; i < 5; i++) {
    if (tier === 1) {
      rounds.push(i % 2 === 0 ? makeMissingWeightRound(1) : makeCompareRound(1));
    } else if (tier === 2) {
      rounds.push(i % 2 === 0 ? makeCompareRound(2) : makeMissingWeightRound(2));
    } else if (tier === 3) {
      rounds.push(i === 1 ? makeCompareRound(3) : makeVisualAlgebraRound());
    } else {
      rounds.push(i % 2 === 0 ? makeTwoScaleSystemRound() : makeVisualAlgebraRound());
    }
  }
  return rounds;
}

export function renderRound(container, round, callbacks) {
  let solved = false;
  let hadMistake = false;

  const wrap = document.createElement('div');
  wrap.className = 'scales-stack';

  const scaleCards = round.scales.map((sc) => {
    const card = document.createElement('div');
    card.className = 'scale-card';
    card.innerHTML = renderScaleSvg(sc);
    wrap.appendChild(card);
    return card;
  });

  const gridEl = document.createElement('div');
  gridEl.className = round.kind === 'compare' ? 'choice-grid cols-3' : 'choice-grid cols-4';

  if (round.kind === 'compare') {
    round.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.innerHTML = `
        <svg viewBox="-20 -28 40 34" width="38" height="34" aria-hidden="true">
          ${renderItemTokenSvg({ type: 'shape', kind: opt.key }, 0, 0)}
        </svg>
        <span>${opt.label}</span>
      `;
      btn.addEventListener('click', () => {
        if (solved) return;
        if (opt.key === round.answerKey) {
          solved = true;
          btn.classList.add('is-correct');
          callbacks.onCorrect(!hadMistake, `Correct! Putting both scales together proves it is the ${opt.label}.`);
        } else {
          hadMistake = true;
          btn.classList.add('is-wrong');
          btn.disabled = true;
          callbacks.onRetry('Check which side dips DOWN (heavier) and which rises UP (lighter) on both scales!');
        }
      });
      gridEl.appendChild(btn);
    });
  } else {
    round.choices.forEach((val) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.textContent = String(val);
      btn.addEventListener('click', () => {
        if (solved) return;
        if (val === round.answer) {
          solved = true;
          btn.classList.add('is-correct');
          if (round.solvedScale && scaleCards[0]) {
            scaleCards[0].innerHTML = renderScaleSvg(round.solvedScale);
          }
          callbacks.onCorrect(!hadMistake, `Balanced! ${round.strategyTip}`);
        } else {
          hadMistake = true;
          btn.classList.add('is-wrong');
          btn.disabled = true;
          callbacks.onRetry('Not quite balanced yet — try the strategy tip to simplify both pans!');
        }
      });
      gridEl.appendChild(btn);
    });
  }

  wrap.appendChild(gridEl);
  container.appendChild(wrap);
}
