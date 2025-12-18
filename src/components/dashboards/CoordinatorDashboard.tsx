'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Camera,
    StopCircle,
    CheckCircle2,
    ChevronRight,
    Eye
} from 'lucide-react';
import { User, Participant } from '@/types';
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

interface CoordinatorDashboardProps {
    user: User;
}

type Mode = 'attendance' | 'entry' | 'lab' | 'food' | 'exit';

const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({ user }) => {
    const { participants, logs, addLog, updateParticipant, isLoading } = useData();

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const view = (searchParams.get('view') as 'scan' | 'list' | 'participants') || 'scan';
    const mode = (searchParams.get('mode') as Mode) || 'attendance';

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
    const [mealType, setMealType] = useState('Lunch');
    const [searchQuery, setSearchQuery] = useState('');

    const [scanInput, setScanInput] = useState('');
    const [scannedTeam, setScannedTeam] = useState<{ id: string, members: Participant[] } | null>(null);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [showRealScanner, setShowRealScanner] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    const [assignLab, setAssignLab] = useState('Lab 1 (CSE)');
    const [assignSeat, setAssignSeat] = useState('');


    const handleFetchTeam = useCallback((overrideInput?: string) => {
        const input = overrideInput || scanInput;
        if (!input) return;


        const found = participants.filter(p => p.teamId === input || p.participantId === input);

        if (found.length > 0) {
            const teamId = found[0].teamId;
            const teamMembers = participants.filter(p => p.teamId === teamId);
            setScannedTeam({
                id: teamId,
                members: teamMembers
            });
            setSelectedMembers([]);
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

    if (isLoading && participants.length === 0) {
        return (
            <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-20 w-full bg-white/5 rounded-2xl" />
                <Skeleton className="h-32 w-full bg-white/5 rounded-2xl" />
                <Skeleton className="h-[400px] w-full bg-white/5 rounded-2xl" />
            </div>
        );
    }

    const toggleMember = (id: string) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const handleAction = async (all: boolean) => {
        if (!scannedTeam) return;

        const targets = all ? scannedTeam.members : scannedTeam.members.filter(m => selectedMembers.includes(m._id));
        if (targets.length === 0) {
            toast.warning("Please select at least one member");
            return;
        }

        let actionType = '';
        let details = '';

        if (mode === 'lab') {
            if (!assignSeat) {
                toast.error("Please enter a seat number");
                return;
            }
            actionType = 'LAB_ALLOCATION';
            details = `Allocated to ${assignLab} - Seat ${assignSeat}`;

            for (const m of targets) {
                await updateParticipant({ ...m, assignedLab: assignLab, assignedSeat: assignSeat });
            }
        } else if (mode === 'food') {
            const mealKey = `FOOD_${mealType.toUpperCase()}_D${workshopDay}`;
            actionType = mealKey;
            details = `${mealType} Issued`;
        } else {
            actionType = mode === 'attendance' ? `ATTENDANCE_D${workshopDay}` : mode.toUpperCase();
            details = mode === 'entry' ? 'Checked In' : mode === 'exit' ? 'Checked Out' : 'Marked Present';
        }

        await addLog(actionType, `${details} for ${targets.length} members of Team ${scannedTeam.id}`);
        toast.success(`${actionType} successful`);

        // Reset
        setScannedTeam(null);
        setScanInput('');
        setSelectedMembers([]);
        setAssignSeat('');
    };

    return (
        <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Coordinator Dashboard</h1>
                    <p className="text-gray-400">Welcome, {user.name} • {mode.toUpperCase()} Mode</p>
                </div>

                <div className="flex bg-brand-surface p-1 rounded-xl border border-white/10 w-full md:w-auto overflow-x-auto">
                    {['scan', 'list', 'participants'].map((v) => (
                        <Button
                            key={v}
                            variant={view === v ? "default" : "ghost"}
                            onClick={() => setView(v as 'scan' | 'list' | 'participants')}
                            className={`rounded-lg capitalize ${view === v ? "bg-brand-primary text-brand-dark" : "text-gray-400"}`}
                        >
                            {v}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Mode Configuration Card */}
            <Card className="bg-brand-surface border-white/5">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Operation Mode</label>
                        <Select onValueChange={(v) => { setMode(v as Mode); setScannedTeam(null); }} value={mode}>
                            <SelectTrigger className="bg-brand-dark border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="attendance">Workshop Attendance</SelectItem>
                                <SelectItem value="entry">Entry Gate</SelectItem>
                                <SelectItem value="lab">Lab Allocation</SelectItem>
                                <SelectItem value="food">Food Distribution</SelectItem>
                                <SelectItem value="exit">Exit Gate</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(mode === 'attendance' || mode === 'food') && (
                        <div className="space-y-1 animate-in fade-in duration-300">
                            <label className="text-xs font-bold text-gray-500 uppercase">Event Day</label>
                            <Select onValueChange={setWorkshopDay} value={workshopDay}>
                                <SelectTrigger className="bg-brand-dark border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Day 1</SelectItem>
                                    <SelectItem value="2">Day 2</SelectItem>
                                    <SelectItem value="3">Day 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {mode === 'food' && (
                        <div className="space-y-1 animate-in fade-in duration-300">
                            <label className="text-xs font-bold text-gray-500 uppercase">Meal Type</label>
                            <Select onValueChange={setMealType} value={mealType}>
                                <SelectTrigger className="bg-brand-dark border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Lunch">Lunch</SelectItem>
                                    <SelectItem value="Snacks">Snacks</SelectItem>
                                    <SelectItem value="Dinner">Dinner</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
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
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-brand-surface px-2 text-gray-500">Or Manual Entry</span></div>
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
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <div>
                                    <p className="text-xs text-brand-primary font-bold uppercase">Scanned Success</p>
                                    <h3 className="text-2xl font-bold">Team {scannedTeam.id}</h3>
                                </div>
                                <Button variant="ghost" onClick={() => setScannedTeam(null)}>Cancel</Button>
                            </div>

                            <ScrollArea className="max-h-[300px] pr-4">
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

                            {mode === 'lab' && (
                                <div className="grid grid-cols-2 gap-4 bg-brand-dark/50 p-4 rounded-xl border border-white/5">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase">Lab</label>
                                        <Select onValueChange={setAssignLab} value={assignLab}>
                                            <SelectTrigger className="h-9 bg-brand-surface border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Lab 1 (CSE)">Lab 1 (CSE)</SelectItem>
                                                <SelectItem value="Lab 2 (IT)">Lab 2 (IT)</SelectItem>
                                                <SelectItem value="Lab 3 (ECE)">Lab 3 (ECE)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase">Seat</label>
                                        <Input
                                            placeholder="A01"
                                            className="h-9 bg-brand-surface border-white/10"
                                            value={assignSeat}
                                            onChange={(e) => setAssignSeat(e.target.value.toUpperCase())}
                                        />
                                    </div>
                                </div>
                            )}

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
                    <div className="p-4 border-b border-white/5">
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
                                        <Badge variant={p.status === 'Paid' ? 'outline' : 'secondary'} className={p.status === 'Paid' ? 'border-green-500/50 text-green-400' : ''}>
                                            {p.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>
            )}
        </div>
    );
};

export default CoordinatorDashboard;
