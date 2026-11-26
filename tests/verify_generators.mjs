/**
 * Automated Verification Suite for Daily Thinking Studio
 * Stress-tests all 12 mini-game generators across all 4 tiers,
 * 54-day Daily Mix rotation, exact 3D cube-net folding, logic-grid unique solvability,
 * spaced-retrieval fact & word scheduling, and Milestone 2 mastery/shelf progression.
 */

import assert from 'node:assert/strict';
import { GAMES, PILLARS } from '../js/games/index.js';
import { getDailyMix, getMonthCalendarData } from '../js/daily.js';
import {
  loadState,
  addProfile,
  recordFactAttempt,
  getTrickyFacts,
  recordGameResult,
  recordWordAttempt,
  getGameStage,
  getTierUpRecommendations,
  exportStateJson,
  importStateJson,
} from '../js/storage.js';
import { CHIRAL_SHAPES, cellsSignature, rotateCells90CW, flipCellsHorizontal } from '../js/games/shapeShifter.js';
import { foldNet3D, VALID_CUBE_NETS, INVALID_CUBE_NETS } from '../js/games/shapeComposer.js';
import { evalOp } from '../js/games/targetForge.js';
import { countValidAssignments } from '../js/games/clueGrid.js';

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
check('Registry has 4 pillars and 12 games (3 per pillar)', () => {
  assert.equal(PILLARS.length, 4);
  assert.equal(GAMES.length, 12);
  for (const pil of PILLARS) {
    const count = GAMES.filter((g) => g.meta.pillar === pil.id).length;
    assert.equal(count, 3, `Expected 3 games in ${pil.id}`);
  }
});

// 2. Verify Daily Mix 54-day staggered rotation & uniformity
check('Daily Mix picks 1 game per pillar, avoids consecutive repeats, and hits all 12 games uniformly over 54 days', () => {
  const counts = Object.fromEntries(GAMES.map((g) => [g.meta.id, 0]));
  let prevByPillar = null;
  const baseMs = Date.UTC(2026, 10, 1);

  for (let offset = 0; offset < 54; offset++) {
    const d = new Date(baseMs + offset * 86400000);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    const mix = getDailyMix(key);
    assert.equal(mix.length, 4);

    const byPillar = {};
    for (const g of mix) {
      byPillar[g.meta.pillar] = g.meta.id;
      counts[g.meta.id] += 1;
    }
    assert.equal(Object.keys(byPillar).length, 4, `All 4 pillars must appear on ${key}`);

    if (prevByPillar) {
      for (const pil of PILLARS) {
        assert.notEqual(
          byPillar[pil.id],
          prevByPillar[pil.id],
          `Pillar ${pil.id} repeated ${byPillar[pil.id]} on consecutive day ${key}`
        );
      }
    }
    prevByPillar = byPillar;
  }

  for (const g of GAMES) {
    assert.equal(counts[g.meta.id], 18, `Expected ${g.meta.id} to appear exactly 18/54 days, got ${counts[g.meta.id]}`);
  }
});

// Helper to verify Target Forge round has at least one exact solution using available cards
function targetForgeHasSolution(r) {
  const n = r.cards.length;
  if (r.kind === 'two-card') {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        for (const op of r.ops) {
          if (evalOp(r.cards[i], op, r.cards[j]) === r.target) return true;
        }
      }
    }
    return false;
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue;
        for (const op1 of r.ops) {
          const mid = evalOp(r.cards[i], op1, r.cards[j]);
          for (const op2 of r.ops) {
            if (evalOp(mid, op2, r.cards[k]) === r.target) return true;
          }
        }
      }
    }
  }
  return false;
}

// 3. Stress-test all 12 generators across all 4 tiers (25 sessions each)
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
            if (tier === 4) {
              assert.equal(r.grid.length, 4, 'Cube Architect T4 must use 4x4 grid');
              const baseCols = r.grid.flat().filter((h) => h > 0).length;
              assert.ok(r.total >= 17 && r.total <= 28, `Cube Architect T4 total ${r.total} out of [17, 28]`);
              assert.ok(r.total - baseCols >= 4, `Cube Architect T4 hidden supports ${r.total - baseCols} must be >= 4`);
            }
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
              if (tier === 4) {
                assert.equal(r.rows, 5, 'Shape Shifter T4 mirror must be 5x5');
                assert.ok(
                  r.axis === 'diagonal' || r.axis === 'anti-diagonal',
                  `Shape Shifter T4 mirror axis must be diagonal/anti-diagonal, got ${r.axis}`
                );
              }
              for (let row = 0; row < r.rows; row++) {
                for (let col = 0; col < r.cols; col++) {
                  if (r.axis === 'horizontal') {
                    assert.equal(r.expectedRight[row][col], r.leftGrid[r.rows - 1 - row][col]);
                  } else if (r.axis === 'diagonal') {
                    if (row > col) assert.equal(r.expectedRight[row][col], r.leftGrid[col][row]);
                  } else if (r.axis === 'anti-diagonal') {
                    if (row + col > r.rows - 1) {
                      assert.equal(r.expectedRight[row][col], r.leftGrid[r.rows - 1 - col][r.rows - 1 - row]);
                    }
                  } else {
                    assert.equal(r.expectedRight[row][col], r.leftGrid[row][r.cols - 1 - col]);
                  }
                }
              }
            } else if (r.kind === 'rotate') {
              if (tier === 3) assert.ok(r.startCells.length >= 5, `T3 rotate shape too small: ${r.shapeName}`);
              if (tier === 4) assert.ok(r.startCells.length >= 6, `T4 rotate shape too small: ${r.shapeName}`);
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

          if (game.meta.id === 'shape-composer') {
            if (tier === 2) {
              assert.equal(r.kind, 'tile-fit', 'Tier 2 Shape Composer must not include 3D cube-net folding');
            }
            if (r.kind === 'tile-fit') {
              const pieceArea = r.pieces.reduce((s, p) => s + p.cells.length, 0);
              assert.equal(pieceArea, r.targetCells.length, 'Tile-fit pieces area must match silhouette area');
              assert.ok(r.pieces.length >= 2);
              if (tier === 4) {
                assert.equal(r.pieces.length, 4, 'Tier 4 Tile-Fit must use 4 pieces');
                assert.ok(pieceArea >= 15, `Tier 4 Tile-Fit area ${pieceArea} must be >= 15`);
              }
            } else if (r.kind === 'cube-net-valid') {
              const folded = foldNet3D(r.cells);
              assert.equal(folded.valid, r.isValid, 'Cube net validity must match exact 3D folder');
              const netName = r.signature.split(':')[1];
              if (tier === 4) {
                assert.ok(
                  !['Cross-1', 'Cross-2', 'Block-2x3', 'Long-5'].includes(netName),
                  `Tier 4 cube net must exclude trivial net ${netName}`
                );
              }
            } else if (r.kind === 'cube-net-opposite') {
              const folded = foldNet3D(r.cells);
              assert.equal(folded.valid, true, 'Opposite-face round must use a valid cube net');
              assert.equal(r.faceLabels[folded.oppositeOf0], r.answer, 'Opposite label must match 3D folder');
              assert.equal(new Set(r.options).size, 4);
              assert.ok(r.options.includes(r.answer));
              const netName = r.signature.split(':')[1];
              if (tier === 4) {
                assert.ok(
                  !['Cross-1', 'Cross-2'].includes(netName),
                  `Tier 4 opposite-face net must exclude trivial Cross net ${netName}`
                );
              }
            }
          }

          if (game.meta.id === 'number-line') {
            assert.ok(r.target >= r.min && r.target <= r.max, `Target ${r.target} out of [${r.min}, ${r.max}]`);
            assert.notEqual(r.startPos, r.target, `Number line frog must not start right on target (${r.targetLabel})`);
            assert.ok(r.tolerance > 0);
            if (tier === 3) {
              assert.notEqual(r.targetLabel, '1/2', 'Tier 3 Number Line must skip trivial 1/2');
            }
            if (tier === 4) {
              assert.ok(['int', 'percent', 'decimal'].includes(r.displayMode), `Unexpected T4 displayMode: ${r.displayMode}`);
              if (r.displayMode === 'int') {
                assert.equal(r.min, -15);
                assert.equal(r.max, 15);
                assert.ok(r.startPos < 0 || r.target < 0, `T4 integer hop must involve negative numbers (${r.targetLabel})`);
                assert.ok(!r.targetLabel.includes('-'), `T4 targetLabel should use Unicode minus: ${r.targetLabel}`);
              } else if (r.displayMode === 'percent') {
                assert.ok(r.targetLabel.includes('→ ?%'), `T4 percent must require fraction/decimal conversion, got ${r.targetLabel}`);
              } else if (r.displayMode === 'decimal') {
                assert.equal(r.min, -2);
                assert.equal(r.max, 2);
                assert.ok(r.target < 0, `T4 neg-rational target must be negative, got ${r.target}`);
              }
            }
          }

          if (game.meta.id === 'fact-studio') {
            assert.equal(r.warmups.length, 3);
            assert.ok(r.fluencyQueue.length >= 50, `Expected >=50 unique fluency items, got ${r.fluencyQueue.length}`);
            if (tier === 1) {
              assert.equal(r.useTimedSprint, false, 'Tier 1 must NEVER use timed sprint');
              for (const w of r.warmups) assert.ok(w.answer <= 16, `T1 warmup too large: ${w.prompt} = ${w.answer}`);
            }
            if (tier === 2) {
              for (const w of r.warmups) assert.ok(w.answer <= 45, `T2 warmup exceeds T2 curriculum: ${w.prompt} = ${w.answer}`);
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
              if (tier === 4) {
                assert.ok(
                  !['6x4', '4x6', '24/6', '24/4'].includes(f.factKey) && !/(^|x)10($|x)|\/10$/.test(f.factKey),
                  `T4 fluency must exclude trivial fact ${f.factKey}`
                );
              }
            }
          }

          if (game.meta.id === 'target-forge') {
            assert.equal(r.cards.length, 5, 'Target Forge should offer 5 cards');
            assert.ok(Number.isFinite(r.target));
            assert.ok(targetForgeHasSolution(r), `Target Forge round must be solvable (${r.sampleSolution})`);
            if (tier === 1) {
              assert.ok(r.target >= 6 && r.target <= 14, `T1 Target Forge bond ${r.target} out of [6, 14]`);
            }
            if (tier === 2) {
              assert.equal(r.defaultOp, '+', 'Tier 2 Target Forge must default to + (no operator giveaway)');
            }
            if (tier === 3 && r.kind === 'two-card') {
              assert.ok(r.target >= 20, `T3 Factor Forge target ${r.target} must be >= 20`);
            }
            if (tier === 4) {
              assert.equal(r.kind, 'three-card', 'Tier 4 Target Forge must be 100% 3-card expressions');
              assert.equal(r.defaultOp, '+', 'Tier 4 Target Forge must default to + (no operator giveaway)');
              assert.ok(r.target >= 28, `T4 Target Forge target ${r.target} must be >= 28`);
            }
          }

          if (game.meta.id === 'balance-lab') {
            assert.ok(r.scales.length >= 1);
            assert.ok(typeof r.signature === 'string' && r.signature.length > 0, 'Balance Lab round needs signature');
            assert.ok(!r.strategyTip.includes('Berrys') && !r.speakPrompt.includes('Berrys'), 'Must pluralize Berries properly');
            if (tier === 3) {
              assert.notEqual(r.kind, 'compare', 'Tier 3 Balance Lab must not serve Tier 1 compare rounds');
            }
            if (tier === 4) {
              assert.ok(!r.signature.startsWith('alg:'), 'Tier 4 Balance Lab must not serve 1-step visualAlgebra rounds');
            }
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
              if (tier === 4 && r.kind === 'sort-bool') {
                assert.ok(r.signature.startsWith('bool4:'), `T4 Rule Switcher Boolean must be bool4, got ${r.signature}`);
              }
              for (const c of r.cards) {
                assert.ok(c.color && c.shape && c.count >= 1, 'Every sort card must have color, shape & count');
              }
            } else if (r.kind === 'pattern-number' || r.kind === 'function-machine') {
              assert.ok(r.choices.includes(r.answer));
              assert.equal(new Set(r.choices).size, 4);
              if (tier === 4 && r.kind === 'pattern-number') {
                assert.ok(r.signature.startsWith('pn4:'), `T4 Rule Switcher number sequence must be pn4, got ${r.signature}`);
              }
              if (r.kind === 'function-machine') {
                assert.equal(r.examples.length, 3);
                assert.ok(typeof r.ruleLabel === 'string' && r.ruleLabel.length > 0);
              }
            } else {
              assert.equal(r.options.length, 4);
              assert.ok(r.correctIdx >= 0 && r.correctIdx < 4);
            }
          }

          if (game.meta.id === 'clue-grid') {
            assert.equal(r.chars.length, r.size);
            assert.equal(r.items.length, r.size);
            assert.equal(
              countValidAssignments(r.clues, r.size),
              1,
              `Clue Grid must have EXACTLY 1 unique solution (got ${countValidAssignments(r.clues, r.size)})`
            );
            for (const txt of r.clueTexts) {
              assert.ok(!txt.includes('the Soccer') && !txt.includes('the Tennis') && !txt.includes('the Mars') && !txt.includes('the Teal'), `Awkward article in clue: ${txt}`);
            }
            const isCount = r.clues.filter((cl) => cl.type === 'is').length;
            if (tier === 1 || tier === 3) {
              assert.equal(isCount, 1, `Tier ${tier} Clue Grid must have exactly 1 direct anchor clue`);
            }
            if (tier === 2 || tier === 4) {
              assert.equal(isCount, 0, `Tier ${tier} Clue Grid must be pure deduction (0 direct "is" giveaways)`);
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
              assert.ok(!r.shuffledWords.every((w, i) => w === r.ordered[i]), 'Ladder shuffledWords must never start already solved');
              assert.ok(r.speakPrompt.includes(r.shuffledWords.join(', ')), 'Ladder speakPrompt must read shuffledWords, never ordered answer');
              assert.ok(typeof r.directionLabel === 'string' && r.directionLabel.length > 0);
            }
          }

          if (game.meta.id === 'story-detective') {
            assert.equal(new Set(r.shuffledOptions).size, 4);
            assert.ok(r.shuffledOptions.includes(r.answer));
            assert.ok(typeof r.title === 'string' && r.title.length > 0);
            assert.ok(typeof r.before === 'string' && r.before.length > 5);
            assert.ok(typeof r.wordKey === 'string' && r.wordKey.startsWith('sd:'));
          }
        }

        if (game.meta.id === 'balance-lab') {
          const sigs = new Set(rounds.map((r) => r.signature));
          assert.equal(sigs.size, rounds.length, 'Balance Lab must never repeat a puzzle inside a session');
        }
        if (game.meta.id === 'rule-switcher' && tier === 4) {
          const fmRounds = rounds.filter((r) => r.kind === 'function-machine');
          assert.equal(fmRounds.length, 2, 'Rule Switcher T4 must include 2 Function Machine rounds');
          const families = new Set(fmRounds.map((r) => r.signature.split(':')[1]));
          assert.equal(families.size, 2, `Rule Switcher T4 Function Machines must use 2 distinct families, got ${fmRounds.map((r) => r.signature)}`);
        }
      }
    });
  }
}

// 4. Verify all 11 VALID_CUBE_NETS fold validly and all 8 INVALID_CUBE_NETS fail
check('Exact 3D cube-net folder validates all 11 valid hexomino nets and rejects all 8 invalid impostors', () => {
  assert.equal(VALID_CUBE_NETS.length, 11);
  assert.equal(INVALID_CUBE_NETS.length, 8);
  for (const net of VALID_CUBE_NETS) {
    const res = foldNet3D(net.cells);
    assert.equal(res.valid, true, `Valid net ${net.name} must fold cleanly`);
    assert.ok(res.oppositeOf0 >= 1 && res.oppositeOf0 <= 5, `Valid net ${net.name} must identify opposite face`);
  }
  for (const bad of INVALID_CUBE_NETS) {
    const res = foldNet3D(bad.cells);
    assert.equal(res.valid, false, `Invalid net ${bad.name} must fail to fold into a closed cube`);
  }
});

// 5. Verify Spaced-Retrieval Fact Priority, Fast-First-Try Non-Repetition & Graduation
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

  // Completing all 4 daily games awards today's calendar star + first Studio Shelf keepsake
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
  assert.equal(lastRes.unlockedShelfCount, 1, '1st Daily Mix star unlocks Studio Shelf keepsake #1');
  assert.ok(kid.completedDates.includes(today));

  const cal = getMonthCalendarData(kid.completedDates, new Date(2026, 10, 24));
  assert.equal(cal.starsThisMonth, 1);
});

// 6. Verify back-to-back replay freshness for Fact Studio, Balance Lab & Story Detective
check('Back-to-back replays of Fact Studio, Balance Lab, and Story Detective avoid immediate repeats', () => {
  const factMod = GAMES.find((g) => g.meta.id === 'fact-studio');
  const balMod = GAMES.find((g) => g.meta.id === 'balance-lab');
  const storyMod = GAMES.find((g) => g.meta.id === 'story-detective');
  const freshProfile = { id: 'replay-test-kid', calmMode: false, factHistory: {}, wordHistory: {}, gameStats: {}, recentPuzzles: {} };

  for (let tier = 1; tier <= 4; tier++) {
    const f1 = factMod.generateSession(tier, freshProfile)[0];
    const f2 = factMod.generateSession(tier, freshProfile)[0];
    const w1 = new Set(f1.warmups.map((w) => w.factKey));
    assert.equal(f2.warmups.filter((w) => w1.has(w.factKey)).length, 0, `Fact Studio T${tier} warm-ups should not repeat`);

    const b1 = balMod.generateSession(tier, freshProfile);
    const b2 = balMod.generateSession(tier, freshProfile);
    const s1 = new Set(b1.map((r) => r.signature));
    assert.equal(b2.filter((r) => s1.has(r.signature)).length, 0, `Balance Lab T${tier} should not repeat`);

    const st1 = storyMod.generateSession(tier, freshProfile);
    st1.forEach((item) => recordWordAttempt(freshProfile, item.wordKey, true, '2026-11-25'));
    const st2 = storyMod.generateSession(tier, freshProfile);
    const stKeys1 = new Set(st1.map((r) => r.wordKey));
    assert.equal(st2.filter((r) => stKeys1.has(r.wordKey)).length, 0, `Story Detective T${tier} mastered stories should not repeat immediately`);
  }
});

// 7. Verify Milestone 2 Competence Milestones, 3-Stage Mastery, Bonus Avatars & Tier-Up Nudge
check('Competence badges reject 0/5 plays, 3-stage mastery climbs at 3 & 6 clean sessions, and bonus avatars + tier nudges fire cleanly', () => {
  const st = loadState();
  const kid = st.profiles[0]; // Sprout (Tier 1)

  // 0/5 must NOT unlock Spatial Ace badge or increment cleanPlays
  const failRes = recordGameResult(st, kid.id, { gameId: 'shape-composer', correct: 0, attempts: 5 });
  assert.ok(!kid.unlockedBadges.includes('spatial-builder'), '0/5 must NOT grant Spatial Ace badge');
  assert.equal(failRes.stageUp, null);
  assert.equal(getGameStage(kid, 'shape-composer'), 1);

  // 3 clean plays -> unlocks Spatial Ace & climbs to Stage 2
  recordGameResult(st, kid.id, { gameId: 'shape-composer', correct: 4, attempts: 5 });
  assert.ok(kid.unlockedBadges.includes('spatial-builder'), '80% clean session should grant Spatial Ace');
  recordGameResult(st, kid.id, { gameId: 'shape-composer', correct: 5, attempts: 5 });
  const stage2Res = recordGameResult(st, kid.id, { gameId: 'shape-composer', correct: 5, attempts: 5 });
  assert.deepEqual(stage2Res.stageUp, { from: 1, to: 2 });
  assert.equal(getGameStage(kid, 'shape-composer'), 2);
  assert.ok(kid.unlockedBadges.includes('stage-2-unlock'));

  // 3 more clean plays (total 6) -> climbs to Stage 3 + triggers Visualize Tier-Up recommendation!
  recordGameResult(st, kid.id, { gameId: 'shape-composer', correct: 5, attempts: 5 });
  recordGameResult(st, kid.id, { gameId: 'shape-composer', correct: 5, attempts: 5 });
  const stage3Res = recordGameResult(st, kid.id, { gameId: 'shape-composer', correct: 5, attempts: 5 });
  assert.deepEqual(stage3Res.stageUp, { from: 2, to: 3 });
  assert.ok(kid.unlockedBadges.includes('stage-3-master'));

  const recs = getTierUpRecommendations(kid, PILLARS, GAMES);
  assert.ok(recs.some((r) => r.pillarId === 'visualize' && r.nextTier === 2), 'Should recommend promoting Visualize to Tier 2');

  // Completing 3 distinct daily dates unlocks Narwhal bonus avatar on star #3
  for (const day of ['2026-11-20', '2026-11-21', '2026-11-22']) {
    const mix = getDailyMix(day);
    const ids = mix.map((g) => g.meta.id);
    let r;
    for (const id of ids) {
      r = recordGameResult(st, kid.id, {
        gameId: id,
        correct: 4,
        attempts: 4,
        isDailyMix: true,
        dailyGameIds: ids,
        todayKey: day,
      });
    }
    if (day === '2026-11-22') {
      assert.equal(r.newAvatarKey, 'narwhal', '3rd Daily Mix star must unlock Narwhal bonus avatar');
    }
  }
});

// 8. Verify EVERY shape in CHIRAL_SHAPES is orthogonally connected and strictly chiral
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

// 9. Exhaustively drain and audit ALL 490 curated Word Builder, Word Connections & Story Detective items
check('All 490 curated WordCraft and Story Detective items pass structural, spacing, and anti-spoiler checks', () => {
  const wbMod = GAMES.find((g) => g.meta.id === 'word-builder');
  const wcMod = GAMES.find((g) => g.meta.id === 'word-connections');
  const sdMod = GAMES.find((g) => g.meta.id === 'story-detective');

  const drainAll = (mod, tier) => {
    const profile = { id: 'audit', wordHistory: {}, recentPuzzles: {} };
    const byKey = new Map();
    for (let pass = 0; pass < 30; pass++) {
      const rounds = mod.generateSession(tier, profile);
      let added = 0;
      for (const r of rounds) {
        if (!byKey.has(r.wordKey)) {
          byKey.set(r.wordKey, r);
          added += 1;
        }
        recordWordAttempt(profile, r.wordKey, true, '2026-11-25');
      }
      if (added === 0) break;
    }
    return Array.from(byKey.values());
  };

  let wbTotal = 0;
  let wcTotal = 0;
  let sdTotal = 0;
  const seenSdIds = new Set();

  for (let tier = 1; tier <= 4; tier++) {
    for (const r of drainAll(wbMod, tier)) {
      wbTotal += 1;
      assert.equal(new Set(r.shuffledOptions).size, 4, `WB ${r.wordKey} must have 4 unique options`);
      assert.ok(r.shuffledOptions.includes(r.answer), `WB ${r.wordKey} answer missing`);
      assert.ok(r.strategyTip && r.strategyTip.length >= 8, `WB ${r.wordKey} tip too short`);
      if (r.kind === 'morpheme') assert.ok(r.parts.includes('?'), `WB ${r.wordKey} missing ? tile`);
      if (tier === 4) {
        assert.ok(!/\? \(/.test(r.clue), `WB T4 ${r.wordKey} clue must not leak root meaning: ${r.clue}`);
      }
    }

    for (const r of drainAll(wcMod, tier)) {
      wcTotal += 1;
      assert.ok(r.strategyTip && r.strategyTip.length >= 8, `WC ${r.wordKey} tip too short`);
      assert.ok(!r.prompt.includes('::'), `WC ${r.wordKey} contains :: notation`);
      if (r.kind === 'choice') {
        assert.equal(new Set(r.shuffledOptions).size, 4, `WC ${r.wordKey} must have 4 unique options`);
        assert.ok(r.shuffledOptions.includes(r.answer), `WC ${r.wordKey} answer missing`);
        if (r.subkind === 'sentence') {
          if (r.sentenceBefore) assert.match(r.sentenceBefore, /[\s“"‘'(]$/, `WC ${r.wordKey} sentenceBefore spacing`);
          if (r.sentenceAfter) assert.match(r.sentenceAfter, /^[\s.,!?;:’'"”)]/, `WC ${r.wordKey} sentenceAfter spacing`);
        }
      } else {
        assert.equal(new Set(r.ordered).size, 3);
        assert.ok(!r.shuffledWords.every((w, i) => w === r.ordered[i]), `WC ${r.wordKey} ladder pre-solved`);
        assert.ok(r.speakPrompt.includes(r.shuffledWords.join(', ')), `WC ${r.wordKey} ladder read-aloud spoiler`);
      }
    }

    for (const r of drainAll(sdMod, tier)) {
      sdTotal += 1;
      assert.ok(r.id && !seenSdIds.has(r.id), `SD duplicate/missing id ${r.id}`);
      seenSdIds.add(r.id);
      assert.equal(new Set(r.shuffledOptions).size, 4, `SD ${r.id} must have 4 unique options`);
      assert.ok(r.shuffledOptions.includes(r.answer), `SD ${r.id} answer missing`);
      if (r.before) assert.match(r.before, /[\s“"‘'(]$/, `SD ${r.id} before spacing`);
      if (r.after) assert.match(r.after, /^[\s.,!?;:’'"”)]/, `SD ${r.id} after spacing`);
      const ansLow = r.answer.toLowerCase();
      const titleTokens = r.title.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
      const ansStem = ansLow.length >= 5 ? ansLow.slice(0, 5) : null;
      const leaks = titleTokens.some((tok) => tok === ansLow || (ansStem && tok.length >= 5 && tok.startsWith(ansStem)));
      assert.equal(leaks, false, `SD ${r.id} title "${r.title}" leaks answer "${r.answer}"!`);
    }
  }

  assert.equal(wbTotal, 182, 'Word Builder bank must have all 182 items');
  assert.equal(wcTotal, 180, 'Word Connections bank must have all 180 items');
  assert.equal(sdTotal, 128, 'Story Detective bank must have all 128 stories');
});

// 10. Verify Backup JSON export/import, legacy v1 migration, malformed rejection & unique profile IDs
check('Backup JSON export/import migrates legacy v1 profiles cleanly, rejects corrupted files, and avoids ID collisions', () => {
  const st = loadState();
  const pA = addProfile(st, { name: 'Twin A', avatar: 'owl', tier: 2 });
  const pB = addProfile(st, { name: 'Twin B', avatar: 'otter', tier: 2 });
  assert.notEqual(pA.id, pB.id, 'Rapidly added profiles must have unique IDs');

  const exported = exportStateJson(st);
  const reimported = importStateJson(exported);
  assert.equal(reimported.profiles.length, st.profiles.length);

  // Legacy v1 backup missing wordHistory, recentPuzzles, gameMastery, and with invalid activeProfileId & out-of-range tier
  const legacyJson = JSON.stringify({
    version: 1,
    activeProfileId: 'deleted-id',
    profiles: [{ id: 'legacy-1', name: 'Leo', tier: 99 }],
  });
  const migrated = importStateJson(legacyJson);
  assert.equal(migrated.activeProfileId, 'legacy-1');
  assert.equal(migrated.profiles[0].tier, 4, 'Out-of-range tier must clamp cleanly to 4');
  assert.deepEqual(migrated.profiles[0].wordHistory, {});
  assert.deepEqual(migrated.profiles[0].recentPuzzles, {});
  assert.deepEqual(migrated.profiles[0].gameMastery, {});

  // Malformed or empty profiles must throw cleanly
  assert.throws(() => importStateJson('{"profiles": []}'));
  assert.throws(() => importStateJson('{"profiles": [null, "bad"]}'));
  assert.throws(() => importStateJson('not valid json'));
});

console.log(`ALL ${passed} GENERATOR & LOGIC VERIFICATION CHECKS PASSED!`);
