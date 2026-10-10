/**
 * Arrow Escape — Levels Index
 * Serves curated core levels (1-30) and procedural levels up to 500.
 */

import { LevelData } from '../../engine/types';
import packCoreData from './packCore.json';
import { generateLevel } from './levelGenerator';

export const CORE_LEVELS: readonly LevelData[] = packCoreData as LevelData[];

export const TOTAL_LEVELS = 500;

// In-memory cache for procedurally generated levels
const generatedLevelCache = new Map<number, LevelData>();

/**
 * Retrieves a level by its 1-indexed ID (1 to 500).
 */
export function getLevelById(id: number): LevelData | undefined {
  if (id < 1 || id > TOTAL_LEVELS) {
    return undefined;
  }

  // Curated levels 1 to 30
  if (id <= CORE_LEVELS.length) {
    return CORE_LEVELS.find(lvl => lvl.id === id);
  }

  // Check cache for levels 31 to 500
  if (generatedLevelCache.has(id)) {
    return generatedLevelCache.get(id);
  }

  // Generate on demand
  const generated = generateLevel(id);
  generatedLevelCache.set(id, generated);
  return generated;
}

/**
 * Returns total count of curated core levels (30).
 */
export function getTotalCoreLevels(): number {
  return CORE_LEVELS.length;
}

/**
 * Returns total count of all supported levels (500).
 */
export function getTotalLevels(): number {
  return TOTAL_LEVELS;
}
