/**
 * Balance Lab (Analyze Pillar — Pre-Algebraic Equivalence & Deductive Reasoning)
 * Animated brass & wood pan balance scales:
 * - Tier 1 (Sprout): Compare weights & fill missing blocks (1–10) to level the scale.
 * - Tier 2 (Explorer): Transitive 2-scale comparison ("Which gem is heaviest?") & missing addends.
 * - Tier 3 (Challenger): Visual algebra (2 gems + 3 = 11 -> find 1 gem; teaches cancellation!).
 * - Tier 4 (Trailblazer): Two-scale linear systems (find Star on Scale 1, then Moon on Scale 2).
 */

import { randInt, pickOne, shuffle, makeNumericChoices } from './utils.js';
import { getRecentPuzzleSigs, recordRecentPuzzleSigs } from '../storage.js';

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
  star: { label: 'Gold Star', short: 'Star', plural: 'Stars', color: '#F4B41A', hi: '#FFE28A', stroke: '#1F2430' },
  gem: { label: 'Teal Gem', short: 'Gem', plural: 'Gems', color: '#1FA39B', hi: '#7BE3DC', stroke: '#1F2430' },
  berry: { label: 'Coral Berry', short: 'Berry', plural: 'Berries', color: '#EB5E3C', hi: '#FFA18A', stroke: '#1F2430' },
  leaf: { label: 'Sage Acorn', short: 'Acorn', plural: 'Acorns', color: '#3FA45E', hi: '#8CE0A4', stroke: '#1F2430' },
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

const ALL_KINDS = ['star', 'gem', 'berry', 'leaf'];

function makeCompareRound(tier) {
  const kinds = shuffle(ALL_KINDS).slice(0, 3);
  const [heaviest, middle, lightest] = kinds;
  const askLightest = tier >= 2 ? Math.random() < 0.45 : Math.random() < 0.25;

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
    signature: `cmp:${askLightest ? 'L' : 'H'}:${heaviest}-${middle}-${lightest}`,
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
  const total = tier === 1 ? randInt(5, 10) : randInt(11, 24);
  const minKnown = tier === 1 ? 1 : 3;
  let known = randInt(minKnown, total - minKnown);
  let missing = total - known;

  let fullPan;
  if (tier === 1) {
    // Tier 1 (ages 5–6): clean single total weight on the full pan
    fullPan = [{ type: 'num', value: total }];
  } else {
    const minPart = 3;
    let partA = randInt(minPart, total - minPart);
    let partB = total - partA;
    // Avoid trivial identity like [6, 5] vs [6, ?] so kids actually compute the sum
    if (partA === known || partB === known) {
      const alt = known + 1 <= total - minKnown ? known + 1 : known - 1;
      if (alt >= minKnown && total - alt >= minKnown) {
        known = alt;
        missing = total - known;
      }
    }
    fullPan = [
      { type: 'num', value: partA },
      { type: 'num', value: partB },
    ];
  }

  const mysteryPan = Math.random() < 0.5
    ? [{ type: 'num', value: known }, { type: 'mystery' }]
    : [{ type: 'mystery' }, { type: 'num', value: known }];
  const solvedMysteryPan = mysteryPan.map((it) =>
    it.type === 'mystery' ? { type: 'num', value: missing } : it
  );

  const mysteryOnLeft = Math.random() < 0.5;
  const left = mysteryOnLeft ? mysteryPan : fullPan;
  const right = mysteryOnLeft ? fullPan : mysteryPan;
  const solvedLeft = mysteryOnLeft ? solvedMysteryPan : fullPan;
  const solvedRight = mysteryOnLeft ? fullPan : solvedMysteryPan;
  const tilt = mysteryOnLeft ? 1 : -1;
  const fullSide = mysteryOnLeft ? 'right' : 'left';
  const mysterySide = mysteryOnLeft ? 'left' : 'right';

  return {
    kind: 'numeric',
    signature: `miss:${total}:${missing}:${fullPan.map((p) => p.value).join('+')}`,
    scales: [{ left, right, tilt }],
    solvedScale: { left: solvedLeft, right: solvedRight, tilt: 0 },
    choices: makeNumericChoices(missing, 4, 1, 4),
    answer: missing,
    prompt: 'Which weight balances both pans evenly?',
    speakPrompt: `Make both sides equal! The ${fullSide} side totals ${total}. The ${mysterySide} side has ${known} plus mystery weight. What number makes it balance?`,
    strategyTip: `Find the total on the ${fullSide} side (${total}), then ask: ${known} plus what equals ${total}?`,
  };
}

function makeEqualGroupRound(tier, preferredKind = null) {
  const shapeKind = preferredKind || pickOne(ALL_KINDS);
  const info = WEIGHT_ITEMS[shapeKind];
  const count = tier === 1 ? 2 : pickOne([2, 3, 4]);
  const xVal = tier === 1 ? randInt(2, 7) : randInt(2, 9);
  const total = count * xVal;

  const shapePan = Array.from({ length: count }, () => ({ type: 'shape', kind: shapeKind }));
  const numPan = [{ type: 'num', value: total }];
  const flip = Math.random() < 0.5;
  const left = flip ? numPan : shapePan;
  const right = flip ? shapePan : numPan;

  return {
    kind: 'numeric',
    signature: `eqgrp:${count}:${xVal}`,
    scales: [{ left, right, tilt: 0 }],
    choices: makeNumericChoices(xVal, 4, 1, 4),
    answer: xVal,
    prompt: `The scale is balanced! How much does 1 ${info.short} weigh?`,
    speakPrompt: `The scale is balanced! ${count} matching ${info.plural} balance ${total}. How much does 1 ${info.short} weigh?`,
    strategyTip: `Share ${total} equally among the ${count} matching ${info.plural}: ${total} ÷ ${count} = ${xVal}!`,
  };
}

function makeVisualAlgebraRound(tier = 3, preferredKind = null) {
  const shapeKind = preferredKind || pickOne(ALL_KINDS);
  const info = WEIGHT_ITEMS[shapeKind];
  const xVal = tier >= 4 ? randInt(4, 12) : randInt(2, 10);
  const count = pickOne([2, 3]);
  const extra = tier >= 4 ? randInt(3, 15) : randInt(1, 9);
  const rightTotal = count * xVal + extra;

  const shapePan = [
    ...Array.from({ length: count }, () => ({ type: 'shape', kind: shapeKind })),
    { type: 'num', value: extra },
  ];
  const numPan = [{ type: 'num', value: rightTotal }];
  const flip = Math.random() < 0.45;
  const left = flip ? numPan : shapePan;
  const right = flip ? shapePan : numPan;

  const simpShapePan = Array.from({ length: count }, () => ({ type: 'shape', kind: shapeKind }));
  const simpNumPan = [{ type: 'num', value: rightTotal - extra }];
  const cancelSteps = [
    {
      label: `✂ Take ${extra} off BOTH pans`,
      nextScale: { left: flip ? simpNumPan : simpShapePan, right: flip ? simpShapePan : simpNumPan, tilt: 0 },
    },
  ];

  return {
    kind: 'numeric',
    signature: `alg:${count}:${xVal}:${extra}`,
    scales: [{ left, right, tilt: 0 }],
    cancelSteps,
    choices: makeNumericChoices(xVal, 4, 1, 4),
    answer: xVal,
    prompt: `The scale is balanced! How much does 1 ${info.short} weigh?`,
    speakPrompt: `The scale is balanced! ${count} ${info.plural} plus ${extra} balance ${rightTotal}. How much does 1 ${info.short} weigh?`,
    strategyTip: `Take ${extra} off BOTH sides so it stays balanced! That leaves ${count} ${info.plural} = ${rightTotal - extra}, so 1 ${info.short} = ${xVal}.`,
  };
}

function makeCancelBothSidesRound(tier = 3, preferredKind = null) {
  const shapeKind = preferredKind || pickOne(ALL_KINDS);
  const info = WEIGHT_ITEMS[shapeKind];
  // Tier 4 always requires multi-step cancellation + division while staying <= 4 items per pan:
  // 70%: 3x + smallNum = x + bigNum (cancel x, cancel smallNum, ÷2)
  // 30%: 4x = x + bigNum (cancel x, ÷3 with larger xVal)
  const useThreeDiv = tier >= 4 && Math.random() < 0.3;
  const extraShapes = tier >= 4 ? (useThreeDiv ? 3 : 2) : Math.random() < 0.65 ? 1 : 2;
  const xVal = tier >= 4 ? (useThreeDiv ? randInt(7, 15) : randInt(5, 14)) : randInt(3, 10);
  const smallNum = tier >= 4 ? (useThreeDiv ? 0 : randInt(3, 14)) : extraShapes === 2 ? 0 : randInt(1, 7);
  const bigNum = smallNum + extraShapes * xVal;

  const sideA = [
    ...Array.from({ length: 1 + extraShapes }, () => ({ type: 'shape', kind: shapeKind })),
    ...(smallNum > 0 ? [{ type: 'num', value: smallNum }] : []),
  ];
  const sideB = [{ type: 'shape', kind: shapeKind }, { type: 'num', value: bigNum }];

  const flip = Math.random() < 0.45;
  const left = flip ? sideB : sideA;
  const right = flip ? sideA : sideB;

  // Interactive step-by-step pan simplification!
  const step1A = [
    ...Array.from({ length: extraShapes }, () => ({ type: 'shape', kind: shapeKind })),
    ...(smallNum > 0 ? [{ type: 'num', value: smallNum }] : []),
  ];
  const step1B = [{ type: 'num', value: bigNum }];
  const cancelSteps = [
    {
      label: `✂ Take 1 ${info.short} off BOTH pans`,
      nextScale: { left: flip ? step1B : step1A, right: flip ? step1A : step1B, tilt: 0 },
    },
  ];
  if (smallNum > 0) {
    const step2A = Array.from({ length: extraShapes }, () => ({ type: 'shape', kind: shapeKind }));
    const step2B = [{ type: 'num', value: bigNum - smallNum }];
    cancelSteps.push({
      label: `✂ Take ${smallNum} off BOTH pans`,
      nextScale: { left: flip ? step2B : step2A, right: flip ? step2A : step2B, tilt: 0 },
    });
  }

  const numStep = smallNum > 0 ? ` and take ${smallNum} off BOTH sides` : '';
  const finalStep =
    extraShapes === 1
      ? `That leaves 1 ${info.short} = ${xVal}!`
      : `That leaves ${extraShapes} ${info.plural} = ${extraShapes * xVal}, so 1 ${info.short} = ${xVal}!`;

  return {
    kind: 'numeric',
    signature: `cancel:${extraShapes}:${xVal}:${smallNum}`,
    scales: [{ left, right, tilt: 0 }],
    cancelSteps,
    choices: makeNumericChoices(xVal, 4, 1, tier >= 4 ? 3 : 4),
    answer: xVal,
    prompt: `The scale is balanced! How much does 1 ${info.short} weigh?`,
    speakPrompt: `Both pans have ${info.plural}! Try removing one ${info.short} from each pan to see what is left. How much does 1 ${info.short} weigh?`,
    strategyTip: `Remove 1 ${info.short} from BOTH pans${numStep}! ${finalStep}`,
  };
}

function makeTwoScaleSystemRound(tier = 4) {
  const [kindA, kindB] = shuffle(ALL_KINDS).slice(0, 2);
  const infoA = WEIGHT_ITEMS[kindA];
  const infoB = WEIGHT_ITEMS[kindB];
  const valA = randInt(tier >= 4 ? 4 : 2, tier >= 4 ? 11 : 7);
  const valB = randInt(tier >= 4 ? 4 : 2, tier >= 4 ? 12 : 8);
  const countA = pickOne([2, 3]);
  // Tier 4 always requires solving Scale 1 with an offset AND Scale 2 with countB >= 2 (kept <= 4 items/pan!)
  const extraA = tier >= 4 ? randInt(3, 11) : 0;
  const countB = tier >= 4 ? pickOne([2, 3]) : pickOne([1, 2]);
  const countAInS2 = tier >= 4 ? (countB === 3 ? 1 : pickOne([1, 2])) : 1;

  const s1Shapes = [
    ...Array.from({ length: countA }, () => ({ type: 'shape', kind: kindA })),
    ...(extraA > 0 ? [{ type: 'num', value: extraA }] : []),
  ];
  const s1Total = countA * valA + extraA;
  const s1Num = [{ type: 'num', value: s1Total }];
  const flip1 = Math.random() < 0.35;
  const scale1 = {
    left: flip1 ? s1Num : s1Shapes,
    right: flip1 ? s1Shapes : s1Num,
    tilt: 0,
  };

  const s2Shapes = [
    ...Array.from({ length: countAInS2 }, () => ({ type: 'shape', kind: kindA })),
    ...Array.from({ length: countB }, () => ({ type: 'shape', kind: kindB })),
  ];
  const s2Total = countAInS2 * valA + countB * valB;
  const s2Num = [{ type: 'num', value: s2Total }];
  const flip2 = Math.random() < 0.35;
  const scale2 = {
    left: flip2 ? s2Num : s2Shapes,
    right: flip2 ? s2Shapes : s2Num,
    tilt: 0,
  };

  const s1Hint =
    extraA > 0
      ? `Scale 1: ${s1Total} − ${extraA} = ${countA * valA}, ÷ ${countA} → 1 ${infoA.short} = ${valA}.`
      : `Scale 1: ${countA} ${infoA.plural} = ${s1Total}, so 1 ${infoA.short} = ${valA}.`;
  const aContrib = countAInS2 * valA;
  const bStep =
    countB === 1
      ? `${s2Total} − ${aContrib} = ${valB}!`
      : `${s2Total} − ${aContrib} = ${countB * valB}, then ÷ ${countB} → ${valB}!`;

  return {
    kind: 'numeric',
    signature: `sys:${countA}:${valA}:${extraA}:${countAInS2}:${countB}:${valB}`,
    scales: [scale1, scale2],
    choices: makeNumericChoices(valB, 4, 1, tier >= 4 ? 3 : 4),
    answer: valB,
    prompt: `Both scales are balanced! How much does 1 ${infoB.short} weigh?`,
    speakPrompt: `Both scales are balanced. Use the top scale to find the ${infoA.short} first, then solve for 1 ${infoB.short}.`,
    strategyTip: `${s1Hint} Plug into Scale 2: ${bStep}`,
  };
}

function generateUniqueRound(makerFn, sessionSigs, recentSigs) {
  let fallback = null;
  for (let attempt = 0; attempt < 28; attempt++) {
    const candidate = makerFn();
    if (!sessionSigs.has(candidate.signature)) {
      fallback = candidate;
      if (!recentSigs.includes(candidate.signature)) {
        return candidate;
      }
    }
  }
  return fallback || makerFn();
}

export function generateSession(tier = 1, profile = null) {
  const scopeKey = `balance-lab:${tier}`;
  const recentSigs = getRecentPuzzleSigs(profile, scopeKey);
  const sessionSigs = new Set();
  const shapeOrder = shuffle(ALL_KINDS);
  let shapeCursor = 0;
  const nextShape = () => shapeOrder[shapeCursor++ % shapeOrder.length];

  const blueprints = {
    1: [
      () => makeMissingWeightRound(1),
      () => makeCompareRound(1),
      () => makeEqualGroupRound(1, nextShape()),
      () => makeMissingWeightRound(1),
      () => makeCompareRound(1),
    ],
    2: [
      () => makeCompareRound(2),
      () => makeMissingWeightRound(2),
      () => makeEqualGroupRound(2, nextShape()),
      () => makeMissingWeightRound(2),
      () => makeCompareRound(2),
    ],
    3: [
      () => makeVisualAlgebraRound(3, nextShape()),
      () => makeCancelBothSidesRound(3, nextShape()),
      () => makeVisualAlgebraRound(3, nextShape()),
      () => makeTwoScaleSystemRound(3),
      () => makeCancelBothSidesRound(3, nextShape()),
    ],
    4: [
      () => makeTwoScaleSystemRound(4),
      () => makeCancelBothSidesRound(4, nextShape()),
      () => makeTwoScaleSystemRound(4),
      () => makeCancelBothSidesRound(4, nextShape()),
      () => makeTwoScaleSystemRound(4),
    ],
  };

  const makers = blueprints[tier] || blueprints[4];
  const rounds = makers.map((fn) => {
    const r = generateUniqueRound(fn, sessionSigs, recentSigs);
    sessionSigs.add(r.signature);
    return r;
  });

  recordRecentPuzzleSigs(profile, scopeKey, Array.from(sessionSigs), 30);
  return rounds;
}

export function renderRound(container, round, callbacks) {
  let solved = false;
  let hadMistake = false;
  let simpBtnRef = null;
  let resetBtnRef = null;

  const wrap = document.createElement('div');
  wrap.className = 'scales-stack';

  const scaleCards = round.scales.map((sc) => {
    const card = document.createElement('div');
    card.className = 'scale-card';
    card.innerHTML = renderScaleSvg(sc);
    wrap.appendChild(card);
    return card;
  });

  // Optional tactile "Simplify Both Pans" interactive toolbar for algebra rounds
  if (round.cancelSteps && round.cancelSteps.length > 0 && scaleCards[0]) {
    let stepIdx = 0;
    const simpBar = document.createElement('div');
    simpBar.className = 'balance-simplify-bar';

    const simpBtn = document.createElement('button');
    simpBtn.type = 'button';
    simpBtn.className = 'btn btn-secondary';
    simpBtn.style.minHeight = '42px';
    simpBtn.style.fontSize = '0.9rem';
    simpBtn.textContent = round.cancelSteps[0].label;
    simpBtnRef = simpBtn;

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'btn btn-ghost';
    resetBtn.style.minHeight = '42px';
    resetBtn.style.fontSize = '0.84rem';
    resetBtn.textContent = 'Reset Scale';
    resetBtn.hidden = true;
    resetBtnRef = resetBtn;

    simpBtn.addEventListener('click', () => {
      if (solved || stepIdx >= round.cancelSteps.length) return;
      callbacks.playClick();
      const step = round.cancelSteps[stepIdx];
      scaleCards[0].innerHTML = renderScaleSvg(step.nextScale);
      stepIdx += 1;
      resetBtn.hidden = false;
      if (stepIdx < round.cancelSteps.length) {
        simpBtn.textContent = round.cancelSteps[stepIdx].label;
      } else {
        simpBtn.textContent = '✓ Simplified! Still Balanced (=)';
        simpBtn.disabled = true;
      }
    });

    resetBtn.addEventListener('click', () => {
      if (solved) return;
      callbacks.playClick();
      stepIdx = 0;
      scaleCards[0].innerHTML = renderScaleSvg(round.scales[0]);
      simpBtn.textContent = round.cancelSteps[0].label;
      simpBtn.disabled = false;
      resetBtn.hidden = true;
    });

    simpBar.appendChild(simpBtn);
    simpBar.appendChild(resetBtn);
    wrap.appendChild(simpBar);
  }

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
          if (simpBtnRef) simpBtnRef.disabled = true;
          if (resetBtnRef) resetBtnRef.disabled = true;
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
