/**
 * Automated Verification Suite for Daily Thinking Studio
 * Stress-tests all 8 mini-game generators across all 4 tiers,
 * Daily Mix rotation, and spaced-retrieval fact scheduling.
 */

import assert from 'node:assert/strict';
import { GAMES, PILLARS } from '../js/games/index.js';
import { getDailyMix, getMonthCalendarData } from '../js/daily.js';
import { loadState, recordFactAttempt, getTrickyFacts, recordGameResult } from '../js/storage.js';
import { CHIRAL_SHAPES, cellsSignature, rotateCells90CW, flipCellsHorizontal } from '../js/games/shapeShifter.js';

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    throw err;
  }
}

// 1. Verify registry structure
check('Registry has 4 pillars and 8 games (2 per pillar)', () => {
  assert.equal(PILLARS.length, 4);
  assert.equal(GAMES.length, 8);
  for (const pil of PILLARS) {
    const count = GAMES.filter((g) => g.meta.pillar === pil.id).length;
    assert.equal(count, 2, `Expected 2 games in ${pil.id}`);
  }
});

// 2. Verify Daily Mix rotation across 30 days
check('Daily Mix always picks 1 game per pillar and rotates day-to-day', () => {
  let prevSig = '';
  for (let day = 1; day <= 30; day++) {
    const key = `2026-11-${String(day).padStart(2, '0')}`;
    const mix = getDailyMix(key);
    assert.equal(mix.length, 4);
    const pillarSet = new Set(mix.map((g) => g.meta.pillar));
    assert.equal(pillarSet.size, 4, `All 4 pillars must appear on ${key}`);
    const sig = mix.map((g) => g.meta.id).sort().join(',');
    if (prevSig) {
      assert.notEqual(sig, prevSig, `Consecutive days should not repeat identical 4-game set (${key})`);
    }
    prevSig = sig;
  }
});

// 3. Stress-test all 8 generators across all 4 tiers (25 sessions each)
for (const game of GAMES) {
  for (let tier = 1; tier <= 4; tier++) {
    check(`${game.meta.id} tier ${tier} generates valid sessions (25 runs)`, () => {
      for (let run = 0; run < 25; run++) {
        const rounds = game.generateSession(tier, null);
        assert.ok(Array.isArray(rounds) && rounds.length >= 1);

        for (const r of rounds) {
          assert.ok(r.prompt && typeof r.prompt === 'string', 'Missing prompt');
          assert.ok(r.strategyTip && typeof r.strategyTip === 'string', 'Missing strategyTip');
          assert.ok(!r.prompt.includes('undefined') && !r.prompt.includes('NaN'), `Bad prompt: ${r.prompt}`);

          if (game.meta.id === 'cube-architect') {
            assert.ok(r.total >= 2, 'Total cubes must be >= 2');
            if (r.kind === 'count') {
              assert.equal(new Set(r.choices).size, 4, 'Choices must be 4 unique numbers');
              assert.ok(r.choices.includes(r.answer), 'Choices must include answer');
            } else {
              assert.equal(r.options.length, 4);
              assert.ok(r.correctIdx >= 0 && r.correctIdx < 4);
            }
          }

          if (game.meta.id === 'shape-shifter') {
            if (r.kind === 'mirror') {
              assert.equal(r.leftGrid.length, r.rows);
              assert.equal(r.expectedRight.length, r.rows);
              for (let row = 0; row < r.rows; row++) {
                for (let col = 0; col < r.cols; col++) {
                  assert.equal(r.expectedRight[row][col], r.leftGrid[row][r.cols - 1 - col]);
                }
              }
            } else if (r.kind === 'rotate') {
              // Verify chiral guarantee: if impostor, no rotation matches target; if not impostor, at least 1 rotation matches target
              let cur = r.startCells;
              let matched = false;
              for (let t = 0; t < 4; t++) {
                if (cellsSignature(cur) === r.targetSig) matched = true;
                cur = rotateCells90CW(cur);
              }
              if (r.isFlippedImpostor) {
                assert.equal(matched, false, 'Flipped impostor must NEVER match via rotation!');
              } else {
                assert.equal(matched, true, 'Valid rotated shape MUST match target via 90-deg turns!');
              }
            }
          }

          if (game.meta.id === 'number-line') {
            assert.ok(r.target >= r.min && r.target <= r.max, `Target ${r.target} out of [${r.min}, ${r.max}]`);
            assert.notEqual(r.startPos, r.target, `Number line frog must not start right on target (${r.targetLabel})`);
            assert.ok(r.tolerance > 0);
          }

          if (game.meta.id === 'fact-studio') {
            assert.equal(r.warmups.length, 3);
            assert.ok(r.fluencyQueue.length >= 20);
            if (tier === 1) {
              assert.equal(r.useTimedSprint, false, 'Tier 1 must NEVER use timed sprint');
            }
            for (const w of r.warmups) {
              assert.ok(Number.isFinite(w.answer));
            }
            for (const f of r.fluencyQueue) {
              assert.ok(Number.isFinite(f.answer));
            }
          }

          if (game.meta.id === 'balance-lab') {
            assert.ok(r.scales.length >= 1);
            if (r.kind === 'numeric') {
              assert.equal(new Set(r.choices).size, 4);
              assert.ok(r.choices.includes(r.answer));
              assert.ok(r.answer >= 1);
            } else {
              assert.equal(r.options.length, 3);
              assert.ok(r.options.some((o) => o.key === r.answerKey));
            }
          }

          if (game.meta.id === 'rule-switcher') {
            if (r.kind === 'sort-switch' || r.kind === 'sort-bool') {
              assert.equal(r.cards.length, 4);
              assert.ok(r.cards.some((c) => c.switched), 'Must switch rule mid-round');
            } else if (r.kind === 'pattern-number') {
              assert.ok(r.choices.includes(r.answer));
              assert.equal(new Set(r.choices).size, 4);
            } else {
              assert.equal(r.options.length, 4);
              assert.ok(r.correctIdx >= 0 && r.correctIdx < 4);
            }
          }

          if (game.meta.id === 'word-builder') {
            assert.equal(new Set(r.shuffledOptions).size, 4);
            assert.ok(r.shuffledOptions.includes(r.answer));
            assert.notEqual(r.prompt.trim(), r.clue.trim(), 'Word Builder prompt and clue must not duplicate');
          }

          if (game.meta.id === 'word-connections') {
            assert.ok(!r.prompt.includes('::'), `Prompt must not use :: notation: ${r.prompt}`);
            if (r.kind === 'choice') {
              assert.equal(new Set(r.shuffledOptions).size, 4);
              assert.ok(r.shuffledOptions.includes(r.answer));
              if (r.subkind === 'analogy') {
                assert.equal(r.pairA.length, 2);
                assert.ok(typeof r.pairBLeft === 'string' && r.pairBLeft.length > 0);
              } else if (r.subkind === 'opposite' || r.subkind === 'synonym') {
                assert.ok(typeof r.targetWord === 'string' && r.targetWord.length > 0);
              } else if (r.subkind === 'sentence') {
                assert.ok(typeof r.sentenceBefore === 'string' && typeof r.sentenceAfter === 'string');
              } else if (r.subkind === 'definition') {
                assert.ok(typeof r.definition === 'string' && r.definition.length > 0);
              } else {
                assert.ok(typeof r.cardHint === 'string' && r.cardHint.length > 0);
                assert.notEqual(r.prompt.trim(), r.cardHint.trim(), 'Prompt and cardHint must not duplicate');
              }
            } else {
              assert.equal(r.ordered.length, 3);
              assert.equal(r.shuffledWords.length, 3);
              assert.ok(typeof r.directionLabel === 'string' && r.directionLabel.length > 0);
            }
          }
        }
      }
    });
  }
}

// 4. Verify Spaced-Retrieval Fact Priority & Daily Star Recording
check('Spaced-retrieval prioritizes missed & hesitant facts and daily completion awards star', () => {
  const st = loadState();
  const kid = st.profiles[1]; // Explorer (Tier 2)
  recordFactAttempt(kid, '7x6', false, 5200, '2026-11-24');
  recordFactAttempt(kid, '3x4', true, 1200, '2026-11-24');
  recordFactAttempt(kid, '3x4', true, 1100, '2026-11-24');
  recordFactAttempt(kid, '3x4', true, 1050, '2026-11-24');
  recordFactAttempt(kid, '5x8', true, 4500, '2026-11-24');

  const tricky = getTrickyFacts(kid, 5);
  assert.equal(tricky[0].key, '7x6', 'Missed fact should rank first in spaced queue');
  assert.ok(tricky.some((t) => t.key === '5x8'), 'Hesitant (>3.2s) fact should appear in queue');
  assert.ok(!tricky.some((t) => t.key === '3x4'), 'Fast mastered fact should graduate out of tricky queue');

  // Completing all 4 daily games awards today's calendar star
  const today = '2026-11-24';
  const mix = getDailyMix(today);
  const ids = mix.map((g) => g.meta.id);
  let lastRes;
  for (const id of ids) {
    lastRes = recordGameResult(st, kid.id, {
      gameId: id,
      correct: 5,
      attempts: 5,
      masteryNote: '5/5',
      isDailyMix: true,
      dailyGameIds: ids,
      todayKey: today,
    });
  }
  assert.equal(lastRes.completedDailyNow, true);
  assert.ok(kid.completedDates.includes(today));

  const cal = getMonthCalendarData(kid.completedDates, new Date(2026, 10, 24));
  assert.equal(cal.starsThisMonth, 1);
});

// 5. Verify EVERY shape in CHIRAL_SHAPES is orthogonally connected and strictly chiral
check('All CHIRAL_SHAPES are orthogonally connected and strictly chiral', () => {
  for (const shape of CHIRAL_SHAPES) {
    // Connectedness BFS
    const set = new Set(shape.cells.map(([r, c]) => `${r},${c}`));
    const visited = new Set([`${shape.cells[0][0]},${shape.cells[0][1]}`]);
    const q = [shape.cells[0]];
    while (q.length) {
      const [r, c] = q.shift();
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const key = `${r + dr},${c + dc}`;
        if (set.has(key) && !visited.has(key)) {
          visited.add(key);
          q.push([r + dr, c + dc]);
        }
      }
    }
    assert.equal(visited.size, shape.cells.length, `${shape.name} must be orthogonally connected`);

    // Strict chirality
    const flippedSig = cellsSignature(flipCellsHorizontal(shape.cells));
    let cur = shape.cells;
    const rotSigs = new Set();
    for (let i = 0; i < 4; i++) {
      rotSigs.add(cellsSignature(cur));
      cur = rotateCells90CW(cur);
    }
    assert.ok(!rotSigs.has(flippedSig), `${shape.name} must be strictly chiral!`);
  }
});

console.log(`ALL ${passed} GENERATOR & LOGIC VERIFICATION CHECKS PASSED!`);
