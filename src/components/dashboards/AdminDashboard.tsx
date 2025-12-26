'use client';

import React, { useMemo, useState } from 'react';
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
    LayoutGrid,
    CheckCircle2, FileCode2, Clock, Upload, Ban,
    Database
} from 'lucide-react';
import {
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    CartesianGrid,
    Bar,
    XAxis,
    YAxis
} from 'recharts';
import { Lab, SupportRequest, User } from '@/types';
import DataManagementTab from '../admin/DataManagementTab';
import { useData } from '@/lib/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Tabs,
    TabsContent
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
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
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
import ProblemAllocationTab from '@/components/admin/ProblemAllocationTab';
import { AnalyticsTab } from '@/components/admin/AnalyticsTab';
import { SubmissionsTab } from '@/components/admin/SubmissionsTab';
import { DeleteTeamModal } from '@/components/modals/DeleteTeamModal';
import { EditTeamModal } from '@/components/modals/EditTeamModal';
import { EditCoordinatorModal } from '@/components/modals/Admin/EditCoordinatorModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SystemConfigTab from '@/components/admin/SystemConfigTab';
import PendingRequestsTab from '@/components/admin/PendingRequestsTab';
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
        isLoading,
        fetchParticipants,
        fetchCoordinators,
        fetchLogs,
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
        updateSupportRequest } = useData();

    // Column Definitions
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
                <div className="text-right flex gap-1 justify-end">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 h-8 w-8"
                        onClick={() => {
                            setEditingCoordinator(row.original);
                            setEditCoordinatorModalOpen(true);
                        }}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
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
            cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.type || 'Hackathon'}</Badge>
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
                            setEditingLab({ ...row.original, type: row.original.type || 'Hackathon' });
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
    const [newLab, setNewLab] = useState<{ name: string, roomNumber: string, capacity: number, type: 'Hackathon' }>({ name: '', roomNumber: '', capacity: 0, type: 'Hackathon' });
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

    const handleAllocate = async (eventType: 'Hackathon') => {
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


    const handleAddLab = async () => {
        if (!newLab.name || !newLab.capacity) {
            toast.error('Please fill name and capacity');
            return;
        }

        try {
            await addLab(newLab as any); // Cast because we know type is present or defaults
            toast.success('Lab added successfully');
            setNewLab({ name: '', roomNumber: '', capacity: 0, type: 'Hackathon' });
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
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.whatsapp?.toLowerCase().includes(searchQuery.toLowerCase())
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
            isAllocated: members.some(m => m.assignedHackathonLab),
            assignedHackathonLab: members.find(m => m.assignedHackathonLab)?.assignedHackathonLab,
        }));
    }, [filteredParticipants]);

    const [expandedTeams, setExpandedTeams] = React.useState<Set<string>>(new Set());
    const [typeFilter, setTypeFilter] = useState('all');
    const [allocationFilter, setAllocationFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMembers, setSelectedMembers] = useState<Record<string, Set<string>>>({});
    const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteModalTeam, setDeleteModalTeam] = useState<{ teamId: string, members: Participant[] } | null>(null);
    const [editTeamModalOpen, setEditTeamModalOpen] = useState(false);
    const [editCoordinatorModalOpen, setEditCoordinatorModalOpen] = useState(false);
    const [editingCoordinator, setEditingCoordinator] = useState<Coordinator | null>(null);
    const [editingTeamMembers, setEditingTeamMembers] = useState<Participant[]>([]);
    const [editingTeamUser, setEditingTeamUser] = useState<User | null>(null);
    const ITEMS_PER_PAGE = 10;

    // Apply filters matching Coordinator/Faculty logic
    const filteredTeams = React.useMemo(() => {
        return teamGroups.filter(team => {
            const matchesType = typeFilter === 'all' || team.type === typeFilter;
            const matchesAllocation = allocationFilter === 'all' ||
                (allocationFilter === 'allocated' && team.isAllocated) ||
                (allocationFilter === 'not-allocated' && !team.isAllocated);
            return matchesType && matchesAllocation;
        });
    }, [teamGroups, typeFilter, allocationFilter]);

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

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedTeams(new Set(filteredTeams.map(t => t.teamId)));
        } else {
            setSelectedTeams(new Set());
        }
    };

    const toggleSelectTeam = (teamId: string) => {
        setSelectedTeams(prev => {
            const next = new Set(prev);
            if (next.has(teamId)) {
                next.delete(teamId);
            } else {
                next.add(teamId);
            }
            return next;
        });
    };

    const handleBulkResendEmail = async () => {
        if (selectedTeams.size === 0) return;

        let successCount = 0;
        toast.loading(`Sending emails to ${selectedTeams.size} teams...`);

        for (const teamId of Array.from(selectedTeams)) {
            try {
                // Reuse existing handler logic or call API directly
                await fetch('/api/admin/resend-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teamId })
                });
                successCount++;
            } catch (e) {
                console.error(`Failed to send to ${teamId}`, e);
            }
        }

        toast.dismiss();
        toast.success(`Emails sent to ${successCount}/${selectedTeams.size} teams`);
        setSelectedTeams(new Set());
    };



    const handleDeleteAll = async (teamId: string, memberIds: string[]) => {
        for (const memberId of memberIds) {
            await deleteParticipant(memberId);
        }
        setSelectedMembers(prev => ({ ...prev, [teamId]: new Set() }));
        toast.success(`Deleted all ${memberIds.length} team members`);
    };

    const handleBulkDelete = async () => {
        if (selectedTeams.size === 0) return;

        setIsDeleting(true);
        try {
            const teamsToDelete = Array.from(selectedTeams);
            let count = 0;
            for (const teamId of teamsToDelete) {
                const team = teamGroups.find(t => t.teamId === teamId);
                if (team) {
                    for (const member of team.members) {
                        await deleteParticipant(member._id);
                        count++;
                    }
                }
            }
            toast.success(`Deleted ${selectedTeams.size} teams (${count} members)`);
            setSelectedTeams(new Set());
            fetchParticipants();
        } catch {
            toast.error('Failed to complete bulk delete');
        } finally {
            setIsDeleting(false);
        }
    };


    // Pagination

    const paginatedTeamsData = React.useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return {
            teams: filteredTeams.slice(start, start + ITEMS_PER_PAGE),
            total: filteredTeams.length,
            totalPages: Math.ceil(filteredTeams.length / ITEMS_PER_PAGE)
        };
    }, [filteredTeams, currentPage]);

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter, allocationFilter, searchQuery]);

    const totalRevenue = participants.reduce<number>((acc) => {
        return acc + 349; // Hackathon pass price
    }, 0);

    const revenueDisplay = (totalRevenue / 1000).toFixed(3) + 'k';

    const navItems: NavItem[] = [
        { label: 'Participants', icon: Users, value: 'participants', group: 'Users' },
        { label: 'Pending Approvals', icon: CheckCircle2, value: 'approvals', group: 'Users' },
        { label: 'Coordinators', icon: UserCog, value: 'coordinators', group: 'Users' },
        { label: 'Lab Management', icon: Zap, value: 'lab', group: 'Operations' },
        { label: 'Problem Statements', icon: FileText, value: 'problems', group: 'Operations' },
        { label: 'Support Requests', icon: AlertTriangle, value: 'support', group: 'Operations' },
        { label: 'Analytics', icon: BarChart3, value: 'analytics', group: 'Monitoring' },
        { label: 'System Logs', icon: FileText, value: 'logs', group: 'Monitoring' },
        { label: 'System Config', icon: Globe, value: 'system', group: 'Settings' },
        { label: 'Data Management', icon: Database, value: 'data', group: 'Settings' },
        { label: 'My Account', icon: Lock, value: 'settings', group: 'Settings' },
    ];

    // Team Size Distribution
    const teamSizeData = useMemo(() => {
        const sizeCount: Record<number, number> = {};
        const teams = new Map<string, number>();

        participants.forEach(p => {
            const teamId = p.teamId || p._id;
            teams.set(teamId, (teams.get(teamId) || 0) + 1);
        });

        teams.forEach(size => {
            sizeCount[size] = (sizeCount[size] || 0) + 1;
        });

        return Object.entries(sizeCount)
            .map(([size, count]) => ({
                size: `${size} ${parseInt(size) === 1 ? 'Member' : 'Members'}`,
                count
            }))
            .sort((a, b) => parseInt(a.size) - parseInt(b.size));
    }, [participants]);

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
                            <Button onClick={() => fetchParticipants(false)} variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
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

                    {/* Bulk Actions */}
                    {selectedTeams.size > 0 && (
                        <div className="flex items-center justify-between bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-brand-primary">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-medium">{selectedTeams.size} teams selected</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-brand-primary/20 hover:bg-brand-primary/20 text-brand-primary"
                                    onClick={handleBulkResendEmail}
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Resend Emails ({selectedTeams.size})
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to delete ${selectedTeams.size} teams? This action cannot be undone.`)) {
                                            handleBulkDelete();
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Selected ({selectedTeams.size})
                                </Button>
                            </div>
                        </div>
                    )}

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

                    {/* Team-based Table */}
                    <div className="bg-brand-surface border border-white/5 rounded-xl overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow>
                                    <TableHead className="w-[40px]">
                                        <Checkbox
                                            checked={filteredTeams.length > 0 && selectedTeams.size === filteredTeams.length}
                                            onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
                                            className="border-white/20 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                        />
                                    </TableHead>
                                    <TableHead className="text-gray-400">Team ID</TableHead>
                                    <TableHead className="text-gray-400">Team Size</TableHead>
                                    <TableHead className="text-gray-400">Type</TableHead>
                                    <TableHead className="text-gray-400">Allocation</TableHead>
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
                                        } else if (allocationFilter === 'not-allocated') {
                                            filtered = filtered.filter(p => !p.assignedHackathonLab);
                                        }
                                    }

                                    // Group by teams
                                    const teams = Object.entries(
                                        filtered.reduce((acc, p) => {
                                            if (!acc[p.teamId]) acc[p.teamId] = [];
                                            acc[p.teamId].push(p);
                                            return acc;
                                        }, {} as Record<string, Participant[]>)
                                    ).map(([teamId, members]) => ({
                                        teamId,
                                        members,
                                        teamSize: members.length,
                                        type: members[0].type,
                                        isAllocated: members.some(m => m.assignedHackathonLab),
                                        assignedHackathonLab: members[0].assignedHackathonLab,
                                        hasPayment: members.some(m => m.paymentScreenshotUrl)
                                    }));

                                    // Paginate
                                    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
                                    const endIdx = startIdx + ITEMS_PER_PAGE;
                                    const paginatedTeams = teams.slice(startIdx, endIdx);

                                    return paginatedTeams.map((team) => (
                                        <React.Fragment key={team.teamId}>
                                            <TableRow
                                                className="cursor-pointer hover:bg-white/5"
                                                onClick={() => toggleTeam(team.teamId)}
                                            >
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedTeams.has(team.teamId)}
                                                        onCheckedChange={() => toggleSelectTeam(team.teamId)}
                                                        className="border-white/20 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                                    />
                                                </TableCell>
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
                                                        <div className="space-y-4">
                                                            {/* Project Submission Section */}
                                                            <div className="bg-brand-dark/50 p-3 rounded-lg border border-white/5 flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="p-2 bg-brand-primary/10 rounded-md text-brand-primary">
                                                                        <Globe className="w-4 h-4" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Project Repository</div>
                                                                        {team.members[0].projectRepo ? (
                                                                            <a href={team.members[0].projectRepo} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline font-mono flex items-center gap-1">
                                                                                {team.members[0].projectRepo}
                                                                                <Globe className="w-3 h-3" />
                                                                            </a>
                                                                        ) : (
                                                                            <span className="text-sm text-gray-500 italic">No repo submitted yet</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Member Cards */}
                                                            <div className="grid gap-3">
                                                                {team.members.map((member) => (
                                                                    <div key={member._id} className="bg-brand-dark p-4 rounded-lg border border-white/5">
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                                                                            <div><span className="text-gray-500">Name:</span> <span className="text-white ml-1">{member.name}</span></div>
                                                                            <div className="truncate"><span className="text-gray-500">Email:</span> <span className="text-gray-300 ml-1">{member.email}</span></div>
                                                                            <div className="truncate"><span className="text-gray-500">Mobile:</span> <span className="text-gray-300 ml-1">{member.whatsapp}</span></div>
                                                                            <div className="truncate"><span className="text-gray-500">College:</span> <span className="text-gray-300 ml-1" title={member.college}>{member.college}</span></div>

                                                                            {member.assignedHackathonLab && <div><span className="text-gray-500">Hackathon Lab:</span> <span className="text-brand-primary ml-1">{member.assignedHackathonLab}</span></div>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ));
                                })()}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-2">
                        <div className="text-sm text-gray-400">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, paginatedTeamsData.total)} of {paginatedTeamsData.total} teams
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
                                {Array.from({ length: paginatedTeamsData.totalPages }, (_, i) => i + 1).map(page => (
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
                                onClick={() => setCurrentPage(p => Math.min(paginatedTeamsData.totalPages, p + 1))}
                                disabled={currentPage === paginatedTeamsData.totalPages}
                                className="border-white/10"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="lab" className="mt-6 space-y-6">
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
                                size="sm"
                                className="bg-brand-primary text-brand-dark hover:bg-white"
                                onClick={() => handleAllocate('Hackathon')}
                            >
                                <Zap className="w-3 h-3 mr-2" />
                                Allocate Labs
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
                                    <Label>Type</Label>
                                    <Select
                                        value={newLab.type}
                                        onValueChange={(val: 'Hackathon') => setNewLab({ ...newLab, type: val })}
                                    >
                                        <SelectTrigger className="bg-brand-dark border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-brand-surface border-white/10">
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
                                            onValueChange={(val: 'Hackathon') => setEditingLab({ ...editingLab, type: val })}
                                        >
                                            <SelectTrigger className="bg-brand-dark border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-brand-surface border-white/10">
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

                {/* Problem Allocation Tab */}
                <TabsContent value="problems" className="mt-6 space-y-6">
                    <ProblemAllocationTab adminEmail={user.email} />
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

                        {/* Team Size Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Size Distribution</CardTitle>
                                <CardDescription>Breakdown by team member count</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={teamSizeData}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis dataKey="size" fontSize={12} />
                                        <YAxis fontSize={12} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                        />
                                        <Bar dataKey="count" fill="#10b981" name="Teams" radius={[4, 4, 0, 0]} />
                                    </BarChart>
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
                                        {/* <Legend /> */}
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="submissions" className="mt-6 space-y-4">
                    <SubmissionsTab participants={participants} loading={isLoading} />
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

                <TabsContent value="analytics" className="mt-6">
                    <AnalyticsTab />
                </TabsContent>

                <TabsContent value="system" className="mt-6">
                    <SystemConfigTab />
                </TabsContent>

                <TabsContent value="data" className="mt-6">
                    <DataManagementTab />
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                    <SettingsTab user={user} />
                </TabsContent>

                <TabsContent value="approvals" className="mt-6">
                    <PendingRequestsTab />
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
                labs={labs}
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

            {/* Edit Coordinator Modal */}
            <EditCoordinatorModal
                isOpen={editCoordinatorModalOpen}
                onClose={() => {
                    setEditCoordinatorModalOpen(false);
                    setEditingCoordinator(null);
                }}
                coordinator={editingCoordinator}
                onSave={async (updates) => {
                    await updateCoordinator(updates as Coordinator);
                    toast.success('Coordinator updated successfully');
                    setEditCoordinatorModalOpen(false);
                    setEditingCoordinator(null);
                }}
            />

        </DashboardShell >
    );
};

export default AdminDashboard;
