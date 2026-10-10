/**
 * Arrow Escape — Hint Engine
 * Identifies valid escape candidates and optimal next moves.
 */

import { ArrowConfig, LevelData } from './types';
import { isArrowClear } from './moveValidator';

export interface HintRecommendation {
  readonly hasHint: boolean;
  readonly recommendedArrowId: string | null;
  readonly candidateArrowIds: readonly string[];
  readonly unblocksCount: number; // how many other arrows this move immediately unblocks
}

/**
 * Finds all arrows that currently have an unobstructed escape path.
 */
export function getValidMoves(
  activeArrows: readonly ArrowConfig[],
  gridWidth: number,
  gridHeight: number
): ArrowConfig[] {
  return activeArrows.filter(arrow => isArrowClear(arrow, activeArrows, gridWidth, gridHeight));
}

/**
 * Computes an optimal hint recommendation.
 * Prioritizes the arrow whose escape unlocks the highest number of blocked arrows.
 *
 * @param activeArrows Remaining arrows on the board.
 * @param level The active level definition.
 * @returns HintRecommendation with chosen candidate and metrics.
 */
export function getHint(
  activeArrows: readonly ArrowConfig[],
  level: LevelData
): HintRecommendation {
  const candidates = getValidMoves(activeArrows, level.width, level.height);

  if (candidates.length === 0) {
    return {
      hasHint: false,
      recommendedArrowId: null,
      candidateArrowIds: [],
      unblocksCount: 0,
    };
  }

  // Score candidates by how many additional arrows they immediately liberate
  let bestCandidate = candidates[0];
  let maxUnblocked = -1;

  for (const candidate of candidates) {
    const remainingAfterMove = activeArrows.filter(a => a.id !== candidate.id);
    const validMovesAfter = getValidMoves(remainingAfterMove, level.width, level.height);

    // Number of new unblocked arrows (excluding ones already clear)
    const newlyUnblocked = validMovesAfter.filter(
      after => !candidates.some(before => before.id === after.id)
    ).length;

    if (newlyUnblocked > maxUnblocked) {
      maxUnblocked = newlyUnblocked;
      bestCandidate = candidate;
    }
  }

  return {
    hasHint: true,
    recommendedArrowId: bestCandidate.id,
    candidateArrowIds: candidates.map(c => c.id),
    unblocksCount: Math.max(0, maxUnblocked),
  };
}
