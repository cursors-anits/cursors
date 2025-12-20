'use client';

import React, { useEffect } from 'react';
import { useData } from '@/lib/context/DataContext';
import { useRouter, usePathname } from 'next/navigation';

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
            <main className="min-h-screen">
                {children}
            </main>
        </div>
    );
}
