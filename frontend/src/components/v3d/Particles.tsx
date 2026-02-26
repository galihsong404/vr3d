'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Fireflies({ count = 60 }: { count?: number }) {
    const pointsRef = useRef<THREE.Points>(null!);

    const { positions, speeds, phases } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const spd = new Float32Array(count);
        const phs = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 100;
            pos[i * 3 + 1] = 2 + Math.random() * 8;
            pos[i * 3 + 2] = Math.random() * 70 - 10;
            spd[i] = 0.5 + Math.random() * 1.5;
            phs[i] = Math.random() * Math.PI * 2;
        }
        return { positions: pos, speeds: spd, phases: phs };
    }, [count]);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const t = state.clock.getElapsedTime();
        const posAttr = pointsRef.current.geometry.attributes.position;
        for (let i = 0; i < count; i++) {
            const baseX = positions[i * 3];
            const baseY = positions[i * 3 + 1];
            const baseZ = positions[i * 3 + 2];
            posAttr.setX(i, baseX + Math.sin(t * speeds[i] + phases[i]) * 1.5);
            posAttr.setY(i, baseY + Math.sin(t * speeds[i] * 0.7 + phases[i] * 2) * 1.0);
            posAttr.setZ(i, baseZ + Math.cos(t * speeds[i] * 0.5 + phases[i]) * 1.5);
        }
        posAttr.needsUpdate = true;

        // Pulse opacity
        const material = pointsRef.current.material as THREE.PointsMaterial;
        material.opacity = 0.4 + Math.sin(t * 2) * 0.3;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions.slice(), 3]}
                    count={count}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.25}
                color="#FBBF24"
                transparent
                opacity={0.6}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}

function PollenDust({ count = 100 }: { count?: number }) {
    const pointsRef = useRef<THREE.Points>(null!);

    const basePositions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 120;
            pos[i * 3 + 1] = 1 + Math.random() * 15;
            pos[i * 3 + 2] = Math.random() * 80 - 10;
        }
        return pos;
    }, [count]);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const t = state.clock.getElapsedTime();
        const posAttr = pointsRef.current.geometry.attributes.position;
        for (let i = 0; i < count; i++) {
            const baseX = basePositions[i * 3];
            const baseY = basePositions[i * 3 + 1];
            const baseZ = basePositions[i * 3 + 2];
            // Gentle drift
            posAttr.setX(i, baseX + Math.sin(t * 0.2 + i * 0.1) * 2);
            posAttr.setY(i, baseY + Math.sin(t * 0.3 + i * 0.05) * 0.5);
            posAttr.setZ(i, baseZ + Math.cos(t * 0.15 + i * 0.08) * 1.5);
        }
        posAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[basePositions.slice(), 3]}
                    count={count}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                color="#f5f0d0"
                transparent
                opacity={0.4}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}

function GoldenSparkles({ position, count = 30 }: { position: [number, number, number]; count?: number }) {
    const pointsRef = useRef<THREE.Points>(null!);

    const basePositions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = position[0] + (Math.random() - 0.5) * 10;
            pos[i * 3 + 1] = position[1] + Math.random() * 8;
            pos[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 10;
        }
        return pos;
    }, [position, count]);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const t = state.clock.getElapsedTime();
        const material = pointsRef.current.material as THREE.PointsMaterial;
        material.opacity = 0.3 + Math.sin(t * 3) * 0.3;
        material.size = 0.15 + Math.sin(t * 4) * 0.08;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[basePositions, 3]}
                    count={count}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.2}
                color="#FBBF24"
                transparent
                opacity={0.5}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}

export default function Particles() {
    return (
        <group>
            <Fireflies count={60} />
            <PollenDust count={100} />
            {/* Sparkles near barn */}
            <GoldenSparkles position={[0, 5, 0]} count={25} />
            {/* Sparkles near token area */}
            <GoldenSparkles position={[0, 5, 55]} count={20} />
        </group>
    );
}
