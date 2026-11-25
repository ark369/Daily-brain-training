/**
 * Deterministic date-seeded Daily Mix generator.
 * Picks 4 interleaved games (1 per pillar) that rotate smoothly day-by-day
 * so kids experience spaced, varied practice across all 4 evidence-backed pillars.
 */

import { PILLARS, GAMES } from './games/index.js';
import { getTodayKey } from './storage.js';

function hashDateKey(dateKey) {
  // Stable day index from YYYY-MM-DD
  const [y, m, d] = dateKey.split('-').map(Number);
  const utcDays = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  return utcDays;
}

export function getDailyMix(dateKey = getTodayKey()) {
  const dayNum = hashDateKey(dateKey);

  // Rotate each pillar's pair on staggered phases so consecutive days never repeat the exact 4-game set
  const picks = PILLARS.map((pillar, pillarIdx) => {
    const pillarGames = GAMES.filter((g) => g.meta.pillar === pillar.id);
    const offset = (dayNum + (pillarIdx % 2 === 0 ? 0 : Math.floor(dayNum / 2))) % pillarGames.length;
    return pillarGames[Math.abs(offset)];
  });

  // Rotate pillar order gently each day for fresh interleaving
  const shift = ((dayNum % picks.length) + picks.length) % picks.length;
  return [...picks.slice(shift), ...picks.slice(0, shift)];
}

export function getMonthCalendarData(completedDates = [], referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = getTodayKey(referenceDate);
  const completedSet = new Set(completedDates);

  const monthName = firstDay.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const cells = [];

  for (let i = 0; i < startDow; i++) {
    cells.push({ empty: true });
  }
  let starsThisMonth = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasStar = completedSet.has(key);
    if (hasStar) starsThisMonth += 1;
    cells.push({
      empty: false,
      day,
      key,
      hasStar,
      isToday: key === todayKey,
    });
  }

  return { monthName, cells, starsThisMonth };
}
