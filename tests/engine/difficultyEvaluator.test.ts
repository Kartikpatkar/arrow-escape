/**
 * Difficulty Evaluator Unit Tests
 */

import { evaluateDifficulty } from '../../src/engine/difficultyEvaluator';
import { CORE_LEVELS, getLevelById } from '../../src/data/levels';

describe('Difficulty Evaluator & Progression Engine', () => {
  it('evaluates early tutorial levels as Easy', () => {
    const level1 = CORE_LEVELS[0];
    const diff1 = evaluateDifficulty(level1);

    expect(diff1.isSolvable).toBe(true);
    expect(diff1.tier).toBe('Easy');
    expect(diff1.compositeScore).toBeLessThan(3.5);
    expect(diff1.specialArrowsCount).toBe(0);
  });

  it('evaluates World 1 milestone levels with balanced progression', () => {
    const level10 = getLevelById(10)!;
    const diff10 = evaluateDifficulty(level10);

    expect(diff10.isSolvable).toBe(true);
    expect(diff10.compositeScore).toBeGreaterThanOrEqual(2.5);
    expect(['Easy', 'Medium']).toContain(diff10.tier);
  });

  it('measures special-mechanic complexity on locked and key levels', () => {
    const level31 = getLevelById(31)!; // Tutorial: Locked Arrow
    const diff31 = evaluateDifficulty(level31);

    expect(diff31.isSolvable).toBe(true);
    expect(diff31.specialArrowsCount).toBeGreaterThan(0);
    expect(diff31.specialComplexityScore).toBeGreaterThan(0);
  });

  it('computes initial available moves and dependency depth accurately', () => {
    const level5 = getLevelById(5)!;
    const diff5 = evaluateDifficulty(level5);

    expect(diff5.initialAvailableMoves).toBeGreaterThan(0);
    expect(diff5.initialMoveRatio).toBeGreaterThan(0);
    expect(diff5.maxDependencyDepth).toBeGreaterThanOrEqual(1);
    expect(diff5.minSolutionLength).toBeGreaterThanOrEqual(level5.arrows.length);
  });

  it('scales into Hard tier for advanced levels', () => {
    const level81 = getLevelById(81)!;
    const diff81 = evaluateDifficulty(level81);

    expect(diff81.isSolvable).toBe(true);
    expect(diff81.compositeScore).toBeGreaterThanOrEqual(5.5);
  });
});
