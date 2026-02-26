'use client';

import { useState } from 'react';
import { Html, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { useShallow } from 'zustand/react/shallow';

function Room({ position, color, label, href, glowing = false, name }: { position: [number, number, number], color: string, label: string, href: string, glowing?: boolean, name?: string }) {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if (glowing || hovered) {
            const t = state.clock.getElapsedTime();
            const intensity = hovered ? 1.5 : 0.5 + Math.sin(t * 3) * 0.3;
            (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={() => window.location.href = href}
                castShadow
            >
                <boxGeometry args={[3, 3, 3]} />
                <meshStandardMaterial
                    color={hovered ? '#FBBF24' : color}
                    emissive={glowing || hovered ? color : '#000000'}
                    emissiveIntensity={0.5}
                    metalness={0.9}
                    roughness={0.1}
                />

                {/* Glass Window Overlay */}
                <mesh position={[0, 0, 1.51]}>
                    <planeGeometry args={[1.5, 1.5]} />
                    <meshPhysicalMaterial
                        transmission={0.8}
                        thickness={0.5}
                        roughness={0}
                        color="white"
                        emissive={color}
                        emissiveIntensity={hovered ? 2 : 0.5}
                    />
                </mesh>

                {/* Floating Label */}
                <Html position={[0, 2.5, 0]} center distanceFactor={10}>
                    <div className={`px-4 py-2 rounded-full border border-white/20 backdrop-blur-md transition-all duration-500 pointer-events-none flex flex-col items-center
                        ${hovered ? 'bg-yellow-500/80 scale-125 opacity-100 shadow-[0_0_20px_rgba(251,191,36,0.5)]' : 'bg-black/40 opacity-60 scale-100'}`}>
                        <span className="text-white font-black uppercase tracking-widest text-[8px] whitespace-nowrap mb-1">
                            {name || 'FEATURE'}
                        </span>
                        <span className="text-white/80 font-bold text-[6px] whitespace-nowrap">
                            {label}
                        </span>
                    </div>
                </Html>
            </mesh>
        </group>
    );
}

export default function HouseMenu() {
    const { grassCount, milkCount, cows, isLoggedIn } = useGameStore(
        useShallow((state) => ({
            grassCount: state.grassCount,
            milkCount: state.milkCount,
            cows: state.cows,
            isLoggedIn: state.isLoggedIn
        }))
    );

    return (
        <group>
            {/* Main Barn Structure */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[8, 5, 6]} />
                <meshStandardMaterial color="#2d1305" roughness={0.9} metalness={0.1} />
            </mesh>

            {/* Chimney */}
            <mesh position={[-2.5, 4, -1]} castShadow>
                <boxGeometry args={[1, 3, 1]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* Roof - Premium Metal/Wood Look */}
            <group position={[0, 2.5, 0]}>
                <mesh rotation={[0, 0, Math.PI / 4]} position={[-3, 2, 0]} castShadow>
                    <boxGeometry args={[6, 0.5, 7]} />
                    <meshStandardMaterial color="#451a03" metalness={0.5} roughness={0.5} />
                </mesh>
                <mesh rotation={[0, 0, -Math.PI / 4]} position={[3, 2, 0]} castShadow>
                    <boxGeometry args={[6, 0.5, 7]} />
                    <meshStandardMaterial color="#451a03" metalness={0.5} roughness={0.5} />
                </mesh>
            </group>

            {/* Rooms Integration - Now Reactive to Store */}
            <Room
                position={[-4, -1, 3.5]}
                color="#3b82f6"
                name="DASHBOARD"
                label={isLoggedIn ? `Inventory: ${grassCount} Grass` : "Manage Cattle"}
                href="/dapp"
            />

            <Room
                position={[4, -1, 3.5]}
                color="#FBBF24"
                name="VAULT"
                label={isLoggedIn ? `Yield: ${milkCount} Milk` : "Earn Rewards"}
                href="#tokenomics"
                glowing
            />

            <Room
                position={[0, -1, 5.5]}
                color="#10B981"
                name="DOCS"
                label={cows.length > 0 ? `${cows.length} Cows Active` : "Read Whitepaper"}
                href="#whitepaper"
            />

            {/* Premium Gold Accent Base */}
            <mesh position={[0, -2.4, 0]} receiveShadow>
                <boxGeometry args={[12, 0.2, 10]} />
                <meshStandardMaterial color="#FBBF24" metalness={1} roughness={0.1} />
            </mesh>

            {/* Hero Text with Floating Animation Effect */}
            <Text
                position={[0, 7.5, 0]}
                fontSize={1.2}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={10}
                textAlign="center"
            >
                CASH COW VALLEY{"\n"}
                VIRTUAL BARN
            </Text>
        </group>
    );
}
