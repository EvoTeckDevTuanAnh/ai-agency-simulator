export type AgentStateName = 'ENTERING' | 'WALKING_TO_DESK' | 'WORKING' | 'WALKING_AROUND' | 'RETURNING_TO_DESK';

export const WORK_DURATION = 3;
export const SPEED = 2.5;
export const TARGET_THRESHOLD = 0.3;

export interface Target2D {
  x: number;
  z: number;
}

export interface StateData {
  state: AgentStateName;
  target: Target2D;
  timeInState: number;
}

export interface TransitionResult {
  data: StateData;
  transitioned: boolean;
}

export function updateState(
  current: StateData,
  delta: number,
  reachedTarget: boolean,
  desk: Target2D,
  waypoint: Target2D,
): TransitionResult {
  const t = current.timeInState + delta;
  const base = { target: current.target, timeInState: t };

  switch (current.state) {
    case 'ENTERING': {
      if (reachedTarget) {
        return {
          data: { state: 'WALKING_TO_DESK', target: desk, timeInState: 0 },
          transitioned: true,
        };
      }
      return { data: { ...current, ...base }, transitioned: false };
    }

    case 'WALKING_TO_DESK': {
      if (reachedTarget) {
        return {
          data: { state: 'WORKING', target: desk, timeInState: 0 },
          transitioned: true,
        };
      }
      return { data: { ...current, ...base }, transitioned: false };
    }

    case 'WORKING': {
      if (t >= WORK_DURATION) {
        return {
          data: { state: 'WALKING_AROUND', target: waypoint, timeInState: 0 },
          transitioned: true,
        };
      }
      return { data: { ...current, ...base }, transitioned: false };
    }

    case 'WALKING_AROUND': {
      if (reachedTarget) {
        return {
          data: { state: 'RETURNING_TO_DESK', target: desk, timeInState: 0 },
          transitioned: true,
        };
      }
      return { data: { ...current, ...base }, transitioned: false };
    }

    case 'RETURNING_TO_DESK': {
      if (reachedTarget) {
        return {
          data: { state: 'WORKING', target: desk, timeInState: 0 },
          transitioned: true,
        };
      }
      return { data: { ...current, ...base }, transitioned: false };
    }

    default:
      return { data: current, transitioned: false };
  }
}

export function createInitialState(desk: Target2D): StateData {
  return {
    state: 'ENTERING',
    target: { x: 0, z: 6 },
    timeInState: 0,
  };
}
