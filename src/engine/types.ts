/**
 * Arrow Escape — Core Domain Types
 * Pure TypeScript. Zero dependencies.
 */

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Vector2D {
  readonly dx: number;
  readonly dy: number;
}

export interface GridPosition {
  readonly x: number;
  readonly y: number;
}

export interface ArrowConfig {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly direction: Direction;
  readonly colorVariant?: string;
}

export interface MoveDiagnostic {
  readonly canEscape: boolean;
  readonly blockerId: string | null;
  readonly blockerPos: GridPosition | null;
  readonly rayPath: readonly GridPosition[];
}

export interface MoveResult {
  readonly success: boolean;
  readonly arrowId: string;
  readonly diagnostic: MoveDiagnostic;
  readonly remainingArrows: readonly ArrowConfig[];
  readonly movesCount: number;
  readonly isCompleted: boolean;
}

export interface LevelData {
  readonly id: number;
  readonly packId: string;
  readonly title: string;
  readonly width: number;
  readonly height: number;
  readonly arrows: readonly ArrowConfig[];
  readonly targetMoves?: number;
  readonly authorNotes?: string;
}

export interface StarRatingCriteria {
  readonly stars: 1 | 2 | 3;
  readonly description: string;
}

export interface GameEngineState {
  readonly level: LevelData;
  readonly activeArrows: readonly ArrowConfig[];
  readonly escapedArrowIds: readonly string[];
  readonly moveHistory: readonly string[]; // arrow IDs in order of escape
  readonly totalTaps: number;
  readonly invalidTaps: number;
  readonly isCompleted: boolean;
  readonly starsAwarded: 0 | 1 | 2 | 3;
}
