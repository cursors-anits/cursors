'use client';

import React from 'react';
import { NavItem, DashboardNav } from './DashboardNav';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useData } from '@/lib/context/DataContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface DashboardShellProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    items: NavItem[];
    activeTab: string;
    onTabChange: (value: string) => void;
    user: any;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
    children,
    title,
    description,
    items,
    activeTab,
    onTabChange,
    user
}) => {
    const { logout } = useData();
    const router = useRouter();
    const activeLabel = items.find(i => i.value === activeTab)?.label || 'Overview';
    const showSidebar = items.length > 1;

    return (
        <SidebarProvider>
            <div className="flex h-dvh w-full bg-brand-dark overflow-hidden">
                {showSidebar && (
                    <DashboardNav
                        items={items}
                        activeTab={activeTab}
                        onTabChange={onTabChange}
                        user={user}
                    />
                )}

                <SidebarInset className="flex flex-col flex-1 bg-brand-dark overflow-hidden">
                    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/5 bg-brand-dark/50 backdrop-blur-md px-4 sticky top-0 z-40 transition-[width,height] ease-linear">
                        <div className="flex items-center gap-4">
                            {!showSidebar && (
                                <>
                                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/')}>
                                        <Image
                                            src="/sponsors/cursors.png"
                                            alt="Cursors Logo"
                                            width={32}
                                            height={32}
                                            loading='eager'
                                            className="object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold tracking-tight text-white leading-none">VIBE</span>
                                            <span className="text-[10px] font-mono text-gray-500 tracking-wider">COLLAB</span>
                                        </div>
                                    </div>
                                    <Separator orientation="vertical" className="mx-2 h-4 bg-white/10" />
                                </>
                            )}
                            {showSidebar && (
                                <>
                                    <SidebarTrigger className="-ml-1 text-gray-400 hover:text-white" />
                                    <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
                                </>
                            )}
                            <Breadcrumb className="hidden sm:block">
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="#" className="text-gray-500 text-xs hover:text-brand-primary">
                                            Dashboard
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block text-gray-700" />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="text-brand-primary text-xs font-bold uppercase tracking-wider">
                                            {activeLabel}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block pr-3 border-r border-white/10">
                                <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                                <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">{user.role}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 gap-2 text-xs font-bold"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Sign Out</span>
                            </Button>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto w-full">
                        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="text-gray-400 text-sm md:text-base max-w-2xl font-medium">
                                        {description}
                                    </p>
                                )}
                            </div>

                            <div className="relative pb-12">
                                {children}
                            </div>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};
