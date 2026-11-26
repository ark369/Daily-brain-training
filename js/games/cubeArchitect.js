/**
 * Cube Architect (Visualize Pillar — 3D Spatial Visualization)
 * - Isometric wooden/ceramic block stacks with guaranteed physical support
 *   and line-of-sight fairness (every column's top face is visible!).
 * - Interactive "Slice by Layers" explosion reveals hidden support cubes.
 * - Tiers 3 & 4 also include Orthographic Top-View matching rounds.
 */

import { randInt, shuffle, makeNumericChoices } from './utils.js';
import { getRecentPuzzleSigs, recordRecentPuzzleSigs } from '../storage.js';

export const meta = {
  id: 'cube-architect',
  title: 'Cube Architect',
  pillar: 'visualize',
  pillarLabel: 'Visualize',
  shortDesc: 'Count 3D block stacks (including hidden support cubes) and match top-down blueprints.',
  scienceNote: 'Trains 3D mental visualization & spatial decomposition (Uttal et al., 2013; Hawes et al., 2022).',
  timed: false,
};

function isConnected(grid) {
  const n = grid.length;
  const cells = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] > 0) cells.push([r, c]);
    }
  }
  if (cells.length === 0) return false;
  const visited = new Set([`${cells[0][0]},${cells[0][1]}`]);
  const queue = [cells[0]];
  while (queue.length > 0) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] > 0 && !visited.has(key)) {
        visited.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return visited.size === cells.length;
}

/**
 * Ensures no non-empty column is completely hidden behind a taller foreground column
 * along the isometric viewing ray (r+k, c+k).
 */
function hasAllColumnTopsVisible(grid) {
  const n = grid.length;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const h = grid[r][c];
      if (h === 0) continue;
      for (let k = 1; r + k < n && c + k < n; k++) {
        if (grid[r + k][c + k] >= h + k) return false;
      }
      // Also avoid tight front-left/front-right overhang hiding a 1-tall back corner
      if (h === 1 && r + 1 < n && c + 1 < n) {
        if (grid[r + 1][c] >= 2 && grid[r][c + 1] >= 2) return false;
      }
    }
  }
  return true;
}

function generateStructure(tier) {
  const cfg = {
    1: { size: 3, maxH: 2, minTotal: 3, maxTotal: 7, minHidden: 0, minCols: 2 },
    2: { size: 3, maxH: 3, minTotal: 7, maxTotal: 13, minHidden: 1, minCols: 4 },
    3: { size: 3, maxH: 4, minTotal: 11, maxTotal: 20, minHidden: 2, minCols: 5 },
    4: { size: 4, maxH: 4, minTotal: 17, maxTotal: 28, minHidden: 4, minCols: 6 },
  }[tier] || { size: 3, maxH: 2, minTotal: 4, maxTotal: 8, minHidden: 0, minCols: 2 };

  for (let attempt = 0; attempt < 280; attempt++) {
    const grid = Array.from({ length: cfg.size }, () => Array(cfg.size).fill(0));
    const numCols = randInt(cfg.minCols, Math.min(cfg.size * cfg.size - 1, cfg.size + 5));

    // Seed near back-center and grow outward to keep natural stepped towers
    grid[0][0] = randInt(1, cfg.maxH);
    let placedCols = 1;
    let guard = 0;
    while (placedCols < numCols && guard < 60) {
      guard += 1;
      const r = randInt(0, cfg.size - 1);
      const c = randInt(0, cfg.size - 1);
      if (grid[r][c] > 0) continue;
      const touches =
        (r > 0 && grid[r - 1][c] > 0) ||
        (r + 1 < cfg.size && grid[r + 1][c] > 0) ||
        (c > 0 && grid[r][c - 1] > 0) ||
        (c + 1 < cfg.size && grid[r][c + 1] > 0);
      if (!touches) continue;

      // Gently bias taller towers toward the back (smaller r+c) so stairs look crisp & clear
      const maxAllowed = Math.max(1, Math.min(cfg.maxH, cfg.maxH - Math.floor((r + c) / 3)));
      grid[r][c] = randInt(1, maxAllowed);
      placedCols += 1;
    }

    let total = 0;
    let maxActualH = 0;
    let baseCount = 0;
    for (let r = 0; r < cfg.size; r++) {
      for (let c = 0; c < cfg.size; c++) {
        total += grid[r][c];
        if (grid[r][c] > maxActualH) maxActualH = grid[r][c];
        if (grid[r][c] > 0) baseCount += 1;
      }
    }
    const hiddenSupports = total - baseCount;

    if (
      total >= cfg.minTotal &&
      total <= cfg.maxTotal &&
      hiddenSupports >= cfg.minHidden &&
      baseCount >= cfg.minCols &&
      isConnected(grid) &&
      hasAllColumnTopsVisible(grid)
    ) {
      return { grid, total, maxH: maxActualH, baseCount };
    }
  }

  // Deterministic guaranteed fallback
  const fallback =
    tier === 1
      ? [[2, 1, 0], [1, 1, 0], [0, 0, 0]]
      : tier === 2
        ? [[3, 2, 1], [2, 1, 0], [1, 0, 0]]
        : tier === 3
          ? [[4, 3, 1], [3, 2, 1], [1, 1, 0]]
          : [[4, 3, 2, 0], [3, 2, 1, 0], [2, 1, 0, 0], [1, 0, 0, 0]];
  let total = 0;
  let maxH = 0;
  let baseCount = 0;
  for (const row of fallback) {
    for (const h of row) {
      total += h;
      if (h > maxH) maxH = h;
      if (h > 0) baseCount += 1;
    }
  }
  return { grid: fallback, total, maxH, baseCount };
}

function getFootprintSignature(grid) {
  return grid.map((row) => row.map((v) => (v > 0 ? '1' : '0')).join('')).join('/');
}

function makeTopViewDistractors(grid) {
  const n = grid.length;
  const correctFootprint = grid.map((row) => row.map((v) => (v > 0 ? 1 : 0)));
  const seen = new Set([getFootprintSignature(correctFootprint)]);
  const options = [{ footprint: correctFootprint, isCorrect: true }];

  // Create structurally plausible same-area distractors first (mirror, rotate, transpose, 1-cell slide)
  const candidates = [
    // Horizontal flip
    correctFootprint.map((row) => [...row].reverse()),
    // Vertical flip
    [...correctFootprint].reverse().map((row) => [...row]),
    // Transpose
    Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => correctFootprint[c][r])),
    // Rotate 90
    Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (_, c) => correctFootprint[n - 1 - c][r])
    ),
  ];

  // Add same-area 1-block slide mutations so distractors match the exact footprint square count!
  const filled = [];
  const empty = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (correctFootprint[r][c]) filled.push([r, c]);
      else empty.push([r, c]);
    }
  }
  for (let i = 0; i < 24 && filled.length > 0 && empty.length > 0; i++) {
    const [fr, fc] = filled[randInt(0, filled.length - 1)];
    const [er, ec] = empty[randInt(0, empty.length - 1)];
    const slid = correctFootprint.map((row) => [...row]);
    slid[fr][fc] = 0;
    slid[er][ec] = 1;
    if (isConnected(slid)) candidates.push(slid);
  }

  // Fallback single-cell toggle mutations if still short
  for (let i = 0; i < 20; i++) {
    const mutated = correctFootprint.map((row) => [...row]);
    const r1 = randInt(0, n - 1);
    const c1 = randInt(0, n - 1);
    mutated[r1][c1] = mutated[r1][c1] ? 0 : 1;
    if (mutated.flat().reduce((a, b) => a + b, 0) >= 2) {
      candidates.push(mutated);
    }
  }

  for (const cand of candidates) {
    if (options.length >= 4) break;
    const sig = getFootprintSignature(cand);
    if (!seen.has(sig)) {
      seen.add(sig);
      options.push({ footprint: cand, isCorrect: false });
    }
  }

  return shuffle(options);
}

function layerCounts(grid) {
  let maxH = 0;
  for (const row of grid) for (const v of row) if (v > maxH) maxH = v;
  const counts = [];
  for (let z = 0; z < maxH; z++) {
    let c = 0;
    for (const row of grid) for (const v of row) if (v > z) c += 1;
    counts.push(c);
  }
  return counts;
}

export function generateSession(tier = 1, profile = null) {
  const scopeKey = `cube-architect:${tier}`;
  const recentSigs = getRecentPuzzleSigs(profile, scopeKey);
  const sessionSigs = new Set();
  const rounds = [];
  const totalRounds = 5;

  const gridSig = (g) => g.map((r) => r.join('')).join('/');

  for (let i = 0; i < totalRounds; i++) {
    const isTopView = tier >= 3 && (i === 2 || i === 4);
    let struct = null;
    let fallback = null;
    for (let a = 0; a < 20; a++) {
      const cand = generateStructure(tier);
      const sig = `${isTopView ? 'tv' : 'cnt'}:${gridSig(cand.grid)}`;
      if (!sessionSigs.has(sig)) {
        fallback = { cand, sig };
        if (!recentSigs.includes(sig)) {
          struct = cand;
          sessionSigs.add(sig);
          break;
        }
      }
    }
    if (!struct) {
      struct = fallback ? fallback.cand : generateStructure(tier);
      if (fallback) sessionSigs.add(fallback.sig);
    }

    const layers = layerCounts(struct.grid);

    if (isTopView) {
      const options = makeTopViewDistractors(struct.grid);
      const correctIdx = options.findIndex((o) => o.isCorrect);
      rounds.push({
        kind: 'topview',
        grid: struct.grid,
        total: struct.total,
        maxH: struct.maxH,
        layers,
        options,
        correctIdx,
        prompt: 'Look straight down from above! Which Top View matches?',
        speakPrompt: 'Look straight down from above like a bird! Which top view matches these blocks?',
        strategyTip:
          'Imagine flying directly above the tower. Only look at WHICH floor squares have at least one block—height does not change the footprint!',
      });
    } else {
      const choices = makeNumericChoices(struct.total, 4, 2, tier === 4 ? 3 : tier === 1 ? 3 : 4);
      const layerBreakdown = layers.map((cnt, idx) => `Layer ${idx + 1}: ${cnt}`).join(' · ');
      rounds.push({
        kind: 'count',
        grid: struct.grid,
        total: struct.total,
        maxH: struct.maxH,
        layers,
        choices,
        answer: struct.total,
        prompt: 'How many cubes are in this stack?',
        speakPrompt: 'How many cubes are in this stack altogether? Remember to count any cubes hiding underneath!',
        strategyTip: `Slice by layers from bottom to top! Try tapping "Split Layers" to see how the bottom layer holds the upper cubes up. (${layerBreakdown})`,
      });
    }
  }
  recordRecentPuzzleSigs(profile, scopeKey, Array.from(sessionSigs), 28);
  return rounds;
}

// Color palettes per vertical layer so exploded layers read clearly
const LAYER_PALETTES = [
  { top: '#5BC0B8', left: '#36968F', right: '#24736E' }, // Layer 1 (Teal)
  { top: '#F4C96B', left: '#E0A432', right: '#B97F18' }, // Layer 2 (Ochre)
  { top: '#F08C6E', left: '#DA6443', right: '#B54729' }, // Layer 3 (Terracotta)
  { top: '#78BF8E', left: '#4D9B67', right: '#33754A' }, // Layer 4 (Sage)
];

function renderIsometricSvg(grid, exploded = false, showOrientationBar = false) {
  const n = grid.length;
  const dx = n >= 4 ? 22 : 26;
  const dy = n >= 4 ? 12.5 : 15;
  const dz = n >= 4 ? 22 : 26;
  const explodeLift = 16;

  let maxH = 0;
  for (const row of grid) for (const v of row) if (v > maxH) maxH = v;

  // First pass: calculate exact visual bounds across all cubes (and full floor footprint when showing orientation)
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  if (showOrientationBar) {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const cx = (c - r) * dx;
        const cy = (c + r) * dy;
        minX = Math.min(minX, cx - dx);
        maxX = Math.max(maxX, cx + dx);
        minY = Math.min(minY, cy - dy);
        maxY = Math.max(maxY, cy + dy + dz);
      }
    }
  }

  for (let z = 0; z < maxH; z++) {
    const liftY = exploded ? -z * explodeLift : 0;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (grid[r][c] <= z) continue;
        const cx = (c - r) * dx;
        const cy = (c + r) * dy - z * dz + liftY;
        minX = Math.min(minX, cx - dx);
        maxX = Math.max(maxX, cx + dx);
        minY = Math.min(minY, cy - dy);
        maxY = Math.max(maxY, cy + dy + dz);
      }
    }
  }

  // Fit smoothly inside viewBox with generous padding
  const padX = showOrientationBar ? 34 : 28;
  const padY = 22;
  const contentW = Math.max(60, maxX - minX);
  const contentH = Math.max(60, maxY - minY);
  const vbW = Math.max(300, contentW + padX * 2);
  const vbH = Math.max(210, contentH + padY * 2 + (showOrientationBar ? 34 : 12));
  const offsetX = (vbW - contentW) / 2 - minX;
  const offsetY = (vbH - contentH - (showOrientationBar ? 24 : 8)) / 2 - minY;

  // Subtle floor grid + coral front edge bar for Top-View rounds so 3D-to-2D orientation is 100% unambiguous!
  let floorMarkup = '';
  if (showOrientationBar) {
    const tiles = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const cx = offsetX + (c - r) * dx;
        const cy = offsetY + (c + r) * dy + dz;
        const pts = `${cx},${cy - dy} ${cx + dx},${cy} ${cx},${cy + dy} ${cx - dx},${cy}`;
        tiles.push(`<polygon points="${pts}" fill="#EFEAE0" stroke="#D3CCC0" stroke-width="1.2"/>`);
      }
    }
    // Bottom edge of Top View = row r = n - 1 (spans from (n-1, 0) left corner to (n-1, n-1) front corner)
    const p1x = offsetX + (0 - (n - 1)) * dx - dx;
    const p1y = offsetY + (0 + (n - 1)) * dy + dz;
    const p2x = offsetX + (n - 1 - (n - 1)) * dx;
    const p2y = offsetY + (n - 1 + (n - 1)) * dy + dy + dz;
    const vx = p2x - p1x;
    const vy = p2y - p1y;
    const edgeLen = Math.hypot(vx, vy) || 1;
    const nx = -vy / edgeLen;
    const ny = vx / edgeLen;
    const angleDeg = (Math.atan2(vy, vx) * 180) / Math.PI;
    const mx = (p1x + p2x) / 2 + nx * 16;
    const my = (p1y + p2y) / 2 + ny * 16 + 3;
    floorMarkup = `
      <g>
        ${tiles.join('')}
        <line x1="${p1x}" y1="${p1y + 3}" x2="${p2x}" y2="${p2y + 3}" stroke="#E46B49" stroke-width="4.5" stroke-linecap="round"/>
        <text x="${mx.toFixed(1)}" y="${my.toFixed(1)}" text-anchor="middle" transform="rotate(${angleDeg.toFixed(1)}, ${mx.toFixed(1)}, ${my.toFixed(1)})" font-family="Lexend, sans-serif" font-size="10" font-weight="700" letter-spacing="0.06em" fill="#B54729">FRONT EDGE</text>
      </g>
    `;
  }

  const layerMarkup = [];
  for (let z = 0; z < maxH; z++) {
    const pal = LAYER_PALETTES[z % LAYER_PALETTES.length];
    const liftY = exploded ? -z * explodeLift : 0;
    const cubes = [];
    for (let sum = 0; sum <= 2 * (n - 1); sum++) {
      for (let r = 0; r < n; r++) {
        const c = sum - r;
        if (c < 0 || c >= n) continue;
        if (grid[r][c] <= z) continue;

        const cx = offsetX + (c - r) * dx;
        const cy = offsetY + (c + r) * dy - z * dz + liftY;

        const topPts = `${cx},${cy - dy} ${cx + dx},${cy} ${cx},${cy + dy} ${cx - dx},${cy}`;
        const leftPts = `${cx - dx},${cy} ${cx},${cy + dy} ${cx},${cy + dy + dz} ${cx - dx},${cy + dz}`;
        const rightPts = `${cx + dx},${cy} ${cx},${cy + dy} ${cx},${cy + dy + dz} ${cx + dx},${cy + dz}`;

        cubes.push(`
          <g>
            <polygon points="${leftPts}" fill="${pal.left}" stroke="#232733" stroke-width="1.5" stroke-linejoin="round"/>
            <polygon points="${rightPts}" fill="${pal.right}" stroke="#232733" stroke-width="1.5" stroke-linejoin="round"/>
            <polygon points="${topPts}" fill="${pal.top}" stroke="#232733" stroke-width="1.5" stroke-linejoin="round"/>
          </g>
        `);
      }
    }
    layerMarkup.push(`<g class="cube-layer-group">${cubes.join('')}</g>`);
  }

  const shadowCx = offsetX + (minX + maxX) / 2;
  const shadowCy = offsetY + maxY + 4;

  return `
    <svg viewBox="0 0 ${vbW.toFixed(1)} ${vbH.toFixed(1)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="3D stack of blocks">
      ${showOrientationBar ? '' : `<ellipse cx="${shadowCx.toFixed(1)}" cy="${Math.min(vbH - 8, shadowCy).toFixed(1)}" rx="${(contentW * 0.44).toFixed(1)}" ry="${Math.max(10, n * dy * 0.36).toFixed(1)}" fill="hsla(32, 24%, 56%, 0.2)"/>`}
      ${floorMarkup}
      ${layerMarkup.join('')}
    </svg>
  `;
}

function renderTopViewSvg(footprint) {
  const n = footprint.length;
  const cell = 18;
  const pad = 6;
  const width = n * cell + pad * 2;
  const height = n * cell + pad * 2 + 12;
  const rects = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const filled = footprint[r][c] > 0;
      rects.push(
        `<rect x="${pad + c * cell}" y="${pad + r * cell}" width="${cell - 2}" height="${cell - 2}" rx="3" fill="${filled ? '#2E9690' : '#EFECE6'}" stroke="${filled ? '#1E6965' : '#D3CCC0'}" stroke-width="1.4"/>`
      );
    }
  }
  const barY = pad + n * cell + 3;
  const frontBar = `
    <line x1="${pad + 2}" y1="${barY}" x2="${pad + n * cell - 4}" y2="${barY}" stroke="#E46B49" stroke-width="3.2" stroke-linecap="round"/>
    <text x="${width / 2}" y="${barY + 8}" text-anchor="middle" font-family="Lexend, sans-serif" font-size="6.8" font-weight="700" fill="#B54729">FRONT</text>
  `;
  return `<svg class="topview-option-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true">${rects.join('')}${frontBar}</svg>`;
}

export function renderRound(container, round, callbacks) {
  let exploded = false;
  let solved = false;
  let hadMistake = false;
  const isTopView = round.kind === 'topview';

  const wrap = document.createElement('div');
  wrap.className = 'cube-stage-wrap';

  const svgBox = document.createElement('div');
  svgBox.className = 'cube-svg-box';
  svgBox.innerHTML = renderIsometricSvg(round.grid, exploded, isTopView);

  const controls = document.createElement('div');
  controls.className = 'cube-controls';

  const splitBtn = document.createElement('button');
  splitBtn.type = 'button';
  splitBtn.className = 'btn btn-secondary';
  splitBtn.style.minHeight = '38px';
  splitBtn.style.padding = '6px 14px';
  splitBtn.style.fontSize = '0.88rem';
  splitBtn.textContent = '↕ Split Layers to Peek';
  splitBtn.addEventListener('click', () => {
    exploded = !exploded;
    callbacks.playClick();
    svgBox.innerHTML = renderIsometricSvg(round.grid, exploded, isTopView);
    splitBtn.textContent = exploded ? '↕ Stack Back Together' : '↕ Split Layers to Peek';
  });
  controls.appendChild(splitBtn);

  wrap.appendChild(svgBox);
  if (round.maxH > 1) {
    wrap.appendChild(controls);
  }

  const gridEl = document.createElement('div');
  gridEl.className = round.kind === 'count' ? 'choice-grid cols-4' : 'choice-grid';

  if (round.kind === 'count') {
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
          if (!exploded && round.maxH > 1) {
            exploded = true;
            svgBox.innerHTML = renderIsometricSvg(round.grid, true, isTopView);
            splitBtn.textContent = '↕ Stack Back Together';
          }
          const layerText = round.layers.map((c, idx) => `Layer ${idx + 1} has ${c}`).join(', ');
          callbacks.onCorrect(
            !hadMistake,
            `Yes! ${round.answer} cubes total (${layerText}).`
          );
        } else {
          hadMistake = true;
          btn.classList.add('is-wrong');
          btn.disabled = true;
          if (!exploded && round.maxH > 1) {
            exploded = true;
            svgBox.innerHTML = renderIsometricSvg(round.grid, true, isTopView);
            splitBtn.textContent = '↕ Stack Back Together';
          }
          callbacks.onRetry(
            'Good try! I split the layers apart so you can count each layer clearly.'
          );
        }
      });
      gridEl.appendChild(btn);
    });
  } else {
    round.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.setAttribute('aria-label', `Top view option ${idx + 1}`);
      btn.innerHTML = renderTopViewSvg(opt.footprint);
      btn.addEventListener('click', () => {
        if (solved) return;
        if (idx === round.correctIdx) {
          solved = true;
          btn.classList.add('is-correct');
          callbacks.onCorrect(!hadMistake, 'Spot on! That matches the exact floor footprint from above.');
        } else {
          hadMistake = true;
          btn.classList.add('is-wrong');
          btn.disabled = true;
          callbacks.onRetry('Look at the bottom teal layer — count how many squares touch the floor in each row!');
        }
      });
      gridEl.appendChild(btn);
    });
  }

  wrap.appendChild(gridEl);
  container.appendChild(wrap);
}
