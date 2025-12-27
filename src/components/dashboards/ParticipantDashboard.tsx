'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { User } from '@/types';
import {
    QrCode,
    AlertTriangle,
    HelpCircle,
    MessageSquare,
    MapPin,
    ShieldCheck,
    Calendar,
    Users,
    Camera,
    Zap,
    Loader2,
    Phone
} from 'lucide-react';
import { useData } from '@/lib/context/DataContext';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LayoutDashboard } from 'lucide-react';
import { DashboardShell } from '@/components/dashboards/DashboardShell';
import { NavItem } from '@/components/dashboards/DashboardNav';
import EventChecklist from '@/components/dashboards/EventChecklist';
import ProblemSelection from '@/components/dashboards/ProblemSelection';
import Link from 'next/link';

interface ParticipantDashboardProps {
    user: User;
}

const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({ user }) => {
    const { participants, fetchParticipants } = useData();

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const showIdCard = searchParams.get('idcard') === 'true';

    const setShowIdCard = (show: boolean) => {
        const params = new URLSearchParams(searchParams.toString());
        if (show) params.set('idcard', 'true');
        else params.delete('idcard');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportType, setReportType] = useState<'SOS' | 'Help' | 'Complaint'>('Help');
    const [reportMessage, setReportMessage] = useState('');
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);

    const participantData = useMemo(() => {
        return participants.find(p => p.email === user.email || p.teamId === user.teamId) || null;
    }, [participants, user]);

    const avatarFallback = useMemo(() => {
        if (user.teamId) {
            const match = user.teamId.match(/\d+$/);
            return match ? match[0] : user.name.charAt(0);
        }
        return user.name.charAt(0);
    }, [user]);

    const handleAction = async (type: string) => {
        if (type === 'SOS') {
            setIsSOSModalOpen(true);
            return;
        }
        setReportType(type as any);
        setReportMessage('');
        setIsReportModalOpen(true);
    };

    const handleAvatarUpload = async (file: File) => {
        if (file.size > 30 * 1024 * 1024) {
            toast.error('Avatar size should be less than 30MB');
            return;
        }

        setIsAvatarUploading(true);
        try {
            const formData = new FormData();
            formData.append('teamId', user.teamId || '');
            formData.append('file', file);

            const res = await fetch('/api/participant/avatar', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            toast.success('Team avatar updated!');
            await fetchParticipants();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to upload avatar');
        } finally {
            setIsAvatarUploading(false);
        }
    };

    const submitReport = async (type: string, message: string) => {
        setIsSubmittingReport(true);
        try {
            const res = await fetch('/api/participant/support-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, teamId: user.teamId, message })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send request');
            }
            toast.success(`${type} request sent! Help is on the way.`, {
                icon: type === 'SOS' ? '🚨' : type === 'Help' ? '❓' : '📝'
            });
            setIsReportModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to send request');
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const activeTab = searchParams.get('tab') || 'dashboard';

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const navItems: NavItem[] = [
        { label: 'Dashboard', icon: LayoutDashboard, value: 'dashboard' },
    ];

    return (
        <DashboardShell
            title="Participant Hub"
            description="Your all-access pass & event control center"
            items={navItems}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            user={{
                name: user.name,
                email: user.email,
                role: 'Participant',
                avatar: participantData?.avatarUrl,
                teamId: user.teamId
            }}
        >
            <div className="space-y-6 max-w-2xl mx-auto">

                <div className="space-y-6">
                    {/* Profile Card */}
                    <Card className="bg-linear-to-br from-brand-surface to-brand-dark border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-20 bg-brand-primary/10 blur-[50px] rounded-full" />
                        <CardContent className="p-8 text-center relative z-10">
                            <div className="relative w-32 h-32 mx-auto mb-6 group">
                                <div className="w-full h-full bg-brand-primary rounded-full flex items-center justify-center text-5xl font-bold text-brand-dark shadow-xl shadow-brand-primary/20 overflow-hidden relative">
                                    {participantData?.avatarUrl ? (
                                        <Image
                                            src={participantData.avatarUrl}
                                            alt="Team Avatar"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        avatarFallback
                                    )}

                                    {isAvatarUploading && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <Label className="absolute bottom-0 right-0 p-2 bg-white text-brand-dark rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                    <Camera className="w-5 h-5" />
                                    <Input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleAvatarUpload(file);
                                        }}
                                    />
                                </Label>
                            </div>

                            <h2 className="text-3xl font-bold">{user.name}</h2>
                            <Badge variant="outline" className="mt-2 bg-brand-primary/10 text-brand-primary border-brand-primary/20 px-4 py-1 font-mono">
                                Team ID: {user.teamId || 'N/A'}
                            </Badge>

                            <div className="mt-8">
                                <Button
                                    onClick={() => setShowIdCard(true)}
                                    className="bg-white text-brand-dark hover:bg-gray-100 font-bold px-8 py-6 rounded-2xl shadow-xl hover:scale-105 transition-transform"
                                >
                                    <QrCode className="w-5 h-5 mr-2" /> View Digital ID
                                </Button>
                            </div>

                            <div className="mt-8 space-y-3">
                                {/* Hackathon Allocation */}
                                {participantData?.assignedHackathonLab && (
                                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-between text-left">
                                        <div className="flex items-center gap-4">
                                            <MapPin className="w-6 h-6 text-purple-400" />
                                            <div>
                                                <p className="text-xs text-purple-300 font-bold uppercase">Hackathon Station</p>
                                                <p className="text-white font-bold">{participantData.assignedHackathonLab} • {participantData.assignedSeat || 'Gen Seat'}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-purple-500 text-white">Day 3-4</Badge>
                                    </div>
                                )}

                                {/* Legacy/Generic Allocation (Fallback) */}
                                {!participantData?.assignedHackathonLab && participantData?.assignedLab && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-between text-left">
                                        <div className="flex items-center gap-4">
                                            <MapPin className="w-6 h-6 text-green-400" />
                                            <div>
                                                <p className="text-xs text-green-300 font-bold uppercase">Allocated Workstation</p>
                                                <p className="text-white font-bold">{participantData.assignedLab} • {participantData.assignedSeat}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-500 text-white">Active</Badge>
                                    </div>
                                )}

                                {/* Pending State */}
                                {!participantData?.assignedHackathonLab && !participantData?.assignedLab && (
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                        <p className="text-sm text-gray-400">Lab allocation in progress...</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Help', icon: HelpCircle, color: 'text-blue-400', action: 'Help', description: 'Ask a question' },
                            { label: 'Issue', icon: AlertTriangle, color: 'text-orange-400', action: 'Complaint', description: 'Report a problem' },
                            { label: 'SOS', icon: Zap, color: 'text-red-500', action: 'SOS', pulse: true, description: 'EMERGENCY ONLY' },
                        ].map((item, i) => (
                            <Button
                                key={i}
                                variant="outline"
                                onClick={() => handleAction(item.action)}
                                className={`h-24 flex flex-col gap-2 rounded-2xl bg-brand-surface border-white/5 hover:bg-white/5 ${item.pulse ? 'border-red-500/20 shadow-lg shadow-red-500/5' : ''}`}
                            >
                                <item.icon className={`w-6 h-6 ${item.color} ${item.pulse ? 'animate-pulse' : ''}`} />
                                <span className="text-xs font-medium text-gray-400">{item.label}</span>
                            </Button>
                        ))}
                    </div>

                    {/* Team List */}
                    <Card className="bg-brand-surface border-white/5 overflow-hidden">
                        <div className="p-4 flex items-center justify-between relative">
                            <Separator className="bg-white/5 absolute bottom-0 left-0 w-full" />
                            <h3 className="font-bold flex items-center gap-2">
                                <Users className="w-4 h-4 text-brand-primary" />
                                Team Members
                            </h3>
                            <Badge variant="outline" className="text-[10px]">{participants.filter(p => p.teamId === user.teamId).length} Members</Badge>
                        </div>
                        <div className="divide-y divide-white/5">
                            {participants.filter(p => p.teamId === user.teamId).map((member) => (
                                <div key={member._id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">{member.name}</p>
                                        <p className="text-[10px] text-gray-500 font-mono">{member.participantId}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] bg-white/5">
                                        {member.type}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Accommodation Info */}
                    <Card className="bg-brand-surface border-brand-primary/20">
                        <CardContent className="p-6 flex items-start gap-4">
                            <div className="bg-yellow-500/10 p-3 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-lg text-white">Accommodation & Food Information</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Accommodation is <span className="text-red-400 font-bold">NOT provided</span> for the event (except for Hackathon night for participants).
                                    <br />
                                    <br />
                                    <span className="text-white font-semibold">Food:</span> Snacks will be provided. Dinner is NOT included - available at college canteen or via Swiggy/Zomato at your expense.
                                    <br />
                                    For nearby hostels and stay assistance, please contact:
                                </p>
                                <div className="flex items-center gap-3 pt-2">
                                    <Badge variant="outline" className="border-brand-primary text-brand-primary font-mono text-sm px-3 py-1">
                                        <Phone className="w-4 h-4 mr-1" /> <Link href="tel:8897892720">8897892720</Link>
                                    </Badge>
                                    <span className="text-xs text-gray-500 uppercase tracking-widest">Coordinator</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Event Preparation Checklist */}
                    {participantData && (
                        <EventChecklist
                            participantId={participantData.participantId}
                            initialCheckedItems={participantData.eventChecklist || []}
                        />
                    )}

                    {/* Problem Statement Selection */}
                    {participantData && (
                        <ProblemSelection participantId={participantData.participantId} />
                    )}
                </div>
            </div>

            {/* ID Card Modal */}
            <Dialog open={showIdCard} onOpenChange={setShowIdCard}>
                <DialogContent className="max-w-sm p-0 bg-brand-dark border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                    <DialogTitle className="sr-only">Digital ID Card</DialogTitle>
                    <div className="relative flex flex-col">
                        <div className="h-32 bg-linear-to-br from-brand-primary via-brand-secondary to-purple-600 p-6 flex items-start justify-between relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent)] opacity-50" />
                            <div className="absolute -inset-2 bg-linear-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:animate-shimmer" />

                            <div className="relative z-10">
                                <div className="flex items-center mb-1">
                                    <Image
                                        src="/sponsors/cursors.png"
                                        alt="Cursors Logo"
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                    />
                                    <span className="text-white font-bold tracking-tight">VIBE</span>
                                </div>
                                <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 uppercase text-[10px]">
                                    {participantData?.type || 'Participant'}
                                </Badge>
                            </div>
                            <div className="text-right text-white relative z-10">
                                <Calendar className="w-5 h-5 ml-auto mb-1 opacity-70" />
                                <span className="text-[10px] font-mono font-bold">JAN 02-06</span>
                            </div>
                        </div>

                        <div className="absolute top-20 left-1/2 -translate-x-1/2">
                            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                                <div className="w-full h-full bg-brand-dark rounded-xl flex items-center justify-center overflow-hidden relative">
                                    {participantData?.avatarUrl ? (
                                        <Image
                                            src={participantData.avatarUrl}
                                            alt="Team Avatar"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold text-white">{avatarFallback}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 px-6 pb-8 text-center space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <p className="text-gray-500 text-sm mt-1">{participantData?.college || 'Anil Neerukonda Institute of Technology and Sciences [ANITS]'}</p>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 grid grid-cols-2 gap-4 text-left">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase">Team ID</p>
                                    <p className="text-brand-primary font-mono font-bold text-sm">{participantData?.teamId || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase">Participant ID</p>
                                    <p className="text-white font-mono text-sm">{participantData?.participantId || 'PENDING'}</p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-3xl w-40 h-40 mx-auto flex items-center justify-center">
                                {participantData?.participantId ? (
                                    <Image
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${participantData.participantId}`}
                                        alt="QR Code"
                                        width={160}
                                        height={160}
                                        className="w-full h-full"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-black/5 flex flex-col items-center justify-center text-gray-400">
                                        <QrCode className="w-12 h-12 animate-pulse" />
                                        <p className="text-[10px] mt-2 italic">Generating...</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-xs uppercase tracking-widest">
                                <ShieldCheck className="w-4 h-4" /> Verified Attendee
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/60 p-4 text-center text-[8px] text-gray-600 font-mono relative">
                        <Separator className="bg-white/5 absolute top-0 left-0 w-full" />
                        OFFICIAL ENTRY PASS • VIBE CODING 2026
                    </div>
                </DialogContent>
            </Dialog >

            {/* Support Request Modal */}
            < Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen} >
                <DialogContent className="bg-brand-surface border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {reportType === 'Help' ? <HelpCircle className="w-5 h-5 text-blue-400" /> : <MessageSquare className="w-5 h-5 text-green-400" />}
                            Submit {reportType === 'Complaint' ? 'Issue / Feedback' : 'Help Request'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Describe your issue below. A coordinator will be notified immediately.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="message">Your Message</Label>
                            <Textarea
                                id="message"
                                placeholder={reportType === 'Help' ? "Explain what you need help with..." : "Describe the issue or provide feedback..."}
                                className="bg-brand-dark border-white/10 min-h-[120px] focus:ring-brand-primary"
                                value={reportMessage}
                                onChange={(e) => setReportMessage(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsReportModalOpen(false)} disabled={isSubmittingReport}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-brand-primary text-brand-dark hover:bg-white min-w-[100px]"
                            onClick={() => submitReport(reportType, reportMessage)}
                            disabled={isSubmittingReport || !reportMessage.trim()}
                        >
                            {isSubmittingReport ? 'Sending...' : 'Send Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* SOS Confirmation Modal */}
            < Dialog open={isSOSModalOpen} onOpenChange={setIsSOSModalOpen} >
                <DialogContent className="bg-brand-surface border-red-500/20 text-white max-w-sm text-center">
                    <DialogHeader>
                        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                            <Zap className="w-8 h-8 text-red-500 animate-pulse" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-red-500">Trigger SOS Signal?</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            This will notify ALL coordinators and event staff immediately.
                            Only use this for <span className="text-red-400 font-bold uppercase">emergencies</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex flex-col gap-2 sm:gap-0 sm:flex-row pt-6">
                        <Button variant="ghost" className="flex-1" onClick={() => setIsSOSModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                            onClick={() => {
                                submitReport('SOS', 'Urgent SOS signal triggered.');
                                setIsSOSModalOpen(false);
                            }}
                        >
                            CONFIRM SOS
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >



        </DashboardShell >
    );
};

export default ParticipantDashboard;
