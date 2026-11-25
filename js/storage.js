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
    gameMastery: {}, // { gameId: { stage: 1..3, cleanPlays: 0, recentAccuracies: [] } }
    factHistory: {}, // { '7x6': { box, attempts, misses, lastMs, avgMs, lastSeenDay } }
    wordHistory: {}, // { 'wb:t3:telescope': { box, attempts, misses, dueDay, lastSeenDay, lastSeenAt } }
    recentPuzzles: {}, // { 'balance-lab:3': ['alg:2:5:3', ...] } persisted rolling freshness buffer
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
      gameMastery: {},
      factHistory: {},
      wordHistory: {},
      recentPuzzles: {},
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
 * - Box 1: Missed fact (needs 2 consecutive fast, accurate recalls to graduate).
 * - Box 2: Hesitant (>3200ms) or 1 fast recall after a miss (needs 1 more fast recall).
 * - Box 3–5: Smooth & automatic (graduated out of the tricky queue).
 * Brand-new facts answered accurately AND smoothly (<=3200ms) start at Box 3 so
 * already-known facts do not repeat immediately on the next session.
 */
export function recordFactAttempt(profile, factKey, isCorrect, elapsedMs, todayKey = getTodayKey()) {
  if (!profile.factHistory) profile.factHistory = {};
  const existing = profile.factHistory[factKey];
  const isFast = elapsedMs <= 3200;

  if (!existing) {
    profile.factHistory[factKey] = {
      box: !isCorrect ? 1 : isFast ? 3 : 2,
      attempts: 1,
      misses: isCorrect ? 0 : 1,
      lastMs: Math.round(elapsedMs),
      avgMs: Math.round(elapsedMs),
      lastSeenDay: todayKey,
      lastSeenAt: Date.now(),
    };
    return;
  }

  const rec = { ...existing };
  rec.attempts += 1;
  rec.lastMs = Math.round(elapsedMs);
  rec.avgMs = Math.round((rec.avgMs * (rec.attempts - 1) + elapsedMs) / rec.attempts);
  rec.lastSeenDay = todayKey;
  rec.lastSeenAt = Date.now();

  if (!isCorrect) {
    rec.misses += 1;
    rec.box = 1;
  } else if (!isFast) {
    // Accurate but hesitant — hold at box 2 (or box 1 if still recovering from a miss)
    rec.box = Math.min(rec.box, 2);
  } else {
    // Accurate and smooth — climb 1 -> 2 -> 3 (graduated) -> 4 -> 5
    rec.box = Math.min(5, rec.box + 1);
  }

  profile.factHistory[factKey] = rec;
}

export function getTrickyFacts(profile, limit = 8) {
  const entries = Object.entries(profile.factHistory || {});
  return entries
    .filter(([, rec]) => {
      if (rec.box <= 1) return true;
      if (rec.box === 2) {
        // Auto-heal legacy records where a 1-attempt fast accurate fact landed at box 2
        if (rec.misses === 0 && rec.lastMs <= 3200 && rec.attempts <= 1) return false;
        return true;
      }
      return false;
    })
    .sort((a, b) => {
      if (a[1].box !== b[1].box) return a[1].box - b[1].box;
      return b[1].lastMs - a[1].lastMs;
    })
    .slice(0, limit)
    .map(([key, rec]) => ({ key, ...rec }));
}

export function addDaysToKey(dateKey, deltaDays) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * Spaced-retrieval mastery scheduler for WordCraft & Story items.
 * - Clean first try -> Box 3 (due in +7 days so fresh vocabulary comes first!)
 * - Missed -> Box 1 (due in +1 day; resurfaces gently next session/day)
 * - Clean after miss -> climbs Box 1 -> 2 (+3d) -> 3 (+7d) -> 4 (+14d) -> 5 (+30d)
 */
const WORD_INTERVAL_DAYS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

export function recordWordAttempt(profile, wordKey, isCleanCorrect, todayKey = getTodayKey()) {
  if (!profile || !wordKey) return;
  if (!profile.wordHistory) profile.wordHistory = {};
  const existing = profile.wordHistory[wordKey];

  let nextBox;
  let attempts;
  let misses;
  if (!existing) {
    nextBox = isCleanCorrect ? 3 : 1;
    attempts = 1;
    misses = isCleanCorrect ? 0 : 1;
  } else {
    attempts = (existing.attempts || 0) + 1;
    misses = (existing.misses || 0) + (isCleanCorrect ? 0 : 1);
    nextBox = isCleanCorrect ? Math.min(5, (existing.box || 1) + 1) : 1;
  }

  profile.wordHistory[wordKey] = {
    box: nextBox,
    attempts,
    misses,
    dueDay: addDaysToKey(todayKey, WORD_INTERVAL_DAYS[nextBox] || 7),
    lastSeenDay: todayKey,
    lastSeenAt: Date.now(),
  };
}

/**
 * Selects `count` unique items prioritizing:
 * 1. Up to 2 overdue review items (missed/dueDay <= todayKey, not seen in this exact turn)
 * 2. Brand-new unseen items (shuffled)
 * 3. Remaining due / oldest-seen items so back-to-back replays never repeat recent cards
 */
export function selectSpacedWords(bank, profile, count, keyFn, todayKey = getTodayKey()) {
  const history = (profile && profile.wordHistory) || {};
  const shuffleLocal = (arr) => {
    const c = [...arr];
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  };

  const overdueMissed = [];
  const unseen = [];
  const dueReview = [];
  const futureMastered = [];

  for (const item of bank) {
    const k = keyFn(item);
    const rec = history[k];
    if (!rec) {
      unseen.push(item);
    } else if (rec.box <= 1 && rec.dueDay <= todayKey) {
      overdueMissed.push({ item, rec });
    } else if (rec.dueDay <= todayKey) {
      dueReview.push({ item, rec });
    } else {
      futureMastered.push({ item, rec });
    }
  }

  overdueMissed.sort((a, b) => (a.rec.lastSeenAt || 0) - (b.rec.lastSeenAt || 0));
  dueReview.sort((a, b) => (a.rec.lastSeenAt || 0) - (b.rec.lastSeenAt || 0));
  futureMastered.sort((a, b) => (a.rec.lastSeenAt || 0) - (b.rec.lastSeenAt || 0));

  const picked = [];
  const used = new Set();
  const addItem = (it) => {
    const k = keyFn(it);
    if (!used.has(k) && picked.length < count) {
      used.add(k);
      picked.push(it);
    }
  };

  // Up to 2 missed/due items first for true spaced retrieval
  overdueMissed.slice(0, 2).forEach((x) => addItem(x.item));
  // Fill mostly with brand-new unseen items
  shuffleLocal(unseen).forEach(addItem);
  // Then other due items
  dueReview.forEach((x) => addItem(x.item));
  // Then any remaining missed items
  overdueMissed.slice(2).forEach((x) => addItem(x.item));
  // Finally oldest mastered items (least recently seen first)
  futureMastered.forEach((x) => addItem(x.item));

  return shuffleLocal(picked);
}

// Persistent cross-reload rolling freshness cache per profile + game:tier scope
const anonRecentMap = new Map();

export function getRecentPuzzleSigs(profile, scopeKey) {
  if (profile) {
    if (!profile.recentPuzzles) profile.recentPuzzles = {};
    if (!Array.isArray(profile.recentPuzzles[scopeKey])) {
      profile.recentPuzzles[scopeKey] = [];
    }
    return profile.recentPuzzles[scopeKey];
  }
  if (!anonRecentMap.has(scopeKey)) anonRecentMap.set(scopeKey, []);
  return anonRecentMap.get(scopeKey);
}

export function recordRecentPuzzleSigs(profile, scopeKey, sigs, maxLen = 30) {
  const list = getRecentPuzzleSigs(profile, scopeKey);
  for (const s of sigs) {
    const idx = list.indexOf(s);
    if (idx !== -1) list.splice(idx, 1);
    list.push(s);
  }
  if (list.length > maxLen) {
    list.splice(0, list.length - maxLen);
  }
}

export function getGameStage(profile, gameId) {
  const m = profile && profile.gameMastery && profile.gameMastery[gameId];
  return Math.max(1, Math.min(3, Number((m && m.stage) || 1)));
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
