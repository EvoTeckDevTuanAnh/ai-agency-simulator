

const FLOOR_SIZE: [number, number] = [20, 16];
const WALL_HEIGHT = 4;
const EPS = 0.01;

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={FLOOR_SIZE} />
      <meshStandardMaterial color="#2a2a3a" />
    </mesh>
  );
}

function Wall({ pos, size, color = '#3a3a4a' }: { pos: [number, number, number]; size: [number, number]; color?: string }) {
  return (
    <mesh position={pos} receiveShadow castShadow>
      <boxGeometry args={[size[0], size[1], 0.15]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function DoorWall() {
  const doorWidth = 2;
  const doorHeight = 3;
  const wallWidth = FLOOR_SIZE[0];
  const leftWidth = (wallWidth - doorWidth) / 2;

  return (
    <group>
      <Wall pos={[-wallWidth / 2 + leftWidth / 2, WALL_HEIGHT / 2, FLOOR_SIZE[1] / 2]} size={[leftWidth, WALL_HEIGHT]} />
      <Wall pos={[wallWidth / 2 - leftWidth / 2, WALL_HEIGHT / 2, FLOOR_SIZE[1] / 2]} size={[leftWidth, WALL_HEIGHT]} />
      <Wall pos={[0, WALL_HEIGHT - doorHeight / 2, FLOOR_SIZE[1] / 2]} size={[doorWidth + EPS, doorHeight]} />
    </group>
  );
}

function DirectorRoom() {
  const roomDepth = 5;
  const roomWidth = 7;
  const roomZ = -FLOOR_SIZE[1] / 2 + roomDepth / 2;
  const roomX = -FLOOR_SIZE[0] / 2 + roomWidth / 2 + 0.5;

  return (
    <group>
      <Wall pos={[-FLOOR_SIZE[0] / 2, WALL_HEIGHT / 2, roomZ]} size={[0.15, WALL_HEIGHT]} color="#4a3a5a" />
      <Wall pos={[roomX + roomWidth / 2, WALL_HEIGHT / 2, roomZ]} size={[0.15, WALL_HEIGHT]} color="#4a3a5a" />
      <Wall pos={[roomX, WALL_HEIGHT / 2, -FLOOR_SIZE[1] / 2 + roomDepth]} size={[roomWidth, WALL_HEIGHT]} color="#4a3a5a" />
    </group>
  );
}

function DirectorDesk() {
  return (
    <group position={[-FLOOR_SIZE[0] / 2 + 0.5 + 3.5, 0.5, -FLOOR_SIZE[1] / 2 + 2.5]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[2.5, 0.15, 1.5]} />
        <meshStandardMaterial color="#5a4a3a" />
      </mesh>
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[2.4, 0.55, 1.4]} />
        <meshStandardMaterial color="#4a3a2a" />
      </mesh>
    </group>
  );
}

export function OfficeGeometry() {
  const hw = FLOOR_SIZE[0] / 2;
  const hd = FLOOR_SIZE[1] / 2;

  return (
    <group>
      <Floor />
      <Wall pos={[0, WALL_HEIGHT / 2, -hd]} size={[FLOOR_SIZE[0], WALL_HEIGHT]} />
      <Wall pos={[-hw, WALL_HEIGHT / 2, 0]} size={[FLOOR_SIZE[1], WALL_HEIGHT]} />
      <Wall pos={[hw, WALL_HEIGHT / 2, 0]} size={[FLOOR_SIZE[1], WALL_HEIGHT]} />
      <DoorWall />
      <DirectorRoom />
      <DirectorDesk />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 6]} intensity={0.7} castShadow />
      <directionalLight position={[-6, 10, -4]} intensity={0.3} />
    </group>
  );
}
