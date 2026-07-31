import { describe, it, expect, beforeEach } from 'vitest';
import { getWorkstationPosition, WORKSTATION_POSITIONS, MAX_SLOTS } from '../scene/navigation';
import { moveToward, COLLISION_DIST } from '../scene/MovementController';
import { createInitialState, updateState } from '../scene/stateMachine';

function createSlotSystem() {
  const slotMap = new Map<string, number>();
  const usedSlots = new Set<number>();

  function assignSlot(id: string): number {
    if (slotMap.has(id)) return slotMap.get(id)!;
    for (let i = 0; i < MAX_SLOTS; i++) {
      if (!usedSlots.has(i)) {
        slotMap.set(id, i);
        usedSlots.add(i);
        return i;
      }
    }
    return -1;
  }

  function removeSlot(id: string) {
    const slot = slotMap.get(id);
    if (slot !== undefined) {
      usedSlots.delete(slot);
      slotMap.delete(id);
    }
  }

  return { assignSlot, removeSlot, slotMap, usedSlots };
}

describe('MultiAgent - slot system', () => {
  it('assigns unique slots to 5 agents', () => {
    const { assignSlot } = createSlotSystem();
    const slots = new Set<number>();
    for (let i = 0; i < 5; i++) {
      const s = assignSlot(`agent-${i}`);
      expect(slots.has(s)).toBe(false);
      slots.add(s);
    }
    expect(slots.size).toBe(5);
  });

  it('workstation positions are unique', () => {
    const positions = WORKSTATION_POSITIONS.map(p => `${p.x},${p.z}`);
    const uniquePositions = new Set(positions);
    expect(uniquePositions.size).toBe(WORKSTATION_POSITIONS.length);
    expect(WORKSTATION_POSITIONS.length).toBe(MAX_SLOTS);
  });

  it('slot is freed when agent is removed', () => {
    const { assignSlot, removeSlot } = createSlotSystem();
    const s1 = assignSlot('a');
    const s2 = assignSlot('b');
    removeSlot('a');
    const s3 = assignSlot('c');
    expect(s3).toBe(s1);
    expect(s2).not.toBe(s3);
  });

  it('frees middle slot and reuses it', () => {
    const { assignSlot, removeSlot } = createSlotSystem();
    const slots = ['a', 'b', 'c', 'd', 'e'].map(id => assignSlot(id));
    removeSlot('c');
    const newSlot = assignSlot('f');
    expect(newSlot).toBe(slots[2]);
  });

  it('returns -1 when all slots full', () => {
    const { assignSlot } = createSlotSystem();
    for (let i = 0; i < 5; i++) {
      assignSlot(`agent-${i}`);
    }
    expect(assignSlot('overflow')).toBe(-1);
  });

  it('removed agents do not affect remaining workstation positions', () => {
    const { assignSlot, removeSlot } = createSlotSystem();
    const ids = ['a', 'b', 'c', 'd', 'e'];
    ids.forEach(id => assignSlot(id));
    const beforePositions = ids.map(id => getWorkstationPosition(assignSlot(id)));
    removeSlot('c');
    const remaining = ids.filter(id => id !== 'c');
    const afterPositions = remaining.map(id => getWorkstationPosition(assignSlot(id)));
    for (let i = 0; i < 4; i++) {
      if (i >= 2) {
        expect(afterPositions[i]).toEqual(beforePositions[i + 1]);
      } else {
        expect(afterPositions[i]).toEqual(beforePositions[i]);
      }
    }
  });
});

describe('MultiAgent - collision avoidance', () => {
  it('two agents moving apart do not collide', () => {
    const pos1 = { x: 0, z: 0 };
    const pos2 = { x: 2, z: 0 };
    const allPos = new Map<string, typeof pos1>();
    allPos.set('a', pos1);
    allPos.set('b', pos2);

    const r1 = moveToward(pos1, { x: 3, z: 0 }, 0.016, allPos, 'a');
    const r2 = moveToward(pos2, { x: 5, z: 0 }, 0.016, allPos, 'b');

    expect(r1.position.x).toBeGreaterThan(0);
    expect(r2.position.x).toBeGreaterThan(2);
  });

  it('agents near each other get pushed apart', () => {
    const pos1 = { x: 0, z: 0 };
    const pos2 = { x: 0.5, z: 0 };
    const allPos = new Map<string, typeof pos1>();
    allPos.set('a', pos1);
    allPos.set('b', pos2);

    const r1 = moveToward(pos1, { x: 3, z: 0 }, 0.016, allPos, 'a');
    expect(r1.position.x).toBeLessThan(0);
  });

  it('reaches target correctly', () => {
    const r = moveToward({ x: 3.9, z: 0 }, { x: 4, z: 0 }, 0.5);
    expect(r.reached).toBe(true);
    expect(r.position.x).toBe(4);
  });

  it('all 5 agents can move independently', () => {
    const agents = Array.from({ length: 5 }, (_, i) => ({
      id: `a${i}`,
      pos: { x: i * 2, z: 0 },
      target: { x: i * 2 + 5, z: 0 },
    }));

    const allPos = new Map(agents.map(a => [a.id, a.pos]));

    for (let step = 0; step < 200; step++) {
      for (const agent of agents) {
        const r = moveToward(agent.pos, agent.target, 0.016, allPos, agent.id);
        agent.pos = r.position;
        allPos.set(agent.id, r.position);
      }
    }

    for (const agent of agents) {
      const dx = Math.abs(agent.pos.x - agent.target.x);
      const dz = Math.abs(agent.pos.z - agent.target.z);
      expect(dx + dz).toBeLessThan(2);
    }
  });
});

describe('MultiAgent - 5-agent simulation', () => {
  it('all agents complete at least 3 cycles without stalls', () => {
    const agents = Array.from({ length: 5 }, (_, i) => ({
      id: `a${i}`,
      desk: getWorkstationPosition(i),
      waypoint: i % 2 === 0 ? { x: 5, z: 2 } : { x: -5, z: -1 },
      state: createInitialState({ x: 0, z: 6 }),
      pos: { x: 0, z: 7.5 - i * 0.3 },
      cycles: 0,
    }));

    const allPos = new Map(agents.map(a => [a.id, a.pos]));
    const totalTime = 60;
    const dt = 0.016;

    for (let t = 0; t < totalTime; t += dt) {
      for (const agent of agents) {
        allPos.set(agent.id, agent.pos);
      }

      for (const agent of agents) {
        const reached = agent.state.state !== 'WORKING';
        const result = updateState(agent.state, dt, reached, agent.desk, agent.waypoint);

        const moved = moveToward(agent.pos, result.data.target, dt, allPos, agent.id);
        agent.pos = moved.position;
        allPos.set(agent.id, moved.position);

        if (result.transitioned && result.data.state === 'WORKING') {
          agent.cycles++;
        }
        agent.state = result.data;
      }
    }

    for (const agent of agents) {
      expect(agent.cycles).toBeGreaterThanOrEqual(3);
    }
  });
});
