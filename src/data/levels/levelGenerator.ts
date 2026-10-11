/**
 * Arrow Escape — Deterministic Procedural Level Generator
 * Generates 100% solvable puzzles (levels 31 to 500) using reverse-construction.
 */

import { ArrowConfig, Direction, LevelData } from '../../engine/types';
import { solveLevel } from '../../engine/solver';

const DIRECTIONS: readonly Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];

const DIR_OFFSETS: Record<Direction, { dx: number; dy: number }> = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 },
};

/**
 * Seeded Mulberry32 pseudo-random number generator.
 * Deterministic: guarantees every player gets identical levels for IDs 31..500.
 */
function createMulberry32(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Milestone Tutorial Levels for Special Arrow Mechanics.
 */
function getMilestoneTutorialLevel(levelId: number): LevelData | null {
  if (levelId === 31) {
    return {
      id: 31,
      packId: 'procedural-exp',
      title: 'Tutorial: Locked Arrow',
      width: 4,
      height: 4,
      arrows: [
        { id: 'arrow_1', x: 0, y: 0, direction: 'UP', type: 'NORMAL' },
        { id: 'arrow_2', x: 1, y: 0, direction: 'UP', type: 'NORMAL' },
        { id: 'arrow_3', x: 2, y: 0, direction: 'UP', type: 'LOCKED', isLocked: true, lockRequirement: 2 },
        { id: 'arrow_4', x: 3, y: 0, direction: 'UP', type: 'NORMAL' },
      ],
      targetMoves: 4,
    };
  }

  if (levelId === 61) {
    return {
      id: 61,
      packId: 'procedural-exp',
      title: 'Tutorial: Key & Lock',
      width: 4,
      height: 4,
      arrows: [
        { id: 'arrow_key', x: 0, y: 0, direction: 'UP', type: 'KEY', keyTargetId: 'arrow_locked' },
        { id: 'arrow_locked', x: 2, y: 0, direction: 'UP', type: 'LOCKED', isLocked: true },
        { id: 'arrow_3', x: 1, y: 0, direction: 'UP', type: 'NORMAL' },
        { id: 'arrow_4', x: 3, y: 0, direction: 'UP', type: 'NORMAL' },
      ],
      targetMoves: 4,
    };
  }

  if (levelId === 101) {
    return {
      id: 101,
      packId: 'procedural-exp',
      title: 'Tutorial: Rotating Arrow',
      width: 4,
      height: 4,
      arrows: [
        // Starts pointing RIGHT towards blocker at (1,1); rotates DOWN to exit freely!
        { id: 'arrow_rot', x: 0, y: 1, direction: 'RIGHT', type: 'ROTATING' },
        { id: 'arrow_blocker', x: 1, y: 1, direction: 'DOWN', type: 'NORMAL' },
        { id: 'arrow_top', x: 0, y: 0, direction: 'UP', type: 'NORMAL' },
        { id: 'arrow_right', x: 3, y: 1, direction: 'RIGHT', type: 'NORMAL' },
      ],
      targetMoves: 4,
    };
  }

  if (levelId === 161) {
    return {
      id: 161,
      packId: 'procedural-exp',
      title: 'Tutorial: Bomb Arrow',
      width: 5,
      height: 5,
      arrows: [
        // Bomb at (2,0) pointing UP (clear). Detonates adjacent blocker at (2,1)
        { id: 'arrow_bomb', x: 2, y: 0, direction: 'UP', type: 'BOMB', bombRadius: 1 },
        { id: 'arrow_blocker', x: 2, y: 1, direction: 'UP', type: 'NORMAL' },
        { id: 'arrow_left', x: 0, y: 2, direction: 'LEFT', type: 'NORMAL' },
        { id: 'arrow_right', x: 4, y: 2, direction: 'RIGHT', type: 'NORMAL' },
      ],
      targetMoves: 3,
    };
  }

  return null;
}

/**
 * Generates level configuration for level IDs 31 to 500.
 */
export function generateLevel(levelId: number): LevelData {
  const tutorial = getMilestoneTutorialLevel(levelId);
  if (tutorial) {
    return tutorial;
  }

  const rng = createMulberry32(levelId * 2654435761 + 1337);

  // Progressive grid dimension and arrow density
  let width = 5;
  let height = 5;
  let arrowCount = 10;

  if (levelId <= 60) {
    width = 5;
    height = 5;
    arrowCount = 8 + Math.floor((levelId - 30) * 0.25); // 8-15 arrows
  } else if (levelId <= 150) {
    width = 6;
    height = 6;
    arrowCount = 14 + Math.floor((levelId - 60) * 0.12); // 14-24 arrows
  } else if (levelId <= 300) {
    width = 6;
    height = 7;
    arrowCount = 20 + Math.floor((levelId - 150) * 0.08); // 20-32 arrows
  } else {
    width = 7;
    height = 7;
    arrowCount = 24 + Math.floor((levelId - 300) * 0.04); // 24-32 arrows
  }

  // Attempt reverse-construction placement with progressive mechanics
  let arrows: ArrowConfig[] = [];
  let attempts = 0;

  while (attempts < 10) {
    attempts++;
    const baseArrows = generateCandidateArrows(width, height, arrowCount, rng);
    
    // Inject special mechanics based on level progression
    const enhancedArrows = injectSpecialMechanics(baseArrows, levelId, rng);

    const candidate: LevelData = {
      id: levelId,
      packId: 'procedural-exp',
      title: getProceduralTitle(levelId),
      width,
      height,
      arrows: enhancedArrows,
      targetMoves: enhancedArrows.length,
    };

    const report = solveLevel(candidate, 1);
    if (report.isSolvable) {
      return {
        ...candidate,
        targetMoves: report.minMoves,
      };
    }

    // If enhanced candidate wasn't solvable, verify baseArrows
    const fallbackCandidate: LevelData = {
      ...candidate,
      arrows: baseArrows,
    };
    const fallbackReport = solveLevel(fallbackCandidate, 1);
    if (fallbackReport.isSolvable) {
      return fallbackCandidate;
    }
  }

  return {
    id: levelId,
    packId: 'procedural-exp',
    title: getProceduralTitle(levelId),
    width,
    height,
    arrows,
    targetMoves: arrows.length,
  };
}

/**
 * Injects progressive special arrow mechanics based on level tiers.
 */
function injectSpecialMechanics(
  baseArrows: ArrowConfig[],
  levelId: number,
  rng: () => number
): ArrowConfig[] {
  if (baseArrows.length < 4) return baseArrows;
  const arrows = baseArrows.map(a => ({ ...a }));
  const N = arrows.length;

  const NEXT_ROT: Record<Direction, Direction> = {
    UP: 'RIGHT',
    RIGHT: 'DOWN',
    DOWN: 'LEFT',
    LEFT: 'UP',
  };

  // Tier 1: Levels 32-60 -> Locked Arrows (Counter-based)
  if (levelId >= 32 && levelId <= 60) {
    // Arrow placed first (index 0) escapes last in solution sequence
    arrows[0] = {
      ...arrows[0],
      type: 'LOCKED',
      isLocked: true,
      lockRequirement: Math.max(2, Math.floor(N * 0.4)),
    };
    return arrows;
  }

  // Tier 2: Levels 62-100 -> Key & Locked Arrow Pairs
  if (levelId >= 62 && levelId <= 100) {
    // Key arrow placed near end (escapes early), target placed at 0 (escapes late)
    const keyIdx = Math.min(N - 1, N - 2);
    const targetIdx = 0;
    arrows[keyIdx] = {
      ...arrows[keyIdx],
      type: 'KEY',
      keyTargetId: arrows[targetIdx].id,
    };
    arrows[targetIdx] = {
      ...arrows[targetIdx],
      type: 'LOCKED',
      isLocked: true,
    };
    return arrows;
  }

  // Tier 3: Levels 102-160 -> Rotating Arrows + Locked
  if (levelId >= 102 && levelId <= 160) {
    const rotIdx = Math.floor(N * 0.5);
    // Change initial direction 90 deg so it needs to rotate
    arrows[rotIdx] = {
      ...arrows[rotIdx],
      type: 'ROTATING',
      direction: NEXT_ROT[arrows[rotIdx].direction],
    };
    // Also include a locked arrow
    arrows[0] = {
      ...arrows[0],
      type: 'LOCKED',
      isLocked: true,
      lockRequirement: Math.max(2, Math.floor(N * 0.3)),
    };
    return arrows;
  }

  // Tier 4: Levels 162-220 -> Bomb Arrows + Keys
  if (levelId >= 162 && levelId <= 220) {
    const bombIdx = Math.floor(N * 0.7);
    arrows[bombIdx] = {
      ...arrows[bombIdx],
      type: 'BOMB',
      bombRadius: 1,
    };
    return arrows;
  }

  // Tier 5: Levels 221-500 -> Grand Master Hybrids
  if (levelId > 220) {
    const variant = levelId % 3;
    if (variant === 0) {
      // Rotating + Key
      const keyIdx = N - 1;
      const targetIdx = 0;
      arrows[keyIdx] = {
        ...arrows[keyIdx],
        type: 'KEY',
        keyTargetId: arrows[targetIdx].id,
      };
      arrows[targetIdx] = {
        ...arrows[targetIdx],
        type: 'LOCKED',
        isLocked: true,
      };
      const rotIdx = Math.floor(N * 0.4);
      arrows[rotIdx] = {
        ...arrows[rotIdx],
        type: 'ROTATING',
        direction: NEXT_ROT[arrows[rotIdx].direction],
      };
    } else if (variant === 1) {
      // Bomb + Locked
      const bombIdx = Math.floor(N * 0.8);
      arrows[bombIdx] = {
        ...arrows[bombIdx],
        type: 'BOMB',
        bombRadius: 1,
      };
      arrows[0] = {
        ...arrows[0],
        type: 'LOCKED',
        isLocked: true,
        lockRequirement: Math.max(2, Math.floor(N * 0.5)),
      };
    } else {
      // Rotating + Bomb
      const rotIdx = Math.floor(N * 0.5);
      arrows[rotIdx] = {
        ...arrows[rotIdx],
        type: 'ROTATING',
        direction: NEXT_ROT[arrows[rotIdx].direction],
      };
      const bombIdx = Math.floor(N * 0.8);
      arrows[bombIdx] = {
        ...arrows[bombIdx],
        type: 'BOMB',
        bombRadius: 1,
      };
    }
    return arrows;
  }

  return arrows;
}

/**
 * Places arrows in reverse order of solution to guarantee solvability.
 */
function generateCandidateArrows(
  width: number,
  height: number,
  targetCount: number,
  rng: () => number
): ArrowConfig[] {
  const occupied = new Map<string, Direction>(); // "x,y" => Direction
  const placedArrows: ArrowConfig[] = [];

  // Available coordinates
  const allCoords: Array<{ x: number; y: number }> = [];
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      allCoords.push({ x, y });
    }
  }

  // Shuffle coordinates
  for (let i = allCoords.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = allCoords[i];
    allCoords[i] = allCoords[j];
    allCoords[j] = temp;
  }

  for (const { x, y } of allCoords) {
    if (placedArrows.length >= targetCount) break;
    const coordKey = `${x},${y}`;
    if (occupied.has(coordKey)) continue;

    // Shuffle directions to test
    const dirs = [...DIRECTIONS];
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const temp = dirs[i];
      dirs[i] = dirs[j];
      dirs[j] = temp;
    }

    // Find direction where ray to edge is clear of already placed arrows
    let validDir: Direction | null = null;
    for (const dir of dirs) {
      if (isRayClear(x, y, dir, width, height, occupied)) {
        validDir = dir;
        break;
      }
    }

    if (validDir) {
      occupied.set(coordKey, validDir);
      placedArrows.push({
        id: `arrow_${placedArrows.length + 1}`,
        x,
        y,
        direction: validDir,
      });
    }
  }

  return placedArrows;
}

/**
 * Checks if forward path to edge contains no currently placed arrows.
 */
function isRayClear(
  startX: number,
  startY: number,
  dir: Direction,
  width: number,
  height: number,
  occupied: Map<string, Direction>
): boolean {
  const { dx, dy } = DIR_OFFSETS[dir];
  let curX = startX + dx;
  let curY = startY + dy;

  while (curX >= 0 && curX < width && curY >= 0 && curY < height) {
    if (occupied.has(`${curX},${curY}`)) {
      return false;
    }
    curX += dx;
    curY += dy;
  }
  return true;
}

function getProceduralTitle(levelId: number): string {
  const prefixes = [
    'Vector', 'Cipher', 'Flux', 'Matrix', 'Zenith',
    'Chroma', 'Quantum', 'Nexus', 'Echo', 'Prism',
    'Vortex', 'Pulse', 'Hyperion', 'Starlight', 'Infinity'
  ];
  const suffixes = [
    'Run', 'Labyrinth', 'Shift', 'Trail', 'Circuit',
    'Conundrum', 'Grid', 'Domain', 'Passage', 'Cascade'
  ];

  const p = prefixes[(levelId * 7) % prefixes.length];
  const s = suffixes[(levelId * 13) % suffixes.length];
  return `${p} ${s} #${levelId}`;
}
