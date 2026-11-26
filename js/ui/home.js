/**
 * Home Screen:
 * - Multi-kid profile switcher
 * - Today's 4-pillar Daily Mix Hero Card
 * - Forgiving Monthly Sticker Calendar & Studio Shelf
 * - Free Play Lab (all 12 mini-games with pillar filters & effective tier badges)
 */

import { getAvatarSvg, PILLAR_ICONS, STAR_SVG, STUDIO_BADGES, STUDIO_SHELF_ITEMS } from '../avatars.js';
import { getDailyMix, getMonthCalendarData } from '../daily.js';
import { PILLARS, GAMES } from '../games/index.js';
import { getEffectiveTier, getGameStage, getTierInfo, getTodayKey } from '../storage.js';
import { escapeHtml } from '../games/utils.js';

export function renderHome(container, state, activeProfile, activeFilter, handlers) {
  const todayKey = getTodayKey();
  const dailyGames = getDailyMix(todayKey);
  const dp = activeProfile.dailyProgress[todayKey] || { doneGameIds: [], completed: false };
  const doneSet = new Set(dp.doneGameIds || []);
  const nextDailyIdx = dailyGames.findIndex((g) => !doneSet.has(g.meta.id));
  const dailyDoneCount = dailyGames.filter((g) => doneSet.has(g.meta.id)).length;
  const isDailyComplete = dailyDoneCount === dailyGames.length;
  const tierInfo = getTierInfo(activeProfile.tier);
  const computeTier = getEffectiveTier(activeProfile, 'compute');
  const hasTimedSprintToday =
    dailyGames.some((g) => g.meta.timed) && computeTier >= 2 && !activeProfile.calmMode;
  const calData = getMonthCalendarData(activeProfile.completedDates);
  const totalStars = (activeProfile.completedDates || []).length;
  const unlockedSet = new Set(activeProfile.unlockedBadges || []);

  // Keep calendar badge shelf tidy: show unlocked badges + up to 3 upcoming targets
  const unlockedBadges = STUDIO_BADGES.filter((b) => unlockedSet.has(b.id));
  const nextBadges = STUDIO_BADGES.filter((b) => !unlockedSet.has(b.id)).slice(0, Math.max(3, 6 - unlockedBadges.length));
  const displayBadges = [...unlockedBadges.slice(-5), ...nextBadges].slice(0, 6);

  const unlockedShelfCount = STUDIO_SHELF_ITEMS.filter((it) => totalStars >= it.starsRequired).length;
  const nextShelfItem = STUDIO_SHELF_ITEMS.find((it) => totalStars < it.starsRequired);

  const filteredGames =
    activeFilter === 'all' ? GAMES : GAMES.filter((g) => g.meta.pillar === activeFilter);

  container.innerHTML = `
    <section class="profile-strip" aria-label="Choose player profile">
      <span class="profile-strip-label">Who's playing?</span>
      ${state.profiles
        .map((p) => {
          const pTier = getTierInfo(p.tier);
          const isCurrent = p.id === activeProfile.id;
          return `
            <button type="button"
                    class="profile-chip ${isCurrent ? 'active' : ''}"
                    data-profile-id="${escapeHtml(p.id)}"
                    aria-pressed="${isCurrent}">
              <span class="profile-avatar">${getAvatarSvg(p.avatar)}</span>
              <span class="profile-meta">
                <span class="profile-name">${escapeHtml(p.name)}</span>
                <span class="profile-tier">${escapeHtml(pTier.name)} · ${escapeHtml(pTier.ageLabel)}</span>
              </span>
            </button>
          `;
        })
        .join('')}
    </section>

    <section class="home-hero-grid" aria-label="Today's Daily Mix and Calendar">
      <div class="card daily-hero">
        <div class="daily-hero-header">
          <div>
            <p class="daily-greeting">Ready to puzzle, ${escapeHtml(activeProfile.name)}?</p>
            <h1 class="daily-title">
              ${isDailyComplete ? "Today's Workout Complete!" : "Today's Thinking Mix"}
            </h1>
            <p class="daily-desc">
              ${
                isDailyComplete
                  ? 'You earned today’s gold calendar star! Stop on a high note, or explore any game in the Free Play Lab below.'
                  : 'Four quick puzzles — one from each room of the studio (Spatial, Math, Logic & Words), tuned right to your level.'
              }
            </p>
          </div>
          <span class="tier-badge">
            <span>${escapeHtml(tierInfo.name)}</span>
            <span>·</span>
            <span>${escapeHtml(tierInfo.ageLabel)}</span>
          </span>
        </div>

        <div class="mix-lineup" role="list" aria-label="Today's 4 games">
          ${dailyGames
            .map((g, idx) => {
              const isDone = doneSet.has(g.meta.id);
              const isNext = !isDailyComplete && idx === nextDailyIdx;
              return `
                <button type="button"
                        role="listitem"
                        class="mix-step ${isDone ? 'is-done' : ''} ${isNext ? 'is-next' : ''}"
                        data-daily-game="${escapeHtml(g.meta.id)}">
                  <div class="mix-step-top">
                    <span class="pillar-dot ${g.meta.pillar}"></span>
                    <span class="mix-step-status">${isDone ? '✓ Done' : isNext ? 'Up Next' : `Step ${idx + 1}`}</span>
                  </div>
                  <span class="mix-step-pillar">${escapeHtml(g.meta.pillarLabel)}</span>
                  <span class="mix-step-game">${escapeHtml(g.meta.title)}</span>
                </button>
              `;
            })
            .join('')}
        </div>

        <div class="daily-actions">
          ${
            isDailyComplete
              ? `<a href="#free-play-lab" class="btn btn-primary btn-lg" id="btn-jump-freeplay">Explore Free Play Lab ↓</a>
                 <button type="button" class="btn btn-secondary" id="btn-replay-mix">Replay Today's Mix</button>`
              : `<button type="button" class="btn btn-primary btn-lg" id="btn-start-daily">
                   ${dailyDoneCount === 0 ? "Start Today's Mix →" : `Continue Mix (${dailyDoneCount}/4 done) →`}
                 </button>
                 <span class="daily-note">${
                   hasTimedSprintToday
                     ? '3 untimed puzzles + 1 calm 60s Fact Sprint'
                     : activeProfile.calmMode || computeTier === 1
                       ? 'All untimed · Calm Mode'
                       : 'All 4 puzzles untimed today · Take your time'
                 }</span>`
          }
        </div>
      </div>

      <aside class="card calendar-card" aria-label="Monthly sticker calendar and studio badges">
        <div class="calendar-header">
          <h2 class="calendar-title">${escapeHtml(calData.monthName)}</h2>
          <span class="calendar-count">★ ${calData.starsThisMonth} ${calData.starsThisMonth === 1 ? 'day' : 'days'}</span>
        </div>

        <div class="calendar-grid" aria-label="Days completed this month">
          ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => `<div class="cal-dow">${d}</div>`).join('')}
          ${calData.cells
            .map((cell) => {
              if (cell.empty) return '<div class="cal-cell empty"></div>';
              return `
                <div class="cal-cell ${cell.hasStar ? 'has-star' : ''} ${cell.isToday ? 'is-today' : ''}"
                     title="${cell.key}${cell.hasStar ? ' — Daily Mix completed!' : ''}">
                  ${cell.hasStar ? STAR_SVG : cell.day}
                </div>
              `;
            })
            .join('')}
        </div>

        <div class="badge-shelf" aria-label="Mastery milestones">
          <div class="badge-shelf-head">
            <span>Mastery Milestones</span>
            <span>${unlockedSet.size}/${STUDIO_BADGES.length}</span>
          </div>
          <div class="badge-pills">
            ${displayBadges
              .map((b) => {
                const unlocked = unlockedSet.has(b.id);
                return `<span class="studio-badge ${unlocked ? `unlocked ${b.pillar}` : ''}" title="${escapeHtml(b.desc)}">${unlocked ? '★ ' : ''}${escapeHtml(b.title)}</span>`;
              })
              .join('')}
          </div>
        </div>
      </aside>
    </section>

    <section class="card shelf-card" aria-label="Studio Shelf collection">
      <div class="shelf-head">
        <div>
          <h2 class="shelf-title">${escapeHtml(activeProfile.name)}’s Studio Shelf</h2>
          <p class="shelf-sub">
            ${
              nextShelfItem
                ? `Collect permanent studio keepsakes with your Daily Mix stars — next up: <strong>${escapeHtml(nextShelfItem.title)}</strong> at ★ ${nextShelfItem.starsRequired} ${nextShelfItem.starsRequired === 1 ? 'star' : 'stars'}!`
                : 'Amazing! You collected every single keepsake on the Studio Shelf!'
            }
          </p>
        </div>
        <span class="calendar-count">${unlockedShelfCount}/${STUDIO_SHELF_ITEMS.length} collected · ★ ${totalStars} total</span>
      </div>
      <div class="shelf-ledge" role="list" aria-label="Studio keepsakes">
        ${STUDIO_SHELF_ITEMS.map((item) => {
          const unlocked = totalStars >= item.starsRequired;
          return `
            <div role="listitem"
                 class="shelf-item ${unlocked ? 'unlocked' : 'locked'}"
                 title="${escapeHtml(item.title)} (${unlocked ? 'Unlocked!' : `Unlocks at ${item.starsRequired} total daily stars`})">
              <div class="shelf-item-art">${item.svg}</div>
              <span class="shelf-item-label">${unlocked ? escapeHtml(item.title) : `★ ${item.starsRequired}`}</span>
            </div>
          `;
        }).join('')}
      </div>
    </section>

    <section id="free-play-lab" aria-label="Free Play Lab">
      <div class="section-header">
        <div>
          <h2 class="section-title">Free Play Lab</h2>
          <p class="section-sub">
            ${
              isDailyComplete
                ? 'Daily Mix finished! Pick any game below to explore at your own pace.'
                : 'Prefer to jump straight into a favorite game, or keep exploring after your Daily Mix?'
            }
          </p>
        </div>

        <div class="pillar-filter" role="tablist" aria-label="Filter games by thinking pillar">
          <button type="button" class="filter-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">All (${GAMES.length})</button>
          ${PILLARS.map(
            (pil) =>
              `<button type="button" class="filter-btn ${activeFilter === pil.id ? 'active' : ''}" data-filter="${pil.id}">${escapeHtml(pil.name)}</button>`
          ).join('')}
        </div>
      </div>

      <div class="games-grid">
        ${filteredGames
          .map((g) => {
            const effTier = getTierInfo(getEffectiveTier(activeProfile, g.meta.pillar));
            const stats = activeProfile.gameStats[g.meta.id];
            const stage = getGameStage(activeProfile, g.meta.id);
            const timingNote =
              g.meta.timed && effTier.id >= 2 && !activeProfile.calmMode
                ? 'Calm 60s Sprint'
                : 'Untimed';
            return `
              <button type="button" class="game-card" data-free-game="${escapeHtml(g.meta.id)}">
                <div>
                  <div class="game-card-top">
                    <span class="game-icon-wrap ${g.meta.pillar}">${PILLAR_ICONS[g.meta.pillar]}</span>
                    <div style="display:flex;align-items:center;gap:6px;">
                      ${stage >= 2 ? `<span class="stage-pill">Stage ${stage}</span>` : ''}
                      <span class="game-pillar-tag ${g.meta.pillar}">${escapeHtml(g.meta.pillarLabel)}</span>
                    </div>
                  </div>
                  <h3 class="game-card-title" style="margin-top:12px;">${escapeHtml(g.meta.title)}</h3>
                  <p class="game-card-desc">${escapeHtml(g.meta.shortDesc)}</p>
                </div>
                <div class="game-card-footer">
                  <span class="game-card-badge">${escapeHtml(effTier.name)} · ${timingNote}</span>
                  <span>${stats ? `${stats.plays}× played` : 'Play →'}</span>
                </div>
              </button>
            `;
          })
          .join('')}
      </div>
    </section>
  `;

  // Bind events
  container.querySelectorAll('[data-profile-id]').forEach((btn) => {
    btn.addEventListener('click', () => handlers.onSelectProfile(btn.dataset.profileId));
  });

  const startDailyBtn = container.querySelector('#btn-start-daily');
  if (startDailyBtn) {
    startDailyBtn.addEventListener('click', () => {
      const targetGame = dailyGames[Math.max(0, nextDailyIdx)];
      handlers.onStartGame(targetGame.meta.id, { isDailyMix: true, dailyGames });
    });
  }

  const replayMixBtn = container.querySelector('#btn-replay-mix');
  if (replayMixBtn) {
    replayMixBtn.addEventListener('click', () => {
      handlers.onStartGame(dailyGames[0].meta.id, { isDailyMix: true, dailyGames });
    });
  }

  container.querySelectorAll('[data-daily-game]').forEach((btn) => {
    btn.addEventListener('click', () => {
      handlers.onStartGame(btn.dataset.dailyGame, { isDailyMix: true, dailyGames });
    });
  });

  container.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => handlers.onFilterChange(btn.dataset.filter));
  });

  container.querySelectorAll('[data-free-game]').forEach((btn) => {
    btn.addEventListener('click', () => {
      handlers.onStartGame(btn.dataset.freeGame, { isDailyMix: false, dailyGames });
    });
  });
}
