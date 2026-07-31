import { useRef, useState, useCallback } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Group } from 'three';
import { CharacterLabel } from './CharacterLabel';
import { CharacterPopup } from './CharacterPopup';
import { DIRECTOR_DESK } from './navigation';
import type { Agent } from '../types';

function DirectorHumanoid() {
  return (
    <group>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.4]} />
        <meshStandardMaterial color="#9c27b0" />
      </mesh>
      <mesh position={[0, 1.85, 0]} castShadow>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshStandardMaterial color="#f5d6c6" />
      </mesh>
      <mesh position={[-0.45, 1.2, 0]} castShadow>
        <boxGeometry args={[0.18, 0.65, 0.18]} />
        <meshStandardMaterial color="#9c27b0" />
      </mesh>
      <mesh position={[0.45, 1.2, 0]} castShadow>
        <boxGeometry args={[0.18, 0.65, 0.18]} />
        <meshStandardMaterial color="#9c27b0" />
      </mesh>
      <mesh position={[-0.18, 0.35, 0]} castShadow>
        <boxGeometry args={[0.22, 0.55, 0.22]} />
        <meshStandardMaterial color="#2a3a5a" />
      </mesh>
      <mesh position={[0.18, 0.35, 0]} castShadow>
        <boxGeometry args={[0.22, 0.55, 0.22]} />
        <meshStandardMaterial color="#2a3a5a" />
      </mesh>
    </group>
  );
}

interface Props {
  director: Agent;
}

export function DirectorCharacter({ director }: Props) {
  const groupRef = useRef<Group>(null);
  const [popupChar, setPopupChar] = useState<Agent | null>(null);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setPopupChar(director);
  }, [director]);

  return (
    <>
      <group ref={groupRef} position={[DIRECTOR_DESK.x, 0, DIRECTOR_DESK.z]} onClick={handleClick}>
        <DirectorHumanoid />
        <CharacterLabel
          name={director.name}
          role={director.role}
          state="Working"
          y={2.4}
        />
      </group>
      {popupChar && <CharacterPopup character={popupChar} onClose={() => setPopupChar(null)} />}
    </>
  );
}
