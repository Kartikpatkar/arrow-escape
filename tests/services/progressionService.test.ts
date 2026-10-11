import {
  WORLDS,
  getWorldForLevel,
  calculateWorldProgress,
} from '../../src/data/worlds/worldData';
import {
  calculatePlayerXp,
  getPlayerRank,
  getPlayerStatsSummary,
  PLAYER_RANKS,
} from '../../src/services/progression/progressionService';
import { UserProgressData } from '../../src/services/storage/progressStorage';

describe('Themed Worlds (Level Packs)', () => {
  it('defines 6 progressive worlds spanning levels 1 to 500', () => {
    expect(WORLDS.length).toBe(6);
    expect(WORLDS[0].startLevel).toBe(1);
    expect(WORLDS[WORLDS.length - 1].endLevel).toBe(500);

    // Verify contiguous level intervals without gaps
    for (let i = 0; i < WORLDS.length - 1; i++) {
      expect(WORLDS[i + 1].startLevel).toBe(WORLDS[i].endLevel + 1);
    }

    const totalWorldLevels = WORLDS.reduce((sum, w) => sum + w.totalLevels, 0);
    expect(totalWorldLevels).toBe(500);
  });

  it('correctly maps levels to their respective World', () => {
    expect(getWorldForLevel(1).name).toBe('First Escape');
    expect(getWorldForLevel(30).name).toBe('First Escape');
    expect(getWorldForLevel(31).name).toBe('Color Junction');
    expect(getWorldForLevel(80).name).toBe('Color Junction');
    expect(getWorldForLevel(81).name).toBe('Tight Corners');
    expect(getWorldForLevel(151).name).toBe('Mind Maze');
    expect(getWorldForLevel(251).name).toBe('Chaos Grid');
    expect(getWorldForLevel(351).name).toBe('Master Escape');
    expect(getWorldForLevel(500).name).toBe('Master Escape');
  });

  it('calculates world completion percentage and star targets', () => {
    const world1 = WORLDS[0]; // 30 levels
    const records: Record<number, { stars: number; bestMoves: number; completedAt: number }> = {};

    // Complete 15 levels with 3 stars
    for (let i = 1; i <= 15; i++) {
      records[i] = { stars: 3, bestMoves: 5, completedAt: Date.now() };
    }

    const progress = calculateWorldProgress(world1, 16, records);
    expect(progress.completedCount).toBe(15);
    expect(progress.percentComplete).toBe(50);
    expect(progress.starsEarned).toBe(45);
    expect(progress.maxStars).toBe(90);
    expect(progress.isCompleted).toBe(false);
    expect(progress.isMastered).toBe(false);
  });
});

describe('Player Progression & XP Engine', () => {
  const mockProgress: UserProgressData = {
    unlockedLevel: 26,
    levelRecords: {},
    hintsAvailable: 5,
    selectedTheme: 'dawn',
    soundEnabled: true,
    hapticsEnabled: true,
    adsRemoved: false,
    totalMovesMade: 120,
    totalArrowsEscaped: 110,
    totalPlayTimeSeconds: 600,
  };

  it('calculates XP based on stars earned without farming exploits', () => {
    // 25 levels with 3 stars: 25 * 100 = 2500 XP
    for (let i = 1; i <= 25; i++) {
      mockProgress.levelRecords[i] = { stars: 3, bestMoves: 4, completedAt: Date.now() };
    }

    const xp = calculatePlayerXp(mockProgress);
    expect(xp).toBe(2500);

    // Re-evaluating gives identical XP (no farming)
    const xpAgain = calculatePlayerXp(mockProgress);
    expect(xpAgain).toBe(2500);
  });

  it('correctly maps XP to player ranks and calculates rank progress', () => {
    // 0 XP -> Beginner
    const r0 = getPlayerRank(0);
    expect(r0.currentRank.id).toBe('beginner');
    expect(r0.nextRank?.id).toBe('novice');

    // 2500 XP -> Explorer
    const r2500 = getPlayerRank(2500);
    expect(r2500.currentRank.id).toBe('explorer');
    expect(r2500.currentRank.title).toBe('Explorer');
    expect(r2500.nextRank?.id).toBe('apprentice');
    expect(r2500.rankProgressPercent).toBe(0); // At exact start of Explorer

    // 3750 XP -> Midway through Explorer (2500..5000 is 2500 range, 1250 in rank = 50%)
    const r3750 = getPlayerRank(3750);
    expect(r3750.currentRank.id).toBe('explorer');
    expect(r3750.rankProgressPercent).toBe(50);

    // 55000 XP -> Arrow Legend (max rank)
    const rMax = getPlayerRank(55000);
    expect(rMax.currentRank.id).toBe('arrow_legend');
    expect(rMax.nextRank).toBeNull();
    expect(rMax.rankProgressPercent).toBe(100);
  });

  it('awards bonus XP for completing and mastering worlds', () => {
    const worldCompleteProgress: UserProgressData = {
      ...mockProgress,
      unlockedLevel: 31,
      levelRecords: {},
    };

    // Complete all 30 levels of World 1 with 3 stars
    for (let i = 1; i <= 30; i++) {
      worldCompleteProgress.levelRecords[i] = { stars: 3, bestMoves: 4, completedAt: Date.now() };
    }

    // 30 * 100 XP (levels) + 250 XP (world completed) + 500 XP (world mastered) = 3750 XP
    const xp = calculatePlayerXp(worldCompleteProgress);
    expect(xp).toBe(3750);
  });

  it('aggregates exhaustive player statistics summary', () => {
    const summary = getPlayerStatsSummary(mockProgress);
    expect(summary.levelsCompleted).toBe(25);
    expect(summary.totalLevels).toBe(500);
    expect(summary.totalStars).toBe(75);
    expect(summary.perfectClears).toBe(25);
    expect(summary.currentRank.title).toBe('Explorer');
    expect(summary.averageMovesPerLevel).toBe(4);
  });
});
