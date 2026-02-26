import { defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet, polygon, bsc, bscTestnet, sepolia } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
if (!projectId) {
    console.error('⚠️ CRITICAL: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in .env.local!');
}

const metadata = {
    name: 'Cash Cow Valley',
    description: 'Moo-ve into the future of Web3 Farming',
    url: 'https://cashcowvalley.io',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const chains = [mainnet, polygon, bsc, bscTestnet, sepolia];

export const wagmiConfig = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
    enableWalletConnect: true,
    enableInjected: true,
    enableEIP6963: true,
    enableCoinbase: true,
});
