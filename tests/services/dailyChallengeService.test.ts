import {
  dailyChallengeService,
  getLocalDateString,
  getPuzzleNumberFromDate,
} from '../../src/services/daily/dailyChallengeService';
import { solveLevel } from '../../src/engine/solver';

describe('Daily Puzzle Challenge Service', () => {
  beforeEach(() => {
    dailyChallengeService.resetForTesting();
  });

  it('generates consistent date strings and puzzle numbers', () => {
    const dateStr = '2026-10-11';
    const num = getPuzzleNumberFromDate(dateStr);
    expect(num).toBeGreaterThan(0);

    const todayStr = getLocalDateString();
    expect(todayStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('generates deterministic daily puzzles that are 100% solvable', () => {
    const testDate = '2026-10-15';
    const puzzleA = dailyChallengeService.getDailyPuzzle(testDate);
    const puzzleB = dailyChallengeService.getDailyPuzzle(testDate);

    expect(puzzleA.arrows.length).toBe(puzzleB.arrows.length);
    expect(puzzleA.arrows[0]).toEqual(puzzleB.arrows[0]);

    const report = solveLevel(puzzleA, 1);
    expect(report.isSolvable).toBe(true);
    expect(report.minMoves).toBe(puzzleA.arrows.length);
  });

  it('increments streak on consecutive calendar day completion', () => {
    // Complete Day 1
    const res1 = dailyChallengeService.recordDailyCompletion('2026-10-10', 3, 14);
    expect(res1.newStreak).toBe(1);
    expect(res1.earnedBonusXp).toBeGreaterThanOrEqual(100);

    // Complete Day 2 (consecutive)
    const res2 = dailyChallengeService.recordDailyCompletion('2026-10-11', 3, 12);
    expect(res2.newStreak).toBe(2);

    // Complete Day 3 (consecutive)
    const res3 = dailyChallengeService.recordDailyCompletion('2026-10-12', 3, 10);
    expect(res3.newStreak).toBe(3);
    // Unlocks 3-day milestone (+150 XP)
    expect(res3.unlockedMilestones.length).toBe(1);
    expect(res3.unlockedMilestones[0].days).toBe(3);
  });

  it('resets streak to 1 after missing a day', () => {
    // Complete Day 1
    dailyChallengeService.recordDailyCompletion('2026-10-01', 3, 15);
    expect(dailyChallengeService.getState().currentStreak).toBe(1);

    // Skip to Day 4 (missed 2 days)
    const res = dailyChallengeService.recordDailyCompletion('2026-10-04', 3, 16);
    expect(res.newStreak).toBe(1);
  });

  it('correctly tracks and unlocks missed past daily levels via rewarded ad', () => {
    const pastDate = '2026-10-01';

    // Initially past date is locked if not solved
    expect(dailyChallengeService.isDateUnlocked(pastDate)).toBe(false);

    // Watch rewarded ad to unlock past level
    dailyChallengeService.unlockPastDailyLevel(pastDate);

    // Now unlocked
    expect(dailyChallengeService.isDateUnlocked(pastDate)).toBe(true);
    expect(dailyChallengeService.getState().unlockedPastDates).toContain(pastDate);

    // Today is always freely unlocked without ad
    const today = getLocalDateString();
    expect(dailyChallengeService.isDateUnlocked(today)).toBe(true);
  });
});
