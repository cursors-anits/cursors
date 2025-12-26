import React, { useMemo } from 'react';
import { useData } from '@/lib/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, LayoutGrid, CheckCircle2, AlertCircle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function AnalyticsTab() {
    const { participants, labs, logs } = useData();

    // Key Metrics
    const totalParticipants = participants.length;
    const allocatedParticipants = participants.filter(p => p.assignedHackathonLab).length;
    const unallocatedParticipants = totalParticipants - allocatedParticipants;
    const allocationRate = totalParticipants > 0 ? Math.round((allocatedParticipants / totalParticipants) * 100) : 0;

    // Lab Distribution Data
    const labData = useMemo(() => {
        return labs.map(lab => ({
            name: lab.name,
            count: participants.filter(p => p.assignedHackathonLab === lab.name).length,
            capacity: lab.capacity
        }));
    }, [labs, participants]);

    // Allocation Status Data
    const allocationData = [
        { name: 'Allocated', value: allocatedParticipants },
        { name: 'Unallocated', value: unallocatedParticipants },
    ];

    // Registration Timeline (Last 7 days or all time)
    const timelineData = useMemo(() => {
        const data: Record<string, number> = {};
        participants.forEach(p => {
            if (p.createdAt) {
                const date = new Date(p.createdAt).toLocaleDateString();
                data[date] = (data[date] || 0) + 1;
            }
        });
        return Object.entries(data).map(([date, count]) => ({ date, count })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [participants]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalParticipants}</div>
                        <p className="text-xs text-muted-foreground">Participants registered</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Allocation Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allocationRate}%</div>
                        <p className="text-xs text-muted-foreground">{allocatedParticipants} of {totalParticipants} allocated</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Labs</CardTitle>
                        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{labs.length}</div>
                        <p className="text-xs text-muted-foreground">Capacity: {labs.reduce((acc, l) => acc + l.capacity, 0)} seats</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Lab Utilization</CardTitle>
                        <CardDescription>Participants per Lab vs Capacity</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={labData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="count" fill="#4f46e5" name="Enrolled" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="capacity" fill="#94a3b8" name="Capacity" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Allocation Status</CardTitle>
                        <CardDescription>Allocated vs Unallocated Participants</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {allocationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Registration Timeline</CardTitle>
                    <CardDescription>New registrations over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
