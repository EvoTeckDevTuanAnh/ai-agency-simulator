interface Props {
  position: { x: number; z: number };
}

export function Workstation({ position }: Props) {
  return (
    <group position={[position.x, 0, position.z]}>
      <group position={[0, 0.4, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1.6, 0.08, 1]} />
          <meshStandardMaterial color="#3a4a5a" />
        </mesh>
        <group position={[-0.7, -0.35, -0.4]}>
          <mesh receiveShadow>
            <boxGeometry args={[0.06, 0.6, 0.06]} />
            <meshStandardMaterial color="#2a3a4a" />
          </mesh>
        </group>
        <group position={[0.7, -0.35, -0.4]}>
          <mesh receiveShadow>
            <boxGeometry args={[0.06, 0.6, 0.06]} />
            <meshStandardMaterial color="#2a3a4a" />
          </mesh>
        </group>
        <group position={[-0.7, -0.35, 0.4]}>
          <mesh receiveShadow>
            <boxGeometry args={[0.06, 0.6, 0.06]} />
            <meshStandardMaterial color="#2a3a4a" />
          </mesh>
        </group>
        <group position={[0.7, -0.35, 0.4]}>
          <mesh receiveShadow>
            <boxGeometry args={[0.06, 0.6, 0.06]} />
            <meshStandardMaterial color="#2a3a4a" />
          </mesh>
        </group>
      </group>
      <group position={[-0.5, 0.5, 0.35]}>
        <mesh>
          <boxGeometry args={[0.35, 0.25, 0.02]} />
          <meshStandardMaterial color="#1a2a3a" />
        </mesh>
      </group>
      <group position={[0.5, 0.32, -0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.08, 0.4]} />
          <meshStandardMaterial color="#4a3a2a" />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.35, 0.3, 0.35]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[-0.15, -0.35, -0.15]}>
          <boxGeometry args={[0.04, 0.4, 0.04]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.15, -0.35, -0.15]}>
          <boxGeometry args={[0.04, 0.4, 0.04]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[-0.15, -0.35, 0.15]}>
          <boxGeometry args={[0.04, 0.4, 0.04]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.15, -0.35, 0.15]}>
          <boxGeometry args={[0.04, 0.4, 0.04]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>
    </group>
  );
}
