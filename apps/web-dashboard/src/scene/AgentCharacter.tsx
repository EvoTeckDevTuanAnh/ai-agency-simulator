import { useRef, useState, useCallback } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import type { Group } from 'three';
import { CharacterLabel } from './CharacterLabel';
import { CharacterPopup } from './CharacterPopup';
import { Workstation } from './Workstation';
import { updateState, createInitialState, StateData } from './stateMachine';
import { moveToward, faceTarget, Position2D } from './MovementController';
import { getWorkstationPosition, pickWaypoint, CharacterData } from './navigation';

const ROLE_COLORS: Record<string, string> = {
  DEVELOPER: '#4a7cff',
  DESIGNER: '#ff6b9d',
  TESTER: '#ffc107',
  DEVOPS: '#00c853',
  DIRECTOR: '#9c27b0',
};

function SimpleHumanoid({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.35]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color="#f5d6c6" />
      </mesh>
      <mesh position={[-0.4, 1.2, 0]} castShadow>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.4, 1.2, 0]} castShadow>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.15, 0.35, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color="#2a3a5a" />
      </mesh>
      <mesh position={[0.15, 0.35, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color="#2a3a5a" />
      </mesh>
    </group>
  );
}

interface Props {
  character: CharacterData;
  waypointSeed: number;
  allPositions: React.MutableRefObject<Map<string, Position2D>>;
}

export function AgentCharacter({ character, waypointSeed, allPositions }: Props) {
  const groupRef = useRef<Group>(null);
  const { slot } = character;
  const desk = getWorkstationPosition(slot);
  const stateRef = useRef<StateData>(createInitialState({ x: 0, z: 6 }));
  const posRef = useRef({ x: 0, z: 7.5 });
  const rotationRef = useRef(0);
  const waypointRef = useRef(pickWaypoint(waypointSeed));
  const [displayState, setDisplayState] = useState('ENTERING');
  const [popupChar, setPopupChar] = useState<CharacterData | null>(null);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setPopupChar(character);
  }, [character]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = stateRef.current;
    const pos = posRef.current;
    const wp = waypointRef.current;

    const moved = moveToward(pos, s.target, dt, allPositions.current, character.id);
    posRef.current = moved.position;
    allPositions.current.set(character.id, moved.position);

    rotationRef.current = faceTarget(pos, s.target);

    const result = updateState(s, dt, moved.reached, desk, wp);
    stateRef.current = result.data;

    if (result.data.state !== s.state) {
      setDisplayState(result.data.state);
    }

    const g = groupRef.current;
    if (g) {
      g.position.x = moved.position.x;
      g.position.z = moved.position.z;
      g.rotation.y = rotationRef.current;
    }
  });

  return (
    <>
      <Workstation position={desk} />
      <group ref={groupRef} position={[posRef.current.x, 0, posRef.current.z]} onClick={handleClick}>
        <SimpleHumanoid color={ROLE_COLORS[character.role] ?? '#888'} />
        <CharacterLabel
          name={character.name}
          role={character.role}
          state={displayState}
          y={2.3}
        />
      </group>
      {popupChar && <CharacterPopup character={popupChar} onClose={() => setPopupChar(null)} />}
    </>
  );
}
