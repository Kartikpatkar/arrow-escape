/**
 * Arrow Escape — Tiered Educational Hint Engine
 * Provides three progressive levels of assistance:
 * Level 1 (Directional): Highlights an immediately unblocked escape candidate.
 * Level 2 (Blocker): Identifies an obstructed arrow and the blocker preventing its escape.
 * Level 3 (Solution): Calculates the verified next strategic move using the backtracking solver.
 */

import { ArrowConfig, LevelData } from './types';
import { getValidMoves, isArrowClear } from './moveValidator';
import { castEscapeRay } from './raycaster';
import { solveLevel } from './solver';

export { getValidMoves };

export type HintTierLevel = 'DIRECTIONAL' | 'BLOCKER' | 'SOLUTION';

export interface HintRecommendation {
  readonly hasHint: boolean;
  readonly recommendedArrowId: string | null;
  readonly candidateArrowIds: readonly string[];
  readonly unblocksCount: number;
}

export interface TieredHintResult {
  readonly tier: HintTierLevel;
  readonly hasHint: boolean;
  readonly targetArrowId: string | null;
  readonly blockerArrowId: string | null;
  readonly title: string;
  readonly explanation: string;
  readonly icon: string;
  readonly badgeLabel: string;
}

/**
 * Computes default Level 1 hint recommendation (unblocked cascade candidate).
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

/**
 * Computes Level 2 Blocker Hint: finds an obstructed arrow and its primary blocker.
 */
export function getBlockerHint(
  activeArrows: readonly ArrowConfig[],
  level: LevelData
): { blockedArrow: ArrowConfig; blockerArrow: ArrowConfig; explanation: string } | null {
  const blockedArrows = activeArrows.filter(
    a => !isArrowClear(a, activeArrows, level.width, level.height)
  );

  if (blockedArrows.length === 0) {
    return null;
  }

  // Check for Key-Locked arrows first
  for (const arrow of blockedArrows) {
    if (arrow.isLocked) {
      const keyArrow = activeArrows.find(a => a.type === 'KEY' && a.keyTargetId === arrow.id);
      if (keyArrow) {
        return {
          blockedArrow: arrow,
          blockerArrow: keyArrow,
          explanation: `Arrow (${arrow.direction}) is locked. Free Key Arrow (${keyArrow.direction}) at (${keyArrow.x + 1}, ${keyArrow.y + 1}) to unlock it!`,
        };
      }
    }
  }

  // Find physical ray blocker
  for (const arrow of blockedArrows) {
    const diagnostic = castEscapeRay(arrow, activeArrows, level.width, level.height);
    if (diagnostic.blockerId && diagnostic.blockerId !== 'LOCKED') {
      const blocker = activeArrows.find(a => a.id === diagnostic.blockerId);
      if (blocker) {
        return {
          blockedArrow: arrow,
          blockerArrow: blocker,
          explanation: `Arrow (${arrow.direction}) at (${arrow.x + 1}, ${arrow.y + 1}) is blocked by Arrow (${blocker.direction}) at (${blocker.x + 1}, ${blocker.y + 1}). Remove the blocker first!`,
        };
      }
    }
  }

  return null;
}

/**
 * Computes Level 3 Solution Hint: runs backtracking solver to find verified next step.
 */
export function getSolutionHint(
  activeArrows: readonly ArrowConfig[],
  level: LevelData
): { targetArrowId: string; explanation: string } | null {
  const subLevel: LevelData = {
    ...level,
    arrows: [...activeArrows],
  };

  const report = solveLevel(subLevel, 1);
  if (report.isSolvable && report.firstSolution.length > 0) {
    const nextMoveId = report.firstSolution[0];
    const target = activeArrows.find(a => a.id === nextMoveId);
    if (target) {
      return {
        targetArrowId: nextMoveId,
        explanation: `Strategic move: escape Arrow (${target.direction}) at (${target.x + 1}, ${target.y + 1}) along the optimal solution sequence.`,
      };
    }
  }

  // Fallback to standard hint if sub-level search yielded no direct single step
  const fallback = getHint(activeArrows, level);
  if (fallback.hasHint && fallback.recommendedArrowId) {
    const target = activeArrows.find(a => a.id === fallback.recommendedArrowId);
    return {
      targetArrowId: fallback.recommendedArrowId,
      explanation: target
        ? `Recommended move: escape Arrow (${target.direction}) at (${target.x + 1}, ${target.y + 1}).`
        : 'Escape the highlighted arrow.',
    };
  }

  return null;
}

/**
 * Master dispatcher for Tiered Educational Hints.
 */
export function getTieredHint(
  tier: HintTierLevel,
  activeArrows: readonly ArrowConfig[],
  level: LevelData
): TieredHintResult {
  // Tier 1: Directional Hint
  if (tier === 'DIRECTIONAL') {
    const base = getHint(activeArrows, level);
    if (base.hasHint && base.recommendedArrowId) {
      const arrow = activeArrows.find(a => a.id === base.recommendedArrowId);
      return {
        tier: 'DIRECTIONAL',
        hasHint: true,
        targetArrowId: base.recommendedArrowId,
        blockerArrowId: null,
        title: 'Directional Hint',
        explanation: arrow
          ? `Arrow (${arrow.direction}) at (${arrow.x + 1}, ${arrow.y + 1}) has a clear exit ray and can escape immediately!`
          : 'An unobstructed arrow is ready to escape.',
        icon: '🧭',
        badgeLabel: 'Level 1: Directional',
      };
    }

    // Check if rotating arrow needs rotating
    const rotating = activeArrows.find(a => a.type === 'ROTATING');
    if (rotating) {
      return {
        tier: 'DIRECTIONAL',
        hasHint: true,
        targetArrowId: rotating.id,
        blockerArrowId: null,
        title: 'Rotating Arrow',
        explanation: `Tap the rotating arrow at (${rotating.x + 1}, ${rotating.y + 1}) to turn it clockwise toward a clear exit!`,
        icon: '↻',
        badgeLabel: 'Level 1: Directional',
      };
    }
  }

  // Tier 2: Blocker Hint
  if (tier === 'BLOCKER') {
    const blockerInfo = getBlockerHint(activeArrows, level);
    if (blockerInfo) {
      return {
        tier: 'BLOCKER',
        hasHint: true,
        targetArrowId: blockerInfo.blockedArrow.id,
        blockerArrowId: blockerInfo.blockerArrow.id,
        title: 'Blocker Dependency',
        explanation: blockerInfo.explanation,
        icon: '🔍',
        badgeLabel: 'Level 2: Blocker Insight',
      };
    }
  }

  // Tier 3: Solution Hint (or fallback for Tier 1 / 2)
  const solInfo = getSolutionHint(activeArrows, level);
  if (solInfo) {
    return {
      tier: 'SOLUTION',
      hasHint: true,
      targetArrowId: solInfo.targetArrowId,
      blockerArrowId: null,
      title: 'Master Solution Path',
      explanation: solInfo.explanation,
      icon: '🎯',
      badgeLabel: 'Level 3: Solution Path',
    };
  }

  return {
    tier,
    hasHint: false,
    targetArrowId: null,
    blockerArrowId: null,
    title: 'No Moves Available',
    explanation: 'No valid path found. Try using Undo or Restart the board.',
    icon: '❓',
    badgeLabel: 'Assistance',
  };
}
