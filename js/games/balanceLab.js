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
  star: { label: 'Gold Star', short: 'Star', color: '#F4B41A', hi: '#FFE28A', stroke: '#1F2430' },
  gem: { label: 'Teal Gem', short: 'Gem', color: '#1FA39B', hi: '#7BE3DC', stroke: '#1F2430' },
  berry: { label: 'Coral Berry', short: 'Berry', color: '#EB5E3C', hi: '#FFA18A', stroke: '#1F2430' },
  leaf: { label: 'Sage Acorn', short: 'Acorn', color: '#3FA45E', hi: '#8CE0A4', stroke: '#1F2430' },
};

function renderItemTokenSvg(item, cx, cy, forChoice = false, scale = 1) {
  const filterAttr = forChoice ? '' : 'filter="url(#bal-obj-shadow)"';
  const scaleStr = scale === 1 ? '' : ` scale(${scale})`;
  if (item.type === 'num') {
    return `
      <g transform="translate(${cx}, ${cy})${scaleStr}" ${filterAttr}>
        <rect x="-18" y="-30" width="36" height="30" rx="8" fill="#2A354B" stroke="#181F2E" stroke-width="2.1"/>
        <rect x="-15" y="-27" width="30" height="5" rx="2.5" fill="rgba(255,255,255,0.16)"/>
        <text x="0" y="-9" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">${item.value}</text>
      </g>
    `;
  }
  if (item.type === 'mystery') {
    return `
      <g transform="translate(${cx}, ${cy})${scaleStr}" ${filterAttr}>
        <rect x="-18" y="-30" width="36" height="30" rx="8" fill="#FFE8A3" stroke="#B67600" stroke-width="2.2" stroke-dasharray="4 2.5"/>
        <text x="0" y="-9" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="17" font-weight="700" fill="#8C5800">?</text>
      </g>
    `;
  }
  const info = WEIGHT_ITEMS[item.kind] || WEIGHT_ITEMS.gem;
  if (item.kind === 'star') {
    return `
      <g transform="translate(${cx}, ${cy})${scaleStr} translate(0, -17)" ${filterAttr}>
        <path d="M0,-17 L5,-6 L17,-5 L7.5,3.5 L10.5,15.5 L0,9 L-10.5,15.5 L-7.5,3.5 L-17,-5 L-5,-6 Z"
              fill="${info.color}" stroke="${info.stroke}" stroke-width="2.1" stroke-linejoin="round"/>
        <path d="M0,-12 L3,-5 L-4,-4 Z" fill="${info.hi}" opacity="0.85"/>
      </g>
    `;
  }
  if (item.kind === 'gem') {
    return `
      <g transform="translate(${cx}, ${cy})${scaleStr} translate(0, -16)" ${filterAttr}>
        <polygon points="0,-17 16,-4 10,14 -10,14 -16,-4"
                 fill="${info.color}" stroke="${info.stroke}" stroke-width="2.1" stroke-linejoin="round"/>
        <polygon points="0,-13 10,-4 0,0 -10,-4" fill="${info.hi}" opacity="0.72"/>
      </g>
    `;
  }
  if (item.kind === 'berry') {
    return `
      <g transform="translate(${cx}, ${cy})${scaleStr} translate(0, -15)" ${filterAttr}>
        <circle cx="0" cy="1" r="14.5" fill="${info.color}" stroke="${info.stroke}" stroke-width="2.1"/>
        <ellipse cx="-4.5" cy="-4.5" rx="4.2" ry="2.6" transform="rotate(-25 -4.5 -4.5)" fill="${info.hi}" opacity="0.82"/>
        <path d="M-3,-13 Q1,-21 7,-15" fill="none" stroke="#2D7B48" stroke-width="2.6" stroke-linecap="round"/>
      </g>
    `;
  }
  return `
    <g transform="translate(${cx}, ${cy})${scaleStr} translate(0, -15)" ${filterAttr}>
      <ellipse cx="0" cy="3" rx="13" ry="12.5" fill="${info.color}" stroke="${info.stroke}" stroke-width="2.1"/>
      <ellipse cx="-4.5" cy="1" rx="3.2" ry="5" fill="${info.hi}" opacity="0.65"/>
      <rect x="-14" y="-14" width="28" height="8.5" rx="3.8" fill="#7B563E" stroke="${info.stroke}" stroke-width="2"/>
    </g>
  `;
}

function renderScaleSvg(scale) {
  // tilt: negative = left heavier (left dips down), positive = right heavier, 0 = balanced
  const angle = scale.tilt < 0 ? -9 : scale.tilt > 0 ? 9 : 0;

  const drawPanItems = (items, centerX, panY) => {
    const count = items.length;
    const itemScale = count >= 4 ? 0.86 : 1;
    const spacing = count >= 4 ? 33 : 39;
    const startX = centerX - ((count - 1) * spacing) / 2;
    return items
      .map((it, idx) => renderItemTokenSvg(it, startX + idx * spacing, panY - 3, false, itemScale))
      .join('');
  };

  const statusLabel =
    scale.tilt === 0 ? 'BALANCED (=)' : scale.tilt < 0 ? 'LEFT IS HEAVIER' : 'RIGHT IS HEAVIER';
  const pillFill = scale.tilt === 0 ? '#E3F4EB' : '#EFEAE0';
  const pillText = scale.tilt === 0 ? '#1E6E46' : '#585F6D';

  return `
    <svg class="scale-svg" viewBox="0 0 400 186" role="img" aria-label="Pan balance scale: ${statusLabel}">
      <defs>
        <filter id="bal-obj-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#1E2430" flood-opacity="0.2"/>
        </filter>
      </defs>

      <!-- Quiet, recessed warm-linen scale frame so pan objects command attention -->
      <rect x="144" y="138" width="112" height="9" rx="4.5" fill="#E6DFD3" stroke="#CFC7B9" stroke-width="1.2"/>
      <rect x="195" y="68" width="10" height="71" rx="4" fill="#EAE4D9" stroke="#CFC7B9" stroke-width="1.2"/>

      <!-- Beam + Pans -->
      <g class="scale-beam-group" style="transform: rotate(${angle}deg);">
        <line x1="66" y1="68" x2="334" y2="68" stroke="#C2B9AC" stroke-width="3.4" stroke-linecap="round"/>

        <!-- Left Pan -->
        <line x1="79" y1="68" x2="54" y2="112" stroke="#D3CCC0" stroke-width="1.3"/>
        <line x1="79" y1="68" x2="104" y2="112" stroke="#D3CCC0" stroke-width="1.3"/>
        <path d="M 10 112 L 148 112 L 136 121 L 22 121 Z" fill="#EFE9DF" stroke="#CBC3B6" stroke-width="1.3" stroke-linejoin="round"/>
        ${drawPanItems(scale.left, 79, 112)}

        <!-- Right Pan -->
        <line x1="321" y1="68" x2="296" y2="112" stroke="#D3CCC0" stroke-width="1.3"/>
        <line x1="321" y1="68" x2="346" y2="112" stroke="#D3CCC0" stroke-width="1.3"/>
        <path d="M 252 112 L 390 112 L 378 121 L 264 121 Z" fill="#EFE9DF" stroke="#CBC3B6" stroke-width="1.3" stroke-linejoin="round"/>
        ${drawPanItems(scale.right, 321, 112)}
      </g>

      <!-- Subtle pivot pin -->
      <circle cx="200" cy="68" r="5" fill="#DDD6CA" stroke="#B9B0A2" stroke-width="1.3"/>

      <!-- Clean status pill below base -->
      <rect x="136" y="158" width="128" height="22" rx="11" fill="${pillFill}" stroke="#D8D0C4" stroke-width="1.1"/>
      <text x="200" y="173" text-anchor="middle" font-family="Lexend, sans-serif" font-size="11" font-weight="700" fill="${pillText}">
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
        <svg viewBox="-22 -37 44 41" width="44" height="41" aria-hidden="true">
          ${renderItemTokenSvg({ type: 'shape', kind: opt.key }, 0, 0, true)}
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
