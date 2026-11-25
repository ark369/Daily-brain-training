/**
 * Game Session Shell:
 * - Renders any of the 8 mini-games inside an uncluttered, focused stage
 * - Provides Read-Aloud trigger, collapsible Strategy Tip reflection card,
 *   warm non-punitive feedback, and celebratory round / Daily Mix completion screens.
 */

import { getAvatarSvg, MEDAL_SVG, STAR_SVG, STUDIO_BADGES, UI_ICONS } from '../avatars.js';
import {
  playClick,
  playCorrect,
  playRetry,
  playSwitch,
  playCelebrate,
  speakText,
  stopSpeaking,
} from '../audio.js';
import { getEffectiveTier, getTierInfo, getTodayKey, recordGameResult } from '../storage.js';
import { escapeHtml } from '../games/utils.js';

const OFFLINE_PAIRINGS = {
  visualize: 'Offline idea: Build a 3D LEGO or wooden block tower together and sketch its top view on paper!',
  compute: 'Offline idea: Play a linear number board game or estimate measurements while baking together!',
  analyze: 'Offline idea: Play a family strategy board game (like Blokus, Rush Hour, or Set) to practice flexible rules!',
  wordcraft: 'Offline idea: Spot prefixes and roots on road signs or cereal boxes, or read a chapter aloud together!',
};

function renderConfettiHtml() {
  const colors = ['#2E9690', '#E46B49', '#E9A825', '#4B9B64', '#5BC0B8'];
  const pieces = Array.from({ length: 18 }, (_, i) => {
    const left = 6 + ((i * 5.2) % 88);
    const delay = (i % 6) * 90;
    const color = colors[i % colors.length];
    return `<span class="confetti-piece" style="left:${left}%;background:${color};animation-delay:${delay}ms;"></span>`;
  });
  return `<div class="confetti-burst" aria-hidden="true">${pieces.join('')}</div>`;
}

export function runGameSession(container, state, profile, gameMod, options, handlers) {
  const { isDailyMix = false, dailyGames = [] } = options;
  const tier = getEffectiveTier(profile, gameMod.meta.pillar);
  const tierInfo = getTierInfo(tier);
  const rounds = gameMod.generateSession(tier, profile);

  let roundIdx = 0;
  let cleanCorrect = 0;
  let totalAttempts = 0;
  let activeCleanup = null;
  let sessionKeyHandler = null;

  function runCleanup() {
    stopSpeaking();
    if (sessionKeyHandler) {
      window.removeEventListener('keydown', sessionKeyHandler);
      sessionKeyHandler = null;
    }
    if (activeCleanup) {
      activeCleanup();
      activeCleanup = null;
    }
  }

  function exitToHome() {
    runCleanup();
    handlers.onExitHome();
  }

  function showCelebration({ correct, attempts, masteryNote }) {
    runCleanup();
    playCelebrate();

    const dailyIds = dailyGames.map((g) => g.meta.id);
    const { completedDailyNow, newBadges, isNewPersonalBest } = recordGameResult(state, profile.id, {
      gameId: gameMod.meta.id,
      correct,
      attempts,
      masteryNote,
      isDailyMix,
      dailyGameIds: dailyIds,
    });

    const todayKey = getTodayKey();
    const dp = profile.dailyProgress[todayKey] || { doneGameIds: [], completed: false };
    const nextUnfinished = isDailyMix
      ? dailyGames.find((g) => !dp.doneGameIds.includes(g.meta.id))
      : null;

    const headline = completedDailyNow
      ? `Gold Star Earned, ${profile.name}!`
      : `${gameMod.meta.title} Complete!`;

    const subText = completedDailyNow
      ? 'You finished all 4 pillars of today’s Thinking Mix! That is a fantastic brain workout — stop on a high note or visit the Free Play Lab.'
      : isDailyMix && nextUnfinished
        ? `Great focus on ${gameMod.meta.pillarLabel}! Ready for your next studio room?`
        : masteryNote || `Great thinking practice on ${tierInfo.name} tier!`;

    const newBadgeObjs = (newBadges || [])
      .map((id) => STUDIO_BADGES.find((b) => b.id === id))
      .filter(Boolean);

    const speakSummary = completedDailyNow
      ? `Way to go ${profile.name}! You finished your whole daily mix and earned a gold star!`
      : `Awesome job finishing ${gameMod.meta.title}!`;
    speakText(speakSummary);

    container.innerHTML = `
      <section class="card celebration-card animate-pop" aria-label="Game summary" style="position:relative;overflow:hidden;">
        ${renderConfettiHtml()}
        <div class="celebration-mascots">
          <div class="celebration-avatar">${getAvatarSvg(profile.avatar)}</div>
          <div class="celebration-medal">
            ${completedDailyNow ? STAR_SVG.replace('class="cal-star-svg"', 'width="54" height="54"') : MEDAL_SVG}
          </div>
        </div>
        <div>
          <h1 style="font-size:clamp(1.6rem, 3.2vw, 2.2rem);margin-bottom:8px;">${escapeHtml(headline)}</h1>
          <p class="daily-desc" style="margin:0 auto;">${escapeHtml(subText)}</p>
        </div>

        ${
          newBadgeObjs.length > 0 || isNewPersonalBest
            ? `<div class="badge-pills" style="justify-content:center;">
                ${isNewPersonalBest ? '<span class="studio-badge unlocked compute">★ New Personal Best!</span>' : ''}
                ${newBadgeObjs
                  .map(
                    (b) =>
                      `<span class="studio-badge unlocked ${b.pillar}">★ Unlocked: ${escapeHtml(b.title)}</span>`
                  )
                  .join('')}
               </div>`
            : ''
        }

        <div class="celebration-stats">
          <div class="stat-tile">
            <div class="stat-value">${correct}</div>
            <div class="stat-label">${gameMod.meta.id === 'fact-studio' && tier >= 2 && !profile.calmMode ? 'Accurate Sprint Facts' : 'Solved Cleanly'}</div>
          </div>
          <div class="stat-tile">
            <div class="stat-value">${escapeHtml(tierInfo.name)}</div>
            <div class="stat-label">${escapeHtml(gameMod.meta.pillarLabel)} Tier</div>
          </div>
          ${
            isDailyMix
              ? `<div class="stat-tile">
                   <div class="stat-value">${dp.doneGameIds.length} / ${dailyGames.length}</div>
                   <div class="stat-label">Daily Mix Steps</div>
                 </div>`
              : ''
          }
        </div>

        <div class="celebration-tip">
          <strong>Thinking Boost:</strong> ${escapeHtml(OFFLINE_PAIRINGS[gameMod.meta.pillar])}
        </div>

        <div class="celebration-actions">
          ${
            nextUnfinished
              ? `<button type="button" class="btn btn-primary btn-lg" id="btn-next-daily">
                   Next: ${escapeHtml(nextUnfinished.meta.title)} (${escapeHtml(nextUnfinished.meta.pillarLabel)}) →
                 </button>`
              : `<button type="button" class="btn btn-primary btn-lg" id="btn-back-home-main">
                   ${completedDailyNow ? 'See My Gold Star & Free Play →' : 'Back to Studio Home'}
                 </button>`
          }
          <button type="button" class="btn btn-secondary" id="btn-play-again">Play Again</button>
          ${nextUnfinished ? `<button type="button" class="btn btn-ghost" id="btn-pause-home">Pause &amp; Return Home</button>` : ''}
        </div>
      </section>
    `;

    const nextBtn = container.querySelector('#btn-next-daily');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        playClick();
        handlers.onStartGame(nextUnfinished.meta.id, { isDailyMix: true, dailyGames });
      });
    }
    const homeMainBtn = container.querySelector('#btn-back-home-main');
    if (homeMainBtn) {
      homeMainBtn.addEventListener('click', () => {
        playClick();
        exitToHome();
      });
    }
    const pauseBtn = container.querySelector('#btn-pause-home');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        playClick();
        exitToHome();
      });
    }
    container.querySelector('#btn-play-again').addEventListener('click', () => {
      playClick();
      handlers.onStartGame(gameMod.meta.id, { isDailyMix, dailyGames });
    });
  }

  function renderCurrentRound() {
    runCleanup();
    const round = rounds[roundIdx];
    const isCustomFlow = rounds.length === 1 && round.kind === 'fact-studio-flow';
    let currentSpeakText = round.speakPrompt || round.prompt;
    let currentTipText = round.strategyTip || '';

    const dailyStepNum = isDailyMix
      ? dailyGames.findIndex((g) => g.meta.id === gameMod.meta.id) + 1
      : 0;

    container.innerHTML = `
      <div class="session-wrap">
        <div class="session-topbar">
          <button type="button" class="btn btn-secondary" id="btn-exit-game" style="min-height:40px;padding:6px 14px;font-size:0.9rem;">
            ← Home
          </button>

          <div class="session-info">
            <span class="game-pillar-tag ${gameMod.meta.pillar}">${escapeHtml(gameMod.meta.pillarLabel)}</span>
            <span class="session-game-title">${escapeHtml(gameMod.meta.title)}</span>
            <span class="tier-badge" style="padding:4px 10px;font-size:0.76rem;">
              ${escapeHtml(tierInfo.name)}${isDailyMix && dailyStepNum ? ` · Mix ${dailyStepNum}/4` : ''}
            </span>
          </div>

          ${
            !isCustomFlow
              ? `<div class="session-progress-dots" aria-label="Puzzle ${roundIdx + 1} of ${rounds.length}">
                  ${rounds
                    .map(
                      (_, i) =>
                        `<span class="progress-dot ${i < roundIdx ? 'done' : i === roundIdx ? 'current' : ''}"></span>`
                    )
                    .join('')}
                 </div>`
              : '<span></span>'
          }
        </div>

        <section class="card game-stage animate-pop">
          <div class="prompt-header">
            <h1 class="prompt-text" id="stage-prompt">${escapeHtml(round.prompt)}</h1>
            <button type="button" class="speak-btn" id="btn-speak-prompt" title="Read prompt aloud" aria-label="Read prompt aloud">
              ${UI_ICONS.listen}
            </button>
          </div>

          <div class="strategy-bar">
            <button type="button" class="strategy-btn" id="btn-strategy-tip" aria-expanded="false">
              ${UI_ICONS.bulb}
              <span>Show Strategy Tip</span>
            </button>
            <div class="strategy-card" id="strategy-drawer" hidden>${escapeHtml(currentTipText)}</div>
          </div>

          <div id="round-mount" style="width:100%;display:flex;flex-direction:column;align-items:center;"></div>

          <div id="round-feedback-slot" style="width:100%;display:flex;flex-direction:column;align-items:center;gap:12px;min-height:48px;"></div>
        </section>
      </div>
    `;

    const promptEl = container.querySelector('#stage-prompt');
    const speakBtn = container.querySelector('#btn-speak-prompt');
    const tipBtn = container.querySelector('#btn-strategy-tip');
    const tipDrawer = container.querySelector('#strategy-drawer');
    const mountEl = container.querySelector('#round-mount');
    const feedbackSlot = container.querySelector('#round-feedback-slot');

    container.querySelector('#btn-exit-game').addEventListener('click', () => {
      playClick();
      exitToHome();
    });

    speakBtn.addEventListener('click', () => {
      speakText(currentSpeakText, true);
    });

    tipBtn.addEventListener('click', () => {
      playClick();
      const willShow = tipDrawer.hidden;
      tipDrawer.hidden = !willShow;
      tipBtn.setAttribute('aria-expanded', String(willShow));
      tipBtn.innerHTML = willShow
        ? `${UI_ICONS.bulb}<span>Hide Strategy Tip</span>`
        : `${UI_ICONS.bulb}<span>Show Strategy Tip</span>`;
      if (willShow && profile.readAloud) {
        speakText(currentTipText);
      }
    });

    // Keyboard shortcuts (1-4 for choice buttons when not using Fact Studio's keypad)
    if (!isCustomFlow) {
      sessionKeyHandler = (e) => {
        if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        const nextBtn = feedbackSlot.querySelector('#btn-next-round');
        if (nextBtn && e.key === 'Enter') {
          e.preventDefault();
          nextBtn.click();
          return;
        }
        if (/^[1-4]$/.test(e.key) && !nextBtn) {
          const btns = Array.from(mountEl.querySelectorAll('.choice-btn'));
          const targetBtn = btns[Number(e.key) - 1];
          if (targetBtn && !targetBtn.disabled) {
            e.preventDefault();
            targetBtn.click();
          }
        }
      };
      window.addEventListener('keydown', sessionKeyHandler);
    }

    // Auto read-aloud for younger kids / profiles with Read-Aloud enabled
    if (profile.readAloud && currentSpeakText) {
      speakText(currentSpeakText);
    }

    gameMod.renderRound(mountEl, round, {
      profile,
      playClick,
      playCorrect,
      playRetry,
      playSwitch,
      registerCleanup: (fn) => {
        activeCleanup = fn;
      },
      setPrompt: (newPrompt, newTip, newSpeak) => {
        promptEl.textContent = newPrompt;
        if (newTip !== undefined) {
          currentTipText = newTip;
          tipDrawer.textContent = newTip;
          tipDrawer.hidden = true;
          tipBtn.setAttribute('aria-expanded', 'false');
          tipBtn.innerHTML = `${UI_ICONS.bulb}<span>Show Strategy Tip</span>`;
        }
        if (newSpeak !== undefined) {
          currentSpeakText = newSpeak;
          if (profile.readAloud && newSpeak) speakText(newSpeak);
        }
      },
      onCorrect: (wasCleanFirstTry, message) => {
        playCorrect();
        totalAttempts += 1;
        if (wasCleanFirstTry) cleanCorrect += 1;

        const isLast = roundIdx >= rounds.length - 1;
        feedbackSlot.innerHTML = `
          <div class="feedback-banner correct">✓ ${escapeHtml(message)}</div>
          <button type="button" class="btn btn-primary" id="btn-next-round">
            ${isLast ? 'Finish Round ★' : 'Next Puzzle →'}
          </button>
        `;
        const nextBtn = feedbackSlot.querySelector('#btn-next-round');
        nextBtn.focus();
        nextBtn.addEventListener('click', () => {
          playClick();
          if (isLast) {
            showCelebration({
              correct: cleanCorrect,
              attempts: totalAttempts,
              masteryNote: `${cleanCorrect}/${rounds.length} solved on first try`,
            });
          } else {
            roundIdx += 1;
            renderCurrentRound();
          }
        });
      },
      onRetry: (message) => {
        playRetry();
        feedbackSlot.innerHTML = `<div class="feedback-banner retry animate-shake">↺ ${escapeHtml(message)}</div>`;
      },
      onCustomComplete: (result) => {
        showCelebration(result);
      },
    });
  }

  renderCurrentRound();
  return runCleanup;
}
