/**
 * Number Line Jumper (Compute Pillar — Symbolic Magnitude, Count-On Hops & Fractions)
 * Grounded in Ramani & Siegler's linear number line research and IES Recommendation 4.
 * - Tier 1 (Sprout): 0–10 / 0–20 with visible ticks + count-on hops ("Start at 5, hop +3!").
 * - Tier 2 (Explorer): 0–100 benchmark estimation (0 / 50 / 100) + skip-count jumps.
 * - Tier 3 (Challenger): Fractions & decimals on 0–1 and 0–2 lines!
 * - Tier 4 (Trailblazer): Negative numbers (-10 to +10), percents, and mixed fractions.
 */

import { randInt, pickOne } from './utils.js';

export const meta = {
  id: 'number-line',
  title: 'Number Line Jumper',
  pillar: 'compute',
  pillarLabel: 'Compute',
  shortDesc: 'Place numbers, count-on hops, and fractions onto a linear number track.',
  scienceNote: 'Linear number-line games measurably boost symbolic magnitude & later fraction/algebra readiness.',
  timed: false,
};

function formatVal(val, displayMode) {
  if (displayMode === 'percent') return `${Math.round(val)}%`;
  if (displayMode === 'decimal') return Number(val.toFixed(2)).toString();
  return String(Math.round(val));
}

function makeRoundForTier(tier, idx) {
  if (tier === 1) {
    const isHop = idx % 2 === 1;
    const max = idx < 2 ? 10 : 20;
    if (isHop) {
      const start = randInt(2, max - 5);
      const hop = randInt(2, Math.min(5, max - start));
      const target = start + hop;
      return {
        min: 0,
        max,
        step: 1,
        target,
        startPos: start,
        hopDelta: hop,
        tolerance: 0.45,
        showAllTicks: true,
        landmarks: max === 10 ? [0, 5, 10] : [0, 5, 10, 15, 20],
        displayMode: 'int',
        targetLabel: `${start} + ${hop}`,
        prompt: `Start at ${start} and hop forward ${hop}!`,
        speakPrompt: `Start at ${start} and hop forward ${hop}. Tap where the frog lands!`,
        strategyTip: `Count on aloud as you hop from ${start}: ${Array.from({ length: hop }, (_, i) => start + i + 1).join(', ')}!`,
      };
    }
    const target = randInt(1, max - 1);
    return {
      min: 0,
      max,
      step: 1,
      target,
      startPos: 0,
      hopDelta: 0,
      tolerance: 0.45,
      showAllTicks: true,
      landmarks: max === 10 ? [0, 5, 10] : [0, 5, 10, 15, 20],
      displayMode: 'int',
      targetLabel: String(target),
      prompt: `Place the frog right on ${target}!`,
      speakPrompt: `Tap or drag the frog to land right on the number ${target}!`,
      strategyTip:
        max === 10
          ? `Use 5 right in the middle as a helper! Is ${target} before 5 or after 5?`
          : `Use 10 right in the middle as a helper! Count forward or backward from 10.`,
    };
  }

  if (tier === 2) {
    const isHop = idx % 2 === 1;
    if (isHop) {
      const start = randInt(1, 6) * 10 + pickOne([0, 5]);
      const hop = pickOne([10, 15, 20, 25]);
      const target = start + hop;
      return {
        min: 0,
        max: 100,
        step: 5,
        target,
        startPos: start,
        hopDelta: hop,
        tolerance: 5.5,
        showAllTicks: false,
        guideSplits: 10,
        landmarks: [0, 50, 100],
        displayMode: 'int',
        targetLabel: `${start} + ${hop}`,
        prompt: `Start at ${start} and jump +${hop}!`,
        speakPrompt: `Start at ${start} and jump forward ${hop} on the number line to 100.`,
        strategyTip: `First add the tens, then the ones! Remember 50 sits right in the middle of 0 and 100.`,
      };
    }
    const target = randInt(8, 92);
    return {
      min: 0,
      max: 100,
      step: 1,
      target,
      startPos: 0,
      hopDelta: 0,
      tolerance: 5.5,
      showAllTicks: false,
      guideSplits: 10,
      landmarks: [0, 50, 100],
      displayMode: 'int',
      targetLabel: String(target),
      prompt: `Estimate where ${target} belongs between 0 and 100!`,
      speakPrompt: `Move the frog to estimate where ${target} belongs between 0 and 100.`,
      strategyTip: `Use 25 (a quarter), 50 (halfway), and 75 (three-quarters) as mental benchmarks!`,
    };
  }

  if (tier === 3) {
    const fractionPool = [
      { label: '1/2', val: 0.5, max: 1, splits: 2, tip: 'Cut the space from 0 to 1 into 2 equal halves.' },
      { label: '1/4', val: 0.25, max: 1, splits: 4, tip: 'Half of a half! Split 0 to 1 into 4 equal pieces.' },
      { label: '3/4', val: 0.75, max: 1, splits: 4, tip: 'Three equal quarter-hops from 0 toward 1 (halfway between 1/2 and 1).' },
      { label: '1/3', val: 1 / 3, max: 1, splits: 3, tip: 'Split 0 to 1 into 3 equal jumps — 1/3 is the first stop.' },
      { label: '2/3', val: 2 / 3, max: 1, splits: 3, tip: 'Split 0 to 1 into 3 equal jumps — 2/3 is the second stop.' },
      { label: '3/5', val: 0.6, max: 1, splits: 5, tip: '3/5 is just a little past halfway (since 2.5/5 is half)!' },
      { label: '5/8', val: 0.625, max: 1, splits: 8, tip: '4/8 is halfway — 5/8 is one eighth further right!' },
      { label: '0.25', val: 0.25, max: 1, splits: 4, tip: '0.25 is the same as one quarter (25 cents of a dollar).' },
      { label: '0.7', val: 0.7, max: 1, splits: 10, tip: '0.7 is 7 tenths — two tenths past halfway (0.5).' },
      { label: '1 1/4', val: 1.25, max: 2, splits: 8, tip: 'Pass 1 whole, then go a quarter of the way toward 2.' },
      { label: '1.5', val: 1.5, max: 2, splits: 4, tip: '1.5 sits right halfway between 1 and 2.' },
    ];
    const item = fractionPool[(idx * 2 + randInt(0, 1)) % fractionPool.length];
    return {
      min: 0,
      max: item.max,
      step: item.max / 40,
      target: item.val,
      startPos: 0,
      hopDelta: 0,
      tolerance: item.max * 0.065,
      showAllTicks: false,
      guideSplits: item.splits,
      landmarks: item.max === 2 ? [0, 1, 2] : [0, 1],
      displayMode: 'decimal',
      targetLabel: item.label,
      prompt: `Place the frog at ${item.label} on the number line!`,
      speakPrompt: `Place the frog at ${item.label} on the number line.`,
      strategyTip: item.tip,
    };
  }

  // Tier 4: Negatives & percents
  if (idx % 2 === 0) {
    const start = randInt(-8, 4);
    const hop = pickOne([-4, -3, 5, 6, 7]);
    const rawTarget = Math.max(-9, Math.min(9, start + hop));
    const target = rawTarget === start ? start + 3 : rawTarget;
    const actualHop = target - start;
    const sign = actualHop >= 0 ? `+${actualHop}` : `${actualHop}`;
    return {
      min: -10,
      max: 10,
      step: 1,
      target,
      startPos: start,
      hopDelta: actualHop,
      tolerance: 0.55,
      showAllTicks: true,
      landmarks: [-10, -5, 0, 5, 10],
      displayMode: 'int',
      targetLabel: `${start} ${actualHop >= 0 ? '+' : '−'} ${Math.abs(actualHop)}`,
      prompt: `Start at ${start} and move ${sign}!`,
      speakPrompt: `Start at ${start} and move ${actualHop >= 0 ? 'right' : 'left'} ${Math.abs(actualHop)}.`,
      strategyTip:
        actualHop >= 0
          ? 'Adding moves RIGHT toward positive numbers — notice how many hops it takes to reach 0 first!'
          : 'Subtracting moves LEFT toward negative numbers — hop to 0 first, then keep going left!',
    };
  }
  const pct = pickOne([15, 25, 33, 60, 75, 85]);
  return {
    min: 0,
    max: 100,
    step: 1,
    target: pct,
    startPos: 0,
    hopDelta: 0,
    tolerance: 5,
    showAllTicks: false,
    guideSplits: 10,
    landmarks: [0, 50, 100],
    displayMode: 'percent',
    targetLabel: `${pct}%`,
    prompt: `Place the frog at ${pct}%!`,
    speakPrompt: `Place the frog at ${pct} percent.`,
    strategyTip: 'Think of 50% as half, 25% as a quarter, and 75% as three-quarters!',
  };
}

export function generateSession(tier = 1) {
  return Array.from({ length: 5 }, (_, idx) => makeRoundForTier(tier, idx));
}

export function renderRound(container, round, callbacks) {
  let currentVal = round.startPos;
  let showGuides = false;
  let solved = false;
  let hadMistake = false;

  const wrap = document.createElement('div');
  wrap.className = 'nl-stage';

  const targetPill = document.createElement('div');
  targetPill.className = 'nl-target-pill';
  targetPill.textContent = round.targetLabel;

  const trackCard = document.createElement('div');
  trackCard.className = 'nl-track-card';

  const readout = document.createElement('div');
  readout.className = 'nl-readout';

  const svgNS = 'http://www.w3.org/2000/svg';
  const trackLeft = 34;
  const trackRight = 566;
  const trackW = trackRight - trackLeft;
  const lineY = 76;

  function valToX(v) {
    return trackLeft + ((v - round.min) / (round.max - round.min)) * trackW;
  }

  function xToVal(x) {
    const ratio = Math.max(0, Math.min(1, (x - trackLeft) / trackW));
    const raw = round.min + ratio * (round.max - round.min);
    if (round.step >= 1) {
      return Math.round(raw / round.step) * round.step;
    }
    return Math.round(raw * 100) / 100;
  }

  function renderSvg(revealTarget = false) {
    const ticks = [];
    if (round.showAllTicks) {
      for (let v = round.min; v <= round.max; v += 1) {
        const x = valToX(v);
        const isLandmark = round.landmarks.includes(v);
        const h = isLandmark ? 18 : 10;
        ticks.push(
          `<line x1="${x}" y1="${lineY - h / 2}" x2="${x}" y2="${lineY + h / 2}" stroke="${isLandmark ? '#232733' : '#9B9488'}" stroke-width="${isLandmark ? 2.6 : 1.6}" stroke-linecap="round"/>`
        );
        if (isLandmark || (round.max <= 10)) {
          ticks.push(
            `<text x="${x}" y="${lineY + 30}" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="15" font-weight="600" fill="#232733">${formatVal(v, round.displayMode)}</text>`
          );
        }
      }
    } else {
      // Landmark ticks
      for (const v of round.landmarks) {
        const x = valToX(v);
        ticks.push(
          `<line x1="${x}" y1="${lineY - 12}" x2="${x}" y2="${lineY + 12}" stroke="#232733" stroke-width="2.8" stroke-linecap="round"/>`
        );
        ticks.push(
          `<text x="${x}" y="${lineY + 32}" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="16" font-weight="600" fill="#232733">${formatVal(v, round.displayMode)}</text>`
        );
      }
      // Subtle guide partitions when requested or revealed
      if ((showGuides || revealTarget) && round.guideSplits) {
        for (let i = 1; i < round.guideSplits; i++) {
          const v = round.min + (i / round.guideSplits) * (round.max - round.min);
          const x = valToX(v);
          ticks.push(
            `<line x1="${x}" y1="${lineY - 8}" x2="${x}" y2="${lineY + 8}" stroke="#2E9690" stroke-width="2" stroke-dasharray="3 2"/>`
          );
        }
      }
    }

    // Start marker if this is a count-on hop puzzle
    let startMarker = '';
    if (round.hopDelta !== 0) {
      const sx = valToX(round.startPos);
      startMarker = `
        <circle cx="${sx}" cy="${lineY}" r="7" fill="#E9A825" stroke="#232733" stroke-width="2"/>
        <text x="${sx}" y="${lineY - 14}" text-anchor="middle" font-family="Lexend, sans-serif" font-size="11" font-weight="700" fill="#8C6208">START (${round.startPos})</text>
      `;
    }

    // Hop arcs revealed upon solving
    let hopArcs = '';
    if (revealTarget && round.hopDelta !== 0 && Math.abs(round.hopDelta) <= 8 && round.showAllTicks) {
      const dir = round.hopDelta > 0 ? 1 : -1;
      for (let i = 0; i < Math.abs(round.hopDelta); i++) {
        const x1 = valToX(round.startPos + i * dir);
        const x2 = valToX(round.startPos + (i + 1) * dir);
        const xm = (x1 + x2) / 2;
        hopArcs += `<path d="M ${x1} ${lineY - 6} Q ${xm} ${lineY - 38} ${x2} ${lineY - 6}" fill="none" stroke="#2E9690" stroke-width="2.4" stroke-dasharray="4 3"/>`;
      }
    } else if (revealTarget && round.hopDelta !== 0) {
      const x1 = valToX(round.startPos);
      const x2 = valToX(round.target);
      hopArcs = `<path d="M ${x1} ${lineY - 6} Q ${(x1 + x2) / 2} ${lineY - 46} ${x2} ${lineY - 6}" fill="none" stroke="#2E9690" stroke-width="2.6" stroke-dasharray="5 3"/>`;
    }

    // Exact target flag upon reveal
    let targetFlag = '';
    if (revealTarget) {
      const tx = valToX(round.target);
      targetFlag = `
        <line x1="${tx}" y1="${lineY - 44}" x2="${tx}" y2="${lineY}" stroke="#2F9E66" stroke-width="3"/>
        <rect x="${tx}" y="${lineY - 44}" width="54" height="22" rx="6" fill="#2F9E66"/>
        <text x="${tx + 27}" y="${lineY - 29}" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="12" font-weight="700" fill="#FFF">${round.targetLabel}</text>
      `;
    }

    const fx = valToX(currentVal);
    // Cute tactile SVG frog hopper marker
    const frog = `
      <g transform="translate(${fx}, ${lineY - 22})" style="cursor: grab;">
        <circle cx="0" cy="22" r="7" fill="#E46B49" stroke="#232733" stroke-width="2.2"/>
        <ellipse cx="0" cy="0" rx="18" ry="14" fill="#46A06B" stroke="#232733" stroke-width="2.2"/>
        <circle cx="-7" cy="-10" r="6" fill="#46A06B" stroke="#232733" stroke-width="2"/>
        <circle cx="7" cy="-10" r="6" fill="#46A06B" stroke="#232733" stroke-width="2"/>
        <circle cx="-7" cy="-10" r="2.5" fill="#232733"/>
        <circle cx="7" cy="-10" r="2.5" fill="#232733"/>
        <path d="M -6 3 Q 0 8 6 3" fill="none" stroke="#232733" stroke-width="2" stroke-linecap="round"/>
      </g>
    `;

    return `
      <svg class="nl-svg" viewBox="0 0 600 120" role="slider" tabindex="0"
           aria-label="Number line from ${round.min} to ${round.max}"
           aria-valuemin="${round.min}" aria-valuemax="${round.max}" aria-valuenow="${currentVal}">
        <line x1="${trackLeft}" y1="${lineY}" x2="${trackRight}" y2="${lineY}" stroke="#232733" stroke-width="4" stroke-linecap="round"/>
        ${ticks.join('')}
        ${startMarker}
        ${hopArcs}
        ${targetFlag}
        ${frog}
      </svg>
    `;
  }

  function updateDisplay(reveal = false) {
    trackCard.innerHTML = renderSvg(reveal);
    if (round.showAllTicks) {
      readout.textContent = `Frog is on: ${formatVal(currentVal, round.displayMode)}`;
    } else {
      readout.textContent = 'Drag or tap anywhere on the line to place the frog';
    }
    bindPointer();
  }

  let isDragging = false;
  function setFromClientX(clientX, svgEl) {
    const rect = svgEl.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * 600;
    currentVal = xToVal(svgX);
    updateDisplay(false);
  }

  function bindPointer() {
    const svgEl = trackCard.querySelector('svg');
    if (!svgEl || solved) return;
    svgEl.addEventListener('pointerdown', (e) => {
      if (solved) return;
      isDragging = true;
      svgEl.setPointerCapture(e.pointerId);
      setFromClientX(e.clientX, svgEl);
      callbacks.playClick();
    });
    svgEl.addEventListener('pointermove', (e) => {
      if (!isDragging || solved) return;
      setFromClientX(e.clientX, svgEl);
    });
    svgEl.addEventListener('pointerup', () => {
      isDragging = false;
    });
    svgEl.addEventListener('keydown', (e) => {
      if (solved) return;
      const delta = round.showAllTicks ? 1 : (round.max - round.min) / 20;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        currentVal = Math.min(round.max, currentVal + delta);
        updateDisplay(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        currentVal = Math.max(round.min, currentVal - delta);
        updateDisplay(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        checkBtn.click();
      }
    });
  }

  const actions = document.createElement('div');
  actions.className = 'rotate-controls';

  if (round.showAllTicks) {
    const hopBackBtn = document.createElement('button');
    hopBackBtn.type = 'button';
    hopBackBtn.className = 'btn btn-secondary';
    hopBackBtn.style.minHeight = '46px';
    hopBackBtn.textContent = '← Hop Back 1';
    hopBackBtn.addEventListener('click', () => {
      if (solved) return;
      currentVal = Math.max(round.min, currentVal - 1);
      callbacks.playClick();
      updateDisplay(false);
    });

    const hopFwdBtn = document.createElement('button');
    hopFwdBtn.type = 'button';
    hopFwdBtn.className = 'btn btn-secondary';
    hopFwdBtn.style.minHeight = '46px';
    hopFwdBtn.textContent = 'Hop Forward 1 →';
    hopFwdBtn.addEventListener('click', () => {
      if (solved) return;
      currentVal = Math.min(round.max, currentVal + 1);
      callbacks.playClick();
      updateDisplay(false);
    });

    actions.appendChild(hopBackBtn);
    actions.appendChild(hopFwdBtn);
  } else if (round.guideSplits) {
    const guideBtn = document.createElement('button');
    guideBtn.type = 'button';
    guideBtn.className = 'btn btn-secondary';
    guideBtn.style.minHeight = '44px';
    guideBtn.textContent = 'Show Equal Helper Ticks';
    guideBtn.addEventListener('click', () => {
      showGuides = !showGuides;
      callbacks.playClick();
      guideBtn.textContent = showGuides ? 'Hide Helper Ticks' : 'Show Equal Helper Ticks';
      updateDisplay(solved);
    });
    actions.appendChild(guideBtn);
  }

  const checkBtn = document.createElement('button');
  checkBtn.type = 'button';
  checkBtn.className = 'btn btn-primary';
  checkBtn.textContent = 'Land Frog Here!';
  checkBtn.addEventListener('click', () => {
    if (solved) return;
    const diff = Math.abs(currentVal - round.target);
    if (diff <= round.tolerance) {
      solved = true;
      currentVal = round.target;
      checkBtn.disabled = true;
      updateDisplay(true);
      callbacks.onCorrect(
        !hadMistake,
        `Great landing! ${round.targetLabel} sits right here on the line.`
      );
    } else {
      hadMistake = true;
      const dirHint = currentVal < round.target ? 'further to the RIGHT →' : 'further to the LEFT ←';
      if (!round.showAllTicks) showGuides = true;
      updateDisplay(false);
      callbacks.onRetry(`Close! Try sliding the frog ${dirHint}`);
    }
  });
  actions.appendChild(checkBtn);

  wrap.appendChild(targetPill);
  wrap.appendChild(trackCard);
  wrap.appendChild(readout);
  wrap.appendChild(actions);
  container.appendChild(wrap);

  updateDisplay(false);
}
