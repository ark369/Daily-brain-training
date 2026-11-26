/**
 * Shape Shifter (Visualize Pillar — Symmetry Painting & Predict-First Mental Rotation)
 * - Mirror Painter: Vertical (all tiers), Horizontal (Tiers 2–4), and Diagonal (Tiers 3–4 / Stage 2+)!
 * - Mental Rotation:
 *     * Tier 1 (Sprout): Concrete live turn buttons (↺ / ↻) as hands-on spatial scaffolding.
 *     * Tiers 2–4 (Ages 7–11+): Predict-First Mental Rotation! Child rotates mentally first
 *       (1 Turn Right / 2 Turns / 1 Turn Left / Flipped Impostor), then watches the piece
 *       smoothly animate to visually verify!
 * - 12 mathematically verified connected, strictly chiral polyominoes (tetrominoes, pentominoes, hexominoes).
 */

import { randInt, pickOne, shuffle } from './utils.js';
import { getRecentPuzzleSigs, recordRecentPuzzleSigs, getGameStage } from '../storage.js';

export const meta = {
  id: 'shape-shifter',
  title: 'Shape Shifter',
  pillar: 'visualize',
  pillarLabel: 'Visualize',
  shortDesc: 'Paint vertical, horizontal & diagonal mirrors and master true mental rotation.',
  scienceNote: 'Predict-first mental rotation & multi-axis symmetry transfer directly to geometry (Hawes et al., 2022).',
  timed: false,
};

// 12 asymmetric polyominoes — every single one verified orthogonally connected and strictly chiral
// (its horizontal mirror NEVER equals any 90° rotation). Index 0 carries the gold landmark dot.
export const CHIRAL_SHAPES = [
  // Tetrominoes & Pentominoes (Tiers 1–4)
  { name: 'L-Block', minTier: 1, cells: [[0, 0], [1, 0], [2, 0], [2, 1]] },
  { name: 'Z-Step', minTier: 1, cells: [[0, 0], [0, 1], [1, 1], [1, 2]] },
  { name: 'P-Flag', minTier: 1, cells: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]] },
  { name: 'F-Tree', minTier: 1, cells: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]] },
  { name: 'N-Slide', minTier: 1, cells: [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1]] },
  { name: 'Y-Branch', minTier: 1, cells: [[0, 0], [1, 0], [1, 1], [2, 0], [3, 0]] },
  // Hexominoes (Tiers 2–4)
  { name: 'J-Spur', minTier: 2, cells: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [1, 1]] },
  { name: 'C-Hook', minTier: 2, cells: [[0, 0], [0, 1], [1, 0], [2, 0], [2, 1], [2, 2]] },
  { name: 'P-Wing', minTier: 2, cells: [[0, 0], [0, 1], [1, 0], [1, 1], [1, 2], [2, 0]] },
  { name: 'Z-Hook', minTier: 3, cells: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2], [3, 2]] },
  { name: 'F-Tall', minTier: 3, cells: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1], [3, 1]] },
  { name: 'T-Step', minTier: 3, cells: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1], [2, 2]] },
];

export function normalizeCells(cells) {
  const minR = Math.min(...cells.map(([r]) => r));
  const minC = Math.min(...cells.map(([, c]) => c));
  return cells.map(([r, c]) => [r - minR, c - minC]);
}

export function rotateCells90CW(cells) {
  const norm = normalizeCells(cells);
  const maxR = Math.max(...norm.map(([r]) => r));
  return normalizeCells(norm.map(([r, c]) => [c, maxR - r]));
}

export function flipCellsHorizontal(cells) {
  const norm = normalizeCells(cells);
  const maxC = Math.max(...norm.map(([, c]) => c));
  return normalizeCells(norm.map(([r, c]) => [r, maxC - c]));
}

export function cellsSignature(cells) {
  return normalizeCells(cells)
    .map(([r, c]) => `${r},${c}`)
    .sort()
    .join('|');
}

function generateMirrorRound(tier, preferredAxis = null) {
  const axis =
    preferredAxis ||
    (tier === 1
      ? 'vertical'
      : tier === 2
        ? pickOne(['vertical', 'horizontal'])
        : pickOne(['vertical', 'horizontal', 'diagonal']));

  if (axis === 'diagonal') {
    // 4x4 grid reflected across main diagonal (r, c) <-> (c, r)
    const size = 4;
    const upperCoords = [];
    for (let r = 0; r < size; r++) {
      for (let c = r + 1; c < size; c++) upperCoords.push([r, c]);
    }
    const chosen = shuffle(upperCoords).slice(0, randInt(3, 4));
    const grid = Array.from({ length: size }, () => Array(size).fill(0));
    chosen.forEach(([r, c]) => {
      grid[r][c] = 1;
    });
    const expectedLower = Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c) => (r > c ? grid[c][r] : 0))
    );
    const sig = `mir:diag:${chosen.map(([r, c]) => `${r}${c}`).sort().join('-')}`;
    return {
      kind: 'mirror',
      axis: 'diagonal',
      signature: sig,
      rows: size,
      cols: size,
      leftGrid: grid,
      expectedRight: expectedLower,
      prompt: 'Paint the mirror reflection across the diagonal line!',
      speakPrompt: 'Tap the squares below the diagonal line to paint the exact reflection of the teal pattern above!',
      strategyTip: 'Across a diagonal mirror, rows and columns trade places! A tile at Row 1, Column 3 reflects to Row 3, Column 1.',
    };
  }

  const rows = axis === 'horizontal' ? 3 : tier === 1 ? 3 : 4;
  const cols = axis === 'horizontal' ? (tier >= 3 ? 5 : 4) : tier === 1 ? 3 : tier === 2 ? 3 : 4;
  const targetCount = tier === 1 ? randInt(3, 4) : tier === 2 ? randInt(4, 6) : randInt(5, 7);

  const leftGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
  const coords = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) coords.push([r, c]);
  }
  const chosen = shuffle(coords).slice(0, targetCount);
  chosen.forEach(([r, c]) => {
    leftGrid[r][c] = 1;
  });

  const expectedRight =
    axis === 'horizontal'
      ? Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => leftGrid[rows - 1 - r][c])
        )
      : Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => leftGrid[r][cols - 1 - c])
        );

  const sig = `mir:${axis}:${leftGrid.map((r) => r.join('')).join('/')}`;
  return {
    kind: 'mirror',
    axis,
    signature: sig,
    rows,
    cols,
    leftGrid,
    expectedRight,
    prompt:
      axis === 'horizontal'
        ? 'Paint the upside-down mirror reflection below the line!'
        : 'Paint the mirror reflection on the right side!',
    speakPrompt:
      axis === 'horizontal'
        ? 'Tap squares in the bottom grid to reflect the teal pattern across the horizontal mirror line!'
        : 'Tap squares on the right side to paint the exact mirror reflection of the pattern on the left!',
    strategyTip:
      axis === 'horizontal'
        ? 'Tiles touching the horizontal mirror line stay right next to the mirror line! Check one column at a time.'
        : 'Tiles close to the dotted mirror line stay close to the mirror line! Check one row at a time from top to bottom.',
  };
}

function hasFourUniqueOrientations(cells) {
  const sigs = new Set();
  let cur = normalizeCells(cells);
  for (let t = 0; t < 4; t++) {
    sigs.add(cellsSignature(cur));
    cur = rotateCells90CW(cur);
  }
  return sigs.size === 4;
}

function generateRotateRound(tier, preferredShape = null) {
  const predictFirst = tier >= 2;
  const eligible = CHIRAL_SHAPES.filter(
    (s) => s.minTier <= tier && (!predictFirst || hasFourUniqueOrientations(s.cells))
  );
  const base =
    preferredShape && (!predictFirst || hasFourUniqueOrientations(preferredShape.cells))
      ? preferredShape
      : pickOne(eligible);

  // Pick a random starting orientation for player's piece (0..3 CW turns from base)
  const canBeFlipped = tier >= 3;
  const isFlippedImpostor = canBeFlipped && Math.random() < 0.4;

  // Pick required CW turns (1 = 90° CW, 2 = 180°, 3 = 270° CW / 90° CCW)
  // For 2-orientation shapes (like Z-Step in Tier 1), only 1 or 3 changes orientation!
  const turnPool = hasFourUniqueOrientations(base.cells) ? [1, 2, 3] : [1, 3];
  const turnsNeededCW = pickOne(turnPool);
  const startBase = isFlippedImpostor ? flipCellsHorizontal(base.cells) : normalizeCells(base.cells);
  const startOffset = randInt(0, 3);
  let startCells = startBase;
  for (let t = 0; t < startOffset; t++) {
    startCells = rotateCells90CW(startCells);
  }

  let targetCells = normalizeCells(base.cells);
  const targetOffset = (startOffset + turnsNeededCW) % 4;
  for (let t = 0; t < targetOffset; t++) {
    targetCells = rotateCells90CW(targetCells);
  }

  const validTurnsCW = [];
  if (!isFlippedImpostor) {
    let cur = startCells;
    for (let t = 0; t < 4; t++) {
      if (t > 0 && cellsSignature(cur) === cellsSignature(targetCells)) validTurnsCW.push(t);
      cur = rotateCells90CW(cur);
    }
  }

  const sig = `rot:${base.name}:${isFlippedImpostor ? 'flip' : turnsNeededCW}:${startOffset}`;

  return {
    kind: 'rotate',
    signature: sig,
    shapeName: base.name,
    predictFirst,
    canBeFlipped,
    isFlippedImpostor,
    turnsNeededCW: isFlippedImpostor ? null : turnsNeededCW,
    validTurnsCW,
    targetCells,
    targetSig: cellsSignature(targetCells),
    startCells,
    prompt: predictFirst
      ? canBeFlipped
        ? 'Rotate in your head! Which turn matches the target — or is it a flipped impostor?'
        : 'Rotate in your head! Which turn makes your piece match the target?'
      : 'Turn your shape until it matches the target!',
    speakPrompt: predictFirst
      ? 'Imagine turning your orange piece in your head! Which turn makes it match the teal target?'
      : 'Use the turn buttons to spin your shape until it points the exact same way as the target!',
    strategyTip:
      'Track the gold landmark dot! Watch which corner it starts in and imagine turning clockwise like a clock hand (90° = quarter turn).',
  };
}

export function generateSession(tier = 1, profile = null) {
  const scopeKey = `shape-shifter:${tier}`;
  const recentSigs = getRecentPuzzleSigs(profile, scopeKey);
  const stage = getGameStage(profile, meta.id);
  const sessionSigs = new Set();

  const eligibleShapes = shuffle(CHIRAL_SHAPES.filter((s) => s.minTier <= tier));
  let shapeIdx = 0;
  const nextShape = () => eligibleShapes[shapeIdx++ % eligibleShapes.length];

  const mirrorAxis1 = 'vertical';
  const mirrorAxis2 =
    tier === 1
      ? 'vertical'
      : tier === 2
        ? 'horizontal'
        : stage >= 2 || tier >= 4
          ? 'diagonal'
          : pickOne(['horizontal', 'diagonal']);

  const makers = [
    () => generateMirrorRound(tier, mirrorAxis1),
    () => generateRotateRound(tier, nextShape()),
    () => generateMirrorRound(tier, mirrorAxis2),
    () => generateRotateRound(tier, nextShape()),
    () => (tier >= 2 ? generateRotateRound(tier, nextShape()) : generateMirrorRound(tier, 'vertical')),
  ];

  const rounds = makers.map((fn) => {
    let fallback = null;
    for (let a = 0; a < 20; a++) {
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

function renderPolyominoSvg(cells, colorFill = '#2E9690', strokeColor = '#1E6863', showLandmark = true) {
  const norm = normalizeCells(cells);
  const maxR = Math.max(...norm.map(([r]) => r));
  const maxC = Math.max(...norm.map(([, c]) => c));
  const span = Math.max(maxR + 1, maxC + 1);
  const cellSize = span >= 4 ? 24 : 28;
  const width = (maxC + 1) * cellSize;
  const height = (maxR + 1) * cellSize;
  const ox = (120 - width) / 2;
  const oy = (120 - height) / 2;

  const rects = norm.map(([r, c], idx) => {
    const x = ox + c * cellSize;
    const y = oy + r * cellSize;
    const dot =
      showLandmark && idx === 0
        ? `<circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="4.6" fill="#F6C84C" stroke="#8C6208" stroke-width="1.4"/>`
        : '';
    return `
      <rect x="${x + 1.5}" y="${y + 1.5}" width="${cellSize - 3}" height="${cellSize - 3}" rx="5.5"
            fill="${colorFill}" stroke="${strokeColor}" stroke-width="2"/>
      ${dot}
    `;
  });

  return `<svg viewBox="0 0 120 120" width="112" height="112" aria-hidden="true">${rects.join('')}</svg>`;
}

export function renderRound(container, round, callbacks) {
  if (round.kind === 'mirror') {
    if (round.axis === 'diagonal') {
      renderDiagonalMirrorRound(container, round, callbacks);
    } else {
      renderMirrorRound(container, round, callbacks);
    }
  } else if (round.predictFirst) {
    renderPredictRotateRound(container, round, callbacks);
  } else {
    renderLiveRotateRound(container, round, callbacks);
  }
}

function renderDiagonalMirrorRound(container, round, callbacks) {
  const size = round.rows;
  const userGrid = Array.from({ length: size }, () => Array(size).fill(0));
  let solved = false;
  let hadMistake = false;

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '18px';
  wrap.style.width = '100%';

  const board = document.createElement('div');
  board.className = 'mirror-grid diagonal-board';
  board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  const buttons = [];
  for (let r = 0; r < size; r++) {
    buttons[r] = [];
    for (let c = 0; c < size; c++) {
      if (r === c) {
        const diag = document.createElement('div');
        diag.className = 'mirror-cell diag-axis';
        diag.setAttribute('aria-hidden', 'true');
        board.appendChild(diag);
      } else if (r < c) {
        const cell = document.createElement('div');
        cell.className = `mirror-cell given ${round.leftGrid[r][c] ? 'filled-a' : ''}`;
        board.appendChild(cell);
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mirror-cell interactive';
        btn.setAttribute('aria-label', `Row ${r + 1}, Column ${c + 1}`);
        btn.addEventListener('click', () => {
          if (solved) return;
          callbacks.playClick();
          userGrid[r][c] = userGrid[r][c] ? 0 : 1;
          btn.classList.toggle('filled-b', Boolean(userGrid[r][c]));
          btn.classList.remove('hint-pulse');
        });
        buttons[r][c] = btn;
        board.appendChild(btn);
      }
    }
  }

  const checkBtn = document.createElement('button');
  checkBtn.type = 'button';
  checkBtn.className = 'btn btn-primary';
  checkBtn.textContent = 'Check Diagonal Mirror!';
  checkBtn.addEventListener('click', () => {
    if (solved) return;
    let painted = 0;
    for (let r = 1; r < size; r++) for (let c = 0; c < r; c++) painted += userGrid[r][c];
    if (painted === 0) {
      callbacks.onRetry('Tap squares below the diagonal line to paint the reflection first!');
      return;
    }
    let mismatches = 0;
    let hintedMissed = 0;
    for (let r = 1; r < size; r++) {
      for (let c = 0; c < r; c++) {
        const ok = userGrid[r][c] === round.expectedRight[r][c];
        if (!ok) {
          mismatches += 1;
          const isExtra = userGrid[r][c] === 1;
          const shouldPulse = isExtra || hintedMissed < 2;
          if (!isExtra && shouldPulse) hintedMissed += 1;
          buttons[r][c].classList.toggle('hint-pulse', shouldPulse);
        } else {
          buttons[r][c].classList.remove('hint-pulse');
        }
      }
    }
    if (mismatches === 0) {
      solved = true;
      checkBtn.disabled = true;
      callbacks.onCorrect(!hadMistake, 'Diagonal symmetry mastered! Rows and columns reflected cleanly.');
    } else {
      hadMistake = true;
      callbacks.onRetry(
        `Almost! ${mismatches} square${mismatches === 1 ? '' : 's'} still need${mismatches === 1 ? 's' : ''} a flip — check the coral hint${mismatches === 1 ? '' : 's'}!`
      );
    }
  });

  wrap.appendChild(board);
  wrap.appendChild(checkBtn);
  container.appendChild(wrap);
}

function renderMirrorRound(container, round, callbacks) {
  const userGrid = Array.from({ length: round.rows }, () => Array(round.cols).fill(0));
  let solved = false;
  let hadMistake = false;

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '18px';
  wrap.style.width = '100%';

  const workspace = document.createElement('div');
  workspace.className = round.axis === 'horizontal' ? 'mirror-workspace horizontal' : 'mirror-workspace';

  const leftEl = document.createElement('div');
  leftEl.className = 'mirror-grid';
  leftEl.style.gridTemplateColumns = `repeat(${round.cols}, 1fr)`;
  for (let r = 0; r < round.rows; r++) {
    for (let c = 0; c < round.cols; c++) {
      const cell = document.createElement('div');
      cell.className = `mirror-cell given ${round.leftGrid[r][c] ? 'filled-a' : ''}`;
      leftEl.appendChild(cell);
    }
  }

  const divider = document.createElement('div');
  divider.className = round.axis === 'horizontal' ? 'mirror-divider horizontal' : 'mirror-divider';
  divider.setAttribute('aria-hidden', 'true');

  const rightEl = document.createElement('div');
  rightEl.className = 'mirror-grid';
  rightEl.style.gridTemplateColumns = `repeat(${round.cols}, 1fr)`;
  const rightButtons = [];

  for (let r = 0; r < round.rows; r++) {
    rightButtons[r] = [];
    for (let c = 0; c < round.cols; c++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mirror-cell interactive';
      btn.setAttribute('aria-label', `Row ${r + 1}, Column ${c + 1}`);
      btn.addEventListener('click', () => {
        if (solved) return;
        callbacks.playClick();
        userGrid[r][c] = userGrid[r][c] ? 0 : 1;
        btn.classList.toggle('filled-b', Boolean(userGrid[r][c]));
        btn.classList.remove('hint-pulse');
      });
      rightButtons[r][c] = btn;
      rightEl.appendChild(btn);
    }
  }

  workspace.appendChild(leftEl);
  workspace.appendChild(divider);
  workspace.appendChild(rightEl);

  const checkBtn = document.createElement('button');
  checkBtn.type = 'button';
  checkBtn.className = 'btn btn-primary';
  checkBtn.textContent = 'Check My Mirror!';
  checkBtn.addEventListener('click', () => {
    if (solved) return;
    let painted = 0;
    for (let r = 0; r < round.rows; r++) for (let c = 0; c < round.cols; c++) painted += userGrid[r][c];
    if (painted === 0) {
      callbacks.onRetry('Tap squares on your side to paint the reflection first!');
      return;
    }
    let mismatches = 0;
    let hintedMissed = 0;
    for (let r = 0; r < round.rows; r++) {
      for (let c = 0; c < round.cols; c++) {
        const right = userGrid[r][c] === round.expectedRight[r][c];
        if (!right) {
          mismatches += 1;
          const isExtra = userGrid[r][c] === 1;
          const shouldPulse = isExtra || hintedMissed < 2;
          if (!isExtra && shouldPulse) hintedMissed += 1;
          rightButtons[r][c].classList.toggle('hint-pulse', shouldPulse);
        } else {
          rightButtons[r][c].classList.remove('hint-pulse');
        }
      }
    }
    if (mismatches === 0) {
      solved = true;
      checkBtn.disabled = true;
      callbacks.onCorrect(!hadMistake, 'Awesome symmetry! Every square reflects cleanly across the mirror line.');
    } else {
      hadMistake = true;
      callbacks.onRetry(
        `Almost! ${mismatches} square${mismatches === 1 ? '' : 's'} still need${mismatches === 1 ? 's' : ''} a flip — check the coral hint${mismatches === 1 ? '' : 's'}!`
      );
    }
  });

  wrap.appendChild(workspace);
  wrap.appendChild(checkBtn);
  container.appendChild(wrap);
}

/**
 * Predict-First Mental Rotation (Tiers 2–4):
 * Child mentally rotates first, taps their prediction, and watches the piece animate to verify!
 */
function renderPredictRotateRound(container, round, callbacks) {
  let solved = false;
  let hadMistake = false;
  let resetTimer = null;

  if (callbacks.registerCleanup) {
    callbacks.registerCleanup(() => {
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }
    });
  }

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '18px';
  wrap.style.width = '100%';

  const arena = document.createElement('div');
  arena.className = 'rotate-arena';

  const targetBox = document.createElement('div');
  targetBox.className = 'shape-box';
  targetBox.innerHTML = `
    <span class="shape-box-label">Target Shape</span>
    <div>${renderPolyominoSvg(round.targetCells, '#2E9690', '#1E6863', false)}</div>
  `;

  const playerBox = document.createElement('div');
  playerBox.className = 'shape-box';
  playerBox.innerHTML = `<span class="shape-box-label">Your Piece (Rotate Mentally!)</span>`;

  const rotator = document.createElement('div');
  rotator.className = 'shape-rotator';
  rotator.innerHTML = renderPolyominoSvg(round.startCells, '#E46B49', '#B3482B', true);
  playerBox.appendChild(rotator);

  arena.appendChild(targetBox);
  arena.appendChild(playerBox);

  const options = [
    { key: '1', angle: 90, label: '↻ 1 Turn Right (90°)' },
    { key: '2', angle: 180, label: '↻ 2 Turns (180°)' },
    { key: '3', angle: -90, label: '↺ 1 Turn Left (270°)' },
  ];
  if (round.canBeFlipped) {
    options.push({ key: 'flip', angle: 0, label: '⇄ Flipped Impostor!' });
  }

  const grid = document.createElement('div');
  grid.className = round.canBeFlipped ? 'choice-grid' : 'choice-grid cols-3';

  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn';
    btn.textContent = opt.label;
    btn.addEventListener('click', () => {
      if (solved) return;
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }
      const expectedKey = round.isFlippedImpostor ? 'flip' : String(round.turnsNeededCW);

      // Smoothly animate the chosen rotation so the child sees immediate spatial feedback!
      if (opt.key === 'flip') {
        rotator.style.transform = 'scaleX(-1)';
      } else {
        rotator.style.transform = `rotate(${opt.angle}deg)`;
      }

      if (opt.key === expectedKey) {
        solved = true;
        btn.classList.add('is-correct');
        const msg = round.isFlippedImpostor
          ? 'Sharp mental rotation! Mirror-flipping proves no pure spin could ever line it up.'
          : `Nailed it! Rotating ${opt.label.replace(/[↻↺]\s*/, '')} lines up every single corner!`;
        callbacks.onCorrect(!hadMistake, msg);
      } else {
        hadMistake = true;
        btn.classList.add('is-wrong');
        btn.disabled = true;
        // Snap back after showing why that turn didn't match
        resetTimer = setTimeout(() => {
          resetTimer = null;
          if (!solved) rotator.style.transform = 'rotate(0deg)';
        }, 700);
        const hint = round.isFlippedImpostor
          ? 'Watch how it rotated — the corners still point the mirror-opposite way! Could it be flipped?'
          : 'Watch where the gold dot landed! Imagine spinning it again from its starting spot.';
        callbacks.onRetry(hint);
      }
    });
    grid.appendChild(btn);
  });

  wrap.appendChild(arena);
  wrap.appendChild(grid);
  container.appendChild(wrap);
}

/**
 * Concrete Live-Spin Rotation (Tier 1 — Sprout ages 5–6):
 * Hands-on ↺ / ↻ buttons build embodied intuition before predict-first rotation in Tier 2+.
 */
function renderLiveRotateRound(container, round, callbacks) {
  let currentCells = round.startCells;
  let visualAngle = 0;
  let solved = false;
  let hadMistake = false;

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '18px';
  wrap.style.width = '100%';

  const arena = document.createElement('div');
  arena.className = 'rotate-arena';

  const targetBox = document.createElement('div');
  targetBox.className = 'shape-box';
  targetBox.innerHTML = `
    <span class="shape-box-label">Target Shape</span>
    <div>${renderPolyominoSvg(round.targetCells, '#2E9690', '#1E6863', false)}</div>
  `;

  const playerBox = document.createElement('div');
  playerBox.className = 'shape-box';
  playerBox.innerHTML = `<span class="shape-box-label">Your Piece</span>`;

  const rotator = document.createElement('div');
  rotator.className = 'shape-rotator';
  rotator.innerHTML = renderPolyominoSvg(round.startCells, '#E46B49', '#B3482B', true);
  playerBox.appendChild(rotator);

  arena.appendChild(targetBox);
  arena.appendChild(playerBox);

  const controls = document.createElement('div');
  controls.className = 'rotate-controls';

  const turnLeftBtn = document.createElement('button');
  turnLeftBtn.type = 'button';
  turnLeftBtn.className = 'btn btn-secondary';
  turnLeftBtn.textContent = '↺ Turn Left';
  turnLeftBtn.addEventListener('click', () => {
    if (solved) return;
    callbacks.playClick();
    visualAngle -= 90;
    currentCells = rotateCells90CW(rotateCells90CW(rotateCells90CW(currentCells)));
    rotator.style.transform = `rotate(${visualAngle}deg)`;
  });

  const turnRightBtn = document.createElement('button');
  turnRightBtn.type = 'button';
  turnRightBtn.className = 'btn btn-secondary';
  turnRightBtn.textContent = '↻ Turn Right';
  turnRightBtn.addEventListener('click', () => {
    if (solved) return;
    callbacks.playClick();
    visualAngle += 90;
    currentCells = rotateCells90CW(currentCells);
    rotator.style.transform = `rotate(${visualAngle}deg)`;
  });

  controls.appendChild(turnLeftBtn);
  controls.appendChild(turnRightBtn);

  const matchBtn = document.createElement('button');
  matchBtn.type = 'button';
  matchBtn.className = 'btn btn-primary';
  matchBtn.textContent = '✓ Matches Target!';
  matchBtn.addEventListener('click', () => {
    if (solved) return;
    if (cellsSignature(currentCells) === round.targetSig) {
      solved = true;
      callbacks.onCorrect(!hadMistake, 'Bullseye! You rotated the piece to match the exact silhouette.');
    } else {
      hadMistake = true;
      callbacks.onRetry('Not quite lined up yet — try another 90° turn and compare the corners!');
    }
  });

  wrap.appendChild(arena);
  wrap.appendChild(controls);
  wrap.appendChild(matchBtn);
  container.appendChild(wrap);
}
