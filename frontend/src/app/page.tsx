'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Three.js
const VRLandingScene = dynamic(
    () => import('@/components/v3d/VRLandingScene'),
    {
        ssr: false,
        loading: () => (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-6" />
                <span className="text-yellow-500 font-black uppercase tracking-widest text-sm">Loading Cash Cow Valley...</span>
                <p className="text-white/30 text-xs uppercase tracking-widest mt-4">Initializing 3D World</p>
            </div>
        ),
    }
);

export default function Home() {
    return (
        <main className="w-full h-screen bg-black text-white overflow-hidden">
            <VRLandingScene />
        </main>
    );
}
