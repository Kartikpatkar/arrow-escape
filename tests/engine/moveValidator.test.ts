import { evaluateMove, isArrowClear } from '../../src/engine/moveValidator';
import { ArrowConfig } from '../../src/engine/types';

describe('Move Validator', () => {
  const arrows: ArrowConfig[] = [
    { id: 'a1', x: 1, y: 0, direction: 'UP' },
    { id: 'a2', x: 1, y: 1, direction: 'UP' },
    { id: 'a3', x: 2, y: 1, direction: 'RIGHT' },
  ];

  it('validates clear move and updates remaining arrows', () => {
    const result = evaluateMove('a1', arrows, 3, 3);

    expect(result.success).toBe(true);
    expect(result.arrowId).toBe('a1');
    expect(result.remainingArrows.map(a => a.id)).toEqual(['a2', 'a3']);
    expect(result.movesCount).toBe(1);
    expect(result.isCompleted).toBe(false);
  });

  it('rejects blocked move without modifying remaining arrows', () => {
    const result = evaluateMove('a2', arrows, 3, 3);

    expect(result.success).toBe(false);
    expect(result.arrowId).toBe('a2');
    expect(result.diagnostic.canEscape).toBe(false);
    expect(result.diagnostic.blockerId).toBe('a1');
    expect(result.remainingArrows.length).toBe(3);
    expect(result.movesCount).toBe(0);
  });

  it('returns false for nonexistent arrow ID', () => {
    const result = evaluateMove('nonexistent', arrows, 3, 3);
    expect(result.success).toBe(false);
    expect(result.diagnostic.canEscape).toBe(false);
  });

  it('isArrowClear accurately checks individual arrow status', () => {
    expect(isArrowClear(arrows[0], arrows, 3, 3)).toBe(true);
    expect(isArrowClear(arrows[1], arrows, 3, 3)).toBe(false);
    expect(isArrowClear(arrows[2], arrows, 3, 3)).toBe(true);
  });
});
