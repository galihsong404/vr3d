'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/* ───────────────────────────────────────────
   Pixar-style terrain:
   - Warm lush greens (not cold/dark)
   - Smooth undulating hills
   - Golden-hour dirt tones
   ─────────────────────────────────────────── */

function getTerrainHeight(x: number, z: number): number {
    return (
        Math.sin(x * 0.05) * 2.5 +
        Math.cos(z * 0.07) * 2.0 +
        Math.sin(x * 0.02 + z * 0.03) * 4.0 +
        Math.cos(x * 0.1) * Math.sin(z * 0.08) * 1.2
    );
}

export { getTerrainHeight };

export default function Terrain() {
    const meshRef = useRef<THREE.Mesh>(null!);

    const geometry = useMemo(() => {
        const size = 300;
        const segments = 200;
        const geo = new THREE.PlaneGeometry(size, size, segments, segments);
        const positions = geo.attributes.position;
        const colors = new Float32Array(positions.count * 3);

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getY(i);
            const height = getTerrainHeight(x, z);
            positions.setZ(i, height);

            // Original Cash Cow Valley color palette (cooler, darker)
            const t = (height + 5) / 12;
            const grassGreen = new THREE.Color(0x4a7c34);
            const lightGreen = new THREE.Color(0x7ec850);
            const darkGreen = new THREE.Color(0x2d5a1e);
            const dirt = new THREE.Color(0x8b6914);

            let color: THREE.Color;
            if (t < 0.2) {
                color = dirt.clone().lerp(darkGreen, t / 0.2);
            } else if (t < 0.5) {
                color = darkGreen.clone().lerp(grassGreen, (t - 0.2) / 0.3);
            } else {
                color = grassGreen.clone().lerp(lightGreen, (t - 0.5) / 0.5);
            }

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.computeVertexNormals();
        return geo;
    }, []);

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            receiveShadow
        >
            <meshPhysicalMaterial
                vertexColors
                roughness={0.95}
                metalness={0.0}
                flatShading={false}
                clearcoat={0.0}
            />
        </mesh>
    );
}
