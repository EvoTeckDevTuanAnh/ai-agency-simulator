import type { Target2D } from './stateMachine';
import { SPEED, TARGET_THRESHOLD } from './stateMachine';

export interface Position2D {
  x: number;
  z: number;
}

export const COLLISION_DIST = 0.8;

export function moveToward(
  current: Position2D,
  target: Target2D,
  delta: number,
  allPositions?: Map<string, Position2D>,
  myId?: string,
): { position: Position2D; reached: boolean } {
  const dx = target.x - current.x;
  const dz = target.z - current.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist <= TARGET_THRESHOLD) {
    return { position: { x: target.x, z: target.z }, reached: true };
  }

  const step = SPEED * delta;
  if (step >= dist) {
    return { position: { x: target.x, z: target.z }, reached: true };
  }

  let moveX = (dx / dist) * step;
  let moveZ = (dz / dist) * step;

  if (allPositions && myId) {
    const newPos = { x: current.x + moveX, z: current.z + moveZ };
    for (const [id, pos] of allPositions) {
      if (id === myId) continue;
      const cd = current.x - pos.x;
      const cz = current.z - pos.z;
      const curDist = Math.sqrt(cd * cd + cz * cz);
      if (curDist < COLLISION_DIST && curDist > 0.01) {
        const push = (COLLISION_DIST - curDist) * 0.5;
        newPos.x += (cd / curDist) * push;
        newPos.z += (cz / curDist) * push;
        moveX = newPos.x - current.x;
        moveZ = newPos.z - current.z;
      }
    }
    return {
      position: { x: current.x + moveX, z: current.z + moveZ },
      reached: false,
    };
  }

  return {
    position: { x: current.x + moveX, z: current.z + moveZ },
    reached: false,
  };
}

export function faceTarget(current: Position2D, target: Target2D): number {
  return Math.atan2(target.x - current.x, target.z - current.z);
}
