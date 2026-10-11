/**
 * Arrow Escape — Difficulty Scoring & Progression Engine
 * Evaluates puzzle complexity across 6 analytical axes and classifies tiers.
 */

import { LevelData, ArrowConfig } from './types';
import { getValidMoves } from './moveValidator';
import { solveLevel, SolverReport } from './solver';

export type DifficultyTier = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface DifficultyBreakdown {
  readonly minSolutionLength: number;
  readonly initialAvailableMoves: number;
  readonly initialMoveRatio: number;
  readonly maxDependencyDepth: number;
  readonly avgDependencyDepth: number;
  readonly avgBranchingFactor: number;
  readonly deadEndsCount: number;
  readonly specialArrowsCount: number;
  readonly distinctSpecialTypes: number;
  readonly specialComplexityScore: number;
  readonly compositeScore: number; // 1.0 to 10.0
  readonly tier: DifficultyTier;
  readonly isSolvable: boolean;
}

/**
 * Calculates dependency depth layers by tracking when each arrow becomes free.
 */
function calculateDependencyDepth(
  level: LevelData,
  solutionPath: readonly string[]
): { maxDepth: number; avgDepth: number } {
  if (solutionPath.length === 0) {
    return { maxDepth: 1, avgDepth: 1 };
  }

  // Track depth layer: arrows freed on move 0 have depth 1; arrows freed on move k have depth k+1
  let currentRemaining = [...level.arrows];
  const depths: number[] = [];
  let currentLayer = 1;

  for (const arrowId of solutionPath) {
    const validMoves = getValidMoves(currentRemaining, level.width, level.height);
    const isDirectlyFree = validMoves.some(m => m.id === arrowId);

    if (isDirectlyFree) {
      depths.push(currentLayer);
    } else {
      currentLayer++;
      depths.push(currentLayer);
    }

    currentRemaining = currentRemaining.filter(a => a.id !== arrowId);
  }

  const maxDepth = depths.length > 0 ? Math.max(...depths) : 1;
  const avgDepth =
    depths.length > 0
      ? Number((depths.reduce((a, b) => a + b, 0) / depths.length).toFixed(1))
      : 1;

  return { maxDepth, avgDepth };
}

/**
 * Calculates special-mechanic complexity score based on arrow types present.
 */
function calculateSpecialComplexity(arrows: readonly ArrowConfig[]): {
  count: number;
  distinctTypes: number;
  score: number;
} {
  let count = 0;
  const types = new Set<string>();
  let score = 0;

  for (const a of arrows) {
    const isSpecial = a.type && a.type !== 'NORMAL';
    const isLocked = !!a.isLocked || (a.lockRequirement !== undefined && a.lockRequirement > 0);

    if (isSpecial || isLocked) {
      count++;
      if (a.type) types.add(a.type);
      if (isLocked) types.add('LOCKED');

      switch (a.type) {
        case 'KEY':
          score += 0.8;
          break;
        case 'ROTATING':
          score += 0.7;
          break;
        case 'BOMB':
          score += 0.9;
          break;
        case 'LOCKED':
          score += 0.6;
          break;
        default:
          if (isLocked) score += 0.6;
          break;
      }
    }
  }

  // Diversity bonus
  score += types.size * 0.4;

  return {
    count,
    distinctTypes: types.size,
    score: Number(Math.min(2.5, score).toFixed(2)),
  };
}

/**
 * Evaluates the full difficulty profile of a level.
 */
export function evaluateDifficulty(
  level: LevelData,
  solverOverride?: SolverReport
): DifficultyBreakdown {
  const solverReport = solverOverride || solveLevel(level, 1);
  const totalArrows = level.arrows.length;

  // 1. Initial available moves
  const initialMoves = getValidMoves(level.arrows, level.width, level.height);
  const initialAvailableMoves = initialMoves.length;
  const initialMoveRatio = totalArrows > 0 ? Number((initialAvailableMoves / totalArrows).toFixed(2)) : 0;

  // 2. Minimum solution length
  const minSolutionLength = solverReport.minMoves || totalArrows;

  // 3. Dependency depth
  const { maxDepth, avgDepth } = calculateDependencyDepth(level, solverReport.firstSolution);

  // 4. Branching factor & dead ends
  const avgBranchingFactor = solverReport.avgBranchingFactor;
  const deadEndsCount = solverReport.deadEndsCount;

  // 5. Special mechanics complexity
  const specialInfo = calculateSpecialComplexity(level.arrows);

  // --- COMPOSITE SCORING ENGINE ---
  // A. Length factor (0.5 to 3.0)
  const lengthScore = Math.min(3.0, (minSolutionLength / 12) * 1.5);

  // B. Opening bottleneck (0.2 to 2.5): tightly constrained starts score higher
  const bottleneckScore = Math.max(0.2, Math.min(2.5, 2.5 - initialMoveRatio * 3.5));

  // C. Dependency depth (0.5 to 2.8)
  const depthScore = Math.min(2.8, (maxDepth / Math.max(1, minSolutionLength)) * 1.8 + maxDepth * 0.15);

  // D. Decision ambiguity & dead ends (0.3 to 1.8)
  const decisionScore = Math.min(
    1.8,
    avgBranchingFactor * 0.25 + Math.min(0.8, deadEndsCount * 0.15)
  );

  // E. Special mechanics complexity (0.0 to 2.5)
  const mechanicsScore = specialInfo.score;

  // Composite 1.0 to 10.0 scale
  const rawComposite = lengthScore + bottleneckScore + depthScore + decisionScore + mechanicsScore;
  const compositeScore = Number(Math.max(1.0, Math.min(10.0, rawComposite)).toFixed(1));

  // Classify Tier
  let tier: DifficultyTier = 'Easy';
  if (compositeScore >= 7.8) {
    tier = 'Expert';
  } else if (compositeScore >= 5.8) {
    tier = 'Hard';
  } else if (compositeScore >= 3.5) {
    tier = 'Medium';
  } else {
    tier = 'Easy';
  }

  return {
    minSolutionLength,
    initialAvailableMoves,
    initialMoveRatio,
    maxDependencyDepth: maxDepth,
    avgDependencyDepth: avgDepth,
    avgBranchingFactor,
    deadEndsCount,
    specialArrowsCount: specialInfo.count,
    distinctSpecialTypes: specialInfo.distinctTypes,
    specialComplexityScore: mechanicsScore,
    compositeScore,
    tier,
    isSolvable: solverReport.isSolvable,
  };
}
