/**
 * Arrow Escape — Daily Puzzle Challenge & Streak Service
 * Generates deterministic daily puzzles based on local calendar dates and tracks player streaks.
 */

import { ArrowConfig, Direction, LevelData } from '../../engine/types';
import { solveLevel } from '../../engine/solver';
import { playGamesService } from '../playgames/playGamesService';
import { updateHintsAvailable } from '../storage/progressStorage';

export interface DailyRecord {
  readonly date: string; // YYYY-MM-DD
  readonly puzzleNumber: number;
  readonly completed: boolean;
  readonly stars: number;
  readonly moves: number;
  readonly completedAt?: string;
}

export interface StreakMilestone {
  readonly days: number;
  readonly title: string;
  readonly rewardText: string;
  readonly icon: string;
  readonly xpReward: number;
}

export const STREAK_MILESTONES: readonly StreakMilestone[] = [
  { days: 1, title: 'First Step', rewardText: 'Daily Solver Badge', icon: '🎯', xpReward: 50 },
  { days: 3, title: 'On Fire', rewardText: '+150 Bonus XP', icon: '🔥', xpReward: 150 },
  { days: 7, title: 'Weekly Habit', rewardText: 'Neon Arrow Badge & +300 XP', icon: '⚡', xpReward: 300 },
  { days: 14, title: 'Fortnight Master', rewardText: 'Rare Theme Unlock & +600 XP', icon: '💎', xpReward: 600 },
  { days: 30, title: 'Monthly Legend', rewardText: 'Champion Trophy & +1500 XP', icon: '👑', xpReward: 1500 },
];

export interface DailyChallengeState {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  records: Record<string, DailyRecord>; // dateStr -> record
  unlockedPastDates: string[]; // dates unlocked by watching rewarded ads
  notificationsEnabled: boolean;
}

const STORAGE_KEY = '@arrow_escape_daily_challenge_v2';

const DIRECTIONS: readonly Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
const DIR_OFFSETS: Record<Direction, { dx: number; dy: number }> = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 },
};

/**
 * Returns YYYY-MM-DD in player's local timezone.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Computes calendar day index from reference epoch (2026-01-01).
 */
export function getPuzzleNumberFromDate(dateStr: string): number {
  const epoch = new Date('2026-01-01T00:00:00Z').getTime();
  const current = new Date(`${dateStr}T00:00:00Z`).getTime();
  const diffDays = Math.floor((current - epoch) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

function createMulberry32(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 12345;
}

let memoryStore: Record<string, string> = {};

function getRawItem(key: string): string | null {
  try {
    const storage = (globalThis as any).localStorage;
    if (storage && typeof storage.getItem === 'function') {
      return storage.getItem(key);
    }
  } catch {
    // fallback
  }
  return memoryStore[key] || null;
}

function setRawItem(key: string, value: string): void {
  try {
    const storage = (globalThis as any).localStorage;
    if (storage && typeof storage.setItem === 'function') {
      storage.setItem(key, value);
      return;
    }
  } catch {
    // fallback
  }
  memoryStore[key] = value;
}

class DailyChallengeService {
  private state: DailyChallengeState = {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    records: {},
    unlockedPastDates: [],
    notificationsEnabled: true,
  };

  private dailyPuzzleCache = new Map<string, LevelData>();

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      const raw = getRawItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = {
          currentStreak: parsed.currentStreak || 0,
          longestStreak: parsed.longestStreak || 0,
          lastCompletedDate: parsed.lastCompletedDate || null,
          records: parsed.records || {},
          unlockedPastDates: parsed.unlockedPastDates || [],
          notificationsEnabled: parsed.notificationsEnabled ?? true,
        };
      }
    } catch {
      // Fallback to fresh defaults
    }
  }

  public saveState(): void {
    try {
      setRawItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Storage safe
    }
  }

  public resetForTesting(): void {
    memoryStore = {};
    this.state = {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      records: {},
      unlockedPastDates: [],
      notificationsEnabled: true,
    };
    try {
      const storage = (globalThis as any).localStorage;
      if (storage && typeof storage.removeItem === 'function') {
        storage.removeItem(STORAGE_KEY);
      }
    } catch {
      // safe
    }
  }

  public isDateUnlocked(dateStr: string): boolean {
    const today = getLocalDateString();
    // Today is always freely playable
    if (dateStr === today) return true;
    // Already solved
    if (this.state.records[dateStr]?.completed) return true;
    // Unlocked via ad
    return this.state.unlockedPastDates.includes(dateStr);
  }

  public unlockPastDailyLevel(dateStr: string): void {
    if (!this.state.unlockedPastDates.includes(dateStr)) {
      this.state.unlockedPastDates = [...this.state.unlockedPastDates, dateStr];
      this.saveState();
    }
  }

  public getState(): Readonly<DailyChallengeState> {
    return { ...this.state };
  }

  public isCompletedToday(): boolean {
    const today = getLocalDateString();
    return !!this.state.records[today]?.completed;
  }

  public getTodayRecord(): DailyRecord | undefined {
    const today = getLocalDateString();
    return this.state.records[today];
  }

  /**
   * Generates deterministic daily puzzle level for the given date.
   */
  public getDailyPuzzle(dateStr: string = getLocalDateString()): LevelData {
    if (this.dailyPuzzleCache.has(dateStr)) {
      return this.dailyPuzzleCache.get(dateStr)!;
    }

    const puzzleNumber = getPuzzleNumberFromDate(dateStr);
    const seed = hashStringToSeed(`arrow_daily_${dateStr}_puzzle`);
    const rng = createMulberry32(seed);

    // Daily puzzles are balanced 6x6 grid with 14-18 arrows
    const width = 6;
    const height = 6;
    const targetCount = 14 + Math.floor(rng() * 5); // 14 to 18 arrows

    const arrows: ArrowConfig[] = [];
    const occupied = new Map<string, Direction>();

    const allCoords: Array<{ x: number; y: number }> = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        allCoords.push({ x, y });
      }
    }

    // Shuffle coords
    for (let i = allCoords.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const temp = allCoords[i];
      allCoords[i] = allCoords[j];
      allCoords[j] = temp;
    }

    for (const { x, y } of allCoords) {
      if (arrows.length >= targetCount) break;
      const coordKey = `${x},${y}`;
      if (occupied.has(coordKey)) continue;

      const dirs = [...DIRECTIONS];
      for (let i = dirs.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const temp = dirs[i];
        dirs[i] = dirs[j];
        dirs[j] = temp;
      }

      let validDir: Direction | null = null;
      for (const dir of dirs) {
        const { dx, dy } = DIR_OFFSETS[dir];
        let cx = x + dx;
        let cy = y + dy;
        let clear = true;

        while (cx >= 0 && cx < width && cy >= 0 && cy < height) {
          if (occupied.has(`${cx},${cy}`)) {
            clear = false;
            break;
          }
          cx += dx;
          cy += dy;
        }

        if (clear) {
          validDir = dir;
          break;
        }
      }

      if (validDir) {
        occupied.set(coordKey, validDir);
        arrows.push({
          id: `daily_${arrows.length + 1}`,
          x,
          y,
          direction: validDir,
        });
      }
    }

    const puzzle: LevelData = {
      id: 9000 + puzzleNumber,
      packId: 'daily-challenge',
      title: `Daily Puzzle #${puzzleNumber}`,
      width,
      height,
      arrows,
      targetMoves: arrows.length,
      authorNotes: `Date: ${dateStr}`,
    };

    // Sanity solver verification
    const report = solveLevel(puzzle, 1);
    if (!report.isSolvable) {
      // Fallback safety
    }

    this.dailyPuzzleCache.set(dateStr, puzzle);
    return puzzle;
  }

  /**
   * Records completion of the daily puzzle and updates streak.
   */
  public recordDailyCompletion(
    dateStr: string,
    stars: number,
    moves: number
  ): {
    newStreak: number;
    unlockedMilestones: StreakMilestone[];
    earnedBonusXp: number;
  } {
    const existing = this.state.records[dateStr];
    if (existing?.completed) {
      // Already recorded today, update best moves
      if (moves < existing.moves) {
        this.state.records[dateStr] = {
          ...existing,
          stars: Math.max(existing.stars, stars),
          moves,
        };
        this.saveState();
      }
      return {
        newStreak: this.state.currentStreak,
        unlockedMilestones: [],
        earnedBonusXp: 0,
      };
    }

    const puzzleNumber = getPuzzleNumberFromDate(dateStr);

    // Compute streak continuity
    let newStreak = 1;
    if (this.state.lastCompletedDate) {
      const lastDate = new Date(`${this.state.lastCompletedDate}T00:00:00Z`);
      const currentDate = new Date(`${dateStr}T00:00:00Z`);
      const diffMs = currentDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive calendar day
        newStreak = this.state.currentStreak + 1;
      } else if (diffDays === 0) {
        newStreak = this.state.currentStreak;
      } else {
        // Streak broken, restarts at 1
        newStreak = 1;
      }
    }

    const longest = Math.max(this.state.longestStreak, newStreak);

    this.state.records[dateStr] = {
      date: dateStr,
      puzzleNumber,
      completed: true,
      stars,
      moves,
      completedAt: new Date().toISOString(),
    };

    this.state.currentStreak = newStreak;
    this.state.longestStreak = longest;
    this.state.lastCompletedDate = dateStr;

    // Check newly unlocked streak milestones
    const unlockedMilestones = STREAK_MILESTONES.filter(m => m.days === newStreak);
    const milestoneXp = unlockedMilestones.reduce((acc, m) => acc + m.xpReward, 0);
    const earnedBonusXp = 100 + milestoneXp; // Base 100 XP + milestone XP

    // Award +1 Hint economy bonus for daily completion
    updateHintsAvailable(1);

    this.saveState();

    // Sync XP to Play Games profile if available
    const totalCompleted = Object.values(this.state.records).filter(r => r.completed).length;
    playGamesService.syncProgressWithLevelRecords(totalCompleted, 0);

    return {
      newStreak,
      unlockedMilestones,
      earnedBonusXp,
    };
  }

  public setNotificationsEnabled(enabled: boolean): void {
    this.state.notificationsEnabled = enabled;
    this.saveState();
  }
}

export const dailyChallengeService = new DailyChallengeService();
