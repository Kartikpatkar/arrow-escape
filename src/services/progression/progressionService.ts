/**
 * Arrow Escape — Player Progression & XP Engine
 * Deterministic rank calculation, world milestone bonuses, and player stats aggregator.
 */

import { WORLDS, calculateWorldProgress } from '../../data/worlds/worldData';
import { UserProgressData } from '../storage/progressStorage';
import { DailyChallengeState } from '../daily/dailyChallengeService';

export interface PlayerRank {
  readonly id: string;
  readonly title: string;
  readonly minXp: number;
  readonly icon: string;
  readonly badgeColor: string;
  readonly description: string;
}

export const PLAYER_RANKS: readonly PlayerRank[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    minXp: 0,
    icon: '🌱',
    badgeColor: '#94A3B8',
    description: 'Start the spatial puzzle journey',
  },
  {
    id: 'novice',
    title: 'Novice',
    minXp: 500,
    icon: '🎯',
    badgeColor: '#60A5FA',
    description: 'Mastering the first steps',
  },
  {
    id: 'explorer',
    title: 'Explorer',
    minXp: 2500,
    icon: '🧭',
    badgeColor: '#34D399',
    description: 'Completed 25+ spatial puzzles',
  },
  {
    id: 'apprentice',
    title: 'Apprentice',
    minXp: 5000,
    icon: '⚡',
    badgeColor: '#A78BFA',
    description: 'Overcoming intricate mazes',
  },
  {
    id: 'strategist',
    title: 'Strategist',
    minXp: 7500,
    icon: '🧠',
    badgeColor: '#FBBF24',
    description: 'Completed 75+ puzzles with high precision',
  },
  {
    id: 'tactician',
    title: 'Tactician',
    minXp: 12000,
    icon: '⚔️',
    badgeColor: '#F472B6',
    description: 'Conquering keys, rotators, and bombs',
  },
  {
    id: 'puzzle_master',
    title: 'Puzzle Master',
    minXp: 20000,
    icon: '🔮',
    badgeColor: '#818CF8',
    description: 'Completed 200+ advanced challenges',
  },
  {
    id: 'grandmaster',
    title: 'Grandmaster',
    minXp: 35000,
    icon: '💎',
    badgeColor: '#38BDF8',
    description: 'Dominating chaos grids and complex boards',
  },
  {
    id: 'arrow_legend',
    title: 'Arrow Legend',
    minXp: 50000,
    icon: '👑',
    badgeColor: '#F59E0B',
    description: 'Mastered all 500 levels of Arrow Escape',
  },
];

export interface PlayerStatsSummary {
  readonly totalXp: number;
  readonly currentRank: PlayerRank;
  readonly nextRank: PlayerRank | null;
  readonly xpInRank: number;
  readonly xpRequiredForNext: number;
  readonly rankProgressPercent: number;

  readonly levelsCompleted: number;
  readonly totalLevels: number;
  readonly totalStars: number;
  readonly maxStars: number;
  readonly perfectClears: number; // 3-star clears

  readonly totalMovesMade: number;
  readonly totalArrowsEscaped: number;
  readonly averageMovesPerLevel: number;

  readonly dailyCompletedCount: number;
  readonly currentStreak: number;
  readonly longestStreak: number;

  readonly totalPlayTimeSeconds: number;
  readonly worldsCompletedCount: number;
  readonly worldsMasteredCount: number;
}

/**
 * Calculates total player XP deterministically.
 * Prevents farming by deriving strictly from highest recorded achievements.
 */
export function calculatePlayerXp(
  progress: UserProgressData,
  dailyState?: DailyChallengeState
): number {
  let xp = 0;

  // 1. Level Completion XP:
  // 1-star = 50 XP, 2-stars = 75 XP, 3-stars = 100 XP
  Object.values(progress.levelRecords).forEach(rec => {
    if (rec.stars === 1) xp += 50;
    else if (rec.stars === 2) xp += 75;
    else if (rec.stars >= 3) xp += 100;
  });

  // 2. World Milestones:
  // Completing a world = +250 XP; 3-starring an entire world = +500 XP
  WORLDS.forEach(world => {
    const wProg = calculateWorldProgress(world, progress.unlockedLevel, progress.levelRecords);
    if (wProg.isCompleted) xp += 250;
    if (wProg.isMastered) xp += 500;
  });

  // 3. Daily Challenges:
  // 100 XP per completed daily challenge
  if (dailyState && dailyState.records) {
    Object.values(dailyState.records).forEach(rec => {
      if (rec.completed) {
        xp += 100;
      }
    });

    // Daily streak bonuses
    if (dailyState.currentStreak >= 1) xp += 50;
    if (dailyState.currentStreak >= 3) xp += 150;
    if (dailyState.currentStreak >= 7) xp += 300;
    if (dailyState.currentStreak >= 14) xp += 600;
    if (dailyState.currentStreak >= 30) xp += 1500;
  }

  return xp;
}

/**
 * Finds current rank and progress to next rank based on total XP.
 */
export function getPlayerRank(totalXp: number): {
  currentRank: PlayerRank;
  nextRank: PlayerRank | null;
  xpInRank: number;
  xpRequiredForNext: number;
  rankProgressPercent: number;
} {
  let currentRank = PLAYER_RANKS[0];
  let nextRank: PlayerRank | null = PLAYER_RANKS[1];

  for (let i = 0; i < PLAYER_RANKS.length; i++) {
    if (totalXp >= PLAYER_RANKS[i].minXp) {
      currentRank = PLAYER_RANKS[i];
      nextRank = i + 1 < PLAYER_RANKS.length ? PLAYER_RANKS[i + 1] : null;
    } else {
      break;
    }
  }

  let xpInRank = totalXp - currentRank.minXp;
  let xpRequiredForNext = nextRank ? nextRank.minXp - currentRank.minXp : 0;
  let rankProgressPercent = nextRank
    ? Math.min(100, Math.floor((xpInRank / xpRequiredForNext) * 100))
    : 100;

  return {
    currentRank,
    nextRank,
    xpInRank,
    xpRequiredForNext,
    rankProgressPercent,
  };
}

/**
 * Computes exhaustive statistics summary for display in the dashboard.
 */
export function getPlayerStatsSummary(
  progress: UserProgressData,
  dailyState?: DailyChallengeState
): PlayerStatsSummary {
  const totalXp = calculatePlayerXp(progress, dailyState);
  const rankInfo = getPlayerRank(totalXp);

  const completedLevelIds = Object.keys(progress.levelRecords).map(Number);
  const levelsCompleted = completedLevelIds.length;
  const totalLevels = 500;

  let totalStars = 0;
  let perfectClears = 0;
  let sumBestMoves = 0;

  Object.values(progress.levelRecords).forEach(rec => {
    totalStars += rec.stars;
    if (rec.stars === 3) perfectClears++;
    sumBestMoves += rec.bestMoves;
  });

  const averageMovesPerLevel =
    levelsCompleted > 0 ? Number((sumBestMoves / levelsCompleted).toFixed(1)) : 0;

  // Worlds stats
  let worldsCompletedCount = 0;
  let worldsMasteredCount = 0;
  WORLDS.forEach(w => {
    const wp = calculateWorldProgress(w, progress.unlockedLevel, progress.levelRecords);
    if (wp.isCompleted) worldsCompletedCount++;
    if (wp.isMastered) worldsMasteredCount++;
  });

  // Daily challenge stats
  const dailyCompletedCount = dailyState?.records
    ? Object.values(dailyState.records).filter(r => r.completed).length
    : 0;
  const currentStreak = dailyState?.currentStreak || 0;
  const longestStreak = dailyState?.longestStreak || 0;

  return {
    totalXp,
    currentRank: rankInfo.currentRank,
    nextRank: rankInfo.nextRank,
    xpInRank: rankInfo.xpInRank,
    xpRequiredForNext: rankInfo.xpRequiredForNext,
    rankProgressPercent: rankInfo.rankProgressPercent,

    levelsCompleted,
    totalLevels,
    totalStars,
    maxStars: totalLevels * 3,
    perfectClears,

    totalMovesMade: Math.max(progress.totalMovesMade || 0, sumBestMoves),
    totalArrowsEscaped: Math.max(progress.totalArrowsEscaped || 0, sumBestMoves),
    averageMovesPerLevel,

    dailyCompletedCount,
    currentStreak,
    longestStreak,

    totalPlayTimeSeconds: progress.totalPlayTimeSeconds || 0,
    worldsCompletedCount,
    worldsMasteredCount,
  };
}
