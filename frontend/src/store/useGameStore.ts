import { create } from 'zustand';

interface CowData {
    id: string;
    level: number;
    happiness: number;
    lastFedAt: string | null;
}

interface InventoryData {
    grass: number;
    milk: number;
    landSlots: number;
}

interface GameState {
    usdtBalance: number;
    goldBalance: number;
    cowTokenBalance: number; // For the $COW on-chain points
    grassCount: number;
    milkCount: number;
    landSlots: number;
    dailyAdCount: number;
    hasBarn: boolean;
    web2Stakes: any[];
    cows: CowData[];
    isLoggedIn: boolean;
    isLoading: boolean;
    setBalance: (amt: number) => void;
    setGrass: (amt: number) => void;
    setMilk: (amt: number) => void;
    setCows: (cows: CowData[]) => void;
    setLoading: (loading: boolean) => void;
    login: () => void;
    logout: () => void;
    fetchFarmData: (token: string) => Promise<void>;
    stakeInApp: (token: string, assetType: string, amount: number) => Promise<void>;
    claimInApp: (token: string) => Promise<void>;
    deposit: (token: string, asset: string, amount: number) => Promise<void>;
    withdraw: (token: string, asset: string, amount: number) => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const useGameStore = create<GameState>((set) => ({
    usdtBalance: 0,
    goldBalance: 0,
    cowTokenBalance: 0,
    grassCount: 0,
    milkCount: 0,
    landSlots: 1,
    dailyAdCount: 0,
    hasBarn: false,
    web2Stakes: [],
    cows: [],
    isLoggedIn: false,
    isLoading: false,
    setBalance: (amt) => set({ usdtBalance: amt }),
    setGrass: (amt) => set({ grassCount: amt }),
    setMilk: (amt) => set({ milkCount: amt }),
    setCows: (cows) => set({ cows }),
    setLoading: (loading) => set({ isLoading: loading }),
    login: () => set({ isLoggedIn: true }),
    logout: () => set({ isLoggedIn: false, usdtBalance: 0, goldBalance: 0, cowTokenBalance: 0, grassCount: 0, milkCount: 0, cows: [], dailyAdCount: 0 }),
    fetchFarmData: async (token: string) => {
        try {
            set({ isLoading: true });
            const res = await fetch(`${API_BASE}/farm/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                const data = json.data;
                if (data) {
                    set({
                        cows: data.cows || [],
                        grassCount: data.inventory?.grass || 0,
                        milkCount: data.inventory?.milk || 0,
                        landSlots: data.inventory?.land_slots || 1,
                        usdtBalance: parseFloat(data.usdt_balance) || 0,
                        goldBalance: parseFloat(data.gold_balance) || 0,
                        cowTokenBalance: parseFloat(data.points) || 0,
                        dailyAdCount: data.daily_ad_count || 0,
                        hasBarn: data.inventory?.has_barn || false,
                        web2Stakes: data.web2_stakes || [],
                    });
                }
            }
        } catch (e) {
            console.error('Failed to fetch farm data:', e);
        } finally {
            set({ isLoading: false });
        }
    },
    stakeInApp: async (token, assetType, amount) => {
        try {
            const res = await fetch(`${API_BASE}/market/stake-inapp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ asset_type: assetType, amount })
            });
            if (res.ok) await useGameStore.getState().fetchFarmData(token);
        } catch (e) { console.error(e); }
    },
    claimInApp: async (token) => {
        try {
            const res = await fetch(`${API_BASE}/market/claim-inapp`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) await useGameStore.getState().fetchFarmData(token);
        } catch (e) { console.error(e); }
    },
    deposit: async (token, asset, amount) => {
        try {
            const res = await fetch(`${API_BASE}/market/deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ asset, amount })
            });
            if (res.ok) await useGameStore.getState().fetchFarmData(token);
        } catch (e) { console.error(e); }
    },
    withdraw: async (token, asset, amount) => {
        try {
            const res = await fetch(`${API_BASE}/market/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ asset, amount })
            });
            if (res.ok) await useGameStore.getState().fetchFarmData(token);
        } catch (e) { console.error(e); }
    }
}));
