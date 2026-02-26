'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTerrainHeight } from './Terrain';

/* ───────────────────────────────────────────
   Pixar-style cow matching DApp avatar:
   - Warm brown body with cream belly
   - Large expressive eyes
   - Pink snout
   - Golden crown
   - Smooth organic shapes
   ─────────────────────────────────────────── */

interface CowProps {
    position: [number, number, number];
    rotation?: number;
    scale?: number;
    variant?: 'brown' | 'cream' | 'spotted';
}

function Cow({ position, rotation = 0, scale = 1, variant = 'brown' }: CowProps) {
    const groupRef = useRef<THREE.Group>(null!);
    const headRef = useRef<THREE.Group>(null!);
    const tailRef = useRef<THREE.Group>(null!);
    const earLeftRef = useRef<THREE.Mesh>(null!);
    const earRightRef = useRef<THREE.Mesh>(null!);
    const timeOffset = useMemo(() => Math.random() * Math.PI * 2, []);
    const baseY = getTerrainHeight(position[0], position[2]);

    // Color variants matching the original Cash Cow Valley style (white body, black spots)
    // but with AAA material settings
    const colors = useMemo(() => {
        switch (variant) {
            case 'cream':
                return { body: '#f5ead8', belly: '#ffffff', spots: '#d4a05a', face: '#f5ead8', snout: '#ffb3ba' };
            case 'spotted':
                return { body: '#ffffff', belly: '#ffffff', spots: '#1a1a1a', face: '#ffffff', snout: '#ffb3ba' };
            default: // brown -> let's make default the classic white and black cow
                return { body: '#ffffff', belly: '#ffffff', spots: '#1a1a1a', face: '#ffffff', snout: '#ffb3ba' };
        }
    }, [variant]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime() + timeOffset;
        const speed = 0.8; // Base animation speed

        // Gentle breathing + slight sway (more AAA organic curves)
        if (groupRef.current) {
            groupRef.current.position.y = baseY + 1.0 * scale + Math.sin(t * speed) * 0.03 + Math.sin(t * speed * 2.3) * 0.01;
            groupRef.current.rotation.y = rotation + Math.sin(t * speed * 0.5) * 0.02;
            groupRef.current.rotation.z = Math.sin(t * speed * 1.1) * 0.01; // subtle side sway
        }

        // Head — gentle curious look around, less robotic, more easing
        if (headRef.current) {
            headRef.current.rotation.x = Math.sin(t * speed * 0.7) * 0.08 - 0.05 + Math.sin(t * speed * 1.5) * 0.02;
            headRef.current.rotation.y = Math.sin(t * speed * 0.4) * 0.1 + Math.sin(t * speed * 0.8) * 0.05;
            headRef.current.rotation.z = Math.sin(t * speed * 0.6) * 0.03; // head tilt
        }

        // Tail swish - snappy AAA animation
        if (tailRef.current) {
            // Snappy swish using Math.pow or complex sine waves
            const swish = Math.sin(t * speed * 2.5);
            tailRef.current.rotation.z = swish * 0.4 + Math.sin(t * speed * 5.0) * 0.1;
            tailRef.current.rotation.x = 0.3 + Math.abs(swish) * 0.1;
        }

        // Ear flick - random twitching
        const twitch = Math.sin(t * 8) > 0.9 ? Math.sin(t * 20) * 0.3 : 0;
        if (earLeftRef.current) earLeftRef.current.rotation.z = 0.6 + Math.sin(t * speed * 3) * 0.1 + twitch;
        if (earRightRef.current) earRightRef.current.rotation.z = -0.6 - Math.sin(t * speed * 3 + 0.5) * 0.1 - twitch;
    });

    return (
        <group ref={groupRef} position={[position[0], baseY + 1.0 * scale, position[2]]} rotation={[0, rotation, 0]} scale={scale}>

            {/* ═══ BODY — 3 overlapping spheres for smooth plump shape ═══ */}
            {/* Main torso */}
            <mesh castShadow>
                <meshStandardMaterial color={colors.body} roughness={0.55} metalness={0.02} />
            </mesh>
            {/* Front shoulder */}
            <mesh castShadow position={[0.55, 0.05, 0]}>
                <sphereGeometry args={[0.9, 32, 28]} />
                <meshStandardMaterial color={colors.body} roughness={0.55} metalness={0.02} />
            </mesh>
            {/* Rear hip */}
            <mesh castShadow position={[-0.55, -0.05, 0]}>
                <sphereGeometry args={[0.9, 32, 28]} />
                <meshStandardMaterial color={colors.body} roughness={0.55} metalness={0.02} />
            </mesh>
            {/* Cream belly */}
            <mesh position={[0, -0.35, 0]}>
                <sphereGeometry args={[0.85, 32, 24]} />
                <meshStandardMaterial color={colors.belly} roughness={0.6} />
            </mesh>

            {/* ═══ PATTERN PATCHES (SPOTS) — Highly visible intersection spheres ═══ */}
            {/* Back patch */}
            <mesh position={[-0.1, 0.45, 0]}>
                <sphereGeometry args={[0.75, 24, 24]} />
                <meshStandardMaterial color={colors.spots} roughness={0.7} />
            </mesh>
            {/* Side/Shoulder patch right */}
            <mesh position={[0.4, 0.1, 0.65]}>
                <sphereGeometry args={[0.55, 24, 24]} />
                <meshStandardMaterial color={colors.spots} roughness={0.7} />
            </mesh>
            {/* Rear patch left */}
            <mesh position={[-0.3, 0.05, -0.65]}>
                <sphereGeometry args={[0.55, 24, 24]} />
                <meshStandardMaterial color={colors.spots} roughness={0.7} />
            </mesh>
            {/* Head/Neck patch */}
            <mesh position={[1.2, 0.5, -0.2]}>
                <sphereGeometry args={[0.4, 24, 24]} />
                <meshStandardMaterial color={colors.spots} roughness={0.7} />
            </mesh>

            {/* ═══ HEAD — Realistic Holstein / Dairy Cow Face ═══ */}
            <group ref={headRef} position={[1.45, 0.5, 0]}>
                {/* Main Head Base (Elongated) */}
                <mesh castShadow>
                    <capsuleGeometry args={[0.45, 0.6, 16, 24]} />
                    {/* Rotate capsule so it points forward/down slightly */}
                    <group rotation={[0, 0, Math.PI / 2]}>
                        <meshStandardMaterial color={colors.face} roughness={0.6} />
                    </group>
                </mesh>

                {/* Holstein Face Patches (Black patches around eyes/ears) */}
                <mesh position={[-0.1, 0.2, 0.3]} rotation={[0.2, 0, 0]}>
                    <sphereGeometry args={[0.35, 20, 20]} />
                    <meshStandardMaterial color={colors.spots} roughness={0.6} />
                </mesh>
                <mesh position={[-0.1, 0.1, -0.35]} rotation={[-0.2, 0, 0]}>
                    <sphereGeometry args={[0.3, 20, 20]} />
                    <meshStandardMaterial color={colors.spots} roughness={0.6} />
                </mesh>

                {/* The distinct white blaze (stripe) down the nose */}
                <mesh position={[0.45, 0, 0]} rotation={[0, 0, -0.2]}>
                    <boxGeometry args={[0.55, 0.35, 0.3]} />
                    <meshStandardMaterial color={colors.face} roughness={0.6} />
                </mesh>

                {/* ── Snout — Mottled Pink/Black realistic snout ── */}
                <group position={[0.65, -0.2, 0]}>
                    <mesh castShadow>
                        <boxGeometry args={[0.3, 0.45, 0.5]} />
                        <meshStandardMaterial color="#ffb3ba" roughness={0.7} />
                    </mesh>
                    {/* Black mottling on snout */}
                    <mesh position={[0.15, 0.1, 0.1]}>
                        <sphereGeometry args={[0.12, 12, 12]} />
                        <meshStandardMaterial color={colors.spots} roughness={0.9} />
                    </mesh>
                    {/* Nostrils */}
                    <mesh position={[0.16, 0.1, 0.15]} rotation={[0, 0, 0.3]}>
                        <capsuleGeometry args={[0.04, 0.08, 8, 8]} />
                        <meshStandardMaterial color="#1a0a05" roughness={0.9} />
                    </mesh>
                    <mesh position={[0.16, 0.1, -0.15]} rotation={[0, 0, 0.3]}>
                        <capsuleGeometry args={[0.04, 0.08, 8, 8]} />
                        <meshStandardMaterial color="#1a0a05" roughness={0.9} />
                    </mesh>
                    {/* Mouth line */}
                    <mesh position={[0.16, -0.1, 0]}>
                        <boxGeometry args={[0.02, 0.02, 0.4]} />
                        <meshStandardMaterial color="#1a0a05" roughness={0.9} />
                    </mesh>
                </group>

                {/* ── Eyes — Realistic bovine eyes (dark laterally placed) ── */}
                {/* Left Eye */}
                <group position={[0.25, 0.3, 0.4]} rotation={[0, Math.PI / 4, 0]}>
                    <mesh>
                        <sphereGeometry args={[0.09, 16, 16]} />
                        <meshStandardMaterial color="#0a0502" roughness={0.05} clearcoat={1.0} />
                    </mesh>
                </group>
                {/* Right Eye */}
                <group position={[0.25, 0.3, -0.4]} rotation={[0, -Math.PI / 4, 0]}>
                    <mesh>
                        <sphereGeometry args={[0.09, 16, 16]} />
                        <meshStandardMaterial color="#0a0502" roughness={0.05} clearcoat={1.0} />
                    </mesh>
                </group>

                {/* ── Horns — Small, realistic curved horns ── */}
                <mesh position={[-0.1, 0.55, 0.25]} rotation={[0.4, 0.2, -0.2]}>
                    <coneGeometry args={[0.05, 0.25, 12]} />
                    <meshStandardMaterial color="#e0d5c1" roughness={0.6} />
                </mesh>
                <mesh position={[-0.1, 0.55, -0.25]} rotation={[-0.4, -0.2, -0.2]}>
                    <coneGeometry args={[0.05, 0.25, 12]} />
                    <meshStandardMaterial color="#e0d5c1" roughness={0.6} />
                </mesh>

                {/* ── Ears — Lateral, realistic cattle ears (pointed out) ── */}
                <mesh ref={earLeftRef} position={[-0.2, 0.4, 0.55]} rotation={[0, 0, Math.PI / 6]}>
                    {/* Ear shape */}
                    <coneGeometry args={[0.1, 0.35, 12]} />
                    <group rotation={[Math.PI / 2, 0, 0]}>
                        <meshStandardMaterial color={colors.spots} roughness={0.8} />
                    </group>
                </mesh>
                <mesh ref={earRightRef} position={[-0.2, 0.4, -0.55]} rotation={[0, 0, -Math.PI / 6]}>
                    <coneGeometry args={[0.1, 0.35, 12]} />
                    <group rotation={[-Math.PI / 2, 0, 0]}>
                        <meshStandardMaterial color={colors.spots} roughness={0.8} />
                    </group>
                </mesh>
            </group>

            {/* ═══ UDDER ═══ */}
            <mesh position={[0, -0.7, 0]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial color="#f5c0b0" roughness={0.55} />
            </mesh>

            {/* ═══ LEGS — smooth cylinders with knees ═══ */}
            {[
                { x: 0.55, z: 0.35 },
                { x: 0.55, z: -0.35 },
                { x: -0.55, z: 0.35 },
                { x: -0.55, z: -0.35 },
            ].map((leg, i) => (
                <group key={i} position={[leg.x, -0.55, leg.z]}>
                    {/* Upper leg */}
                    <mesh castShadow>
                        <capsuleGeometry args={[0.11, 0.35, 8, 16]} />
                        <meshStandardMaterial color={colors.body} roughness={0.55} />
                    </mesh>
                    {/* Lower leg — slightly thinner */}
                    <mesh position={[0, -0.4, 0]} castShadow>
                        <capsuleGeometry args={[0.09, 0.25, 8, 16]} />
                        <meshStandardMaterial color={colors.body} roughness={0.55} />
                    </mesh>
                    {/* Hoof */}
                    <mesh position={[0, -0.65, 0]}>
                        <cylinderGeometry args={[0.1, 0.12, 0.08, 16]} />
                        <meshStandardMaterial color="#3a2a1a" roughness={0.75} />
                    </mesh>
                </group>
            ))}

            {/* ═══ TAIL — flowing ═══ */}
            <group ref={tailRef} position={[-1.15, 0.15, 0]} rotation={[0.3, 0, 0]}>
                <mesh>
                    <capsuleGeometry args={[0.035, 0.7, 6, 12]} />
                    <meshStandardMaterial color={colors.body} roughness={0.65} />
                </mesh>
                <mesh position={[0, -0.45, 0]}>
                    <sphereGeometry args={[0.08, 12, 12]} />
                    <meshStandardMaterial color={colors.spots} roughness={0.6} />
                </mesh>
            </group>

            {/* ═══ BELL — golden, on neck ═══ */}
            <mesh position={[1.15, -0.1, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.08} clearcoat={1.0} />
            </mesh>
        </group>
    );
}

export default function Cows() {
    const cowData: CowProps[] = useMemo(() => [
        // Near the barn — facing front
        { position: [8, 0, 15], rotation: -0.5, scale: 1, variant: 'spotted' as const },
        { position: [12, 0, 18], rotation: 0.3, scale: 0.9, variant: 'spotted' as const },
        { position: [5, 0, 20], rotation: -1.2, scale: 1.05, variant: 'spotted' as const },
        // In the pasture
        { position: [-15, 0, 25], rotation: 2.1, scale: 1, variant: 'spotted' as const },
        { position: [-10, 0, 30], rotation: -0.8, scale: 0.85, variant: 'spotted' as const },
        { position: [-20, 0, 22], rotation: 1.5, scale: 1.1, variant: 'spotted' as const },
        // Far field
        { position: [25, 0, 35], rotation: 0.7, scale: 0.95, variant: 'spotted' as const },
        { position: [30, 0, 40], rotation: -2.0, scale: 0.8, variant: 'spotted' as const },
        // Near pond
        { position: [-5, 0, 45], rotation: 1.0, scale: 1, variant: 'spotted' as const },
        { position: [0, 0, 50], rotation: -1.5, scale: 0.9, variant: 'spotted' as const },
    ], []);

    return (
        <group>
            {cowData.map((cow, i) => (
                <Cow key={i} {...cow} />
            ))}
        </group>
    );
}
