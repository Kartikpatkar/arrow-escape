import { getHint, getValidMoves } from '../../src/engine/hintEngine';
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

  it('returns hasHint: false when no unblocked arrows remain', () => {
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
