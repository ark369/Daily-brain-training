/**
 * LocalStorage persistence for multi-kid profiles, forgiving daily sticker calendar,
 * per-pillar tier overrides, and spaced-retrieval math fact scheduling.
 */

const STORAGE_KEY = 'daily_thinking_studio_v1';

export const TIERS = [
  {
    id: 1,
    name: 'Sprout',
    ageLabel: 'Ages 5–6',
    shortDesc: 'Untimed · Read-aloud friendly · Foundations',
  },
  {
    id: 2,
    name: 'Explorer',
    ageLabel: 'Ages 7–8',
    shortDesc: 'Spatial 3D · Mental math · Calm 60s Fact Sprint',
  },
  {
    id: 3,
    name: 'Challenger',
    ageLabel: 'Ages 9–10',
    shortDesc: 'Fractions · Visual algebra · Greek/Latin roots',
  },
  {
    id: 4,
    name: 'Trailblazer',
    ageLabel: 'Ages 11+',
    shortDesc: 'Stretch tier · Negatives · Two-scale algebra',
  },
];

export function getTierInfo(tierId) {
  return TIERS.find((t) => t.id === Number(tierId)) || TIERS[0];
}

export function getTodayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function createProfile({ id, name, avatar, tier, readAloud = false, calmMode = false }) {
  return {
    id,
    name,
    avatar,
    tier,
    pillarTiers: {}, // optional overrides: { visualize: 2, compute: 3, ... }
    readAloud,
    calmMode,
    completedDates: [], // ['YYYY-MM-DD', ...] forgiving sticker calendar
    dailyProgress: {}, // { 'YYYY-MM-DD': { doneGameIds: [], completed: false } }
    gameStats: {}, // { gameId: { plays, bestScore, totalCorrect, totalAttempts, lastNote } }
    factHistory: {}, // { '7x6': { box, attempts, misses, lastMs, avgMs, lastSeenDay } }
    unlockedBadges: [], // non-punitive competence badges
  };
}

function defaultState() {
  const profiles = [
    createProfile({
      id: 'kid-sprout',
      name: 'Sprout (5→6)',
      avatar: 'fox',
      tier: 1,
      readAloud: true,
      calmMode: true,
    }),
    createProfile({
      id: 'kid-explorer',
      name: 'Explorer (7→8)',
      avatar: 'owl',
      tier: 2,
      readAloud: false,
      calmMode: false,
    }),
    createProfile({
      id: 'kid-challenger',
      name: 'Challenger (9→10)',
      avatar: 'otter',
      tier: 3,
      readAloud: false,
      calmMode: false,
    }),
  ];
  return {
    version: 1,
    activeProfileId: profiles[0].id,
    soundEnabled: true,
    profiles,
  };
}

function getSafeStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

export function loadState() {
  const storage = getSafeStorage();
  if (!storage) return defaultState();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
      return defaultState();
    }
    // Hydrate any missing fields safely
    parsed.profiles = parsed.profiles.map((p) => ({
      pillarTiers: {},
      readAloud: p.tier === 1,
      calmMode: p.tier === 1,
      completedDates: [],
      dailyProgress: {},
      gameStats: {},
      factHistory: {},
      unlockedBadges: [],
      ...p,
    }));
    if (!parsed.profiles.some((p) => p.id === parsed.activeProfileId)) {
      parsed.activeProfileId = parsed.profiles[0].id;
    }
    if (typeof parsed.soundEnabled !== 'boolean') parsed.soundEnabled = true;
    return parsed;
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  const storage = getSafeStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors gracefully
  }
}

export function getActiveProfile(state) {
  return state.profiles.find((p) => p.id === state.activeProfileId) || state.profiles[0];
}

export function getEffectiveTier(profile, pillarId) {
  const override = profile.pillarTiers && profile.pillarTiers[pillarId];
  return Number(override || profile.tier || 1);
}

export function addProfile(state, { name, avatar = 'dino', tier = 1 }) {
  const id = `kid-${Date.now().toString(36)}`;
  const profile = createProfile({
    id,
    name: name.trim() || 'New Explorer',
    avatar,
    tier: Number(tier) || 1,
    readAloud: Number(tier) === 1,
    calmMode: Number(tier) === 1,
  });
  state.profiles.push(profile);
  state.activeProfileId = profile.id;
  saveState(state);
  return profile;
}

export function deleteProfile(state, profileId) {
  if (state.profiles.length <= 1) return false;
  state.profiles = state.profiles.filter((p) => p.id !== profileId);
  if (state.activeProfileId === profileId) {
    state.activeProfileId = state.profiles[0].id;
  }
  saveState(state);
  return true;
}

const GAME_TO_BADGE = {
  'cube-architect': 'spatial-builder',
  'shape-shifter': 'spatial-builder',
  'number-line': 'number-navigator',
  'fact-studio': 'number-navigator',
  'balance-lab': 'logic-detective',
  'rule-switcher': 'logic-detective',
  'word-builder': 'word-wizard',
  'word-connections': 'word-wizard',
};

export function recordGameResult(state, profileId, {
  gameId,
  correct,
  attempts,
  masteryNote,
  isDailyMix = false,
  dailyGameIds = [],
  todayKey = getTodayKey(),
}) {
  const profile = state.profiles.find((p) => p.id === profileId);
  if (!profile) return { completedDailyNow: false, newBadges: [], isNewPersonalBest: false };

  const prev = profile.gameStats[gameId] || {
    plays: 0,
    bestScore: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    lastNote: '',
  };
  const isNewPersonalBest = prev.plays > 0 && correct > prev.bestScore;
  profile.gameStats[gameId] = {
    plays: prev.plays + 1,
    bestScore: Math.max(prev.bestScore, correct),
    totalCorrect: prev.totalCorrect + correct,
    totalAttempts: prev.totalAttempts + attempts,
    lastNote: masteryNote || prev.lastNote,
  };

  let completedDailyNow = false;
  if (isDailyMix) {
    const dp = profile.dailyProgress[todayKey] || { doneGameIds: [], completed: false };
    if (!dp.doneGameIds.includes(gameId)) {
      dp.doneGameIds.push(gameId);
    }
    const allDone =
      dailyGameIds.length > 0 && dailyGameIds.every((id) => dp.doneGameIds.includes(id));
    if (allDone && !dp.completed) {
      dp.completed = true;
      completedDailyNow = true;
      if (!profile.completedDates.includes(todayKey)) {
        profile.completedDates.push(todayKey);
      }
    }
    profile.dailyProgress[todayKey] = dp;
  }

  // Evaluate competence-based Mastery Badges (informational, permanent!)
  if (!Array.isArray(profile.unlockedBadges)) profile.unlockedBadges = [];
  const newBadges = [];
  const grant = (badgeId) => {
    if (badgeId && !profile.unlockedBadges.includes(badgeId)) {
      profile.unlockedBadges.push(badgeId);
      newBadges.push(badgeId);
    }
  };
  grant(GAME_TO_BADGE[gameId]);
  if (profile.completedDates.length >= 1) grant('daily-star');
  if (Object.keys(profile.gameStats).length >= 4) grant('all-rounder');

  saveState(state);
  return { completedDailyNow, newBadges, isNewPersonalBest };
}

/**
 * Spaced-retrieval fact scheduler (Leitner-inspired + latency tracking).
 * Facts missed or solved hesitantly (>3000ms) drop to box 1 so they resurface sooner.
 */
export function recordFactAttempt(profile, factKey, isCorrect, elapsedMs, todayKey = getTodayKey()) {
  if (!profile.factHistory) profile.factHistory = {};
  const rec = profile.factHistory[factKey] || {
    box: 1,
    attempts: 0,
    misses: 0,
    lastMs: elapsedMs,
    avgMs: elapsedMs,
    lastSeenDay: todayKey,
  };

  rec.attempts += 1;
  rec.lastMs = Math.round(elapsedMs);
  rec.avgMs = Math.round((rec.avgMs * (rec.attempts - 1) + elapsedMs) / rec.attempts);
  rec.lastSeenDay = todayKey;

  if (!isCorrect) {
    rec.misses += 1;
    rec.box = 1;
  } else if (elapsedMs > 3200) {
    // Accurate but hesitant — keep practicing for smooth retrieval
    rec.box = Math.min(rec.box, 2);
  } else {
    rec.box = Math.min(5, rec.box + 1);
  }

  profile.factHistory[factKey] = rec;
}

export function getTrickyFacts(profile, limit = 8) {
  const entries = Object.entries(profile.factHistory || {});
  return entries
    .filter(([, rec]) => rec.box <= 2 || rec.misses > 0 || rec.avgMs > 3200)
    .sort((a, b) => {
      if (a[1].box !== b[1].box) return a[1].box - b[1].box;
      return b[1].avgMs - a[1].avgMs;
    })
    .slice(0, limit)
    .map(([key, rec]) => ({ key, ...rec }));
}

export function exportStateJson(state) {
  return JSON.stringify(state, null, 2);
}

export function importStateJson(jsonStr) {
  const parsed = JSON.parse(jsonStr);
  if (!parsed || !Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
    throw new Error('Invalid backup file format.');
  }
  saveState(parsed);
  return loadState();
}
