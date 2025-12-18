'use client';

import React, { useState } from 'react';
import {
    Download,
    Users,
    UserCog,
    BarChart3,
    Activity,
    Search,
    PieChart as PieChartIcon,
    TrendingUp,
    Mail,
    MapPin
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
    Cell,
    LineChart,
    Line
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

interface FacultyDashboardProps {
    user: User;
}

const COLORS = ['#82d4fa', '#38bdf8', '#0ea5e9', '#1e293b'];

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ user }) => {
    const { participants, coordinators, logs } = useData();
    const [activeTab, setActiveTab] = useState('overview');

    const ticketDist = [
        { name: 'Combo', value: participants.filter(p => p.type.toLowerCase().includes('combo')).length },
        { name: 'Workshop', value: participants.filter(p => p.type.toLowerCase().includes('workshop')).length },
        { name: 'Hackathon', value: participants.filter(p => p.type.toLowerCase().includes('hackathon')).length },
    ];

    return (
        <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Faculty Oversight</h1>
                    <p className="text-gray-400 mt-1">Institutional overview of Vibe Coding event</p>
                </div>
                <Button variant="outline" className="border-white/10">
                    <Download className="w-4 h-4 mr-2" /> Export Report
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Registration', value: participants.length, icon: Users, color: 'text-blue-400' },
                    { label: 'Event Coordinators', value: coordinators.length, icon: UserCog, color: 'text-purple-400' },
                    { label: 'Revenue Generated', value: `₹${(participants.length * 499 / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-green-400' },
                    { label: 'System Health', value: '100%', icon: Activity, color: 'text-orange-400' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-brand-surface border-white/5">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</p>
                                <h3 className="text-2xl font-bold">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="bg-brand-dark border-white/10">
                    <TabsTrigger value="overview">Event Overview</TabsTrigger>
                    <TabsTrigger value="participants">Participant List</TabsTrigger>
                    <TabsTrigger value="coordinators">Coordinators</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-8 space-y-8">
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

                <TabsContent value="participants">
                    <Card className="bg-brand-surface border-white/5">
                        <ScrollArea className="h-[500px]">
                            <div className="p-6">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-xs text-gray-500 uppercase border-b border-white/10">
                                            <th className="pb-4">Name</th>
                                            <th className="pb-4">College</th>
                                            <th className="pb-4">Team</th>
                                            <th className="pb-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {participants.map(p => (
                                            <tr key={p._id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-4 text-sm font-medium">{p.name}</td>
                                                <td className="py-4 text-sm text-gray-400">{p.college}</td>
                                                <td className="py-4 text-sm font-mono text-brand-primary">{p.teamId}</td>
                                                <td className="py-4"><Badge variant="outline" className="text-[10px]">{p.status}</Badge></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </ScrollArea>
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
            </Tabs>
        </div>
    );
};

export default FacultyDashboard;
