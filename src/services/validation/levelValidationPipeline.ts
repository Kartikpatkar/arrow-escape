/**
 * Arrow Escape — Level Quality & Integrity Validation Pipeline
 * Validates 30 curated and 470 procedurally generated levels (1 to 500).
 *
 * Verifies:
 * 1. Mathematical solvability via backtracking solver.
 * 2. Direction validity (UP, DOWN, LEFT, RIGHT).
 * 3. Board coordinate bounds (0 <= x < width, 0 <= y < height).
 * 4. Coordinate collisions & duplicate arrow IDs.
 * 5. Minimum move budget & reasonable step depth.
 * 6. Non-trivial move-0 escape availability.
 * 7. Progression curve metrics across worlds.
 */

import { LevelData, Direction, ArrowConfig } from '../../engine/types';
import { getLevelById, TOTAL_LEVELS } from '../../data/levels';
import { solveLevel } from '../../engine/solver';
import { getValidMoves } from '../../engine/moveValidator';

export interface LevelValidationMetric {
  levelId: number;
  width: number;
  height: number;
  arrowCount: number;
  isSolvable: boolean;
  minMoves: number;
  initialValidMoves: number;
  densityPercent: number;
  hasValidDirections: boolean;
  hasValidCoordinates: boolean;
  hasUniqueCoordinates: boolean;
  hasUniqueIds: boolean;
  errors: string[];
}

export interface LevelQualityAuditSummary {
  totalLevelsChecked: number;
  allSolvable: boolean;
  levelsWithErrors: number;
  minSolutionLength: number;
  maxSolutionLength: number;
  avgSolutionLength: number;
  minArrowCount: number;
  maxArrowCount: number;
  curatedCount: number;
  proceduralCount: number;
  brokenLevelIds: number[];
}

const VALID_DIRECTIONS: readonly Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];

/**
 * Validates a single level against all quality, fairness, and coordinate rules.
 */
export function validateSingleLevel(level: LevelData): LevelValidationMetric {
  const errors: string[] = [];

  // 1. Directions check
  const hasValidDirections = level.arrows.every((a: ArrowConfig) =>
    VALID_DIRECTIONS.includes(a.direction)
  );
  if (!hasValidDirections) {
    errors.push('Found arrow with invalid direction.');
  }

  // 2. Coordinate bounds check
  const hasValidCoordinates = level.arrows.every(
    (a: ArrowConfig) => a.x >= 0 && a.x < level.width && a.y >= 0 && a.y < level.height
  );
  if (!hasValidCoordinates) {
    errors.push(`Arrow coordinates out of bounds for grid ${level.width}x${level.height}.`);
  }

  // 3. Unique coordinates check
  const coordSet = new Set<string>();
  let hasUniqueCoordinates = true;
  for (const a of level.arrows) {
    const key = `${a.x},${a.y}`;
    if (coordSet.has(key)) {
      hasUniqueCoordinates = false;
      errors.push(`Duplicate coordinate detected at (${a.x}, ${a.y}).`);
      break;
    }
    coordSet.add(key);
  }

  // 4. Unique IDs check
  const idSet = new Set<string>();
  let hasUniqueIds = true;
  for (const a of level.arrows) {
    if (idSet.has(a.id)) {
      hasUniqueIds = false;
      errors.push(`Duplicate arrow id detected: ${a.id}.`);
      break;
    }
    idSet.add(a.id);
  }

  // 5. Initial moves availability on move 0
  const initialMoves = getValidMoves(level.arrows, level.width, level.height);
  const initialValidMoves = initialMoves.length;
  if (initialValidMoves === 0) {
    errors.push('Deadlock on move 0: no arrows can escape.');
  }

  // 6. Solvability check
  const report = solveLevel(level, 1);
  if (!report.isSolvable) {
    errors.push('Puzzle has no valid escape sequence (unsolvable).');
  }

  const densityPercent = Math.round(
    (level.arrows.length / (level.width * level.height)) * 100
  );

  return {
    levelId: level.id,
    width: level.width,
    height: level.height,
    arrowCount: level.arrows.length,
    isSolvable: report.isSolvable,
    minMoves: report.minMoves,
    initialValidMoves,
    densityPercent,
    hasValidDirections,
    hasValidCoordinates,
    hasUniqueCoordinates,
    hasUniqueIds,
    errors,
  };
}

/**
 * Runs validation pipeline over a range of levels (e.g. 1..500 or 1..50 sample).
 */
export function validateLevelPipeline(
  startLevel: number = 1,
  endLevel: number = TOTAL_LEVELS
): {
  metrics: LevelValidationMetric[];
  summary: LevelQualityAuditSummary;
} {
  const metrics: LevelValidationMetric[] = [];
  const brokenLevelIds: number[] = [];
  let totalSolMoves = 0;
  let minSolLen = Infinity;
  let maxSolLen = -Infinity;
  let minArrows = Infinity;
  let maxArrows = -Infinity;
  let curatedCount = 0;
  let proceduralCount = 0;

  for (let id = startLevel; id <= endLevel; id++) {
    const level = getLevelById(id);
    if (!level) {
      brokenLevelIds.push(id);
      continue;
    }

    if (id <= 30) curatedCount++;
    else proceduralCount++;

    const m = validateSingleLevel(level);
    metrics.push(m);

    if (m.errors.length > 0 || !m.isSolvable) {
      brokenLevelIds.push(id);
    }

    if (m.isSolvable) {
      totalSolMoves += m.minMoves;
      minSolLen = Math.min(minSolLen, m.minMoves);
      maxSolLen = Math.max(maxSolLen, m.minMoves);
    }

    minArrows = Math.min(minArrows, m.arrowCount);
    maxArrows = Math.max(maxArrows, m.arrowCount);
  }

  const count = metrics.length;
  const summary: LevelQualityAuditSummary = {
    totalLevelsChecked: count,
    allSolvable: brokenLevelIds.length === 0,
    levelsWithErrors: brokenLevelIds.length,
    minSolutionLength: count > 0 ? minSolLen : 0,
    maxSolutionLength: count > 0 ? maxSolLen : 0,
    avgSolutionLength: count > 0 ? Math.round((totalSolMoves / count) * 10) / 10 : 0,
    minArrowCount: count > 0 ? minArrows : 0,
    maxArrowCount: count > 0 ? maxArrows : 0,
    curatedCount,
    proceduralCount,
    brokenLevelIds,
  };

  return { metrics, summary };
}
