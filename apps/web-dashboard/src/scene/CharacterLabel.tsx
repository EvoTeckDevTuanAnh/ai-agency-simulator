import { Html } from '@react-three/drei';

interface Props {
  name: string;
  role: string;
  state: string;
  y: number;
}

export function CharacterLabel({ name, role, state, y }: Props) {
  return (
    <Html center position={[0, y, 0]} style={{ pointerEvents: 'none' }}>
      <div
        style={{
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '4px 10px',
          borderRadius: 4,
          fontSize: 12,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>{name}</div>
        <div style={{ color: '#74b4ff', fontSize: 10 }}>{role} · {state}</div>
      </div>
    </Html>
  );
}
