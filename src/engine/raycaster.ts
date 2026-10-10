/**
 * Arrow Escape — Raycasting Engine
 * Pure mathematical raycasting over a 2D discrete grid.
 */

import { ArrowConfig, Direction, GridPosition, MoveDiagnostic, Vector2D } from './types';

/**
 * Maps a cardinal direction to its unit vector offset in discrete grid space.
 * Origin (0,0) is Top-Left:
 * - UP decreases y
 * - DOWN increases y
 * - LEFT decreases x
 * - RIGHT increases x
 */
export const DIRECTION_VECTORS: Readonly<Record<Direction, Vector2D>> = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 },
};

/**
 * Checks whether a discrete coordinate is inside the grid boundaries.
 */
export function isInsideGrid(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

/**
 * Casts a discrete ray from the arrow's position along its direction vector.
 * If an active arrow is encountered before the ray exits the grid, escape is blocked.
 * Otherwise, the arrow escapes successfully across the board boundary.
 *
 * @param targetArrow The arrow attempting to escape.
 * @param activeArrows All arrows currently active on the board.
 * @param gridWidth The width of the grid (columns).
 * @param gridHeight The height of the grid (rows).
 * @returns Diagnostic containing path trace and blocker information (if any).
 */
export function castEscapeRay(
  targetArrow: ArrowConfig,
  activeArrows: readonly ArrowConfig[],
  gridWidth: number,
  gridHeight: number
): MoveDiagnostic {
  const vector = DIRECTION_VECTORS[targetArrow.direction];
  const rayPath: GridPosition[] = [];

  // Build a fast lookup map of active arrow positions (excluding target arrow)
  const positionMap = new Map<string, ArrowConfig>();
  for (const arrow of activeArrows) {
    if (arrow.id !== targetArrow.id) {
      positionMap.set(`${arrow.x},${arrow.y}`, arrow);
    }
  }

  let currX = targetArrow.x + vector.dx;
  let currY = targetArrow.y + vector.dy;

  while (isInsideGrid(currX, currY, gridWidth, gridHeight)) {
    const currentPos: GridPosition = { x: currX, y: currY };
    rayPath.push(currentPos);

    const blocker = positionMap.get(`${currX},${currY}`);
    if (blocker) {
      return {
        canEscape: false,
        blockerId: blocker.id,
        blockerPos: currentPos,
        rayPath,
      };
    }

    currX += vector.dx;
    currY += vector.dy;
  }

  // Ray exited grid without hitting any obstacle
  return {
    canEscape: true,
    blockerId: null,
    blockerPos: null,
    rayPath,
  };
}
