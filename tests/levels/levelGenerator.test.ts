import { generateLevel } from '../../src/data/levels/levelGenerator';
import { getLevelById, TOTAL_LEVELS } from '../../src/data/levels';
import { solveLevel } from '../../src/engine/solver';

describe('Procedural Level Generator (Levels 31 to 500)', () => {
  it('total levels is 500', () => {
    expect(TOTAL_LEVELS).toBe(500);
  });

  it('generates deterministic levels for given ID', () => {
    const lvlA = generateLevel(50);
    const lvlB = generateLevel(50);

    expect(lvlA.arrows.length).toBe(lvlB.arrows.length);
    expect(lvlA.arrows[0]).toEqual(lvlB.arrows[0]);
  });

  it('guarantees sample procedural levels are 100% solvable', () => {
    const sampleIds = [31, 50, 100, 250, 500];

    for (const id of sampleIds) {
      const level = getLevelById(id);
      expect(level).toBeDefined();
      if (!level) continue;

      const report = solveLevel(level, 1);
      expect(report.isSolvable).toBe(true);
      expect(report.minMoves).toBe(level.arrows.length);
    }
  });

  it('returns undefined for invalid level IDs', () => {
    expect(getLevelById(0)).toBeUndefined();
    expect(getLevelById(501)).toBeUndefined();
    expect(getLevelById(-5)).toBeUndefined();
  });
});
