/**
 * Arrow Escape — Level Quality Dashboard CLI
 * Run: npm run audit:levels
 */

import * as fs from 'fs';
import * as path from 'path';
import { runLevelQualityAudit, formatReportMarkdown } from '../src/services/quality/levelQualityDashboard';

console.log('='.repeat(70));
console.log('🏹 ARROW ESCAPE — LEVEL QUALITY & DIFFICULTY PROGRESSION DASHBOARD');
console.log('='.repeat(70));

const sampleSize = process.argv.includes('--all') ? 500 : 100;
console.log(`Analyzing first ${sampleSize} levels (use --all to evaluate all 500)...`);

const startTime = Date.now();
const report = runLevelQualityAudit(1, sampleSize);
const durationMs = Date.now() - startTime;

console.log(`\nCompleted in ${(durationMs / 1000).toFixed(2)}s`);
console.log(`- Solvability: ${report.totalSolvable}/${report.totalLevelsAnalyzed} (${((report.totalSolvable / report.totalLevelsAnalyzed) * 100).toFixed(1)}%)`);
console.log(`- Global Average Difficulty: ${report.globalAvgDifficulty} / 10.0`);
console.log(`- Tier Distribution: Easy: ${report.tierDistribution.Easy} | Medium: ${report.tierDistribution.Medium} | Hard: ${report.tierDistribution.Hard} | Expert: ${report.tierDistribution.Expert}`);
console.log(`- Flagged Anomalies: ${report.totalFlagged}`);

console.log('\n--- WORLD PROGRESSION CURVE ---');
for (const ws of report.worldSummaries) {
  console.log(
    `World ${ws.worldId}: ${ws.worldName.padEnd(16)} | Range: ${ws.levelRange.padEnd(16)} | Avg Diff: ${ws.avgDifficulty.toString().padEnd(4)} | ` +
    `[Easy: ${ws.tierDistribution.Easy}, Med: ${ws.tierDistribution.Medium}, Hard: ${ws.tierDistribution.Hard}, Exp: ${ws.tierDistribution.Expert}] | Flags: ${ws.flaggedCount}`
  );
}

if (report.flaggedRecords.length > 0) {
  console.log(`\n--- SAMPLE ANOMALY FLAGS (First 5) ---`);
  for (const r of report.flaggedRecords.slice(0, 5)) {
    console.log(`⚠️ Level #${r.levelId} (${r.worldName}): Diff ${r.difficultyScore} (${r.tier}) | Flags: ${r.flags.join(', ')}`);
  }
}

// Write markdown report artifact
const mdContent = formatReportMarkdown(report);
const outputPath = path.resolve(__dirname, '../LEVEL_QUALITY_REPORT.md');
fs.writeFileSync(outputPath, mdContent, 'utf-8');
console.log(`\n📄 Generated full report artifact at: ${outputPath}`);
console.log('='.repeat(70));
