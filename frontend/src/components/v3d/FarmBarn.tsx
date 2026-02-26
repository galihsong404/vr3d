'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTerrainHeight } from './Terrain';

/* ───────────────────────────────────────────
   AAA Farm Barn
   Complex, MASSIVE structure with realistic weathered colors.
   Length (Z-axis) is 2x the Width (X-axis).
   Width = 18, Length = 36.
   ─────────────────────────────────────────── */

function HayBale({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh castShadow rotation={[Math.PI / 2, 0, Math.random() * Math.PI]}>
                <cylinderGeometry args={[0.5, 0.5, 0.8, 32]} />
                <meshPhysicalMaterial color="#bda055" roughness={0.9} clearcoat={0.01} />
            </mesh>
            {/* Hay ring detail */}
            <mesh rotation={[Math.PI / 2, 0, Math.random() * Math.PI]}>
                <torusGeometry args={[0.5, 0.03, 12, 32]} />
                <meshPhysicalMaterial color="#947a38" roughness={0.95} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, Math.random() * Math.PI]} position={[0, 0.2, 0]}>
                <torusGeometry args={[0.5, 0.03, 12, 32]} />
                <meshPhysicalMaterial color="#947a38" roughness={0.95} />
            </mesh>
        </group>
    );
}

function ConcreteSilo({ position }: { position: [number, number, number] }) {
    const baseY = getTerrainHeight(position[0], position[2]);
    return (
        <group position={[position[0], baseY + 8, position[2]]}>
            {/* Main concrete base */}
            <mesh castShadow>
                <cylinderGeometry args={[3, 3, 16, 48]} />
                <meshPhysicalMaterial color="#7a7c7c" roughness={0.8} clearcoat={0.0} />
            </mesh>
            {/* Metallic Dome top */}
            <mesh position={[0, 8, 0]} castShadow>
                <sphereGeometry args={[3.05, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshPhysicalMaterial color="#d4d4d4" roughness={0.25} metalness={0.7} clearcoat={0.2} />
            </mesh>
            {/* Metal Ring bands */}
            {[-6, -3, 0, 3, 6, 7.5].map((y, i) => (
                <mesh key={i} position={[0, y, 0]}>
                    <torusGeometry args={[3.02, 0.08, 16, 64]} />
                    <meshPhysicalMaterial color="#555555" roughness={0.3} metalness={0.8} />
                </mesh>
            ))}
            {/* Access Ladder chute */}
            <mesh position={[2.9, 0, 0]} castShadow>
                <boxGeometry args={[0.6, 15.5, 0.6]} />
                <meshPhysicalMaterial color="#666666" roughness={0.4} metalness={0.5} />
            </mesh>
        </group>
    );
}

function Windmill({ position }: { position: [number, number, number] }) {
    const bladesRef = useRef<THREE.Group>(null!);
    const baseY = getTerrainHeight(position[0], position[2]);

    useFrame((_, delta) => {
        if (bladesRef.current) {
            bladesRef.current.rotation.z -= delta * 0.4;
        }
    });

    return (
        <group position={[position[0], baseY, position[2]]}>
            {/* Tower — Iron */}
            <mesh position={[0, 8, 0]} castShadow>
                <cylinderGeometry args={[0.4, 1.2, 16, 8]} />
                <meshPhysicalMaterial color="#2d2b2a" roughness={0.9} />
            </mesh>
            {/* Cross supports */}
            <mesh position={[0, 7, 0]} castShadow rotation={[0, 0, Math.PI / 8]}>
                <cylinderGeometry args={[0.08, 0.08, 15, 4]} />
                <meshPhysicalMaterial color="#2d2b2a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 7, 0]} castShadow rotation={[0, 0, -Math.PI / 8]}>
                <cylinderGeometry args={[0.08, 0.08, 15, 4]} />
                <meshPhysicalMaterial color="#2d2b2a" roughness={0.9} />
            </mesh>

            {/* Hub */}
            <mesh position={[0, 16.2, 0.8]}>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshPhysicalMaterial color="#888888" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Blades */}
            <group ref={bladesRef} position={[0, 16.2, 1.0]}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <group key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
                        <mesh castShadow position={[0, 3.5, 0]}>
                            <boxGeometry args={[0.5, 6, 0.05]} />
                            <meshPhysicalMaterial color="#c0c0c0" roughness={0.4} metalness={0.3} />
                        </mesh>
                    </group>
                ))}
            </group>
        </group>
    );
}

export default function FarmBarn({ position = [0, 0, 0] as [number, number, number] }) {
    const baseY = getTerrainHeight(position[0], position[2]);

    const WALL_COLOR = "#5a2a22"; // Realistic weathered dark red/brown
    const TRIM_COLOR = "#2c1b14"; // Dark wood beams
    const ROOF_COLOR = "#222222"; // Dark slate grey/black shingle
    const DOOR_COLOR = "#3d2417"; // Weathered wood

    // Dimensions
    const width = 18;
    const length = 36; // 2x the width
    const height = 9;
    const zOffset = length / 2;
    const xOffset = width / 2;

    return (
        <group position={[position[0], baseY, position[2]]}>
            {/* ═══ Foundation — Detailed Stone Base ═══ */}
            <mesh position={[0, 0.35, 0]} receiveShadow castShadow>
                <boxGeometry args={[width + 2, 0.7, length + 2]} />
                <meshPhysicalMaterial color="#6a6d6d" roughness={0.95} />
            </mesh>
            {/* Wing foundations */}
            <mesh position={[-11, 0.35, 0]} receiveShadow castShadow>
                <boxGeometry args={[6, 0.7, 12]} />
                <meshPhysicalMaterial color="#6a6d6d" roughness={0.95} />
            </mesh>
            <mesh position={[11, 0.35, 0]} receiveShadow castShadow>
                <boxGeometry args={[6, 0.7, 12]} />
                <meshPhysicalMaterial color="#6a6d6d" roughness={0.95} />
            </mesh>

            {/* ═══ Main Hall Structure ═══ */}
            {/* Main Body */}
            <mesh position={[0, height / 2 + 0.5, 0]} castShadow>
                <boxGeometry args={[width, height, length]} />
                <meshPhysicalMaterial color={WALL_COLOR} roughness={0.85} bumpScale={0.02} />
            </mesh>

            {/* Front overhang porch extension */}
            <mesh position={[0, 4, zOffset + 1.5]} castShadow>
                <boxGeometry args={[10, 6, 3]} />
                <meshPhysicalMaterial color={WALL_COLOR} roughness={0.85} />
            </mesh>
            {/* Porch pillars */}
            {[-4.5, 4.5].map((x) => (
                <mesh key={`pillar-${x}`} position={[x, 2, zOffset + 2.8]} castShadow>
                    <boxGeometry args={[0.6, 4, 0.6]} />
                    <meshPhysicalMaterial color={TRIM_COLOR} roughness={0.9} />
                </mesh>
            ))}

            {/* Main Roof Pitch */}
            <group position={[0, height + 0.5, 0]}>
                <mesh rotation={[0, 0, Math.PI / 4.5]} position={[-4.5, 3.5, 0]} castShadow>
                    <boxGeometry args={[12, 0.4, length + 2]} />
                    <meshPhysicalMaterial color={ROOF_COLOR} roughness={0.9} />
                </mesh>
                <mesh rotation={[0, 0, -Math.PI / 4.5]} position={[4.5, 3.5, 0]} castShadow>
                    <boxGeometry args={[12, 0.4, length + 2]} />
                    <meshPhysicalMaterial color={ROOF_COLOR} roughness={0.9} />
                </mesh>
                {/* Main Ridge cap */}
                <mesh position={[0, 7.4, 0]}>
                    <boxGeometry args={[1.5, 0.5, length + 2]} />
                    <meshPhysicalMaterial color={TRIM_COLOR} roughness={0.9} />
                </mesh>
                {/* Main Gable end front/back fills */}
                <mesh position={[0, 3.5, zOffset - 0.05]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0, 9.8, 7.4, 3]} />
                    <meshPhysicalMaterial color={WALL_COLOR} roughness={0.85} />
                </mesh>
                <mesh position={[0, 3.5, -zOffset + 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0, 9.8, 7.4, 3]} />
                    <meshPhysicalMaterial color={WALL_COLOR} roughness={0.85} />
                </mesh>
            </group>

            {/* Porch Roof */}
            <mesh position={[0, 7.8, zOffset + 1.8]} rotation={[-Math.PI / 8, 0, 0]} castShadow>
                <boxGeometry args={[10.8, 4, 0.3]} />
                <meshPhysicalMaterial color={ROOF_COLOR} roughness={0.9} />
            </mesh>

            {/* ═══ Left & Right Annex Wings ═══ */}
            {/* Left Wing body */}
            <mesh position={[-11, 4, 0]} castShadow>
                <boxGeometry args={[4, 7, 10]} />
                <meshPhysicalMaterial color={WALL_COLOR} roughness={0.85} />
            </mesh>
            {/* Left Wing Roof */}
            <mesh position={[-11, 8.5, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
                <boxGeometry args={[5, 0.3, 11]} />
                <meshPhysicalMaterial color={ROOF_COLOR} roughness={0.9} />
            </mesh>

            {/* Right Wing body */}
            <mesh position={[11, 4, 0]} castShadow>
                <boxGeometry args={[4, 7, 10]} />
                <meshPhysicalMaterial color={WALL_COLOR} roughness={0.85} />
            </mesh>
            {/* Right Wing Roof */}
            <mesh position={[11, 8.5, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
                <boxGeometry args={[5, 0.3, 11]} />
                <meshPhysicalMaterial color={ROOF_COLOR} roughness={0.9} />
            </mesh>

            {/* ═══ Heavy Wood Trims & Studs ═══ */}
            {/* Corner Columns Main */}
            {[-xOffset, xOffset].map((x) =>
                [-zOffset, zOffset].map((z) => (
                    <mesh key={`col-${x}-${z}`} position={[x, 5.2, z]} castShadow>
                        <boxGeometry args={[0.5, 9.3, 0.5]} />
                        <meshPhysicalMaterial color={TRIM_COLOR} roughness={0.9} />
                    </mesh>
                ))
            )}

            {/* Side wall vertical studs */}
            {[-12, -6, 6, 12].map((z) => (
                <group key={`studs-${z}`}>
                    <mesh position={[-xOffset, 5.2, z]}><boxGeometry args={[0.3, 9.3, 0.3]} /><meshPhysicalMaterial color={TRIM_COLOR} /></mesh>
                    <mesh position={[xOffset, 5.2, z]}><boxGeometry args={[0.3, 9.3, 0.3]} /><meshPhysicalMaterial color={TRIM_COLOR} /></mesh>
                </group>
            ))}

            {/* Mid-level wrap beams */}
            <mesh position={[0, 5, zOffset + 0.1]}><boxGeometry args={[width + 0.4, 0.4, 0.2]} /><meshPhysicalMaterial color={TRIM_COLOR} /></mesh>
            <mesh position={[0, 5, -zOffset - 0.1]}><boxGeometry args={[width + 0.4, 0.4, 0.2]} /><meshPhysicalMaterial color={TRIM_COLOR} /></mesh>
            <mesh position={[xOffset + 0.1, 5, 0]}><boxGeometry args={[0.2, 0.4, length + 0.4]} /><meshPhysicalMaterial color={TRIM_COLOR} /></mesh>
            <mesh position={[-xOffset - 0.1, 5, 0]}><boxGeometry args={[0.2, 0.4, length + 0.4]} /><meshPhysicalMaterial color={TRIM_COLOR} /></mesh>

            {/* ═══ Realistic Industrial Sliding Barn Doors ═══ */}
            <group position={[0, 4.2, zOffset + 3.1]}>
                {/* Heavy door track with rollers */}
                <mesh position={[0, 4.4, 0]}>
                    <boxGeometry args={[10, 0.4, 0.4]} />
                    <meshPhysicalMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
                </mesh>

                {/* Left Door */}
                <group position={[-2.2, 0, 0.2]} castShadow>
                    {/* Main door panel with vertical wood detail simulation */}
                    <mesh>
                        <boxGeometry args={[4.4, 8.4, 0.3]} />
                        <meshPhysicalMaterial color={DOOR_COLOR} roughness={0.9} />
                    </mesh>
                    {/* Vertical plank lines using thin dark boxes */}
                    {[-1.65, -1.1, -0.55, 0, 0.55, 1.1, 1.65].map((x, i) => (
                        <mesh key={`plank-l-${i}`} position={[x, 0, 0.16]}>
                            <boxGeometry args={[0.02, 8.4, 0.02]} />
                            <meshPhysicalMaterial color="#1a120e" />
                        </mesh>
                    ))}
                    {/* Heavy Iron Frame & Bracing */}
                    <mesh position={[0, 0, 0.18]}><boxGeometry args={[4.4, 0.5, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    <mesh position={[0, 4.2, 0.18]}><boxGeometry args={[4.4, 0.5, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    <mesh position={[0, -4.2, 0.18]}><boxGeometry args={[4.4, 0.5, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    <mesh position={[-2.2, 0, 0.18]}><boxGeometry args={[0.5, 8.9, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    <mesh position={[2.2, 0, 0.18]}><boxGeometry args={[0.5, 8.9, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    {/* X-Brace */}
                    <mesh rotation={[0, 0, Math.PI / 3]} position={[0, 0, 0.19]}><boxGeometry args={[0.3, 9.4, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    <mesh rotation={[0, 0, -Math.PI / 3]} position={[0, 0, 0.19]}><boxGeometry args={[0.3, 9.4, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    {/* Iron door handle */}
                    <mesh position={[1.8, 0, 0.25]} rotation={[0, Math.PI / 2, 0]}>
                        <torusGeometry args={[0.2, 0.04, 8, 16]} />
                        <meshPhysicalMaterial color="#111111" metalness={1} />
                    </mesh>
                </group>

                {/* Right Door */}
                <group position={[2.2, 0, 0.2]} castShadow>
                    <mesh>
                        <boxGeometry args={[4.4, 8.4, 0.3]} />
                        <meshPhysicalMaterial color={DOOR_COLOR} roughness={0.9} />
                    </mesh>
                    {/* Vertical plank lines */}
                    {[-1.65, -1.1, -0.55, 0, 0.55, 1.1, 1.65].map((x, i) => (
                        <mesh key={`plank-r-${i}`} position={[x, 0, 0.16]}>
                            <boxGeometry args={[0.02, 8.4, 0.02]} />
                            <meshPhysicalMaterial color="#1a120e" />
                        </mesh>
                    ))}
                    {/* Heavy Iron Frame & Bracing */}
                    <mesh position={[0, 0, 0.18]}><boxGeometry args={[4.4, 0.5, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    <mesh position={[0, 4.2, 0.18]}><boxGeometry args={[4.4, 0.5, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    <mesh position={[0, -4.2, 0.18]}><boxGeometry args={[4.4, 0.5, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    <mesh position={[-2.2, 0, 0.18]}><boxGeometry args={[0.5, 8.9, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    <mesh position={[2.2, 0, 0.18]}><boxGeometry args={[0.5, 8.9, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    {/* X-Brace */}
                    <mesh rotation={[0, 0, Math.PI / 3]} position={[0, 0, 0.19]}><boxGeometry args={[0.3, 9.4, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    <mesh rotation={[0, 0, -Math.PI / 3]} position={[0, 0, 0.19]}><boxGeometry args={[0.3, 9.4, 0.1]} /><meshPhysicalMaterial color="#2d2d2d" metalness={0.6} /></mesh>
                    {/* Iron door handle */}
                    <mesh position={[-1.8, 0, 0.25]} rotation={[0, Math.PI / 2, 0]}>
                        <torusGeometry args={[0.2, 0.04, 8, 16]} />
                        <meshPhysicalMaterial color="#111111" metalness={1} />
                    </mesh>
                </group>
            </group>

            {/* ═══ Realistic Glowing Windows Along The Sides ═══ */}
            {[-12, -4, 4, 12].map((z) => (
                <group key={`win-left-${z}`}>
                    <mesh position={[-xOffset - 0.05, 6.5, z]}>
                        <boxGeometry args={[0.2, 2.5, 2]} />
                        <meshPhysicalMaterial color={TRIM_COLOR} />
                    </mesh>
                    <mesh position={[-xOffset - 0.1, 6.5, z]}>
                        <boxGeometry args={[0.1, 2.2, 1.7]} />
                        <meshPhysicalMaterial color="#ffd080" emissive="#ffb830" emissiveIntensity={0.6} roughness={0.1} clearcoat={1.0} />
                    </mesh>

                    <mesh position={[xOffset + 0.05, 6.5, z]}>
                        <boxGeometry args={[0.2, 2.5, 2]} />
                        <meshPhysicalMaterial color={TRIM_COLOR} />
                    </mesh>
                    <mesh position={[xOffset + 0.1, 6.5, z]}>
                        <boxGeometry args={[0.1, 2.2, 1.7]} />
                        <meshPhysicalMaterial color="#ffd080" emissive="#ffb830" emissiveIntensity={0.6} roughness={0.1} clearcoat={1.0} />
                    </mesh>
                </group>
            ))}

            {/* Grand Loft Window (Front) */}
            <group position={[0, 12.5, zOffset + 0.01]}>
                <mesh position={[0, 0, 0.1]} rotation={[0, Math.PI / 2, 0]}>
                    <torusGeometry args={[1.8, 0.25, 8, 8, Math.PI * 2]} />
                    <meshPhysicalMaterial color={TRIM_COLOR} />
                </mesh>
                <mesh position={[0, 0, 0.1]}>
                    <circleGeometry args={[1.7, 32]} />
                    <meshPhysicalMaterial color="#ffd080" emissive="#ffcc40" emissiveIntensity={1.0} roughness={0.1} clearcoat={1.0} />
                </mesh>
                {/* Criss-cross window pane dividers */}
                <mesh position={[0, 0, 0.15]}><boxGeometry args={[3.4, 0.2, 0.1]} /><meshPhysicalMaterial color={TRIM_COLOR} /></mesh>
                <mesh position={[0, 0, 0.15]}><boxGeometry args={[0.2, 3.4, 0.1]} /><meshPhysicalMaterial color={TRIM_COLOR} /></mesh>
            </group>

            {/* ═══ Environment Props around Barn ═══ */}
            {/* Clustered Hay Bales */}
            <HayBale position={[14, 0.5, 10]} />
            <HayBale position={[15, 0.5, 9]} />
            <HayBale position={[14.5, 1.3, 9.5]} />
            <HayBale position={[-14, 0.5, -6]} />
            <HayBale position={[-15, 0.5, -5.5]} />

            {/* Attached Concrete Silo (Massive) placed further back along the side */}
            <ConcreteSilo position={[position[0] + 16, 0, position[2] - 8]} />

            {/* Detailed Iron Windmill */}
            <Windmill position={[position[0] - 25, 0, position[2] + 12]} />
        </group>
    );
}
