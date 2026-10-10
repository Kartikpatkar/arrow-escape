/**
 * Arrow Escape — Levels Index
 */

import { LevelData } from '../../engine/types';
import packCoreData from './packCore.json';

export const CORE_LEVELS: readonly LevelData[] = packCoreData as LevelData[];

/**
 * Retrieves a level by its 1-indexed ID from the core pack.
 */
export function getLevelById(id: number): LevelData | undefined {
  return CORE_LEVELS.find(lvl => lvl.id === id);
}

/**
 * Returns total count of levels in core pack.
 */
export function getTotalCoreLevels(): number {
  return CORE_LEVELS.length;
}
