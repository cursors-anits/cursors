'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Users,
    UserCog,
    Trash2,
    Edit,
    Plus,
    FileText,
    AlertTriangle,
    RefreshCw,
    Lock,
    Globe,
    Download,
    BarChart3,
    Search,
    Mail
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
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
import { Input } from '@/components/ui/input';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface AdminDashboardProps {
    user: User;
}

const COLORS = ['#82d4fa', '#0ea5e9', '#38bdf8', '#334155'];

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
    const {
        participants,
        coordinators,
        logs,
        settings,
        isLoading,
        fetchParticipants,
        fetchCoordinators,
        fetchLogs,
        updateSettings,
        deleteParticipant,
        deleteCoordinator
    } = useData();

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const activeTab = searchParams.get('tab') || 'participants';

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const [searchQuery, setSearchQuery] = useState('');

    const handleDelete = async (id: string, type: 'participant' | 'coordinator') => {
        if (confirm(`Are you sure you want to delete this ${type}?`)) {
            try {
                if (type === 'participant') await deleteParticipant(id);
                else await deleteCoordinator(id);
                toast.success(`${type} deleted successfully`);
            } catch {
                toast.error(`Failed to delete ${type}`);
            }
        }
    };

    const handleResendEmail = async (teamId: string) => {
        try {
            toast.loading('Sending email...');
            const res = await fetch('/api/admin/resend-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId })
            });
            const data = await res.json();
            toast.dismiss();

            if (!res.ok) throw new Error(data.error || 'Failed to send');

            toast.success(`Email sent to ${data.count} members!`);
        } catch (error: any) {
            toast.dismiss();
            toast.error(error.message || 'Failed to resend email');
        }
    };

    const handleRefresh = async () => {
        toast.promise(Promise.all([fetchParticipants(), fetchCoordinators(), fetchLogs()]), {
            loading: 'Refreshing data...',
            success: 'Data updated',
            error: 'Failed to refresh data',
        });
    };

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

    const filteredParticipants = participants.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.teamId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // const filteredCoordinators = coordinators.filter(c =>
    //     c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     c.role.toLowerCase().includes(searchQuery.toLowerCase())
    // );

    // Analytics Data
    const ticketDist = [
        { name: 'Combo', value: participants.filter(p => p.type.toLowerCase().includes('combo')).length },
        { name: 'Workshop', value: participants.filter(p => p.type.toLowerCase().includes('workshop')).length },
        { name: 'Hackathon', value: participants.filter(p => p.type.toLowerCase().includes('hackathon')).length },
    ];

    const totalRevenue = participants.reduce<number>((acc, p) => {
        const type = p.type.toLowerCase();
        if (type.includes('combo')) return acc + 499;
        if (type.includes('hackathon')) return acc + 349;
        if (type.includes('workshop')) return acc + 199;
        return acc + 499; // Default
    }, 0);

    if (isLoading && participants.length === 0) {
        return (
            <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64 bg-white/5" />
                        <Skeleton className="h-4 w-48 bg-white/5" />
                    </div>
                    <Skeleton className="h-10 w-32 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 bg-white/5 rounded-xl" />)}
                </div>
                <Skeleton className="h-[400px] w-full bg-white/5 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-500">
                        Admin Workspace
                    </h1>
                    <p className="text-gray-400 mt-1">Real-time event management & insights</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleRefresh} variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button className="bg-brand-primary text-brand-dark hover:bg-white">
                        <Plus className="w-4 h-4 mr-2" /> Add Participant
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Registrations', value: participants.length, icon: Users, color: 'text-blue-400' },
                    { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(1)}k`, icon: BarChart3, color: 'text-green-400' },
                    { label: 'Coordinators', value: coordinators.length, icon: UserCog, color: 'text-purple-400' },
                    { label: 'Activity Logs', value: logs.length, icon: FileText, color: 'text-orange-400' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-brand-surface border-white/5 hover:border-brand-primary/20 transition-all group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">{stat.label}</p>
                                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="bg-brand-dark border border-white/10 p-1 rounded-xl">
                    <TabsTrigger value="participants" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">Participants</TabsTrigger>
                    <TabsTrigger value="coordinators" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">Coordinators</TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">Analytics</TabsTrigger>
                    <TabsTrigger value="logs" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">System Logs</TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">System Controls</TabsTrigger>
                </TabsList>

                <TabsContent value="participants" className="mt-6 space-y-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                placeholder="Search participants by name, email or team ID..."
                                className="pl-10 bg-brand-dark border-white/10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" onClick={() => exportCSV(participants, 'participants')}>
                            <Download className="w-4 h-4 mr-2" /> Export
                        </Button>
                    </div>

                    <Card className="bg-brand-surface border-white/5 overflow-hidden">
                        <ScrollArea className="h-[500px]">
                            <Table>
                                <TableHeader className="bg-brand-dark/50 sticky top-0 z-10">
                                    <TableRow className="border-white/5">
                                        <TableHead>Participant</TableHead>
                                        <TableHead>Team ID</TableHead>
                                        <TableHead>College</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredParticipants.map((p) => (
                                        <TableRow key={p._id} className="border-white/5 hover:bg-white/5">
                                            <TableCell>
                                                <div className="font-medium">{p.name}</div>
                                                <div className="text-xs text-gray-500">{p.email}</div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{p.teamId}</TableCell>
                                            <TableCell className="text-sm">{p.college}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">{p.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={p.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}>
                                                    {p.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400" onClick={() => handleResendEmail(p.teamId)} title="Resend Email">
                                                        <Mail className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400"><Edit className="w-4 h-4" /></Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(p._id, 'participant')}><Trash2 className="w-4 h-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-brand-surface border-white/5 p-6">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-lg">Registration Distribution</CardTitle>
                                <CardDescription>Breakdown by ticket types</CardDescription>
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
                                <CardTitle className="text-lg">Daily Attendance (Real-time)</CardTitle>
                                <CardDescription>Check-ins based on system logs</CardDescription>
                            </CardHeader>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { day: 'Day 1', count: logs.filter(l => l.action.includes('ATTENDANCE_D1') || l.action.includes('ENTRY')).length },
                                        { day: 'Day 2', count: logs.filter(l => l.action.includes('ATTENDANCE_D2')).length },
                                        { day: 'Day 3', count: logs.filter(l => l.action.includes('ATTENDANCE_D3')).length },
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="day" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip contentStyle={{ background: '#020617', border: '1px solid #1e293b' }} />
                                        <Bar dataKey="count" fill="#82d4fa" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="logs" className="mt-6">
                    <Card className="bg-brand-surface border-white/5">
                        <ScrollArea className="h-[600px]">
                            <Table>
                                <TableHeader className="bg-brand-dark/50 sticky top-0 z-10">
                                    <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log._id} className="border-white/5 hover:bg-white/5">
                                            <TableCell className="font-mono text-xs text-gray-500">{log.time}</TableCell>
                                            <TableCell className="font-medium">{log.user}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-white/5">{log.action}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-400">{log.details}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-6 space-y-6">
                    <Card className="bg-brand-surface border-white/5 p-6">
                        <CardHeader className="px-0 pt-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Event Configuration</CardTitle>
                                    <CardDescription>Main event timing and details</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0 pt-6">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-gray-400">Event Start Date</label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="datetime-local"
                                            className="bg-brand-dark border-white/10"
                                            defaultValue={settings?.eventDate ? new Date(settings.eventDate).toISOString().slice(0, 16) : ''}
                                            onBlur={(e) => updateSettings({ eventDate: new Date(e.target.value) })}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 italic">This affects the landing page countdown.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-brand-surface border-white/5 p-6">
                            <CardHeader className="px-0 pt-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Event Registration</CardTitle>
                                        <CardDescription>Control new participant signups</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-0 pt-6">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="font-medium">Registration Status</p>
                                        <p className="text-xs text-gray-400">Currently {settings?.registrationClosed ? 'Closed' : 'Open'}</p>
                                    </div>
                                    <Button
                                        onClick={() => updateSettings({ registrationClosed: !settings?.registrationClosed })}
                                        variant={settings?.registrationClosed ? "destructive" : "outline"}
                                        className={!settings?.registrationClosed ? "border-green-500/20 text-green-400" : ""}
                                    >
                                        {settings?.registrationClosed ? 'Open Registration' : 'Close Registration'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-brand-surface border-white/5 p-6">
                            <CardHeader className="px-0 pt-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Maintenance Mode</CardTitle>
                                        <CardDescription>Restrict all public access</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-0 pt-6">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="font-medium">System State</p>
                                        <p className="text-xs text-gray-400">Currently {settings?.maintenanceMode ? 'Active' : 'Disabled'}</p>
                                    </div>
                                    <Button
                                        onClick={() => updateSettings({ maintenanceMode: !settings?.maintenanceMode })}
                                        variant={settings?.maintenanceMode ? "destructive" : "outline"}
                                        className={!settings?.maintenanceMode ? "border-blue-500/20 text-blue-400" : ""}
                                    >
                                        {settings?.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                {/* Coordinators tab similar to participants... */}
            </Tabs>
        </div>
    );
};

export default AdminDashboard;
