/**
 * Rule Switcher (Analyze Pillar — Algebraic Function Machines, Procedural Boolean Logic,
 * Pattern Sequences & Multi-Rule 3x3 Logic Matrices)
 * - Replaces low-transfer repetitive sorting with high-transfer Function Machines
 *   (IN -> [Mystery Rule] -> OUT) + 45+ procedural Boolean rules + procedural sequences
 *   + varied 3x3 matrices with persistent cross-day deduping.
 */

import { randInt, pickOne, shuffle, makeNumericChoices } from './utils.js';
import { getRecentPuzzleSigs, recordRecentPuzzleSigs, getGameStage } from '../storage.js';

export const meta = {
  id: 'rule-switcher',
  title: 'Rule Switcher',
  pillar: 'analyze',
  pillarLabel: 'Analyze',
  shortDesc: 'Crack mystery Function Machines, Boolean logic rules, and visual/number patterns.',
  scienceNote: 'Input-output function machines and multi-attribute deduction build core algebraic reasoning.',
  timed: false,
};

const COLORS = [
  { id: 'teal', label: 'Teal', fill: '#2E9690', stroke: '#1C635F' },
  { id: 'coral', label: 'Coral', fill: '#E46B49', stroke: '#A84125' },
  { id: 'gold', label: 'Gold', fill: '#E9A825', stroke: '#A16E08' },
];

const SHAPES = [
  { id: 'circle', label: 'Circle' },
  { id: 'square', label: 'Square' },
  { id: 'triangle', label: 'Triangle' },
];

function renderShapePrimitive(shapeId, colorObj, cx, cy, r = 14) {
  if (shapeId === 'circle') {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${colorObj.fill}" stroke="${colorObj.stroke}" stroke-width="2.2"/>`;
  }
  if (shapeId === 'square') {
    const s = r * 1.85;
    return `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="4" fill="${colorObj.fill}" stroke="${colorObj.stroke}" stroke-width="2.2"/>`;
  }
  return `<polygon points="${cx},${cy - r * 1.15} ${cx + r * 1.1},${cy + r} ${cx - r * 1.1},${cy + r}" fill="${colorObj.fill}" stroke="${colorObj.stroke}" stroke-width="2.2" stroke-linejoin="round"/>`;
}

export function renderTokenSvg(token, size = 100) {
  const colorObj = COLORS.find((c) => c.id === token.color) || COLORS[0];
  const count = token.count || 1;
  const positions =
    count === 1
      ? [[50, 50, 24]]
      : count === 2
        ? [[31, 50, 16], [69, 50, 16]]
        : [[50, 29, 14], [30, 66, 14], [70, 66, 14]];

  const shapes = positions
    .map(([x, y, r]) => renderShapePrimitive(token.shape, colorObj, x, y, r))
    .join('');

  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${shapes}</svg>`;
}

/**
 * Procedural Boolean Logic Rules (48+ distinct valid rules instead of 4 static ones!)
 */
function buildBooleanRulePool(tier) {
  const pool = [];
  const colorMap = Object.fromEntries(COLORS.map((c) => [c.id, c.label]));
  const shapeMap = Object.fromEntries(SHAPES.map((s) => [s.id, s.label]));

  // 1. Color AND Shape (9 rules)
  for (const c of COLORS) {
    for (const s of SHAPES) {
      pool.push({
        id: `and-${c.id}-${s.id}`,
        label: `${c.label} AND ${s.label}`,
        test: (card) => card.color === c.id && card.shape === s.id,
        tip: `BOTH must be true: ${c.label} AND a ${s.label}.`,
      });
    }
  }
  // 2. Color OR Count (9 rules)
  for (const c of COLORS) {
    for (const cnt of [1, 2, 3]) {
      const cntLbl = cnt === 1 ? '1 shape' : `${cnt} shapes`;
      pool.push({
        id: `or-${c.id}-${cnt}`,
        label: `${c.label} OR has ${cntLbl}`,
        test: (card) => card.color === c.id || card.count === cnt,
        tip: `EITHER works: ${c.label} (any count) OR ${cntLbl} (any color)!`,
      });
    }
  }
  // 3. NOT Color AND Shape (9 rules)
  for (const c of COLORS) {
    for (const s of SHAPES) {
      pool.push({
        id: `notc-${c.id}-${s.id}`,
        label: `NOT ${c.label}, AND ${s.label}`,
        test: (card) => card.color !== c.id && card.shape === s.id,
        tip: `Check both: skip ${c.label}, and make sure it is a ${s.label}.`,
      });
    }
  }
  // 4. NOT Shape AND Count >= 2 or Odd/Even (12+ rules for Tiers 3–4)
  if (tier >= 3) {
    for (const s of SHAPES) {
      pool.push({
        id: `nots-ge2-${s.id}`,
        label: `NOT ${s.label}, AND 2 or more shapes`,
        test: (card) => card.shape !== s.id && card.count >= 2,
        tip: `Skip any ${s.label}, and count must be 2 or 3!`,
      });
      pool.push({
        id: `odd-${s.id}`,
        label: `Odd count (1 or 3) AND ${s.label}`,
        test: (card) => (card.count === 1 || card.count === 3) && card.shape === s.id,
        tip: `Must be a ${s.label} with 1 or 3 shapes (not 2).`,
      });
    }
    for (const c of COLORS) {
      pool.push({
        id: `nots-or-${c.id}`,
        label: `NOT ${colorMap[c.id]} OR has 2 shapes`,
        test: (card) => card.color !== c.id || card.count === 2,
        tip: `Matches if it is NOT ${colorMap[c.id]}, OR if it has exactly 2 shapes!`,
      });
    }
    // Shape OR Color (9 rules)
    for (const c of COLORS) {
      for (const s of SHAPES) {
        pool.push({
          id: `or-cs-${c.id}-${s.id}`,
          label: `${c.label} OR ${shapeMap[s.id]}`,
          test: (card) => card.color === c.id || card.shape === s.id,
          tip: `EITHER ${c.label} OR a ${shapeMap[s.id]} passes!`,
        });
      }
    }
  }
  return pool;
}

function makeSortRound(tier) {
  if (tier === 1) {
    // Concrete single-attribute rule switch for 5–6 year olds (2 dims -> switch!)
    const dims = shuffle(['color', 'shape']);
    const [ruleA, ruleB] = dims;
    const makeCard = () => ({
      color: pickOne(COLORS.slice(0, 2)).id,
      shape: pickOne(SHAPES.slice(0, 2)).id,
      count: 1,
    });
    const cards = [
      { ...makeCard(), activeRule: ruleA, switched: false },
      { ...makeCard(), activeRule: ruleA, switched: false },
      { ...makeCard(), activeRule: ruleB, switched: true },
      { ...makeCard(), activeRule: ruleB, switched: false },
    ];
    const binsForRule = (rule) =>
      rule === 'color'
        ? COLORS.slice(0, 2).map((c) => ({ id: c.id, label: c.label, swatch: c.fill }))
        : SHAPES.slice(0, 2).map((s) => ({ id: s.id, label: s.label }));

    return {
      kind: 'sort-switch',
      signature: `sort1:${ruleA}->${ruleB}`,
      cards,
      binsForRule,
      prompt: 'Watch the sorting rule — it switches halfway through!',
      speakPrompt: 'Sort each card into the right bin! Listen closely, because the rule switches halfway through!',
      strategyTip: 'Say the rule on the banner out loud before tapping so your fingers stay sharp!',
    };
  }

  // Tiers 2–4: Procedural Boolean compound rule switching (45+ unique rules!)
  const pool = buildBooleanRulePool(tier);
  const rules = shuffle(pool).slice(0, 2);

  // Deterministic 27-card deck (3 colors × 3 shapes × 3 counts) guarantees zero null-card edge cases
  const allCards = [];
  for (const col of COLORS) {
    for (const shp of SHAPES) {
      for (const cnt of [1, 2, 3]) {
        allCards.push({ color: col.id, shape: shp.id, count: cnt });
      }
    }
  }

  const cards = [];
  for (let rIdx = 0; rIdx < 2; rIdx++) {
    const rule = rules[rIdx];
    const matching = allCards.filter((cand) => rule.test(cand));
    const nonMatching = allCards.filter((cand) => !rule.test(cand));
    const pair = [
      { ...pickOne(matching), boolRule: rule, wantMatch: true },
      { ...pickOne(nonMatching), boolRule: rule, wantMatch: false },
    ];
    shuffle(pair).forEach((card, i) => {
      cards.push({ ...card, switched: rIdx === 1 && i === 0 });
    });
  }

  return {
    kind: 'sort-bool',
    signature: `bool:${rules[0].id}|${rules[1].id}`,
    cards,
    prompt: 'Does the card match the Logic Rule?',
    speakPrompt: 'Check if each card matches the logic rule! Watch closely when the rule switches!',
    strategyTip: 'Test each condition one by one — for AND both must be true; for OR at least one must be true!',
  };
}

/**
 * High-transfer Algebraic Function Machine (IN -> [ ? ] -> OUT)
 */
function makeFunctionMachineRound(tier) {
  let fn;
  let ruleLabel;
  let sig;
  let tip;
  let inputs;

  if (tier === 1) {
    const ops = [
      () => {
        const k = randInt(1, 4);
        return { fn: (x) => x + k, ruleLabel: `+ ${k}`, sig: `fm1:+${k}`, inputs: shuffle([1, 2, 3, 4, 5, 6]).slice(0, 4), tip: `Every number going in gets +${k} added to it!` };
      },
      () => {
        const k = randInt(1, 3);
        return { fn: (x) => x - k, ruleLabel: `− ${k}`, sig: `fm1:-${k}`, inputs: shuffle([4, 5, 6, 7, 8, 9]).slice(0, 4), tip: `The machine takes away ${k} from every number!` };
      },
      () => ({
        fn: (x) => x * 2,
        ruleLabel: 'Double (× 2)',
        sig: 'fm1:x2',
        inputs: shuffle([1, 2, 3, 4, 5, 6]).slice(0, 4),
        tip: 'The machine DOUBLES every number (adds it to itself)!',
      }),
    ];
    ({ fn, ruleLabel, sig, inputs, tip } = pickOne(ops)());
  } else if (tier === 2) {
    const ops = [
      () => {
        const k = randInt(4, 12);
        return { fn: (x) => x + k, ruleLabel: `+ ${k}`, sig: `fm2:+${k}`, inputs: shuffle([3, 5, 7, 9, 12, 15]).slice(0, 4), tip: `Compare each IN and OUT: the machine always adds +${k}!` };
      },
      () => {
        const k = randInt(3, 8);
        return { fn: (x) => x - k, ruleLabel: `− ${k}`, sig: `fm2:-${k}`, inputs: shuffle([10, 12, 15, 18, 20, 24]).slice(0, 4), tip: `The output is always ${k} LESS than the input!` };
      },
      () => {
        const m = pickOne([2, 3, 4, 5, 10]);
        return { fn: (x) => x * m, ruleLabel: `× ${m}`, sig: `fm2:x${m}`, inputs: shuffle([2, 3, 4, 5, 6, 7, 8]).slice(0, 4), tip: `Every input gets multiplied by ${m}!` };
      },
    ];
    ({ fn, ruleLabel, sig, inputs, tip } = pickOne(ops)());
  } else if (tier === 3) {
    const ops = [
      () => {
        const m = pickOne([2, 3]);
        const b = randInt(1, 5);
        return {
          fn: (x) => x * m + b,
          ruleLabel: `× ${m}, then + ${b}`,
          sig: `fm3:${m}x+${b}`,
          inputs: shuffle([2, 3, 4, 5, 6, 7, 8]).slice(0, 4),
          tip: `Two-step rule! Multiply the input by ${m}, then add ${b}!`,
        };
      },
      () => {
        const m = pickOne([2, 3, 4]);
        const b = randInt(1, 3);
        return {
          fn: (x) => x * m - b,
          ruleLabel: `× ${m}, then − ${b}`,
          sig: `fm3:${m}x-${b}`,
          inputs: shuffle([2, 3, 4, 5, 6, 7, 8]).slice(0, 4),
          tip: `Two-step rule! Multiply the input by ${m}, then subtract ${b}!`,
        };
      },
      () => {
        const b = randInt(1, 5);
        return {
          fn: (x) => x / 2 + b,
          ruleLabel: `÷ 2, then + ${b}`,
          sig: `fm3:half+${b}`,
          inputs: shuffle([4, 6, 8, 10, 12, 14]).slice(0, 4),
          tip: `Take half of the input (÷ 2), then add ${b}!`,
        };
      },
    ];
    ({ fn, ruleLabel, sig, inputs, tip } = pickOne(ops)());
  } else {
    const ops = [
      () => {
        const m = pickOne([3, 4, 5]);
        const b = pickOne([-4, -3, -2, 2, 3, 5, 7]);
        const sign = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
        return {
          fn: (x) => x * m + b,
          ruleLabel: `${m}n ${sign}`,
          sig: `fm4:${m}x+${b}`,
          inputs: shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4),
          tip: `Linear function! Multiply by ${m}, then ${sign}.`,
        };
      },
      () => {
        const c = randInt(1, 5);
        return {
          fn: (x) => x * x + c,
          ruleLabel: `n² + ${c}`,
          sig: `fm4:sq+${c}`,
          inputs: shuffle([2, 3, 4, 5, 6, 7]).slice(0, 4),
          tip: `Square the input (n × n), then add ${c}!`,
        };
      },
      () => ({
        fn: (x) => x * (x + 1),
        ruleLabel: 'n × (n + 1)',
        sig: 'fm4:n(n+1)',
        inputs: shuffle([2, 3, 4, 5, 6, 7]).slice(0, 4),
        tip: 'Multiply the input by the very next whole number: n × (n + 1)!',
      }),
    ];
    ({ fn, ruleLabel, sig, inputs, tip } = pickOne(ops)());
  }

  const examples = inputs.slice(0, 3).sort((a, b) => a - b).map((x) => ({ inVal: x, outVal: fn(x) }));
  const testIn = inputs[3];
  const answer = fn(testIn);
  const spread = answer > 30 ? 6 : 4;
  const choices = makeNumericChoices(answer, 4, 1, spread);

  return {
    kind: 'function-machine',
    signature: `${sig}:in=${testIn}`,
    examples,
    testIn,
    answer,
    ruleLabel,
    choices,
    prompt: 'Crack the Function Machine! What comes OUT?',
    speakPrompt: `Look at how the Function Machine changes each number going in. If ${testIn} goes in, what number comes out?`,
    strategyTip: tip,
  };
}

function makeVisualPatternRound(tier, stage = 1) {
  if (tier === 1) {
    // Rich Tier 1 visual patterns: ABAB, AAB, ABB, ABC, and growing 1-2-3 count!
    const mode = pickOne(['AB', 'AAB', 'ABB', 'ABC', 'COUNT']);
    const cols = shuffle(COLORS);
    const shps = shuffle(SHAPES);

    if (mode === 'COUNT') {
      const c = cols[0].id;
      const s = shps[0].id;
      const seq = [
        { color: c, shape: s, count: 1 },
        { color: c, shape: s, count: 2 },
        { color: c, shape: s, count: 3 },
        { color: c, shape: s, count: 1 },
        { color: c, shape: s, count: 2 },
      ];
      const answer = { color: c, shape: s, count: 3 };
      const distractors = [
        { color: c, shape: s, count: 1 },
        { color: c, shape: s, count: 2 },
        { color: cols[1].id, shape: s, count: 3 },
      ];
      const options = shuffle([{ token: answer, isCorrect: true }, ...distractors.map((t) => ({ token: t, isCorrect: false }))]);
      return {
        kind: 'pattern-visual',
        signature: `pv1:count:${c}:${s}`,
        seq,
        options,
        correctIdx: options.findIndex((o) => o.isCorrect),
        prompt: 'What tile comes next in the pattern?',
        speakPrompt: 'Count the shapes in each tile from left to right. Which tile comes next?',
        strategyTip: 'Count the number of shapes in each box: 1, 2, 3, 1, 2... what number comes next?',
      };
    }

    const a = { color: cols[0].id, shape: shps[0].id, count: 1 };
    const b = { color: cols[1].id, shape: shps[1].id, count: 1 };
    const cTok = { color: cols[2].id, shape: shps[2].id, count: 1 };
    let seq;
    let answer;
    let distractors;

    if (mode === 'ABC') {
      seq = [a, b, cTok, a, b];
      answer = cTok;
      distractors = [a, b, { color: cols[2].id, shape: shps[0].id, count: 1 }];
    } else if (mode === 'AAB') {
      seq = [a, a, b, a, a];
      answer = b;
      distractors = [a, { color: cols[0].id, shape: shps[1].id, count: 1 }, { color: cols[1].id, shape: shps[0].id, count: 1 }];
    } else if (mode === 'ABB') {
      seq = [a, b, b, a, b];
      answer = b;
      distractors = [a, { color: cols[0].id, shape: shps[1].id, count: 1 }, { color: cols[2].id, shape: shps[1].id, count: 1 }];
    } else {
      seq = [a, b, a, b, a];
      answer = b;
      distractors = [a, { color: cols[0].id, shape: shps[1].id, count: 1 }, { color: cols[1].id, shape: shps[0].id, count: 1 }];
    }

    const options = shuffle([
      { token: answer, isCorrect: true },
      ...distractors.map((t) => ({ token: t, isCorrect: false })),
    ]);

    return {
      kind: 'pattern-visual',
      signature: `pv1:${mode}:${a.color}-${a.shape}:${b.color}-${b.shape}`,
      seq,
      options,
      correctIdx: options.findIndex((o) => o.isCorrect),
      prompt: 'What tile comes next in the pattern?',
      speakPrompt: 'Look at the pattern from left to right. Which tile comes next?',
      strategyTip: 'Say the pattern out loud with a rhythm to hear which shape repeats next!',
    };
  }

  if (tier === 2) {
    // Procedural Tier 2 number patterns: add, subtract, or alternating +a, -b!
    const kind = pickOne(['add', 'sub', 'alt']);
    let seq;
    let answer;
    let tip;
    let sig;
    if (kind === 'add') {
      const start = randInt(2, 18);
      const step = pickOne([2, 3, 4, 5, 6, 10]);
      seq = [0, 1, 2, 3].map((i) => start + i * step);
      answer = start + 4 * step;
      tip = `Each jump adds +${step}!`;
      sig = `pn2:add:${start}:${step}`;
    } else if (kind === 'sub') {
      const step = pickOne([2, 3, 4, 5, 6]);
      const start = randInt(step * 4 + 3, step * 4 + 25);
      seq = [0, 1, 2, 3].map((i) => start - i * step);
      answer = start - 4 * step;
      tip = `This pattern counts DOWN by −${step} each step!`;
      sig = `pn2:sub:${start}:${step}`;
    } else {
      const start = randInt(4, 14);
      const up = randInt(4, 7);
      const down = randInt(1, 3);
      seq = [start, start + up, start + up - down, start + 2 * up - down, start + 2 * up - 2 * down];
      answer = seq[4] + up;
      tip = `Alternating jumps! +${up}, then −${down}, repeating!`;
      sig = `pn2:alt:${start}:${up}:${down}`;
    }
    const choices = makeNumericChoices(answer, 4, 1, 5);
    return {
      kind: 'pattern-number',
      signature: sig,
      seq,
      choices,
      answer,
      prompt: 'Crack the number rule! What number comes next?',
      speakPrompt: `Look at the numbers: ${seq.join(', ')}. What number comes next?`,
      strategyTip: tip,
    };
  }

  // Tiers 3 & 4: Procedural advanced number sequences (dozens of unique rules!)
  const genType = pickOne(['growDiff', 'doublePlus', 'geometric', 'fib', 'altBig']);
  let seq;
  let answer;
  let tip;
  let sig;

  if (genType === 'growDiff') {
    const start = randInt(1, 9);
    const d0 = randInt(1, 4);
    const inc = pickOne([1, 2, 3]);
    seq = [start];
    for (let i = 0; i < 4; i++) {
      seq.push(seq[seq.length - 1] + d0 + i * inc);
    }
    answer = seq[seq.length - 1] + d0 + 4 * inc;
    tip = `The jump grows by +${inc} each time (+${d0}, +${d0 + inc}, +${d0 + 2 * inc}, +${d0 + 3 * inc} → next +${d0 + 4 * inc})!`;
    sig = `pn3:gd:${start}:${d0}:${inc}`;
  } else if (genType === 'doublePlus') {
    const start = randInt(1, 4);
    const k = pickOne([-1, 1, 2, 3]);
    seq = [start];
    for (let i = 0; i < 3; i++) {
      seq.push(seq[seq.length - 1] * 2 + k);
    }
    answer = seq[seq.length - 1] * 2 + k;
    const sign = k >= 0 ? `+ ${k}` : `− ${Math.abs(k)}`;
    tip = `Each step doubles and adjusts: (× 2 ${sign})!`;
    sig = `pn3:dp:${start}:${k}`;
  } else if (genType === 'geometric') {
    const start = randInt(1, 4);
    const mult = pickOne([2, 3]);
    seq = [start, start * mult, start * mult ** 2, start * mult ** 3];
    answer = start * mult ** 4;
    tip = `Each number multiplies by ×${mult}!`;
    sig = `pn3:geo:${start}:${mult}`;
  } else if (genType === 'fib') {
    const a = randInt(1, 5);
    const b = randInt(2, 6);
    seq = [a, b, a + b, a + 2 * b, 2 * a + 3 * b];
    answer = seq[3] + seq[4];
    tip = `Add the previous two numbers together: ${seq[3]} + ${seq[4]} = ${answer}!`;
    sig = `pn3:fib:${a}:${b}`;
  } else {
    const start = randInt(5, 16);
    const up = randInt(6, 12);
    const down = randInt(2, 5);
    seq = [start, start + up, start + up - down, start + 2 * up - down, start + 2 * up - 2 * down];
    answer = seq[4] + up;
    tip = `Two-step rhythm: +${up}, then −${down}!`;
    sig = `pn3:alt:${start}:${up}:${down}`;
  }

  const spread = answer > 40 ? 8 : 5;
  const choices = makeNumericChoices(answer, 4, 1, spread);
  return {
    kind: 'pattern-number',
    signature: sig,
    seq,
    choices,
    answer,
    prompt: 'Find the hidden number rule! What comes next?',
    speakPrompt: `Find the hidden number rule: ${seq.join(', ')}. What comes next?`,
    strategyTip: tip,
  };
}

function makeMatrixRound(tier, stage = 1) {
  const colorOrder = shuffle(COLORS).map((c) => c.id);
  const shapeOrder = shuffle(SHAPES).map((s) => s.id);
  const countOrder = shuffle([1, 2, 3]);
  const useCounts = tier >= 4 || stage >= 2;

  const cells = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cells.push({
        color: colorOrder[(r + c) % 3],
        shape: shapeOrder[(r + 2 * c) % 3],
        count: useCounts ? countOrder[(2 * r + c) % 3] : 1,
      });
    }
  }

  // Vary WHICH cell is missing (center, right-middle, bottom-middle, or bottom-right!)
  const missingIdx = pickOne([4, 5, 7, 8]);
  const answer = cells[missingIdx];
  const distractors = [
    { ...answer, color: colorOrder[(colorOrder.indexOf(answer.color) + 1) % 3] },
    { ...answer, shape: shapeOrder[(shapeOrder.indexOf(answer.shape) + 1) % 3] },
    useCounts
      ? { ...answer, count: countOrder[(countOrder.indexOf(answer.count) + 1) % 3] }
      : {
          color: colorOrder[(colorOrder.indexOf(answer.color) + 2) % 3],
          shape: shapeOrder[(shapeOrder.indexOf(answer.shape) + 2) % 3],
          count: answer.count,
        },
  ];
  const options = shuffle([
    { token: answer, isCorrect: true },
    ...distractors.map((t) => ({ token: t, isCorrect: false })),
  ]);

  const rowNames = ['top', 'middle', 'bottom'];
  const missingRow = rowNames[Math.floor(missingIdx / 3)];

  return {
    kind: 'pattern-matrix',
    signature: `mat:${missingIdx}:${useCounts ? '3attr' : '2attr'}:${answer.color}-${answer.shape}-${answer.count}`,
    cells,
    missingIdx,
    options,
    correctIdx: options.findIndex((o) => o.isCorrect),
    prompt: useCounts
      ? 'Every row & column has all 3 colors, shapes, and counts. Which tile fits "?"?'
      : 'Every row & column has all 3 colors and all 3 shapes. Which tile fits "?"?',
    speakPrompt: 'Every row and column has all three colors and all three shapes. Which tile completes the missing square?',
    strategyTip: useCounts
      ? `Check the ${missingRow} row: find the missing COLOR, missing SHAPE, and missing COUNT (1, 2, or 3)!`
      : `Look at the ${missingRow} row alone: check which COLOR is missing first, then which SHAPE is missing!`,
  };
}

function generateUnique(fn, sessionSigs, recentSigs) {
  let fallback = null;
  for (let i = 0; i < 24; i++) {
    const r = fn();
    if (!sessionSigs.has(r.signature)) {
      fallback = r;
      if (!recentSigs.includes(r.signature)) return r;
    }
  }
  return fallback || fn();
}

export function generateSession(tier = 1, profile = null) {
  const scopeKey = `rule-switcher:${tier}`;
  const recentSigs = getRecentPuzzleSigs(profile, scopeKey);
  const stage = getGameStage(profile, meta.id);
  const sessionSigs = new Set();

  const blueprints = {
    1: [
      () => makeVisualPatternRound(1, stage),
      () => makeFunctionMachineRound(1),
      () => makeSortRound(1),
      () => makeVisualPatternRound(1, stage),
      () => makeFunctionMachineRound(1),
    ],
    2: [
      () => makeFunctionMachineRound(2),
      () => makeVisualPatternRound(2, stage),
      () => makeSortRound(2),
      () => makeFunctionMachineRound(2),
      () => makeVisualPatternRound(2, stage),
    ],
    3: [
      () => makeFunctionMachineRound(3),
      () => makeSortRound(3),
      () => makeVisualPatternRound(3, stage),
      () => makeMatrixRound(3, stage),
      () => makeFunctionMachineRound(3),
    ],
    4: [
      () => makeFunctionMachineRound(4),
      () => makeMatrixRound(4, stage),
      () => makeSortRound(4),
      () => makeVisualPatternRound(4, stage),
      () => makeFunctionMachineRound(4),
    ],
  };

  const rounds = (blueprints[tier] || blueprints[4]).map((fn) => {
    const r = generateUnique(fn, sessionSigs, recentSigs);
    sessionSigs.add(r.signature);
    return r;
  });

  recordRecentPuzzleSigs(profile, scopeKey, Array.from(sessionSigs), 30);
  return rounds;
}

export function renderRound(container, round, callbacks) {
  if (round.kind === 'sort-switch' || round.kind === 'sort-bool') {
    renderSortRound(container, round, callbacks);
    return;
  }

  let solved = false;
  let hadMistake = false;

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '20px';
  wrap.style.width = '100%';

  if (round.kind === 'function-machine') {
    const card = document.createElement('div');
    card.className = 'fm-card';
    card.innerHTML = `
      <div class="fm-header">
        <span>IN</span>
        <span class="fm-rule-pill" id="fm-rule-pill">⚙ Mystery Rule</span>
        <span>OUT</span>
      </div>
      <div class="fm-rows">
        ${round.examples
          .map(
            (ex) => `
          <div class="fm-row">
            <span class="fm-val">${ex.inVal}</span>
            <span class="fm-pipe">→</span>
            <span class="fm-box">?</span>
            <span class="fm-pipe">→</span>
            <span class="fm-val out">${ex.outVal}</span>
          </div>
        `
          )
          .join('')}
        <div class="fm-row challenge">
          <span class="fm-val">${round.testIn}</span>
          <span class="fm-pipe">→</span>
          <span class="fm-box" id="fm-active-box">?</span>
          <span class="fm-pipe">→</span>
          <span class="fm-val mystery" id="fm-mystery">?</span>
        </div>
      </div>
    `;
    wrap.appendChild(card);

    const grid = document.createElement('div');
    grid.className = 'choice-grid cols-4';
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
          const m = card.querySelector('#fm-mystery');
          if (m) {
            m.textContent = String(val);
            m.classList.remove('mystery');
            m.classList.add('solved');
          }
          const rp = card.querySelector('#fm-rule-pill');
          if (rp) {
            rp.textContent = `✓ Rule: ${round.ruleLabel}`;
            rp.classList.add('revealed');
          }
          card.querySelectorAll('.fm-box').forEach((b) => {
            b.textContent = round.ruleLabel;
            b.classList.add('revealed');
          });
          callbacks.onCorrect(!hadMistake, `Cracked the Function Machine! Rule: ${round.ruleLabel}.`);
        } else {
          hadMistake = true;
          btn.classList.add('is-wrong');
          btn.disabled = true;
          callbacks.onRetry('Test the same rule on all 3 example rows to be sure it matches every single one!');
        }
      });
      grid.appendChild(btn);
    });
    wrap.appendChild(grid);
  } else if (round.kind === 'pattern-visual') {
    const row = document.createElement('div');
    row.className = 'pattern-row';
    round.seq.forEach((tok) => {
      const tile = document.createElement('div');
      tile.className = 'pattern-tile';
      tile.innerHTML = renderTokenSvg(tok, 54);
      row.appendChild(tile);
    });
    const mystery = document.createElement('div');
    mystery.className = 'pattern-tile mystery';
    mystery.textContent = '?';
    row.appendChild(mystery);
    wrap.appendChild(row);

    const grid = document.createElement('div');
    grid.className = 'choice-grid cols-4';
    round.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.setAttribute('aria-label', `Pattern option ${idx + 1}`);
      btn.innerHTML = renderTokenSvg(opt.token, 54);
      btn.addEventListener('click', () => {
        if (solved) return;
        if (idx === round.correctIdx) {
          solved = true;
          btn.classList.add('is-correct');
          mystery.innerHTML = renderTokenSvg(opt.token, 54);
          callbacks.onCorrect(!hadMistake, 'Nice pattern spotting!');
        } else {
          hadMistake = true;
          btn.classList.add('is-wrong');
          btn.disabled = true;
          callbacks.onRetry('Say the shapes from left to right and listen for what repeats!');
        }
      });
      grid.appendChild(btn);
    });
    wrap.appendChild(grid);
  } else if (round.kind === 'pattern-number') {
    const row = document.createElement('div');
    row.className = 'pattern-row';
    round.seq.forEach((n) => {
      const tile = document.createElement('div');
      tile.className = 'pattern-tile';
      tile.style.fontFamily = 'var(--font-display)';
      tile.style.fontSize = '1.45rem';
      tile.style.fontWeight = '700';
      tile.textContent = String(n);
      row.appendChild(tile);
    });
    const mystery = document.createElement('div');
    mystery.className = 'pattern-tile mystery';
    mystery.textContent = '?';
    row.appendChild(mystery);
    wrap.appendChild(row);

    const grid = document.createElement('div');
    grid.className = 'choice-grid cols-4';
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
          mystery.textContent = String(val);
          callbacks.onCorrect(!hadMistake, `Cracked it! ${round.strategyTip}`);
        } else {
          hadMistake = true;
          btn.classList.add('is-wrong');
          btn.disabled = true;
          callbacks.onRetry('Check how much the number changes between each step!');
        }
      });
      grid.appendChild(btn);
    });
    wrap.appendChild(grid);
  } else if (round.kind === 'pattern-matrix') {
    const mat = document.createElement('div');
    mat.className = 'pattern-matrix';
    let mysteryEl = null;
    round.cells.forEach((tok, idx) => {
      const tile = document.createElement('div');
      if (idx === round.missingIdx) {
        tile.className = 'pattern-tile mystery';
        tile.textContent = '?';
        mysteryEl = tile;
      } else {
        tile.className = 'pattern-tile';
        tile.innerHTML = renderTokenSvg(tok, 54);
      }
      mat.appendChild(tile);
    });
    wrap.appendChild(mat);

    const grid = document.createElement('div');
    grid.className = 'choice-grid cols-4';
    round.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.setAttribute('aria-label', `Matrix tile option ${idx + 1}`);
      btn.innerHTML = renderTokenSvg(opt.token, 54);
      btn.addEventListener('click', () => {
        if (solved) return;
        if (idx === round.correctIdx) {
          solved = true;
          btn.classList.add('is-correct');
          if (mysteryEl) mysteryEl.innerHTML = renderTokenSvg(opt.token, 54);
          callbacks.onCorrect(!hadMistake, 'Brilliant logical deduction! Every row and column aligns.');
        } else {
          hadMistake = true;
          btn.classList.add('is-wrong');
          btn.disabled = true;
          callbacks.onRetry(round.strategyTip);
        }
      });
      grid.appendChild(btn);
    });
    wrap.appendChild(grid);
  }

  container.appendChild(wrap);
}

function renderSortRound(container, round, callbacks) {
  let cardIdx = 0;
  let hadMistake = false;
  let transitioning = false;
  let cardTimer = null;
  let unmounted = false;

  if (callbacks.registerCleanup) {
    callbacks.registerCleanup(() => {
      unmounted = true;
      if (cardTimer) {
        clearTimeout(cardTimer);
        cardTimer = null;
      }
    });
  }

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '16px';
  wrap.style.width = '100%';
  container.appendChild(wrap);

  function showCard() {
    if (unmounted) return;
    transitioning = false;
    const card = round.cards[cardIdx];
    const isBool = round.kind === 'sort-bool';

    if (card.switched) {
      callbacks.playSwitch();
    }

    const ruleText = isBool
      ? `Rule: ${card.boolRule.label}`
      : `Sort by: ${card.activeRule.toUpperCase()}`;

    if (callbacks.profile && callbacks.profile.readAloud && (cardIdx === 0 || card.switched)) {
      const announce = card.switched ? `New rule! ${ruleText}` : ruleText;
      if (callbacks.speakRule) {
        callbacks.speakRule(announce);
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(announce);
          u.rate = 0.94;
          window.speechSynthesis.speak(u);
        } catch {
          // ignore
        }
      }
    }

    const switchTag = card.switched ? '⚡ NEW RULE! ' : '';

    wrap.innerHTML = `
      <div class="rule-banner ${card.switched ? 'switched' : ''}">
        <span>${switchTag}${ruleText}</span>
      </div>
      <div style="font-size:0.82rem;color:var(--ink-muted);font-weight:600;">
        Card ${cardIdx + 1} of ${round.cards.length}
      </div>
      <div class="token-card animate-pop">${renderTokenSvg(card, 112)}</div>
      <div class="choice-grid ${isBool ? '' : 'cols-3'}" id="sort-bins"></div>
      <div id="sort-msg" style="min-height:32px;"></div>
    `;

    const binsEl = wrap.querySelector('#sort-bins');
    const msgEl = wrap.querySelector('#sort-msg');

    const bins = isBool
      ? [
          { id: 'yes', label: '✓ Matches Rule' },
          { id: 'no', label: '✕ Does Not Match' },
        ]
      : round.binsForRule(card.activeRule);

    if (bins.length === 2) binsEl.className = 'choice-grid';

    bins.forEach((bin) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.innerHTML = bin.swatch
        ? `<span style="display:inline-flex;align-items:center;gap:8px;"><span style="width:16px;height:16px;border-radius:50%;background:${bin.swatch};display:inline-block;"></span>${bin.label}</span>`
        : bin.label;

      btn.addEventListener('click', () => {
        if (transitioning || unmounted) return;
        const expected = isBool
          ? card.wantMatch
            ? 'yes'
            : 'no'
          : String(card[card.activeRule]);

        if (bin.id === expected) {
          transitioning = true;
          btn.classList.add('is-correct');
          binsEl.querySelectorAll('button').forEach((b) => (b.disabled = true));
          cardIdx += 1;
          if (cardIdx >= round.cards.length) {
            callbacks.onCorrect(!hadMistake, 'Awesome flexibility! You switched rules without getting tricked.');
          } else {
            callbacks.playCorrect();
            cardTimer = setTimeout(() => {
              cardTimer = null;
              showCard();
            }, 360);
          }
        } else {
          hadMistake = true;
          callbacks.playRetry();
          btn.classList.add('is-wrong');
          btn.disabled = true;
          const hint = isBool ? card.boolRule.tip : `Check the rule banner: right now we sort by ${card.activeRule.toUpperCase()}!`;
          msgEl.innerHTML = `<div class="feedback-banner retry" style="padding:8px 14px;">${hint}</div>`;
        }
      });
      binsEl.appendChild(btn);
    });
  }

  showCard();
}
