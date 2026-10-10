import {
  calculateStars,
  initializeGameState,
  processTap,
  resetGameState,
  undoLastMove,
} from '../../src/engine/gameState';
import { LevelData } from '../../src/engine/types';

describe('Game State Reducer', () => {
  const level: LevelData = {
    id: 1,
    packId: 'test',
    title: 'State Test',
    width: 3,
    height: 3,
    arrows: [
      { id: 'a1', x: 1, y: 0, direction: 'UP' },
      { id: 'a2', x: 1, y: 1, direction: 'UP' },
    ],
  };

  it('calculates stars based on move efficiency', () => {
    // 2 arrows, 2 taps => 3 stars (flawless)
    expect(calculateStars(2, 2)).toBe(3);
    // 2 arrows, 3 taps => 2 stars (within threshold)
    expect(calculateStars(2, 3)).toBe(2);
    // 2 arrows, 10 taps => 1 star (many mistakes)
    expect(calculateStars(2, 10)).toBe(1);
  });

  it('initializes state with active arrows and zero moves', () => {
    const state = initializeGameState(level);

    expect(state.activeArrows.length).toBe(2);
    expect(state.escapedArrowIds).toEqual([]);
    expect(state.totalTaps).toBe(0);
    expect(state.invalidTaps).toBe(0);
    expect(state.isCompleted).toBe(false);
    expect(state.starsAwarded).toBe(0);
  });

  it('handles valid taps and detects completion', () => {
    let state = initializeGameState(level);

    // Tap a1 (valid)
    const action1 = processTap(state, 'a1');
    expect(action1.moveResult.success).toBe(true);
    state = action1.nextState;

    expect(state.activeArrows.map(a => a.id)).toEqual(['a2']);
    expect(state.escapedArrowIds).toEqual(['a1']);
    expect(state.totalTaps).toBe(1);
    expect(state.invalidTaps).toBe(0);
    expect(state.isCompleted).toBe(false);

    // Tap a2 (now valid since a1 left)
    const action2 = processTap(state, 'a2');
    expect(action2.moveResult.success).toBe(true);
    state = action2.nextState;

    expect(state.activeArrows.length).toBe(0);
    expect(state.isCompleted).toBe(true);
    expect(state.starsAwarded).toBe(3);

    // Tap when already completed returns state unchanged
    const afterComplete = processTap(state, 'a1');
    expect(afterComplete.nextState).toBe(state);
  });

  it('increments invalidTaps on blocked moves', () => {
    const state = initializeGameState(level);

    // Tap a2 first (blocked by a1)
    const action = processTap(state, 'a2');
    expect(action.moveResult.success).toBe(false);

    const next = action.nextState;
    expect(next.activeArrows.length).toBe(2);
    expect(next.totalTaps).toBe(1);
    expect(next.invalidTaps).toBe(1);
    expect(next.isCompleted).toBe(false);
  });

  it('reverts valid moves on undo', () => {
    let state = initializeGameState(level);
    // Undo on empty history returns same state
    expect(undoLastMove(state)).toBe(state);

    const action1 = processTap(state, 'a1');
    state = action1.nextState;

    expect(state.escapedArrowIds).toEqual(['a1']);
    expect(state.activeArrows.length).toBe(1);

    state = undoLastMove(state);
    expect(state.escapedArrowIds).toEqual([]);
    expect(state.activeArrows.length).toBe(2);
    expect(state.moveHistory).toEqual([]);
  });

  it('handles undo when completed or invalid arrow id in history', () => {
    let state = initializeGameState(level);
    state = processTap(state, 'a1').nextState;
    state = processTap(state, 'a2').nextState;
    expect(state.isCompleted).toBe(true);
    expect(undoLastMove(state)).toBe(state);

    const corruptState = {
      ...initializeGameState(level),
      moveHistory: ['nonexistent_id'],
    };
    expect(undoLastMove(corruptState)).toBe(corruptState);
  });

  it('resets level cleanly', () => {
    let state = initializeGameState(level);
    state = processTap(state, 'a1').nextState;
    state = resetGameState(state);

    expect(state.activeArrows.length).toBe(2);
    expect(state.totalTaps).toBe(0);
  });
});
