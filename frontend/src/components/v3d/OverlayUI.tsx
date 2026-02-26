'use client';

import { useState, useEffect } from 'react';

/* ───────────────────────────────────────────
   Sections data
   ─────────────────────────────────────────── */
const sections = [
    {
        id: 'hero',
        title: 'Cash Cow Valley',
        content: null, // Hero has custom layout
    },
    {
        id: 'earn',
        title: 'How To Earn',
        subtitle: 'Three steps to your decentralized fortune',
        cards: [
            { step: '01', title: 'Adopt Cows', desc: 'Secure your unique Brahman or Jersey breeds as NFTs to start your journey.', emoji: '🐄' },
            { step: '02', title: 'Feed & Care', desc: 'Use $COW tokens or watch vitamins to maintain happiness and yield.', emoji: '🌿' },
            { step: '03', title: 'Harvest Yield', desc: 'Collect fresh milk daily and convert it into real USDT rewards.', emoji: '🥛' },
        ],
    },
    {
        id: 'tokenomics',
        title: 'Tokenomics',
        subtitle: '$COW Token Powers the Valley',
        bars: [
            { title: 'Liquidity Pool (LP)', value: '50%', desc: 'Locked to ensure deep, stable trading liquidity on DEXs.', color: 'text-emerald-400', width: '50%' },
            { title: 'Community Rewards', value: '40%', desc: 'Distributed daily to active cow farmers.', color: 'text-yellow-400', width: '40%' },
            { title: 'Team & Development', value: '10%', desc: 'Vested linearly over 24 months.', color: 'text-orange-400', width: '10%' },
        ],
        economy: [
            { label: 'LP Buyback', value: '70%', color: 'text-emerald-400' },
            { label: 'Referral Bonus', value: '20%', color: 'text-yellow-400' },
            { label: 'Treasury', value: '10%', color: 'text-white' },
        ],
    },
    {
        id: 'roadmap',
        title: 'Project Roadmap',
        subtitle: 'Our path to agricultural dominance',
        phases: [
            { phase: 'Phase 1: Genesis', items: ['Protocol Launch', 'Web2 Care Mechanics', 'Roll-up Referral System'], color: 'from-emerald-500', emoji: '🌱' },
            { phase: 'Phase 2: Golden Era', items: ['Web3 Staking Pools', 'Golden NFT Release', 'Global Emission Dashboard'], color: 'from-yellow-500', emoji: '🏆' },
            { phase: 'Phase 3: Evolution', items: ['P2P NFT Marketplace', 'PvP Farm Battles', 'Mobile App Beta'], color: 'from-orange-500', emoji: '🚀' },
        ],
    },
    {
        id: 'faq',
        title: 'FAQ',
        faqs: [
            { q: 'Is this game free to play?', a: 'You can start by watching vitamins, but owning a Cow NFT is required for maximum yield potential.' },
            { q: 'Which blockchain is Cash Cow Valley on?', a: 'We currently support BNB Chain (BSC) for mainnet and Sepolia for testnet.' },
            { q: 'Can I trade my cows?', a: 'Yes! All cows are standard ERC-721 NFTs and can be traded on our marketplace.' },
            { q: 'How do referrals work?', a: 'Owners of Cow NFTs earn 20% on all invited player purchases via the Roll-Up system.' },
        ],
    },
];

/* ───────────────────────────────────────────
   Glass Card
   ─────────────────────────────────────────── */
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-black/50 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl ${className}`}>
            {children}
        </div>
    );
}

/* ───────────────────────────────────────────
   Panel Content Renderer
   ─────────────────────────────────────────── */
function PanelContent({ sectionId }: { sectionId: string }) {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return null;

    if (sectionId === 'earn' && 'cards' in section) {
        return (
            <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-1">
                    How To <span className="text-yellow-400">Earn</span>
                </h2>
                <p className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-6">{section.subtitle}</p>
                <div className="space-y-4">
                    {section.cards!.map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-yellow-400/30 transition-all">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{item.emoji}</span>
                                <div>
                                    <h3 className="text-sm font-black text-yellow-400 uppercase">{item.title}</h3>
                                    <p className="text-white/60 text-xs mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (sectionId === 'tokenomics' && 'bars' in section) {
        return (
            <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-1">
                    Token<span className="text-yellow-400">omics</span>
                </h2>
                <p className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-6">{section.subtitle}</p>
                <div className="space-y-3 mb-6">
                    {section.bars!.map((t, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-black text-white uppercase tracking-wider text-xs">{t.title}</span>
                                <span className={`font-black text-xl ${t.color}`}>{t.value}</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-1">
                                <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-emerald-500" style={{ width: t.width }} />
                            </div>
                            <p className="text-white/40 text-[10px]">{t.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {section.economy!.map((eco, i) => (
                        <div key={i} className="text-center bg-white/5 rounded-xl p-3 border border-white/5">
                            <p className={`text-xl font-black ${eco.color}`}>{eco.value}</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mt-0.5">{eco.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (sectionId === 'roadmap' && 'phases' in section) {
        return (
            <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-1">
                    Project <span className="text-yellow-400">Roadmap</span>
                </h2>
                <p className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-6">{section.subtitle}</p>
                <div className="space-y-4">
                    {section.phases!.map((phase, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${phase.color} to-transparent`} />
                            <div className="flex items-start gap-3 pl-2">
                                <span className="text-xl">{phase.emoji}</span>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-2">{phase.phase}</h3>
                                    <ul className="space-y-1.5">
                                        {phase.items.map((item, j) => (
                                            <li key={j} className="flex items-center gap-1.5 text-white/60 text-xs">
                                                <div className="w-1 h-1 bg-yellow-500 rounded-full shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (sectionId === 'faq' && 'faqs' in section) {
        return (
            <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-6">
                    F<span className="text-yellow-400">A</span>Q
                </h2>
                <div className="space-y-3">
                    {section.faqs!.map((faq, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4">
                            <h4 className="font-black text-emerald-400 text-xs uppercase tracking-wide mb-1">Q: {faq.q}</h4>
                            <p className="text-white/60 text-xs">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
}

/* ───────────────────────────────────────────
   Main Overlay UI — Rendered OUTSIDE Canvas
   Google Maps style: content panels around edges
   ─────────────────────────────────────────── */
export default function OverlayUI() {
    const [mounted, setMounted] = useState(false);
    const [activePanel, setActivePanel] = useState<string | null>(null);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const navItems = [
        { id: 'earn', label: 'How To Earn', icon: '📖' },
        { id: 'tokenomics', label: 'Tokenomics', icon: '💰' },
        { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
        { id: 'faq', label: 'FAQ', icon: '❓' },
    ];

    return (
        <div className="fixed inset-0 z-20 overflow-hidden pointer-events-none" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

            {/* ── Top Navbar ── */}
            <div className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
                <div className="mx-4 mt-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg group-hover:rotate-[360deg] transition-transform duration-700">
                            <span className="text-sm">🐮</span>
                        </div>
                        <span className="text-base font-black uppercase tracking-tighter text-white drop-shadow-lg">
                            Cash Cow <span className="text-yellow-400">Valley</span>
                        </span>
                    </a>
                    <div className="flex items-center gap-4">
                        <a href="/dapp" className="hidden md:block text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-yellow-400 transition-colors">Dashboard</a>
                        <div className="scale-[0.85] origin-right">
                            <w3m-button />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Hero Top — moved up per request, high contrast text without soft shadow ── */}
            {/* ── Top-Left CTA: Start Farming ── */}
            {!activePanel && (
                <div className="fixed top-24 left-8 z-50 pointer-events-auto animate-fadeInLeft">
                    <a href="/dapp" className="group flex items-center gap-4 bg-yellow-500/10 backdrop-blur-md border border-yellow-500/40 p-1.5 pr-8 rounded-2xl shadow-xl hover:bg-yellow-500/20 transition-all hover:scale-105">
                        <div className="w-12 h-12 bg-yellow-400/20 flex items-center justify-center rounded-xl border border-yellow-400/30">
                            <span className="text-2xl">🌱</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400/60 leading-none">Yield Protocol</span>
                            <span className="text-sm font-black uppercase tracking-widest text-white group-hover:text-yellow-400 transition-colors uppercase">Start Farming</span>
                        </div>
                    </a>
                </div>
            )}

            {/* ── Top-Right CTA: Explore ── */}
            {!activePanel && (
                <div className="fixed top-24 right-8 z-50 pointer-events-auto animate-fadeInRight text-right">
                    <button
                        onClick={() => setActivePanel('earn')}
                        className="group flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/20 p-1.5 pl-8 rounded-2xl transition-all hover:border-white/40 hover:scale-105 shadow-xl"
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">Learn More</span>
                            <span className="text-sm font-black uppercase tracking-widest text-white tracking-widest">Explore Valley</span>
                        </div>
                        <div className="w-12 h-12 bg-white/10 flex items-center justify-center rounded-xl">
                            <span className="text-2xl">🗺️</span>
                        </div>
                    </button>
                </div>
            )}

            {/* ── Hero Center: Sterilized (Title only) ── */}
            {!activePanel && (
                <div className="absolute inset-x-0 top-[14vh] flex flex-col items-center justify-start text-center px-6 pointer-events-none animate-fadeIn">
                    <div className="mb-2 opacity-80 scale-75">
                        <span className="text-4xl drop-shadow-lg">🐮</span>
                    </div>
                    {/* Clear Title */}
                    <h1
                        className="text-5xl md:text-7xl lg:text-9xl font-black uppercase tracking-tighter text-white"
                        style={{
                            textShadow: '0 4px 15px rgba(0,0,0,0.4), 0 2px 2px #000'
                        }}
                    >
                        Cash Cow <span className="text-yellow-400">Valley</span>
                    </h1>
                    {/* Subtitle: The ONLY one with a block background per request */}
                    <div className="mt-4 bg-white/95 text-black px-8 py-2 rounded-full font-black text-[10px] md:text-sm uppercase tracking-[0.5em] shadow-2xl border border-black/10 backdrop-blur-sm">
                        The Ultimate Grass-Fed Yield Protocol
                    </div>
                </div>
            )}

            {/* ── Bottom Stats Bar ── */}
            {!activePanel && (
                <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-6 animate-fadeInUp">
                    <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-black/40 backdrop-blur-xl px-8 py-3 rounded-2xl border border-white/5 shadow-2xl pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                            <span>BNB Mainnet <span className="text-emerald-400 ml-1">Live</span></span>
                        </div>
                        <div className="w-px h-3 bg-white/5" />
                        <div>TVL: <span className="text-yellow-400 font-black tracking-widest">$1.2M+</span></div>
                        <div className="w-px h-3 bg-white/5" />
                        <div>Farmers: <span className="text-white font-black tracking-widest">8,204</span></div>
                    </div>
                </div>
            )}

            {/* ── Bottom Navigation Pills ── */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                <div className="flex gap-2 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActivePanel(activePanel === item.id ? null : item.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activePanel === item.id
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span>{item.icon}</span>
                            <span className="hidden sm:inline">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Side Panel (Google Maps style info panel) ── */}
            {activePanel && (
                <div className="fixed left-4 top-24 bottom-24 w-[380px] max-w-[calc(100vw-2rem)] z-40 pointer-events-auto">
                    <GlassCard className="h-full flex flex-col">
                        {/* Panel header with close */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400/60">
                                {sections.find(s => s.id === activePanel)?.title}
                            </span>
                            <button
                                onClick={() => setActivePanel(null)}
                                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all text-xs"
                            >
                                ✕
                            </button>
                        </div>
                        {/* Panel content — scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <PanelContent sectionId={activePanel} />
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* ── Social links (bottom right) ── */}
            <div className="fixed bottom-6 right-6 flex gap-3 pointer-events-auto z-30">
                {[
                    { label: 'TG', href: '#' },
                    { label: 'X', href: '#' },
                    { label: 'DC', href: '#' },
                ].map((link, i) => (
                    <a
                        key={i}
                        href={link.href}
                        className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40 hover:text-yellow-400 hover:border-yellow-400/30 transition-all"
                    >
                        {link.label}
                    </a>
                ))}
            </div>
        </div>
    );
}
