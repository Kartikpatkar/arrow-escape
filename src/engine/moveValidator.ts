/**
 * Arrow Escape — Move Validator
 * Validates arrow taps and returns atomic result objects.
 */

import { ArrowConfig, MoveDiagnostic, MoveResult } from './types';
import { castEscapeRay } from './raycaster';

/**
 * Validates whether an arrow can escape the board from its current position.
 *
 * @param arrowId The ID of the tapped arrow.
 * @param activeArrows All arrows currently active on the board.
 * @param gridWidth Grid column count.
 * @param gridHeight Grid row count.
 * @returns MoveResult detailing outcome, updated remaining list, and diagnostics.
 */
export function evaluateMove(
  arrowId: string,
  activeArrows: readonly ArrowConfig[],
  gridWidth: number,
  gridHeight: number
): MoveResult {
  const targetArrow = activeArrows.find(a => a.id === arrowId);

  if (!targetArrow) {
    const emptyDiagnostic: MoveDiagnostic = {
      canEscape: false,
      blockerId: null,
      blockerPos: null,
      rayPath: [],
    };

    return {
      success: false,
      arrowId,
      diagnostic: emptyDiagnostic,
      remainingArrows: activeArrows,
      movesCount: 0,
      isCompleted: activeArrows.length === 0,
    };
  }

  const diagnostic = castEscapeRay(targetArrow, activeArrows, gridWidth, gridHeight);

  // Locked arrows cannot escape until unlocked
  if (targetArrow.isLocked) {
    return {
      success: false,
      arrowId,
      diagnostic: {
        canEscape: false,
        blockerId: 'LOCKED',
        blockerPos: null,
        rayPath: diagnostic.rayPath,
      },
      remainingArrows: activeArrows,
      movesCount: 1,
      isCompleted: false,
    };
  }

  if (diagnostic.canEscape) {
    const remainingArrows = activeArrows.filter(a => a.id !== arrowId);
    return {
      success: true,
      arrowId,
      diagnostic,
      remainingArrows,
      movesCount: 1,
      isCompleted: remainingArrows.length === 0,
    };
  }

  return {
    success: false,
    arrowId,
    diagnostic,
    remainingArrows: activeArrows,
    movesCount: 0,
    isCompleted: false,
  };
}

/**
 * Convenience helper to check if an arrow has a clear escape path.
 */
export function isArrowClear(
  arrow: ArrowConfig,
  activeArrows: readonly ArrowConfig[],
  gridWidth: number,
  gridHeight: number
): boolean {
  if (arrow.isLocked) return false;
  return castEscapeRay(arrow, activeArrows, gridWidth, gridHeight).canEscape;
}
