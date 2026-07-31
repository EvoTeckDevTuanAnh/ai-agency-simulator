import type { Agent } from '../types';

export const DOOR_POS = { x: 0, z: 7.5 };
export const INSIDE_DOOR = { x: 0, z: 6 };

export const WORKSTATION_POSITIONS: { x: number; z: number }[] = [
  { x: -4, z: 0 },
  { x: 0, z: 0 },
  { x: 4, z: 0 },
  { x: -2, z: -3.5 },
  { x: 2, z: -3.5 },
];

export const DIRECTOR_DESK = { x: -6.5, z: -5.5 };

export const WAYPOINTS = [
  { x: -6, z: 2 },
  { x: 6, z: 2 },
  { x: 5, z: -2 },
  { x: -5, z: -1 },
  { x: 0, z: 4 },
  { x: 7, z: 4 },
];

export function getWorkstationPosition(slot: number) {
  return WORKSTATION_POSITIONS[slot % WORKSTATION_POSITIONS.length];
}

export function pickWaypoint(seed: number) {
  return WAYPOINTS[seed % WAYPOINTS.length];
}

export type CharacterData = Agent & {
  slot: number;
};

export const MAX_SLOTS = 5;
