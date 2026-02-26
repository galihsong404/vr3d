'use client';

import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '@/components/ui/Navbar';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

export default function Home() {
    const { isConnected } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [whitepaperContent, setWhitepaperContent] = useState('# Whitepaper Loading...');

    useEffect(() => {
        setMounted(true);
        const loadWhitepaper = async () => {
            try {
                const res = await fetch('/api/whitepaper');
                if (!res.ok) throw new Error('Status: ' + res.status);
                const data = await res.json();
                if (data.content) {
                    setWhitepaperContent(data.content);
                } else {
                    setWhitepaperContent('# Error: No content found in whitepaper API');
                }
            } catch (err) {
                console.error('Whitepaper fetch error:', err);
                setWhitepaperContent('# Failed to load whitepaper\n\nPlease check your server connection or refresh the page.');
            }
        };
        loadWhitepaper();
    }, []);

    const tokenomics = [
        { title: 'Liquidity Pool (LP)', value: '50%', desc: 'Locked to ensure deep, stable trading liquidity on DEXs.' },
        { title: 'Community Rewards', value: '40%', desc: 'Distributed daily to active cow farmers.' },
        { title: 'Team & Development', value: '10%', desc: 'Vested linearly over 24 months.' },
    ];

    const economy = [
        { title: 'LP Buyback', value: '70%', desc: 'Automated buy $COW to deepen liquidity pools.', color: 'text-emerald-400', border: 'border-emerald-500/50', gradient: 'from-emerald-500/50' },
        { title: 'Referral Bonus', value: '20%', desc: 'Instant reward to eligible inviters (Cow NFT required).', color: 'text-yellow-500', border: 'border-yellow-500/50', gradient: 'from-yellow-500/50' },
        { title: 'Treasury / Dev', value: '10%', desc: 'Marketing, server costs, and continued development.', color: 'text-white', border: 'border-white/20', gradient: 'from-white/10' },
    ];

    const roadmap = [
        { phase: 'Phase 1: Genesis', items: ['Protocol Launch', 'Web2 Care Mechanics', 'Roll-up Referral System'], color: 'from-emerald-500' },
        { phase: 'Phase 2: Golden Era', items: ['Web3 Staking Pools', 'Golden NFT Release', 'Global Emission Dashboard'], color: 'from-yellow-500' },
        { phase: 'Phase 3: Evolution', items: ['P2P NFT Marketplace', 'PvP Farm Battles', 'Mobile App Beta'], color: 'from-orange-500' },
    ];

    return (
        <main className="min-h-screen text-white">
            <Navbar />

            {/* Background Layer */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <img src="/images/hero.png" className="bg-aaa-hero" alt="World" />
            </div>

            {/* Section 1: Hero */}
            <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6">
                <div className="animate-float">
                    <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-white drop-shadow-[0_10px_10px_rgba(0,0,0,1)]">
                        Cash Cow <span className="text-yellow-500">Valley</span>
                    </h2>
                    <p className="mt-4 text-xl md:text-2xl text-white font-bold tracking-[0.3em] uppercase max-w-3xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                        The Ultimate <span className="text-emerald-400">Grass-Fed</span> Yield Protocol
                    </p>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row gap-6">
                    <a href="/dapp" className="btn-aaa-primary text-xl px-12 py-5 drop-shadow-2xl text-center">
                        Start Farming
                    </a>
                    <a href="#whitepaper" className="btn-aaa-secondary text-xl px-12 py-5 backdrop-blur-md text-center">
                        Read Whitepaper
                    </a>
                </div>

                {/* Registration Banner */}
                <div className="mt-16 max-w-3xl mx-auto w-full">
                    <a href="/dapp"
                        className="block bg-gradient-to-r from-emerald-600/20 via-yellow-500/20 to-emerald-600/20 border-2 border-yellow-500/30 rounded-3xl p-8 sm:p-10 text-center hover:border-yellow-500/60 hover:scale-[1.02] transition-all duration-300 backdrop-blur-md group"
                    >
                        <p className="text-emerald-400 font-black uppercase tracking-[0.4em] text-xs mb-3">🎁 New Player Bonus</p>
                        <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 group-hover:text-yellow-400 transition-colors">
                            Register to Get a <span className="text-yellow-500">Free Farm!</span>
                        </h3>
                        <p className="text-slate-400 text-sm max-w-lg mx-auto mb-4">
                            Connect your wallet and sign to verify ownership. You'll receive a <span className="text-emerald-400 font-bold">Free Starter Barn + Land Plot</span> instantly. No gas fees required.
                        </p>
                        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full text-yellow-400 font-bold text-sm uppercase tracking-widest">
                            Connect Wallet to Register →
                        </div>
                    </a>
                </div>

                {/* Status Bar */}
                <div className="absolute bottom-12 flex flex-wrap justify-center gap-8 md:gap-12 text-xs font-black uppercase tracking-[0.3em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Status: <span className="text-emerald-400">Mainnet Live</span>
                    </div>
                    <div>TVL: <span className="text-yellow-500">$1.2M+</span></div>
                    <div>Players: <span className="text-white">8,204</span></div>
                </div>
            </section>

            {/* Section 2: How to Play */}
            <section id="how-to-play" className="py-32 px-6 bg-black/60 backdrop-blur-sm border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">How To <span className="text-yellow-500">Earn</span></h3>
                        <p className="text-emerald-400 font-black uppercase tracking-[0.4em] text-sm">Three steps to your decentralized fortune</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { step: '01', title: 'Adopt Cows', desc: 'Secure your unique Brahman or Jersey breeds as NFTs to start your journey.', color: 'text-white' },
                            { step: '02', title: 'Feed & Care', desc: 'Use $COW tokens or watch vitamins to maintain happiness and yield.', color: 'text-emerald-400' },
                            { step: '03', title: 'Harvest Yield', desc: 'Collect fresh milk daily and convert it into real USDT rewards.', color: 'text-white' },
                        ].map((item, i) => (
                            <div key={i} className="glass-card p-10 group hover:border-yellow-400/50 transition-all bg-black/40">
                                <span className="text-6xl font-black text-yellow-500/10 group-hover:text-yellow-500/30 transition-colors">{item.step}</span>
                                <h4 className={`text-2xl font-black mt-4 mb-4 ${i === 1 ? 'text-emerald-400' : 'text-yellow-500'}`}>{item.title}</h4>
                                <p className="text-white font-medium leading-relaxed drop-shadow-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 3: Tokenomics */}
            <section id="tokenomics" className="py-32 px-6 bg-black/40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 text-white">Token<span className="text-yellow-500">omics</span></h3>
                            <p className="text-white text-lg mb-10 leading-relaxed font-semibold drop-shadow-sm">
                                The <span className="text-yellow-500 font-black">$COW</span> token is the lifeblood of the valley. It powers everything from purchasing grass to upgrading your livestock.
                            </p>
                            <div className="space-y-6">
                                {tokenomics.map((t, i) => (
                                    <div key={i} className="flex items-center gap-6 p-5 rounded-xl bg-black/60 border border-emerald-500/20">
                                        <div className="text-2xl font-black text-emerald-400 w-16 text-right drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{t.value}</div>
                                        <div>
                                            <div className="font-black text-yellow-500 uppercase tracking-widest">{t.title}</div>
                                            <div className="text-sm text-white font-medium">{t.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border-2 border-dashed border-yellow-500/20 flex items-center justify-center animate-spin-slow">
                                <div className="w-4/5 h-4/5 rounded-full border border-yellow-500/40 relative">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-yellow-500 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.8)] flex items-center justify-center text-black font-bold text-xl">$</div>
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-8xl animate-glow">🐮</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Platform Economy & Referral */}
            <section id="economy" className="py-32 px-6 bg-black/80 border-t border-emerald-500/20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">Platform <span className="text-emerald-400">Economy</span></h3>
                        <p className="text-yellow-500 font-black uppercase tracking-[0.5em] text-sm">Every purchase strengthens the ecosystem</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        {economy.map((eco, i) => (
                            <div key={i} className={`relative p-[2px] bg-gradient-to-b ${eco.gradient} to-transparent rounded-2xl group`}>
                                <div className="bg-black p-8 rounded-2xl h-full shadow-2xl flex flex-col items-center text-center transition-transform group-hover:-translate-y-2 cursor-default border border-white/5">
                                    <h4 className={`${eco.color} font-black text-6xl mb-6 drop-shadow-[0_0_15px_currentColor]`}>{eco.value}</h4>
                                    <h5 className="text-white font-black uppercase tracking-widest text-xl mb-3">{eco.title}</h5>
                                    <p className="text-gray-400 font-medium">{eco.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Referral Rule Banner */}
                    <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-emerald-500/20 border border-yellow-500/50 rounded-2xl p-8 max-w-4xl mx-auto text-center shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                        <span className="text-4xl mb-4 block">🤝</span>
                        <h4 className="text-2xl font-black text-white uppercase tracking-wider mb-2">The <span className="text-yellow-500 text-3xl">Roll-Up</span> Referral System</h4>
                        <p className="text-lg text-emerald-400 font-bold uppercase tracking-widest">
                            Eligible users earn a massive 20% on all invited player purchases!
                        </p>
                        <hr className="border-white/10 my-4" />
                        <p className="text-white text-sm font-medium leading-relaxed max-w-2xl mx-auto">
                            <strong>*Requirement:</strong> You <span className="text-red-400 underline decoration-red-400">must</span> own at least one Cow NFT to receive the bonus. If a free-to-play user (who only owns land/grass) invites a buyer, the 20% bonus skips them and automatically <strong>rolls up</strong> to the first qualified inviter in your connected network who owns a Cow!
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 5: Roadmap */}
            <section id="roadmap" className="py-32 px-6 bg-black/40 backdrop-blur-sm border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">Project <span className="text-yellow-500">Roadmap</span></h3>
                        <p className="text-emerald-400 font-black uppercase tracking-[0.4em] text-sm">Our path to agricultural dominance</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {roadmap.map((phase, i) => (
                            <div key={i} className="bg-black/60 border border-white/10 p-10 rounded-3xl relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${phase.color} to-transparent`}></div>
                                <h4 className="text-2xl font-black text-white uppercase mb-6 tracking-tighter">{phase.phase}</h4>
                                <ul className="space-y-4">
                                    {phase.items.map((item, j) => (
                                        <li key={j} className="flex items-center gap-3 text-gray-300 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 5: FAQ */}
            <section className="py-32 px-6 bg-black/20">
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-4xl font-black uppercase tracking-tighter mb-12 text-center text-white">Frequently Asked <span className="text-yellow-500">Questions</span></h3>
                    <div className="space-y-4 text-left">
                        {[
                            { q: 'Is this game free to play?', a: 'You can start by watching vitamins, but owning a Cow NFT is required for maximum yield potential.' },
                            { q: 'Which blockchain is Cash Cow Valley on?', a: 'We currently support BNB Chain (BSC) for mainnet and Sepolia for testnet.' },
                            { q: 'Can I trade my cows?', a: 'Yes! All cows are standard ERC-721 NFTs and can be traded on our marketplace.' },
                        ].map((faq, i) => (
                            <div key={i} className="bg-black/80 border border-white/10 p-8 rounded-2xl shadow-xl">
                                <h4 className="font-black text-emerald-400 mb-2 uppercase tracking-wide">Q: {faq.q}</h4>
                                <p className="text-white font-medium">A: {faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 5: Inline Whitepaper (README.md) */}
            <section id="whitepaper" className="py-32 px-6 bg-[#1a120b] border-y border-yellow-500/20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">White<span className="text-yellow-500">paper</span></h3>
                        <p className="text-emerald-400 font-black uppercase tracking-[0.4em] text-sm">Protocol Documentation</p>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-a:text-yellow-500 hover:prose-a:text-yellow-400 prose-strong:text-white prose-hr:border-white/10 p-8 md:p-12 rounded-3xl bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5">
                        {whitepaperContent.includes('Loading') ? (
                            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-yellow-500 font-black uppercase tracking-widest">Compiling Protocol Docs...</p>
                            </div>
                        ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {whitepaperContent}
                            </ReactMarkdown>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 bg-[#451a03] border-t-4 border-yellow-500 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl drop-shadow-lg">🐮</span>
                        <div className="font-black uppercase tracking-tighter text-2xl text-white">
                            Cash Cow <span className="text-yellow-500">Valley</span>
                        </div>
                    </div>
                    <div className="flex gap-8 text-xs uppercase font-black tracking-widest text-yellow-500">
                        <a href="#" className="hover:text-white transition-colors">Telegram</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter (X)</a>
                        <a href="#" className="hover:text-white transition-colors">Discord</a>
                    </div>
                    <div className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">
                        © 2026 Valley Labs. Built for the Decentralized Breed.
                    </div>
                </div>
            </footer>

            {/* Decorative Blobs */}
            <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-500/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
            <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse delay-1000"></div>
        </main>
    );
}
