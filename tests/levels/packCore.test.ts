import { CORE_LEVELS, getLevelById, getTotalCoreLevels } from '../../src/data/levels';
import { solveLevel } from '../../src/engine/solver';

describe('Core Level Pack (30 Levels)', () => {
  it('contains exactly 30 curated levels', () => {
    expect(getTotalCoreLevels()).toBe(30);
    expect(CORE_LEVELS.length).toBe(30);
  });

  it('retrieves levels by ID', () => {
    const level1 = getLevelById(1);
    expect(level1).toBeDefined();
    expect(level1?.title).toBe('First Escape');

    const level30 = getLevelById(30);
    expect(level30).toBeDefined();
    expect(level30?.title).toBe('Grand Master Escape');

    expect(getLevelById(999)).toBeUndefined();
  });

  it('ensures every single core level is 100% solvable', () => {
    for (const level of CORE_LEVELS) {
      const report = solveLevel(level, 3);
      expect(report.isSolvable).toBe(true);
      expect(report.totalSolutions).toBeGreaterThan(0);
      expect(report.minMoves).toBe(level.arrows.length);
    }
  });
});
