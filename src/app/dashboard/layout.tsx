'use client';

import React, { useEffect } from 'react';
import { useData } from '@/lib/context/DataContext';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser, logout, isLoading } = useData();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !currentUser && pathname !== '/') {
            router.push('/');
        }
    }, [currentUser, isLoading, router, pathname]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="bg-brand-dark min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    if (!currentUser) return null;

    return (
        <div className="bg-brand-dark min-h-screen text-white">
            {/* Dashboard Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/')}>
                    <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-brand-dark font-bold group-hover:scale-110 transition-transform">V</div>
                    <span className="font-bold tracking-tight uppercase">VIBE CODING</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 hidden sm:inline">
                        Signed in as <span className="text-white font-medium">{currentUser.name}</span>
                    </span>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleLogout}
                        className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border-red-500/20"
                    >
                        Logout
                    </Button>
                </div>
            </nav>

            <main className="min-h-screen">
                {children}
            </main>
        </div>
    );
}
