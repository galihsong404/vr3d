'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

import Terrain from './Terrain';
import FarmBarn from './FarmBarn';
import Cows from './Cows';
import Environment3D from './Environment3D';
import Particles from './Particles';
import OverlayUI from './OverlayUI';

function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-gradient-to-b from-[#1a0e05] to-[#0a0503] flex flex-col items-center justify-center z-50">
            <div className="w-20 h-20 border-4 border-yellow-500/60 border-t-yellow-400 rounded-full animate-spin mb-8" />
            <span className="text-yellow-400 font-black uppercase tracking-[0.3em] text-sm">Loading Cash Cow Valley...</span>
            <p className="text-white/20 text-xs uppercase tracking-widest mt-3">Preparing AAA World</p>
        </div>
    );
}

function SceneContent() {
    return (
        <>
            {/* Google Maps-style orbit controls — optimized for smoothness */}
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                rotateSpeed={0.3} // Significantly reduced for smoother control
                panSpeed={0.5}
                zoomSpeed={0.6}
                minDistance={10}
                maxDistance={120}
                maxPolarAngle={Math.PI / 2.2}
                minPolarAngle={0.1}
                target={[0, 0, 5]} // Center on the barn
                enableDamping={true}
                dampingFactor={0.05} // Increased damping for more "weight" and less overshooting
                mouseButtons={{
                    LEFT: THREE.MOUSE.ROTATE,
                    MIDDLE: THREE.MOUSE.DOLLY,
                    RIGHT: THREE.MOUSE.PAN,
                }}
                touches={{
                    ONE: THREE.TOUCH.ROTATE,
                    TWO: THREE.TOUCH.DOLLY_PAN,
                }}
            />

            {/* Sky */}
            <Sky
                distance={450000}
                sunPosition={[100, 40, 80]}
                inclination={0.52}
                azimuth={0.25}
                turbidity={6}
                rayleigh={2.5}
                mieCoefficient={0.005}
                mieDirectionalG={0.82}
            />

            {/* Environment map for realistic PBR reflections */}
            <Environment preset="sunset" background={true} />

            {/* Atmospheric Fog — warm golden hour */}
            <fog attach="fog" args={['#e8d5b0', 45, 180]} />

            {/* Lighting System — cinematic */}
            <ambientLight intensity={0.4} color="#fff5e0" />
            <hemisphereLight
                color="#87CEEB"
                groundColor="#2d5a1e"
                intensity={0.5}
            />
            {/* Main sun */}
            <directionalLight
                position={[60, 45, 50]}
                intensity={2.2}
                color="#FFF0D0"
                castShadow
                shadow-mapSize={[1024, 1024]} // Reduced from 4096 for massive performance gain
                shadow-camera-far={200}
                shadow-camera-left={-60}
                shadow-camera-right={60}
                shadow-camera-top={60}
                shadow-camera-bottom={-60}
                shadow-bias={-0.0001}
            />
            {/* Warm fill */}
            <pointLight position={[-20, 12, 30]} intensity={1.2} color="#FBBF24" distance={80} />
            {/* Cool ambient bounce */}
            <pointLight position={[30, 8, -15]} intensity={0.5} color="#87CEEB" distance={50} />

            {/* World Elements */}
            <Terrain />
            <FarmBarn position={[0, 0, 5]} />
            <Cows />
            <Environment3D />
            <Particles />
        </>
    );
}

export default function VRLandingScene() {
    return (
        <div className="w-full h-screen fixed inset-0 cursor-grab active:cursor-grabbing bg-black">
            <Suspense fallback={<LoadingScreen />}>
                <Canvas
                    shadows
                    gl={{
                        antialias: true,
                        powerPreference: "high-performance",
                        toneMapping: THREE.ACESFilmicToneMapping,
                        toneMappingExposure: 1.25,
                        outputColorSpace: THREE.SRGBColorSpace,
                    }}
                    camera={{
                        fov: 50,
                        near: 0.1,
                        far: 10000,
                        position: [70, 60, 100], // Fully zoomed out isometric starting angle
                    }}
                    dpr={[1, 1.5]} // Capped at 1.5 to prevent overkill on 4K/high-DPI screens
                >
                    <SceneContent />
                </Canvas>
            </Suspense>

            {/* Overlay UI rendered OUTSIDE Canvas */}
            <OverlayUI />
        </div>
    );
}
