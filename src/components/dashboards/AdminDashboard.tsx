'use client';

import React, { useState } from 'react';
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
    Mail,
    Zap,
    Eye,
    Loader2
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
import { Lab, SupportRequest, User } from '@/types';
import { useData } from '@/lib/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Tabs,
    TabsContent,
    TabsTrigger,
    TabsList
} from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Participant, Coordinator, Log } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AddParticipantModal } from '@/components/modals/Admin/AddParticipantModal';
import { AddCoordinatorModal } from '@/components/modals/Admin/AddCoordinatorModal';

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
        deleteCoordinator,
        updateCoordinator,
        labs,
        supportRequests,
        addLab,
        updateLab,
        deleteLab,
        fetchLabs,
        fetchSupportRequests,
        updateSupportRequest,
        allocateLabs,
        processEmailQueue
    } = useData();

    // Column Definitions
    const participantColumns: ColumnDef<Participant>[] = [
        {
            accessorKey: "name",
            header: "Participant",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-white">{row.original.name}</div>
                    <div className="text-xs text-gray-500">{row.original.email}</div>
                </div>
            )
        },
        {
            accessorKey: "teamId",
            header: "Team ID",
            cell: ({ row }) => <span className="font-mono text-xs text-brand-primary">{row.getValue("teamId")}</span>
        },
        {
            accessorKey: "college",
            header: "College",
            cell: ({ row }) => <span className="text-xs text-gray-400 line-clamp-1 max-w-[200px]">{row.getValue("college")}</span>
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                    {row.getValue("type")}
                </Badge>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge variant="outline" className={status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20 text-[10px]' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px]'}>
                        {status}
                    </Badge>
                );
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right w-full">Actions</div>,
            cell: ({ row }) => {
                const p = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400" onClick={() => handleResendEmail(p.teamId)} title="Resend Email">
                            <Mail className="w-4 h-4" />
                        </Button>
                        {p.paymentScreenshotUrl && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-green-400"
                                onClick={() => window.open(p.paymentScreenshotUrl, '_blank')}
                                title="View Payment"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400"><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(p._id, 'participant')}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                );
            }
        }
    ];

    const coordinatorColumns: ColumnDef<Coordinator>[] = [
        {
            accessorKey: "name",
            header: "Coordinator",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-white">{row.original.name}</div>
                    <div className="text-xs text-gray-500">{row.original.email}</div>
                </div>
            )
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => <span className="text-sm">{row.getValue("role")}</span>
        },
        {
            accessorKey: "assigned",
            header: "Assigned Project",
            cell: ({ row }) => <span className="text-sm font-mono text-gray-400">{row.getValue("assigned")}</span>
        },
        {
            accessorKey: "assignedLab",
            header: "Assigned Lab",
            cell: ({ row }) => {
                const c = row.original;
                return (
                    <Select
                        value={c.assignedLab || 'none'}
                        onValueChange={(val) => updateCoordinator({ ...c, assignedLab: val === 'none' ? '' : val })}
                    >
                        <SelectTrigger className="w-[150px] bg-brand-dark border-white/10 h-8">
                            <SelectValue placeholder="Select Lab" />
                        </SelectTrigger>
                        <SelectContent className="bg-brand-surface border-white/10">
                            <SelectItem value="none">None</SelectItem>
                            {labs.map(l => (
                                <SelectItem key={l._id} value={l.name}>{l.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right w-full">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button size="icon" variant="ghost" className="text-red-400 h-8 w-8" onClick={() => handleDelete(row.original._id, 'coordinator')}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    const logColumns: ColumnDef<Log>[] = [
        {
            accessorKey: "time",
            header: "Time",
            cell: ({ row }) => <span className="font-mono text-[10px] text-gray-500">{row.getValue("time")}</span>
        },
        {
            accessorKey: "user",
            header: "User",
            cell: ({ row }) => <span className="font-medium text-xs text-white">{row.getValue("user")}</span>
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] font-mono">
                    {row.getValue("action")}
                </Badge>
            )
        },
        {
            accessorKey: "details",
            header: "Details",
            cell: ({ row }) => <span className="text-[11px] text-gray-400 line-clamp-1">{row.getValue("details")}</span>
        }
    ];

    const labColumns: ColumnDef<Lab>[] = [
        {
            accessorKey: "name",
            header: "Lab Name",
        },
        {
            accessorKey: "roomNumber",
            header: "Room #",
            cell: ({ row }) => <span className="font-mono text-brand-primary">{row.getValue("roomNumber")}</span>
        },
        {
            accessorKey: "capacity",
            header: "Capacity",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{row.original.currentCount} / {row.original.capacity}</span>
                    <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-primary"
                            style={{ width: `${Math.min(100, (row.original.currentCount / row.original.capacity) * 100)}%` }}
                        />
                    </div>
                </div>
            )
        },
        {
            id: "actions",
            header: () => <div className="text-right w-full">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-blue-400 h-8 w-8"
                        onClick={() => {
                            setEditingLab(row.original);
                            setIsEditLabOpen(true);
                        }}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-400 h-8 w-8"
                        onClick={() => handleDelete(row.original._id, 'lab')}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    const supportColumns: ColumnDef<SupportRequest>[] = [
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <Badge className={
                    row.original.type === 'SOS' ? 'bg-red-500/20 text-red-500 border-red-500/30 text-[10px]' :
                        row.original.type === 'Help' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30 text-[10px]' :
                            'bg-green-500/20 text-green-500 border-green-500/30 text-[10px]'
                }>
                    {row.original.type}
                </Badge>
            )
        },
        {
            accessorKey: "teamId",
            header: "Team",
            cell: ({ row }) => (
                <div>
                    <div className="font-mono text-xs text-white">{row.original.teamId}</div>
                    <div className="text-[10px] text-gray-500">{row.original.labName}</div>
                </div>
            )
        },
        {
            accessorKey: "message",
            header: "Message",
            cell: ({ row }) => <span className="text-sm text-gray-300 italic">"{row.original.message || 'No details'}"</span>
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'Open' ? 'default' : 'secondary'} className={row.original.status === 'Open' ? 'bg-orange-500/20 text-orange-400 text-[10px]' : 'bg-green-500/20 text-green-400 text-[10px]'}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            accessorKey: "timestamp",
            header: "Time",
            cell: ({ row }) => <span className="text-[10px] text-gray-500">{new Date(row.original.timestamp).toLocaleString()}</span>
        },
        {
            id: "actions",
            header: () => <div className="text-right w-full">Actions</div>,
            cell: ({ row }) => {
                const req = row.original;
                return (
                    <div className="text-right">
                        {req.status === 'Open' && (
                            <Button
                                size="sm"
                                className="h-7 px-2 text-[11px] bg-green-500 text-white hover:bg-green-600"
                                onClick={() => updateSupportRequest(req._id, 'Resolved')}
                            >
                                Resolve
                            </Button>
                        )}
                    </div>
                );
            }
        }
    ];

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
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'participant' | 'coordinator' | 'lab' } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAllocating, setIsAllocating] = useState(false);
    const [newLab, setNewLab] = useState({ name: '', roomNumber: '', capacity: 0 });
    const [isAddLabOpen, setIsAddLabOpen] = useState(false);
    const [editingLab, setEditingLab] = useState<Lab | null>(null);
    const [isEditLabOpen, setIsEditLabOpen] = useState(false);
    const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
    const [isAddCoordinatorOpen, setIsAddCoordinatorOpen] = useState(false);

    const handleDelete = (id: string, type: 'participant' | 'coordinator' | 'lab') => {
        setItemToDelete({ id, type });
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        try {
            if (itemToDelete.type === 'participant') await deleteParticipant(itemToDelete.id);
            else if (itemToDelete.type === 'coordinator') await deleteCoordinator(itemToDelete.id);
            else await deleteLab(itemToDelete.id);
            toast.success(`${itemToDelete.type} deleted successfully`);
            setItemToDelete(null);
        } catch {
            toast.error(`Failed to delete ${itemToDelete.type}`);
        } finally {
            setIsDeleting(false);
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

    const handleAllocate = async () => {
        setIsAllocating(true);
        try {
            const res = await fetch('/api/admin/allocate', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(data.message);
            await fetchParticipants();
        } catch (error: any) {
            toast.error(error.message || 'Allocation failed');
        } finally {
            setIsAllocating(false);
        }
    };

    const handleAddLab = async () => {
        if (!newLab.name || !newLab.roomNumber || !newLab.capacity) {
            toast.error('Please fill all fields');
            return;
        }

        try {
            await addLab(newLab);
            toast.success('Lab added successfully');
            setNewLab({ name: '', roomNumber: '', capacity: 0 });
            setIsAddLabOpen(false);
        } catch {
            toast.error('Failed to add lab');
        }
    };

    const handleUpdateLab = async () => {
        if (!editingLab) return;
        if (!editingLab.name || !editingLab.roomNumber || !editingLab.capacity) {
            toast.error('Please fill all fields');
            return;
        }

        try {
            await updateLab(editingLab);
            toast.success('Lab updated successfully');
            setIsEditLabOpen(false);
            setEditingLab(null);
        } catch {
            toast.error('Failed to update lab');
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

    const revenueDisplay = (totalRevenue / 1000).toFixed(3) + 'k';

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
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Registrations', value: participants.length, icon: Users, color: 'text-blue-400' },
                    { label: 'Total Revenue', value: `₹${revenueDisplay}`, icon: BarChart3, color: 'text-green-400' },
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
                    <TabsTrigger value="activity" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">Activity & Labs</TabsTrigger>
                    <TabsTrigger value="support" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">Support Requests</TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">Analytics</TabsTrigger>
                    <TabsTrigger value="logs" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">System Logs</TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-dark">System Controls</TabsTrigger>
                </TabsList>

                <TabsContent value="participants" className="mt-6 space-y-4">
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                        <div className="flex gap-2">
                            <Button onClick={fetchParticipants} variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
                                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                            </Button>
                            <Button onClick={() => setIsAddParticipantOpen(true)} className="bg-brand-primary text-brand-dark hover:bg-white">
                                <Plus className="w-4 h-4 mr-2" /> Add Participant
                            </Button>
                        </div>
                        <Button variant="outline" onClick={() => exportCSV(participants, 'participants')} className="border-white/10 bg-white/5">
                            <Download className="w-4 h-4 mr-2" /> Export CSV
                        </Button>
                    </div>

                    <DataTable
                        columns={participantColumns}
                        data={participants}
                        searchKey="name"
                        placeholder="Search participants by name..."
                    />
                </TabsContent>

                <TabsContent value="activity" className="mt-6 space-y-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold">Lab Management</h3>
                            <p className="text-sm text-gray-400">Total capacity: {labs.reduce((acc, l) => acc + l.capacity, 0)} slots</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={fetchLabs} variant="outline" size="sm" className="border-white/10 bg-white/5 hover:bg-white/10">
                                <RefreshCw className={`w-3 h-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                            </Button>
                            <Button variant="outline" onClick={() => setIsAddLabOpen(true)} size="sm" className="border-white/10 bg-white/5">
                                <Plus className="w-3 h-3 mr-2" /> Add Lab
                            </Button>
                            <Button
                                onClick={allocateLabs}
                                size="sm"
                                className="bg-brand-primary text-brand-dark hover:bg-white"
                            >
                                <Zap className="w-3 h-3 mr-2" />
                                Allocate Participants
                            </Button>
                        </div>
                    </div>

                    <DataTable
                        columns={labColumns}
                        data={labs}
                        searchKey="name"
                        placeholder="Search labs..."
                    />

                    <Dialog open={isAddLabOpen} onOpenChange={setIsAddLabOpen}>
                        <DialogContent className="bg-brand-surface border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Add New Lab</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Lab Name</Label>
                                    <Input
                                        placeholder="e.g. Lab 1"
                                        className="bg-brand-dark"
                                        value={newLab.name}
                                        onChange={e => setNewLab({ ...newLab, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Room Number</Label>
                                    <Input
                                        placeholder="e.g. 201"
                                        className="bg-brand-dark"
                                        value={newLab.roomNumber}
                                        onChange={e => setNewLab({ ...newLab, roomNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Capacity</Label>
                                    <Input
                                        type="number"
                                        className="bg-brand-dark"
                                        value={newLab.capacity}
                                        onChange={e => setNewLab({ ...newLab, capacity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddLabOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddLab} className="bg-brand-primary text-brand-dark">Add Lab</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isEditLabOpen} onOpenChange={setIsEditLabOpen}>
                        <DialogContent className="bg-brand-surface border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Edit Lab</DialogTitle>
                            </DialogHeader>
                            {editingLab && (
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Lab Name</Label>
                                        <Input
                                            className="bg-brand-dark"
                                            value={editingLab.name}
                                            onChange={e => setEditingLab({ ...editingLab, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Room Number</Label>
                                        <Input
                                            className="bg-brand-dark"
                                            value={editingLab.roomNumber}
                                            onChange={e => setEditingLab({ ...editingLab, roomNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Capacity</Label>
                                        <Input
                                            type="number"
                                            className="bg-brand-dark"
                                            value={editingLab.capacity}
                                            onChange={e => setEditingLab({ ...editingLab, capacity: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditLabOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateLab} className="bg-brand-primary text-brand-dark">Update Lab</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                <TabsContent value="support" className="mt-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Support Requests</h2>
                            <p className="text-sm text-gray-400">Manage help and issue reports</p>
                        </div>
                        <Button onClick={() => fetchSupportRequests()} variant="outline" size="sm" className="border-white/10 bg-white/5 hover:bg-white/10">
                            <RefreshCw className={`w-3 h-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                        </Button>
                    </div>

                    <DataTable
                        columns={supportColumns}
                        data={supportRequests}
                        searchKey="teamId"
                        placeholder="Search by team ID..."
                    />
                </TabsContent>

                <TabsContent value="analytics" className="mt-6 space-y-6">
                    <div className="flex justify-end">
                        <Button onClick={handleRefresh} variant="outline" size="sm" className="border-white/10 bg-white/5 hover:bg-white/10">
                            <RefreshCw className={`w-3 h-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
                        </Button>
                    </div>
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

                <TabsContent value="logs" className="mt-6 space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={fetchLogs} variant="outline" size="sm" className="border-white/10 bg-white/5 hover:bg-white/10">
                            <RefreshCw className={`w-3 h-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Logs
                        </Button>
                    </div>
                    <DataTable
                        columns={logColumns}
                        data={logs}
                        searchKey="user"
                        placeholder="Search logs by user..."
                    />
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
                                    <Label className="text-sm text-gray-400">Event Start Date</Label>
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

                                <div className="flex flex-col gap-2">
                                    <Label className="text-sm text-gray-400">Total Prize Pool</Label>
                                    <Input
                                        defaultValue={settings?.prizePool}
                                        onBlur={(e) => updateSettings({ prizePool: e.target.value })}
                                        className="bg-brand-dark border-white/10"
                                        placeholder="₹40,000"
                                    />
                                    <p className="text-[10px] text-gray-500 italic">Adjust this to update the prize money shown on the landing page.</p>
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

                        <Card className="bg-brand-surface border-white/5 p-6 md:col-span-2">
                            <CardHeader className="px-0 pt-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Payment Configuration</CardTitle>
                                        <CardDescription>Update UPI ID and QR Code for registration payments</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-0 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-400">Merchant UPI ID</Label>
                                        <Input
                                            defaultValue={settings?.upiId}
                                            onBlur={(e) => updateSettings({ upiId: e.target.value })}
                                            className="bg-brand-dark border-white/10"
                                            placeholder="example@upi"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-400">Payment QR Code URL (relative or absolute)</Label>
                                        <Input
                                            defaultValue={settings?.qrImageUrl}
                                            onBlur={(e) => updateSettings({ qrImageUrl: e.target.value })}
                                            className="bg-brand-dark border-white/10"
                                            placeholder="/qr-payment.png"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-brand-surface border-white/5 p-6 md:col-span-2">
                            <CardHeader className="px-0 pt-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">System Actions</CardTitle>
                                        <CardDescription>Manual controls for background processes</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-0 pt-6 space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="pr-4">
                                        <p className="text-sm font-medium">Email Queue</p>
                                        <p className="text-[10px] text-gray-400">Process any deferred emails that hit rate limits</p>
                                    </div>
                                    <Button
                                        onClick={processEmailQueue}
                                        variant="outline"
                                        size="sm"
                                        className="border-orange-500/20 text-orange-400 hover:bg-orange-500/10 shrink-0"
                                    >
                                        Process Now
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="pr-4">
                                        <p className="text-sm font-medium">Refresh Global Data</p>
                                        <p className="text-[10px] text-gray-400">Force update all dashboard statistics</p>
                                    </div>
                                    <Button
                                        onClick={handleRefresh}
                                        variant="outline"
                                        size="sm"
                                        className="border-white/10 text-white shrink-0"
                                    >
                                        Refresh Data
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="coordinators" className="mt-6 space-y-4">
                    <div className="flex gap-2">
                        <Button onClick={fetchCoordinators} variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                        </Button>
                        <Button onClick={() => setIsAddCoordinatorOpen(true)} className="bg-brand-primary text-brand-dark hover:bg-white">
                            <Plus className="w-4 h-4 mr-2" /> Add Coordinator
                        </Button>
                    </div>
                    <DataTable
                        columns={coordinatorColumns}
                        data={coordinators}
                        searchKey="name"
                        placeholder="Search coordinators by name..."
                    />
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <DialogContent className="bg-brand-surface border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="w-5 h-5" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setItemToDelete(null)} disabled={isDeleting} className="border-white/10">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Delete Everything
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Participant Modal */}
            <AddParticipantModal
                isOpen={isAddParticipantOpen}
                onClose={() => setIsAddParticipantOpen(false)}
                onSuccess={() => fetchParticipants()}
            />

            {/* Add Coordinator Modal */}
            <AddCoordinatorModal
                isOpen={isAddCoordinatorOpen}
                onClose={() => setIsAddCoordinatorOpen(false)}
                onSuccess={() => fetchCoordinators()}
            />
        </div >
    );
};

export default AdminDashboard;
