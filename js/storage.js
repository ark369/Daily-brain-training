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
    roundHistory: [], // local-only per-round timing & first-try telemetry (capped at 300)
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

function hydrateState(parsed) {
  if (!parsed || !Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
    return null;
  }
  const validProfiles = parsed.profiles.filter(
    (p) => p && typeof p === 'object' && typeof p.id === 'string' && p.id.trim()
  );
  if (validProfiles.length === 0) return null;

  const profiles = validProfiles.map((p) => {
    const tier = Math.max(1, Math.min(4, Number(p.tier) || 1));
    return {
      pillarTiers: {},
      readAloud: tier === 1,
      calmMode: tier === 1,
      completedDates: [],
      dailyProgress: {},
      gameStats: {},
      gameMastery: {},
      factHistory: {},
      wordHistory: {},
      recentPuzzles: {},
      roundHistory: [],
      unlockedBadges: [],
      ...p,
      roundHistory: Array.isArray(p.roundHistory) ? p.roundHistory.slice(-300) : [],
      name: typeof p.name === 'string' && p.name.trim() ? p.name.trim() : 'Explorer',
      avatar: typeof p.avatar === 'string' && p.avatar.trim() ? p.avatar : 'fox',
      tier,
    };
  });

  const activeProfileId = profiles.some((p) => p.id === parsed.activeProfileId)
    ? parsed.activeProfileId
    : profiles[0].id;

  return {
    version: Number(parsed.version) || 1,
    activeProfileId,
    soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
    profiles,
  };
}

export function loadState() {
  const storage = getSafeStorage();
  if (!storage) return defaultState();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return hydrateState(parsed) || defaultState();
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
  const id = `kid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
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
  'shape-composer': 'spatial-builder',
  'number-line': 'number-navigator',
  'fact-studio': 'number-navigator',
  'target-forge': 'number-navigator',
  'balance-lab': 'logic-detective',
  'rule-switcher': 'logic-detective',
  'clue-grid': 'logic-detective',
  'word-builder': 'word-wizard',
  'word-connections': 'word-wizard',
  'story-detective': 'word-wizard',
};

const SHELF_THRESHOLDS = [1, 2, 4, 6, 9, 12, 16, 20, 25, 32, 40, 50];
const BONUS_AVATAR_THRESHOLDS = [
  { key: 'narwhal', stars: 3 },
  { key: 'sloth', stars: 7 },
  { key: 'wolf', stars: 14 },
  { key: 'dragon', stars: 25 },
];

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
  if (!profile) {
    return {
      completedDailyNow: false,
      newBadges: [],
      isNewPersonalBest: false,
      stageUp: null,
      unlockedShelfCount: 0,
      newAvatarKey: null,
    };
  }

  const prevStars = profile.completedDates.length;
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

  // Update within-tier 3-stage Mastery progression
  const isFactSprint = gameId === 'fact-studio';
  const sessionAcc = attempts > 0 ? Math.min(1, correct / attempts) : 0;
  const isCleanSession = isFactSprint ? correct >= 8 || sessionAcc >= 0.8 : sessionAcc >= 0.8;

  if (!profile.gameMastery) profile.gameMastery = {};
  const gm = profile.gameMastery[gameId] || { stage: 1, cleanPlays: 0, recentAccuracies: [] };
  const prevStage = gm.stage || 1;
  if (isCleanSession) gm.cleanPlays = (gm.cleanPlays || 0) + 1;
  gm.recentAccuracies = [...(gm.recentAccuracies || []), Math.round(sessionAcc * 100)].slice(-6);
  const nextStage = gm.cleanPlays >= 6 ? 3 : gm.cleanPlays >= 3 ? 2 : 1;
  gm.stage = Math.max(prevStage, nextStage);
  profile.gameMastery[gameId] = gm;
  const stageUp = gm.stage > prevStage ? { from: prevStage, to: gm.stage } : null;

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

  const totalStars = profile.completedDates.length;
  const newlyUnlockedShelfThreshold =
    completedDailyNow && totalStars > prevStars && SHELF_THRESHOLDS.includes(totalStars)
      ? totalStars
      : 0;
  const newAvatarObj =
    completedDailyNow && totalStars > prevStars
      ? BONUS_AVATAR_THRESHOLDS.find((a) => a.stars === totalStars) || null
      : null;

  // Evaluate 16 competence-based Mastery Milestones (never granted for button-mashing 0/5!)
  if (!Array.isArray(profile.unlockedBadges)) profile.unlockedBadges = [];
  const newBadges = [];
  const grant = (badgeId) => {
    if (badgeId && !profile.unlockedBadges.includes(badgeId)) {
      profile.unlockedBadges.push(badgeId);
      newBadges.push(badgeId);
    }
  };

  if (isCleanSession) grant(GAME_TO_BADGE[gameId]);
  if (!isFactSprint && attempts >= 4 && correct === attempts) grant('perfect-round');
  if (totalStars >= 1) grant('daily-star');
  if (totalStars >= 5) grant('five-stars');
  if (totalStars >= 15) grant('fifteen-stars');
  if (totalStars >= 30) grant('thirty-stars');
  if (Object.keys(profile.gameStats).length >= 4) grant('all-rounder');
  if (Object.keys(profile.gameStats).length >= 8) grant('grand-explorer');

  const masteredWords = Object.values(profile.wordHistory || {}).filter((r) => r.box >= 3).length;
  if (masteredWords >= 15) grant('word-collector');
  if (masteredWords >= 45) grant('word-scholar');

  const smoothFacts = Object.values(profile.factHistory || {}).filter((r) => r.box >= 3).length;
  if (smoothFacts >= 20) grant('fact-smooth');

  const maxStage = Math.max(1, ...Object.values(profile.gameMastery || {}).map((m) => m.stage || 1));
  if (maxStage >= 2) grant('stage-2-unlock');
  if (maxStage >= 3) grant('stage-3-master');

  saveState(state);
  return {
    completedDailyNow,
    newBadges,
    isNewPersonalBest,
    stageUp,
    unlockedShelfCount: newlyUnlockedShelfThreshold,
    newAvatarKey: newAvatarObj ? newAvatarObj.key : null,
  };
}

/**
 * Recommends gentle tier promotions in Parent Corner when a child consistently
 * shows strong mastery in a pillar (>= 4 plays with >= 88% avg accuracy, or Stage 3 reached).
 */
export function getTierUpRecommendations(profile, pillars, games) {
  const recs = [];
  for (const pil of pillars) {
    const curTier = getEffectiveTier(profile, pil.id);
    if (curTier >= 4) continue;
    const pilGames = games.filter((g) => g.meta.pillar === pil.id);
    let totalPlays = 0;
    let accSum = 0;
    let accCount = 0;
    let hitStage3 = false;

    for (const g of pilGames) {
      const st = profile.gameStats && profile.gameStats[g.meta.id];
      const gm = profile.gameMastery && profile.gameMastery[g.meta.id];
      if (st) totalPlays += st.plays || 0;
      if (gm && gm.stage >= 3) hitStage3 = true;
      if (gm && Array.isArray(gm.recentAccuracies)) {
        for (const a of gm.recentAccuracies) {
          accSum += a;
          accCount += 1;
        }
      }
    }

    const avgAcc = accCount > 0 ? Math.round(accSum / accCount) : 0;
    if ((accCount >= 4 && avgAcc >= 88) || hitStage3) {
      recs.push({
        pillarId: pil.id,
        pillarName: pil.name,
        currentTier: curTier,
        nextTier: curTier + 1,
        avgAcc,
        totalPlays: accCount || totalPlays,
      });
    }
  }
  return recs;
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

/**
 * Local-only per-round difficulty & friction telemetry (never leaves device; included in Backup JSON).
 */
export function recordRoundTelemetry(
  state,
  profileId,
  { gameId, tier, subtype = 'default', firstTry = true, timeMs = 0, usedTip = false, todayKey = getTodayKey() }
) {
  const profile = state && state.profiles && state.profiles.find((p) => p.id === profileId);
  if (!profile) return;
  if (!Array.isArray(profile.roundHistory)) profile.roundHistory = [];
  profile.roundHistory.push({
    g: String(gameId),
    t: Math.max(1, Math.min(4, Number(tier) || 1)),
    s: String(subtype || 'default').slice(0, 32),
    ok: Boolean(firstTry),
    ms: Math.max(0, Math.min(300000, Math.round(Number(timeMs) || 0))),
    tip: Boolean(usedTip),
    d: todayKey,
  });
  if (profile.roundHistory.length > 300) {
    profile.roundHistory.splice(0, profile.roundHistory.length - 300);
  }
  saveState(state);
}

export function clearRoundTelemetry(state, profileId) {
  const profile = state && state.profiles && state.profiles.find((p) => p.id === profileId);
  if (!profile) return;
  profile.roundHistory = [];
  saveState(state);
}

export function getDifficultyInsights(profile, games) {
  const hist = (profile && Array.isArray(profile.roundHistory) && profile.roundHistory) || [];
  if (hist.length === 0) return [];
  const byKey = new Map();
  for (const row of hist) {
    const key = `${row.g}|${row.t}`;
    if (!byKey.has(key)) {
      byKey.set(key, { gameId: row.g, tier: row.t, times: [], okCount: 0, tipCount: 0, total: 0 });
    }
    const agg = byKey.get(key);
    agg.total += 1;
    if (row.ok) agg.okCount += 1;
    if (row.tip) agg.tipCount += 1;
    if (row.ms > 0) agg.times.push(row.ms);
  }

  const results = [];
  for (const agg of byKey.values()) {
    const game = games.find((gm) => gm.meta.id === agg.gameId);
    const firstTryPct = Math.round((agg.okCount / agg.total) * 100);
    const tipPct = Math.round((agg.tipCount / agg.total) * 100);
    const sorted = [...agg.times].sort((a, b) => a - b);
    const medianMs = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
    const medianSec = Number((medianMs / 1000).toFixed(1));

    let status = 'gathering';
    let statusLabel = 'Gathering data';
    if (agg.total >= 3) {
      if (firstTryPct < 60) {
        status = 'hard';
        statusLabel = 'Spiky / Practice';
      } else if (agg.total >= 4 && firstTryPct >= 95 && medianSec > 0 && medianSec < 4.5) {
        status = 'easy';
        statusLabel = 'Too Easy?';
      } else {
        status = 'flow';
        statusLabel = 'Flow Zone';
      }
    }

    results.push({
      gameId: agg.gameId,
      title: game ? game.meta.title : agg.gameId,
      pillar: game ? game.meta.pillar : 'visualize',
      tier: agg.tier,
      total: agg.total,
      firstTryPct,
      tipPct,
      medianSec,
      status,
      statusLabel,
    });
  }

  // Sort: spiky first, then too easy, then flow, then gathering
  const order = { hard: 0, easy: 1, flow: 2, gathering: 3 };
  return results.sort((a, b) => order[a.status] - order[b.status] || b.total - a.total);
}

export function exportStateJson(state) {
  return JSON.stringify(state, null, 2);
}

export function importStateJson(jsonStr) {
  const parsed = JSON.parse(jsonStr);
  const hydrated = hydrateState(parsed);
  if (!hydrated) {
    throw new Error('Invalid backup file format.');
  }
  saveState(hydrated);
  return hydrated;
}
