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
                  if (r.axis === 'horizontal') {
                    assert.equal(r.expectedRight[row][col], r.leftGrid[r.rows - 1 - row][col]);
                  } else if (r.axis === 'diagonal') {
                    if (row > col) assert.equal(r.expectedRight[row][col], r.leftGrid[col][row]);
                  } else {
                    assert.equal(r.expectedRight[row][col], r.leftGrid[row][r.cols - 1 - col]);
                  }
                }
              }
            } else if (r.kind === 'rotate') {
              assert.notEqual(cellsSignature(r.startCells), r.targetSig, 'Start shape must not already match target');
              let cur = r.startCells;
              const matches = [];
              for (let t = 0; t < 4; t++) {
                if (cellsSignature(cur) === r.targetSig) matches.push(t);
                cur = rotateCells90CW(cur);
              }
              if (r.isFlippedImpostor) {
                assert.equal(matches.length, 0, 'Flipped impostor must NEVER match via rotation!');
              } else {
                assert.ok(matches.includes(r.turnsNeededCW), `Expected CW match at ${r.turnsNeededCW}, got ${matches}`);
                if (r.predictFirst) {
                  assert.equal(matches.length, 1, `Predict-first must have 1 unambiguous rotation match, got ${matches}`);
                }
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
            assert.ok(r.fluencyQueue.length >= 50, `Expected >=50 unique fluency items, got ${r.fluencyQueue.length}`);
            if (tier === 1) {
              assert.equal(r.useTimedSprint, false, 'Tier 1 must NEVER use timed sprint');
            }
            const warmupKeys = new Set(r.warmups.map((w) => w.factKey));
            assert.equal(warmupKeys.size, 3, 'Warm-ups must have 3 unique factKeys');
            const fluencyKeys = new Set(r.fluencyQueue.map((f) => f.factKey));
            assert.equal(
              fluencyKeys.size,
              r.fluencyQueue.length,
              'Fluency queue must NOT contain duplicate factKeys within a session'
            );
            for (const w of r.warmups) {
              assert.ok(Number.isFinite(w.answer));
              assert.ok(!fluencyKeys.has(w.factKey), `Warm-up ${w.factKey} must not immediately repeat in sprint`);
            }
            for (const f of r.fluencyQueue) {
              assert.ok(Number.isFinite(f.answer));
            }
          }

          if (game.meta.id === 'balance-lab') {
            assert.ok(r.scales.length >= 1);
            assert.ok(typeof r.signature === 'string' && r.signature.length > 0, 'Balance Lab round needs signature');
            for (const sc of r.scales) {
              assert.ok(sc.left.length >= 1 && sc.left.length <= 4, `Left pan overflow: ${sc.left.length}`);
              assert.ok(sc.right.length >= 1 && sc.right.length <= 4, `Right pan overflow: ${sc.right.length}`);
            }
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
            } else if (r.kind === 'pattern-number' || r.kind === 'function-machine') {
              assert.ok(r.choices.includes(r.answer));
              assert.equal(new Set(r.choices).size, 4);
              if (r.kind === 'function-machine') {
                assert.equal(r.examples.length, 3);
                assert.ok(typeof r.ruleLabel === 'string' && r.ruleLabel.length > 0);
              }
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

        if (game.meta.id === 'balance-lab') {
          const sigs = new Set(rounds.map((r) => r.signature));
          assert.equal(sigs.size, rounds.length, 'Balance Lab must never repeat a puzzle inside a session');
        }
      }
    });
  }
}

// 4. Verify Spaced-Retrieval Fact Priority, Fast-First-Try Non-Repetition & Graduation
check('Spaced-retrieval prioritizes missed/hesitant facts, ignores fast first-try, and graduates cleanly', () => {
  const st = loadState();
  const kid = st.profiles[1]; // Explorer (Tier 2)

  // Fast first-try correct answer must NOT enter tricky queue!
  recordFactAttempt(kid, '2x6', true, 1300, '2026-11-24');
  assert.equal(kid.factHistory['2x6'].box, 3, 'Fast first-try correct fact should start at box 3');
  assert.ok(!getTrickyFacts(kid, 8).some((t) => t.key === '2x6'), 'Fast first-try fact must not be tricky');

  // Legacy saved record auto-healing (old bug left 1-attempt fast facts at box 2)
  kid.factHistory['4x3'] = { box: 2, attempts: 1, misses: 0, lastMs: 1100, avgMs: 1100, lastSeenDay: '2026-11-24' };
  assert.ok(!getTrickyFacts(kid, 8).some((t) => t.key === '4x3'), 'Legacy 1-attempt fast fact should auto-heal');

  // Missed & hesitant facts DO enter tricky queue
  recordFactAttempt(kid, '7x6', false, 5200, '2026-11-24');
  recordFactAttempt(kid, '3x4', true, 1200, '2026-11-24');
  recordFactAttempt(kid, '5x8', true, 4500, '2026-11-24');

  const tricky = getTrickyFacts(kid, 5);
  assert.equal(tricky[0].key, '7x6', 'Missed fact should rank first in spaced queue');
  assert.ok(tricky.some((t) => t.key === '5x8'), 'Hesitant (>3.2s) fact should appear in queue');
  assert.ok(!tricky.some((t) => t.key === '3x4'), 'Fast mastered fact should stay out of tricky queue');

  // Missed fact graduates cleanly after 2 consecutive smooth recalls (even with lifetime misses === 1!)
  recordFactAttempt(kid, '7x6', true, 1700, '2026-11-25');
  assert.ok(getTrickyFacts(kid, 8).some((t) => t.key === '7x6'), 'After 1 smooth recall, confirm once more (box 2)');
  recordFactAttempt(kid, '7x6', true, 1500, '2026-11-25');
  assert.ok(!getTrickyFacts(kid, 8).some((t) => t.key === '7x6'), 'After 2 smooth recalls, missed fact must graduate!');

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

// 4b. Verify back-to-back replay freshness for Fact Studio & Balance Lab
check('Back-to-back replays of Fact Studio warm-ups and Balance Lab avoid repeats', () => {
  const factMod = GAMES.find((g) => g.meta.id === 'fact-studio');
  const balMod = GAMES.find((g) => g.meta.id === 'balance-lab');
  const freshProfile = { id: 'replay-test-kid', calmMode: false, factHistory: {}, gameStats: {} };

  for (let tier = 1; tier <= 4; tier++) {
    const f1 = factMod.generateSession(tier, freshProfile)[0];
    const f2 = factMod.generateSession(tier, freshProfile)[0];
    const w1 = new Set(f1.warmups.map((w) => w.factKey));
    const overlapW = f2.warmups.filter((w) => w1.has(w.factKey));
    assert.equal(overlapW.length, 0, `Fact Studio Tier ${tier} back-to-back warm-ups should not repeat`);

    const b1 = balMod.generateSession(tier, freshProfile);
    const b2 = balMod.generateSession(tier, freshProfile);
    const s1 = new Set(b1.map((r) => r.signature));
    const overlapB = b2.filter((r) => s1.has(r.signature));
    assert.equal(overlapB.length, 0, `Balance Lab Tier ${tier} back-to-back sessions should not repeat`);
  }
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
