'use client';

import React, { useState } from 'react';
import {
    Download,
    Users,
    UserCog,
    BarChart3,
    Search,
    Trash2,
    Edit,
    Plus,
    Save,
    FileText,
    AlertTriangle,
    Filter,
    RefreshCw,
    LayoutDashboard
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
import { User, Participant, Coordinator, Log } from '@/types';
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
const FOOD_COLORS = ['#4ade80', '#ef4444'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    const {
        participants,
        coordinators,
        logs,
        isLoading,
        fetchParticipants,
        fetchCoordinators,
        fetchLogs,
        deleteParticipant,
        deleteCoordinator
    } = useData();

    const [searchQuery, setSearchQuery] = useState('');
    const [logFilter, setLogFilter] = useState('ALL');

    const handleDelete = async (id: string, type: 'participant' | 'coordinator') => {
        if (confirm(`Are you sure you want to delete this ${type}?`)) {
            try {
                if (type === 'participant') await deleteParticipant(id);
                else await deleteCoordinator(id);
                toast.success(`${type} deleted successfully`);
            } catch (err) {
                toast.error(`Failed to delete ${type}`);
            }
        }
    };

    const handleRefresh = async () => {
        toast.promise(Promise.all([fetchParticipants(), fetchCoordinators(), fetchLogs()]), {
            loading: 'Refreshing data...',
            success: 'Data updated',
            error: 'Failed to refresh data',
        });
    };

    const exportCSV = (data: any[], filename: string) => {
        if (!data || data.length === 0) return;
        const headers = Object.keys(data[0]);
        const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header])).join(","));
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

    const filteredCoordinators = coordinators.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Analytics Data
    const ticketDist = [
        { name: 'Combo', value: participants.filter(p => p.type.toLowerCase().includes('combo')).length },
        { name: 'Workshop', value: participants.filter(p => p.type.toLowerCase().includes('workshop')).length },
        { name: 'Hackathon', value: participants.filter(p => p.type.toLowerCase().includes('hackathon')).length },
    ];

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
                    { label: 'Total Revenue', value: `₹${(participants.length * 499 / 1000).toFixed(1)}k`, icon: BarChart3, color: 'text-green-400' },
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

            <Tabs defaultValue="participants" className="w-full">
                <TabsList className="bg-brand-dark border border-white/10 p-1 rounded-xl">
                    <TabsTrigger value="participants" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">Participants</TabsTrigger>
                    <TabsTrigger value="coordinators" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">Coordinators</TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">Analytics</TabsTrigger>
                    <TabsTrigger value="logs" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">System Logs</TabsTrigger>
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
                                <CardTitle className="text-lg">Daily Attendance (Mock)</CardTitle>
                                <CardDescription>Real-time check-in trends</CardDescription>
                            </CardHeader>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[{ day: 'Day 1', count: participants.length }, { day: 'Day 2', count: 0 }]}>
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
                {/* Coordinators tab similar to participants... */}
            </Tabs>
        </div>
    );
};

export default AdminDashboard;
