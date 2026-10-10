/**
 * Arrow Escape — Backtracking Puzzle Solver & Metric Analyzer
 * Used for automated CI validation and level curation.
 */

import { ArrowConfig, LevelData } from './types';
import { getValidMoves } from './hintEngine';

export interface SolverReport {
  readonly isSolvable: boolean;
  readonly totalSolutions: number;
  readonly firstSolution: readonly string[]; // arrow IDs in escaping order
  readonly minMoves: number;
  readonly maxBranchingFactor: number;
  readonly minBranchingFactor: number;
  readonly avgBranchingFactor: number;
  readonly deadEndsCount: number;
  readonly difficultyScore: number;
}

/**
 * Solves a level using depth-first backtracking.
 * Explores possible sequences of arrow removals to confirm solvability
 * and computes difficulty metrics.
 *
 * @param level The puzzle configuration.
 * @param maxSolutionsToFind Cap exploration to prevent combinatorial explosion on huge symmetric boards.
 */
export function solveLevel(level: LevelData, maxSolutionsToFind = 5): SolverReport {
  const initialArrows = [...level.arrows];
  const solutions: string[][] = [];
  const branchingFactors: number[] = [];
  const visitedStates = new Set<string>();
  let deadEnds = 0;

  function backtrack(remainingArrows: ArrowConfig[], currentPath: string[]): void {
    if (solutions.length >= maxSolutionsToFind) {
      return;
    }

    if (remainingArrows.length === 0) {
      solutions.push([...currentPath]);
      return;
    }

    // Memoize remaining arrows subset to eliminate combinatorial duplication
    const stateKey = remainingArrows.map(a => a.id).sort().join(',');
    if (visitedStates.has(stateKey)) {
      return;
    }
    visitedStates.add(stateKey);

    const validMoves = getValidMoves(remainingArrows, level.width, level.height);
    branchingFactors.push(validMoves.length);

    if (validMoves.length === 0) {
      deadEnds++;
      return;
    }

    for (const move of validMoves) {
      const nextRemaining = remainingArrows.filter(a => a.id !== move.id);
      currentPath.push(move.id);

      backtrack(nextRemaining, currentPath);

      currentPath.pop();
      if (solutions.length >= maxSolutionsToFind) {
        break;
      }
    }
  }

  backtrack(initialArrows, []);

  const totalSolutions = solutions.length;
  const isSolvable = totalSolutions > 0;
  const firstSolution = isSolvable ? solutions[0] : [];

  const maxBranch = branchingFactors.length > 0 ? Math.max(...branchingFactors) : 0;
  const minBranch = branchingFactors.length > 0 ? Math.min(...branchingFactors) : 0;
  const avgBranch =
    branchingFactors.length > 0
      ? Number(
          (branchingFactors.reduce((sum, b) => sum + b, 0) / branchingFactors.length).toFixed(2)
        )
      : 0;

  // Difficulty Metric D (1.0 to 10.0 scale)
  const density = level.arrows.length / (level.width * level.height);
  const constrainedFactor = avgBranch > 0 ? 1 / avgBranch : 2.0;
  const sizeFactor = level.arrows.length / 10;
  const rawDifficulty = density * 3.5 + constrainedFactor * 2.5 + sizeFactor * 1.5;
  const difficultyScore = Number(Math.min(10.0, Math.max(1.0, rawDifficulty)).toFixed(1));

  return {
    isSolvable,
    totalSolutions,
    firstSolution,
    minMoves: level.arrows.length,
    maxBranchingFactor: maxBranch,
    minBranchingFactor: minBranch,
    avgBranchingFactor: avgBranch,
    deadEndsCount: deadEnds,
    difficultyScore,
  };
}
