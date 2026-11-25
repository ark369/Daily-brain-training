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

function buildWarmupItems(tier) {
  if (tier === 1) {
    // Making 10 & Doubles within 15 with Ten-Frame visual
    const pairs = shuffle([
      { a: 8, b: 4, tip: 'Fill the 10-frame! Take 2 from 4 to make 10, then add 2 more → 12.' },
      { a: 7, b: 5, tip: 'Take 3 from 5 to fill the 10-frame (10), then add the 2 left → 12.' },
      { a: 6, b: 6, tip: 'Doubles! 5 + 5 is 10, plus 2 more makes 12.' },
      { a: 9, b: 4, tip: '9 only needs 1 to make 10! So 9 + 4 is the same as 10 + 3 = 13.' },
      { a: 8, b: 3, tip: 'Take 2 from 3 to make 10, leaving 1 → 11.' },
    ]).slice(0, 3);

    return pairs.map((p) => ({
      phase: 'warmup',
      factKey: `${p.a}+${p.b}`,
      equation: `${p.a} + ${p.b} = ?`,
      answer: p.a + p.b,
      visual: { type: 'tenframe', a: p.a, b: p.b },
      strategyTip: p.tip,
    }));
  }

  if (tier === 2) {
    const items = shuffle([
      { a: 6, b: 4, splitA: 5, splitB: 1, tip: 'Split 6 × 4 into (5 × 4) + (1 × 4) = 20 + 4 = 24!' },
      { a: 7, b: 3, splitA: 5, splitB: 2, tip: 'Split 7 × 3 into (5 × 3) + (2 × 3) = 15 + 6 = 21!' },
      { a: 6, b: 3, splitA: 5, splitB: 1, tip: 'Split 6 × 3 into (5 × 3) + (1 × 3) = 15 + 3 = 18!' },
      { a: 4, b: 6, splitA: 2, splitB: 2, tip: 'Double-double! 2 × 6 = 12, then double it to get 24!' },
    ]).slice(0, 3);

    return items.map((p) => ({
      phase: 'warmup',
      factKey: `${p.a}x${p.b}`,
      equation: `${p.a} × ${p.b} = ?`,
      answer: p.a * p.b,
      visual: { type: 'splitarray', rows: p.b, colsA: p.splitA, colsB: p.splitB },
      strategyTip: p.tip,
    }));
  }

  if (tier === 3) {
    // Hardest multiplication pairs (4s–9s) with distributive split-area visual
    const items = shuffle([
      { a: 7, b: 6, splitA: 5, splitB: 2, tip: 'Split 7 × 6 into (5 × 6) + (2 × 6) = 30 + 12 = 42!' },
      { a: 8, b: 7, splitA: 5, splitB: 3, tip: 'Split 8 × 7 into (5 × 7) + (3 × 7) = 35 + 21 = 56!' },
      { a: 9, b: 6, splitA: 5, splitB: 4, tip: 'Think (10 × 6) − 6 = 60 − 6 = 54, or (5 × 6) + (4 × 6)!' },
      { a: 7, b: 4, splitA: 5, splitB: 2, tip: 'Split 7 × 4 into (5 × 4) + (2 × 4) = 20 + 8 = 28!' },
      { a: 8, b: 6, splitA: 5, splitB: 3, tip: 'Split 8 × 6 into (5 × 6) + (3 × 6) = 30 + 18 = 48!' },
    ]).slice(0, 3);

    return items.map((p) => ({
      phase: 'warmup',
      factKey: `${p.a}x${p.b}`,
      equation: `${p.a} × ${p.b} = ?`,
      answer: p.a * p.b,
      visual: { type: 'splitarray', rows: p.b, colsA: p.splitA, colsB: p.splitB },
      strategyTip: p.tip,
    }));
  }

  // Tier 4: Mental decomposition strategies
  const items = shuffle([
    { eq: '14 × 6 = ?', ans: 84, key: '14x6', tip: 'Split 14 into 10 + 4: (10 × 6) + (4 × 6) = 60 + 24 = 84.' },
    { eq: '16 × 5 = ?', ans: 80, key: '16x5', tip: 'Half of 16 is 8, times 10 is 80!' },
    { eq: '99 + 47 = ?', ans: 146, key: '99+47', tip: 'Add 100 to 47 (147), then subtract 1 → 146!' },
    { eq: '12 × 8 = ?', ans: 96, key: '12x8', tip: 'Split 12 into 10 + 2: (10 × 8) + (2 × 8) = 80 + 16 = 96.' },
  ]).slice(0, 3);

  return items.map((p) => ({
    phase: 'warmup',
    factKey: p.key,
    equation: p.eq,
    answer: p.ans,
    visual: { type: 'text', label: p.tip.split(':')[0] },
    strategyTip: p.tip,
  }));
}

function buildFactPool(tier) {
  const pool = [];
  if (tier === 1) {
    // Addition & gentle subtraction within 10–14
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        if (a + b <= 12) {
          pool.push({ factKey: `${a}+${b}`, equation: `${a} + ${b} = ?`, answer: a + b, a, b, op: '+' });
        }
      }
    }
    for (let a = 5; a <= 10; a++) {
      for (let b = 1; b <= 4; b++) {
        pool.push({ factKey: `${a}-${b}`, equation: `${a} − ${b} = ?`, answer: a - b, a, b, op: '-' });
      }
    }
  } else if (tier === 2) {
    // Add/sub within 20 + foundational multiplication (2, 3, 4, 5, 10)
    for (let a = 6; a <= 9; a++) {
      for (let b = 4; b <= 9; b++) {
        pool.push({ factKey: `${a}+${b}`, equation: `${a} + ${b} = ?`, answer: a + b, a, b, op: '+' });
        pool.push({ factKey: `${a + b}-${a}`, equation: `${a + b} − ${a} = ?`, answer: b, a: a + b, b: a, op: '-' });
      }
    }
    for (const m of [2, 3, 4, 5, 10]) {
      for (let k = 2; k <= 9; k++) {
        pool.push({ factKey: `${m}x${k}`, equation: `${m} × ${k} = ?`, answer: m * k, a: m, b: k, op: 'x' });
      }
    }
  } else if (tier === 3) {
    // Full multiplication & division, weighting the research-identified hard pairs (4–9)
    for (let a = 3; a <= 9; a++) {
      for (let b = 4; b <= 9; b++) {
        pool.push({ factKey: `${a}x${b}`, equation: `${a} × ${b} = ?`, answer: a * b, a, b, op: 'x' });
        if (a >= 4 && b >= 4) {
          // Double weight for 4s–9s hard pairs (Burns et al., 2015)
          pool.push({ factKey: `${a}x${b}`, equation: `${a} × ${b} = ?`, answer: a * b, a, b, op: 'x' });
        }
        pool.push({ factKey: `${a * b}/${a}`, equation: `${a * b} ÷ ${a} = ?`, answer: b, a: a * b, b: a, op: '/' });
      }
    }
  } else {
    // Tier 4: Extended multiplication (up to 12x12), division, and mental arithmetic
    for (let a = 6; a <= 12; a++) {
      for (let b = 4; b <= 12; b++) {
        pool.push({ factKey: `${a}x${b}`, equation: `${a} × ${b} = ?`, answer: a * b, a, b, op: 'x' });
        pool.push({ factKey: `${a * b}/${a}`, equation: `${a * b} ÷ ${a} = ?`, answer: b, a: a * b, b: a, op: '/' });
      }
    }
    for (let i = 0; i < 16; i++) {
      const a = randInt(25, 89);
      const b = pickOne([9, 11, 15, 19, 25]);
      pool.push({ factKey: `${a}+${b}`, equation: `${a} + ${b} = ?`, answer: a + b, a, b, op: '+' });
    }
  }
  return pool;
}

function selectFluencyQueue(tier, profile, count = 35) {
  const pool = buildFactPool(tier);
  const byKey = new Map();
  pool.forEach((f) => byKey.set(f.factKey, f));

  const queue = [];
  // Surface kid's previously missed or hesitant (>3.2s) facts first!
  if (profile) {
    const tricky = getTrickyFacts(profile, 8);
    for (const tf of tricky) {
      if (byKey.has(tf.key)) {
        queue.push(byKey.get(tf.key));
      }
    }
  }

  const shuffled = shuffle(pool);
  for (const item of shuffled) {
    if (queue.length >= count) break;
    // Avoid immediate duplicate back-to-back
    if (queue.length === 0 || queue[queue.length - 1].factKey !== item.factKey) {
      queue.push(item);
    }
  }
  return queue;
}

export function generateSession(tier = 1, profile = null) {
  const warmups = buildWarmupItems(tier);
  const fluencyQueue = selectFluencyQueue(tier, profile, 36);
  const useTimedSprint = tier >= 2 && !(profile && profile.calmMode);
  const prevBest = profile?.gameStats?.[meta.id]?.bestScore || 0;

  return [
    {
      kind: 'fact-studio-flow',
      tier,
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
        const elapsed = performance.now() - itemStartTs;
        if (callbacks.profile) {
          recordFactAttempt(callbacks.profile, item.factKey, val === item.answer, elapsed);
        }
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
