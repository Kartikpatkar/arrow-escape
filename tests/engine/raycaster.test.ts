import {
  castEscapeRay,
  DIRECTION_VECTORS,
  isInsideGrid,
} from '../../src/engine/raycaster';
import { ArrowConfig } from '../../src/engine/types';

describe('Raycaster Engine', () => {
  it('correctly maps direction vectors', () => {
    expect(DIRECTION_VECTORS.UP).toEqual({ dx: 0, dy: -1 });
    expect(DIRECTION_VECTORS.DOWN).toEqual({ dx: 0, dy: 1 });
    expect(DIRECTION_VECTORS.LEFT).toEqual({ dx: -1, dy: 0 });
    expect(DIRECTION_VECTORS.RIGHT).toEqual({ dx: 1, dy: 0 });
  });

  it('accurately verifies inside and outside grid boundaries', () => {
    expect(isInsideGrid(0, 0, 4, 4)).toBe(true);
    expect(isInsideGrid(3, 3, 4, 4)).toBe(true);
    expect(isInsideGrid(-1, 0, 4, 4)).toBe(false);
    expect(isInsideGrid(4, 0, 4, 4)).toBe(false);
    expect(isInsideGrid(0, -1, 4, 4)).toBe(false);
    expect(isInsideGrid(0, 4, 4, 4)).toBe(false);
  });

  it('detects unobstructed escape path to grid edge', () => {
    const arrow: ArrowConfig = { id: 'a1', x: 2, y: 1, direction: 'UP' };
    const diagnostic = castEscapeRay(arrow, [arrow], 4, 4);

    expect(diagnostic.canEscape).toBe(true);
    expect(diagnostic.blockerId).toBeNull();
    expect(diagnostic.blockerPos).toBeNull();
    expect(diagnostic.rayPath).toEqual([{ x: 2, y: 0 }]);
  });

  it('detects obstruction when another arrow blocks the path', () => {
    const arrowA: ArrowConfig = { id: 'a1', x: 1, y: 2, direction: 'UP' };
    const arrowB: ArrowConfig = { id: 'a2', x: 1, y: 0, direction: 'LEFT' };

    const diagnostic = castEscapeRay(arrowA, [arrowA, arrowB], 4, 4);

    expect(diagnostic.canEscape).toBe(false);
    expect(diagnostic.blockerId).toBe('a2');
    expect(diagnostic.blockerPos).toEqual({ x: 1, y: 0 });
    expect(diagnostic.rayPath).toEqual([
      { x: 1, y: 1 },
      { x: 1, y: 0 },
    ]);
  });
});
