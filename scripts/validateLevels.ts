/**
 * Arrow Escape — Level Pack Validator CLI
 * Runs in CI and local dev to ensure level integrity and solvability.
 */

import { CORE_LEVELS } from '../src/data/levels';
import { solveLevel } from '../src/engine/solver';

console.log('='.repeat(60));
console.log('🏹 Arrow Escape — Level Pack Validation');
console.log('='.repeat(60));

let errorCount = 0;

for (const level of CORE_LEVELS) {
  const report = solveLevel(level, 5);

  if (!report.isSolvable) {
    console.error(`❌ FAILED: Level ${level.id} "${level.title}" has NO valid solution path!`);
    errorCount++;
    continue;
  }

  const density = (level.arrows.length / (level.width * level.height)).toFixed(2);
  console.log(
    `✅ Level ${level.id.toString().padStart(2, ' ')}: "${level.title.padEnd(20, ' ')}" | ` +
      `Grid: ${level.width}x${level.height} | Arrows: ${level.arrows.length.toString().padStart(2, ' ')} | ` +
      `Density: ${density} | Diff: ${report.difficultyScore} | Solutions: ${report.totalSolutions}+`
  );
}

console.log('='.repeat(60));

if (errorCount > 0) {
  console.error(`❌ Validation failed with ${errorCount} invalid level(s).`);
  process.exit(1);
} else {
  console.log(`🎉 SUCCESS: All ${CORE_LEVELS.length} levels are mathematically verified and 100% solvable.`);
}
