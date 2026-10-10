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
      expect(report.minMoves).toBeLessThanOrEqual(level.arrows.length);
      expect(report.minMoves).toBeGreaterThan(0);
    }
  });

  it('provides verified tutorial levels for milestone mechanics', () => {
    const milestones = [
      { id: 31, type: 'LOCKED', title: 'Tutorial: Locked Arrow' },
      { id: 61, type: 'KEY', title: 'Tutorial: Key & Lock' },
      { id: 101, type: 'ROTATING', title: 'Tutorial: Rotating Arrow' },
      { id: 161, type: 'BOMB', title: 'Tutorial: Bomb Arrow' },
    ];

    for (const m of milestones) {
      const level = getLevelById(m.id);
      expect(level).toBeDefined();
      expect(level?.title).toBe(m.title);
      expect(level?.arrows.some(a => a.type === m.type)).toBe(true);

      if (level) {
        const report = solveLevel(level, 1);
        expect(report.isSolvable).toBe(true);
      }
    }
  });

  it('returns undefined for invalid level IDs', () => {
    expect(getLevelById(0)).toBeUndefined();
    expect(getLevelById(501)).toBeUndefined();
    expect(getLevelById(-5)).toBeUndefined();
  });
});
