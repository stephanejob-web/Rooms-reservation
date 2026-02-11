import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Text, Float, Edges, Environment } from '@react-three/drei';
import { useState, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

interface Room {
    id: number;
    nom: string;
    capacite: number;
    localisation?: string;
    image?: string;
}

interface RoomStatus {
    type: 'available' | 'reserved';
    label?: string;
}

interface ThreeDFloorPlanProps {
    rooms: Room[];
    reservations?: any[];
}

const WoodTable = ({ scale = 1 }: { scale?: number }) => (
    <group scale={scale}>
        {/* Top */}
        <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.5, 0.08, 0.9]} />
            <meshStandardMaterial color="#5e2607" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Legs */}
        {[[0.6, 0.4], [0.6, -0.4], [-0.6, 0.4], [-0.6, -0.4]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.225, z]} castShadow>
                <cylinderGeometry args={[0.04, 0.03, 0.45]} />
                <meshStandardMaterial color="#2d1305" />
            </mesh>
        ))}
    </group>
);

const OfficeChair = ({ position, rotation, isOccupied }: { position: [number, number, number], rotation: number, isOccupied: boolean }) => (
    <group position={position} rotation={[0, rotation, 0]} scale={0.42}>
        {/* Seat */}
        <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.45, 0.08, 0.45]} />
            <meshStandardMaterial color={isOccupied ? "#1e293b" : "#475569"} metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Back */}
        <mesh position={[0, 0.7, -0.2]} rotation={[0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.4, 0.55, 0.06]} />
            <meshStandardMaterial color={isOccupied ? "#0f172a" : "#334155"} />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.4]} />
            <meshStandardMaterial color="#020617" />
        </mesh>
        <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.04]} />
            <meshStandardMaterial color="#020617" />
        </mesh>
    </group>
);

const CeilingLamp = ({ isOccupied }: { isOccupied: boolean }) => (
    <group position={[0, 1.45, 0]}>
        {/* Lamp Base */}
        <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.3, 0.35, 0.05, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Light Source (Visual) */}
        <mesh position={[0, -0.02, 0]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.15, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
                color="#ffffff"
                emissive={isOccupied ? "#ffdce0" : "#ffffff"}
                emissiveIntensity={1.5}
            />
        </mesh>
    </group>
);

const PottedPlant = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        {/* Modern Architectural Pot */}
        <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.18, 0.12, 0.4, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* Lush Foliage - Layered for a "Magnificent" look */}
        <group position={[0, 0.4, 0]}>
            {/* Main Central Stem */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.015, 0.02, 0.6, 8]} />
                <meshStandardMaterial color="#3f6212" />
            </mesh>

            {/* Spread Leaf Clusters - Explicitly typed for TS */}
            {([
                { pos: [0.1, 0.3, 0.1], rot: [0.4, 0, 0.4], scale: [1, 0.8, 1], color: "#065f46" },
                { pos: [-0.15, 0.25, 0.05], rot: [-0.5, 0, -0.2], scale: [0.9, 0.7, 0.9], color: "#047857" },
                { pos: [0.05, 0.2, -0.15], rot: [0.2, 0, -0.6], scale: [1.1, 0.9, 1.1], color: "#059669" },
                { pos: [0.12, 0.45, -0.05], rot: [0.8, 0.5, 0.2], scale: [0.8, 1.2, 0.8], color: "#10b981" },
                { pos: [-0.1, 0.4, -0.1], rot: [-0.3, 1.2, 0.5], scale: [1, 1, 1], color: "#34d399" }
            ] as const).map((leaf, i) => (
                <mesh
                    key={i}
                    position={leaf.pos as [number, number, number]}
                    rotation={leaf.rot as [number, number, number]}
                    scale={leaf.scale as [number, number, number]}
                >
                    <sphereGeometry args={[0.15, 12, 8]} />
                    <meshStandardMaterial color={leaf.color} roughness={0.8} />
                </mesh>
            ))}
        </group>
    </group>
);

const AirConditioner = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) => (
    <group position={position} rotation={rotation}>
        {/* Main Unit */}
        <mesh castShadow>
            <boxGeometry args={[0.8, 0.25, 0.15]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Vent Grill */}
        <mesh position={[0, -0.08, 0.05]}>
            <boxGeometry args={[0.7, 0.02, 0.08]} />
            <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 0.08, 0.06]}>
            <boxGeometry args={[0.1, 0.04, 0.02]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
        </mesh>
    </group>
);

const RoomBlock = ({
    room,
    status,
    position,
    onSelect
}: {
    room: Room;
    status: RoomStatus;
    position: [number, number, number];
    onSelect: () => void;
}) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [hovered, setHovered] = useState(false);
    const isAvailable = status.type === 'available';

    // Animation on hover
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();
            meshRef.current.position.y = position[1] + (hovered ? Math.sin(time * 4) * 0.1 + 0.1 : 0);
            meshRef.current.scale.setScalar(hovered ? 1.02 : 1);
        }
    });

    // Procedural furniture arrangement
    const chairs = useMemo(() => {
        const count = room.capacite || 4;
        const result = [];
        const radius = 0.92;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            result.push({
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                angle: angle + Math.PI // Faces the center (origin)
            });
        }
        return result;
    }, [room.capacite]);

    const statusColor = isAvailable ? '#10b981' : '#f43f5e';

    return (
        <group position={position}>
            {/* Main Room Volume - Optimized Material */}
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={onSelect}
                castShadow
            >
                <boxGeometry args={[2.5, 1.5, 2.5]} />
                <meshStandardMaterial
                    color={statusColor}
                    emissive={statusColor}
                    emissiveIntensity={hovered ? 0.8 : 0.2}
                    transparent
                    opacity={hovered ? 0.25 : 0.15}
                    roughness={0.1}
                    metalness={0.2}
                />
                <Edges
                    scale={1}
                    threshold={15}
                    color={statusColor}
                    opacity={0.5}
                    transparent
                />
            </mesh>

            {/* Visual Ceiling Lamp - Matches room status */}
            <CeilingLamp isOccupied={!isAvailable} />

            {/* Furniture & Decor inside */}
            <group position={[0, -0.72, 0]}>
                {/* Visual spotlight from ceiling lamp - Fixed crash & improved lighting */}
                <spotLight
                    position={[0, 2.1, 0]}
                    intensity={25} // High intensity for "belle eclairage"
                    angle={0.45}
                    penumbra={1}
                    color="#fff4e0" // Warm architectural light
                    distance={10}
                    decay={1.2}
                />

                {/* Point light for soft room fill */}
                <pointLight
                    position={[0, 1.2, 0]}
                    intensity={5}
                    color={isAvailable ? "#ffffff" : "#ffdce0"}
                    distance={4}
                    decay={2}
                />

                <WoodTable scale={0.8} />
                {chairs.map((c: { x: number, z: number, angle: number }, i: number) => (
                    <OfficeChair
                        key={i}
                        position={[c.x, 0, c.z]}
                        rotation={c.angle}
                        isOccupied={!isAvailable}
                    />
                ))}

                {/* Decorative Elements */}
                <PottedPlant position={[1, 0, 1]} />
                <PottedPlant position={[-1, 0, -1]} />
                <AirConditioner position={[0, 1.35, -1.15]} />
            </group>

            {/* Room Name Label */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                <Text
                    position={[0, 1.3, 0]}
                    fontSize={0.25}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.01}
                    outlineColor="#000000"
                >
                    {room.nom}
                </Text>
            </Float>

            {/* Capacity Status */}
            <Text
                position={[0, 0, 1.35]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.16}
                color="white"
            >
                {room.capacite} pax.
            </Text>

            {/* Floor Aura */}
            <mesh position={[0, -0.745, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[3, 3]} />
                <meshBasicMaterial
                    color={statusColor}
                    transparent
                    opacity={hovered ? 0.3 : 0.1}
                />
            </mesh>
        </group>
    );
};

export default function ThreeDFloorPlan({ rooms, reservations = [] }: ThreeDFloorPlanProps) {
    const navigate = useNavigate();

    const getRoomStatus = (roomId: number): RoomStatus => {
        const now = new Date();
        const roomRes = reservations
            .filter(r => r.salle?.id === roomId && r.statut === 'CONFIRMEE')
            .sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_fin).getTime());

        const current = roomRes.find(r =>
            new Date(r.date_debut) <= now && new Date(r.date_fin) >= now
        );

        if (current) return { type: 'reserved', label: 'Occupée' };
        return { type: 'available', label: 'Libre' };
    };

    const half = Math.ceil(rooms.length / 2);
    const topRooms = rooms.slice(0, half);
    const bottomRooms = rooms.slice(half);

    return (
        <div className="w-full h-[650px] bg-slate-950 rounded-[40px] overflow-hidden shadow-2xl relative border-4 border-slate-900">
            {/* 3D Scene */}
            <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
                <PerspectiveCamera makeDefault position={[14, 12, 14]} fov={35} />
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    maxPolarAngle={Math.PI / 2.2}
                    minDistance={8}
                    maxDistance={25}
                    makeDefault
                />

                {/* Realistic Environment Lighting */}
                <Environment preset="city" />

                <ambientLight intensity={1.5} />
                <spotLight
                    position={[15, 25, 15]}
                    angle={0.3}
                    penumbra={1}
                    intensity={8}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />

                {/* Global Fill Lights */}
                <pointLight position={[-15, 10, -15]} intensity={3} color="#4f46e5" />
                <pointLight position={[15, 5, -15]} intensity={3} color="#0d9488" />

                {/* Ground Plane */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]} receiveShadow>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#020617" roughness={0.6} metalness={0.4} />
                </mesh>

                {/* Luxury Grid */}
                <gridHelper args={[50, 50, '#1e293b', '#0f172a']} position={[0, -0.74, 0]} />

                {/* Rooms Matrix */}
                <group>
                    {topRooms.map((room, i) => (
                        <RoomBlock
                            key={room.id}
                            room={room}
                            status={getRoomStatus(room.id)}
                            position={[(i - (topRooms.length - 1) / 2) * 5.5, 0, -4]}
                            onSelect={() => navigate(`/rooms/${room.id}/book`)}
                        />
                    ))}

                    {/* Corridor Base */}
                    <mesh position={[0, -0.73, 0]} receiveShadow>
                        <boxGeometry args={[45, 0.04, 3.5]} />
                        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.5} />
                    </mesh>

                    {bottomRooms.map((room, i) => (
                        <RoomBlock
                            key={room.id}
                            room={room}
                            status={getRoomStatus(room.id)}
                            position={[(i - (bottomRooms.length - 1) / 2) * 5.5, 0, 4]}
                            onSelect={() => navigate(`/rooms/${room.id}/book`)}
                        />
                    ))}
                </group>

                {/* Optimized Contact Shadows */}
                <ContactShadows
                    position={[0, -0.74, 0]}
                    resolution={512} // Reduced
                    scale={50}
                    blur={2}
                    opacity={0.5}
                    far={20}
                />
            </Canvas>

            {/* UI HUD Overlay */}
            <div className="absolute top-8 left-8 pointer-events-none">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30 backdrop-blur-md">
                        <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">3D Engine Optimized</span>
                    </div>
                </div>
                <h3 className="text-white text-3xl font-black tracking-tighter drop-shadow-2xl">
                    VIRTUAL <span className="text-indigo-500">OFFICE</span>
                </h3>
            </div>

            <div className="absolute top-8 right-8">
                <div className="flex flex-col gap-2 p-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.6)]" />
                        <span className="text-white/90 text-xs font-bold uppercase tracking-wider">Libre</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
                        <span className="text-white/90 text-xs font-bold uppercase tracking-wider">Occupée</span>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-0.5 bg-white/10 rounded text-[10px] text-white/50 font-mono">L-Click</kbd>
                        <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Orbit</span>
                    </div>
                    <div className="w-px h-3 bg-white/20" />
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-0.5 bg-white/10 rounded text-[10px] text-white/50 font-mono">Scroll</kbd>
                        <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Zoom</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
