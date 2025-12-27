'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    UserCog
} from 'lucide-react';
import { User, Participant, SupportRequest } from '@/types';
import { useData } from '@/lib/context/DataContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SettingsTab } from '@/components/dashboards/SettingsTab';
import { DashboardShell } from '@/components/dashboards/DashboardShell';
import { NavItem } from '@/components/dashboards/DashboardNav';

interface CoordinatorDashboardProps {
    user: User;
}


const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({ user }) => {
    const {
        participants,
        logs,
        addLog,
        updateParticipant,
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
    const day = (searchParams.get('day') as '1' | '2') || '1';
    const activity = searchParams.get('activity') || 'entry';

    const setView = (newView: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', newView);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const setDay = (newDay: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('day', newDay);
        // Reset activity to default for that day
        if (newDay === '1') params.set('activity', 'entry');
        else params.set('activity', 'exit'); // Default for day 2 updated
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const setActivity = (newActivity: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('activity', newActivity);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const [searchQuery, setSearchQuery] = useState('');

    const [scanInput, setScanInput] = useState('');
    const [scannedTeam, setScannedTeam] = useState<{ id: string, members: Participant[] } | null>(null);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [showRealScanner, setShowRealScanner] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

    const handleFetchTeam = useCallback((overrideInput?: string) => {
        let input = overrideInput || scanInput;
        if (!input) return;

        // Clean input for Food QR
        input = input.replace('FOOD:', '');

        const found = participants.filter(p => p.teamId === input || p.participantId === input);

        if (found.length > 0) {
            const teamId = found[0].teamId;
            const teamMembers = participants.filter(p => p.teamId === teamId);
            setScannedTeam({
                id: teamId,
                members: teamMembers
            });
            setSelectedMembers([]);
            setIsAttendanceModalOpen(true);
        } else {
            toast.error(`ID not found: ${input}`);
        }
    }, [participants, scanInput]);

    useEffect(() => {
        if (showRealScanner && view === 'scan' && !scannedTeam) {
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
    }, [showRealScanner, view, scannedTeam, handleFetchTeam]);

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

    const navItems: NavItem[] = [
        { label: 'Scan ID', icon: Camera, value: 'scan', group: 'Actions' },
        { label: 'Quick List', icon: ChevronRight, value: 'list', group: 'Actions' },
        { label: 'Participants', icon: Users, value: 'participants', group: 'Data' },
        { label: 'Requests', icon: MessageSquare, value: 'requests', group: 'Data' },
        { label: 'Account', icon: UserCog, value: 'settings', group: 'Profile' },
    ];

    if (isLoading && participants.length === 0) {
        return (
            <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-20 w-full bg-white/5 rounded-2xl" />
                <Skeleton className="h-32 w-full bg-white/5 rounded-2xl" />
                <Skeleton className="h-[400px] w-full bg-white/5 rounded-2xl" />
            </div>
        );
    }

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

        try {
            // Determine the target argument for markAttendance
            // If all, use Team ID string. If partial, use array of IDs (here using _id as api/coordinator/attendance supports it)
            const targetArg = all ? scannedTeam.id : targets.map(m => m._id);

            // Map 'activity' to valid 'mode'. 'activity' comes from Select: entry, exit, hackathon, snacks
            // They map directly to 'mode' types except we need to ensure type safety.
            // valid modes: 'hackathon' | 'hackathon_exit' | 'entry' | 'exit' | 'snacks'

            let mode = activity as 'hackathon' | 'hackathon_exit' | 'entry' | 'exit' | 'snacks';

            // Just double check mapping if activity names diverged? 
            // In Select: 'entry', 'hackathon', 'snacks', 'exit'. 'lunch'/'dinner' removed.

            await markAttendance(targetArg, mode, 'present');

            // Logs are handled inside markAttendance now usually, but maybe add local toast? 
            // markAttendance already does toasts.

        } catch (e) {
            console.error(e);
            toast.error('Failed to mark attendance');
        }

        // Reset
        setScannedTeam(null);
        setScanInput('');
        setSelectedMembers([]);
        setIsAttendanceModalOpen(false);
    }, [scannedTeam, activity, selectedMembers, markAttendance]);

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
                {/* Mode Configuration Card */}
                <Card className="bg-brand-surface border-white/5">
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-500 uppercase">Select Event Day</Label>
                            <Select onValueChange={setDay} value={day}>
                                <SelectTrigger className="bg-brand-dark border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Day 1 (Saturday)</SelectItem>
                                    <SelectItem value="2">Day 2 (Sunday)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-500 uppercase">Select Activity</Label>
                            <Select onValueChange={(v) => { setActivity(v); setScannedTeam(null); }} value={activity}>
                                <SelectTrigger className="bg-brand-dark border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {day === '1' ? (
                                        <>
                                            <SelectItem value="entry">Entry Gate</SelectItem>
                                            <SelectItem value="hackathon">Hackathon Attendance</SelectItem>
                                            <SelectItem value="snacks">Snacks Distribution</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="exit">Exit Gate</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {view === 'scan' && (
                    <Card className="bg-brand-surface border-white/5 min-h-[400px] flex flex-col justify-center items-center p-8">
                        {!scannedTeam ? (
                            <div className="w-full max-w-sm space-y-6">
                                {showRealScanner ? (
                                    <div className="rounded-2xl overflow-hidden border-2 border-brand-primary relative aspect-square bg-black">
                                        <div id="reader" className="w-full h-full"></div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="absolute bottom-4 left-1/2 -translate-x-1/2"
                                            onClick={() => setShowRealScanner(false)}
                                        >
                                            <StopCircle className="w-4 h-4 mr-2" /> Stop
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        className="w-full aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary/50 transition-all group"
                                        onClick={() => setShowRealScanner(true)}
                                    >
                                        <Camera className="w-16 h-16 text-gray-600 group-hover:text-brand-primary mb-4 transition-colors" />
                                        <p className="font-bold text-gray-400">Launch Camera Scanner</p>
                                        <p className="text-xs text-gray-500 mt-2">Mobile Optimized • Auto Recon</p>
                                    </div>
                                )}

                                <div className="relative">
                                    <Separator className="bg-white/5" />
                                    <div className="relative flex justify-center text-xs uppercase -translate-y-1/2 -mt-px"><span className="bg-brand-surface px-2 text-gray-500">Or Manual Entry</span></div>
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter ID..."
                                        value={scanInput}
                                        onChange={(e) => setScanInput(e.target.value.toUpperCase())}
                                        className="bg-brand-dark border-white/10 font-mono"
                                    />
                                    <Button onClick={() => handleFetchTeam()} className="bg-brand-primary text-brand-dark hover:bg-white">Go</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full space-y-6 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between pb-4 relative">
                                    <Separator className="bg-white/5 absolute bottom-0 left-0 w-full" />
                                    <div>
                                        <p className="text-xs text-brand-primary font-bold uppercase">Scanned Success</p>
                                        <h3 className="text-2xl font-bold">Team {scannedTeam.id}</h3>
                                    </div>
                                    <Button variant="ghost" onClick={() => setScannedTeam(null)}>Cancel</Button>
                                </div>

                                <ScrollArea className="max-h-[60vh] pr-4">
                                    <div className="space-y-3">
                                        {scannedTeam.members.map(m => (
                                            <div
                                                key={m._id}
                                                className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${selectedMembers.includes(m._id) ? 'bg-brand-primary/10 border-brand-primary/50' : 'bg-brand-dark border-white/5'}`}
                                                onClick={() => toggleMember(m._id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded border border-white/10 flex items-center justify-center ${selectedMembers.includes(m._id) ? 'bg-brand-primary border-brand-primary' : ''}`}>
                                                        {selectedMembers.includes(m._id) && <CheckCircle2 className="w-3 h-3 text-brand-dark" />}
                                                    </div>
                                                    <div>
                                                        <p className={`font-medium ${selectedMembers.includes(m._id) ? 'text-white' : 'text-gray-300'}`}>{m.name}</p>
                                                        <p className="text-xs text-gray-500 font-mono">{m.participantId}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] opacity-70">{m.type}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>


                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1" onClick={() => handleAction(false)} disabled={selectedMembers.length === 0}>
                                        Action Selected ({selectedMembers.length})
                                    </Button>
                                    <Button className="flex-1 bg-brand-primary text-brand-dark hover:bg-white" onClick={() => handleAction(true)}>
                                        Action Entire Team
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {view === 'list' && (
                    <Card className="bg-brand-surface border-white/5">
                        <ScrollArea className="h-[500px]">
                            <div className="divide-y divide-white/5">
                                {logs.filter(l => l.action !== 'LOGIN').map((log, i) => (
                                    <div key={i} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-brand-primary">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{log.user}</p>
                                                <p className="text-xs text-gray-500">{log.details}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="bg-brand-dark border-white/10 text-[10px]">{log.action}</Badge>
                                            <p className="text-[10px] text-gray-600 mt-1">{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </Card>
                )}

                {view === 'participants' && (
                    <Card className="bg-brand-surface border-white/5 overflow-hidden">
                        <div className="p-4 relative">
                            <Separator className="bg-white/5 absolute bottom-0 left-0 w-full" />
                            <Input
                                placeholder="Search participants list..."
                                className="bg-brand-dark border-white/10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <ScrollArea className="h-[500px]">
                            <div className="divide-y divide-white/5">
                                {participants.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.teamId.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                                    <div key={p._id} className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{p.name}</p>
                                            <p className="text-xs text-gray-500">{p.teamId} • {p.participantId}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </Card>
                )}

                {view === 'requests' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-brand-primary" />
                                Support Requests
                            </h3>
                            <Button variant="outline" size="sm" onClick={() => fetchSupportRequests(user.assignedLab)}>
                                Refresh
                            </Button>
                        </div>
                        <div className="grid gap-4">
                            {supportRequests.length === 0 ? (
                                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                    <CheckCircle className="w-12 h-12 text-green-500/20 mx-auto mb-4" />
                                    <p className="text-gray-500">All clear! No pending requests.</p>
                                </div>
                            ) : (
                                supportRequests.map((req) => (
                                    <Card key={req._id} className={`bg-brand-surface border-white/5 ${req.type === 'SOS' ? 'border-red-500/20' : ''}`}>
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-2xl ${req.type === 'SOS' ? 'bg-red-500/10 text-red-500' :
                                                        req.type === 'Help' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                                                        }`}>
                                                        {req.type === 'SOS' ? <AlertTriangle className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-lg">{req.type} Request</h4>
                                                            <Badge variant="outline" className="bg-white/5 text-[10px]">{req.labName}</Badge>
                                                        </div>
                                                        <p className="text-gray-400 text-sm mt-1">From Team: <span className="text-white font-mono">{req.teamId}</span></p>
                                                        <p className="text-xs text-gray-600 mt-2 italic">
                                                            Received {new Date(req.timestamp).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="bg-green-500 hover:bg-green-600 text-white"
                                                    onClick={() => updateSupportRequest(req._id, 'Resolved')}
                                                >
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

                {view === 'settings' && (
                    <SettingsTab user={user} />
                )}
            </div>

            {/* Attendance Modal */}
            <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
                <DialogContent className="bg-brand-surface border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {activity === 'entry' && `Day ${day} Entry`}
                            {activity === 'exit' && `Day ${day} Exit`}
                            {activity === 'hackathon' && 'Hackathon Attendance'}
                            {['snacks', 'lunch', 'dinner'].includes(activity) && `${activity.charAt(0).toUpperCase() + activity.slice(1)} Distribution`}
                        </DialogTitle>
                        <p className="text-sm text-gray-400">Team {scannedTeam?.id || '...'}</p>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <Label className="text-sm font-medium text-gray-500 uppercase">Select Members</Label>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {scannedTeam?.members.map(member => (
                                <div
                                    key={member._id}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${selectedMembers.includes(member._id) ? 'bg-brand-primary/10 border-brand-primary/50' : 'bg-brand-dark border-white/5'}`}
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
                            className="flex-1"
                            onClick={() => handleAction(false)}
                            disabled={selectedMembers.length === 0}
                        >
                            Mark {['snacks', 'lunch', 'dinner'].includes(activity) ? 'Issued' : 'Attendance'} ({selectedMembers.length})
                        </Button>
                        <Button
                            className="flex-1 bg-brand-primary text-brand-dark hover:bg-white"
                            onClick={() => handleAction(true)}
                        >
                            Mark All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardShell>
    );
};

export default CoordinatorDashboard;
