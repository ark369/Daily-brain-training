/**
 * Rule Switcher (Analyze Pillar — Cognitive Flexibility & Logical Pattern Deduction)
 * Combines:
 *  - Active Rule-Switch Sorting (inspired by Dimensional Change Card Sort — switching
 *    between Color, Shape, Count, or Boolean compound rules mid-round!).
 *  - Pattern Detective (visual ABAB / growing / multi-attribute sequences & 3x3 logic matrices).
 */

import { randInt, pickOne, shuffle } from './utils.js';

export const meta = {
  id: 'rule-switcher',
  title: 'Rule Switcher',
  pillar: 'analyze',
  pillarLabel: 'Analyze',
  shortDesc: 'Switch sorting rules on the fly and crack visual & number logic patterns.',
  scienceNote: 'Practices flexible rule shifting, logical classification, and structured pattern deduction.',
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

function makeSortRound(tier) {
  if (tier <= 2) {
    // Classic cognitive-flexibility rule switch: 2 cards under Rule A, then switch to Rule B!
    const dims = tier === 1 ? shuffle(['color', 'shape']) : shuffle(['color', 'shape', 'count']).slice(0, 2);
    const [ruleA, ruleB] = dims;

    const makeCard = () => ({
      color: pickOne(COLORS.slice(0, tier === 1 ? 2 : 3)).id,
      shape: pickOne(SHAPES.slice(0, tier === 1 ? 2 : 3)).id,
      count: tier === 1 ? 1 : randInt(1, 3),
    });

    const cards = [
      { ...makeCard(), activeRule: ruleA, switched: false },
      { ...makeCard(), activeRule: ruleA, switched: false },
      { ...makeCard(), activeRule: ruleB, switched: true },
      { ...makeCard(), activeRule: ruleB, switched: false },
    ];

    const binsForRule = (rule) => {
      if (rule === 'color') {
        return COLORS.slice(0, tier === 1 ? 2 : 3).map((c) => ({
          id: c.id,
          label: c.label,
          swatch: c.fill,
        }));
      }
      if (rule === 'shape') {
        return SHAPES.slice(0, tier === 1 ? 2 : 3).map((s) => ({
          id: s.id,
          label: s.label,
        }));
      }
      return [
        { id: '1', label: '1 Shape' },
        { id: '2', label: '2 Shapes' },
        { id: '3', label: '3 Shapes' },
      ];
    };

    return {
      kind: 'sort-switch',
      cards,
      binsForRule,
      prompt: 'Watch the active rule carefully — it switches mid-round!',
      speakPrompt: 'Sort each card into the right bin! Listen closely, because the sorting rule will switch halfway through!',
      strategyTip:
        'Pause for one second before tapping! Say the active rule out loud ("Sort by SHAPE!") so your fingers do not stay on autopilot.',
    };
  }

  // Tiers 3–4: Boolean compound rule switching (AND / OR / NOT)
  const rules = shuffle([
    {
      label: 'Teal AND Triangle',
      test: (c) => c.color === 'teal' && c.shape === 'triangle',
      tip: 'BOTH parts must be true: it must be Teal AND a Triangle.',
    },
    {
      label: 'Coral OR has 3 shapes',
      test: (c) => c.color === 'coral' || c.count === 3,
      tip: 'EITHER part works: Coral (any count) OR 3 shapes (any color)!',
    },
    {
      label: 'NOT Gold, AND Square',
      test: (c) => c.color !== 'gold' && c.shape === 'square',
      tip: 'Check two things: skip Gold, and make sure the shape is a Square.',
    },
    {
      label: 'Odd count (1 or 3) AND Circle',
      test: (c) => (c.count === 1 || c.count === 3) && c.shape === 'circle',
      tip: 'Check both: must be a Circle, and count must be 1 or 3 (not 2).',
    },
  ]).slice(0, 2);

  const cards = [];
  for (let rIdx = 0; rIdx < 2; rIdx++) {
    const rule = rules[rIdx];
    // Generate 1 guaranteed match and 1 guaranteed non-match for each rule, then shuffle the pair
    const pair = [];
    for (let wantMatch of [true, false]) {
      let c = null;
      for (let tries = 0; tries < 80; tries++) {
        const cand = {
          color: pickOne(COLORS).id,
          shape: pickOne(SHAPES).id,
          count: randInt(1, 3),
        };
        if (rule.test(cand) === wantMatch) {
          c = cand;
          break;
        }
      }
      pair.push({ ...c, boolRule: rule, wantMatch });
    }
    const ordered = shuffle(pair);
    ordered.forEach((card, i) => {
      cards.push({ ...card, switched: rIdx === 1 && i === 0 });
    });
  }

  return {
    kind: 'sort-bool',
    cards,
    prompt: 'Does the card match the Logic Rule?',
    speakPrompt: 'Check if each card matches the logic rule! Watch closely when the rule switches!',
    strategyTip: 'Test each condition one by one — for AND both must be true; for OR at least one must be true!',
  };
}

function makeVisualPatternRound(tier) {
  if (tier === 1) {
    // ABAB or AABAAB crisp sequence
    const [c1, c2] = shuffle(COLORS).slice(0, 2);
    const [s1, s2] = shuffle(SHAPES).slice(0, 2);
    const a = { color: c1.id, shape: s1.id, count: 1 };
    const b = { color: c2.id, shape: s2.id, count: 1 };
    const isAAB = Math.random() < 0.45;
    const seq = isAAB ? [a, a, b, a, a] : [a, b, a, b, a];
    const answer = b;
    const distractors = [
      a,
      { color: c1.id, shape: s2.id, count: 1 },
      { color: c2.id, shape: s1.id, count: 1 },
    ];
    const options = shuffle([
      { token: answer, isCorrect: true },
      ...distractors.map((t) => ({ token: t, isCorrect: false })),
    ]);

    return {
      kind: 'pattern-visual',
      seq,
      options,
      correctIdx: options.findIndex((o) => o.isCorrect),
      prompt: 'What tile comes next in the pattern?',
      speakPrompt: 'Look at the pattern from left to right. Which tile comes next?',
      strategyTip: 'Say the pattern out loud with a rhythm (like "circle, square, circle, square...") to hear what comes next!',
    };
  }

  if (tier === 2) {
    // Number pattern (skip counting or growing)
    const patterns = [
      () => {
        const start = randInt(2, 10);
        const step = pickOne([2, 3, 4, 5, 10]);
        const seq = [0, 1, 2, 3].map((i) => start + i * step);
        return {
          seq,
          answer: start + 4 * step,
          tip: `Find the jump between neighbors: each number adds +${step}!`,
        };
      },
      () => {
        const start = randInt(25, 45);
        const step = pickOne([3, 4, 5]);
        const seq = [0, 1, 2, 3].map((i) => start - i * step);
        return {
          seq,
          answer: start - 4 * step,
          tip: `This pattern counts DOWN! Each step subtracts ${step}.`,
        };
      },
    ];
    const p = pickOne(patterns)();
    const set = new Set([p.answer]);
    for (const off of [-3, -2, -1, 1, 2, 3, 5]) {
      if (set.size >= 4) break;
      if (p.answer + off > 0) set.add(p.answer + off);
    }
    const choices = Array.from(set).sort((a, b) => a - b);

    return {
      kind: 'pattern-number',
      seq: p.seq,
      choices,
      answer: p.answer,
      prompt: 'Crack the number rule! What number comes next?',
      speakPrompt: `Look at the numbers: ${p.seq.join(', ')}. What number comes next?`,
      strategyTip: p.tip,
    };
  }

  if (tier === 3) {
    // Alternating rich number patterns or 3x3 Latin-square logic matrix!
    if (Math.random() < 0.5) {
      const seqPatterns = [
        { seq: [2, 4, 8, 16], answer: 32, tip: 'Each number doubles (× 2)!' },
        { seq: [1, 4, 9, 16], answer: 25, tip: 'Look at the jumps: +3, +5, +7... next jump is +9 (or square numbers 1², 2², 3², 4², 5²)!' },
        { seq: [3, 6, 11, 18], answer: 27, tip: 'The jump grows by 2 each time: +3, +5, +7, so next is +9!' },
        { seq: [2, 5, 11, 23], answer: 47, tip: 'Double and add 1 each step (2×2+1=5, 5×2+1=11, 23×2+1=47)!' },
        { seq: [1, 2, 4, 7, 11], answer: 16, tip: 'The jumps grow by 1 each time: +1, +2, +3, +4, so next is +5!' },
      ];
      const p = pickOne(seqPatterns);
      const choices = shuffle(
        Array.from(new Set([p.answer, p.answer - 2, p.answer + 2, p.answer + 4, p.answer - 4])).slice(0, 4)
      ).sort((a, b) => a - b);
      return {
        kind: 'pattern-number',
        seq: p.seq,
        choices,
        answer: p.answer,
        prompt: 'Find the hidden number rule! What comes next?',
        speakPrompt: `Find the hidden number rule: ${p.seq.join(', ')}. What comes next?`,
        strategyTip: p.tip,
      };
    }
  }

  // 3x3 Latin-square Visual Logic Matrix (Tier 3 & Tier 4)
  const colorOrder = shuffle(COLORS).map((c) => c.id);
  const shapeOrder = shuffle(SHAPES).map((s) => s.id);
  const countOrder = shuffle([1, 2, 3]);

  const cells = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cells.push({
        color: colorOrder[(r + c) % 3],
        shape: shapeOrder[(r + 2 * c) % 3],
        count: tier >= 4 ? countOrder[(r + c) % 3] : 1,
      });
    }
  }
  const answer = cells[8];
  const distractors = [
    { ...answer, color: colorOrder[(colorOrder.indexOf(answer.color) + 1) % 3] },
    { ...answer, shape: shapeOrder[(shapeOrder.indexOf(answer.shape) + 1) % 3] },
    {
      color: colorOrder[(colorOrder.indexOf(answer.color) + 2) % 3],
      shape: shapeOrder[(shapeOrder.indexOf(answer.shape) + 2) % 3],
      count: answer.count,
    },
  ];
  const options = shuffle([
    { token: answer, isCorrect: true },
    ...distractors.map((t) => ({ token: t, isCorrect: false })),
  ]);

  return {
    kind: 'pattern-matrix',
    cells: cells.slice(0, 8),
    options,
    correctIdx: options.findIndex((o) => o.isCorrect),
    prompt: 'Every row has all 3 colors and all 3 shapes. Which tile fits the "?"?',
    speakPrompt: 'Every row has all three colors and all three shapes. Which tile completes the bottom right corner?',
    strategyTip:
      'Look at the bottom row alone! Check which COLOR is missing first, then check which SHAPE is missing.',
  };
}

export function generateSession(tier = 1) {
  return [
    makeSortRound(tier),
    makeVisualPatternRound(tier),
    makeVisualPatternRound(tier),
    makeSortRound(tier),
    makeVisualPatternRound(tier),
  ];
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

  if (round.kind === 'pattern-visual') {
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
    round.cells.forEach((tok) => {
      const tile = document.createElement('div');
      tile.className = 'pattern-tile';
      tile.innerHTML = renderTokenSvg(tok, 54);
      mat.appendChild(tile);
    });
    const mystery = document.createElement('div');
    mystery.className = 'pattern-tile mystery';
    mystery.textContent = '?';
    mat.appendChild(mystery);
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
          mystery.innerHTML = renderTokenSvg(opt.token, 54);
          callbacks.onCorrect(!hadMistake, 'Brilliant logical deduction! Every row and attribute aligns.');
        } else {
          hadMistake = true;
          btn.classList.add('is-wrong');
          btn.disabled = true;
          callbacks.onRetry('Check the bottom row: which color is missing, and which shape is missing?');
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

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '16px';
  wrap.style.width = '100%';
  container.appendChild(wrap);

  function showCard() {
    const card = round.cards[cardIdx];
    const isBool = round.kind === 'sort-bool';

    if (card.switched) {
      callbacks.playSwitch();
    }

    const ruleText = isBool
      ? `Rule: ${card.boolRule.label}`
      : `Sort by: ${card.activeRule.toUpperCase()}`;

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
        const expected = isBool
          ? card.wantMatch
            ? 'yes'
            : 'no'
          : String(card[card.activeRule]);

        if (bin.id === expected) {
          btn.classList.add('is-correct');
          cardIdx += 1;
          if (cardIdx >= round.cards.length) {
            callbacks.onCorrect(!hadMistake, 'Awesome flexibility! You switched rules without getting tricked.');
          } else {
            callbacks.playCorrect();
            setTimeout(showCard, 360);
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
