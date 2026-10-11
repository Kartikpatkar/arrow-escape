/**
 * Arrow Escape — Game State Reducer & Manager
 * Pure immutable state transitions.
 */

import { ArrowConfig, Direction, GameEngineState, LevelData, MoveResult } from './types';
import { evaluateMove } from './moveValidator';

/**
 * Computes stars awarded based on move efficiency.
 * - 3 Stars: Flawless (no invalid taps, totalTaps == initial arrows count).
 * - 2 Stars: Efficient (invalid taps <= 30% of arrow count + 1).
 * - 1 Star: Completed.
 */
export function calculateStars(totalArrows: number, totalTaps: number): 1 | 2 | 3 {
  const invalidTaps = Math.max(0, totalTaps - totalArrows);
  if (invalidTaps === 0) {
    return 3;
  }
  const twoStarThreshold = Math.ceil(0.3 * totalArrows) + 1;
  if (invalidTaps <= twoStarThreshold) {
    return 2;
  }
  return 1;
}

const NEXT_CLOCKWISE_DIR: Record<Direction, Direction> = {
  UP: 'RIGHT',
  RIGHT: 'DOWN',
  DOWN: 'LEFT',
  LEFT: 'UP',
};

/**
 * Initializes fresh game engine state for a level.
 */
export function initializeGameState(level: LevelData): GameEngineState {
  const activeArrows = level.arrows.map(arrow => {
    const isLocked =
      arrow.isLocked ??
      (arrow.type === 'LOCKED' ||
        (arrow.lockRequirement !== undefined && arrow.lockRequirement > 0));
    return {
      ...arrow,
      isLocked,
    };
  });

  return {
    level,
    activeArrows,
    escapedArrowIds: [],
    moveHistory: [],
    totalTaps: 0,
    invalidTaps: 0,
    isCompleted: activeArrows.length === 0,
    starsAwarded: 0,
  };
}

export interface TapActionResult {
  readonly nextState: GameEngineState;
  readonly moveResult: MoveResult;
}

/**
 * Processes a player tap on an arrow.
 * Returns the next immutable state and the move result.
 */
export function processTap(
  state: GameEngineState,
  arrowId: string
): TapActionResult {
  if (state.isCompleted) {
    const moveResult = evaluateMove(
      arrowId,
      state.activeArrows,
      state.level.width,
      state.level.height
    );
    return { nextState: state, moveResult };
  }

  const targetArrow = state.activeArrows.find(a => a.id === arrowId);

  const moveResult = evaluateMove(
    arrowId,
    state.activeArrows,
    state.level.width,
    state.level.height
  );

  const nextTotalTaps = state.totalTaps + 1;

  if (moveResult.success && targetArrow) {
    let nextEscaped = [...state.escapedArrowIds, arrowId];
    let remaining = [...moveResult.remainingArrows];

    // Special Mechanic: KEY ARROW unlocks bound target arrow
    if (targetArrow.type === 'KEY' && targetArrow.keyTargetId) {
      remaining = remaining.map(a =>
        a.id === targetArrow.keyTargetId ? { ...a, isLocked: false } : a
      );
    }

    // Special Mechanic: LOCKED ARROW condition check (counter-based)
    remaining = remaining.map(a => {
      if (
        a.isLocked &&
        a.lockRequirement !== undefined &&
        a.lockRequirement <= nextEscaped.length
      ) {
        return { ...a, isLocked: false };
      }
      return a;
    });

    // Special Mechanic: BOMB ARROW detonates adjacent blocker arrows
    if (targetArrow.type === 'BOMB') {
      const radius = targetArrow.bombRadius || 1;
      const detonatedIds: string[] = [];
      const surviving: ArrowConfig[] = [];

      remaining.forEach(a => {
        if (
          Math.abs(a.x - targetArrow.x) <= radius &&
          Math.abs(a.y - targetArrow.y) <= radius
        ) {
          detonatedIds.push(a.id);
        } else {
          surviving.push(a);
        }
      });

      remaining = surviving;
      nextEscaped = [...nextEscaped, ...detonatedIds];
    }

    const nextHistory = [...state.moveHistory, arrowId];
    const isCompleted = remaining.length === 0;
    const starsAwarded = isCompleted
      ? calculateStars(state.level.arrows.length, nextTotalTaps)
      : 0;

    const nextState: GameEngineState = {
      ...state,
      activeArrows: remaining,
      escapedArrowIds: nextEscaped,
      moveHistory: nextHistory,
      totalTaps: nextTotalTaps,
      isCompleted,
      starsAwarded,
    };

    return { nextState, moveResult };
  }

  // If ROTATING arrow is tapped while blocked: rotate 90 degrees clockwise!
  if (targetArrow && targetArrow.type === 'ROTATING') {
    const nextDir = NEXT_CLOCKWISE_DIR[targetArrow.direction];
    const rotatedArrows = state.activeArrows.map(a =>
      a.id === arrowId
        ? {
            ...a,
            direction: nextDir,
            rotationSteps: (a.rotationSteps || 0) + 1,
          }
        : a
    );

    const nextState: GameEngineState = {
      ...state,
      activeArrows: rotatedArrows,
      totalTaps: nextTotalTaps,
    };

    return { nextState, moveResult };
  }

  // Invalid tap
  const nextState: GameEngineState = {
    ...state,
    totalTaps: nextTotalTaps,
    invalidTaps: state.invalidTaps + 1,
  };

  return { nextState, moveResult };
}

/**
 * Reverts the most recent valid move.
 * Returns the restored state, or the original state if no moves exist.
 */
export function undoLastMove(state: GameEngineState): GameEngineState {
  if (state.moveHistory.length === 0 || state.isCompleted) {
    return state;
  }

  const lastEscapedId = state.moveHistory[state.moveHistory.length - 1];
  const originalArrow = state.level.arrows.find(a => a.id === lastEscapedId);

  if (!originalArrow) {
    return state;
  }

  const nextActiveArrows: ArrowConfig[] = [...state.activeArrows, originalArrow];
  const nextEscaped = state.escapedArrowIds.filter(id => id !== lastEscapedId);
  const nextHistory = state.moveHistory.slice(0, -1);

  return {
    ...state,
    activeArrows: nextActiveArrows,
    escapedArrowIds: nextEscaped,
    moveHistory: nextHistory,
    isCompleted: false,
    starsAwarded: 0,
  };
}

/**
 * Resets the level to initial state.
 */
export function resetGameState(state: GameEngineState): GameEngineState {
  return initializeGameState(state.level);
}
