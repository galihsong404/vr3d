'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig, chains } from '@/lib/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

// Inisialisasi Web3Modal SEKALI di module-level (bukan di dalam component)
// BUG FIX: Sebelumnya dipanggil di dalam komponen = instance baru tiap render = memory leak
createWeb3Modal({
    wagmiConfig: wagmiConfig,
    projectId: 'e9489c77e12cf9091d7f3d7dd2f3e4d1',
    chains: chains,
    enableAnalytics: false, // Optional - speeds up loading
    themeMode: 'dark',
    themeVariables: {
        '--w3m-accent': '#10B981',
        '--w3m-border-radius-master': '12px'
    }
});

// Setup queryClient inside component to avoid cross-request state pollution
export default function Web3ModalProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiConfig config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiConfig>
    );
}
