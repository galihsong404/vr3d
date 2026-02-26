'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig, chains } from '@/lib/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

// Read projectId from env (single source of truth — same as wagmi.ts)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Inisialisasi Web3Modal SEKALI di module-level
createWeb3Modal({
    wagmiConfig: wagmiConfig,
    projectId, // ← dari env variable, bukan hardcode
    chains: chains,
    enableAnalytics: false,
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
