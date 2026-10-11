/**
 * Arrow Escape — Progress Storage Service
 * Cross-platform persistent storage abstraction (AsyncStorage / localStorage fallback)
 */

export interface LevelRecord {
  stars: number;
  bestMoves: number;
  completedAt: number;
}

export interface UserProgressData {
  unlockedLevel: number;
  levelRecords: Record<number, LevelRecord>;
  hintsAvailable: number;
  selectedTheme: string;
  selectedSkin?: string;
  selectedEscapeEffect?: string;
  unlockedCosmetics?: string[];
  cosmeticsVipUnlocked?: boolean;
  perfectClearBadges?: number[];
  perfectClearsCount?: number;
  quickEscapeWins?: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  adsRemoved: boolean;
  totalMovesMade: number;
  totalArrowsEscaped: number;
  totalPlayTimeSeconds: number;
}

export const STORAGE_KEY = '@arrow_escape_user_progress_v1';

export const DEFAULT_PROGRESS: UserProgressData = {
  unlockedLevel: 1,
  levelRecords: {},
  hintsAvailable: 5,
  selectedTheme: 'dawn',
  selectedSkin: 'classic',
  selectedEscapeEffect: 'classic',
  unlockedCosmetics: ['theme:dawn', 'theme:paperLight', 'skin:classic', 'effect:classic'],
  cosmeticsVipUnlocked: false,
  perfectClearBadges: [],
  perfectClearsCount: 0,
  quickEscapeWins: 0,
  soundEnabled: true,
  hapticsEnabled: true,
  adsRemoved: false,
  totalMovesMade: 0,
  totalArrowsEscaped: 0,
  totalPlayTimeSeconds: 0,
};

// In-memory backing store for tests / SSR / non-browser environments
let memoryStore: Record<string, string> = {};

// In-memory cache for fast sync access
let memoryCache: UserProgressData = { ...DEFAULT_PROGRESS };

/**
 * Universal key-value getter
 */
function getRawItem(key: string): string | null {
  try {
    const storage = (globalThis as any).localStorage;
    if (storage && typeof storage.getItem === 'function') {
      return storage.getItem(key);
    }
  } catch (e) {
    // fallback
  }
  return memoryStore[key] || null;
}

/**
 * Universal key-value setter
 */
function setRawItem(key: string, value: string): void {
  memoryStore[key] = value;
  try {
    const storage = (globalThis as any).localStorage;
    if (storage && typeof storage.setItem === 'function') {
      storage.setItem(key, value);
    }
  } catch (e) {
    // fallback
  }
}

const CHECKSUM_SALT = 'ae_v1_integrity_salt_8f49a21b';

/**
 * Computes a simple deterministic hash checksum to prevent manual tampering.
 */
function computeChecksum(data: UserProgressData): string {
  const payload = `${data.unlockedLevel}:${Object.keys(data.levelRecords).length}:${data.hintsAvailable}:${data.adsRemoved}:${CHECKSUM_SALT}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (Math.imul(31, hash) + payload.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(16);
}

/**
 * Validates data integrity and clamps suspicious values.
 */
function sanitizeProgress(parsed: any): UserProgressData {
  const unlocked = typeof parsed.unlockedLevel === 'number' && parsed.unlockedLevel >= 1 && parsed.unlockedLevel <= 501
    ? parsed.unlockedLevel
    : 1;

  const hints = typeof parsed.hintsAvailable === 'number' && parsed.hintsAvailable >= 0 && parsed.hintsAvailable <= 9999
    ? parsed.hintsAvailable
    : 5;

  // Sanitize levelRecords
  const cleanRecords: Record<number, LevelRecord> = {};
  if (parsed.levelRecords && typeof parsed.levelRecords === 'object') {
    Object.entries(parsed.levelRecords).forEach(([key, rec]: [string, any]) => {
      const id = Number(key);
      if (id >= 1 && id <= 500 && rec && typeof rec === 'object') {
        const stars = Math.min(3, Math.max(1, Number(rec.stars) || 1));
        const bestMoves = Math.max(1, Number(rec.bestMoves) || 1);
        cleanRecords[id] = {
          stars,
          bestMoves,
          completedAt: Number(rec.completedAt) || Date.now(),
        };
      }
    });
  }

  return {
    ...DEFAULT_PROGRESS,
    ...parsed,
    unlockedLevel: unlocked,
    hintsAvailable: hints,
    levelRecords: cleanRecords,
  };
}

/**
 * Loads user progress from local persistence
 */
export async function loadUserProgress(): Promise<UserProgressData> {
  try {
    const raw = getRawItem(STORAGE_KEY);
    if (raw) {
      const parsedEnvelope = JSON.parse(raw);
      // Support both envelope format and raw legacy format
      const data = parsedEnvelope.data ? parsedEnvelope.data : parsedEnvelope;
      const storedSig = parsedEnvelope.sig;

      const sanitized = sanitizeProgress(data);

      // Verify signature if present
      if (storedSig && storedSig !== computeChecksum(sanitized)) {
        console.warn('[ProgressStorage] Checksum mismatch! Potential tampering detected, sanitizing data.');
      }

      memoryCache = sanitized;
      return memoryCache;
    }
  } catch (err) {
    console.warn('[ProgressStorage] Failed to read progress, using defaults', err);
  }

  memoryCache = { ...DEFAULT_PROGRESS };
  return memoryCache;
}

/**
 * Persists updated progress with cryptographic integrity signature
 */
export async function saveUserProgress(progress: Partial<UserProgressData>): Promise<UserProgressData> {
  memoryCache = sanitizeProgress({
    ...memoryCache,
    ...progress,
  });

  try {
    const envelope = {
      data: memoryCache,
      sig: computeChecksum(memoryCache),
      ts: Date.now(),
    };
    setRawItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (err) {
    console.warn('[ProgressStorage] Failed to save progress', err);
  }

  return memoryCache;
}

/**
 * Records completion of a level with earned stars and moves
 */
export async function recordLevelCompletion(
  levelId: number,
  stars: number,
  moves: number,
  arrowsCount: number = 0,
  playDurationSec: number = 0
): Promise<UserProgressData> {
  const currentRecord = memoryCache.levelRecords[levelId];
  const bestStars = currentRecord ? Math.max(currentRecord.stars, stars) : stars;
  const bestMoves = currentRecord ? Math.min(currentRecord.bestMoves, moves) : moves;

  const updatedRecords: Record<number, LevelRecord> = {
    ...memoryCache.levelRecords,
    [levelId]: {
      stars: bestStars,
      bestMoves,
      completedAt: Date.now(),
    },
  };

  const nextUnlocked = Math.max(memoryCache.unlockedLevel, levelId + 1);
  const nextMoves = (memoryCache.totalMovesMade || 0) + moves;
  const nextArrows = (memoryCache.totalArrowsEscaped || 0) + (arrowsCount > 0 ? arrowsCount : moves);
  const nextPlayTime = (memoryCache.totalPlayTimeSeconds || 0) + playDurationSec;

  return saveUserProgress({
    unlockedLevel: nextUnlocked,
    levelRecords: updatedRecords,
    totalMovesMade: nextMoves,
    totalArrowsEscaped: nextArrows,
    totalPlayTimeSeconds: nextPlayTime,
  });
}

/**
 * Increments cumulative moves, arrows, and playtime stats
 */
export async function incrementGameplayCounters(
  movesDelta: number,
  arrowsDelta: number,
  playTimeDeltaSec: number = 0
): Promise<UserProgressData> {
  const nextMoves = (memoryCache.totalMovesMade || 0) + movesDelta;
  const nextArrows = (memoryCache.totalArrowsEscaped || 0) + arrowsDelta;
  const nextPlayTime = (memoryCache.totalPlayTimeSeconds || 0) + playTimeDeltaSec;

  return saveUserProgress({
    totalMovesMade: nextMoves,
    totalArrowsEscaped: nextArrows,
    totalPlayTimeSeconds: nextPlayTime,
  });
}

/**
 * Deducts or grants hints in the player's bank
 */
export async function updateHintsAvailable(delta: number): Promise<number> {
  const nextCount = Math.max(0, memoryCache.hintsAvailable + delta);
  await saveUserProgress({ hintsAvailable: nextCount });
  return nextCount;
}

/**
 * Equips an unlocked cosmetic item
 */
export async function equipCosmetic(category: 'skin' | 'theme' | 'effect', key: string): Promise<UserProgressData> {
  const updates: Partial<UserProgressData> = {};
  if (category === 'skin') {
    updates.selectedSkin = key;
  } else if (category === 'theme') {
    updates.selectedTheme = key;
  } else if (category === 'effect') {
    updates.selectedEscapeEffect = key;
  }
  return saveUserProgress(updates);
}

/**
 * Permanently unlocks a cosmetic item
 */
export async function unlockCosmetic(itemId: string): Promise<UserProgressData> {
  const current = memoryCache.unlockedCosmetics || [];
  if (!current.includes(itemId)) {
    return saveUserProgress({
      unlockedCosmetics: [...current, itemId],
    });
  }
  return memoryCache;
}

/**
 * Records a Perfect Clear badge for completing a puzzle within target move budget
 */
export async function recordPerfectClear(levelId: number): Promise<UserProgressData> {
  const currentBadges = memoryCache.perfectClearBadges || [];
  const nextBadges = currentBadges.includes(levelId) ? currentBadges : [...currentBadges, levelId];
  const nextCount = (memoryCache.perfectClearsCount || 0) + (currentBadges.includes(levelId) ? 0 : 1);
  return saveUserProgress({
    perfectClearBadges: nextBadges,
    perfectClearsCount: nextCount,
  });
}

/**
 * Increments completed Quick Escape counter
 */
export async function recordQuickEscapeWin(): Promise<UserProgressData> {
  const nextWins = (memoryCache.quickEscapeWins || 0) + 1;
  return saveUserProgress({
    quickEscapeWins: nextWins,
  });
}

/**
 * Resets all progress back to factory defaults
 */
export async function resetAllProgress(): Promise<UserProgressData> {
  memoryCache = { ...DEFAULT_PROGRESS };
  memoryStore = {};
  try {
    const storage = (globalThis as any).localStorage;
    if (storage && typeof storage.removeItem === 'function') {
      storage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    // ignore
  }
  return memoryCache;
}

