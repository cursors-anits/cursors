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
    Loader2,
    RotateCcw
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { SettingsTab } from '@/components/dashboards/SettingsTab';
import { DeleteTeamModal } from '@/components/modals/DeleteTeamModal';
import { EditTeamModal } from '@/components/modals/EditTeamModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardShell } from '@/components/dashboards/DashboardShell';
import { NavItem } from '@/components/dashboards/DashboardNav';

interface AdminDashboardProps {
    user: User;
}

const COLORS = ['#82d4fa', '#0ea5e9', '#38bdf8', '#334155'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
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
        updateParticipant,
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
            accessorKey: "allocation",
            header: "Allocation",
            cell: ({ row }) => {
                const p = row.original;
                const hasWorkshop = !!p.assignedWorkshopLab;
                const hasHackathon = !!p.assignedHackathonLab;
                const hasAny = hasWorkshop || hasHackathon;

                return hasAny ? (
                    <div className="flex items-center gap-2">
                        <div className="text-[10px] text-gray-400 space-y-1">
                            {hasWorkshop && <div>W: {p.assignedWorkshopLab}</div>}
                            {hasHackathon && <div>H: {p.assignedHackathonLab}</div>}
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-orange-400"
                            onClick={() => handleRevertAllocation(p._id, hasWorkshop && hasHackathon ? 'both' : hasWorkshop ? 'workshop' : 'hackathon')}
                            title="Revert allocation"
                        >
                            <RotateCcw className="w-3 h-3" />
                        </Button>
                    </div>
                ) : (
                    <span className="text-[10px] text-gray-600">Not allocated</span>
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
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400" onClick={() => handleEditParticipant(p)} title="Edit"><Edit className="w-4 h-4" /></Button>
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
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.type || 'Workshop'}</Badge>
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
                            setEditingLab({ ...row.original, type: row.original.type || 'Workshop' });
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
            accessorKey: "resolvedBy",
            header: "Resolved By",
            cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.resolvedBy || '-'}</span>
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
                                onClick={() => updateSupportRequest(req._id, 'Resolved', user.name)}
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
    const [newLab, setNewLab] = useState<{ name: string, roomNumber: string, capacity: number, type: 'Workshop' | 'Hackathon' }>({ name: '', roomNumber: '', capacity: 0, type: 'Workshop' });
    const [sosOpen, setSosOpen] = useState(false);
    const [acknowledgedSOSIds, setAcknowledgedSOSIds] = useState<string[]>([]);

    // SOS Buzzer Logic
    React.useEffect(() => {
        // Find open SOS requests that haven't been acknowledged yet
        const newSOS = supportRequests.filter(r => r.type === 'SOS' && r.status === 'Open' && !acknowledgedSOSIds.includes(r._id));

        if (newSOS.length > 0 && !sosOpen) {
            setSosOpen(true);
            // Play buzzer sound if valid interaction allows (browsers block auto-audio usually)
            // Using a simple beep sound data URI
            const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'); // Short beep placeholder
            audio.play().catch(e => console.log('Audio play blocked', e));
        }
    }, [supportRequests, acknowledgedSOSIds, sosOpen]);

    const handleAcknowledge = () => {
        setSosOpen(false);
        // Add all currently open SOS IDs to acknowledged list
        const openSOSIds = supportRequests.filter(r => r.type === 'SOS' && r.status === 'Open').map(r => r._id);
        setAcknowledgedSOSIds(prev => [...prev, ...openSOSIds]);
    };

    const [isAddLabOpen, setIsAddLabOpen] = useState(false);
    const [editingLab, setEditingLab] = useState<Lab | null>(null);
    const [isEditLabOpen, setIsEditLabOpen] = useState(false);
    const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
    const [isAddCoordinatorOpen, setIsAddCoordinatorOpen] = useState(false);

    const handleEditParticipant = async (participant: Participant) => {
        const teamMembers = participants.filter(p => p.teamId === participant.teamId);
        setEditingTeamMembers(teamMembers);

        try {
            const response = await fetch(`/api/auth/user-by-team?teamId=${participant.teamId}`);

            if (response.ok) {
                const userData = await response.json();
                setEditingTeamUser(userData);
            } else {
                setEditingTeamUser(null);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            setEditingTeamUser(null);
        }

        setEditTeamModalOpen(true);
    };

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

    const handleAllocate = async (eventType: 'Workshop' | 'Hackathon') => {
        setIsAllocating(true);
        try {
            const res = await fetch(`/api/admin/allocate?type=${eventType}`, { method: 'POST' });
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

    const handleRevertAllocation = async (participantId: string, eventType: 'workshop' | 'hackathon' | 'both') => {
        const participant = participants.find(p => p._id === participantId);
        if (!participant) return;

        const updates: Partial<Participant> = { _id: participantId };

        if (eventType === 'workshop' || eventType === 'both') {
            updates.assignedWorkshopLab = undefined;
        }
        if (eventType === 'hackathon' || eventType === 'both') {
            updates.assignedHackathonLab = undefined;
        }

        try {
            await updateParticipant(updates as Participant);
            toast.success(`Allocation reverted successfully`);
            fetchParticipants();
        } catch {
            toast.error('Failed to revert allocation');
        }
    };

    const handleAddLab = async () => {
        if (!newLab.name || !newLab.capacity) {
            toast.error('Please fill name and capacity');
            return;
        }

        try {
            await addLab(newLab as any); // Cast because we know type is present or defaults
            toast.success('Lab added successfully');
            setNewLab({ name: '', roomNumber: '', capacity: 0, type: 'Workshop' });
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

    // Group participants by teamId
    const teamGroups = React.useMemo(() => {
        const groups = new Map<string, Participant[]>();
        filteredParticipants.forEach(p => {
            const teamId = p.teamId || p._id;
            if (!groups.has(teamId)) {
                groups.set(teamId, []);
            }
            groups.get(teamId)!.push(p);
        });
        return Array.from(groups.entries()).map(([teamId, members]) => ({
            teamId,
            members,
            teamSize: members.length,
            type: members[0].type,
            college: members[0].college,
            hasPayment: members.some(m => m.paymentScreenshotUrl),
            isAllocated: members.some(m => m.assignedWorkshopLab || m.assignedHackathonLab),
        }));
    }, [filteredParticipants]);

    const [expandedTeams, setExpandedTeams] = React.useState<Set<string>>(new Set());
    const [typeFilter, setTypeFilter] = useState('all');
    const [allocationFilter, setAllocationFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMembers, setSelectedMembers] = useState<Record<string, Set<string>>>({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteModalTeam, setDeleteModalTeam] = useState<{ teamId: string, members: Participant[] } | null>(null);
    const [editTeamModalOpen, setEditTeamModalOpen] = useState(false);
    const [editingTeamMembers, setEditingTeamMembers] = useState<Participant[]>([]);
    const [editingTeamUser, setEditingTeamUser] = useState<User | null>(null);
    const ITEMS_PER_PAGE = 10;

    const toggleTeam = (teamId: string) => {
        setExpandedTeams(prev => {
            const next = new Set(prev);
            if (next.has(teamId)) {
                next.delete(teamId);
            } else {
                next.add(teamId);
            }
            return next;
        });
    };

    const toggleMemberSelection = (teamId: string, memberId: string) => {
        setSelectedMembers(prev => {
            const teamSelections = new Set(prev[teamId] || []);
            if (teamSelections.has(memberId)) {
                teamSelections.delete(memberId);
            } else {
                teamSelections.add(memberId);
            }
            return { ...prev, [teamId]: teamSelections };
        });
    };

    const handleDeleteSelected = async (teamId: string) => {
        const selected = selectedMembers[teamId];
        if (!selected || selected.size === 0) {
            toast.error('No members selected');
            return;
        }
        for (const memberId of Array.from(selected)) {
            await deleteParticipant(memberId);
        }
        setSelectedMembers(prev => ({ ...prev, [teamId]: new Set() }));
        toast.success(`Deleted ${selected.size} member(s)`);
    };

    const handleDeleteAll = async (teamId: string, memberIds: string[]) => {
        for (const memberId of memberIds) {
            await deleteParticipant(memberId);
        }
        setSelectedMembers(prev => ({ ...prev, [teamId]: new Set() }));
        toast.success(`Deleted all ${memberIds.length} team members`);
    };

    // Apply filters
    const filteredTeams = React.useMemo(() => {
        return teamGroups.filter(team => {
            const matchesType = typeFilter === 'all' || team.type === typeFilter;
            const matchesAllocation = allocationFilter === 'all' ||
                (allocationFilter === 'allocated' && team.isAllocated) ||
                (allocationFilter === 'not-allocated' && !team.isAllocated);
            return matchesType && matchesAllocation;
        });
    }, [teamGroups, typeFilter, allocationFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE);
    const paginatedTeams = React.useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTeams.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredTeams, currentPage]);

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter, allocationFilter, searchQuery]);

    const totalRevenue = participants.reduce<number>((acc, p) => {
        const type = p.type.toLowerCase();
        if (type.includes('combo')) return acc + 499;
        if (type.includes('hackathon')) return acc + 349;
        if (type.includes('workshop')) return acc + 199;
        return acc + 499; // Default
    }, 0);

    const revenueDisplay = (totalRevenue / 1000).toFixed(3) + 'k';

    const navItems: NavItem[] = [
        { label: 'Participants', icon: Users, value: 'participants', group: 'Users' },
        { label: 'Coordinators', icon: UserCog, value: 'coordinators', group: 'Users' },
        { label: 'Activity & Labs', icon: Zap, value: 'activity', group: 'Operations' },
        { label: 'Support Requests', icon: AlertTriangle, value: 'support', group: 'Operations' },
        { label: 'Analytics', icon: BarChart3, value: 'analytics', group: 'Monitoring' },
        { label: 'System Logs', icon: FileText, value: 'logs', group: 'Monitoring' },
        { label: 'System Config', icon: Globe, value: 'system', group: 'Settings' },
        { label: 'My Account', icon: Lock, value: 'settings', group: 'Settings' },
    ];

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
        <DashboardShell
            title="Admin Workspace"
            description="Real-time event management & insights"
            items={navItems}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            user={{
                name: user.name,
                email: user.email,
                role: 'Administrator'
            }}
        >
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

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

                    {/* Search and Filters */}
                    <div className="flex flex-wrap gap-3 items-center bg-brand-surface p-4 rounded-lg border border-white/5">
                        <Input
                            placeholder="Search by team ID, name, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm bg-brand-dark border-white/10"
                        />
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[150px] bg-brand-dark border-white/10">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent className="bg-brand-surface border-white/10">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Workshop">Workshop</SelectItem>
                                <SelectItem value="Hackathon">Hackathon</SelectItem>
                                <SelectItem value="Combo">Combo</SelectItem>
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

                    {/* Team-based Table */}
                    <div className="bg-brand-surface border border-white/5 rounded-xl overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow>
                                    <TableHead className="text-gray-400">Team ID</TableHead>
                                    <TableHead className="text-gray-400">Team Size</TableHead>
                                    <TableHead className="text-gray-400">Type</TableHead>
                                    <TableHead className="text-gray-400">Allocation</TableHead>
                                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedTeams.map((team) => (
                                    <React.Fragment key={team.teamId}>
                                        <TableRow
                                            className="cursor-pointer hover:bg-white/5"
                                            onClick={() => toggleTeam(team.teamId)}
                                        >
                                            <TableCell className="font-mono text-xs text-brand-primary">{team.teamId}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px]">
                                                    {team.teamSize} member{team.teamSize > 1 ? 's' : ''}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                                                    {team.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {team.isAllocated ? (
                                                    <div className="text-gray-400 space-y-1 text-[10px]">
                                                        {team.members.find(m => m.assignedWorkshopLab)?.assignedWorkshopLab && <div>W: {team.members.find(m => m.assignedWorkshopLab)?.assignedWorkshopLab}</div>}
                                                        {team.members.find(m => m.assignedHackathonLab)?.assignedHackathonLab && <div>H: {team.members.find(m => m.assignedHackathonLab)?.assignedHackathonLab}</div>}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-600 text-[10px]">Not allocated</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-1 justify-end items-center" onClick={(e) => e.stopPropagation()}>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleResendEmail(team.teamId)} title="Resend email">
                                                        <Mail className="w-3 h-3" />
                                                    </Button>
                                                    {team.hasPayment && (
                                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-400" onClick={() => team.members[0].paymentScreenshotUrl && window.open(team.members[0].paymentScreenshotUrl, '_blank')} title="View payment">
                                                            <Eye className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-400" onClick={() => handleEditParticipant(team.members[0])} title="Edit team">
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400" onClick={() => { setDeleteModalTeam({ teamId: team.teamId, members: team.members }); setDeleteModalOpen(true); }} title="Delete team members">
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {expandedTeams.has(team.teamId) && (
                                            <TableRow className="bg-white/2">
                                                <TableCell colSpan={5} className="p-4">
                                                    <div className="space-y-3">
                                                        {team.members.map((member) => (
                                                            <div key={member._id} className="bg-brand-dark p-4 rounded-lg border border-white/5">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                                                                    <div><span className="text-gray-500">Name:</span> <span className="text-white ml-1">{member.name}</span></div>
                                                                    <div className="truncate"><span className="text-gray-500">Email:</span> <span className="text-gray-300 ml-1">{member.email}</span></div>
                                                                    <div className="truncate"><span className="text-gray-500">College:</span> <span className="text-gray-300 ml-1" title={member.college}>{member.college}</span></div>
                                                                    {member.assignedWorkshopLab && <div><span className="text-gray-500">Workshop Lab:</span> <span className="text-brand-primary ml-1">{member.assignedWorkshopLab}</span></div>}
                                                                    {member.assignedHackathonLab && <div><span className="text-gray-500">Hackathon Lab:</span> <span className="text-brand-primary ml-1">{member.assignedHackathonLab}</span></div>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-2">
                        <div className="text-sm text-gray-400">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTeams.length)} of {filteredTeams.length} teams
                        </div>
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

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" className="bg-brand-primary text-brand-dark hover:bg-white">
                                        <Zap className="w-3 h-3 mr-2" />
                                        Allocate...
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-brand-surface border-white/10">
                                    <DropdownMenuItem onClick={() => handleAllocate('Workshop')}>
                                        Allocate Workshop
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAllocate('Hackathon')}>
                                        Allocate Hackathon
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                                    <Label>Type</Label>
                                    <Select
                                        value={newLab.type}
                                        onValueChange={(val: 'Workshop' | 'Hackathon') => setNewLab({ ...newLab, type: val })}
                                    >
                                        <SelectTrigger className="bg-brand-dark border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-brand-surface border-white/10">
                                            <SelectItem value="Workshop">Workshop</SelectItem>
                                            <SelectItem value="Hackathon">Hackathon</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                        <Label>Type</Label>
                                        <Select
                                            value={editingLab.type}
                                            onValueChange={(val: 'Workshop' | 'Hackathon') => setEditingLab({ ...editingLab, type: val })}
                                        >
                                            <SelectTrigger className="bg-brand-dark border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-brand-surface border-white/10">
                                                <SelectItem value="Workshop">Workshop</SelectItem>
                                                <SelectItem value="Hackathon">Hackathon</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                    {/* Stats Cards Moved Here */}
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="bg-brand-surface border-white/5 p-6">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-xl">Ticket Distribution</CardTitle>
                                <CardDescription>Participants by ticket type</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Combo', value: participants.filter(p => p.type.toLowerCase().includes('combo')).length },
                                                { name: 'Workshop', value: participants.filter(p => p.type.toLowerCase().includes('workshop')).length },
                                                { name: 'Hackathon', value: participants.filter(p => p.type.toLowerCase().includes('hackathon')).length },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {[
                                                { name: 'Combo', value: participants.filter(p => p.type.toLowerCase().includes('combo')).length },
                                                { name: 'Workshop', value: participants.filter(p => p.type.toLowerCase().includes('workshop')).length },
                                                { name: 'Hackathon', value: participants.filter(p => p.type.toLowerCase().includes('hackathon')).length },
                                            ].map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#020202', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-brand-surface border-white/5 p-6">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-xl">College Distribution</CardTitle>
                                <CardDescription>Participants by college</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(participants.reduce((acc, p) => {
                                                const college = p.college || 'Unknown';
                                                acc[college] = (acc[college] || 0) + 1;
                                                return acc;
                                            }, {} as Record<string, number>))
                                                .map(([name, value]) => ({ name, value }))
                                                .sort((a, b) => b.value - a.value)
                                                .slice(0, 5)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {participants.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#020202', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
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

                <TabsContent value="system" className="mt-6 space-y-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                        <Card className="bg-brand-surface border-white/5 p-6">
                            <CardHeader className="px-0 pt-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Internships</CardTitle>
                                        <CardDescription>Show internship opportunities</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-0 pt-6">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="font-medium">Feature Visibility</p>
                                        <p className="text-xs text-gray-400">Currently {settings?.showInternships ? 'Visible' : 'Hidden'}</p>
                                    </div>
                                    <Button
                                        onClick={() => updateSettings({ showInternships: !settings?.showInternships })}
                                        variant={settings?.showInternships ? "destructive" : "outline"}
                                        className={!settings?.showInternships ? "border-brand-primary/20 text-brand-primary" : ""}
                                    >
                                        {settings?.showInternships ? 'Hide Feature' : 'Show Feature'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

                <TabsContent value="settings" className="mt-6">
                    <SettingsTab user={user} />
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
            </Tabs >

            {/* Delete Confirmation Modal */}
            < Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
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
            </Dialog >

            {/* Add Participant Modal */}
            < AddParticipantModal
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
            {/* SOS Alert Dialog */}
            <AlertDialog open={sosOpen} onOpenChange={setSosOpen}>
                <AlertDialogContent className="bg-red-500/10 border-red-500/50 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-500 text-2xl font-bold animate-pulse">
                            <AlertTriangle className="w-8 h-8" />
                            EMERGENCY SOS ALERT
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-200 text-lg">
                            A team has requested IMMEDIATE assistance! Please check the Support Requests table.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleAcknowledge} className="bg-red-500 hover:bg-red-600 font-bold border-none">
                            I Functionally Acknowledge
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Team Modal */}
            <DeleteTeamModal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setDeleteModalTeam(null); }}
                teamData={deleteModalTeam}
                selectedMembers={deleteModalTeam ? (selectedMembers[deleteModalTeam.teamId] || new Set()) : new Set()}
                onToggleMember={(memberId) => deleteModalTeam && toggleMemberSelection(deleteModalTeam.teamId, memberId)}
                onDeleteSelected={() => deleteModalTeam && handleDeleteSelected(deleteModalTeam.teamId)}
                onDeleteAll={() => deleteModalTeam && handleDeleteAll(deleteModalTeam.teamId, deleteModalTeam.members.map(m => m._id))}
            />

            {/* Edit Team Modal */}
            <EditTeamModal
                isOpen={editTeamModalOpen}
                onClose={() => { setEditTeamModalOpen(false); setEditingTeamMembers([]); setEditingTeamUser(null); }}
                teamMembers={editingTeamMembers}
                teamUser={editingTeamUser}
                onSave={async (updatedMembers, userUpdates) => {
                    // Update user credentials
                    if (editingTeamUser) {
                        try {
                            await fetch('/api/auth/user', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    _id: editingTeamUser._id,
                                    email: userUpdates.email,
                                    passkey: userUpdates.passkey
                                })
                            });
                        } catch (error) {
                            console.error('Failed to update user:', error);
                        }
                    }

                    // Update each member
                    for (const member of updatedMembers) {
                        await updateParticipant(member);
                    }

                    toast.success('Team updated successfully');
                    fetchParticipants();
                    setEditTeamModalOpen(false);
                    setEditingTeamMembers([]);
                    setEditingTeamUser(null);
                }}
            />

        </DashboardShell >
    );
};

export default AdminDashboard;
