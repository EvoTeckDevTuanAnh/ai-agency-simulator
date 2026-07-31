import { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { OfficeGeometry } from './OfficeGeometry';
import { DirectorCharacter } from './DirectorCharacter';
import { AgentCharacter } from './AgentCharacter';
import { getAgents } from '../api/client';
import type { Agent } from '../types';
import type { CharacterData } from './navigation';
import type { Position2D } from './MovementController';

export function Scene() {
  const [director, setDirector] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<CharacterData[]>([]);
  const [loading, setLoading] = useState(true);
  const slotMapRef = useRef<Map<string, number>>(new Map());
  const allPositions = useRef(new Map<string, Position2D>());

  useEffect(() => {
    getAgents()
      .then(list => {
        const dir = list.find(a => a.role === 'DIRECTOR');
        if (dir) setDirector(dir);
        const nonDir = list.filter(a => a.role !== 'DIRECTOR');
        const slotMap = slotMapRef.current;
        const usedSlots = new Set(slotMap.values());
        for (const a of nonDir) {
          if (!slotMap.has(a.id)) {
            for (let i = 0; i < 5; i++) {
              if (!usedSlots.has(i)) {
                slotMap.set(a.id, i);
                usedSlots.add(i);
                break;
              }
            }
          }
        }
        const removed = new Set(nonDir.map(a => a.id));
        for (const [id] of slotMap) {
          if (!removed.has(id)) slotMap.delete(id);
        }
        setAgents(nonDir.map(a => ({ ...a, slot: slotMap.get(a.id) ?? 0 })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 14, 12], fov: 50, near: 0.1, far: 50 }}
      shadows
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <CameraController />
      <OfficeGeometry />
      {!loading && director && (
        <DirectorCharacter director={director} />
      )}
      {!loading && agents.map(a => (
        <AgentCharacter key={a.id} character={a} waypointSeed={a.slot * 7 + 3} allPositions={allPositions} />
      ))}
    </Canvas>
  );
}
