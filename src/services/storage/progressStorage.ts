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
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  adsRemoved: boolean;
}

export const STORAGE_KEY = '@arrow_escape_user_progress_v1';

export const DEFAULT_PROGRESS: UserProgressData = {
  unlockedLevel: 1,
  levelRecords: {},
  hintsAvailable: 5,
  selectedTheme: 'dawn',
  soundEnabled: true,
  hapticsEnabled: true,
  adsRemoved: false,
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

/**
 * Loads user progress from local persistence
 */
export async function loadUserProgress(): Promise<UserProgressData> {
  try {
    const raw = getRawItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryCache = {
        ...DEFAULT_PROGRESS,
        ...parsed,
        levelRecords: parsed.levelRecords || {},
      };
      return memoryCache;
    }
  } catch (err) {
    console.warn('[ProgressStorage] Failed to read progress, using defaults', err);
  }

  memoryCache = { ...DEFAULT_PROGRESS };
  return memoryCache;
}

/**
 * Persists updated progress
 */
export async function saveUserProgress(progress: Partial<UserProgressData>): Promise<UserProgressData> {
  memoryCache = {
    ...memoryCache,
    ...progress,
  };

  try {
    setRawItem(STORAGE_KEY, JSON.stringify(memoryCache));
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
  moves: number
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

  return saveUserProgress({
    unlockedLevel: nextUnlocked,
    levelRecords: updatedRecords,
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
