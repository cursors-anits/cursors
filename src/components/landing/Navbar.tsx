'use client';

import React, { useState, useEffect } from 'react';
import { NavItem } from '@/types';
import { Menu, X, ArrowRight, UserCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/context/DataContext';
import { Separator } from '@/components/ui/separator';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

const navItems: NavItem[] = [
    { label: 'Schedule', href: '#schedule' },
    { label: 'About', href: '#about' },
    { label: 'Rewards', href: '#rewards' },
    { label: 'Contact', href: '#contact' },
];

interface NavbarProps {
    onRegisterClick: () => void;
    onLoginClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onRegisterClick, onLoginClick }) => {
    const { currentUser, logout, settings } = useData();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
                    ? 'bg-brand-dark/80 backdrop-blur-xl border-white/10 py-2'
                    : 'bg-transparent border-transparent py-4'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="shrink-0 flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                            <div className="w-10 h-10 bg-linear-to-br from-brand-primary/20 to-brand-secondary/20 rounded-xl flex items-center justify-center transform transition-transform group-hover:rotate-12 overflow-hidden border border-white/10">
                                <Image
                                    src="/sponsors/cursors.png"
                                    alt="Cursors Logo"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold tracking-tight text-white leading-none">
                                    VIBE
                                </span>
                                <span className="text-xs font-mono text-gray-400 tracking-[0.2em] uppercase">
                                    Coding
                                </span>
                            </div>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-1">
                            <div className="flex items-center bg-white/5 rounded-full px-2 py-1 border border-white/5 mr-6 backdrop-blur-sm">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="text-gray-300 hover:text-white hover:bg-white/10 transition-all px-5 py-2 rounded-full text-sm font-medium"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>

                            {currentUser ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push(`/dashboard/${currentUser.role}`)}
                                        className="text-gray-300 hover:text-white hover:bg-transparent px-4 py-2 text-sm font-medium transition-colors mr-2 flex items-center gap-2"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        Dashboard
                                    </Button>
                                    <Button
                                        onClick={logout}
                                        className="group bg-red-600/10 text-red-500 hover:bg-red-600/20 px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 border border-red-600/20"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        onClick={onLoginClick}
                                        className="text-gray-300 hover:text-white hover:bg-transparent px-4 py-2 text-sm font-medium transition-colors mr-2 flex items-center gap-2"
                                    >
                                        <UserCircle className="w-5 h-5" />
                                        Login
                                    </Button>

                                    {!settings?.registrationClosed ? (
                                        <Button
                                            onClick={onRegisterClick}
                                            className="group bg-white text-brand-dark px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:bg-gray-100 flex items-center gap-2 border-none"
                                        >
                                            Register
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    ) : (
                                        <Button
                                            disabled
                                            className="bg-white/10 text-gray-400 px-6 py-2.5 rounded-full font-bold text-sm border-none cursor-not-allowed"
                                        >
                                            Closed
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden absolute top-full left-0 w-full bg-brand-dark transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <Separator className="bg-white/10" />
                    <div className="px-4 py-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-gray-300 hover:text-white hover:bg-white/5 block px-4 py-3 rounded-xl text-base font-medium transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                        {currentUser ? (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        router.push(`/dashboard/${currentUser.role}`);
                                    }}
                                    className="w-full text-left text-gray-300 hover:text-white hover:bg-white/5 block px-4 py-3 rounded-xl text-base font-medium transition-colors justify-start"
                                >
                                    Dashboard
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        logout();
                                    }}
                                    className="w-full mt-4 bg-red-600/10 text-red-500 border border-red-600/20 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    Logout <LogOut size={18} />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        onLoginClick();
                                    }}
                                    className="w-full text-left text-gray-300 hover:text-white hover:bg-white/5 block px-4 py-3 rounded-xl text-base font-medium transition-colors justify-start"
                                >
                                    Login
                                </Button>
                                {!settings?.registrationClosed ? (
                                    <Button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            onRegisterClick();
                                        }}
                                        className="w-full mt-4 bg-brand-primary text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-none"
                                    >
                                        Secure Your Spot <ArrowRight size={18} />
                                    </Button>
                                ) : (
                                    <Button
                                        disabled
                                        className="w-full mt-4 bg-white/10 text-gray-400 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-none cursor-not-allowed"
                                    >
                                        Registrations Closed
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
