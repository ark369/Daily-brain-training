/**
 * Number Line Jumper (Compute Pillar — Symbolic Magnitude, Count-On/Back Hops, Fractions & Percents)
 * Grounded in Ramani & Siegler's linear number line research and IES Recommendation 4:
 * - Tier 1 (Sprout): 0–10 & 0–20 placement + forward & backward hops with spoken count-on audio!
 * - Tier 2 (Explorer): 0–100 estimation, forward/backward jumps, bridging tens, & 0–1000 place value!
 * - Tier 3 (Challenger): 60+ procedural fractions (proper, equivalent, mixed/improper) & decimals
 *   with interactive "Cut Line into N Equal Parts" self-partitioning!
 * - Tier 4 (Trailblazer): Negative integer hops (-10..+10), procedural percents, & mixed fraction/decimal triads!
 */

import { randInt, pickOne } from './utils.js';
import { speakText } from '../audio.js';
import { getRecentPuzzleSigs, recordRecentPuzzleSigs, getGameStage } from '../storage.js';

export const meta = {
  id: 'number-line',
  title: 'Number Line Jumper',
  pillar: 'compute',
  pillarLabel: 'Compute',
  shortDesc: 'Place numbers, count-on/back hops, fractions, decimals, and percents onto a linear track.',
  scienceNote: 'Linear number-line games with active partitioning measurably boost fraction & algebra readiness.',
  timed: false,
};

function formatVal(val, displayMode) {
  if (displayMode === 'percent') return `${Math.round(val)}%`;
  if (displayMode === 'decimal') return Number(val.toFixed(2)).toString();
  return String(Math.round(val));
}

function buildTier3FractionPool() {
  const items = [];
  // Proper fractions across denominators 3, 4, 5, 6, 8, 10 (skip trivial 1/2 in T3; equivalents 2/4, 3/6, 4/8 test real equivalence!)
  const denoms = [3, 4, 5, 6, 8, 10];
  for (const d of denoms) {
    for (let n = 1; n < d; n++) {
      const val = n / d;
      items.push({
        sig: `f:${n}/${d}`,
        label: `${n}/${d}`,
        val,
        max: 1,
        splits: d,
        tip: `Try cutting the 0–1 bar into ${d} equal parts — then count ${n} jump${n === 1 ? '' : 's'} from 0!`,
      });
    }
  }
  // Mixed & improper fractions on 0–2
  const mixed = [
    { label: '1 1/4', val: 1.25, splits: 8, tip: 'Pass 1 whole, then go 1 quarter past 1!' },
    { label: '1 1/2', val: 1.5, splits: 4, tip: '1 1/2 sits right halfway between 1 and 2!' },
    { label: '1 3/4', val: 1.75, splits: 8, tip: 'Pass 1 whole, then three-quarters of the way to 2!' },
    { label: '1 1/3', val: 4 / 3, splits: 6, tip: 'Each whole splits into 3 thirds — 1 1/3 is one third past 1!' },
    { label: '1 2/3', val: 5 / 3, splits: 6, tip: 'Two thirds past 1 — one third before 2!' },
    { label: '5/4', val: 1.25, splits: 8, tip: '4/4 equals 1 whole, so 5/4 is 1 quarter past 1!' },
    { label: '7/4', val: 1.75, splits: 8, tip: '8/4 equals 2 wholes, so 7/4 is just 1 quarter before 2!' },
    { label: '3/2', val: 1.5, splits: 4, tip: '2/2 is 1 whole, so 3/2 is one and a half (1.5)!' },
    { label: '5/3', val: 5 / 3, splits: 6, tip: '3/3 is 1 whole, so 5/3 is 1 and 2/3!' },
  ];
  for (const m of mixed) {
    items.push({ sig: `m:${m.label}`, ...m, max: 2 });
  }
  // Decimals on 0–1 and 0–2
  for (const dec of [0.15, 0.2, 0.25, 0.35, 0.4, 0.6, 0.65, 0.75, 0.85, 0.9]) {
    items.push({
      sig: `d:${dec}`,
      label: String(dec),
      val: dec,
      max: 1,
      splits: (dec * 100) % 25 === 0 ? 4 : 10,
      tip: `Think of 0.5 as halfway! Cut into 10 tenths (or 4 quarters) to spot ${dec}.`,
    });
  }
  for (const dec of [1.2, 1.25, 1.5, 1.75, 1.8]) {
    items.push({
      sig: `d2:${dec}`,
      label: String(dec),
      val: dec,
      max: 2,
      splits: 8,
      tip: `${dec} is past 1 whole — look at how far between 1 and 2 it lands!`,
    });
  }
  return items;
}

const TIER3_FRACTION_POOL = buildTier3FractionPool();

// Tier 4 Fraction/Decimal -> Percent conversion challenges on 0%..100%
const TIER4_PERCENT_CONV_POOL = [
  { sig: 'p:1/8', label: '1/8', val: 12.5, splits: 8, tip: '1/8 is half of 1/4 (25%) → 12.5%!' },
  { sig: 'p:3/8', label: '3/8', val: 37.5, splits: 8, tip: 'Each eighth is 12.5%, so 3/8 = 37.5% — try cutting into 8 parts!' },
  { sig: 'p:5/8', label: '5/8', val: 62.5, splits: 8, tip: '4/8 is 50%, plus one more eighth (12.5%) = 62.5%!' },
  { sig: 'p:7/8', label: '7/8', val: 87.5, splits: 8, tip: 'One eighth (12.5%) short of 100% → 87.5%!' },
  { sig: 'p:1/3', label: '1/3', val: 33.33, splits: 3, tip: 'One third of 100% is about 33%!' },
  { sig: 'p:2/3', label: '2/3', val: 66.67, splits: 3, tip: 'Two thirds of 100% is about 67%!' },
  { sig: 'p:1/6', label: '1/6', val: 16.67, splits: 6, tip: '1/6 is half of 1/3 (33%) → about 17%!' },
  { sig: 'p:5/6', label: '5/6', val: 83.33, splits: 6, tip: '5/6 is one sixth (~17%) below 100% → about 83%!' },
  { sig: 'p:3/5', label: '3/5', val: 60, splits: 5, tip: 'Each fifth is 20%, so 3/5 = 60%!' },
  { sig: 'p:4/5', label: '4/5', val: 80, splits: 5, tip: 'Each fifth is 20%, so 4/5 = 80%!' },
  { sig: 'p:7/20', label: '7/20', val: 35, splits: 10, tip: 'Multiply top & bottom by 5: 7/20 = 35/100 = 35%!' },
  { sig: 'p:9/20', label: '9/20', val: 45, splits: 10, tip: '9/20 = 45/100 = 45% — just under halfway!' },
  { sig: 'p:13/20', label: '13/20', val: 65, splits: 10, tip: '13/20 = 65/100 = 65%!' },
  { sig: 'p:17/20', label: '17/20', val: 85, splits: 10, tip: '17/20 = 85/100 = 85%!' },
  { sig: 'p:19/20', label: '19/20', val: 95, splits: 10, tip: '19/20 = 95/100 = 95%!' },
  { sig: 'p:3/25', label: '3/25', val: 12, splits: 10, tip: 'Multiply top & bottom by 4: 3/25 = 12/100 = 12%!' },
  { sig: 'p:7/25', label: '7/25', val: 28, splits: 10, tip: '7/25 = 28/100 = 28% — just past 25%!' },
  { sig: 'p:11/25', label: '11/25', val: 44, splits: 10, tip: '11/25 = 44/100 = 44%!' },
  { sig: 'p:18/25', label: '18/25', val: 72, splits: 10, tip: '18/25 = 72/100 = 72% — just under 75%!' },
  { sig: 'p:0.375', label: '0.375', val: 37.5, splits: 8, tip: 'Slide the decimal two places right: 0.375 = 37.5% (3/8)!' },
  { sig: 'p:0.625', label: '0.625', val: 62.5, splits: 8, tip: '0.625 = 62.5% (5/8)!' },
  { sig: 'p:0.85', label: '0.85', val: 85, splits: 10, tip: '0.85 = 85%!' },
];

// Tier 4 Negative Rational Numbers on -2..+2
const TIER4_NEG_RATIONAL_POOL = [
  { sig: 'nr:-1/4', label: '−1/4', val: -0.25, splits: 4, tip: 'Negative numbers go LEFT of 0 — −1/4 is one quarter left of 0!' },
  { sig: 'nr:-3/4', label: '−3/4', val: -0.75, splits: 4, tip: 'Move left from 0 toward −1: −3/4 sits three quarters of the way to −1!' },
  { sig: 'nr:-5/4', label: '−5/4', val: -1.25, splits: 4, tip: '−4/4 is −1, so −5/4 goes 1 quarter FURTHER LEFT past −1!' },
  { sig: 'nr:-7/4', label: '−7/4', val: -1.75, splits: 4, tip: '−8/4 is −2, so −7/4 sits 1 quarter to the right of −2!' },
  { sig: 'nr:-1.5', label: '−1.5', val: -1.5, splits: 2, tip: '−1.5 sits right halfway between −1 and −2!' },
  { sig: 'nr:-1.25', label: '−1.25', val: -1.25, splits: 4, tip: 'Go left past −1, then a quarter of the way toward −2!' },
  { sig: 'nr:-1.75', label: '−1.75', val: -1.75, splits: 4, tip: 'Three quarters of the way from −1 toward −2!' },
  { sig: 'nr:-2/3', label: '−2/3', val: -2 / 3, splits: 3, tip: 'Cut each whole into 3 thirds and hop 2 thirds LEFT of 0!' },
  { sig: 'nr:-4/3', label: '−4/3', val: -4 / 3, splits: 3, tip: '−3/3 is −1, so −4/3 is one third past −1 toward −2!' },
  { sig: 'nr:-5/3', label: '−5/3', val: -5 / 3, splits: 3, tip: '−5/3 is −1 2/3 — just one third right of −2!' },
  { sig: 'nr:-0.6', label: '−0.6', val: -0.6, splits: 5, tip: '−0.6 is −3/5 — just past halfway (−0.5) toward −1!' },
  { sig: 'nr:-1.4', label: '−1.4', val: -1.4, splits: 5, tip: 'Go left past −1, then two fifths (0.4) toward −2!' },
  { sig: 'nr:-5/8', label: '−5/8', val: -0.625, splits: 8, tip: 'Cut each whole into 8 eighths and count 5 eighths LEFT of 0!' },
  { sig: 'nr:-3/2', label: '−3/2', val: -1.5, splits: 2, tip: '−3/2 = −1 1/2, halfway between −1 and −2!' },
];

function makeRoundForTier(tier, idx, stage = 1) {
  if (tier === 1) {
    const max = idx < 2 ? 10 : 20;
    const isHop = idx === 1 || idx === 3;
    if (isHop) {
      const isBack = (idx === 3 && Math.random() < 0.55) || (stage >= 2 && Math.random() < 0.45);
      if (isBack) {
        const start = randInt(5, max);
        const hop = randInt(2, Math.min(5, start - 1));
        const target = start - hop;
        return {
          signature: `nl1:sub:${max}:${start}-${hop}`,
          min: 0,
          max,
          step: 1,
          target,
          startPos: start,
          hopDelta: -hop,
          tolerance: 0.45,
          showAllTicks: true,
          speakHops: true,
          landmarks: max === 10 ? [0, 5, 10] : [0, 5, 10, 15, 20],
          displayMode: 'int',
          targetLabel: `${start} − ${hop}`,
          prompt: `Start at ${start} and hop BACK ${hop}!`,
          speakPrompt: `Start at ${start} and hop backward ${hop}. Tap Hop Back or place the frog where it lands!`,
          strategyTip: `Count backward aloud as you hop left from ${start}: ${Array.from({ length: hop }, (_, i) => start - i - 1).join(', ')}!`,
        };
      }
      const start = randInt(2, max - 5);
      const hop = randInt(2, Math.min(5, max - start));
      const target = start + hop;
      return {
        signature: `nl1:add:${max}:${start}+${hop}`,
        min: 0,
        max,
        step: 1,
        target,
        startPos: start,
        hopDelta: hop,
        tolerance: 0.45,
        showAllTicks: true,
        speakHops: true,
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
      signature: `nl1:est:${max}:${target}`,
      min: 0,
      max,
      step: 1,
      target,
      startPos: 0,
      hopDelta: 0,
      tolerance: 0.45,
      showAllTicks: true,
      speakHops: true,
      landmarks: max === 10 ? [0, 5, 10] : [0, 5, 10, 15, 20],
      displayMode: 'int',
      targetLabel: String(target),
      prompt: `Place the frog right on ${target}!`,
      speakPrompt: `Tap or hop the frog to land right on the number ${target}!`,
      strategyTip:
        max === 10
          ? `Use 5 right in the middle as a helper! Is ${target} before 5 or after 5?`
          : `Use 10 right in the middle as a helper! Count forward or backward from 10.`,
    };
  }

  if (tier === 2) {
    // Include 0–1000 place-value benchmark on round 4 (or stage 2+)
    if (idx === 4 && (stage >= 2 || Math.random() < 0.55)) {
      const target = randInt(6, 94) * 10;
      return {
        signature: `nl2:1000:${target}`,
        min: 0,
        max: 1000,
        step: 10,
        target,
        startPos: 0,
        hopDelta: 0,
        tolerance: 55,
        showAllTicks: false,
        guideSplits: 10,
        landmarks: [0, 500, 1000],
        displayMode: 'int',
        targetLabel: String(target),
        prompt: `Estimate where ${target} belongs between 0 and 1000!`,
        speakPrompt: `Place the frog where ${target} belongs between zero and one thousand.`,
        strategyTip: 'Think of 250 (a quarter), 500 (halfway), and 750 (three-quarters) as giant landmarks!',
      };
    }

    if (idx === 1 || idx === 3) {
      const isBack = idx === 3 || Math.random() < 0.45;
      if (isBack) {
        const start = randInt(4, 9) * 10 + pickOne([0, 5]);
        const hop = pickOne([10, 15, 20, 25, 30]);
        const target = start - hop;
        return {
          signature: `nl2:sub:${start}-${hop}`,
          min: 0,
          max: 100,
          step: 5,
          target,
          startPos: start,
          hopDelta: -hop,
          tolerance: 5.5,
          showAllTicks: false,
          guideSplits: 10,
          landmarks: [0, 50, 100],
          displayMode: 'int',
          targetLabel: `${start} − ${hop}`,
          prompt: `Start at ${start} and jump BACK −${hop}!`,
          speakPrompt: `Start at ${start} and jump backward ${hop} on the number line to 100.`,
          strategyTip: `Subtract the tens first, then the ones! Jumping backward moves LEFT toward 0.`,
        };
      }
      const start = randInt(1, 6) * 10 + pickOne([0, 5]);
      const hop = pickOne([10, 15, 20, 25, 30]);
      const target = start + hop;
      return {
        signature: `nl2:add:${start}+${hop}`,
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
        strategyTip: 'First add the tens, then the ones! Remember 50 sits right in the middle of 0 and 100.',
      };
    }
    const target = randInt(7, 93);
    return {
      signature: `nl2:est:${target}`,
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
      strategyTip: 'Use 25 (a quarter), 50 (halfway), and 75 (three-quarters) as mental benchmarks!',
    };
  }

  if (tier === 3) {
    const item = pickOne(TIER3_FRACTION_POOL);
    return {
      signature: `nl3:${item.sig}`,
      min: 0,
      max: item.max,
      step: item.max / 40,
      target: item.val,
      startPos: 0,
      hopDelta: 0,
      tolerance: item.max * 0.065,
      showAllTicks: false,
      guideSplits: item.splits,
      allowSelfPartition: true,
      landmarks: item.max === 2 ? [0, 1, 2] : [0, 1],
      displayMode: 'decimal',
      targetLabel: item.label,
      prompt: `Place the frog at ${item.label} on the number line!`,
      speakPrompt: `Place the frog at ${item.label} on the number line.`,
      strategyTip: item.tip,
    };
  }

  // Tier 4 (Trailblazer, Ages 11+):
  // - idx 0 & 3: Zero-crossing / negative integer arithmetic on -15..+15 (landmarks only, NEVER all-positive!)
  // - idx 1 & 4: Fraction/Decimal -> Percent conversion on 0%..100%
  // - idx 2: Negative fractions & decimals on -2..+2
  if (idx === 0 || idx === 3) {
    let start;
    let target;
    let actualHop;
    // Guarantee every integer round involves negative numbers (70% crossing 0, 30% negative-to-negative)
    if (Math.random() < 0.72) {
      if (Math.random() < 0.5) {
        start = randInt(-12, -3);
        target = randInt(2, 11);
      } else {
        start = randInt(3, 12);
        target = randInt(-11, -2);
      }
    } else {
      start = randInt(-13, -2);
      const delta = pickOne([-9, -8, -7, -6, -5, 4, 5, 6, 7, 8]);
      target = Math.max(-14, Math.min(-1, start + delta));
      if (target === start) target = start <= -7 ? start + 5 : start - 5;
    }
    actualHop = target - start;
    const sign = actualHop >= 0 ? `+${actualHop}` : `−${Math.abs(actualHop)}`;
    const fmtN = (n) => (n < 0 ? `−${Math.abs(n)}` : String(n));
    return {
      signature: `nl4:int:${start}:${actualHop}`,
      min: -15,
      max: 15,
      step: 1,
      target,
      startPos: start,
      hopDelta: actualHop,
      tolerance: 0.55,
      showAllTicks: true,
      landmarks: [-15, -10, -5, 0, 5, 10, 15],
      displayMode: 'int',
      targetLabel: `${fmtN(start)} ${actualHop >= 0 ? '+' : '−'} ${Math.abs(actualHop)}`,
      prompt: `Start at ${fmtN(start)} and move ${sign}!`,
      speakPrompt: `Start at ${start < 0 ? `negative ${Math.abs(start)}` : start} and move ${actualHop >= 0 ? 'right' : 'left'} ${Math.abs(actualHop)}.`,
      strategyTip:
        actualHop >= 0
          ? `Bridge through 0! From ${fmtN(start)}, it takes ${Math.abs(Math.min(0, start))} to reach 0, then keep moving right.`
          : `Bridge through 0! From ${fmtN(start)}, moving left crosses 0 into negative numbers — use −5, −10, −15 as anchors.`,
    };
  }

  if (idx === 2) {
    const item = pickOne(TIER4_NEG_RATIONAL_POOL);
    return {
      signature: `nl4:${item.sig}`,
      min: -2,
      max: 2,
      step: 0.05,
      target: item.val,
      startPos: 0,
      hopDelta: 0,
      tolerance: 0.14,
      showAllTicks: false,
      guideSplits: item.splits * 4,
      allowSelfPartition: true,
      landmarks: [-2, -1, 0, 1, 2],
      displayMode: 'decimal',
      targetLabel: item.label,
      prompt: `Place the frog at ${item.label} on the number line!`,
      speakPrompt: `Place the frog at ${item.label} between negative two and positive two.`,
      strategyTip: item.tip,
    };
  }

  const conv = pickOne(TIER4_PERCENT_CONV_POOL);
  return {
    signature: `nl4:${conv.sig}`,
    min: 0,
    max: 100,
    step: 0.5,
    target: conv.val,
    startPos: 0,
    hopDelta: 0,
    tolerance: 4,
    showAllTicks: false,
    guideSplits: conv.splits,
    allowSelfPartition: true,
    landmarks: [0, 50, 100],
    displayMode: 'percent',
    targetLabel: `${conv.label} → ?%`,
    prompt: `Convert ${conv.label} to a percent and land the frog!`,
    speakPrompt: `Convert ${conv.label} to a percent and place the frog between zero percent and one hundred percent.`,
    strategyTip: conv.tip,
  };
}

export function generateSession(tier = 1, profile = null) {
  const scopeKey = `number-line:${tier}`;
  const recentSigs = getRecentPuzzleSigs(profile, scopeKey);
  const stage = getGameStage(profile, meta.id);
  const sessionSigs = new Set();
  const rounds = [];

  for (let idx = 0; idx < 5; idx++) {
    let chosen = null;
    let fallback = null;
    for (let attempt = 0; attempt < 24; attempt++) {
      const cand = makeRoundForTier(tier, idx, stage);
      if (!sessionSigs.has(cand.signature)) {
        fallback = cand;
        if (!recentSigs.includes(cand.signature)) {
          chosen = cand;
          break;
        }
      }
    }
    const r = chosen || fallback || makeRoundForTier(tier, idx, stage);
    sessionSigs.add(r.signature);
    rounds.push(r);
  }

  recordRecentPuzzleSigs(profile, scopeKey, Array.from(sessionSigs), 30);
  return rounds;
}

export function renderRound(container, round, callbacks) {
  let currentVal = round.startPos;
  let showGuides = false;
  let activePartitions = 0; // User-chosen equal cuts per whole unit (active self-partitioning!)
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
    // Gentle magnetic snap to active self-partition ticks when kid cuts the bar into N equal parts!
    if (activePartitions > 0) {
      const unitStep = round.displayMode === 'percent' ? 100 / activePartitions : 1 / activePartitions;
      const nearest = Math.round(raw / unitStep) * unitStep;
      const snapRadius = (round.max - round.min) * 0.032;
      if (Math.abs(raw - nearest) <= snapRadius && nearest >= round.min && nearest <= round.max) {
        return Number(nearest.toFixed(4));
      }
    }
    return Math.round(raw * 100) / 100;
  }

  function buildTicksAndRevealMarkup(revealTarget = false) {
    const ticks = [];
    if (round.showAllTicks) {
      for (let v = round.min; v <= round.max; v += 1) {
        const x = valToX(v);
        const isLandmark = round.landmarks.includes(v);
        const h = isLandmark ? 18 : 10;
        ticks.push(
          `<line x1="${x}" y1="${lineY - h / 2}" x2="${x}" y2="${lineY + h / 2}" stroke="${isLandmark ? '#232733' : '#9B9488'}" stroke-width="${isLandmark ? 2.6 : 1.6}" stroke-linecap="round"/>`
        );
        if (isLandmark || round.max <= 10) {
          ticks.push(
            `<text x="${x}" y="${lineY + 30}" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="15" font-weight="600" fill="#232733">${formatVal(v, round.displayMode)}</text>`
          );
        }
      }
    } else {
      for (const v of round.landmarks) {
        const x = valToX(v);
        ticks.push(
          `<line x1="${x}" y1="${lineY - 12}" x2="${x}" y2="${lineY + 12}" stroke="#232733" stroke-width="2.8" stroke-linecap="round"/>`
        );
        ticks.push(
          `<text x="${x}" y="${lineY + 32}" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="16" font-weight="600" fill="#232733">${formatVal(v, round.displayMode)}</text>`
        );
      }

      const wholeUnits = round.displayMode === 'percent' ? 1 : Math.max(1, Math.round(round.max - round.min));
      const splitsToDraw =
        activePartitions > 0
          ? activePartitions * wholeUnits
          : (showGuides || revealTarget) && round.guideSplits
            ? round.guideSplits
            : 0;

      if (splitsToDraw > 0) {
        for (let i = 1; i < splitsToDraw; i++) {
          const v = round.min + (i / splitsToDraw) * (round.max - round.min);
          if (round.landmarks.some((lm) => Math.abs(lm - v) < 0.001)) continue;
          const x = valToX(v);
          ticks.push(
            `<line x1="${x}" y1="${lineY - 9}" x2="${x}" y2="${lineY + 9}" stroke="#2E9690" stroke-width="2.1" stroke-dasharray="3 2"/>`
          );
        }
      }
    }

    let startMarker = '';
    if (round.hopDelta !== 0) {
      const sx = valToX(round.startPos);
      const labelText = `START (${round.startPos})`;
      const pillW = Math.max(66, labelText.length * 6.8 + 14);
      const pillX = Math.max(6, Math.min(600 - pillW - 6, sx - pillW / 2));
      const pillY = lineY + 38;
      startMarker = `
        <line x1="${sx}" y1="${lineY + 7}" x2="${sx}" y2="${pillY}" stroke="#D19A24" stroke-width="1.6" stroke-dasharray="2.5 2.5"/>
        <circle cx="${sx}" cy="${lineY}" r="7" fill="#E9A825" stroke="#232733" stroke-width="2"/>
        <rect x="${pillX.toFixed(1)}" y="${pillY}" width="${pillW.toFixed(1)}" height="20" rx="10" fill="#FEF4D8" stroke="#E0A432" stroke-width="1.4"/>
        <text x="${(pillX + pillW / 2).toFixed(1)}" y="${pillY + 13.5}" text-anchor="middle" font-family="Lexend, sans-serif" font-size="10.5" font-weight="700" fill="#8C6208">${labelText}</text>
      `;
    }

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

    return `${ticks.join('')}${startMarker}${hopArcs}`;
  }

  function buildTargetFlagMarkup(revealTarget) {
    if (!revealTarget) return '';
    const tx = valToX(round.target);
    const flagText =
      round.displayMode === 'percent'
        ? `${Number(round.target.toFixed(1))}%`
        : round.hopDelta !== 0
          ? `${round.target < 0 ? `−${Math.abs(round.target)}` : round.target}`
          : round.targetLabel;
    const boxW = Math.max(48, flagText.length * 8.5 + 16);
    const boxX = Math.min(592 - boxW, Math.max(8, tx - boxW / 2));
    const boxY = Math.max(4, lineY - 70);
    return `
      <line x1="${tx}" y1="${boxY + 22}" x2="${tx}" y2="${lineY - 38}" stroke="#2F9E66" stroke-width="2.5" stroke-dasharray="3 2"/>
      <rect x="${boxX.toFixed(1)}" y="${boxY}" width="${boxW.toFixed(1)}" height="22" rx="7" fill="#2F9E66"/>
      <text x="${(boxX + boxW / 2).toFixed(1)}" y="${boxY + 15}" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="12" font-weight="700" fill="#FFF">${flagText}</text>
    `;
  }

  // Mount persistent SVG once so pointer capture & keyboard focus stay unbroken during smooth dragging!
  trackCard.innerHTML = `
    <svg class="nl-svg" viewBox="0 0 600 132" role="slider" tabindex="0"
         aria-label="Number line from ${round.min} to ${round.max}"
         aria-valuemin="${round.min}" aria-valuemax="${round.max}" aria-valuenow="${currentVal}">
      <line x1="${trackLeft}" y1="${lineY}" x2="${trackRight}" y2="${lineY}" stroke="#232733" stroke-width="4" stroke-linecap="round"/>
      <g id="nl-decor-layer"></g>
      <g id="nl-frog" transform="translate(${valToX(currentVal)}, ${lineY - 22})" style="cursor: grab;">
        <circle cx="0" cy="22" r="7" fill="#E46B49" stroke="#232733" stroke-width="2.2"/>
        <ellipse cx="0" cy="0" rx="18" ry="14" fill="#46A06B" stroke="#232733" stroke-width="2.2"/>
        <circle cx="-7" cy="-10" r="6" fill="#46A06B" stroke="#232733" stroke-width="2"/>
        <circle cx="7" cy="-10" r="6" fill="#46A06B" stroke="#232733" stroke-width="2"/>
        <circle cx="-7" cy="-10" r="2.5" fill="#232733"/>
        <circle cx="7" cy="-10" r="2.5" fill="#232733"/>
        <path d="M -6 3 Q 0 8 6 3" fill="none" stroke="#232733" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g id="nl-flag-layer"></g>
    </svg>
  `;

  const svgEl = trackCard.querySelector('svg');
  const decorLayer = trackCard.querySelector('#nl-decor-layer');
  const flagLayer = trackCard.querySelector('#nl-flag-layer');
  const frogEl = trackCard.querySelector('#nl-frog');

  function updateFrogPositionOnly() {
    frogEl.setAttribute('transform', `translate(${valToX(currentVal)}, ${lineY - 22})`);
    svgEl.setAttribute('aria-valuenow', String(currentVal));
    if (round.showAllTicks) {
      readout.textContent = `Frog is on: ${formatVal(currentVal, round.displayMode)}`;
    } else if (activePartitions > 0) {
      readout.textContent =
        round.displayMode === 'percent'
          ? `Cut 0%–100% into ${activePartitions} equal parts · Drag or tap to place the frog`
          : `Cut into ${activePartitions} equal parts per whole · Drag or tap to place the frog`;
    } else {
      readout.textContent = 'Drag or tap anywhere on the line to place the frog';
    }
  }

  function updateDisplay(reveal = false) {
    decorLayer.innerHTML = buildTicksAndRevealMarkup(reveal);
    flagLayer.innerHTML = buildTargetFlagMarkup(reveal);
    updateFrogPositionOnly();
  }

  let isDragging = false;
  function setFromClientX(clientX) {
    const rect = svgEl.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * 600;
    currentVal = xToVal(svgX);
    updateFrogPositionOnly();
  }

  svgEl.addEventListener('pointerdown', (e) => {
    if (solved) return;
    isDragging = true;
    try {
      svgEl.setPointerCapture(e.pointerId);
    } catch {
      // ignore synthetic pointer events
    }
    setFromClientX(e.clientX);
    callbacks.playClick();
  });
  svgEl.addEventListener('pointermove', (e) => {
    if (!isDragging || solved) return;
    setFromClientX(e.clientX);
  });
  const endDrag = () => {
    isDragging = false;
  };
  svgEl.addEventListener('pointerup', endDrag);
  svgEl.addEventListener('pointercancel', endDrag);
  svgEl.addEventListener('keydown', (e) => {
    if (solved) return;
    const delta = round.showAllTicks
      ? 1
      : activePartitions > 0
        ? round.displayMode === 'percent'
          ? 100 / activePartitions
          : 1 / activePartitions
        : (round.max - round.min) / 20;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      currentVal = Math.min(round.max, Number((currentVal + delta).toFixed(4)));
      updateFrogPositionOnly();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      currentVal = Math.max(round.min, Number((currentVal - delta).toFixed(4)));
      updateFrogPositionOnly();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      checkBtn.click();
    }
  });

  // Optional active self-partitioning bar for Tiers 3–4 fractions, decimals & percents!
  let partBar = null;
  if (round.allowSelfPartition) {
    partBar = document.createElement('div');
    partBar.className = 'nl-partition-bar';
    const cuts = [2, 3, 4, 5, 6, 8, 10];
    partBar.innerHTML = `<span class="nl-part-label">${round.displayMode === 'percent' ? 'Cut 0%–100% into:' : 'Cut each whole into:'}</span>`;
    cuts.forEach((n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'nl-part-btn';
      b.textContent = String(n);
      b.title = `Cut each whole unit into ${n} equal parts`;
      b.addEventListener('click', () => {
        if (solved) return;
        callbacks.playClick();
        activePartitions = activePartitions === n ? 0 : n;
        partBar.querySelectorAll('.nl-part-btn').forEach((btn) => {
          btn.classList.toggle('active', Number(btn.textContent) === activePartitions);
        });
        updateDisplay(false);
      });
      partBar.appendChild(b);
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
      if (round.speakHops && callbacks.profile && callbacks.profile.readAloud) {
        speakText(String(currentVal), true);
      }
      updateFrogPositionOnly();
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
      if (round.speakHops && callbacks.profile && callbacks.profile.readAloud) {
        speakText(String(currentVal), true);
      }
      updateFrogPositionOnly();
    });

    actions.appendChild(hopBackBtn);
    actions.appendChild(hopFwdBtn);
  } else if (!round.allowSelfPartition && round.guideSplits) {
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
      const resolvedDesc =
        round.displayMode === 'percent' && round.targetLabel.includes('→')
          ? `${round.targetLabel.split('→')[0].trim()} = ${Number(round.target.toFixed(1))}%`
          : round.hopDelta !== 0
            ? `${round.targetLabel} = ${round.target < 0 ? `−${Math.abs(round.target)}` : round.target}`
            : round.targetLabel;
      callbacks.onCorrect(
        !hadMistake,
        `Great landing! ${resolvedDesc} sits right here on the line.`
      );
    } else {
      hadMistake = true;
      const dirHint = currentVal < round.target ? 'further to the RIGHT →' : 'further to the LEFT ←';
      if (!round.showAllTicks && activePartitions === 0) showGuides = true;
      updateDisplay(false);
      callbacks.onRetry(`Close! Try sliding the frog ${dirHint}`);
    }
  });
  actions.appendChild(checkBtn);

  wrap.appendChild(targetPill);
  wrap.appendChild(trackCard);
  if (partBar) wrap.appendChild(partBar);
  wrap.appendChild(readout);
  wrap.appendChild(actions);
  container.appendChild(wrap);

  updateDisplay(false);
}
