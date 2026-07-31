import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

const BOUNDS = { minX: -8, maxX: 8, minZ: -6, maxZ: 6 };

export function CameraController() {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handler = () => {
      const t = controls.target;
      t.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, t.x));
      t.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, t.z));
      controls.target.copy(t);
    };

    controls.addEventListener('change', handler);
    return () => {
      controls.removeEventListener('change', handler);
    };
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      enableRotate={false}
      enableZoom={false}
      enablePan={true}
      target={[0, 0, 0]}
      camera={camera}
    />
  );
}
