/**
 * Arrow Escape — Game State Reducer & Manager
 * Pure immutable state transitions.
 */

import { ArrowConfig, GameEngineState, LevelData, MoveResult } from './types';
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

/**
 * Initializes fresh game engine state for a level.
 */
export function initializeGameState(level: LevelData): GameEngineState {
  return {
    level,
    activeArrows: [...level.arrows],
    escapedArrowIds: [],
    moveHistory: [],
    totalTaps: 0,
    invalidTaps: 0,
    isCompleted: false,
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

  const moveResult = evaluateMove(
    arrowId,
    state.activeArrows,
    state.level.width,
    state.level.height
  );

  const nextTotalTaps = state.totalTaps + 1;

  if (moveResult.success) {
    const nextEscaped = [...state.escapedArrowIds, arrowId];
    const nextHistory = [...state.moveHistory, arrowId];
    const isCompleted = moveResult.remainingArrows.length === 0;
    const starsAwarded = isCompleted
      ? calculateStars(state.level.arrows.length, nextTotalTaps)
      : 0;

    const nextState: GameEngineState = {
      ...state,
      activeArrows: moveResult.remainingArrows,
      escapedArrowIds: nextEscaped,
      moveHistory: nextHistory,
      totalTaps: nextTotalTaps,
      isCompleted,
      starsAwarded,
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
