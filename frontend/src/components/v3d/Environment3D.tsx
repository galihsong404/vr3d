'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTerrainHeight } from './Terrain';

/* ───────────────────────────────────────────
   Pixar-style Tree
   - Warm organic trunk
   - Lush multi-layered foliage (5+ spheres)
   - Soft warm greens
   ─────────────────────────────────────────── */
function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
    const baseY = getTerrainHeight(position[0], position[2]);
    const treeRef = useRef<THREE.Group>(null!);

    // Gentle sway
    useFrame((state) => {
        if (treeRef.current) {
            const t = state.clock.getElapsedTime();
            treeRef.current.rotation.z = Math.sin(t * 0.3 + position[0]) * 0.01;
        }
    });

    return (
        <group ref={treeRef} position={[position[0], baseY, position[2]]} scale={scale}>
            {/* Trunk — dark brown, tapered, organic */}
            <mesh position={[0, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.4, 3, 24]} />
                <meshStandardMaterial color="#6b4226" roughness={0.85} clearcoat={0.03} />
            </mesh>
            {/* Trunk root flare */}
            <mesh position={[0, 0.1, 0]}>
                <sphereGeometry args={[0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#6b4226" roughness={0.8} />
            </mesh>

            {/* Foliage — AAA style, 5 overlapping spheres, cool dark greens */}
            <mesh position={[0, 3.8, 0]} castShadow>
                <sphereGeometry args={[2.0, 32, 24]} />
                <meshStandardMaterial color="#2d6b1e" roughness={0.7} clearcoat={0.05} />
            </mesh>
            <mesh position={[0.7, 4.5, 0.4]} castShadow>
                <sphereGeometry args={[1.5, 28, 20]} />
                <meshStandardMaterial color="#3a8a28" roughness={0.7} />
            </mesh>
            <mesh position={[-0.5, 4.8, -0.3]} castShadow>
                <sphereGeometry args={[1.3, 28, 20]} />
                <meshStandardMaterial color="#4a9a38" roughness={0.7} />
            </mesh>
            <mesh position={[0.3, 5.3, 0.2]} castShadow>
                <sphereGeometry args={[1.0, 24, 18]} />
                <meshStandardMaterial color="#5a8a38" roughness={0.65} />
            </mesh>
            <mesh position={[-0.2, 5.6, -0.1]} castShadow>
                <sphereGeometry args={[0.7, 20, 16]} />
                <meshStandardMaterial color="#6a9a48" roughness={0.65} />
            </mesh>
        </group>
    );
}

/* ───────────────────────────────────────────
   Pixar-style Fence — rounded wooden posts
   ─────────────────────────────────────────── */
function FenceSegment({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
    const startY = getTerrainHeight(start[0], start[2]) + 0.5;
    const endY = getTerrainHeight(end[0], end[2]) + 0.5;
    const midX = (start[0] + end[0]) / 2;
    const midZ = (start[2] + end[2]) / 2;
    const midY = (startY + endY) / 2;
    const dx = end[0] - start[0];
    const dz = end[2] - start[2];
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx);

    return (
        <group>
            {/* Rounded posts */}
            <mesh position={[start[0], startY, start[2]]} castShadow>
                <cylinderGeometry args={[0.07, 0.09, 1.2, 12]} />
                <meshStandardMaterial color="#8b7355" roughness={0.85} clearcoat={0.03} />
            </mesh>
            {/* Post cap — rounded */}
            <mesh position={[start[0], startY + 0.6, start[2]]}>
                <sphereGeometry args={[0.09, 10, 10]} />
                <meshStandardMaterial color="#8b7355" roughness={0.85} />
            </mesh>
            <mesh position={[end[0], endY, end[2]]} castShadow>
                <cylinderGeometry args={[0.07, 0.09, 1.2, 12]} />
                <meshStandardMaterial color="#8b7355" roughness={0.85} clearcoat={0.03} />
            </mesh>
            <mesh position={[end[0], endY + 0.6, end[2]]}>
                <sphereGeometry args={[0.09, 10, 10]} />
                <meshStandardMaterial color="#8b7355" roughness={0.85} />
            </mesh>
            {/* Rails — rounded cylinders */}
            <mesh position={[midX, midY + 0.2, midZ]} rotation={[Math.PI / 2, angle, 0]}>
                <cylinderGeometry args={[0.04, 0.04, length, 8]} />
                <meshStandardMaterial color="#a08060" roughness={0.8} />
            </mesh>
            <mesh position={[midX, midY - 0.1, midZ]} rotation={[Math.PI / 2, angle, 0]}>
                <cylinderGeometry args={[0.04, 0.04, length, 8]} />
                <meshStandardMaterial color="#a08060" roughness={0.8} />
            </mesh>
        </group>
    );
}

/* ───────────────────────────────────────────
   Pixar-style Pond — crystal clear water
   ─────────────────────────────────────────── */
function Pond({ position }: { position: [number, number, number] }) {
    const waterRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if (waterRef.current) {
            const material = waterRef.current.material as THREE.MeshPhysicalMaterial;
            material.roughness = 0.02 + Math.sin(state.clock.getElapsedTime() * 0.4) * 0.015;
        }
    });

    const baseY = getTerrainHeight(position[0], position[2]) + 0.1;

    return (
        <group position={[position[0], baseY, position[2]]}>
            {/* Water surface — deep blue */}
            <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1, 1]} receiveShadow>
                <circleGeometry args={[4, 48]} />
                <meshStandardMaterial
                    color="#2a6b8a"
                    roughness={0.02}
                    metalness={0.5}
                    transparent
                    opacity={0.8}
                    clearcoat={1.0}
                    clearcoatRoughness={0.1}
                    transmission={0.4}
                    ior={1.33}
                />
            </mesh>
            {/* Shore — dirt edge */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} scale={[1.5, 1, 1]}>
                <torusGeometry args={[5, 1.0, 12, 48]} />
                <meshStandardMaterial color="#8b7b5a" roughness={0.9} />
            </mesh>
            {/* Lily pads */}
            {[[-2, 0.1, 1], [1.5, 0.1, -1.5], [-1, 0.1, -2]].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]} rotation={[-Math.PI / 2, Math.random() * Math.PI, 0]}>
                    <circleGeometry args={[0.4 + Math.random() * 0.2, 24]} />
                    <meshStandardMaterial color="#3a8a2a" roughness={0.6} side={THREE.DoubleSide} />
                </mesh>
            ))}
            {/* Reeds — taller, more organic */}
            {[[-4.5, 0, 2], [-4, 0, 2.8], [3.5, 0, -2], [4.2, 0, -1.5], [-3, 0, 3.5]].map((pos, i) => (
                <group key={i} position={pos as [number, number, number]}>
                    <mesh>
                        <cylinderGeometry args={[0.025, 0.04, 2.5, 8]} />
                        <meshStandardMaterial color="#6a9a40" roughness={0.7} />
                    </mesh>
                    {/* Reed top tuft */}
                    <mesh position={[0, 1.3, 0]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color="#a08050" roughness={0.8} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

/* ───────────────────────────────────────────
   Pixar-style Flowers — vibrant, stylized
   ─────────────────────────────────────────── */
function FlowerPatch({ position, count = 15 }: { position: [number, number, number]; count?: number }) {
    const flowers = useMemo(() => {
        const flowerArray = [];
        const colors = ['#ff6b9d', '#ffd93d', '#c084fc', '#ff8a50', '#f472b6', '#60d0f0'];
        for (let i = 0; i < count; i++) {
            const fx = position[0] + (Math.random() - 0.5) * 8;
            const fz = position[2] + (Math.random() - 0.5) * 8;
            const fy = getTerrainHeight(fx, fz);
            flowerArray.push({
                pos: [fx, fy, fz] as [number, number, number],
                color: colors[Math.floor(Math.random() * colors.length)],
                scale: 0.6 + Math.random() * 0.5,
                height: 0.3 + Math.random() * 0.3,
            });
        }
        return flowerArray;
    }, [position, count]);

    return (
        <group>
            {flowers.map((f, i) => (
                <group key={i} position={f.pos}>
                    {/* Stem — curved, organic */}
                    <mesh position={[0, f.height / 2, 0]}>
                        <cylinderGeometry args={[0.02, 0.03, f.height, 8]} />
                        <meshStandardMaterial color="#5aaa38" roughness={0.7} />
                    </mesh>
                    {/* Flower head — multiple petals effect */}
                    <mesh position={[0, f.height + 0.05, 0]}>
                        <sphereGeometry args={[f.scale * 0.18, 16, 12]} />
                        <meshStandardMaterial color={f.color} roughness={0.4} clearcoat={0.1} />
                    </mesh>
                    {/* Center */}
                    <mesh position={[0, f.height + 0.08, 0]}>
                        <sphereGeometry args={[f.scale * 0.08, 10, 10]} />
                        <meshStandardMaterial color="#ffd040" roughness={0.3} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

/* ───────────────────────────────────────────
   Pixar-style Grass Tufts — soft, warm
   ─────────────────────────────────────────── */
function GrassTufts() {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const meshRef2 = useRef<THREE.InstancedMesh>(null!);
    const meshRef3 = useRef<THREE.InstancedMesh>(null!);

    const count = 300;
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        if (!meshRef.current) return;
        // Static instancing — just set once
        const tufts = [];
        const seed = 123;
        const random = (s: number) => {
            const x = Math.sin(s++) * 10000;
            return x - Math.floor(x);
        };

        for (let i = 0; i < count; i++) {
            const x = (random(i * 10 + seed) - 0.5) * 120;
            const z = (random(i * 11 + seed) * 80) - 10;
            const y = getTerrainHeight(x, z);
            const scale = 0.3 + random(i * 12 + seed) * 0.5;
            const rotation = random(i * 13 + seed) * Math.PI;

            dummy.position.set(x, y, z);
            dummy.rotation.set(0, rotation, 0);
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            dummy.position.set(x + 0.05, y - 0.02, z);
            dummy.rotation.set(0, rotation + 0.8, 0.15);
            meshRef2.current.setMatrixAt(i, dummy.matrix);

            dummy.position.set(x - 0.05, y - 0.03, z);
            dummy.rotation.set(0, rotation - 0.8, -0.1);
            meshRef3.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        meshRef2.current.instanceMatrix.needsUpdate = true;
        meshRef3.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            <instancedMesh ref={meshRef} args={[null as any, null as any, count]}>
                <coneGeometry args={[0.08, 0.5, 6]} />
                <meshLambertMaterial color="#4a7c34" side={THREE.DoubleSide} />
            </instancedMesh>
            <instancedMesh ref={meshRef2} args={[null as any, null as any, count]}>
                <coneGeometry args={[0.06, 0.4, 6]} />
                <meshLambertMaterial color="#5a8a38" side={THREE.DoubleSide} />
            </instancedMesh>
            <instancedMesh ref={meshRef3} args={[null as any, null as any, count]}>
                <coneGeometry args={[0.07, 0.35, 6]} />
                <meshLambertMaterial color="#3a6c24" side={THREE.DoubleSide} />
            </instancedMesh>
        </group>
    );
}

/* ───────────────────────────────────────────
   Pixar-style Clouds — puffy cotton
   ─────────────────────────────────────────── */
function CloudGroup() {
    const groupRef = useRef<THREE.Group>(null!);

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.position.x += delta * 0.2;
            if (groupRef.current.position.x > 80) {
                groupRef.current.position.x = -80;
            }
        }
    });

    const clouds = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 15; i++) {
            arr.push({
                pos: [(Math.random() - 0.5) * 150, 32 + Math.random() * 12, (Math.random() - 0.5) * 100] as [number, number, number],
                puffs: Math.floor(4 + Math.random() * 5),
                scale: 1.5 + Math.random() * 2,
            });
        }
        return arr;
    }, []);

    return (
        <group ref={groupRef}>
            {clouds.map((cloud, i) => (
                <group key={i} position={cloud.pos} scale={cloud.scale}>
                    {Array.from({ length: cloud.puffs }).map((_, j) => (
                        <mesh key={j} position={[(j - cloud.puffs / 2) * 1.2, Math.random() * 0.4, Math.random() * 0.6]}>
                            <sphereGeometry args={[1.0 + Math.random() * 0.8, 24, 20]} />
                            <meshStandardMaterial
                                color="#ffffff"
                                roughness={0.95}
                                transparent
                                opacity={0.9}
                                clearcoat={0.05}
                            />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
}

/* ───────────────────────────────────────────
   Pixar-style Bushes — round, lush
   ─────────────────────────────────────────── */
function Bush({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
    const baseY = getTerrainHeight(position[0], position[2]);
    return (
        <group position={[position[0], baseY, position[2]]} scale={scale}>
            <mesh position={[0, 0.5, 0]} castShadow>
                <sphereGeometry args={[0.8, 20, 16]} />
                <meshPhysicalMaterial color="#2d6b1e" roughness={0.7} />
            </mesh>
            <mesh position={[0.4, 0.65, 0.2]} castShadow>
                <sphereGeometry args={[0.5, 16, 12]} />
                <meshPhysicalMaterial color="#3a8a28" roughness={0.7} />
            </mesh>
            <mesh position={[-0.3, 0.55, -0.15]} castShadow>
                <sphereGeometry args={[0.45, 16, 12]} />
                <meshPhysicalMaterial color="#4a9a38" roughness={0.7} />
            </mesh>
        </group>
    );
}

/* ───────────────────────────────────────────
   Main Environment
   ─────────────────────────────────────────── */
export default function Environment3D() {
    const treePositions: [number, number, number][] = useMemo(() => [
        [-30, 0, 10], [-25, 0, 5], [-35, 0, 15],
        [30, 0, 12], [35, 0, 20], [28, 0, 25],
        [-20, 0, 40], [-25, 0, 45], [-15, 0, 50],
        [20, 0, 45], [25, 0, 50], [15, 0, 55],
        [-40, 0, 30], [-45, 0, 25], [40, 0, 35],
        [45, 0, 30], [-10, 0, -5], [10, 0, -8],
        [-35, 0, -10], [38, 0, -5],
    ], []);

    const bushPositions: [number, number, number][] = useMemo(() => [
        [-8, 0, 12], [8, 0, 10], [-14, 0, 20],
        [18, 0, 22], [-22, 0, 15], [22, 0, 15],
        [-5, 0, 35], [12, 0, 38], [-18, 0, 48],
        [8, 0, 55], [-30, 0, 20], [32, 0, 28],
    ], []);

    const fencePoints: [number, number, number][] = useMemo(() => [
        [-25, 0, 15], [-20, 0, 15], [-15, 0, 15], [-10, 0, 15],
        [-10, 0, 20], [-10, 0, 25], [-10, 0, 30], [-10, 0, 35],
        [-15, 0, 35], [-20, 0, 35], [-25, 0, 35],
        [-25, 0, 30], [-25, 0, 25], [-25, 0, 20],
    ], []);

    return (
        <group>
            {/* Trees */}
            {treePositions.map((pos, i) => (
                <Tree key={i} position={pos} scale={0.8 + Math.random() * 0.5} />
            ))}

            {/* Bushes */}
            {bushPositions.map((pos, i) => (
                <Bush key={`bush-${i}`} position={pos} scale={0.8 + Math.random() * 0.5} />
            ))}

            {/* Fence */}
            {fencePoints.map((point, i) => {
                if (i < fencePoints.length - 1) {
                    return <FenceSegment key={i} start={point} end={fencePoints[i + 1]} />;
                }
                return <FenceSegment key={i} start={point} end={fencePoints[0]} />;
            })}

            {/* Pond */}
            <Pond position={[-5, 0, 48]} />

            {/* Flower patches — more of them */}
            <FlowerPatch position={[15, 0, 15]} count={25} />
            <FlowerPatch position={[-30, 0, 35]} count={20} />
            <FlowerPatch position={[10, 0, 50]} count={15} />
            <FlowerPatch position={[-15, 0, 10]} count={12} />
            <FlowerPatch position={[25, 0, 30]} count={10} />

            {/* Grass tufts */}
            <GrassTufts />

            {/* Clouds */}
            <CloudGroup />
        </group>
    );
}
