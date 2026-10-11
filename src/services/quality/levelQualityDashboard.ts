/**
 * Arrow Escape — Level Quality Dashboard & Anomaly Detection Engine
 * Analyzes procedural and curated levels for progression curve, solvability, and flags defects.
 */

import { LevelData } from '../../engine/types';
import { getLevelById, TOTAL_LEVELS } from '../../data/levels';
import { getWorldForLevel } from '../../data/worlds/worldData';
import { evaluateDifficulty, DifficultyTier } from '../../engine/difficultyEvaluator';

export type QualityAnomalyFlag =
  | 'UNSOLVABLE'
  | 'WORLD_MISMATCH_TOO_EASY'
  | 'WORLD_MISMATCH_TOO_HARD'
  | 'TRIVIAL_OPENING'
  | 'STRUCTURAL_MONOTONY'
  | 'EXCESSIVE_MOVES';

export interface LevelAuditRecord {
  readonly levelId: number;
  readonly worldId: number;
  readonly worldName: string;
  readonly width: number;
  readonly height: number;
  readonly arrowsCount: number;
  readonly specialArrowsCount: number;
  readonly minSolutionLength: number;
  readonly initialAvailableMoves: number;
  readonly initialMoveRatio: number;
  readonly difficultyScore: number;
  readonly tier: DifficultyTier;
  readonly isSolvable: boolean;
  readonly flags: QualityAnomalyFlag[];
}

export interface WorldQualitySummary {
  readonly worldId: number;
  readonly worldName: string;
  readonly levelRange: string;
  readonly totalLevels: number;
  readonly avgDifficulty: number;
  readonly tierDistribution: Record<DifficultyTier, number>;
  readonly flaggedCount: number;
}

export interface QualityDashboardReport {
  readonly totalLevelsAnalyzed: number;
  readonly totalSolvable: number;
  readonly totalFlagged: number;
  readonly globalAvgDifficulty: number;
  readonly tierDistribution: Record<DifficultyTier, number>;
  readonly worldSummaries: WorldQualitySummary[];
  readonly flaggedRecords: LevelAuditRecord[];
  readonly records: LevelAuditRecord[];
}

/**
 * Runs quality analysis across all specified levels (default: 500).
 */
export function runLevelQualityAudit(
  startLevel: number = 1,
  endLevel: number = TOTAL_LEVELS
): QualityDashboardReport {
  const records: LevelAuditRecord[] = [];
  let prevRecord: LevelAuditRecord | null = null;

  for (let id = startLevel; id <= endLevel; id++) {
    const level = getLevelById(id);
    if (!level) continue;

    const world = getWorldForLevel(id);
    const difficulty = evaluateDifficulty(level);
    const flags: QualityAnomalyFlag[] = [];

    // 1. Solvability Check
    if (!difficulty.isSolvable) {
      flags.push('UNSOLVABLE');
    }

    // 2. Trivial Opening Check: Too many free arrows on opening move (Worlds 2+)
    if (world.id > 1 && level.arrows.length >= 8 && difficulty.initialMoveRatio >= 0.5) {
      flags.push('TRIVIAL_OPENING');
    }

    // 3. World Difficulty Mismatch Check
    // World 1 should not exceed Medium
    if (world.id === 1 && (difficulty.tier === 'Hard' || difficulty.tier === 'Expert')) {
      flags.push('WORLD_MISMATCH_TOO_HARD');
    }
    // Worlds 5 & 6 should not drop to Easy
    if ((world.id === 5 || world.id === 6) && difficulty.tier === 'Easy') {
      flags.push('WORLD_MISMATCH_TOO_EASY');
    }

    // 4. Structural Monotony Check: Consecutive levels having identical layout signature
    if (
      prevRecord &&
      prevRecord.worldId === world.id &&
      prevRecord.width === level.width &&
      prevRecord.height === level.height &&
      prevRecord.arrowsCount === level.arrows.length &&
      prevRecord.initialAvailableMoves === difficulty.initialAvailableMoves &&
      prevRecord.specialArrowsCount === difficulty.specialArrowsCount
    ) {
      flags.push('STRUCTURAL_MONOTONY');
    }

    // 5. Excessive moves check
    if (difficulty.minSolutionLength > level.width * level.height * 2) {
      flags.push('EXCESSIVE_MOVES');
    }

    const record: LevelAuditRecord = {
      levelId: id,
      worldId: world.id,
      worldName: world.name,
      width: level.width,
      height: level.height,
      arrowsCount: level.arrows.length,
      specialArrowsCount: difficulty.specialArrowsCount,
      minSolutionLength: difficulty.minSolutionLength,
      initialAvailableMoves: difficulty.initialAvailableMoves,
      initialMoveRatio: difficulty.initialMoveRatio,
      difficultyScore: difficulty.compositeScore,
      tier: difficulty.tier,
      isSolvable: difficulty.isSolvable,
      flags,
    };

    records.push(record);
    prevRecord = record;
  }

  // Aggregate World Summaries
  const worldMap = new Map<number, LevelAuditRecord[]>();
  for (const r of records) {
    if (!worldMap.has(r.worldId)) {
      worldMap.set(r.worldId, []);
    }
    worldMap.get(r.worldId)!.push(r);
  }

  const worldSummaries: WorldQualitySummary[] = [];
  for (const [wId, wRecords] of worldMap.entries()) {
    const tierDist: Record<DifficultyTier, number> = { Easy: 0, Medium: 0, Hard: 0, Expert: 0 };
    let scoreSum = 0;
    let flagged = 0;

    for (const r of wRecords) {
      tierDist[r.tier]++;
      scoreSum += r.difficultyScore;
      if (r.flags.length > 0) flagged++;
    }

    const firstId = wRecords[0].levelId;
    const lastId = wRecords[wRecords.length - 1].levelId;

    worldSummaries.push({
      worldId: wId,
      worldName: wRecords[0].worldName,
      levelRange: `Levels ${firstId}–${lastId}`,
      totalLevels: wRecords.length,
      avgDifficulty: Number((scoreSum / wRecords.length).toFixed(1)),
      tierDistribution: tierDist,
      flaggedCount: flagged,
    });
  }

  // Global Tier Distribution
  const globalTierDist: Record<DifficultyTier, number> = { Easy: 0, Medium: 0, Hard: 0, Expert: 0 };
  let globalScoreSum = 0;
  let totalFlagged = 0;
  let totalSolvable = 0;

  for (const r of records) {
    globalTierDist[r.tier]++;
    globalScoreSum += r.difficultyScore;
    if (r.flags.length > 0) totalFlagged++;
    if (r.isSolvable) totalSolvable++;
  }

  const flaggedRecords = records.filter(r => r.flags.length > 0);

  return {
    totalLevelsAnalyzed: records.length,
    totalSolvable,
    totalFlagged,
    globalAvgDifficulty: Number((globalScoreSum / records.length).toFixed(1)),
    tierDistribution: globalTierDist,
    worldSummaries,
    flaggedRecords,
    records,
  };
}

/**
 * Formats report into a Markdown document suitable for reports and CI review.
 */
export function formatReportMarkdown(report: QualityDashboardReport): string {
  const lines: string[] = [];

  lines.push('# Arrow Escape — Level Quality & Progression Dashboard');
  lines.push('');
  lines.push(`**Generated at:** ${new Date().toISOString()}`);
  lines.push(`**Total Levels Analyzed:** ${report.totalLevelsAnalyzed}`);
  lines.push(
    `**Solvability Rate:** ${((report.totalSolvable / report.totalLevelsAnalyzed) * 100).toFixed(1)}% (${report.totalSolvable}/${report.totalLevelsAnalyzed})`
  );
  lines.push(`**Global Average Difficulty:** ${report.globalAvgDifficulty} / 10.0`);
  lines.push(`**Total Anomalies Flagged:** ${report.totalFlagged}`);
  lines.push('');

  lines.push('## World Progression Breakdown');
  lines.push('');
  lines.push('| World | Range | Avg Diff | Easy | Medium | Hard | Expert | Flagged |');
  lines.push('| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |');

  for (const ws of report.worldSummaries) {
    lines.push(
      `| **${ws.worldId}. ${ws.worldName}** | ${ws.levelRange} | ${ws.avgDifficulty} | ${ws.tierDistribution.Easy} | ${ws.tierDistribution.Medium} | ${ws.tierDistribution.Hard} | ${ws.tierDistribution.Expert} | ${ws.flaggedCount} |`
    );
  }
  lines.push('');

  lines.push('## Anomaly Audit Log');
  lines.push('');
  if (report.flaggedRecords.length === 0) {
    lines.push('✅ **No critical anomalies found! All levels satisfy progression criteria.**');
  } else {
    lines.push(`Found ${report.flaggedRecords.length} level(s) requiring attention:`);
    lines.push('');
    lines.push('| Level | World | Grid | Arrows | Init Moves | Score | Tier | Flags |');
    lines.push('| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |');

    for (const r of report.flaggedRecords.slice(0, 30)) {
      lines.push(
        `| **#${r.levelId}** | ${r.worldName} | ${r.width}x${r.height} | ${r.arrowsCount} | ${r.initialAvailableMoves} (${Math.round(r.initialMoveRatio * 100)}%) | ${r.difficultyScore} | ${r.tier} | \`${r.flags.join(', ')}\` |`
      );
    }

    if (report.flaggedRecords.length > 30) {
      lines.push(`\n*... and ${report.flaggedRecords.length - 30} more flagged entries.*`);
    }
  }

  return lines.join('\n');
}
