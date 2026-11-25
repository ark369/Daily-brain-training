/**
 * Shape Shifter (Visualize Pillar — Interactive Symmetry & Embodied Mental Rotation)
 * - Mirror Painter: Paint symmetrical reflections across a mirror line.
 * - Rotate & Match: Physically turn polyomino shapes in 90° steps to match a target
 *   (or detect flipped mirror impostors on Tiers 3–4!).
 */

import { randInt, pickOne, shuffle } from './utils.js';

export const meta = {
  id: 'shape-shifter',
  title: 'Shape Shifter',
  pillar: 'visualize',
  pillarLabel: 'Visualize',
  shortDesc: 'Paint mirror reflections and rotate puzzle shapes to test how they fit in space.',
  scienceNote: 'Embodied spatial rotation & symmetry directly transfer to geometry and math (Hawes et al., 2022).',
  timed: false,
};

// Asymmetric polyomino shapes — each mathematically verified orthogonally connected
// and strictly chiral (its horizontal mirror NEVER equals any 90° rotation).
// Index 0 carries a gold landmark dot to teach the corner-tracking spatial strategy.
export const CHIRAL_SHAPES = [
  { name: 'L-Block', cells: [[0, 0], [1, 0], [2, 0], [2, 1]] }, // L-tetromino
  { name: 'Z-Step', cells: [[0, 0], [0, 1], [1, 1], [1, 2]] }, // Z-tetromino
  { name: 'P-Flag', cells: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]] }, // P-pentomino
  { name: 'F-Tree', cells: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]] }, // F-pentomino
  { name: 'N-Slide', cells: [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1]] }, // N-pentomino
  { name: 'Y-Branch', cells: [[0, 0], [1, 0], [1, 1], [2, 0], [3, 0]] }, // Y-pentomino
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

function generateMirrorRound(tier) {
  const rows = tier === 1 ? 3 : tier === 2 ? 4 : 4;
  const cols = tier === 1 ? 3 : tier === 2 ? 3 : 4;
  const targetCount = tier === 1 ? randInt(3, 4) : tier === 2 ? randInt(5, 6) : randInt(6, 8);

  const leftGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
  const coords = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) coords.push([r, c]);
  }
  const chosen = shuffle(coords).slice(0, targetCount);
  chosen.forEach(([r, c]) => {
    leftGrid[r][c] = 1;
  });

  // Expected reflection across right edge of leftGrid
  const expectedRight = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => leftGrid[r][cols - 1 - c])
  );

  return {
    kind: 'mirror',
    rows,
    cols,
    leftGrid,
    expectedRight,
    prompt: 'Paint the mirror reflection on the right side!',
    speakPrompt: 'Tap squares on the right side to paint the exact mirror reflection of the pattern on the left!',
    strategyTip:
      'Tiles close to the dotted mirror line stay close to the mirror line! Check one row at a time from top to bottom.',
  };
}

function generateRotateRound(tier) {
  const base = pickOne(CHIRAL_SHAPES);
  const targetTurns = randInt(1, 3); // 90°, 180°, or 270°
  let targetCells = normalizeCells(base.cells);
  for (let t = 0; t < targetTurns; t++) {
    targetCells = rotateCells90CW(targetCells);
  }

  // Tiers 3-4: 50% chance the player's piece is actually a mirrored impostor!
  const canBeFlipped = tier >= 3;
  const isFlippedImpostor = canBeFlipped && Math.random() < 0.5;
  let startCells = isFlippedImpostor ? flipCellsHorizontal(base.cells) : normalizeCells(base.cells);
  // Give a random starting orientation that is not already identical to target
  const startTurns = isFlippedImpostor ? randInt(0, 3) : (targetTurns + randInt(1, 3)) % 4;
  for (let t = 0; t < startTurns; t++) {
    startCells = rotateCells90CW(startCells);
  }

  return {
    kind: 'rotate',
    canBeFlipped,
    isFlippedImpostor,
    targetCells,
    targetSig: cellsSignature(targetCells),
    startCells,
    prompt: canBeFlipped
      ? 'Turn your shape! Can it match the target, or is it a flipped impostor?'
      : 'Turn your shape until it matches the target!',
    speakPrompt: canBeFlipped
      ? 'Use the turn buttons to rotate your shape. Can you make it match the target, or is it flipped like a mirror?'
      : 'Use the turn buttons to spin your shape until it points the exact same way as the target!',
    strategyTip:
      'Pick one end of the shape (like the gold corner dot) and watch which direction it points each time you turn 90 degrees.',
  };
}

export function generateSession(tier = 1) {
  const rounds = [];
  // Interleave Mirror Painter and Rotate & Match across 5 rounds
  rounds.push(generateMirrorRound(tier));
  rounds.push(generateRotateRound(tier));
  rounds.push(generateMirrorRound(tier));
  rounds.push(generateRotateRound(tier));
  rounds.push(tier >= 2 ? generateRotateRound(tier) : generateMirrorRound(tier));
  return rounds;
}

function renderPolyominoSvg(cells, colorFill = '#2E9690', strokeColor = '#1E6863', showLandmark = true) {
  const norm = normalizeCells(cells);
  const maxR = Math.max(...norm.map(([r]) => r));
  const maxC = Math.max(...norm.map(([, c]) => c));
  const cellSize = 28;
  const width = (maxC + 1) * cellSize;
  const height = (maxR + 1) * cellSize;
  const ox = (120 - width) / 2;
  const oy = (120 - height) / 2;

  const rects = norm.map(([r, c], idx) => {
    const x = ox + c * cellSize;
    const y = oy + r * cellSize;
    const dot =
      showLandmark && idx === 0
        ? `<circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="5" fill="#F6C84C" stroke="#8C6208" stroke-width="1.4"/>`
        : '';
    return `
      <rect x="${x + 1.5}" y="${y + 1.5}" width="${cellSize - 3}" height="${cellSize - 3}" rx="6"
            fill="${colorFill}" stroke="${strokeColor}" stroke-width="2"/>
      ${dot}
    `;
  });

  return `<svg viewBox="0 0 120 120" width="112" height="112" aria-hidden="true">${rects.join('')}</svg>`;
}

export function renderRound(container, round, callbacks) {
  if (round.kind === 'mirror') {
    renderMirrorRound(container, round, callbacks);
  } else {
    renderRotateRound(container, round, callbacks);
  }
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
  workspace.className = 'mirror-workspace';

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
  divider.className = 'mirror-divider';
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
    let mismatches = 0;
    for (let r = 0; r < round.rows; r++) {
      for (let c = 0; c < round.cols; c++) {
        const right = userGrid[r][c] === round.expectedRight[r][c];
        rightButtons[r][c].classList.toggle('hint-pulse', !right);
        if (!right) mismatches += 1;
      }
    }
    if (mismatches === 0) {
      solved = true;
      checkBtn.disabled = true;
      callbacks.onCorrect(!hadMistake, 'Awesome symmetry! Every square reflects cleanly across the mirror line.');
    } else {
      hadMistake = true;
      callbacks.onRetry(
        `Almost! ${mismatches} square${mismatches === 1 ? '' : 's'} highlighted in coral need${mismatches === 1 ? 's' : ''} a flip.`
      );
    }
  });

  wrap.appendChild(workspace);
  wrap.appendChild(checkBtn);
  container.appendChild(wrap);
}

function renderRotateRound(container, round, callbacks) {
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
    // 3 CW turns == 1 CCW turn
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

  const actionRow = document.createElement('div');
  actionRow.className = 'rotate-controls';

  const matchBtn = document.createElement('button');
  matchBtn.type = 'button';
  matchBtn.className = 'btn btn-primary';
  matchBtn.textContent = round.canBeFlipped ? '✓ It Matches Now!' : '✓ Matches Target!';
  matchBtn.addEventListener('click', () => {
    if (solved) return;
    const isExactMatch = !round.isFlippedImpostor && cellsSignature(currentCells) === round.targetSig;
    if (isExactMatch) {
      solved = true;
      callbacks.onCorrect(!hadMistake, 'Bullseye! You rotated the piece to match the exact silhouette.');
    } else if (round.isFlippedImpostor) {
      hadMistake = true;
      callbacks.onRetry(
        'Look closely! No matter how many times you spin this piece, it points the opposite way — it is a flipped mirror!'
      );
    } else {
      hadMistake = true;
      callbacks.onRetry('Not quite lined up yet — try another 90° turn and compare the corners!');
    }
  });
  actionRow.appendChild(matchBtn);

  if (round.canBeFlipped) {
    const flipBtn = document.createElement('button');
    flipBtn.type = 'button';
    flipBtn.className = 'btn btn-warm';
    flipBtn.textContent = '⇄ Flipped Impostor!';
    flipBtn.addEventListener('click', () => {
      if (solved) return;
      if (round.isFlippedImpostor) {
        solved = true;
        callbacks.onCorrect(
          !hadMistake,
          'Sharp spatial eye! That piece was mirror-flipped, so pure rotation could never match it.'
        );
      } else {
        hadMistake = true;
        callbacks.onRetry(
          'Actually, this one IS a true rotation! Spin it around a couple more times to line it up.'
        );
      }
    });
    actionRow.appendChild(flipBtn);
  }

  wrap.appendChild(arena);
  wrap.appendChild(controls);
  wrap.appendChild(actionRow);
  container.appendChild(wrap);
}
