/**
 * Procedural & Deterministic Generator for Guaranteed Solvable Arrow Escape Levels
 */

import { ArrowConfig, Direction, LevelData } from '../src/engine/types';
import { solveLevel } from '../src/engine/solver';
import { DIRECTION_VECTORS } from '../src/engine/raycaster';

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const ALL_DIRECTIONS: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

/**
 * Generates a guaranteed solvable level by reverse play.
 * Starts with empty board, repeatedly inserts an arrow that can escape immediately
 * from the current configuration, then flips its order.
 */
export function generateSolvableLevel(
  id: number,
  title: string,
  width: number,
  height: number,
  targetArrows: number,
  seed = 42
): LevelData {
  let rngState = seed;
  function random(): number {
    rngState = (rngState * 1664525 + 1013904223) % 4294967296;
    return rngState / 4294967296;
  }

  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Attempts to generate
  for (let attempt = 0; attempt < 50; attempt++) {
    const arrows: ArrowConfig[] = [];
    const occupied = new Set<string>();

    for (let step = 0; step < targetArrows; step++) {
      // Find empty grid positions
      const emptyCells: { x: number; y: number }[] = [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (!occupied.has(`${x},${y}`)) {
            emptyCells.push({ x, y });
          }
        }
      }

      if (emptyCells.length === 0) break;

      const shuffledCells = shuffle(emptyCells);
      let placed = false;

      for (const cell of shuffledCells) {
        // Find a direction that allows escape given currently placed arrows
        const dirs = shuffle(ALL_DIRECTIONS);
        for (const dir of dirs) {
          const candidate: ArrowConfig = {
            id: `a${step + 1}`,
            x: cell.x,
            y: cell.y,
            direction: dir,
          };

          // Check if this candidate can escape past already placed arrows
          const testArrows = [...arrows, candidate];
          const vec = DIRECTION_VECTORS[dir];
          let cx = cell.x + vec.dx;
          let cy = cell.y + vec.dy;
          let blocked = false;

          while (cx >= 0 && cx < width && cy >= 0 && cy < height) {
            if (occupied.has(`${cx},${cy}`)) {
              blocked = true;
              break;
            }
            cx += vec.dx;
            cy += vec.dy;
          }

          if (!blocked) {
            arrows.push(candidate);
            occupied.add(`${cell.x},${cell.y}`);
            placed = true;
            break;
          }
        }
        if (placed) break;
      }

      if (!placed) break;
    }

    if (arrows.length >= targetArrows) {
      const level: LevelData = {
        id,
        packId: 'core',
        title,
        width,
        height,
        arrows,
      };

      const report = solveLevel(level, 3);
      if (report.isSolvable) {
        return level;
      }
    }
  }

  throw new Error(`Failed to generate solvable level for ${title}`);
}
