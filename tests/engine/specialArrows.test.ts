import {
  initializeGameState,
  processTap,
} from '../../src/engine/gameState';
import { LevelData } from '../../src/engine/types';
import { solveLevel } from '../../src/engine/solver';

describe('Special Arrow Mechanics', () => {
  describe('Locked Arrows (Counter-based)', () => {
    const lockedLevel: LevelData = {
      id: 701,
      packId: 'special-test',
      title: 'Counter Lock Test',
      width: 4,
      height: 4,
      arrows: [
        // Ordinary arrow that can escape UP immediately
        { id: 'a1', x: 0, y: 0, direction: 'UP', type: 'NORMAL' },
        // Locked arrow requiring 1 arrow to escape first
        {
          id: 'a_locked',
          x: 2,
          y: 0,
          direction: 'UP',
          type: 'LOCKED',
          lockRequirement: 1,
        },
      ],
    };

    it('prevents locked arrow from escaping before requirement', () => {
      const state0 = initializeGameState(lockedLevel);
      expect(state0.activeArrows.find(a => a.id === 'a_locked')?.isLocked).toBe(true);

      // Tap locked arrow first -> should fail
      const { nextState: state1, moveResult: res1 } = processTap(state0, 'a_locked');
      expect(res1.success).toBe(false);
      expect(state1.activeArrows.length).toBe(2);

      // Escape ordinary arrow first
      const { nextState: state2, moveResult: res2 } = processTap(state1, 'a1');
      expect(res2.success).toBe(true);
      expect(state2.escapedArrowIds).toContain('a1');

      // Locked arrow should now be unlocked!
      const lockedArrowInState2 = state2.activeArrows.find(a => a.id === 'a_locked');
      expect(lockedArrowInState2?.isLocked).toBe(false);

      // Now tap unlocked arrow -> should succeed and complete level!
      const { nextState: state3, moveResult: res3 } = processTap(state2, 'a_locked');
      expect(res3.success).toBe(true);
      expect(state3.isCompleted).toBe(true);
    });

    it('solver finds solution sequence for locked arrows', () => {
      const report = solveLevel(lockedLevel, 1);
      expect(report.isSolvable).toBe(true);
      expect(report.firstSolution).toEqual(['a1', 'a_locked']);
    });
  });

  describe('Key & Lock Pairs', () => {
    const keyLockLevel: LevelData = {
      id: 702,
      packId: 'special-test',
      title: 'Key Lock Test',
      width: 4,
      height: 4,
      arrows: [
        // Key arrow pointing UP (free)
        { id: 'key_1', x: 0, y: 0, direction: 'UP', type: 'KEY', keyTargetId: 'gate_1' },
        // Locked gate arrow pointing UP (free path, but locked until key)
        { id: 'gate_1', x: 2, y: 0, direction: 'UP', type: 'LOCKED', isLocked: true },
      ],
    };

    it('key arrow unlocks target locked arrow upon escape', () => {
      const state0 = initializeGameState(keyLockLevel);

      // Try tapping locked gate -> blocked
      const { moveResult: gateRes } = processTap(state0, 'gate_1');
      expect(gateRes.success).toBe(false);

      // Tap key arrow -> escapes and unlocks gate_1
      const { nextState: state1, moveResult: keyRes } = processTap(state0, 'key_1');
      expect(keyRes.success).toBe(true);

      const gateInState1 = state1.activeArrows.find(a => a.id === 'gate_1');
      expect(gateInState1?.isLocked).toBe(false);

      // Tap gate_1 -> now escapes!
      const { nextState: state2, moveResult: gateRes2 } = processTap(state1, 'gate_1');
      expect(gateRes2.success).toBe(true);
      expect(state2.isCompleted).toBe(true);
    });

    it('solver verifies key and lock level', () => {
      const report = solveLevel(keyLockLevel, 1);
      expect(report.isSolvable).toBe(true);
      expect(report.firstSolution).toEqual(['key_1', 'gate_1']);
    });
  });

  describe('Bomb Arrows', () => {
    const bombLevel: LevelData = {
      id: 703,
      packId: 'special-test',
      title: 'Bomb Detonation Test',
      width: 5,
      height: 5,
      arrows: [
        // Bomb arrow at (2, 0) pointing UP (unblocked to edge)
        { id: 'bomb', x: 2, y: 0, direction: 'UP', type: 'BOMB', bombRadius: 1 },
        // Blocker arrow directly adjacent at (2, 1) pointing LEFT (would block other arrows)
        { id: 'adjacent_blocker', x: 2, y: 1, direction: 'LEFT', type: 'NORMAL' },
      ],
    };

    it('bomb detonation removes adjacent arrows upon escape', () => {
      const state0 = initializeGameState(bombLevel);
      expect(state0.activeArrows.length).toBe(2);

      // Detonate bomb
      const { nextState: state1, moveResult: bombRes } = processTap(state0, 'bomb');
      expect(bombRes.success).toBe(true);

      // Adjacent blocker was detonated and removed!
      expect(state1.activeArrows.length).toBe(0);
      expect(state1.isCompleted).toBe(true);
      expect(state1.escapedArrowIds).toContain('adjacent_blocker');
    });
  });

  describe('Rotating Arrows', () => {
    const rotatingLevel: LevelData = {
      id: 704,
      packId: 'special-test',
      title: 'Rotating Arrow Test',
      width: 4,
      height: 4,
      arrows: [
        // Blocker sitting at (1, 1)
        { id: 'blocker', x: 1, y: 1, direction: 'LEFT' },
        // Rotating arrow at (0, 1) initially pointing RIGHT (hitting blocker at (1,1))
        { id: 'rotator', x: 0, y: 1, direction: 'RIGHT', type: 'ROTATING' },
      ],
    };

    it('rotates 90 degrees clockwise on tap when blocked until clear path', () => {
      const state0 = initializeGameState(rotatingLevel);

      // Initial tap: pointing RIGHT towards blocker -> rotates to DOWN!
      const { nextState: state1, moveResult: res1 } = processTap(state0, 'rotator');
      expect(res1.success).toBe(false);
      const rot1 = state1.activeArrows.find(a => a.id === 'rotator');
      expect(rot1?.direction).toBe('DOWN');

      // Second tap: pointing DOWN (clear to bottom edge!) -> escapes!
      const { nextState: state2, moveResult: res2 } = processTap(state1, 'rotator');
      expect(res2.success).toBe(true);
      expect(state2.escapedArrowIds).toContain('rotator');
    });

    it('solver finds rotating solution', () => {
      const report = solveLevel(rotatingLevel, 1);
      expect(report.isSolvable).toBe(true);
    });
  });
});
