'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Database,
    ShoppingBag,
    Users,
    Power,
    Coins,
    Milk,
    Leaf,
    ArrowUpRight,
    TrendingUp,
    ShieldCheck,
    AlertTriangle,
    Plus,
    Flame,
    Download,
    ArrowUpCircle,
    Crown,
    Send,
    UserCog
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';

import {
    CASH_COW_TOKEN_ABI,
    CASH_COW_TOKEN_ADDRESS,
    GOLDEN_COW_STAKING_ABI,
    GOLDEN_COW_STAKING_ADDRESS,
    CASH_COW_ACCESS_ABI,
    CASH_COW_ACCESS_ADDRESS
} from '@/contracts/constants';
import { useContractWrite, useContractRead, usePrepareContractWrite, useWaitForTransaction, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

const DEV_WALLET = '0xbb9468c225c35ba3cbe441660ef9de3a66eb772a';
const REGISTRATION_FEE = '0.0001'; // ETH

export default function DApp() {
    const { isConnected, address, status } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { disconnect } = useDisconnect();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'farm' | 'staking' | 'market' | 'listing' | 'referral' | 'vault-inapp' | 'finance' | 'profile' | 'admin'>('farm');
    const [stakingMode, setStakingMode] = useState<'unlocked' | 'locked'>('unlocked');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    const {
        cows, usdtBalance, goldBalance, cowTokenBalance, dailyAdCount,
        grassCount, milkCount, hasBarn, web2Stakes, isLoading,
        isAuthenticated, isRegistered, needsRegistration, authToken, userRole, userWallet,
        authenticate, checkRegistration, setNeedsRegistration, logout, fetchFarmData,
        adminUsers, platformStats, fetchAdminUsers, fetchPlatformStats, adminTransfer
    } = useGameStore();

    const [mounted, setMounted] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [referralAddress, setReferralAddress] = useState('');

    // Web2 Feed/Harvest State
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Admin Transfer State
    const [adminTargetWallet, setAdminTargetWallet] = useState('');
    const [adminItemType, setAdminItemType] = useState('GOLD');
    const [adminAmount, setAdminAmount] = useState('');
    const [adminMessage, setAdminMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const isAdmin = userRole === 'ADMIN' || (address?.toLowerCase() === DEV_WALLET);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleAuthenticate = useCallback(async () => {
        if (!address || isAuthenticating) return;
        setIsAuthenticating(true);
        setAuthError(null);
        try {
            const success = await authenticate(address, signMessageAsync, referralAddress || undefined);
            if (!success) {
                setAuthError('Signature verification failed. Please try again.');
            }
        } catch (e: any) {
            if (e?.message?.includes('User rejected')) {
                setAuthError('You must sign the message to verify wallet ownership.');
            } else {
                setAuthError('Authentication failed. Please try again.');
            }
            console.error('Auth error:', e);
        } finally {
            setIsAuthenticating(false);
        }
    }, [address, authenticate, signMessageAsync, isAuthenticating]);

    // Auth flow: when wallet connects, only CHECK registration — never auto-trigger popups
    useEffect(() => {
        if (!mounted || status !== 'connected' || !address) return;

        const isWrongWallet = userWallet && address.toLowerCase() !== userWallet.toLowerCase();

        // If wallet changed, clear old session first
        if (isWrongWallet) {
            console.log('Wallet changed, clearing stale session');
            logout();
            return;
        }

        // If not authenticated, just check registration status (no popup)
        if (!isAuthenticated) {
            checkRegistration(address).then(({ exists }) => {
                setNeedsRegistration(!exists);
            });
        }
    }, [status, address, mounted, isAuthenticated, userWallet, checkRegistration, setNeedsRegistration, logout]);

    // Registration via direct ETH transfer to treasury (works without deployed contract)
    const { sendTransaction, data: regTxData, isLoading: isRegTxPending } = useSendTransaction();

    const { isLoading: isRegTxConfirming, isSuccess: isRegTxSuccess } = useWaitForTransaction({
        hash: regTxData?.hash,
    });

    // After registration TX success, update state
    useEffect(() => {
        if (isRegTxSuccess) {
            setNeedsRegistration(false);
        }
    }, [isRegTxSuccess, setNeedsRegistration]);

    const handleRegister = () => {
        setAuthError(null);
        try {
            sendTransaction({
                to: DEV_WALLET as `0x${string}`,
                value: parseEther(REGISTRATION_FEE),
            });
        } catch (e: any) {
            setAuthError(e.message || 'Registration transaction failed');
        }
    };

    // Fetch data for existing session on mount
    useEffect(() => {
        if (mounted && isAuthenticated && authToken) {
            fetchFarmData();
        }
    }, [mounted, isAuthenticated, authToken, fetchFarmData]);

    // Clear auth if wallet explicitly disconnects
    useEffect(() => {
        if (mounted && status === 'disconnected' && isAuthenticated) {
            console.log('Wallet disconnected, clearing auth');
            logout();
        }
    }, [status, mounted, isAuthenticated, logout]);

    const handleDisconnect = () => {
        // 1. Clear wagmi connection
        disconnect();

        // 2. Clear our app auth state
        logout();

        // 3. Clear Web3Modal / WalletConnect cached sessions from localStorage
        // This is critical — without this, reconnecting auto-picks the old wallet
        try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (
                    key.startsWith('wc@') ||
                    key.startsWith('W3M') ||
                    key.startsWith('wagmi') ||
                    key.startsWith('@w3m') ||
                    key.includes('walletconnect') ||
                    key.includes('Web3Modal')
                )) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            console.log(`Cleared ${keysToRemove.length} WalletConnect cache keys`);
        } catch (e) {
            console.error('Failed to clear WC cache:', e);
        }

        // 4. Redirect to home page for a clean start
        router.push('/');
    };

    // Fetch admin data when switching to admin tab
    useEffect(() => {
        if (activeTab === 'admin' && isAdmin && authToken) {
            fetchAdminUsers();
            fetchPlatformStats();
        }
    }, [activeTab, isAdmin, authToken]);

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    });

    const handleHarvest = async () => {
        if (!authToken) return;
        setIsActionLoading(true);
        try {
            const res = await fetch('/api/v1/farm/harvest', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (res.ok) {
                setActionMessage({ text: `Success! Harvested ${data.data.milk_harvested} Milk`, type: 'success' });
                fetchFarmData();
            } else {
                setActionMessage({ text: data.message || 'Harvest failed. Check your Vitamin care!', type: 'error' });
            }
        } catch (e) {
            setActionMessage({ text: 'Server connection error', type: 'error' });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleWatchAd = async () => {
        setIsActionLoading(true);
        try {
            const res = await fetch('/api/v1/webhooks/ad-reward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: address, event_id: `ad-${Date.now()}` })
            });
            if (res.ok) {
                setActionMessage({ text: 'Added Gold & Vitamins!', type: 'success' });
                await fetchFarmData();
            }
        } catch (e) {
            setActionMessage({ text: 'Ad simulation failed', type: 'error' });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleBuyInApp = async (itemType: string, quantity: number) => {
        if (!authToken) return;
        setIsActionLoading(true);
        try {
            const res = await fetch('/api/v1/market/buy-inapp-gold', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ item_type: itemType, quantity })
            });
            const data = await res.json();
            if (res.ok) {
                setActionMessage({ text: `Bought ${itemType}!`, type: 'success' });
                await fetchFarmData();
            } else {
                setActionMessage({ text: data.message, type: 'error' });
            }
        } catch (e) {
            setActionMessage({ text: 'Purchase failed', type: 'error' });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSellMilk = async (quantity: number) => {
        if (!authToken) return;
        setIsActionLoading(true);
        try {
            const res = await fetch('/api/v1/market/sell-milk-gold', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ quantity })
            });
            if (res.ok) {
                setActionMessage({ text: 'Milk sold for Gold!', type: 'success' });
                await fetchFarmData();
            }
        } catch (e) {
            setActionMessage({ text: 'Sale failed', type: 'error' });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSwapGold = async (amount: number, target: string) => {
        if (!authToken) return;
        setIsActionLoading(true);
        try {
            const res = await fetch('/api/v1/market/swap-gold', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ amount, target })
            });
            if (res.ok) {
                setActionMessage({ text: `Swapped for ${target}!`, type: 'success' });
                await fetchFarmData();
            }
        } catch (e) {
            setActionMessage({ text: 'Swap failed', type: 'error' });
        } finally {
            setIsActionLoading(false);
        }
    };
    const handleStakeInApp = async (assetType: string, amount: number) => {
        setIsActionLoading(true);
        try {
            await useGameStore.getState().stakeInApp(assetType, amount);
            setActionMessage({ text: `Staked ${amount} ${assetType}!`, type: 'success' });
        } catch (e) {
            setActionMessage({ text: 'Staking failed', type: 'error' });
        } finally { setIsActionLoading(false); }
    };

    const handleClaimInApp = async () => {
        setIsActionLoading(true);
        try {
            await useGameStore.getState().claimInApp();
            setActionMessage({ text: 'Rewards claimed!', type: 'success' });
        } catch (e) {
            setActionMessage({ text: 'Claim failed', type: 'error' });
        } finally { setIsActionLoading(false); }
    };

    const handleDeposit = async (asset: string, amount: number) => {
        setIsActionLoading(true);
        try {
            await useGameStore.getState().deposit(asset, amount);
            setActionMessage({ text: `Deposited ${amount} ${asset}!`, type: 'success' });
        } catch (e) {
            setActionMessage({ text: 'Deposit failed', type: 'error' });
        } finally { setIsActionLoading(false); }
    };

    const handleWithdraw = async (asset: string, amount: number) => {
        setIsActionLoading(true);
        try {
            await useGameStore.getState().withdraw(asset, amount);
            setActionMessage({ text: `Withdrawn ${amount} ${asset}!`, type: 'success' });
        } catch (e) {
            setActionMessage({ text: 'Withdraw failed', type: 'error' });
        } finally { setIsActionLoading(false); }
    };

    const handleAdminTransfer = async () => {
        if (!adminTargetWallet || !adminAmount) return;
        setIsActionLoading(true);
        const result = await adminTransfer(adminTargetWallet, adminItemType, adminAmount);
        setAdminMessage({ text: result.message, type: result.success ? 'success' : 'error' });
        if (result.success) {
            setAdminTargetWallet('');
            setAdminAmount('');
        }
        setIsActionLoading(false);
    };


    // Redirect to home if not connected
    useEffect(() => {
        if (mounted && !isConnected) {
            // router.push('/'); // Optional: redirect to home
        }
    }, [isConnected, mounted]);

    if (!mounted) return null;

    const menuGroups = [
        {
            title: "In-app Farm",
            items: [
                { id: 'farm', label: 'The Barn', icon: LayoutDashboard },
                { id: 'vault-inapp', label: 'In-App Vault', icon: ShieldCheck },
                { id: 'market', label: 'In-App Market', icon: ShoppingBag },
            ]
        },
        {
            title: "Golden Farm (NFT)",
            items: [
                { id: 'staking', label: 'NFT VIP Staking', icon: Database },
                { id: 'listing', label: 'NFT Market', icon: Coins },
            ]
        },
        {
            title: "Finance",
            items: [
                { id: 'finance', label: 'Treasury', icon: TrendingUp },
                { id: 'referral', label: 'Network', icon: Users },
            ]
        },
        {
            title: "System",
            items: [
                { id: 'profile', label: 'Profile', icon: ShieldCheck },
            ]
        },
        ...((address?.toLowerCase() === DEV_WALLET || userRole === 'ADMIN') ? [{
            title: "⚡ Admin",
            items: [
                { id: 'admin', label: 'Admin Panel', icon: Crown },
            ]
        }] : []),
    ];

    const flatTabs = menuGroups.flatMap(g => g.items);

    return (
        <div className="min-h-screen bg-black text-slate-100 flex overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {/* Sidebar (Desktop only) */}
            <aside
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className={`hidden md:flex ${isSidebarExpanded ? 'w-72' : 'w-24'} border-r border-white/5 flex-col z-30 transition-all duration-300 relative cursor-pointer group/sidebar overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.5)]`}
            >
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <img src="/images/green_farm_banner.png" className="absolute top-1/2 left-0 w-full h-full object-cover -translate-y-1/2 scale-[3.5] origin-center opacity-100" alt="Sidebar Banner" />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                <div className="relative z-10 p-6 flex flex-col pointer-events-none">
                    <div className={`flex items-center gap-3 bg-black/60 p-2 rounded-2xl border border-white/20 shadow-xl ${isSidebarExpanded ? 'pr-5' : ''}`}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-yellow-400 to-orange-600 flex items-center justify-center shrink-0 border border-white/20">
                            <img src="/images/cow_avatar.png" alt="Cow" className="w-full h-full object-cover" />
                        </div>
                        {isSidebarExpanded && (
                            <h1 className="text-xl font-black tracking-tighter text-white">
                                CASHCOW <span className="text-yellow-400">VALLEY</span>
                            </h1>
                        )}
                    </div>
                </div>

                <div className="relative z-10 flex-1 px-4 space-y-8 overflow-y-auto py-4">
                    {menuGroups.map((group) => (
                        <div key={group.title} className="space-y-2">
                            {isSidebarExpanded && (
                                <div className="bg-black/50 px-3 py-1.5 rounded-full w-fit mb-2 border border-white/10">
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">{group.title}</h4>
                                </div>
                            )}
                            <div className="space-y-2">
                                {group.items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveTab(item.id as any);
                                        }}
                                        className={`w-full flex items-center ${isSidebarExpanded ? 'gap-4 px-4 py-3' : 'justify-center p-4'} rounded-2xl transition-all group ${activeTab === item.id ? 'bg-black/80 border border-white/20 text-white shadow-xl' : 'bg-black/40 border border-transparent text-white hover:bg-black/60 hover:border-white/10'}`}
                                    >
                                        <item.icon size={20} className={activeTab === item.id ? 'text-yellow-400' : 'text-slate-300 group-hover:text-yellow-400'} />
                                        {isSidebarExpanded && (
                                            <span className="font-black uppercase tracking-widest text-xs leading-none">{item.label}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Toggle & Power */}
                <div className="relative z-10 p-4 space-y-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                        className="w-full flex items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 transition-all mb-2"
                        title={isSidebarExpanded ? "Minimize Sidebar" : "Maximize Sidebar"}
                    >
                        {isSidebarExpanded ? <ArrowUpRight className="rotate-180" size={18} /> : <ArrowUpRight size={18} />}
                    </button>

                    <button
                        onClick={handleDisconnect}
                        className={`w-full flex items-center ${isSidebarExpanded ? 'gap-4 px-4 py-4' : 'justify-center p-4'} rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all`}
                    >
                        <Power size={22} />
                        {isSidebarExpanded && (
                            <span className="font-black uppercase tracking-widest text-xs">Disconnect</span>
                        )}
                    </button>
                </div>
            </aside >

            {/* AUTH GATE OVERLAY */}
            {isConnected && !isAuthenticated && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-md w-full mx-4 p-8 rounded-[40px] bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center relative overflow-hidden"
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"></div>

                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-yellow-400 to-orange-600 mx-auto mb-8 flex items-center justify-center shadow-2xl rotate-3">
                            <ShieldCheck size={48} className="text-white drop-shadow-lg" />
                        </div>

                        {needsRegistration ? (
                            <>
                                <h2 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">Initialize Account</h2>
                                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                                    New farmer detected! Register to start your journey in <span className="text-yellow-400 font-bold">Cash Cow Valley</span>.
                                </p>

                                {/* Referral Address Input */}
                                <div className="mb-6 text-left">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Referral Address (Optional)</label>
                                    <input
                                        type="text"
                                        value={referralAddress}
                                        onChange={(e) => setReferralAddress(e.target.value)}
                                        placeholder="0x... (leave empty for default)"
                                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-sm font-mono placeholder:text-slate-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div className="bg-black/40 p-3 rounded-xl border border-white/5 mb-6">
                                    <p className="text-[10px] text-slate-500 leading-relaxed">
                                        Registration fee: <span className="text-yellow-400 font-bold">{REGISTRATION_FEE} ETH</span> + gas
                                    </p>
                                </div>

                                <button
                                    onClick={handleRegister}
                                    disabled={isRegTxPending || isRegTxConfirming}
                                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                                >
                                    {isRegTxPending ? 'Confirm in Wallet...' : isRegTxConfirming ? 'Confirming on Chain...' : 'Register Now (Gas Fee)'}
                                </button>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">Security Check</h2>
                                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                                    Please <span className="text-yellow-400 font-bold uppercase tracking-wider">sign the message</span> in your wallet to verify ownership and access your farm dashboard.
                                </p>
                                <button
                                    onClick={handleAuthenticate}
                                    disabled={isAuthenticating}
                                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50"
                                >
                                    {isAuthenticating ? 'Waiting for Sign...' : 'Sign to Login'}
                                </button>
                            </>
                        )}

                        {authError && (
                            <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2 justify-center">
                                <AlertTriangle size={14} /> {authError}
                            </div>
                        )}

                        <div className="mt-8 flex items-center justify-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/5 w-fit mx-auto">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative h-full overflow-y-auto overflow-x-hidden pb-24 md:pb-0">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30">
                        <img src="/images/farm_bg.png" className="w-full h-full object-cover blur-3xl opacity-20" alt="" />
                    </div>
                </div>

                {/* Custom Sticky Dashboard Header */}
                <div className="sticky top-0 z-[40] w-full bg-black/60 backdrop-blur-xl border-b border-white/10 py-3 sm:py-5 px-4 sm:px-8 md:px-12">
                    <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Resource Balances */}
                        <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center lg:justify-start">
                            <StatWidget icon={Coins} value={usdtBalance.toLocaleString()} label="USDT" color="text-yellow-400" />
                            <StatWidget icon={Database} value={cowTokenBalance.toLocaleString()} label="$COW" color="text-yellow-500" />
                            <StatWidget icon={Milk} value={milkCount.toLocaleString()} label="Milk" color="text-sky-400" />
                            <StatWidget icon={Leaf} value={grassCount.toLocaleString()} label="Grass" color="text-emerald-400" />
                        </div>

                        {/* Wallet Section */}
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <w3m-button />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 sm:p-8 md:p-12 relative z-10 max-w-[1600px] mx-auto w-full">
                    {/* Top Stats Bar Removed (Merged into Header above) */}

                    <AnimatePresence mode="wait">
                        {activeTab === 'farm' && (
                            <motion.div
                                key="farm"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6 sm:space-y-10 relative min-h-[calc(100vh-10rem)] p-4 sm:p-8 md:p-12 rounded-3xl sm:rounded-[56px] overflow-hidden"
                            >
                                {/* Background Image for Farm */}
                                <div className="absolute inset-0 z-0 scale-105">
                                    <img src="/images/farm_bg.png" className="w-full h-full object-cover" alt="Farm Background" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10"></div>
                                </div>

                                <div className="relative z-10 space-y-6 sm:space-y-10">
                                    {/* Farm Overview with Glassmorphism */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                                        <div>
                                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white drop-shadow-lg">The Barn</h2>
                                            <div className="bg-black/60 px-4 py-2 rounded-full border border-white/10 w-fit mt-3 shadow-xl">
                                                <p className="text-emerald-400 font-bold uppercase tracking-widest text-[8px] sm:text-[10px] drop-shadow-md">Active Production • Season 1</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
                                            <button onClick={handleWatchAd} disabled={dailyAdCount >= 50 || isActionLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 md:px-10 py-3 md:py-4 rounded-2xl md:rounded-[24px] font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:scale-105 transition-all shadow-xl disabled:opacity-50 shadow-orange-500/20">
                                                <Flame size={16} /> Care ({dailyAdCount}/50)
                                            </button>
                                            <button onClick={handleHarvest} disabled={isActionLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-black px-6 md:px-10 py-3 md:py-4 rounded-2xl md:rounded-[24px] font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:scale-105 transition-all shadow-xl shadow-white/10">
                                                <Leaf size={16} /> Harvest
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                                        <Card title="Staked Cows" value={cows.length} icon={Database} trend="+2 new" color="emerald" />
                                        <Card title="Milk Yield" value={`${(cows.length * 10).toLocaleString()} / hr`} icon={Leaf} trend="Stable" color="blue" />
                                        <Card title="Active Land" value={`${useGameStore.getState().landSlots} PLOTS`} icon={Coins} trend="Max Capacity" color="yellow" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {cows.length > 0 ? cows.map((cow: any) => <CowCard key={cow.id} cow={cow} />) : (
                                            <div className="col-span-full border-2 border-white/10 rounded-[48px] p-20 text-center space-y-4">
                                                <div className="text-6xl text-slate-700">🚜</div>
                                                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No activity detected. Buy your first cow in the market.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'staking' && (
                            <motion.div
                                key="staking"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-8 sm:space-y-12 relative min-h-[calc(100vh-10rem)] p-4 sm:p-8 md:p-12 rounded-3xl sm:rounded-[56px] overflow-hidden"
                            >
                                {/* Background Image for Staking */}
                                <div className="absolute inset-0 z-0">
                                    <img src="/images/farm_bg.png" className="w-full h-full object-cover scale-105" alt="Staking Background" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20"></div>
                                </div>
                                <div className="relative z-10 space-y-12">
                                    {/* Staking Mode Selector */}
                                    <div className="flex flex-col items-center gap-6">
                                        <h3 className="text-4xl font-black uppercase tracking-tighter text-center">NFT VIP Staking Vault</h3>
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                            Claim Fee: 10 Tokens Per Op
                                        </div>
                                        <div className="bg-white/5 p-1 rounded-full border border-white/5 flex">
                                            <button
                                                onClick={() => setStakingMode('unlocked')}
                                                className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] transition-all ${stakingMode === 'unlocked' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-slate-500 hover:text-white'}`}
                                            >
                                                Unlocked (Flexible)
                                            </button>
                                            <button
                                                onClick={() => setStakingMode('locked')}
                                                className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] transition-all ${stakingMode === 'locked' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-500 hover:text-white'}`}
                                            >
                                                Locked (100 Days)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Pool List - Horizontal Rectangles for current mode */}
                                    <div className="flex flex-col gap-8">
                                        <StakingPool
                                            type="Baby Golden Cow"
                                            mode={stakingMode}
                                            image="/images/cow_avatar.png"
                                            reward={stakingMode === 'locked' ? '10/day' : 'Dynamic Share'}
                                            fee={stakingMode === 'locked' ? '500 $COW' : 'FREE'}
                                            color={stakingMode === 'locked' ? 'from-orange-500' : 'from-yellow-400'}
                                        />
                                        <StakingPool
                                            type="Golden Cow"
                                            mode={stakingMode}
                                            image="/images/nft_tier_golden_cow.png"
                                            reward={stakingMode === 'locked' ? '100/day' : 'Dynamic Share'}
                                            fee={stakingMode === 'locked' ? '5000 $COW' : 'FREE'}
                                            color={stakingMode === 'locked' ? 'from-orange-600' : 'from-yellow-500'}
                                        />
                                        <StakingPool
                                            type="Land Lord Farm"
                                            mode={stakingMode}
                                            image="/images/nft_tier_landlord_farm.png"
                                            reward={stakingMode === 'locked' ? '500/day' : 'Dynamic Share'}
                                            fee={stakingMode === 'locked' ? '25000 $COW' : 'FREE'}
                                            color={stakingMode === 'locked' ? 'from-orange-700' : 'from-orange-500'}
                                        />
                                    </div>

                                    {/* Wallet Context */}
                                    <div className="p-8 rounded-[32px] bg-white/5 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                                <Users size={24} className="text-yellow-500" />
                                            </div>
                                            <div>
                                                <p className="font-black uppercase tracking-widest text-[10px] text-slate-500">Global Participation</p>
                                                <p className="text-xl font-black uppercase tracking-tighter">842 Golden NFTS Staked</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all text-slate-300">View Tutorial</button>
                                            <button className="px-8 py-4 rounded-2xl bg-yellow-500 text-black font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-yellow-500/20">Buy Golden Pack</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'market' && (
                            <motion.div
                                key="market"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6 sm:space-y-10 relative min-h-[calc(100vh-10rem)] p-4 sm:p-8 md:p-12 rounded-3xl sm:rounded-[56px] overflow-hidden"
                            >
                                {/* Background Image for Market */}
                                <div className="absolute inset-0 z-0">
                                    <img src="/images/farm_bg.png" className="w-full h-full object-cover scale-105" alt="Market Background" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20"></div>
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className="text-4xl font-black uppercase tracking-tighter mb-2">In-App Market</h3>
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Essentials for your thriving farm</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={() => handleSellMilk(milkCount)} className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 hover:text-white transition-all">Sell All Milk</button>
                                            <button onClick={() => handleSwapGold(goldBalance, 'COW')} className="bg-yellow-500 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all">Gold → $COW</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <MarketItem
                                            name="Organic Grass Bundle"
                                            desc="Essential feed for standard cows."
                                            price={10}
                                            icon={Leaf}
                                            color="text-emerald-400"
                                            bg="bg-emerald-500/5"
                                            onBuy={() => handleBuyInApp('GRASS', 1)}
                                        />
                                        <MarketItem
                                            name="Baby Cow (Standard)"
                                            desc="Entry level livestock. Needs care."
                                            price={500}
                                            icon={Plus}
                                            color="text-blue-500"
                                            bg="bg-blue-500/5"
                                            onBuy={() => handleBuyInApp('BABY_COW', 1)}
                                        />
                                        <MarketItem
                                            name="Adult Cow (Standard)"
                                            desc="Productive livestock. High yield."
                                            price={2000}
                                            icon={Database}
                                            color="text-purple-500"
                                            bg="bg-purple-500/5"
                                            onBuy={() => handleBuyInApp('COW', 1)}
                                        />
                                        <MarketItem
                                            name="Planting Land Slot"
                                            desc="Autonomous grass growth facility."
                                            price={1000}
                                            icon={ArrowUpRight}
                                            color="text-orange-500"
                                            bg="bg-orange-500/5"
                                            onBuy={() => handleBuyInApp('LAND', 1)}
                                        />
                                        <MarketItem
                                            name="Vitamin Premium"
                                            desc="Instant care boost. Skips ads."
                                            price={50}
                                            icon={Flame}
                                            color="text-yellow-500"
                                            bg="bg-yellow-500/5"
                                            onBuy={() => handleBuyInApp('VITAMIN', 1)}
                                        />
                                        <MarketItem
                                            name="Automated Harvester"
                                            desc="Coming soon. Smart collection."
                                            price={5000}
                                            disabled
                                            icon={ShieldCheck}
                                            color="text-slate-500"
                                            bg="bg-white/5"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'vault-inapp' && (
                            <motion.div
                                key="vault"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6 sm:space-y-10 relative min-h-[calc(100vh-10rem)] p-4 sm:p-8 md:p-12 rounded-3xl sm:rounded-[56px] overflow-hidden flex flex-col justify-center"
                            >
                                {/* Background Image for Vault */}
                                <div className="absolute inset-0 z-0">
                                    <img src="/images/vault_bg.png" className="w-full h-full object-cover" alt="Vault Background" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/30 to-transparent"></div>
                                </div>

                                <div className="relative z-10 space-y-10 mt-auto mb-auto">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                                        <div className="max-w-full overflow-hidden">
                                            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-yellow-400 drop-shadow-md break-words">In-App Vault</h2>
                                            <div className="bg-black/50 px-4 py-2 rounded-full border border-white/10 w-fit mt-3">
                                                <p className="text-sky-400 font-bold uppercase tracking-widest text-[8px] sm:text-[10px] drop-shadow-md">Premium Off-Chain Staking</p>
                                            </div>
                                        </div>
                                        <button onClick={handleClaimInApp} className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-600 text-black px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:scale-105 transition-all shadow-2xl shadow-yellow-500/40">
                                            Claim Rewards
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                                        <div className="bg-transparent border border-yellow-500/60 rounded-3xl sm:rounded-[48px] p-6 sm:p-10 space-y-6 sm:space-y-8 relative overflow-hidden group shadow-2xl">
                                            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-transparent border border-yellow-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                                                    <TrendingUp className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" size={24} />
                                                </div>
                                                <div className="max-w-full overflow-hidden">
                                                    <h4 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-yellow-400 drop-shadow-md break-words">Gold Stake</h4>
                                                    <div className="bg-black/40 px-3 py-1.5 rounded-full mt-2 border border-white/10 w-fit">
                                                        <p className="text-[8px] sm:text-xs font-bold text-orange-400 uppercase drop-shadow-md">Yield: 0.1 Milk / 1k Gold / hr</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 relative z-10">
                                                <div className="flex justify-between items-center bg-black/40 p-6 rounded-3xl border border-white/20 shadow-inner">
                                                    <span className="text-xs font-black uppercase text-emerald-400 drop-shadow-md">Total Staked</span>
                                                    <span className="text-3xl font-black text-yellow-400 drop-shadow-lg">{(useGameStore.getState().web2Stakes.find(s => s.asset_type === 'GOLD')?.amount || 0).toLocaleString()} Gold</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                                <button onClick={() => handleStakeInApp('GOLD', 1000)} className="py-5 rounded-3xl bg-yellow-400 border border-yellow-300 text-black font-black uppercase text-xs hover:scale-105 transition-all shadow-lg">Stake 1K</button>
                                                <button onClick={() => handleStakeInApp('GOLD', 10000)} className="py-5 rounded-3xl bg-orange-500 border border-orange-400 text-black font-black uppercase text-xs hover:scale-105 transition-all shadow-md">Stake 10K</button>
                                            </div>
                                        </div>

                                        <div className="bg-transparent border border-sky-500/60 rounded-[48px] p-10 space-y-8 relative overflow-hidden group shadow-2xl">
                                            <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="flex items-center gap-6 relative z-10">
                                                <div className="w-16 h-16 rounded-3xl bg-transparent border border-sky-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                                                    <Milk className="text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" size={32} />
                                                </div>
                                                <div>
                                                    <h4 className="text-3xl font-black uppercase tracking-tighter text-sky-400 drop-shadow-md">Milk Stake</h4>
                                                    <div className="bg-black/40 px-3 py-1.5 rounded-full mt-2 border border-white/10 w-fit">
                                                        <p className="text-xs font-bold text-orange-400 uppercase drop-shadow-md">Yield: 1 Gold / 10 Milk / hr</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 relative z-10">
                                                <div className="flex justify-between items-center bg-black/40 p-6 rounded-3xl border border-white/20 shadow-inner">
                                                    <span className="text-xs font-black uppercase text-emerald-400 drop-shadow-md">Total Staked</span>
                                                    <span className="text-3xl font-black text-sky-400 drop-shadow-lg">{(useGameStore.getState().web2Stakes.find(s => s.asset_type === 'MILK')?.amount || 0).toLocaleString()} Milk</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                                <button onClick={() => handleStakeInApp('MILK', 100)} className="py-5 rounded-3xl bg-sky-400 border border-sky-300 text-black font-black uppercase text-xs hover:scale-105 transition-all shadow-lg">Stake 100</button>
                                                <button onClick={() => handleStakeInApp('MILK', 500)} className="py-5 rounded-3xl bg-blue-600 border border-blue-500 text-white font-black uppercase text-xs hover:scale-105 transition-all shadow-md">Stake 500</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'listing' && (
                            <motion.div
                                key="listing"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-10 relative min-h-[calc(100vh-8rem)] p-12 rounded-[56px] overflow-hidden"
                            >
                                <div className="absolute inset-0 z-0">
                                    <img src="/images/farm_bg.png" className="w-full h-full object-cover scale-105" alt="Market Background" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20"></div>
                                </div>
                                <div className="relative z-10 space-y-10">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-2xl border-2 border-yellow-500/30 overflow-hidden shadow-2xl">
                                                <img src="/images/nft_market_display.png" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h2 className="text-5xl font-black uppercase tracking-tighter text-yellow-400 drop-shadow-md">NFT Market</h2>
                                                <p className="text-sky-400 font-bold uppercase tracking-widest text-[10px] drop-shadow-md">Trade legendary golden livestock</p>
                                            </div>
                                        </div>
                                        <button className="bg-yellow-500 text-black px-10 py-4 rounded-[28px] font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-yellow-500/20">
                                            List My NFT
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-transparent border-2 border-white/20 p-8 rounded-[48px] flex flex-col md:flex-row items-center gap-8 group hover:bg-white/5 transition-all">
                                                <div className="w-28 h-28 shrink-0 rounded-3xl overflow-hidden border-2 border-yellow-500/30 shadow-xl bg-black/40">
                                                    <img src="/images/nft_tier_golden_cow.png" className="w-full h-full object-cover scale-125 group-hover:scale-150 transition-transform duration-700" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-3xl font-black uppercase tracking-tighter">Golden Cow #{1000 + i}</h4>
                                                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">Rare Tier • Level 4</p>
                                                    <div className="flex gap-4 mt-4 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                                        <span>Daily Yield: 100 Milk</span>
                                                        <span>Rank: Gold</span>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-center md:items-end gap-3">
                                                    <p className="text-4xl font-black text-yellow-500 tracking-tighter">1,500 <span className="text-sm">$COW</span></p>
                                                    <button className="bg-white text-black px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-colors shadow-lg">Buy Now</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'finance' && (
                            <motion.div
                                key="finance"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-10 relative min-h-[calc(100vh-10rem)] p-12 rounded-[56px] overflow-hidden"
                            >
                                <div className="absolute inset-0 z-0">
                                    <img src="/images/vault_bg.png" className="w-full h-full object-cover scale-105" alt="Finance Background" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40"></div>
                                </div>
                                <div className="relative z-10 space-y-10">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                                        <div className="max-w-full overflow-hidden">
                                            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-md break-words leading-none">Financial Hub</h2>
                                            <div className="bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30 w-fit mt-3">
                                                <p className="text-emerald-400 font-bold uppercase tracking-widest text-[8px] sm:text-[10px] drop-shadow-md whitespace-nowrap">Secure Treasury Operations</p>
                                            </div>
                                        </div>
                                        <div className="bg-black/60 px-6 py-3 rounded-2xl border-2 border-yellow-500/50 w-full sm:w-auto text-center sm:text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Treasury Balance</p>
                                            <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent tracking-tighter">12,450.00 USDT</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                                        <div className="bg-black/60 p-6 sm:p-10 rounded-3xl sm:rounded-[48px] border-2 border-white/10 space-y-6 sm:space-y-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-2xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tighter">Bank Actions</h3>
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                    <ArrowUpCircle className="text-emerald-400" size={20} />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <button onClick={() => handleDeposit('USDT', 100)} className="w-full bg-emerald-500 text-black py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:scale-[1.02] transition-all shadow-lg active:scale-95">Deposit 100 USDT</button>
                                                <button onClick={() => handleWithdraw('COW', 100)} className="w-full bg-black/40 border-2 border-white/10 text-white py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white/5 transition-all active:scale-95">Withdraw 100 COW</button>
                                            </div>
                                        </div>

                                        <div className="bg-black/60 p-6 sm:p-10 rounded-3xl sm:rounded-[48px] border-2 border-white/10 space-y-6 sm:space-y-8 relative overflow-hidden flex flex-col justify-between shadow-2xl">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tighter">Transaction Ledger</h3>
                                                <button className="px-4 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Live History</button>
                                            </div>
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                            <ArrowUpRight size={14} className="text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] sm:text-xs font-black uppercase">Deposit</p>
                                                            <p className="text-[8px] font-bold text-slate-500">{i} min ago</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs sm:text-sm font-black text-emerald-400">+100 USDT</p>
                                                        <div className="flex items-center gap-1.5 justify-end mt-0.5">
                                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                                            <p className="text-[8px] text-emerald-500 font-black uppercase">Sync</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'referral' && (
                            <motion.div
                                key="referral"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative min-h-[calc(100vh-10rem)] p-4 sm:p-8 md:p-12 rounded-3xl sm:rounded-[56px] overflow-hidden flex flex-col items-center justify-center text-center"
                            >
                                <div className="absolute inset-0 z-0">
                                    <img src="/images/farm_bg.png" className="w-full h-full object-cover scale-105" alt="Network Background" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40"></div>
                                </div>
                                <div className="relative z-10 space-y-6 sm:space-y-8 max-w-2xl">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-[32px] sm:rounded-[48px] flex items-center justify-center mx-auto shadow-2xl">
                                        <Users className="text-yellow-400 w-12 h-12 sm:w-16 sm:h-16" />
                                    </div>
                                    <div className="space-y-2 sm:space-y-4">
                                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white">Network Ops</h2>
                                        <p className="text-sky-400 font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[8px] sm:text-xs">Era of Connectivity • Under Construction</p>
                                    </div>
                                    <div className="bg-black/60 p-6 sm:p-10 rounded-3xl sm:rounded-[40px] border-2 border-white/10">
                                        <p className="text-slate-400 font-medium text-sm sm:text-lg leading-relaxed">
                                            The Global Referral Network is being synchronized. Prepare to expand your farm's reach and earn collaborative rewards.
                                        </p>
                                        <button className="mt-6 sm:mt-8 px-8 sm:px-12 py-4 sm:py-5 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] text-slate-500 cursor-not-allowed">
                                            Synchronization in Progress
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative min-h-[calc(100vh-10rem)] p-4 sm:p-8 md:p-12 rounded-3xl sm:rounded-[56px] overflow-hidden"
                            >
                                <div className="absolute inset-0 z-0 scale-105">
                                    <img src="/images/farm_bg.png" className="w-full h-full object-cover" alt="Profile Background" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20"></div>
                                </div>
                                <div className="relative z-10 max-w-4xl mx-auto space-y-8 sm:space-y-12">
                                    <div className="text-center space-y-4 sm:space-y-6">
                                        <div className="w-32 h-32 sm:w-44 sm:h-44 mx-auto bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-[32px] sm:rounded-[56px] flex items-center justify-center text-6xl sm:text-8xl shadow-2xl shadow-yellow-500/40 relative group hover:rotate-6 transition-transform duration-500">
                                            <span className="group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">🤠</span>
                                        </div>
                                        <div className="space-y-2 sm:space-y-4">
                                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter drop-shadow-lg text-white">Legendary Farmer</h2>
                                            <div className="bg-yellow-500/10 border border-yellow-500/20 px-6 py-2 rounded-full w-fit mx-auto shadow-sm">
                                                <p className="text-yellow-500 font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-[8px] sm:text-[10px]">Rank: Silver Master • Est. Feb 2026</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="bg-black/60 p-6 sm:p-10 rounded-3xl sm:rounded-[48px] border-2 border-white/10 text-center hover:bg-white/5 transition-all shadow-xl">
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 sm:mb-4">Barn Status</p>
                                            <p className={`text-2xl sm:text-4xl font-black uppercase tracking-tighter ${useGameStore.getState().hasBarn ? 'text-emerald-400' : 'text-slate-600'}`}>{useGameStore.getState().hasBarn ? "ACTIVE" : "INACTIVE"}</p>
                                        </div>
                                        <div className="bg-black/60 p-6 sm:p-10 rounded-3xl sm:rounded-[48px] border-2 border-white/10 text-center hover:bg-white/5 transition-all shadow-xl">
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 sm:mb-4">Total Assets</p>
                                            <p className="text-2xl sm:text-4xl font-black text-yellow-500 tracking-tighter uppercase">{useGameStore.getState().landSlots} PLOTS</p>
                                        </div>
                                    </div>

                                    <div className="bg-black/60 p-6 sm:p-10 rounded-3xl sm:rounded-[56px] border-2 border-white/10 space-y-4 sm:space-y-8 hover:bg-white/5 transition-all shadow-2xl">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center py-4 sm:py-6 border-b border-white/10 gap-2">
                                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400">Authenticated Ledger</span>
                                            <span className="text-[10px] sm:text-xs font-mono text-slate-100 bg-black/40 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-white/10 shadow-inner break-all">{address?.slice(0, 10)}...{address?.slice(-8)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-4 sm:py-6">
                                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400">Security Clearance</span>
                                            <div className="flex items-center gap-2 sm:gap-4">
                                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)] animate-pulse"></div>
                                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">Level 4 Verified</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ADMIN PANEL TAB */}
                        {activeTab === 'admin' && isAdmin && (
                            <motion.div
                                key="admin"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative min-h-[calc(100vh-10rem)] p-4 sm:p-8 md:p-12 rounded-3xl sm:rounded-[56px] overflow-hidden"
                            >
                                <div className="absolute inset-0 z-0 bg-gradient-to-br from-red-950/30 via-black to-black"></div>
                                <div className="relative z-10 max-w-6xl mx-auto space-y-8">
                                    {/* Admin Header */}
                                    <div className="text-center space-y-4">
                                        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-red-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30">
                                            <Crown size={40} className="text-white" />
                                        </div>
                                        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-white">Admin Panel</h2>
                                        <div className="bg-red-500/10 border border-red-500/20 px-6 py-2 rounded-full w-fit mx-auto">
                                            <p className="text-red-400 font-bold uppercase tracking-[0.3em] text-[10px]">Root Access • Unlimited Balance</p>
                                        </div>
                                    </div>

                                    {/* Platform Stats */}
                                    {platformStats && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Total Users', value: platformStats.total_users, color: 'text-blue-400' },
                                                { label: 'Total Cows', value: platformStats.total_cows, color: 'text-emerald-400' },
                                                { label: 'Total Gold', value: platformStats.total_gold, color: 'text-yellow-400' },
                                                { label: 'Total $COW', value: platformStats.total_cow_token, color: 'text-orange-400' },
                                            ].map((stat) => (
                                                <div key={stat.label} className="bg-black/60 p-4 sm:p-6 rounded-2xl border border-white/10 text-center">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">{stat.label}</p>
                                                    <p className={`text-xl sm:text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Transfer Form */}
                                    <div className="bg-black/60 p-6 sm:p-8 rounded-3xl border-2 border-red-500/20 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Send size={20} className="text-red-400" />
                                            <h3 className="text-lg font-black uppercase tracking-widest text-white">Transfer Items to User</h3>
                                        </div>

                                        {adminMessage && (
                                            <div className={`p-3 rounded-xl text-sm font-bold ${adminMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                                                {adminMessage.text}
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Target Wallet Address</label>
                                                <input
                                                    type="text"
                                                    value={adminTargetWallet}
                                                    onChange={(e) => setAdminTargetWallet(e.target.value)}
                                                    placeholder="0x..."
                                                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-red-500/50 focus:outline-none transition-all"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Item Type</label>
                                                    <select
                                                        value={adminItemType}
                                                        onChange={(e) => setAdminItemType(e.target.value)}
                                                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500/50 focus:outline-none transition-all"
                                                    >
                                                        <option value="GOLD">🪙 Gold</option>
                                                        <option value="USDT">💵 USDT</option>
                                                        <option value="COW_TOKEN">🐮 $COW Token</option>
                                                        <option value="GRASS">🌿 Grass</option>
                                                        <option value="MILK">🥛 Milk</option>
                                                        <option value="LAND">🏡 Land Slots</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Amount</label>
                                                    <input
                                                        type="number"
                                                        value={adminAmount}
                                                        onChange={(e) => setAdminAmount(e.target.value)}
                                                        placeholder="100"
                                                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500/50 focus:outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleAdminTransfer}
                                                disabled={isActionLoading || !adminTargetWallet || !adminAmount}
                                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all disabled:opacity-50"
                                            >
                                                {isActionLoading ? 'Processing...' : `Transfer ${adminItemType}`}
                                            </button>
                                        </div>
                                    </div>

                                    {/* User List */}
                                    <div className="bg-black/60 p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <UserCog size={20} className="text-slate-400" />
                                                <h3 className="text-lg font-black uppercase tracking-widest text-white">Registered Users</h3>
                                            </div>
                                            <button
                                                onClick={fetchAdminUsers}
                                                className="text-xs font-bold text-yellow-400 hover:text-yellow-300 transition-all uppercase tracking-widest"
                                            >
                                                Refresh
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                        <th className="text-left py-3 px-2">Wallet</th>
                                                        <th className="text-left py-3 px-2">Role</th>
                                                        <th className="text-right py-3 px-2">Gold</th>
                                                        <th className="text-right py-3 px-2">USDT</th>
                                                        <th className="text-right py-3 px-2">$COW</th>
                                                        <th className="text-right py-3 px-2">Cows</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {adminUsers.map((user) => (
                                                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                                            <td className="py-3 px-2 font-mono text-xs text-slate-300">
                                                                <button
                                                                    onClick={() => setAdminTargetWallet(user.wallet_address)}
                                                                    className="hover:text-yellow-400 transition-all"
                                                                    title="Click to set as transfer target"
                                                                >
                                                                    {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                                                                </button>
                                                            </td>
                                                            <td className="py-3 px-2">
                                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                                    {user.role}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-2 text-right text-yellow-400 font-bold">{user.gold_balance}</td>
                                                            <td className="py-3 px-2 text-right text-emerald-400 font-bold">{user.usdt_balance}</td>
                                                            <td className="py-3 px-2 text-right text-orange-400 font-bold">{user.cow_token}</td>
                                                            <td className="py-3 px-2 text-right text-white font-bold">{user.cow_count}</td>
                                                        </tr>
                                                    ))}
                                                    {adminUsers.length === 0 && (
                                                        <tr><td colSpan={6} className="text-center py-8 text-slate-500">No users found</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-around px-4 py-3 md:hidden">
                {menuGroups[0].items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-yellow-400 scale-110' : 'text-slate-500'}`}
                        >
                            <div className={`p-2 rounded-xl ${activeTab === item.id ? 'bg-yellow-400/10' : ''}`}>
                                <Icon size={20} />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest">
                                {item.id === 'farm' ? 'FARM' :
                                    item.id === 'vault-inapp' ? 'VAULT' :
                                        item.id === 'market' ? 'SHOP' :
                                            item.id === 'staking' ? 'STAKE' :
                                                item.label.split(' ')[0]}
                            </span>
                        </button>
                    );
                })}
                {/* Staking/NFT Tab */}
                {menuGroups[1].items.slice(0, 1).map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-yellow-400 scale-110' : 'text-slate-500'}`}
                    >
                        <div className={`p-2 rounded-xl ${activeTab === item.id ? 'bg-yellow-400/10' : ''}`}>
                            <item.icon size={20} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest">STAKE</span>
                    </button>
                ))}

                {/* Profile Tab */}
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-yellow-400 scale-110' : 'text-slate-500'}`}
                >
                    <div className={`p-2 rounded-xl ${activeTab === 'profile' ? 'bg-yellow-400/10' : ''}`}>
                        <ShieldCheck size={20} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest">PROFILE</span>
                </button>
            </nav>
        </div >
    );
}

function StatWidget({ icon: Icon, value, label, color }: any) {
    return (
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-black/60 border border-white/10 rounded-full cursor-help group shadow-lg shrink-0">
            <Icon size={14} className={`${color} sm:w-[18px] sm:h-[18px]`} />
            <div className="flex flex-col leading-none">
                <span className={`text-[11px] sm:text-[13px] font-black tracking-tighter ${color}`}>{value}</span>
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">{label}</span>
            </div>
        </div>
    );
}

function Card({ title, value, icon: Icon, trend, color, className, titleColor, valueColor, trendColor }: any) {
    const theme: any = {
        emerald: {
            border: 'border-emerald-500/50',
            iconBg: 'from-emerald-400 to-emerald-600',
            iconBorder: 'border-emerald-300',
            iconShadow: 'shadow-[0_0_25px_rgba(16,185,129,0.5)]',
            iconText: 'text-black fill-black'
        },
        yellow: {
            border: 'border-yellow-500/50',
            iconBg: 'from-yellow-400 to-amber-500',
            iconBorder: 'border-yellow-200',
            iconShadow: 'shadow-[0_0_25px_rgba(234,179,8,0.5)]',
            iconText: 'text-black fill-black'
        },
        blue: {
            border: 'border-sky-500/50',
            iconBg: 'from-sky-400 to-blue-500',
            iconBorder: 'border-sky-300',
            iconShadow: 'shadow-[0_0_25px_rgba(14,165,233,0.5)]',
            iconText: 'text-black fill-black'
        },
        orange: {
            border: 'border-orange-500/50',
            iconBg: 'from-orange-400 to-red-500',
            iconBorder: 'border-orange-300',
            iconShadow: 'shadow-[0_0_25px_rgba(249,115,22,0.5)]',
            iconText: 'text-black fill-black'
        }
    };
    const t = theme[color] || theme.emerald;

    return (
        <div className={`p-6 sm:p-8 rounded-3xl sm:rounded-[32px] border ${t.border} bg-black/60 relative group overflow-hidden shadow-2xl ${className || ''}`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="flex bg-black/40 px-3 py-1.5 rounded-full w-fit mb-4 border border-white/10 shadow-sm relative z-10">
                        <h4 className={`font-black uppercase tracking-widest text-[8px] sm:text-xs drop-shadow-md ${titleColor || 'text-white'}`}>{title}</h4>
                    </div>
                </div>
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${t.iconBg} border ${t.iconBorder} flex items-center justify-center shrink-0 ${t.iconShadow} relative z-10 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`${t.iconText} w-5 h-5 sm:w-7 sm:h-7`} />
                </div>
            </div>
            <p className={`text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-4 sm:mb-5 drop-shadow-lg relative z-10 ${valueColor || 'text-white'}`}>{value}</p>
            <div className={`flex items-center gap-2 text-[8px] sm:text-xs font-bold bg-black/40 w-fit px-3 py-1.5 rounded-full border border-white/20 shadow-sm relative z-10 ${trendColor || 'text-white'}`}>
                <ArrowUpRight size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span className="drop-shadow-sm">{trend}</span>
            </div>
        </div>
    );
}

function CowCard({ cow }: any) {
    return (
        <div className="bg-black/60 border border-white/10 rounded-3xl sm:rounded-[32px] p-6 hover:border-yellow-500/30 transition-all duration-300 group shadow-xl">
            <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-500">
                    🐄
                </div>
                <div className="text-right">
                    <span className="block text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Type</span>
                    <span className="text-xs sm:text-sm font-black uppercase text-emerald-400">Standard</span>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Happiness</span>
                        <span className="text-[10px] sm:text-xs font-black">{cow.happiness}%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${cow.happiness}%` }}
                            className={`h-full rounded-full ${cow.happiness > 50 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'}`}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-black/40 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10">
                        <span className="block text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Level</span>
                        <p className="text-sm sm:text-lg font-black tracking-tighter">LV {cow.level}</p>
                    </div>
                    <div className="bg-black/40 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10">
                        <span className="block text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Yield</span>
                        <p className="text-sm sm:text-lg font-black tracking-tighter">{cow.level} /HR</p>
                    </div>
                </div>

                <button className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[9px] sm:text-xs hover:bg-yellow-400 transition-colors shadow-lg">
                    Feed Grass
                </button>
            </div>
        </div>
    );
}

function StakingPool({ type, mode, image, reward, fee, color }: any) {
    return (
        <div className="w-full">
            <div className={`p-6 sm:p-10 rounded-3xl sm:rounded-[48px] bg-transparent border-2 border-white/10 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500 shadow-2xl hover:border-yellow-400/50 hover:bg-white/5`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${color} to-transparent opacity-10 pointer-events-none z-0`}></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-10">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-yellow-400/50 shadow-[0_0_30px_rgba(234,179,8,0.3)] bg-gradient-to-tr from-yellow-500/20 to-orange-500/20 group-hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] transition-shadow">
                        <img src={image} alt={type} className="w-full h-full object-cover scale-[1.15] group-hover:scale-125 transition-transform duration-700 mt-2" />
                    </div>

                    <div className="flex-1 w-full flex flex-col gap-4 sm:gap-6">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 sm:gap-6">
                            <div>
                                <h4 className="text-xl sm:text-3xl font-black uppercase tracking-tighter mb-1.5 sm:mb-2 leading-none text-white drop-shadow-lg">{type}</h4>
                                <div className="flex bg-black/40 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full w-fit border border-white/10 shadow-sm">
                                    <p className={`font-black uppercase tracking-widest text-[8px] sm:text-xs ${mode === 'locked' ? 'text-orange-400' : 'text-yellow-400'} drop-shadow-md`}>{mode} POOL</p>
                                </div>
                            </div>
                            <button className={`w-full lg:w-auto py-3 sm:py-4 px-6 sm:px-10 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-sm transition-all shadow-xl bg-yellow-500 text-black hover:bg-white hover:scale-105`}>
                                Enter Vault
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-black/40 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 gap-1">
                                <span className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Staking Fee</span>
                                <span className="text-[10px] sm:text-sm font-black whitespace-nowrap text-white">{fee}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-black/40 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 gap-1">
                                <span className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Fixed Yield</span>
                                <span className="text-[10px] sm:text-sm font-black whitespace-nowrap text-emerald-400 drop-shadow-md">{reward}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 mt-2 flex items-center justify-between text-slate-500">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em]">Pool Active</span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em]">APY: 84.1%</span>
            </div>
        </div>
    );
}

function MarketItem({ name, desc, price, icon: Icon, color, bg, disabled, onBuy }: any) {
    const isEmerald = color.includes('emerald');
    const isBlue = color.includes('blue');
    const isPurple = color.includes('purple');
    const isOrange = color.includes('orange');
    const isYellow = color.includes('yellow');

    let badgeGradient = 'from-slate-400 to-slate-600';
    let badgeBorder = 'border-slate-300';
    let badgeShadow = 'shadow-slate-500/50';

    if (isEmerald) { badgeGradient = 'from-emerald-400 to-emerald-600'; badgeBorder = 'border-emerald-300'; badgeShadow = 'shadow-[0_0_20px_rgba(16,185,129,0.5)]'; }
    else if (isBlue) { badgeGradient = 'from-sky-400 to-blue-500'; badgeBorder = 'border-sky-300'; badgeShadow = 'shadow-[0_0_20px_rgba(14,165,233,0.5)]'; }
    else if (isPurple) { badgeGradient = 'from-purple-400 to-purple-600'; badgeBorder = 'border-purple-300'; badgeShadow = 'shadow-[0_0_20px_rgba(168,85,247,0.5)]'; }
    else if (isOrange) { badgeGradient = 'from-orange-400 to-red-500'; badgeBorder = 'border-orange-300'; badgeShadow = 'shadow-[0_0_20px_rgba(249,115,22,0.5)]'; }
    else if (isYellow) { badgeGradient = 'from-yellow-400 to-amber-500'; badgeBorder = 'border-yellow-200'; badgeShadow = 'shadow-[0_0_20px_rgba(234,179,8,0.5)]'; }


    return (
        <div className={`p-6 sm:p-8 rounded-3xl sm:rounded-[32px] border border-white/20 bg-black/60 space-y-4 sm:space-y-6 group transition-all shadow-xl hover:bg-white/5 ${disabled ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-yellow-500/50'}`}>
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gradient-to-tr ${badgeGradient} border ${badgeBorder} ${badgeShadow} group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={20} className="text-black fill-black sm:w-6 sm:h-6" />
            </div>
            <div>
                <h4 className="font-black uppercase tracking-tighter text-lg sm:text-xl mb-1 text-white">{name}</h4>
                <div className="bg-black/40 px-3 py-1.5 rounded-full w-fit mt-1.5 sm:mt-2 border border-white/5">
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 leading-none uppercase tracking-widest">{desc}</p>
                </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4 sm:mt-6 !mb-0">
                <span className="font-black text-yellow-400 tracking-tighter drop-shadow-md text-base sm:text-lg">{price} GOLD</span>
                <button onClick={onBuy} className="px-5 sm:px-6 py-2 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[8px] sm:text-[10px] hover:bg-yellow-400 transition-colors shadow-md">Buy</button>
            </div>
        </div>
    );
}

