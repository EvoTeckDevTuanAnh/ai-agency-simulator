import { describe, it, expect } from 'vitest';
import {
  updateState,
  createInitialState,
  StateData,
  WORK_DURATION,
  TARGET_THRESHOLD,
  SPEED,
} from '../scene/stateMachine';
import { moveToward } from '../scene/MovementController';

const DESK = { x: -4, z: 0 };
const WP = { x: 5, z: 2 };

function advanceState(
  data: StateData,
  state: string,
  iterations: number = 100,
  dt: number = 0.016,
): { data: StateData; count: number } {
  let current = data;
  let count = 0;
  for (let i = 0; i < iterations; i++) {
    const reached = current.state !== 'WORKING' && (
      current.state === 'ENTERING'
        ? Math.abs(current.target.x - current.target.x) < TARGET_THRESHOLD
        : true
    );
    const result = updateState(current, dt, reached, DESK, WP);
    if (result.data.state !== current.state) count++;
    current = result.data;
  }
  return { data: current, count };
}

describe('StateMachine', () => {
  it('creates initial ENTERING state', () => {
    const s = createInitialState(DESK);
    expect(s.state).toBe('ENTERING');
    expect(s.target).toEqual({ x: 0, z: 6 });
    expect(s.timeInState).toBe(0);
  });

  it('transitions ENTERING → WALKING_TO_DESK when target reached', () => {
    const s = createInitialState(DESK);
    const r = updateState(s, 0.5, true, DESK, WP);
    expect(r.data.state).toBe('WALKING_TO_DESK');
    expect(r.data.target).toEqual(DESK);
    expect(r.data.timeInState).toBe(0);
    expect(r.transitioned).toBe(true);
  });

  it('transitions WALKING_TO_DESK → WORKING when target reached', () => {
    const s: StateData = { state: 'WALKING_TO_DESK', target: DESK, timeInState: 0 };
    const r = updateState(s, 0.5, true, DESK, WP);
    expect(r.data.state).toBe('WORKING');
    expect(r.data.timeInState).toBe(0);
  });

  it('stays in WORKING before duration expires', () => {
    const s: StateData = { state: 'WORKING', target: DESK, timeInState: 1 };
    const r = updateState(s, 1, false, DESK, WP);
    expect(r.data.state).toBe('WORKING');
    expect(r.data.timeInState).toBeCloseTo(2);
    expect(r.transitioned).toBe(false);
  });

  it('transitions WORKING → WALKING_AROUND after duration', () => {
    const s: StateData = { state: 'WORKING', target: DESK, timeInState: WORK_DURATION };
    const r = updateState(s, 0, false, DESK, WP);
    expect(r.data.state).toBe('WALKING_AROUND');
    expect(r.data.target).toEqual(WP);
    expect(r.data.timeInState).toBe(0);
  });

  it('transitions WALKING_AROUND → RETURNING_TO_DESK when target reached', () => {
    const s: StateData = { state: 'WALKING_AROUND', target: WP, timeInState: 0 };
    const r = updateState(s, 0.5, true, DESK, WP);
    expect(r.data.state).toBe('RETURNING_TO_DESK');
    expect(r.data.target).toEqual(DESK);
  });

  it('transitions RETURNING_TO_DESK → WORKING when target reached', () => {
    const s: StateData = { state: 'RETURNING_TO_DESK', target: DESK, timeInState: 0 };
    const r = updateState(s, 0.5, true, DESK, WP);
    expect(r.data.state).toBe('WORKING');
    expect(r.data.target).toEqual(DESK);
  });

  it('produces valid state sequence', () => {
    const validSequence: Record<string, string[]> = {
      'ENTERING': ['WALKING_TO_DESK'],
      'WALKING_TO_DESK': ['WORKING'],
      'WORKING': ['WALKING_AROUND'],
      'WALKING_AROUND': ['RETURNING_TO_DESK'],
      'RETURNING_TO_DESK': ['WORKING'],
    };

    const s = createInitialState(DESK);
    let current = s;
    for (let i = 0; i < 200; i++) {
      const reached = current.state !== 'WORKING';
      const result = updateState(current, 0.1, reached, DESK, WP);
      if (result.transitioned) {
        const allowed = validSequence[current.state];
        expect(allowed).toContain(result.data.state);
      }
      current = result.data;
    }
  });

  it('completes at least 5 cycles in simulation', () => {
    let state = createInitialState(DESK);
    let cycleCount = 0;
    let lastWorkState = 0;
    const totalTime = 60;
    const dt = 0.016;

    for (let t = 0; t < totalTime; t += dt) {
      const reached = state.state !== 'WORKING';
      const result = updateState(state, dt, reached, DESK, WP);
      if (result.transitioned && result.data.state === 'WORKING') {
        cycleCount++;
      }
      state = result.data;
    }

    expect(cycleCount).toBeGreaterThanOrEqual(5);
  });
});

describe('MovementController', () => {
  it('moves toward target', () => {
    const r = moveToward({ x: 0, z: 0 }, { x: 4, z: 0 }, 1);
    expect(r.position.x).toBeGreaterThan(0);
    expect(r.reached).toBe(false);
  });

  it('reaches target when within threshold', () => {
    const r = moveToward({ x: 3.9, z: 0 }, { x: 4, z: 0 }, 0.5);
    expect(r.reached).toBe(true);
    expect(r.position.x).toBe(4);
  });

  it('moves at correct speed', () => {
    const r = moveToward({ x: 0, z: 0 }, { x: 10, z: 0 }, 1);
    const expectedDist = Math.min(10, SPEED * 1);
    expect(r.position.x).toBeCloseTo(expectedDist, 1);
  });
});
