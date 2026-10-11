import { getHint, getValidMoves, getTieredHint, getBlockerHint, getSolutionHint } from '../../src/engine/hintEngine';
import { ArrowConfig, LevelData } from '../../src/engine/types';

describe('Hint Engine', () => {
  const level: LevelData = {
    id: 1,
    packId: 'test',
    title: 'Test Hint Level',
    width: 4,
    height: 4,
    arrows: [
      { id: 'a1', x: 2, y: 0, direction: 'UP' },
      { id: 'a2', x: 2, y: 1, direction: 'UP' },
      { id: 'a3', x: 2, y: 2, direction: 'UP' },
      { id: 'a4', x: 0, y: 3, direction: 'LEFT' },
    ],
  };

  it('identifies all currently unblocked arrows', () => {
    const validMoves = getValidMoves(level.arrows, level.width, level.height);
    const validIds = validMoves.map(a => a.id);

    expect(validIds).toContain('a1');
    expect(validIds).toContain('a4');
    expect(validIds).not.toContain('a2');
    expect(validIds).not.toContain('a3');
  });

  it('recommends arrow that unlocks the most cascade candidates', () => {
    const hint = getHint(level.arrows, level);

    expect(hint.hasHint).toBe(true);
    expect(hint.candidateArrowIds).toContain('a1');
    expect(hint.candidateArrowIds).toContain('a4');
    // a1 unblocks a2, whereas a4 unblocks nothing
    expect(hint.recommendedArrowId).toBe('a1');
    expect(hint.unblocksCount).toBe(1);
  });

  it('Level 1 — Directional Hint returns clear escape candidate', () => {
    const dirHint = getTieredHint('DIRECTIONAL', level.arrows, level);
    expect(dirHint.hasHint).toBe(true);
    expect(dirHint.tier).toBe('DIRECTIONAL');
    expect(dirHint.targetArrowId).toBe('a1');
    expect(dirHint.blockerArrowId).toBeNull();
    expect(dirHint.explanation).toContain('Arrow (UP)');
  });

  it('Level 2 — Blocker Hint returns blocked arrow and its obstacle', () => {
    const blockerHint = getTieredHint('BLOCKER', level.arrows, level);
    expect(blockerHint.hasHint).toBe(true);
    expect(blockerHint.tier).toBe('BLOCKER');
    // a2 is blocked by a1
    expect(blockerHint.targetArrowId).toBe('a2');
    expect(blockerHint.blockerArrowId).toBe('a1');
    expect(blockerHint.explanation).toContain('is blocked by Arrow');
  });

  it('Level 3 — Solution Hint returns verified move from backtracking solver', () => {
    const solHint = getTieredHint('SOLUTION', level.arrows, level);
    expect(solHint.hasHint).toBe(true);
    expect(solHint.tier).toBe('SOLUTION');
    expect(solHint.targetArrowId).toBeDefined();
    // In this puzzle, a1 must escape first to solve a2 and a3
    expect(solHint.targetArrowId).toBe('a1');
    expect(solHint.explanation).toContain('optimal solution sequence');
  });

  it('returns hasHint: false when no unblocked arrows remain in blocked cycle', () => {
    const blockedCycle: ArrowConfig[] = [
      { id: 'c1', x: 1, y: 1, direction: 'RIGHT' },
      { id: 'c2', x: 2, y: 1, direction: 'DOWN' },
      { id: 'c3', x: 2, y: 2, direction: 'LEFT' },
      { id: 'c4', x: 1, y: 2, direction: 'UP' },
    ];

    const cycleLevel: LevelData = {
      ...level,
      arrows: blockedCycle,
    };

    const hint = getHint(blockedCycle, cycleLevel);
    expect(hint.hasHint).toBe(false);
    expect(hint.recommendedArrowId).toBeNull();
  });
});
