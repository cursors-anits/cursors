'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Download,
    Users,
    UserCog,
    Activity,
    TrendingUp,
    MapPin
} from 'lucide-react';
import {
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { User } from '@/types';
import { useData } from '@/lib/context/DataContext';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FinanceTab } from '@/components/admin/FinanceTab';
import { useRevenue } from '@/hooks/useRevenue';
import { SettingsTab } from '@/components/dashboards/SettingsTab';
import { DashboardShell } from '@/components/dashboards/DashboardShell';
import { NavItem } from '@/components/dashboards/DashboardNav';
import { Lock, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SOSAlertPopup } from '@/components/dashboards/SOSAlertPopup';

interface FacultyDashboardProps {
    user: User;
}

const COLORS = ['#82d4fa', '#38bdf8', '#0ea5e9', '#1e293b'];

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ user }) => {
    const { participants, coordinators, logs, isLoading } = useData();

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const activeTab = searchParams.get('tab') || 'overview';

    // Participants table state
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [allocationFilter, setAllocationFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
    const ITEMS_PER_PAGE = 10;

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const ticketDist = [
        { name: 'Combo', value: participants.filter(p => !p.isManual && p.type.toLowerCase().includes('combo')).length },
        { name: 'Hackathon', value: participants.filter(p => !p.isManual && p.type.toLowerCase().includes('hackathon')).length },
    ];

    const totalRevenue = useRevenue(participants);

    const navItems: NavItem[] = [
        { label: 'Overview', icon: TrendingUp, value: 'overview', group: 'Management' },
        { label: 'Teams List', icon: Users, value: 'participants', group: 'Management' },
        { label: 'Coordinators', icon: UserCog, value: 'coordinators', group: 'Management' },
        { label: 'Finance', icon: Download, value: 'finance', group: 'Management' },
        { label: 'Account', icon: Lock, value: 'settings', group: 'Profile' },
    ];

    // Filter participants based on search
    const filteredParticipants = React.useMemo(() => {
        return participants.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.teamId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [participants, searchQuery]);

    // Reset pagination when filters/search change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter, paymentFilter, allocationFilter]);

    // Export CSV utility
    const exportCSV = (data: unknown[], filename: string) => {
        if (!data || data.length === 0) return;
        const headers = Object.keys(data[0] as object);
        const rows = data.map(obj => headers.map((header) => JSON.stringify((obj as Record<string, unknown>)[header])).join(","));
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading && participants.length === 0) {
        return (
            <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8">
                <Skeleton className="h-20 w-1/2 bg-white/5" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 bg-white/5 rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Skeleton className="h-[400px] bg-white/5 rounded-2xl" />
                    <Skeleton className="h-[400px] bg-white/5 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <DashboardShell
            title="Faculty Oversight"
            description="Institutional overview of Vibe Coding event"
            items={navItems}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            user={{
                name: user.name,
                email: user.email,
                role: 'Faculty'
            }}
        >
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

                <TabsContent value="overview" className="mt-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Registration', value: participants.filter(p => !p.isManual).length, icon: Users, color: 'text-blue-400' },
                            { label: 'Event Coordinators', value: coordinators.length, icon: UserCog, color: 'text-purple-400' },
                            { label: 'Revenue Generated', value: `₹${(totalRevenue / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-green-400' },
                            { label: 'System Health', value: '100%', icon: Activity, color: 'text-orange-400' },
                        ].map((stat, i) => (
                            <Card key={i} className="bg-brand-surface border-white/5 hover:border-brand-primary/20 transition-all">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</p>
                                        <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-brand-surface border-white/5 p-6">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-lg">Registration Distribution</CardTitle>
                                <CardDescription>Breakdown by pass category</CardDescription>
                            </CardHeader>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={ticketDist}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {ticketDist.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#020617', border: '1px solid #1e293b' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="bg-brand-surface border-white/5 p-6">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-lg">Recent System Activity</CardTitle>
                                <CardDescription>Event logistics live feed</CardDescription>
                            </CardHeader>
                            <ScrollArea className="h-[300px] mt-4">
                                <div className="space-y-4">
                                    {logs.slice(0, 10).map((log, i) => (
                                        <div key={i} className="flex gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
                                            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                                                {log.action.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{log.user}</p>
                                                <p className="text-xs text-gray-500">{log.details}</p>
                                                <p className="text-[10px] text-gray-600 font-mono mt-1">{log.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="participants" className="mt-8">
                    <Card className="bg-brand-surface border-white/5">
                        <CardContent className="p-4">
                            {/* Export Button */}
                            <div className="flex justify-end mb-3">
                                <Button
                                    variant="outline"
                                    onClick={() => exportCSV(participants.filter(p => !p.isManual), 'participants')}
                                    className="border-white/10 bg-white/5 hover:bg-white/10"
                                    size="sm"
                                >
                                    <Download className="w-4 h-4 mr-2" /> Export CSV
                                </Button>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-3 mb-4">
                                <div className="flex-1 min-w-[200px]">
                                    <Input
                                        placeholder="🔍 Search by team ID, name, or email..."
                                        className="max-w-sm bg-brand-dark border-white/10 text-white placeholder:text-gray-500"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[150px] bg-brand-dark border-white/10">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-brand-surface border-white/10">
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="Hackathon">Hackathon</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={allocationFilter} onValueChange={setAllocationFilter}>
                                    <SelectTrigger className="w-[150px] bg-brand-dark border-white/10">
                                        <SelectValue placeholder="Allocation" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-brand-surface border-white/10">
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="allocated">Allocated</SelectItem>
                                        <SelectItem value="not-allocated">Not Allocated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Team Table */}
                            <div className="rounded-lg border border-white/5 overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-white/5">
                                        <TableRow>
                                            <TableHead className="text-gray-400">Team ID</TableHead>
                                            <TableHead className="text-gray-400">Team Size</TableHead>
                                            <TableHead className="text-gray-400">Type</TableHead>
                                            <TableHead className="text-gray-400">Allocation</TableHead>
                                            <TableHead className="text-gray-400">Payment</TableHead>
                                            <TableHead className="text-gray-400 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(() => {
                                            // Apply filters
                                            let filtered = filteredParticipants;

                                            if (typeFilter !== 'all') {
                                                filtered = filtered.filter(p => p.type === typeFilter);
                                            }

                                            if (allocationFilter !== 'all') {
                                                if (allocationFilter === 'allocated') {
                                                    filtered = filtered.filter(p => p.assignedHackathonLab);
                                                } else {
                                                    filtered = filtered.filter(p => !p.assignedHackathonLab);
                                                }
                                            }

                                            // Group by teams
                                            const teams = Object.entries(
                                                filtered.reduce((acc, p) => {
                                                    if (!acc[p.teamId]) acc[p.teamId] = [];
                                                    acc[p.teamId].push(p);
                                                    return acc;
                                                }, {} as Record<string, typeof participants>)
                                            );

                                            // Paginate teams
                                            const totalPages = Math.ceil(teams.length / ITEMS_PER_PAGE);
                                            const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
                                            const endIdx = startIdx + ITEMS_PER_PAGE;
                                            const paginatedTeams = teams.slice(startIdx, endIdx);

                                            return paginatedTeams.map(([teamId, members]) => {
                                                const isExpanded = expandedTeams.has(teamId);
                                                const hasPayment = members.some(m => m.paymentScreenshotUrl);
                                                const paymentUrl = members.find(m => m.paymentScreenshotUrl)?.paymentScreenshotUrl;
                                                const hasHackathon = members.some(m => m.assignedHackathonLab);
                                                const isAllocated = hasHackathon;

                                                return (
                                                    <React.Fragment key={teamId}>
                                                        <TableRow
                                                            className="cursor-pointer hover:bg-white/5"
                                                            onClick={() => {
                                                                const newExpanded = new Set(expandedTeams);
                                                                if (isExpanded) {
                                                                    newExpanded.delete(teamId);
                                                                } else {
                                                                    newExpanded.add(teamId);
                                                                }
                                                                setExpandedTeams(newExpanded);
                                                            }}
                                                        >
                                                            <TableCell className="font-mono text-xs text-brand-primary">
                                                                {isExpanded ? <ChevronDown className="w-4 h-4 inline mr-2" /> : <ChevronRight className="w-4 h-4 inline mr-2" />}
                                                                {teamId}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="text-[10px]">
                                                                    {members.length} member{members.length > 1 ? 's' : ''}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                                                                    {members[0].type}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {isAllocated ? (
                                                                    <div className="text-gray-400 space-y-1 text-[10px]">
                                                                        {members.find(m => m.assignedHackathonLab)?.assignedHackathonLab && <div>H: {members.find(m => m.assignedHackathonLab)?.assignedHackathonLab}</div>}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-600 text-[10px]">Not allocated</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {hasPayment ? (
                                                                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">
                                                                        Paid
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-gray-500 text-[10px]">
                                                                        Unpaid
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex gap-1 justify-end items-center" onClick={(e) => e.stopPropagation()}>
                                                                    {hasPayment && paymentUrl && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-7 w-7 p-0 text-green-400"
                                                                            onClick={() => window.open(paymentUrl, '_blank')}
                                                                            title="View payment"
                                                                        >
                                                                            <Eye className="w-3 h-3" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                        {isExpanded && (
                                                            <TableRow className="bg-brand-dark/30">
                                                                <TableCell colSpan={6} className="p-4">
                                                                    <div className="space-y-3">
                                                                        {members.map((member) => (
                                                                            <div key={member._id} className="bg-brand-dark p-4 rounded-lg border border-white/5">
                                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                                                                                    <div><span className="text-gray-500">Name:</span> <span className="text-white ml-1">{member.name}</span></div>
                                                                                    <div className="truncate"><span className="text-gray-500">Email:</span> <span className="text-gray-300 ml-1">{member.email}</span></div>
                                                                                    <div className="truncate"><span className="text-gray-500">College:</span> <span className="text-gray-300 ml-1" title={member.college}>{member.college}</span></div>

                                                                                    {member.assignedHackathonLab && <div><span className="text-gray-500">Hackathon Lab:</span> <span className="text-brand-primary ml-1">{member.assignedHackathonLab}</span></div>}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            });
                                        })()}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls */}
                            {(() => {
                                let filtered = filteredParticipants;
                                if (typeFilter !== 'all') {
                                    filtered = filtered.filter(p => p.type === typeFilter);
                                }
                                if (paymentFilter !== 'all') {
                                    if (paymentFilter === 'paid') {
                                        filtered = filtered.filter(p => p.paymentScreenshotUrl);
                                    } else {
                                        filtered = filtered.filter(p => !p.paymentScreenshotUrl);
                                    }
                                }
                                const teams = Object.keys(
                                    filtered.reduce((acc, p) => {
                                        if (!acc[p.teamId]) acc[p.teamId] = [];
                                        acc[p.teamId].push(p);
                                        return acc;
                                    }, {} as Record<string, typeof participants>)
                                );
                                const totalPages = Math.ceil(teams.length / ITEMS_PER_PAGE);

                                return totalPages > 1 ? (
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                        <p className="text-sm text-gray-400">
                                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, teams.length)} of {teams.length} teams
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="border-white/10"
                                            >
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                    <Button
                                                        key={page}
                                                        variant={page === currentPage ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(page)}
                                                        className={page === currentPage ? "bg-brand-primary text-brand-dark" : "border-white/10"}
                                                    >
                                                        {page}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="border-white/10"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="coordinators">
                    <Card className="bg-brand-surface border-white/5">
                        <ScrollArea className="h-[500px]">
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {coordinators.map(c => (
                                        <div key={c._id} className="p-4 rounded-xl bg-brand-dark/50 border border-white/10 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                <UserCog className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold">{c.name}</p>
                                                <Badge className="bg-purple-900/30 text-purple-400 border-none text-[10px]">{c.role}</Badge>
                                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {c.assigned}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-8">
                    <SettingsTab user={user} />
                </TabsContent>
                <TabsContent value="finance" className="mt-8">
                    <FinanceTab />
                </TabsContent>
            </Tabs>
            {/* SOS Alert Popup */}
            <SOSAlertPopup />
        </DashboardShell>
    );
};

export default FacultyDashboard;
