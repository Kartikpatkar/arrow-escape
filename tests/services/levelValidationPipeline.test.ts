import {
  validateSingleLevel,
  validateLevelPipeline,
} from '../../src/services/validation/levelValidationPipeline';
import { getLevelById } from '../../src/data/levels';

describe('A. Level Quality Validation Pipeline', () => {
  describe('Curated Core Levels (1 to 30)', () => {
    it('validates all 30 hand-crafted core levels are 100% solvable without coordinate collisions', () => {
      const { metrics, summary } = validateLevelPipeline(1, 30);

      expect(summary.totalLevelsChecked).toBe(30);
      expect(summary.curatedCount).toBe(30);
      expect(summary.brokenLevelIds).toEqual([]);
      expect(summary.allSolvable).toBe(true);

      metrics.forEach(m => {
        expect(m.isSolvable).toBe(true);
        expect(m.hasValidDirections).toBe(true);
        expect(m.hasValidCoordinates).toBe(true);
        expect(m.hasUniqueCoordinates).toBe(true);
        expect(m.hasUniqueIds).toBe(true);
        expect(m.initialValidMoves).toBeGreaterThanOrEqual(1);
        expect(m.errors).toHaveLength(0);
      });
    });

    it('samples procedural levels (31 to 80, World 2) and validates mathematical solvability and bounds', () => {
      const { metrics, summary } = validateLevelPipeline(31, 80);

      expect(summary.totalLevelsChecked).toBe(50);
      expect(summary.allSolvable).toBe(true);
      expect(summary.brokenLevelIds).toEqual([]);

      metrics.forEach(m => {
        expect(m.isSolvable).toBe(true);
        expect(m.hasValidDirections).toBe(true);
        expect(m.hasValidCoordinates).toBe(true);
        expect(m.hasUniqueCoordinates).toBe(true);
        expect(m.hasUniqueIds).toBe(true);
        expect(m.initialValidMoves).toBeGreaterThanOrEqual(1);
      });
    });

    it('collects progression statistics: solution lengths, density, and arrow count ranges', () => {
      const { summary } = validateLevelPipeline(1, 100);

      expect(summary.minSolutionLength).toBeGreaterThanOrEqual(2);
      expect(summary.maxSolutionLength).toBeLessThanOrEqual(50);
      expect(summary.avgSolutionLength).toBeGreaterThan(0);
      expect(summary.minArrowCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Edge cases and error detection', () => {
    it('flags an invalid level with out-of-bound arrow coordinates', () => {
      const badLevel = {
        id: 9991,
        packId: 'test',
        title: 'Bad Coord',
        width: 4,
        height: 4,
        arrows: [{ id: 'bad', x: 5, y: 0, direction: 'UP' as const }],
        targetMoves: 1,
      };

      const result = validateSingleLevel(badLevel);
      expect(result.hasValidCoordinates).toBe(false);
      expect(result.errors.some(e => e.includes('out of bounds'))).toBe(true);
    });

    it('flags an invalid level with duplicate coordinates', () => {
      const collisionLevel = {
        id: 9992,
        packId: 'test',
        title: 'Collision',
        width: 4,
        height: 4,
        arrows: [
          { id: 'a1', x: 1, y: 1, direction: 'UP' as const },
          { id: 'a2', x: 1, y: 1, direction: 'DOWN' as const },
        ],
        targetMoves: 2,
      };

      const result = validateSingleLevel(collisionLevel);
      expect(result.hasUniqueCoordinates).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate coordinate'))).toBe(true);
    });
  });
});
