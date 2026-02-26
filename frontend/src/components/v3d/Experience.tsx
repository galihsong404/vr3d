'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float, Stars } from '@react-three/drei';
import { Suspense } from 'react';
import HouseMenu from './HouseMenu';

export default function Experience() {
    return (
        <div className="w-full h-screen bg-black">
            <Canvas shadows gl={{ antialias: true, stencil: false }}>
                <PerspectiveCamera makeDefault position={[12, 10, 18]} fov={40} />
                <OrbitControls
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2.2}
                    minDistance={10}
                    maxDistance={30}
                    autoRotate
                    autoRotateSpeed={0.3}
                />

                <color attach="background" args={['#050505']} />

                {/* Visual Depth */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Lighting System */}
                <ambientLight intensity={0.1} />

                {/* Main Key Light (Warm) */}
                <spotLight
                    position={[15, 20, 15]}
                    angle={0.3}
                    penumbra={1}
                    intensity={2}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                    color="#FBBF24"
                />

                {/* Rim Light (Cool/Emerald) */}
                <pointLight position={[-15, 10, -15]} intensity={1.5} color="#10B981" />

                {/* Fill Light (Soft) */}
                <rectAreaLight
                    width={20}
                    height={20}
                    intensity={0.5}
                    position={[0, 10, -10]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    color="#ffffff"
                />

                <Suspense fallback={null}>
                    <Environment preset="night" />

                    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
                        <HouseMenu />
                    </Float>

                    {/* Ground Plane with Mirror-like reflection feel */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
                        <planeGeometry args={[100, 100]} />
                        <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.9} />
                    </mesh>

                    <ContactShadows
                        position={[0, -2.45, 0]}
                        opacity={0.6}
                        scale={40}
                        blur={1.5}
                        far={10}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
