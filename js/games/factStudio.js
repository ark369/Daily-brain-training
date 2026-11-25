/**
 * Fact Studio (Compute Pillar — Strategy-First Math Fluency + Spaced Retrieval)
 * Directly implements:
 *  - Phase 1 (Always Untimed): 3 visual strategy warm-ups (Ten-Frames for Make-10/Doubles,
 *    Split-Area Multiplication Arrays for distributive reasoning).
 *  - Phase 2 (Fluency Practice):
 *      * Tier 1 (Sprout) OR Calm Mode ON -> Strictly untimed 6-item practice.
 *      * Tiers 2–4 (Calm Mode OFF) -> Evidence-backed 60-second self-referenced Fluency Sprint
 *        (IES Practice Guide 2021, Recommendation 6) with calm progress bar and
 *        background latency tracking to resurface hesitant/missed facts on future days.
 */

import { randInt, pickOne, shuffle } from './utils.js';
import { recordFactAttempt, getTrickyFacts } from '../storage.js';

export const meta = {
  id: 'fact-studio',
  title: 'Fact Studio',
  pillar: 'compute',
  pillarLabel: 'Compute',
  shortDesc: 'Visual thinking strategies first, then smooth spaced-retrieval math fluency.',
  scienceNote: 'Strategy + brief self-referenced fluency builds automatic recall that frees working memory (IES 2021).',
  timed: true, // Tier 2–4 fluency phase uses calm 60s sprint unless Calm Mode is enabled
};

// Tracks recently shown warm-up and fluency facts per profile+tier so replays stay fresh
const recentWarmupMap = new Map();
const recentFluencyMap = new Map();

function getRecentSet(map, key) {
  if (!map.has(key)) map.set(key, new Set());
  return map.get(key);
}

function buildWarmupPool(tier) {
  const pool = [];

  if (tier === 1) {
    // Procedural Make-10 (sums 11–17) & Doubles (4+4 through 9+9) with Ten-Frame visuals
    for (let a = 6; a <= 9; a++) {
      for (let b = 2; b <= a; b++) {
        if (a + b >= 11 && a + b <= 17 && a !== b) {
          const need = 10 - a;
          const rem = b - need;
          pool.push({
            factKey: `${a}+${b}`,
            equation: `${a} + ${b} = ?`,
            answer: a + b,
            visual: { type: 'tenframe', a, b },
            strategyTip: `Fill the 10-frame! Take ${need} from ${b} to make 10, then add the ${rem} left → ${a + b}.`,
          });
        }
      }
    }
    for (let d = 4; d <= 9; d++) {
      const tip =
        d <= 5
          ? `Doubles! Two equal groups of ${d} make ${d + d}.`
          : `Doubles! (5 + 5) makes 10, plus (${d - 5} + ${d - 5}) makes ${d + d}!`;
      pool.push({
        factKey: `${d}+${d}`,
        equation: `${d} + ${d} = ?`,
        answer: d + d,
        visual: { type: 'tenframe', a: d, b: d },
        strategyTip: tip,
      });
    }
    return pool;
  }

  if (tier === 2) {
    // Procedural Split-Array multiplication warm-ups (2s–6s × 4, 6, 7, 8, 9)
    const splits = [
      { cols: 4, splitA: 2, splitB: 2, makeTip: (r) => `Double-double! (2 × ${r}) = ${2 * r}, double it → ${4 * r}!` },
      { cols: 6, splitA: 5, splitB: 1, makeTip: (r) => `Split 6 × ${r} into (5 × ${r}) + (1 × ${r}) = ${5 * r} + ${r} = ${6 * r}!` },
      { cols: 7, splitA: 5, splitB: 2, makeTip: (r) => `Split 7 × ${r} into (5 × ${r}) + (2 × ${r}) = ${5 * r} + ${2 * r} = ${7 * r}!` },
      { cols: 8, splitA: 5, splitB: 3, makeTip: (r) => `Split 8 × ${r} into (5 × ${r}) + (3 × ${r}) = ${5 * r} + ${3 * r} = ${8 * r}!` },
      { cols: 9, splitA: 5, splitB: 4, makeTip: (r) => `Think (10 × ${r}) − ${r} = ${10 * r} − ${r} = ${9 * r}, or (5 × ${r}) + (4 × ${r})!` },
    ];
    for (let rows = 2; rows <= 6; rows++) {
      for (const s of splits) {
        if (s.cols * rows > 54) continue;
        pool.push({
          factKey: `${s.cols}x${rows}`,
          equation: `${s.cols} × ${rows} = ?`,
          answer: s.cols * rows,
          visual: { type: 'splitarray', rows, colsA: s.splitA, colsB: s.splitB },
          strategyTip: s.makeTip(rows),
        });
      }
    }
    return pool;
  }

  if (tier === 3) {
    // Procedural Split-Area multiplication warm-ups across hard pairs (4–9 × 4–9)
    const splits = [
      { cols: 4, splitA: 2, splitB: 2, makeTip: (r) => `Double-double! 2 × ${r} = ${2 * r}, then double again → ${4 * r}!` },
      { cols: 6, splitA: 5, splitB: 1, makeTip: (r) => `Split 6 × ${r} into (5 × ${r}) + (1 × ${r}) = ${5 * r} + ${r} = ${6 * r}!` },
      { cols: 7, splitA: 5, splitB: 2, makeTip: (r) => `Split 7 × ${r} into (5 × ${r}) + (2 × ${r}) = ${5 * r} + ${2 * r} = ${7 * r}!` },
      { cols: 8, splitA: 5, splitB: 3, makeTip: (r) => `Split 8 × ${r} into (5 × ${r}) + (3 × ${r}) = ${5 * r} + ${3 * r} = ${8 * r}!` },
      { cols: 9, splitA: 5, splitB: 4, makeTip: (r) => `Think (10 × ${r}) − ${r} = ${10 * r} − ${r} = ${9 * r}, or (5 × ${r}) + (4 × ${r})!` },
    ];
    for (let rows = 4; rows <= 9; rows++) {
      for (const s of splits) {
        if (s.cols === 4 && rows < 6) continue;
        pool.push({
          factKey: `${s.cols}x${rows}`,
          equation: `${s.cols} × ${rows} = ?`,
          answer: s.cols * rows,
          visual: { type: 'splitarray', rows, colsA: s.splitA, colsB: s.splitB },
          strategyTip: s.makeTip(rows),
        });
      }
    }
    return pool;
  }

  // Tier 4: Procedural mental decomposition across 4 real strategies (~40 items)
  for (const a of [12, 13, 14, 15, 16, 17, 18, 19]) {
    for (const b of [4, 6, 7, 8]) {
      const ones = a - 10;
      pool.push({
        factKey: `${a}x${b}`,
        equation: `${a} × ${b} = ?`,
        answer: a * b,
        visual: { type: 'text', label: `Split ${a} into 10 + ${ones}` },
        strategyTip: `Split ${a} into 10 + ${ones}: (10 × ${b}) + (${ones} × ${b}) = ${10 * b} + ${ones * b} = ${a * b}.`,
      });
    }
  }
  for (const even of [14, 16, 18, 22, 24, 26, 28, 34]) {
    pool.push({
      factKey: `${even}x5`,
      equation: `${even} × 5 = ?`,
      answer: even * 5,
      visual: { type: 'text', label: `Half of ${even}, then × 10` },
      strategyTip: `Half of ${even} is ${even / 2}; times 10 is ${even * 5}!`,
    });
  }
  for (const [base, adj, add] of [
    [99, 1, 37],
    [99, 1, 48],
    [99, 1, 64],
    [98, 2, 45],
    [98, 2, 57],
    [49, 1, 36],
    [49, 1, 58],
    [199, 1, 43],
  ]) {
    const rounded = base + adj;
    pool.push({
      factKey: `${base}+${add}`,
      equation: `${base} + ${add} = ?`,
      answer: base + add,
      visual: { type: 'text', label: `Add ${rounded}, then − ${adj}` },
      strategyTip: `Add ${rounded} + ${add} = ${rounded + add}, then subtract ${adj} → ${base + add}!`,
    });
  }
  return pool;
}

function selectWarmupItems(tier, profile) {
  const pool = buildWarmupPool(tier);
  const scopeKey = `${profile?.id || 'anon'}:${tier}`;
  const recent = getRecentSet(recentWarmupMap, scopeKey);

  let candidates = pool.filter((item) => !recent.has(item.factKey));
  if (candidates.length < 3) {
    recent.clear();
    candidates = pool;
  }

  const chosen = shuffle(candidates).slice(0, 3);
  chosen.forEach((c) => recent.add(c.factKey));
  if (recent.size > Math.max(9, pool.length - 4)) {
    recent.clear();
    chosen.forEach((c) => recent.add(c.factKey));
  }

  return chosen.map((p) => ({ ...p, phase: 'warmup' }));
}

function buildFactPool(tier) {
  const map = new Map();
  const add = (item) => {
    if (!map.has(item.factKey)) map.set(item.factKey, item);
  };

  if (tier === 1) {
    // Addition within 14 & gentle subtraction within 12 (~85 unique facts)
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        if (a + b <= 14) {
          add({ factKey: `${a}+${b}`, equation: `${a} + ${b} = ?`, answer: a + b, a, b, op: '+' });
        }
      }
    }
    for (let a = 4; a <= 12; a++) {
      for (let b = 1; b <= Math.min(5, a - 1); b++) {
        add({ factKey: `${a}-${b}`, equation: `${a} − ${b} = ?`, answer: a - b, a, b, op: '-' });
      }
    }
  } else if (tier === 2) {
    // Add/sub within 20 + foundational multiplication (2, 3, 4, 5, 10) (~96 unique facts)
    for (let a = 5; a <= 9; a++) {
      for (let b = 3; b <= 9; b++) {
        add({ factKey: `${a}+${b}`, equation: `${a} + ${b} = ?`, answer: a + b, a, b, op: '+' });
        add({ factKey: `${a + b}-${a}`, equation: `${a + b} − ${a} = ?`, answer: b, a: a + b, b: a, op: '-' });
      }
    }
    for (const m of [2, 3, 4, 5, 10]) {
      for (let k = 2; k <= 9; k++) {
        add({ factKey: `${m}x${k}`, equation: `${m} × ${k} = ?`, answer: m * k, a: m, b: k, op: 'x' });
      }
    }
  } else if (tier === 3) {
    // Full multiplication & division; tag research-identified hard pairs (4–9 × 4–9) without duplicating keys
    for (let a = 3; a <= 9; a++) {
      for (let b = 3; b <= 9; b++) {
        if (a === 3 && b === 3) continue;
        add({
          factKey: `${a}x${b}`,
          equation: `${a} × ${b} = ?`,
          answer: a * b,
          a,
          b,
          op: 'x',
          isHardPair: a >= 4 && b >= 4,
        });
        add({
          factKey: `${a * b}/${a}`,
          equation: `${a * b} ÷ ${a} = ?`,
          answer: b,
          a: a * b,
          b: a,
          op: '/',
          isHardPair: false,
        });
      }
    }
  } else {
    // Tier 4: Extended multiplication (up to 12x12), division, and mental arithmetic (~140 unique facts)
    for (let a = 6; a <= 12; a++) {
      for (let b = 4; b <= 12; b++) {
        add({ factKey: `${a}x${b}`, equation: `${a} × ${b} = ?`, answer: a * b, a, b, op: 'x' });
        add({ factKey: `${a * b}/${a}`, equation: `${a * b} ÷ ${a} = ?`, answer: b, a: a * b, b: a, op: '/' });
      }
    }
    for (let i = 0; i < 24; i++) {
      const a = randInt(24, 89);
      const b = pickOne([9, 11, 15, 19, 25]);
      add({ factKey: `${a}+${b}`, equation: `${a} + ${b} = ?`, answer: a + b, a, b, op: '+' });
    }
  }
  return Array.from(map.values());
}

function selectFluencyQueue(tier, profile, warmupKeys = new Set(), count = 60) {
  const pool = buildFactPool(tier);
  const byKey = new Map(pool.map((f) => [f.factKey, f]));
  const scopeKey = `${profile?.id || 'anon'}:${tier}`;
  const recent = getRecentSet(recentFluencyMap, scopeKey);

  // 1. Gather up to 5 genuinely tricky facts (missed or hesitant >3.2s), skipping ones just done in warm-up
  const trickyItems = [];
  const usedKeys = new Set();
  if (profile) {
    const tricky = getTrickyFacts(profile, 8);
    for (const tf of tricky) {
      if (trickyItems.length >= 5) break;
      if (byKey.has(tf.key) && !warmupKeys.has(tf.key) && !usedKeys.has(tf.key)) {
        trickyItems.push(byKey.get(tf.key));
        usedKeys.add(tf.key);
      }
    }
  }

  // 2. Partition remaining pool into fresh (not recently seen) vs earlier-seen so replays feel brand-new
  const remaining = pool.filter((item) => !usedKeys.has(item.factKey) && !warmupKeys.has(item.factKey));
  let fresh = remaining.filter((item) => !recent.has(item.factKey));
  let older = remaining.filter((item) => recent.has(item.factKey));
  if (fresh.length < 18) {
    recent.clear();
    fresh = remaining;
    older = [];
  }

  // In Tier 3, weight research-identified hard pairs (4–9 × 4–9) ~65% without any duplicates
  const orderBucket = (bucket) => {
    if (tier !== 3) return shuffle(bucket);
    const hard = shuffle(bucket.filter((f) => f.isHardPair));
    const other = shuffle(bucket.filter((f) => !f.isHardPair));
    const mixed = [];
    let hi = 0;
    let oi = 0;
    while (hi < hard.length || oi < other.length) {
      if (hi < hard.length) mixed.push(hard[hi++]);
      if (hi < hard.length) mixed.push(hard[hi++]);
      if (oi < other.length) mixed.push(other[oi++]);
    }
    return mixed;
  };

  const baseOrder = [...orderBucket(fresh), ...orderBucket(older)];
  const targetLen = Math.min(count, baseOrder.length + trickyItems.length);
  const queue = baseOrder.slice(0, Math.max(0, targetLen - trickyItems.length));

  // 3. Interleave genuinely tricky facts at spaced positions (#2, #6, #10, #14, #18) instead of clumping at #0
  const spacedSlots = [2, 6, 10, 14, 18];
  trickyItems.forEach((item, idx) => {
    const pos = Math.min(queue.length, spacedSlots[idx] ?? queue.length);
    queue.splice(pos, 0, item);
  });

  return queue;
}

export function generateSession(tier = 1, profile = null) {
  const warmups = selectWarmupItems(tier, profile);
  const warmupKeys = new Set(warmups.map((w) => w.factKey));
  const fluencyQueue = selectFluencyQueue(tier, profile, warmupKeys, 60);
  const useTimedSprint = tier >= 2 && !(profile && profile.calmMode);
  const prevBest = profile?.gameStats?.[meta.id]?.bestScore || 0;

  return [
    {
      kind: 'fact-studio-flow',
      tier,
      scopeKey: `${profile?.id || 'anon'}:${tier}`,
      warmups,
      fluencyQueue,
      useTimedSprint,
      prevBest,
      prompt: 'Strategy Warm-Up (Untimed)',
      speakPrompt: 'First, let us do 3 quick untimed strategy warm-ups!',
      strategyTip:
        tier === 1
          ? 'Look at how the dots fill a full 10-frame first — making 10 makes adding super clear!'
          : 'Break tricky facts into friendlier pieces (like 5s and 2s, or 10s minus 1s)!',
    },
  ];
}

function renderTenFrameHtml(a, b) {
  // Show two 10-frames for sums > 10, or one 10-frame for <= 10
  const total = a + b;
  const framesCount = total > 10 ? 2 : 1;
  let html = '<div class="split-array-wrap">';
  for (let f = 0; f < framesCount; f++) {
    html += '<div class="ten-frame" aria-hidden="true">';
    for (let i = 0; i < 10; i++) {
      const idx = f * 10 + i;
      let dot = '';
      if (idx < a) dot = '<span class="ten-dot a"></span>';
      else if (idx < total) dot = '<span class="ten-dot b"></span>';
      html += `<div class="ten-cell">${dot}</div>`;
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function renderSplitArrayHtml(rows, colsA, colsB) {
  const makeGrid = (cols, cls) => {
    const dots = Array(rows * cols)
      .fill(`<span class="array-dot ${cls}"></span>`)
      .join('');
    return `
      <div style="text-align:center;">
        <div class="dot-array" style="grid-template-columns: repeat(${cols}, 14px);">${dots}</div>
        <div style="font-size:0.8rem;font-weight:600;color:var(--ink-secondary);margin-top:4px;">${cols} × ${rows} = ${cols * rows}</div>
      </div>
    `;
  };
  return `
    <div class="split-array-wrap">
      ${makeGrid(colsA, 'part-a')}
      <span class="morpheme-plus">+</span>
      ${makeGrid(colsB, 'part-b')}
    </div>
  `;
}

export function renderRound(container, round, callbacks) {
  let stagePhase = 'warmup'; // 'warmup' -> 'transition' -> 'fluency'
  let warmupIdx = 0;
  let fluencyIdx = 0;
  let fluencyCorrect = 0;
  let fluencyAttempts = 0;
  let warmupClean = 0;
  let typedVal = '';
  let itemStartTs = performance.now();
  let sprintTimerId = null;
  let secondsLeft = 60;
  let finished = false;
  let keydownHandler = null;

  const root = document.createElement('div');
  root.style.display = 'flex';
  root.style.flexDirection = 'column';
  root.style.alignItems = 'center';
  root.style.gap = '16px';
  root.style.width = '100%';
  container.appendChild(root);

  function cleanup() {
    if (sprintTimerId) {
      clearInterval(sprintTimerId);
      sprintTimerId = null;
    }
    if (keydownHandler) {
      window.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }
  }
  if (callbacks.registerCleanup) callbacks.registerCleanup(cleanup);

  function finishWholeGame() {
    if (finished) return;
    finished = true;
    cleanup();
    const totalCorrect = warmupClean + fluencyCorrect;
    const totalAttempts = round.warmups.length + Math.max(1, fluencyAttempts);
    const note = round.useTimedSprint
      ? `Fluency Sprint: ${fluencyCorrect} accurate answers in 60s!`
      : `Completed Strategy Warm-Up + ${fluencyCorrect} untimed fluency facts!`;
    callbacks.onCustomComplete({
      correct: round.useTimedSprint ? fluencyCorrect : totalCorrect,
      attempts: totalAttempts,
      masteryNote: note,
    });
  }

  function renderWarmup() {
    const item = round.warmups[warmupIdx];
    typedVal = '';
    itemStartTs = performance.now();
    let hadMistake = false;

    callbacks.setPrompt(
      `Strategy Warm-Up (${warmupIdx + 1} of ${round.warmups.length}) — Untimed`,
      item.strategyTip,
      `Strategy warm up: what is ${item.equation.replace('×', 'times').replace('−', 'minus').replace('?', '')}?`
    );

    let scaffoldHtml = '';
    if (item.visual.type === 'tenframe') {
      scaffoldHtml = renderTenFrameHtml(item.visual.a, item.visual.b);
    } else if (item.visual.type === 'splitarray') {
      scaffoldHtml = renderSplitArrayHtml(item.visual.rows, item.visual.colsA, item.visual.colsB);
    }

    const choices = shuffle(
      Array.from(
        new Set([
          item.answer,
          Math.max(1, item.answer - 1),
          item.answer + 1,
          item.answer + 2,
          Math.max(2, item.answer - 2),
          item.answer + 10,
        ])
      ).slice(0, 4)
    );
    if (!choices.includes(item.answer)) choices[0] = item.answer;

    root.innerHTML = `
      <span class="fact-phase-badge">Step 1 of 2 · Visual Strategy (No Timer)</span>
      <div class="fact-equation">${item.equation}</div>
      ${scaffoldHtml ? `<div class="fact-visual-scaffold">${scaffoldHtml}</div>` : ''}
      <div class="choice-grid cols-4" id="warmup-choices"></div>
      <div id="warmup-msg" style="min-height:28px;"></div>
    `;

    const choiceBox = root.querySelector('#warmup-choices');
    const msgBox = root.querySelector('#warmup-msg');

    choices.sort((a, b) => a - b).forEach((val) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.textContent = String(val);
      btn.addEventListener('click', () => {
        if (val === item.answer) {
          callbacks.playCorrect();
          btn.classList.add('is-correct');
          if (!hadMistake) warmupClean += 1;
          msgBox.innerHTML = `<div class="feedback-banner correct">${item.strategyTip}</div>`;
          Array.from(choiceBox.querySelectorAll('button')).forEach((b) => (b.disabled = true));
          setTimeout(() => {
            warmupIdx += 1;
            if (warmupIdx < round.warmups.length) {
              renderWarmup();
            } else {
              renderTransition();
            }
          }, 950);
        } else {
          hadMistake = true;
          callbacks.playRetry();
          btn.classList.add('is-wrong');
          btn.disabled = true;
          msgBox.innerHTML = `<div class="feedback-banner retry">Hint: ${item.strategyTip}</div>`;
        }
      });
      choiceBox.appendChild(btn);
    });
  }

  function renderTransition() {
    stagePhase = 'transition';
    callbacks.setPrompt(
      round.useTimedSprint ? 'Ready for a Calm 60-Second Fluency Sprint?' : 'Ready for Fluency Practice?',
      'Remember: smooth & accurate beats rushing! Tricky facts come back gently later.',
      round.useTimedSprint
        ? 'Great warm up! Ready for a calm 60 second fluency sprint? Try to be accurate and smooth.'
        : 'Great warm up! Now let us practice 6 smooth facts with no timer.'
    );

    const bestLine =
      round.useTimedSprint && round.prevBest > 0
        ? `<p style="color:var(--visualize-dark);font-weight:600;">Your personal best to beat: ${round.prevBest} accurate answers</p>`
        : '';

    root.innerHTML = `
      <div class="word-stage-card animate-pop">
        <span class="fact-phase-badge">Step 2 of 2 · ${round.useTimedSprint ? 'Calm 60s Personal-Best Sprint' : 'Untimed Fluency Practice'}</span>
        <h3>${round.useTimedSprint ? 'Accurate & Smooth!' : 'Take Your Time!'}</h3>
        <p class="word-clue">
          ${
            round.useTimedSprint
              ? 'Answer as many facts accurately as you comfortably can in 60 seconds. No penalty for mistakes — you can use the keypad or type on your keyboard!'
              : 'Solve 6 mixed math facts at your own comfortable pace. Tap the keypad or type your answer!'
          }
        </p>
        ${bestLine}
        <button type="button" class="btn btn-warm btn-lg" id="btn-start-fluency">
          ${round.useTimedSprint ? 'Start 60-Second Sprint' : 'Start Untimed Practice'}
        </button>
      </div>
    `;

    root.querySelector('#btn-start-fluency').addEventListener('click', () => {
      callbacks.playClick();
      startFluency();
    });
  }

  function startFluency() {
    stagePhase = 'fluency';
    fluencyIdx = 0;
    fluencyCorrect = 0;
    fluencyAttempts = 0;
    secondsLeft = 60;
    typedVal = '';

    callbacks.setPrompt(
      round.useTimedSprint ? 'Calm Fluency Sprint' : 'Untimed Fact Practice',
      'Use your thinking strategies! Accuracy always comes before speed.',
      ''
    );

    const untimedTarget = 6;

    root.innerHTML = `
      ${
        round.useTimedSprint
          ? `<div class="calm-timer-wrap">
              <div class="calm-timer-head">
                <span id="fluency-score-lbl">Accurate: 0</span>
                <span id="fluency-time-lbl">60s left</span>
              </div>
              <div class="calm-timer-track">
                <div class="calm-timer-fill" id="fluency-bar" style="width:100%"></div>
              </div>
            </div>`
          : `<span class="fact-phase-badge" id="fluency-untimed-lbl">Fact 1 of ${untimedTarget} · Untimed</span>`
      }
      <div class="fact-equation" id="fluency-eq"></div>
      <div class="fact-answer-display" id="fluency-input" aria-live="polite">&nbsp;</div>
      <div id="fluency-feedback" style="min-height:36px;"></div>
      <div class="fact-keypad" id="fact-keypad">
        ${['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'Go']
          .map(
            (k) =>
              `<button type="button" class="keypad-btn ${k === 'Go' ? 'action-go' : ''}" data-key="${k}">${k}</button>`
          )
          .join('')}
      </div>
    `;

    const eqEl = root.querySelector('#fluency-eq');
    const inputEl = root.querySelector('#fluency-input');
    const fbEl = root.querySelector('#fluency-feedback');
    const scoreLbl = root.querySelector('#fluency-score-lbl');
    const timeLbl = root.querySelector('#fluency-time-lbl');
    const barEl = root.querySelector('#fluency-bar');
    const untimedLbl = root.querySelector('#fluency-untimed-lbl');

    function currentFact() {
      return round.fluencyQueue[fluencyIdx % round.fluencyQueue.length];
    }

    function showCurrentFact() {
      const f = currentFact();
      if (round.scopeKey && f && f.factKey) {
        getRecentSet(recentFluencyMap, round.scopeKey).add(f.factKey);
      }
      typedVal = '';
      itemStartTs = performance.now();
      eqEl.textContent = f.equation;
      inputEl.textContent = '\u00A0';
      if (untimedLbl) {
        untimedLbl.textContent = `Fact ${Math.min(untimedTarget, fluencyIdx + 1)} of ${untimedTarget} · Untimed`;
      }
    }

    function submitAnswer() {
      if (finished || typedVal === '') return;
      const f = currentFact();
      const guess = Number(typedVal);
      const elapsed = performance.now() - itemStartTs;
      fluencyAttempts += 1;

      const isRight = guess === f.answer;
      if (callbacks.profile) {
        recordFactAttempt(callbacks.profile, f.factKey, isRight, elapsed);
      }

      if (isRight) {
        fluencyCorrect += 1;
        callbacks.playCorrect();
        fbEl.innerHTML = `<div class="feedback-banner correct" style="padding:6px 14px;">Nice! ${f.equation.replace('?', f.answer)}</div>`;
        if (scoreLbl) scoreLbl.textContent = `Accurate: ${fluencyCorrect}`;
        fluencyIdx += 1;
        if (!round.useTimedSprint && fluencyIdx >= untimedTarget) {
          setTimeout(finishWholeGame, 500);
          return;
        }
        showCurrentFact();
      } else {
        callbacks.playRetry();
        fbEl.innerHTML = `<div class="feedback-banner retry" style="padding:6px 14px;">Good try — ${f.equation.replace('?', f.answer)}. Let's keep going!</div>`;
        if (round.useTimedSprint) {
          // Non-punitive: show the right answer and move smoothly to the next fact
          fluencyIdx += 1;
          showCurrentFact();
        } else {
          // Untimed: let them type the right answer to reinforce it
          typedVal = '';
          inputEl.textContent = '\u00A0';
        }
      }
    }

    function handleKey(k) {
      if (finished) return;
      if (k === '⌫') {
        typedVal = typedVal.slice(0, -1);
        inputEl.textContent = typedVal || '\u00A0';
        callbacks.playClick();
      } else if (k === 'Go') {
        submitAnswer();
      } else if (/^\d$/.test(k) && typedVal.length < 3) {
        typedVal += k;
        inputEl.textContent = typedVal;
        callbacks.playClick();
      }
    }

    root.querySelectorAll('.keypad-btn').forEach((btn) => {
      btn.addEventListener('click', () => handleKey(btn.dataset.key));
    });

    keydownHandler = (e) => {
      if (stagePhase !== 'fluency' || finished) return;
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        handleKey(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKey('⌫');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleKey('Go');
      }
    };
    window.addEventListener('keydown', keydownHandler);

    if (round.useTimedSprint) {
      sprintTimerId = setInterval(() => {
        secondsLeft -= 1;
        if (timeLbl) timeLbl.textContent = `${Math.max(0, secondsLeft)}s left`;
        if (barEl) barEl.style.width = `${Math.max(0, (secondsLeft / 60) * 100)}%`;
        if (secondsLeft <= 0) {
          finishWholeGame();
        }
      }, 1000);
    }

    showCurrentFact();
  }

  renderWarmup();
}
