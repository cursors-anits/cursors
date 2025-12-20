'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useData } from '@/lib/context/DataContext';
import Image from 'next/image';

export interface NavItem {
    label: string;
    icon: React.ElementType;
    value: string;
    group?: string;
}

interface DashboardNavProps {
    items: NavItem[];
    activeTab: string;
    onTabChange: (value: string) => void;
    user: {
        name: string;
        email: string;
        role: string;
        avatar?: string;
        teamId?: string;
    };
}

export const DashboardNav: React.FC<DashboardNavProps> = ({
    items,
    activeTab,
    onTabChange,
    user
}) => {
    const { logout } = useData();

    // If only one page/tab - no sidebar needed.
    if (items.length <= 1) return null;

    // Group items
    const groupedItems = items.reduce<{ [key: string]: NavItem[] }>((acc, item) => {
        const group = item.group || 'General';
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {});

    const groups = Object.keys(groupedItems);

    const avatarFallback = React.useMemo(() => {
        if (user.teamId) {
            const match = user.teamId.match(/\d+$/);
            return match ? match[0] : user.name.charAt(0);
        }
        return user.name.charAt(0);
    }, [user]);

    return (
        <Sidebar collapsible="icon" className="border-r border-white/5 bg-brand-dark shadow-2xl">
            <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:h-14">
                <div className="flex items-center gap-3 h-full transition-all duration-300 group-data-[collapsible=icon]:justify-center">
                    <Image
                        src="/sponsors/cursors.png"
                        alt="Cursors Logo"
                        width={28}
                        height={28}
                        className="object-cover shrink-0 transition-transform duration-300 group-data-[collapsible=icon]:scale-110"
                    />
                    <div className="flex flex-col transition-all duration-300 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 overflow-hidden">
                        <span className="text-lg font-bold tracking-tight text-white leading-none">VIBE</span>
                        <span className="text-[10px] font-mono text-gray-500 tracking-wider">COLLAB</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
                {groups.map((group) => (
                    <SidebarGroup key={group} className="group-data-[collapsible=icon]:p-0">
                        <SidebarGroupLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2 opacity-50 group-data-[collapsible=icon]:hidden">
                            {group}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-2">
                                {groupedItems[group].map((item) => (
                                    <SidebarMenuItem key={item.value}>
                                        <SidebarMenuButton
                                            isActive={activeTab === item.value}
                                            onClick={() => onTabChange(item.value)}
                                            tooltip={item.label}
                                            className={cn(
                                                "w-full flex items-center gap-3.5 rounded-xl transition-all duration-300 h-10 px-3",
                                                "group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center",
                                                activeTab === item.value
                                                    ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-[0_0_20px_rgba(130,212,250,0.15)]"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "w-[18px] h-[18px] shrink-0 transition-transform duration-300",
                                                activeTab === item.value ? "text-brand-primary scale-110" : "text-gray-500 group-hover:text-gray-300"
                                            )} />
                                            <span className="font-semibold tracking-tight transition-all duration-300 group-data-[collapsible=icon]:hidden overflow-hidden">
                                                {item.label}
                                            </span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-0 space-y-4">
                <div className="flex flex-col gap-4 border-t border-white/5 pt-4 group-data-[collapsible=icon]:pt-0 group-data-[collapsible=icon]:border-t-0">
                    <div className="flex items-center gap-3 transition-all duration-300 px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-12">
                        <Avatar className="h-8 w-8 border border-brand-primary/20 shrink-0 transition-transform duration-300 group-data-[collapsible=icon]:scale-110">
                            {user.avatar && <AvatarImage src={user.avatar} className="object-cover" />}
                            <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold text-[10px]">
                                {avatarFallback}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 transition-all duration-300 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 overflow-hidden">
                            <span className="text-sm font-bold text-white truncate">{user.name}</span>
                            <span className="text-[10px] text-brand-primary font-bold uppercase truncate">{user.role}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1.5 transition-all group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-full hover:bg-red-500/5"
                    >
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
                    </button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};
