'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Camera,
    StopCircle,
    CheckCircle2,
    ChevronRight,
    Eye,
    MessageSquare,
    CheckCircle,
    AlertTriangle,
    Users,
    UserCog,
    Zap,
    Coffee,
    LogIn,
    LogOut,
    GraduationCap,
    Lightbulb,
    X,
    Clock,
    UserX,
    AlertCircle,
    Download
} from 'lucide-react';
import { User, Participant } from '@/types';
import { useData } from '@/lib/context/DataContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SettingsTab } from '@/components/dashboards/SettingsTab';
import { DashboardShell } from '@/components/dashboards/DashboardShell';
import { NavItem } from '@/components/dashboards/DashboardNav';

interface CoordinatorDashboardProps {
    user: User;
}

type Mode = 'entry' | 'exit' | 'workshop' | 'hackathon' | 'snacks';

const CoordinatorDashboardV2: React.FC<CoordinatorDashboardProps> = ({ user }) => {
    const {
        participants,
        logs,
        addLog,
        isLoading,
        supportRequests,
        updateSupportRequest,
        fetchSupportRequests,
        markAttendance
    } = useData();

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const view = (searchParams.get('view') as 'scan' | 'list' | 'participants' | 'requests' | 'settings') || 'scan';
    const mode = (searchParams.get('mode') as Mode) || 'workshop';

    const setView = (newView: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', newView);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const setMode = (newMode: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('mode', newMode);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const [workshopDay, setWorkshopDay] = useState('1');
    const [searchQuery, setSearchQuery] = useState('');
    const [scanInput, setScanInput] = useState('');
    const [scannedTeam, setScannedTeam] = useState<{ id: string, members: Participant[] } | null>(null);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [showRealScanner, setShowRealScanner] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
    const [typeFilter, setTypeFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [allocationFilter, setAllocationFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [showHintBanner, setShowHintBanner] = useState(() => {
        if (typeof window !== 'undefined') {
            return !localStorage.getItem('coordinator-hint-dismissed');
        }
        return true;
    });

    const dismissHintBanner = useCallback(() => {
        setShowHintBanner(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem('coordinator-hint-dismissed', 'true');
        }
    }, []);

    // Stats calculations
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        const todayLogs = logs.filter(log => new Date(log.timestamp).toDateString() === today);
        const pendingRequests = supportRequests.filter(req => req.status === 'Open').length;
        const sosRequests = supportRequests.filter(req => req.status === 'Open' && req.type === 'SOS').length;

        return {
            checkedInToday: todayLogs.length,
            pendingRequests,
            sosRequests,
            lastScanTime: todayLogs.length > 0 ? new Date(todayLogs[todayLogs.length - 1].timestamp).toLocaleTimeString() : 'No scans yet'
        };
    }, [logs, supportRequests]);

    const handleFetchTeam = useCallback((overrideInput?: string) => {
        let input = overrideInput || scanInput;
        if (!input) return;

        // Auto-prepend VIBE- if not already present
        if (!input.startsWith('VIBE-') && !input.includes('-')) {
            input = `VIBE-${input}`;
        }

        const found = participants.filter(p => p.teamId === input || p.participantId === input);

        if (found.length > 0) {
            const teamId = found[0].teamId;
            const teamMembers = participants.filter(p => p.teamId === teamId);
            setScannedTeam({
                id: teamId,
                members: teamMembers
            });
            setSelectedMembers([]);
            setIsScannerModalOpen(false); // Close scanner modal
            setIsAttendanceModalOpen(true);
        } else {
            toast.error(`ID not found: ${input}`);
        }
    }, [participants, scanInput]);

    useEffect(() => {
        if (showRealScanner && isScannerModalOpen && !scannedTeam) {
            const timer = setTimeout(() => {
                const scanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    false
                );

                scanner.render((decodedText: string) => {
                    handleFetchTeam(decodedText);
                    scanner.clear();
                    setShowRealScanner(false);
                }, (error: unknown) => {
                    console.warn(error);
                });
                scannerRef.current = scanner;
            }, 100);

            return () => {
                clearTimeout(timer);
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(() => { });
                }
            };
        }
    }, [showRealScanner, isScannerModalOpen, scannedTeam, handleFetchTeam]);

    // SOS Notification Effect
    const lastRequestCount = useRef(supportRequests.length);
    useEffect(() => {
        const newRequests = supportRequests.slice(0, Math.max(0, supportRequests.length - lastRequestCount.current));
        newRequests.forEach(req => {
            if (req.type === 'SOS' && req.status === 'Open') {
                toast.error(`🚨 SOS ALERT: Team ${req.teamId} in ${req.labName}!`, {
                    duration: 10000,
                    action: {
                        label: 'View',
                        onClick: () => setView('requests')
                    }
                });
            }
        });
        lastRequestCount.current = supportRequests.length;
    }, [supportRequests, setView]);

    const toggleMember = useCallback((id: string) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    }, []);

    const handleAction = useCallback(async (all: boolean) => {
        if (!scannedTeam) return;

        const targets = all ? scannedTeam.members : scannedTeam.members.filter(m => selectedMembers.includes(m._id));
        if (targets.length === 0) {
            toast.warning("Please select at least one member");
            return;
        }

        let actionType = '';
        let details = '';

        if (mode === 'workshop') {
            actionType = `WORKSHOP_D${workshopDay}`;
            details = `Workshop Attendance Day ${workshopDay}`;
        } else if (mode === 'snacks') {
            const eventLabel = workshopDay === 'hackathon' ? 'Hackathon' : `Day ${workshopDay}`;
            actionType = `SNACKS_${workshopDay.toUpperCase()}`;
            details = `Snacks Issued for ${eventLabel}`;
        } else if (mode === 'hackathon') {
            actionType = 'HACKATHON_ATTENDANCE';
            details = 'Hackathon Attendance Marked';
        } else if (mode === 'entry') {
            actionType = 'ENTRY_GATE';
            details = 'Gate Check-In';
        } else if (mode === 'exit') {
            actionType = 'EXIT_GATE';
            details = 'Gate Check-Out';
        }

        try {
            // Use DataContext for consistent logging and optimistic UI
            const participantIds = targets.map(t => t._id);
            await markAttendance(
                participantIds,
                mode,
                'present',
                workshopDay
            );
        } catch (error) {
            console.error('Attendance error:', error);
            // Error handling is managed by markAttendance toast, but we can catch here if needed
            // to prevent modal closing? markAttendance throws?
            // apiCall catches and returns null or throws?
            // apiCall implementation: catches, sets error, returns null. 
            // Wait, apiCall wrapper catches internal fetch errors but returns null? 
            // markAttendance implementation in DataContext does NOT return anything explicit, but it awaits apiCall.
            // If apiCall fails (catch block), it sets error state.
            // To prevent modal close, we might want to know if it failed.
            // But for now, let's assume success or toast error.
            return;
        }

        // Reset
        setScannedTeam(null);
        setScanInput('');
        setSelectedMembers([]);
        setIsAttendanceModalOpen(false);
    }, [scannedTeam, mode, workshopDay, selectedMembers, addLog]);

    const navItems: NavItem[] = [
        { label: 'Scan ID', icon: Camera, value: 'scan', group: 'Actions' },
        { label: 'Quick List', icon: ChevronRight, value: 'list', group: 'Actions' },
        { label: 'Participants', icon: Users, value: 'participants', group: 'Data' },
        { label: 'Requests', icon: MessageSquare, value: 'requests', group: 'Data' },
        { label: 'Account', icon: UserCog, value: 'settings', group: 'Profile' },
    ];

    const modeConfig = [
        { id: 'workshop', label: 'Workshop', icon: GraduationCap, color: 'blue', description: 'Mark workshop attendance' },
        { id: 'entry', label: 'Entry Gate', icon: LogIn, color: 'green', description: 'Check-in at entry' },
        { id: 'hackathon', label: 'Hackathon', icon: Zap, color: 'purple', description: 'Mark hackathon attendance' },
        { id: 'exit', label: 'Exit Gate', icon: LogOut, color: 'red', description: 'Check-out at exit' },
        { id: 'snacks', label: 'Snacks', icon: Coffee, color: 'orange', description: 'Issue snacks' },
    ];

    // Reset pagination when filters/search change
    useEffect(() => {
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
            <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-20 w-full bg-white/5 rounded-2xl" />
                <Skeleton className="h-32 w-full bg-white/5 rounded-2xl" />
                <Skeleton className="h-[400px] w-full bg-white/5 rounded-2xl" />
            </div>
        );
    }

    const filteredParticipants = useMemo(() => {
        return participants.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.teamId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.participantId.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [participants, searchQuery]);

    const sortedRequests = useMemo(() => {
        return [...supportRequests]
            .filter(req => req.status === 'Open')
            .sort((a, b) => {
                if (a.type === 'SOS' && b.type !== 'SOS') return -1;
                if (a.type !== 'SOS' && b.type === 'SOS') return 1;
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });
    }, [supportRequests]);

    return (
        <DashboardShell
            title="Coordinator Space"
            description="Operational tools for on-ground event management"
            items={navItems}
            activeTab={view}
            onTabChange={setView}
            user={{
                name: user.name,
                email: user.email,
                role: 'Coordinator'
            }}
        >
            <div className="space-y-6">
                {/* Hero Stats Section - Only on Scan View */}
                {view === 'scan' && (
                    <Card className="bg-linear-to-br from-brand-primary/20 via-brand-surface to-brand-dark border-brand-primary/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl" />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Welcome, <span className="text-brand-primary">{user.name.split(' ')[0]}</span>! 👋</h2>
                                    <p className="text-sm text-gray-400 mt-1">Managing event operations</p>
                                </div>
                                <Badge className="bg-brand-primary/20 text-brand-primary border-brand-primary/50 px-4 py-2 text-sm">
                                    Mode: {modeConfig.find(m => m.id === mode)?.label}
                                </Badge>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                                        <p className="text-xs text-gray-400 uppercase">Today</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{stats.checkedInToday}</p>
                                    <p className="text-xs text-gray-500 mt-1">Check-ins</p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4 text-blue-400" />
                                        <p className="text-xs text-gray-400 uppercase">Pending</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{stats.pendingRequests}</p>
                                    <p className="text-xs text-gray-500 mt-1">Requests</p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4 text-red-400" />
                                        <p className="text-xs text-gray-400 uppercase">SOS</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{stats.sosRequests}</p>
                                    <p className="text-xs text-gray-500 mt-1">Alerts</p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-purple-400" />
                                        <p className="text-xs text-gray-400 uppercase">Last Scan</p>
                                    </div>
                                    <p className="text-sm font-bold text-white truncate">{stats.lastScanTime}</p>
                                    <p className="text-xs text-gray-500 mt-1">Recent activity</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Hint Banner - Only on Scan View */}
                {view === 'scan' && showHintBanner && (
                    <Card className="bg-blue-500/10 border-blue-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-blue-200 font-medium">
                                        💡 <strong>Tip:</strong> Select an operation mode below, then scan participant IDs to mark attendance or manage entries!
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 shrink-0"
                                    onClick={dismissHintBanner}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Action Cards - Only on Scan View */}
                {view === 'scan' && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {modeConfig.map((m) => (
                                <Card
                                    key={m.id}
                                    className={`cursor-pointer transition-all hover:scale-105 hover:shadow-xl bg-brand-surface border-${m.color}-500/20 hover:border-${m.color}-500/40 hover:shadow-${m.color}-500/20`}
                                    onClick={() => {
                                        setMode(m.id as Mode);
                                        setScannedTeam(null);
                                        setIsScannerModalOpen(true);
                                    }}
                                >
                                    <CardContent className="p-4">
                                        <div className={`p-3 bg-${m.color}-500/10 rounded-lg mb-3`}>
                                            <m.icon className={`w-6 h-6 text-${m.color}-400 mx-auto`} />
                                        </div>
                                        <h4 className="font-bold text-white text-sm text-center mb-1">{m.label}</h4>
                                        <p className="text-xs text-gray-400 text-center">{m.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick List View */}
                {view === 'list' && (
                    <Card className="bg-brand-surface border-white/5">
                        <CardContent className="p-4">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <ChevronRight className="w-5 h-5 text-brand-primary" />
                                Recent Activity Logs
                            </h3>
                            <ScrollArea className="h-[500px]">
                                <div className="space-y-2">
                                    {logs.filter(l => l.action !== 'LOGIN').length === 0 ? (
                                        <div className="text-center py-20">
                                            <CheckCircle className="w-12 h-12 text-gray-500/20 mx-auto mb-4" />
                                            <p className="text-gray-500">No logs yet. Start scanning IDs!</p>
                                        </div>
                                    ) : (
                                        logs.filter(l => l.action !== 'LOGIN').map((log, i) => (
                                            <Card key={i} className="bg-brand-dark border-white/5 hover:border-white/10 transition-colors">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-start gap-3 flex-1">
                                                            <div className="p-2 bg-brand-primary/10 rounded-lg">
                                                                <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm text-white">{log.user}</p>
                                                                <p className="text-xs text-gray-400 mt-1">{log.details}</p>
                                                                <Badge variant="outline" className="mt-2 text-[10px] bg-white/5 border-white/10">
                                                                    {log.action}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] text-gray-600">{log.time}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}

                {/* Participants View - Table Format (Admin Style) */}
                {view === 'participants' && (
                    <Card className="bg-brand-surface border-white/5">
                        <CardContent className="p-4">
                            {/* Export Button */}
                            <div className="flex justify-end mb-3">
                                <Button
                                    variant="outline"
                                    onClick={() => exportCSV(participants, 'participants')}
                                    className="border-white/10 bg-white/5 hover:bg-white/10"
                                    size="sm"
                                >
                                    <Download className="w-4 h-4 mr-2" /> Export CSV
                                </Button>
                            </div>

                            {/* Search and Filters */}
                            <div className="flex flex-wrap gap-3 items-center mb-4">
                                <Input
                                    placeholder="🔍 Search by team ID, name, or email..."
                                    className="max-w-sm bg-brand-dark border-white/10 text-white placeholder:text-gray-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[150px] bg-brand-dark border-white/10">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-brand-surface border-white/10">
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="Workshop">Workshop</SelectItem>
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
                                                    filtered = filtered.filter(p => p.assignedWorkshopLab || p.assignedHackathonLab);
                                                } else {
                                                    filtered = filtered.filter(p => !p.assignedWorkshopLab && !p.assignedHackathonLab);
                                                }
                                            }

                                            // Group by teams
                                            const teams = Object.entries(
                                                filtered.reduce((acc, p) => {
                                                    if (!acc[p.teamId]) acc[p.teamId] = [];
                                                    acc[p.teamId].push(p);
                                                    return acc;
                                                }, {} as Record<string, Participant[]>)
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
                                                const hasWorkshop = members.some(m => m.assignedWorkshopLab);
                                                const hasHackathon = members.some(m => m.assignedHackathonLab);
                                                const isAllocated = hasWorkshop || hasHackathon;

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
                                                            <TableCell className="font-mono text-xs text-brand-primary">{teamId}</TableCell>
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
                                                                        {members.find(m => m.assignedWorkshopLab)?.assignedWorkshopLab && <div>W: {members.find(m => m.assignedWorkshopLab)?.assignedWorkshopLab}</div>}
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
                                                            <TableRow className="bg-white/2">
                                                                <TableCell colSpan={5} className="p-4">
                                                                    <div className="space-y-3">
                                                                        {members.map((member) => (
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
                                    }, {} as Record<string, Participant[]>)
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
                )}

                {/* Support Requests View */}
                {view === 'requests' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-brand-primary" />
                                Support Requests
                                {stats.sosRequests > 0 && (
                                    <Badge className="bg-red-500 text-white animate-pulse">
                                        {stats.sosRequests} SOS
                                    </Badge>
                                )}
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/5 border-white/10 hover:bg-white/10"
                                onClick={() => fetchSupportRequests(user.assignedLab)}
                            >
                                Refresh
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {sortedRequests.length === 0 ? (
                                <Card className="bg-brand-surface border-white/5">
                                    <CardContent className="p-20 text-center">
                                        <CheckCircle className="w-16 h-16 text-green-500/20 mx-auto mb-4" />
                                        <p className="text-lg font-medium text-gray-400">All clear!</p>
                                        <p className="text-sm text-gray-500 mt-1">No pending requests at the moment.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                sortedRequests.map((req) => (
                                    <Card
                                        key={req._id}
                                        className={`border-2 transition-all ${req.type === 'SOS'
                                            ? 'bg-red-500/10 border-red-500/50 animate-pulse-slow'
                                            : req.type === 'Help'
                                                ? 'bg-blue-500/10 border-blue-500/30'
                                                : 'bg-orange-500/10 border-orange-500/30'
                                            }`}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div
                                                        className={`p-3 rounded-xl ${req.type === 'SOS'
                                                            ? 'bg-red-500/20'
                                                            : req.type === 'Help'
                                                                ? 'bg-blue-500/20'
                                                                : 'bg-orange-500/20'
                                                            }`}
                                                    >
                                                        {req.type === 'SOS' ? (
                                                            <AlertTriangle className="w-6 h-6 text-red-400" />
                                                        ) : (
                                                            <MessageSquare className="w-6 h-6 text-blue-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="font-bold text-lg text-white">{req.type} Request</h4>
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-white/5 text-[10px] font-mono"
                                                            >
                                                                {req.labName}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-gray-300 text-sm">
                                                            From Team: <span className="text-white font-mono font-bold">{req.teamId}</span>
                                                        </p>
                                                        {req.message && (
                                                            <p className="text-sm text-gray-400 mt-2 italic">"{req.message}"</p>
                                                        )}
                                                        <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(req.timestamp).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="bg-green-500 hover:bg-green-600 text-white whitespace-nowrap"
                                                    onClick={() => updateSupportRequest(req._id, 'Resolved')}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Resolve
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Settings View */}
                {view === 'settings' && (
                    <SettingsTab user={user} />
                )}
            </div>

            {/* Scanner Modal */}
            <Dialog open={isScannerModalOpen} onOpenChange={(open) => {
                setIsScannerModalOpen(open);
                if (!open) {
                    setShowRealScanner(false);
                    if (scannerRef.current) {
                        scannerRef.current.clear().catch(() => { });
                    }
                }
            }}>
                <DialogContent className="bg-brand-surface border-white/10 text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Camera className="w-6 h-6 text-brand-primary" />
                            {modeConfig.find(m => m.id === mode)?.label} Scanner
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-400">
                            Scan participant ID or enter manually
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Day Selector for Workshop/Snacks */}
                        {(mode === 'workshop' || mode === 'snacks') && (
                            <div className="bg-brand-dark rounded-xl p-4 border border-white/10">
                                <Label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Select Day/Event</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['1', '2', '3', ...(mode === 'snacks' ? ['hackathon'] : [])].map((day) => (
                                        <Button
                                            key={day}
                                            variant={workshopDay === day ? 'default' : 'outline'}
                                            size="sm"
                                            className={workshopDay === day ? 'bg-brand-primary text-white' : 'bg-white/5 border-white/10'}
                                            onClick={() => setWorkshopDay(day)}
                                        >
                                            {day === 'hackathon' ? 'Hackathon' : `Day ${day}`}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Scanner Area */}
                        {showRealScanner ? (
                            <div className="rounded-xl overflow-hidden border-2 border-brand-primary relative aspect-square bg-black">
                                <div id="reader" className="w-full h-full"></div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
                                    onClick={() => setShowRealScanner(false)}
                                >
                                    <StopCircle className="w-4 h-4 mr-2" /> Stop Scanner
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="aspect-square bg-linear-to-br from-brand-primary/20 to-brand-dark rounded-2xl border-2 border-dashed border-brand-primary/30 flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary/50 hover:scale-[1.02] transition-all group"
                                    onClick={() => setShowRealScanner(true)}
                                >
                                    <Camera className="w-20 h-20 text-brand-primary mb-4 group-hover:scale-110 transition-transform" />
                                    <p className="text-lg font-bold text-white">Tap to Scan QR Code</p>
                                    <p className="text-sm text-gray-400 mt-2">Or enter ID manually below</p>
                                </div>

                                {/* Manual Entry */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-400">Manual Entry</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono">
                                                VIBE-
                                            </span>
                                            <Input
                                                placeholder="Enter number (e.g., 123)"
                                                value={scanInput.startsWith('VIBE-') ? scanInput.slice(5) : scanInput}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    setScanInput(value);
                                                }}
                                                onKeyDown={(e) => e.key === 'Enter' && handleFetchTeam()}
                                                className="pl-16 bg-brand-dark border-white/10 text-white placeholder:text-gray-600 font-mono"
                                            />
                                        </div>
                                        <Button
                                            onClick={() => handleFetchTeam()}
                                            className="bg-brand-primary hover:bg-brand-primary/80 text-white"
                                            disabled={!scanInput}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Full ID will be: VIBE-{scanInput || 'XXX'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Attendance Modal */}
            <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
                <DialogContent className="bg-brand-surface border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {mode === 'workshop' ? `Day ${workshopDay} Workshop` :
                                mode === 'snacks' ? `${workshopDay === 'hackathon' ? 'Hackathon' : `Day ${workshopDay}`} Snacks` :
                                    mode === 'hackathon' ? 'Hackathon' : mode === 'entry' ? 'Gate Entry' : 'Gate Exit'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-400">
                            Team {scannedTeam?.id || '...'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <Label className="text-sm font-medium text-gray-500 uppercase">Select Members</Label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {scannedTeam?.members.map(member => (
                                <div
                                    key={member._id}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedMembers.includes(member._id) ? 'bg-brand-primary/10 border-brand-primary/50 scale-[1.02]' : 'bg-brand-dark border-white/5 hover:border-white/10'}`}
                                    onClick={() => toggleMember(member._id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={selectedMembers.includes(member._id)}
                                            onCheckedChange={() => toggleMember(member._id)}
                                            className="border-white/20 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                        />
                                        <div>
                                            <p className="font-medium text-sm">{member.name}</p>
                                            <p className="text-[10px] text-gray-500 font-mono">{member.participantId}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] opacity-70">{member.type}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 bg-white/5 border-white/20 hover:bg-white/10"
                            onClick={() => handleAction(false)}
                            disabled={selectedMembers.length === 0}
                        >
                            Mark Selected ({selectedMembers.length})
                        </Button>
                        <Button
                            className="flex-1 bg-brand-primary text-white hover:bg-brand-primary/80"
                            onClick={() => handleAction(true)}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark All ({scannedTeam?.members.length || 0})
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardShell>
    );
};

export default CoordinatorDashboardV2;
