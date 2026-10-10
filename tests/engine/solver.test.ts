import { solveLevel } from '../../src/engine/solver';
import { LevelData } from '../../src/engine/types';

describe('Puzzle Solver', () => {
  it('solves simple sequential puzzle', () => {
    const level: LevelData = {
      id: 1,
      packId: 'test',
      title: 'Solver Simple',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 1, y: 0, direction: 'UP' },
        { id: 'a2', x: 1, y: 1, direction: 'UP' },
      ],
    };

    const report = solveLevel(level);

    expect(report.isSolvable).toBe(true);
    expect(report.totalSolutions).toBeGreaterThanOrEqual(1);
    expect(report.firstSolution).toEqual(['a1', 'a2']);
    expect(report.minMoves).toBe(2);
    expect(report.difficultyScore).toBeGreaterThan(0);
  });

  it('detects unsolvable cyclic dependency', () => {
    const cyclicLevel: LevelData = {
      id: 99,
      packId: 'test',
      title: 'Cycle Trap',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 1, y: 0, direction: 'RIGHT' },
        { id: 'a2', x: 2, y: 0, direction: 'DOWN' },
        { id: 'a3', x: 2, y: 1, direction: 'LEFT' },
        { id: 'a4', x: 1, y: 1, direction: 'UP' },
      ],
    };

    const report = solveLevel(cyclicLevel);
    expect(report.isSolvable).toBe(false);
    expect(report.totalSolutions).toBe(0);
    expect(report.firstSolution).toEqual([]);
    expect(report.deadEndsCount).toBeGreaterThan(0);
  });

  it('respects maxSolutionsToFind parameter', () => {
    const multiLevel: LevelData = {
      id: 100,
      packId: 'test',
      title: 'Multiple Solutions',
      width: 4,
      height: 4,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'UP' },
        { id: 'a2', x: 3, y: 0, direction: 'UP' },
        { id: 'a3', x: 0, y: 3, direction: 'DOWN' },
        { id: 'a4', x: 3, y: 3, direction: 'DOWN' },
      ],
    };

    const report = solveLevel(multiLevel, 2);
    expect(report.totalSolutions).toBe(2);
  });

  it('handles empty board gracefully', () => {
    const emptyLevel: LevelData = {
      id: 0,
      packId: 'test',
      title: 'Empty',
      width: 3,
      height: 3,
      arrows: [],
    };

    const report = solveLevel(emptyLevel);
    expect(report.isSolvable).toBe(true);
    expect(report.minMoves).toBe(0);
    expect(report.avgBranchingFactor).toBe(0);
  });
});
