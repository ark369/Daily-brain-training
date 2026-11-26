/**
 * Shape Composer (Visualize Pillar — 2D Spatial Composition / Tangram Tiling & 3D Cube Net Folding)
 * Directly targets the highest-transfer spatial skills in K–6 research:
 * - Tiers 1–2 (Sprout & Explorer): Interactive Mosaic/Tangram Tile Fitting — constructively
 *   partitioned silhouettes so every board is 100% guaranteed solvable (with optional rotation on T2+).
 * - Tiers 3–4 (Challenger & Trailblazer): 3D Cube Net Folding (exact 3D rolling simulator covering
 *   all 11 mathematically valid cube nets + 8 classic invalid impostors + "Which face lands opposite ★?").
 */

import { randInt, pickOne, shuffle } from './utils.js';
import { getRecentPuzzleSigs, recordRecentPuzzleSigs } from '../storage.js';

export const meta = {
  id: 'shape-composer',
  title: 'Shape Composer',
  pillar: 'visualize',
  pillarLabel: 'Visualize',
  shortDesc: 'Fit puzzle pieces to build silhouettes and fold flat paper nets into 3D cubes.',
  scienceNote: '2D shape composition and 3D net folding are top predictors of geometry & math achievement.',
  timed: false,
};

// =========================================================================
// Exact 3D Cube-Net Folder (BFS over grid cells rolling a 3D orthonormal basis)
// =========================================================================
export function foldNet3D(cells) {
  if (!Array.isArray(cells) || cells.length !== 6) return { valid: false, oppositeOf0: -1 };
  const byCoord = new Map(cells.map(([r, c], idx) => [`${r},${c}`, idx]));
  const visited = new Map();
  // Basis vectors: normal (outward face normal), right (+col), down (+row)
  const startBasis = { n: [0, 0, -1], r: [1, 0, 0], d: [0, 1, 0] };
  visited.set(0, startBasis);
  const q = [0];

  const neg = (v) => [-v[0], -v[1], -v[2]];
  const roll = (b, dr, dc) => {
    if (dc === 1) return { n: b.r, r: neg(b.n), d: b.d }; // right
    if (dc === -1) return { n: neg(b.r), r: b.n, d: b.d }; // left
    if (dr === 1) return { n: b.d, r: b.r, d: neg(b.n) }; // down
    return { n: neg(b.d), r: b.r, d: b.n }; // up
  };

  while (q.length > 0) {
    const idx = q.shift();
    const [cr, cc] = cells[idx];
    const basis = visited.get(idx);
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nIdx = byCoord.get(`${cr + dr},${cc + dc}`);
      if (nIdx !== undefined && !visited.has(nIdx)) {
        visited.set(nIdx, roll(basis, dr, dc));
        q.push(nIdx);
      }
    }
  }

  if (visited.size !== 6) return { valid: false, oppositeOf0: -1 };
  const normals = new Set();
  let oppositeOf0 = -1;
  for (const [idx, b] of visited.entries()) {
    const key = b.n.join(',');
    normals.add(key);
    if (key === '0,0,1') oppositeOf0 = idx;
  }
  return { valid: normals.size === 6, oppositeOf0 };
}

// All 11 mathematically valid hexomino cube nets!
export const VALID_CUBE_NETS = [
  { name: 'Cross-1', cells: [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3], [2, 1]] },
  { name: 'Cross-2', cells: [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0]] },
  { name: 'Cross-3', cells: [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 1]] },
  { name: 'Cross-4', cells: [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 2]] },
  { name: 'Cross-5', cells: [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 3]] },
  { name: 'Cross-6', cells: [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3], [2, 2]] },
  { name: 'Zig-1', cells: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3], [2, 1]] },
  { name: 'Zig-2', cells: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3], [2, 2]] },
  { name: 'Zig-3', cells: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3], [2, 3]] },
  { name: 'Stair-3', cells: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]] },
  { name: 'Two-Three', cells: [[0, 0], [0, 1], [0, 2], [1, 2], [1, 3], [1, 4]] },
];

// 8 classic 6-square connected IMPOSTOR nets (faces collide when folded!)
export const INVALID_CUBE_NETS = [
  { name: 'Block-2x3', cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]] },
  { name: 'Long-5', cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 2]] },
  { name: 'U-Loop', cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 2]] },
  { name: 'C-Wrap', cells: [[0, 0], [0, 1], [1, 0], [2, 0], [2, 1], [2, 2]] },
  { name: 'Cluster-4', cells: [[0, 0], [0, 1], [1, 0], [1, 1], [1, 2], [2, 2]] },
  { name: 'Double-L', cells: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2]] },
  { name: 'Same-Side-T', cells: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2], [1, 3]] },
  { name: 'Same-Side-2', cells: [[0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [1, 3]] },
];

function transformNet(cells) {
  let out = cells.map(([r, c]) => [r, c]);
  const turns = randInt(0, 3);
  for (let t = 0; t < turns; t++) {
    const maxR = Math.max(...out.map(([r]) => r));
    out = out.map(([r, c]) => [c, maxR - r]);
  }
  if (Math.random() < 0.5) {
    const maxC = Math.max(...out.map(([, c]) => c));
    out = out.map(([r, c]) => [r, maxC - c]);
  }
  const minR = Math.min(...out.map(([r]) => r));
  const minC = Math.min(...out.map(([, c]) => c));
  return out.map(([r, c]) => [r - minR, c - minC]);
}

function makeCubeNetValidRound() {
  const isValid = Math.random() < 0.55;
  const pick = pickOne(isValid ? VALID_CUBE_NETS : INVALID_CUBE_NETS);
  const cells = transformNet(pick.cells);
  return {
    kind: 'cube-net-valid',
    signature: `netv:${pick.name}:${isValid}`,
    cells,
    isValid,
    prompt: 'Fold along the dotted lines! Does this make a closed 3D cube?',
    speakPrompt: 'Imagine folding these six squares along the dotted lines. Does this flat net fold into a closed 3D cube?',
    strategyTip: isValid
      ? 'Pick a middle square as the bottom floor, then fold each flap up 90° to see if all 4 walls and the lid land in unique spots!'
      : 'Look for a 2×2 square cluster, 5 in a row, or two flaps on the same side — those cause two faces to collide!',
  };
}

function makeCubeNetOppositeRound() {
  const pick = pickOne(VALID_CUBE_NETS);
  const cells = transformNet(pick.cells);
  // Rotate array order so the ★ Star lands on a random face (index 0)
  const starIdx = randInt(0, 5);
  const reordered = [cells[starIdx], ...cells.filter((_, i) => i !== starIdx)];
  const folded = foldNet3D(reordered);
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const faceLabels = reordered.map((_, idx) => (idx === 0 ? '★' : letters[idx - 1]));
  const answerLetter = faceLabels[folded.oppositeOf0];
  const distractors = shuffle(letters.filter((l) => l !== answerLetter)).slice(0, 3);
  const options = shuffle([answerLetter, ...distractors]);

  return {
    kind: 'cube-net-opposite',
    signature: `neto:${pick.name}:${starIdx}`,
    cells: reordered,
    faceLabels,
    answer: answerLetter,
    options,
    prompt: 'Fold this paper into a 3D cube! Which letter lands OPPOSITE the ★?',
    speakPrompt: 'Imagine folding this net into a 3D cube with the star as the bottom face. Which letter lands directly on top, opposite the star?',
    strategyTip: 'Hold the ★ flat on the table as the BOTTOM face! Every face touching ★ folds up to become a side wall — the face opposite ★ is the LID on top!',
  };
}

// =========================================================================
// Mode A: Constructive 2D Mosaic / Tangram Tiling (Tiers 1–3)
// =========================================================================
const PIECE_COLORS = [
  { fill: '#2E9690', stroke: '#1B615D' }, // Teal
  { fill: '#E46B49', stroke: '#A84125' }, // Coral
  { fill: '#E9A825', stroke: '#A16E08' }, // Gold
  { fill: '#4A9964', stroke: '#2B683F' }, // Sage
];

const PIECE_SHAPES = {
  dominoH: [[0, 0], [0, 1]],
  dominoV: [[0, 0], [1, 0]],
  bar3H: [[0, 0], [0, 1], [0, 2]],
  bar3V: [[0, 0], [1, 0], [2, 0]],
  sq2: [[0, 0], [0, 1], [1, 0], [1, 1]],
  l3a: [[0, 0], [1, 0], [1, 1]],
  l3b: [[0, 1], [1, 0], [1, 1]],
  l3c: [[0, 0], [0, 1], [1, 0]],
  l3d: [[0, 0], [0, 1], [1, 1]],
  t4: [[0, 0], [0, 1], [0, 2], [1, 1]],
  l4: [[0, 0], [1, 0], [2, 0], [2, 1]],
  z4: [[0, 0], [0, 1], [1, 1], [1, 2]],
};

function normP(cells) {
  const mr = Math.min(...cells.map(([r]) => r));
  const mc = Math.min(...cells.map(([, c]) => c));
  return cells.map(([r, c]) => [r - mr, c - mc]);
}

function rotP90(cells) {
  const n = normP(cells);
  const maxR = Math.max(...n.map(([r]) => r));
  return normP(n.map(([r, c]) => [c, maxR - r]));
}

function makeTileFitRound(tier) {
  const rows = tier === 1 ? 3 : 4;
  const cols = tier === 1 ? 3 : 4;
  const targetPieces = tier === 1 ? 2 : 3;
  const allowRotate = tier >= 2;

  const shapePool =
    tier === 1
      ? ['dominoH', 'dominoV', 'sq2', 'l3a', 'l3b', 'l3c', 'l3d', 'bar3H', 'bar3V']
      : ['dominoH', 'bar3H', 'sq2', 'l3a', 'l3b', 't4', 'l4', 'z4'];

  // Constructively place 2–3 non-overlapping touching pieces to form a guaranteed-solvable silhouette!
  for (let attempt = 0; attempt < 120; attempt++) {
    const occupied = new Map();
    const placed = [];

    for (let p = 0; p < targetPieces; p++) {
      let pieceCells = normP(PIECE_SHAPES[pickOne(shapePool)]);
      const turns = randInt(0, 3);
      for (let t = 0; t < turns; t++) pieceCells = rotP90(pieceCells);

      const candidates = [];
      for (let r0 = 0; r0 < rows; r0++) {
        for (let c0 = 0; c0 < cols; c0++) {
          const abs = pieceCells.map(([dr, dc]) => [r0 + dr, c0 + dc]);
          if (abs.some(([r, c]) => r < 0 || r >= rows || c < 0 || c >= cols || occupied.has(`${r},${c}`))) {
            continue;
          }
          if (p > 0) {
            const touches = abs.some(([r, c]) =>
              [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dr, dc]) => occupied.has(`${r + dr},${c + dc}`))
            );
            if (!touches) continue;
          }
          candidates.push(abs);
        }
      }
      if (candidates.length === 0) break;
      const chosenAbs = pickOne(candidates);
      chosenAbs.forEach(([r, c]) => occupied.set(`${r},${c}`, p));
      // For Tier 2+ allowRotate, scramble initial piece orientation in the tray!
      let trayCells = pieceCells;
      if (allowRotate && Math.random() < 0.65) {
        const scr = randInt(1, 3);
        for (let t = 0; t < scr; t++) trayCells = rotP90(trayCells);
      }
      placed.push({
        id: p,
        cells: trayCells,
        color: PIECE_COLORS[p % PIECE_COLORS.length],
      });
    }

    if (placed.length === targetPieces && occupied.size >= (tier === 1 ? 5 : 8)) {
      const targetCells = Array.from(occupied.keys()).map((k) => k.split(',').map(Number));
      // Trim bounding box tightly
      const minR = Math.min(...targetCells.map(([r]) => r));
      const minC = Math.min(...targetCells.map(([, c]) => c));
      const trimmed = targetCells.map(([r, c]) => [r - minR, c - minC]);
      const boardRows = Math.max(...trimmed.map(([r]) => r)) + 1;
      const boardCols = Math.max(...trimmed.map(([, c]) => c)) + 1;
      const sig = `fit:${boardRows}x${boardCols}:${trimmed.map(([r, c]) => `${r}${c}`).sort().join('-')}`;

      return {
        kind: 'tile-fit',
        signature: sig,
        boardRows,
        boardCols,
        targetCells: trimmed,
        pieces: placed,
        allowRotate,
        prompt: allowRotate
          ? 'Fit all puzzle pieces inside the silhouette (rotate if needed)!'
          : 'Tap a puzzle piece, then tap the board to fill the shape!',
        speakPrompt: allowRotate
          ? 'Select each colorful puzzle piece, turn it if you need to, and snap it inside the outline to fill every square!'
          : 'Tap a colorful piece below, then tap the empty board squares to fill the whole shape!',
        strategyTip: 'Place the biggest or trickiest corner piece FIRST — then the remaining empty space shows right where the last piece goes!',
      };
    }
  }

  // Guaranteed fallback 3x2 rectangle made of L3 + L3
  return {
    kind: 'tile-fit',
    signature: 'fit:fallback',
    boardRows: 2,
    boardCols: 3,
    targetCells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
    pieces: [
      { id: 0, cells: [[0, 0], [1, 0], [1, 1]], color: PIECE_COLORS[0] },
      { id: 1, cells: [[0, 0], [0, 1], [1, 1]], color: PIECE_COLORS[1] },
    ],
    allowRotate: false,
    prompt: 'Tap a puzzle piece, then tap the board to fill the shape!',
    speakPrompt: 'Tap a piece below and place it onto the outline to fill every square!',
    strategyTip: 'Fit one L-piece into the left corner, then drop the second piece into the remaining space!',
  };
}

export function generateSession(tier = 1, profile = null) {
  const scopeKey = `shape-composer:${tier}`;
  const recentSigs = getRecentPuzzleSigs(profile, scopeKey);
  const sessionSigs = new Set();

  const blueprints = {
    1: [
      () => makeTileFitRound(1),
      () => makeTileFitRound(1),
      () => makeTileFitRound(1),
      () => makeTileFitRound(1),
      () => makeTileFitRound(1),
    ],
    2: [
      () => makeTileFitRound(2),
      () => makeTileFitRound(2),
      () => makeCubeNetValidRound(),
      () => makeTileFitRound(2),
      () => makeTileFitRound(2),
    ],
    3: [
      () => makeTileFitRound(3),
      () => makeCubeNetValidRound(),
      () => makeCubeNetOppositeRound(),
      () => makeCubeNetValidRound(),
      () => makeCubeNetOppositeRound(),
    ],
    4: [
      () => makeCubeNetValidRound(),
      () => makeCubeNetOppositeRound(),
      () => makeTileFitRound(4),
      () => makeCubeNetOppositeRound(),
      () => makeCubeNetValidRound(),
    ],
  };

  const rounds = (blueprints[tier] || blueprints[4]).map((fn) => {
    let fallback = null;
    for (let a = 0; a < 22; a++) {
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

function renderMiniPieceSvg(cells, color, cellPx = 20) {
  const n = normP(cells);
  const maxR = Math.max(...n.map(([r]) => r));
  const maxC = Math.max(...n.map(([, c]) => c));
  const w = (maxC + 1) * cellPx + 4;
  const h = (maxR + 1) * cellPx + 4;
  const rects = n
    .map(
      ([r, c]) =>
        `<rect x="${c * cellPx + 2}" y="${r * cellPx + 2}" width="${cellPx - 2}" height="${cellPx - 2}" rx="4" fill="${color.fill}" stroke="${color.stroke}" stroke-width="1.8"/>`
    )
    .join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${rects}</svg>`;
}

function renderCubeNetSvg(cells, faceLabels = null, highlightLabel = null) {
  const maxR = Math.max(...cells.map(([r]) => r));
  const maxC = Math.max(...cells.map(([, c]) => c));
  const s = 44;
  const pad = 12;
  const w = (maxC + 1) * s + pad * 2;
  const h = (maxR + 1) * s + pad * 2;
  const coordSet = new Set(cells.map(([r, c]) => `${r},${c}`));

  const squares = cells
    .map(([r, c], idx) => {
      const x = pad + c * s;
      const y = pad + r * s;
      const isStar = faceLabels && faceLabels[idx] === '★';
      const isWin = highlightLabel && faceLabels && faceLabels[idx] === highlightLabel;
      const fill = isStar ? '#FFE499' : isWin ? '#D6F3E3' : '#E3F3F2';
      const stroke = isStar ? '#C98A10' : isWin ? '#2F9E66' : '#2E9690';
      const label = faceLabels
        ? `<text x="${x + s / 2}" y="${y + s / 2 + 6}" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="${isStar ? 22 : 18}" font-weight="700" fill="${isStar ? '#8C5800' : isWin ? '#18623D' : '#1A4E4B'}">${faceLabels[idx]}</text>`
        : '';
      return `<rect x="${x + 1.5}" y="${y + 1.5}" width="${s - 3}" height="${s - 3}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/>${label}`;
    })
    .join('');

  // Draw dashed fold lines along shared interior edges
  const creases = [];
  for (const [r, c] of cells) {
    if (coordSet.has(`${r},${c + 1}`)) {
      const x = pad + (c + 1) * s;
      creases.push(`<line x1="${x}" y1="${pad + r * s + 4}" x2="${x}" y2="${pad + (r + 1) * s - 4}" stroke="#1E6863" stroke-width="2" stroke-dasharray="4 3"/>`);
    }
    if (coordSet.has(`${r + 1},${c}`)) {
      const y = pad + (r + 1) * s;
      creases.push(`<line x1="${pad + c * s + 4}" y1="${y}" x2="${pad + (c + 1) * s - 4}" y2="${y}" stroke="#1E6863" stroke-width="2" stroke-dasharray="4 3"/>`);
    }
  }

  return `<svg class="net-svg" viewBox="0 0 ${w} ${h}" style="max-width:${Math.min(300, w * 1.15)}px;" role="img" aria-label="Flat 6-square cube net">${squares}${creases.join('')}</svg>`;
}

export function renderRound(container, round, callbacks) {
  if (round.kind === 'tile-fit') {
    renderTileFitRound(container, round, callbacks);
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

  const card = document.createElement('div');
  card.className = 'word-stage-card';
  card.innerHTML = `
    <span class="game-pillar-tag visualize">${round.kind === 'cube-net-valid' ? '3D Cube Net Test' : '3D Opposite Face'}</span>
    <div id="net-svg-slot">${renderCubeNetSvg(round.cells, round.faceLabels || null)}</div>
  `;
  wrap.appendChild(card);

  const grid = document.createElement('div');
  grid.className = round.kind === 'cube-net-valid' ? 'choice-grid' : 'choice-grid cols-4';

  if (round.kind === 'cube-net-valid') {
    const opts = [
      { key: true, label: '✓ Yes — Folds into a Cube!' },
      { key: false, label: '✕ No — Faces Collide!' },
    ];
    opts.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        if (solved) return;
        if (opt.key === round.isValid) {
          solved = true;
          btn.classList.add('is-correct');
          callbacks.onCorrect(
            !hadMistake,
            round.isValid
              ? 'Yes! Every flap folds cleanly around to form all 6 faces of a cube.'
              : 'Good eye! Two squares overlap when folded, so it cannot close into a cube.'
          );
        } else {
          hadMistake = true;
          btn.classList.add('is-wrong');
          btn.disabled = true;
          callbacks.onRetry(round.strategyTip);
        }
      });
      grid.appendChild(btn);
    });
  } else {
    round.options.forEach((letter) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.textContent = `Face ${letter}`;
      btn.addEventListener('click', () => {
        if (solved) return;
        if (letter === round.answer) {
          solved = true;
          btn.classList.add('is-correct');
          const slot = card.querySelector('#net-svg-slot');
          if (slot) slot.innerHTML = renderCubeNetSvg(round.cells, round.faceLabels, letter);
          callbacks.onCorrect(!hadMistake, `Awesome 3D folding! Face ${letter} lands right on top, opposite the ★.`);
        } else {
          hadMistake = true;
          btn.classList.add('is-wrong');
          btn.disabled = true;
          callbacks.onRetry(round.strategyTip);
        }
      });
      grid.appendChild(btn);
    });
  }

  wrap.appendChild(grid);
  container.appendChild(wrap);
}

function renderTileFitRound(container, round, callbacks) {
  const targetSet = new Set(round.targetCells.map(([r, c]) => `${r},${c}`));
  const piecesState = round.pieces.map((p) => ({
    ...p,
    curCells: p.cells.map(([r, c]) => [r, c]),
    placedAt: null, // array of [r, c] on board when placed
  }));
  let selectedId = piecesState[0].id;
  let solved = false;
  let hadMistake = false;

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '16px';
  wrap.style.width = '100%';
  container.appendChild(wrap);

  function ownerAt(r, c) {
    return piecesState.find(
      (p) => p.placedAt && p.placedAt.some(([pr, pc]) => pr === r && pc === c)
    );
  }

  function tryPlaceAt(anchorR, anchorC) {
    const piece = piecesState.find((p) => p.id === selectedId);
    if (!piece || piece.placedAt) return false;
    // Try aligning ANY cell of the selected piece to the tapped square so placement feels super forgiving!
    for (const [refR, refC] of piece.curCells) {
      const mapped = piece.curCells.map(([pr, pc]) => [anchorR + pr - refR, anchorC + pc - refC]);
      const valid = mapped.every(([r, c]) => targetSet.has(`${r},${c}`) && !ownerAt(r, c));
      if (valid) {
        piece.placedAt = mapped;
        // Auto-select next unplaced piece
        const nextFree = piecesState.find((p) => !p.placedAt);
        selectedId = nextFree ? nextFree.id : null;
        return true;
      }
    }
    return false;
  }

  function render() {
    const filledCount = piecesState.reduce((sum, p) => sum + (p.placedAt ? p.placedAt.length : 0), 0);

    wrap.innerHTML = `
      <div class="composer-board" style="grid-template-columns: repeat(${round.boardCols}, var(--comp-cell-size, 54px));" id="comp-board"></div>
      <div class="composer-tray" id="comp-tray"></div>
      <div style="font-size:0.8rem;color:var(--ink-muted);">
        ${filledCount > 0 && !solved ? 'Tip: Tap any placed piece on the board to lift it back up.' : 'Pick a piece below, then tap an empty outline square.'}
      </div>
      <div class="rotate-controls">
        ${
          round.allowRotate
            ? `<button type="button" class="btn btn-secondary" id="btn-comp-rot" ${selectedId === null || solved ? 'disabled' : ''}>↻ Rotate Selected Piece</button>`
            : ''
        }
        <button type="button" class="btn btn-secondary" id="btn-comp-reset" ${filledCount === 0 || solved ? 'disabled' : ''}>Reset Board</button>
      </div>
    `;

    const boardEl = wrap.querySelector('#comp-board');
    for (let r = 0; r < round.boardRows; r++) {
      for (let c = 0; c < round.boardCols; c++) {
        const key = `${r},${c}`;
        if (!targetSet.has(key)) {
          const voidCell = document.createElement('div');
          voidCell.className = 'comp-cell void';
          boardEl.appendChild(voidCell);
          continue;
        }
        const owner = ownerAt(r, c);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `comp-cell socket ${owner ? 'filled' : ''}`;
        if (owner) {
          btn.style.background = owner.color.fill;
          btn.style.borderColor = owner.color.stroke;
          btn.title = 'Tap to lift this piece back to the tray';
        }
        btn.setAttribute('aria-label', `Board row ${r + 1}, col ${c + 1}`);
        btn.addEventListener('click', () => {
          if (solved) return;
          if (owner) {
            callbacks.playClick();
            owner.placedAt = null;
            selectedId = owner.id;
            render();
            return;
          }
          if (selectedId === null) return;
          if (tryPlaceAt(r, c)) {
            callbacks.playClick();
            const nowFilled = piecesState.reduce((sum, p) => sum + (p.placedAt ? p.placedAt.length : 0), 0);
            if (nowFilled === round.targetCells.length) {
              solved = true;
              render();
              callbacks.onCorrect(!hadMistake, 'Perfect fit! Every square of the silhouette is completely tiled.');
            } else {
              render();
            }
          } else {
            hadMistake = true;
            callbacks.onRetry(
              round.allowRotate
                ? 'That piece does not quite fit there — try rotating it or tapping a different square!'
                : 'That piece does not fit there — try placing it in a different corner of the outline!'
            );
          }
        });
        boardEl.appendChild(btn);
      }
    }

    const trayEl = wrap.querySelector('#comp-tray');
    piecesState.forEach((p) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `comp-piece-btn ${selectedId === p.id ? 'selected' : ''} ${p.placedAt ? 'used' : ''}`;
      btn.innerHTML = renderMiniPieceSvg(p.curCells, p.color, 20);
      btn.title = p.placedAt ? 'Placed on board (tap board to pick up)' : 'Tap to select piece';
      btn.disabled = Boolean(p.placedAt) || solved;
      btn.addEventListener('click', () => {
        if (solved || p.placedAt) return;
        callbacks.playClick();
        selectedId = p.id;
        render();
      });
      trayEl.appendChild(btn);
    });

    const rotBtn = wrap.querySelector('#btn-comp-rot');
    if (rotBtn) {
      rotBtn.addEventListener('click', () => {
        if (solved || selectedId === null) return;
        const piece = piecesState.find((p) => p.id === selectedId);
        if (!piece || piece.placedAt) return;
        callbacks.playClick();
        piece.curCells = rotP90(piece.curCells);
        render();
      });
    }

    wrap.querySelector('#btn-comp-reset').addEventListener('click', () => {
      if (solved) return;
      callbacks.playClick();
      piecesState.forEach((p) => {
        p.placedAt = null;
      });
      selectedId = piecesState[0].id;
      render();
    });
  }

  render();
}
