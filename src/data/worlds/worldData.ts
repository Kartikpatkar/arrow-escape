/**
 * Arrow Escape — Themed Worlds (Level Packs)
 * Groups 500 levels into 6 progressive themed chapters with distinct identities.
 */

export interface WorldDef {
  readonly id: number;
  readonly name: string;
  readonly subtitle: string;
  readonly description: string;
  readonly startLevel: number;
  readonly endLevel: number;
  readonly totalLevels: number;
  readonly icon: string;
  readonly accentColor: string;
  readonly badgeName: string;
  readonly mechanicTag: string;
}

export const WORLDS: readonly WorldDef[] = [
  {
    id: 1,
    name: 'First Escape',
    subtitle: 'The Fundamentals',
    description: 'Master directional raycasting and spatial sequencing.',
    startLevel: 1,
    endLevel: 30,
    totalLevels: 30,
    icon: '🚀',
    accentColor: '#38BDF8', // Sky Blue
    badgeName: 'Pioneer Badge',
    mechanicTag: 'Classic Arrows',
  },
  {
    id: 2,
    name: 'Color Junction',
    subtitle: 'Locked Dependencies',
    description: 'Solve counter-locked arrows and high density boards.',
    startLevel: 31,
    endLevel: 80,
    totalLevels: 50,
    icon: '🔒',
    accentColor: '#F59E0B', // Amber
    badgeName: 'Locksmith Badge',
    mechanicTag: 'Locked Arrows',
  },
  {
    id: 3,
    name: 'Tight Corners',
    subtitle: 'Keys & Rotation',
    description: 'Chained key-locks and 90° clockwise rotating mechanics.',
    startLevel: 81,
    endLevel: 150,
    totalLevels: 70,
    icon: '🔑',
    accentColor: '#EC4899', // Pink
    badgeName: 'Navigator Badge',
    mechanicTag: 'Key & Rotating',
  },
  {
    id: 4,
    name: 'Mind Maze',
    subtitle: 'Demolition & Planning',
    description: 'Bomb detonation blasts and strategic blocker clearing.',
    startLevel: 151,
    endLevel: 250,
    totalLevels: 100,
    icon: '💣',
    accentColor: '#EF4444', // Ruby Red
    badgeName: 'Demolitionist Badge',
    mechanicTag: 'Bomb Arrows',
  },
  {
    id: 5,
    name: 'Chaos Grid',
    subtitle: 'Dense Hybrid Mazes',
    description: 'Multi-mechanic puzzles combining keys, rotators, and bombs.',
    startLevel: 251,
    endLevel: 350,
    totalLevels: 100,
    icon: '🌀',
    accentColor: '#8B5CF6', // Purple
    badgeName: 'Grand Tactician Badge',
    mechanicTag: 'Hybrid Mechanics',
  },
  {
    id: 6,
    name: 'Master Escape',
    subtitle: 'The Grandmaster Challenge',
    description: 'The ultimate spatial trials for puzzle grandmasters.',
    startLevel: 351,
    endLevel: 500,
    totalLevels: 150,
    icon: '👑',
    accentColor: '#10B981', // Emerald Gold
    badgeName: 'Arrow Legend Trophy',
    mechanicTag: 'Master Class',
  },
];

/**
 * Returns the World for a given level ID (1..500).
 */
export function getWorldForLevel(levelId: number): WorldDef {
  const found = WORLDS.find(w => levelId >= w.startLevel && levelId <= w.endLevel);
  return found || WORLDS[0];
}

/**
 * Calculates world-specific progress stats from player records.
 */
export function calculateWorldProgress(
  world: WorldDef,
  unlockedLevel: number,
  levelRecords: Record<number, { stars: number; bestMoves: number }>
) {
  let completedCount = 0;
  let starsEarned = 0;
  let perfectCount = 0;

  for (let lvl = world.startLevel; lvl <= world.endLevel; lvl++) {
    const rec = levelRecords[lvl];
    if (rec && rec.stars > 0) {
      completedCount++;
      starsEarned += rec.stars;
      if (rec.stars === 3) {
        perfectCount++;
      }
    }
  }

  const isUnlocked = world.startLevel <= unlockedLevel;
  const isCompleted = completedCount === world.totalLevels;
  const isMastered = starsEarned === world.totalLevels * 3;
  const percentComplete = Math.min(100, Math.floor((completedCount / world.totalLevels) * 100));

  return {
    world,
    completedCount,
    totalLevels: world.totalLevels,
    starsEarned,
    maxStars: world.totalLevels * 3,
    perfectCount,
    percentComplete,
    isUnlocked,
    isCompleted,
    isMastered,
  };
}
