import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useGameStore } from '@/store/useGameStore';
import { useEffect, useState } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';

export default function Navbar() {
    const { open } = useWeb3Modal();
    const { isConnected } = useAccount();
    const logout = useGameStore(state => state.logout);
    const [mounted, setMounted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isConnected) {
            logout();
        }
    }, [isConnected, logout]);

    const navLinks = [
        { name: 'How to Play', href: '/#how-to-play' },
        { name: 'Tokenomics', href: '/#tokenomics' },
        { name: 'Economy', href: '/#economy' },
        { name: 'Roadmap', href: '/#roadmap' },
        { name: 'Whitepaper', href: '/#whitepaper' },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 px-4 py-4 lg:px-12 lg:py-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center gap-4 group cursor-pointer z-50">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-transform duration-500 group-hover:rotate-[360deg]">
                        <span className="text-2xl">🐮</span>
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-white drop-shadow-lg">
                        Cash Cow <span className="text-yellow-500">Valley</span>
                    </h1>
                </div>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-black uppercase tracking-[0.2em] text-white hover:text-yellow-400 transition-colors drop-shadow-[0_2px_2px_rgba(0,0,0,1)]"
                        >
                            {link.name}
                        </a>
                    ))}
                    {mounted && isConnected ? (
                        <div className="flex items-center gap-6 pl-6 border-l border-white/20">
                            <w3m-button />
                        </div>
                    ) : (
                        <button
                            onClick={() => open()}
                            className="btn-aaa-primary !py-2 !px-8 text-xs"
                        >
                            Login To Barn
                        </button>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden z-50 p-2 text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                </button>

                {/* Mobile Sidebar Overlay */}
                <div className={`fixed inset-0 bg-[#451a03] transition-all duration-500 lg:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <div className="flex flex-col items-center justify-center h-full gap-8">
                        {navLinks.map((link, i) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`text-4xl font-black uppercase tracking-tighter ${i % 2 === 0 ? 'text-white' : 'text-yellow-500'} hover:text-emerald-400`}
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="mt-8">
                            <w3m-button />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
