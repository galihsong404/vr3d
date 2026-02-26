import { defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet, polygon, bsc, bscTestnet, sepolia } from 'wagmi/chains';

const projectId = 'e9489c77e12cf9091d7f3d7dd2f3e4d1'; // Hardcoded for local RDP preview reliability

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
