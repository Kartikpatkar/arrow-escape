import {
  validatePuzzleFairness,
  generateQuickEscapePuzzle,
  getPerfectClearMoveBudget,
} from '../../src/services/modes/gameModesService';
import {
  loadUserProgress,
  recordPerfectClear,
  recordQuickEscapeWin,
  resetAllProgress,
} from '../../src/services/storage/progressStorage';
import { LevelData } from '../../src/engine/types';

describe('Game Modes & Replay Engine (Feature #6)', () => {
  beforeEach(async () => {
    await resetAllProgress();
  });

  describe('Fairness Engine: Solvable vs Fun & Fair', () => {
    it('identifies an easy open puzzle as solvable and fun/fair', () => {
      const openLevel: LevelData = {
        id: 9001,
        packId: 'test',
        title: 'Open Test',
        width: 4,
        height: 4,
        arrows: [
          { id: 'a1', x: 0, y: 0, direction: 'UP' },
          { id: 'a2', x: 1, y: 0, direction: 'RIGHT' },
          { id: 'a3', x: 2, y: 2, direction: 'DOWN' },
          { id: 'a4', x: 0, y: 3, direction: 'LEFT' },
        ],
        targetMoves: 4,
      };

      const report = validatePuzzleFairness(openLevel);
      expect(report.isSolvable).toBe(true);
      expect(report.initialValidMovesCount).toBeGreaterThanOrEqual(1);
      expect(report.fairnessScore).toBeGreaterThanOrEqual(70);
      expect(report.isFunAndFair).toBe(true);
    });

    it('rejects an unsolvable head-to-head deadlock puzzle', () => {
      const deadlockLevel: LevelData = {
        id: 9002,
        packId: 'test',
        title: 'Deadlock Test',
        width: 4,
        height: 4,
        arrows: [
          { id: 'a1', x: 1, y: 1, direction: 'RIGHT' },
          { id: 'a2', x: 2, y: 1, direction: 'LEFT' },
        ],
        targetMoves: 2,
      };

      const report = validatePuzzleFairness(deadlockLevel);
      expect(report.isSolvable).toBe(false);
      expect(report.isFunAndFair).toBe(false);
      expect(report.fairnessScore).toBe(0);
      expect(report.evaluationNotes[0]).toContain('unsolvable');
    });

    it('correctly calculates the Perfect Clear move budget from solver path', () => {
      const level: LevelData = {
        id: 9003,
        packId: 'test',
        title: 'Budget Test',
        width: 4,
        height: 4,
        arrows: [
          { id: 'a1', x: 0, y: 0, direction: 'UP' },
          { id: 'a2', x: 1, y: 1, direction: 'DOWN' },
        ],
        targetMoves: 2,
      };

      const budget = getPerfectClearMoveBudget(level);
      expect(budget).toBe(2);
    });
  });

  describe('Mode B: Quick Escape Puzzle Generation', () => {
    it('generates a valid QUICK puzzle with 4x5 dimensions and verified fairness', () => {
      const { level, fairness } = generateQuickEscapePuzzle('QUICK', 42);
      expect(level.width).toBe(4);
      expect(level.height).toBe(5);
      expect(level.arrows.length).toBeGreaterThan(0);
      expect(fairness.isSolvable).toBe(true);
      expect(fairness.initialValidMovesCount).toBeGreaterThanOrEqual(1);
    });

    it('generates a valid NORMAL puzzle with 5x5 dimensions and verified fairness', () => {
      const { level, fairness } = generateQuickEscapePuzzle('NORMAL', 101);
      expect(level.width).toBe(5);
      expect(level.height).toBe(5);
      expect(fairness.isSolvable).toBe(true);
    });

    it('generates an EXPERT puzzle with 6x6 grid dimensions', () => {
      const { level, fairness } = generateQuickEscapePuzzle('EXPERT', 777);
      expect(level.width).toBe(6);
      expect(level.height).toBe(6);
      expect(fairness.isSolvable).toBe(true);
    });
  });

  describe('Storage & Records: Practice and Perfect Clear Badges', () => {
    it('persists Perfect Clear badges without corrupting career level records', async () => {
      const progressBefore = await loadUserProgress();
      expect(progressBefore.perfectClearsCount).toBe(0);

      const updated = await recordPerfectClear(15);
      expect(updated.perfectClearsCount).toBe(1);
      expect(updated.perfectClearBadges).toContain(15);

      // Re-recording same level doesn't duplicate
      const dup = await recordPerfectClear(15);
      expect(dup.perfectClearsCount).toBe(1);

      // Record another level
      const second = await recordPerfectClear(20);
      expect(second.perfectClearsCount).toBe(2);
      expect(second.perfectClearBadges).toEqual([15, 20]);
    });

    it('tracks Quick Escape consecutive wins', async () => {
      await recordQuickEscapeWin();
      await recordQuickEscapeWin();
      const progress = await loadUserProgress();
      expect(progress.quickEscapeWins).toBe(2);
    });
  });
});
