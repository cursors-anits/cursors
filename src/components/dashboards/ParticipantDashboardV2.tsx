'use client';

import React, { useMemo, useState, useCallback } from 'react';
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
    Phone,
    LayoutDashboard,
    ChevronRight,
    X,
    Lightbulb,
    Download,
    Upload
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
import { DashboardShell } from '@/components/dashboards/DashboardShell';
import { NavItem } from '@/components/dashboards/DashboardNav';
import EventChecklist from '@/components/dashboards/EventChecklist';
import ProblemSelection from '@/components/dashboards/ProblemSelection';
import Link from 'next/link';
import ProjectSubmission from '@/components/dashboards/ProjectSubmission';

interface ParticipantDashboardProps {
    user: User;
}

const ParticipantDashboardV2: React.FC<ParticipantDashboardProps> = ({ user }) => {
    const { participants, currentUser, labs, logout, fetchParticipants } = useData();

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
    const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
    const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
    const [isSupportMenuOpen, setIsSupportMenuOpen] = useState(false);
    const [showHintBanner, setShowHintBanner] = useState(() => {
        if (typeof window !== 'undefined') {
            return !localStorage.getItem('participant-hint-dismissed');
        }
        return true;
    });
    const idCardRef = React.useRef<HTMLDivElement>(null);

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

    // Memoize lab details lookup for better performance


    const hackathonLabDetails = useMemo(() => {
        return participantData?.assignedHackathonLab
            ? labs.find(l => l.name === participantData.assignedHackathonLab)
            : null;
    }, [labs, participantData?.assignedHackathonLab]);

    const handleAction = useCallback(async (type: string) => {
        if (type === 'SOS') {
            setIsSOSModalOpen(true);
            return;
        }
        setReportType(type as any);
        setReportMessage('');
        setIsReportModalOpen(true);
    }, []);

    const dismissHintBanner = useCallback(() => {
        setShowHintBanner(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem('participant-hint-dismissed', 'true');
        }
    }, []);

    const downloadIdCard = useCallback(async () => {
        if (!idCardRef.current) return;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(idCardRef.current, {
                scale: 3, // High resolution
                backgroundColor: '#0a0a0a',
                logging: false,
            });

            const link = document.createElement('a');
            link.download = `${user.teamId || 'participant'}-id-card.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('ID Card downloaded successfully!');
        } catch (error) {
            toast.error('Failed to download ID card');
        }
    }, [user.teamId]);

    const handleAvatarUpload = useCallback(async (file: File) => {
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

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            toast.success('Avatar updated! Refreshing...');
            await fetchParticipants();
        } catch (error) {
            toast.error('Failed to upload avatar');
        } finally {
            setIsAvatarUploading(false);
        }
    }, [user.teamId, fetchParticipants]);

    const submitSupportRequest = useCallback(async () => {
        setIsSubmittingReport(true);
        try {
            const res = await fetch('/api/participant/support-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: user.teamId,
                    type: reportType,
                    message: reportMessage
                })
            });

            if (!res.ok) throw new Error();
            toast.success('Request submitted successfully!');
            setIsReportModalOpen(false);
            setIsSOSModalOpen(false);
            setReportMessage('');
        } catch (error) {
            toast.error('Failed to submit request');
        } finally {
            setIsSubmittingReport(false);
        }
    }, [participantData?.participantId, reportType, reportMessage]);

    const navItems: NavItem[] = [
        {
            label: 'Dashboard',
            value: 'dashboard',
            icon: LayoutDashboard
        }
    ];

    return (
        <DashboardShell
            title="Participant Hub"
            description="Your event control center"
            items={navItems}
            activeTab="dashboard"
            onTabChange={() => { }}
            user={{
                name: user.name,
                email: user.email,
                role: 'Participant',
                avatar: participantData?.avatarUrl,
                teamId: user.teamId
            }}
        >
            <div className="space-y-6">
                {/* Hero Welcome Section */}
                <Card className="bg-linear-to-br from-brand-primary/20 via-brand-surface to-brand-dark border-brand-primary/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl" />
                    <CardContent className="p-8 relative z-10">
                        <div className="flex items-start justify-between flex-wrap gap-6">
                            <div className="flex items-start gap-4">
                                {/* Avatar with Upload */}
                                <div className="relative group shrink-0">
                                    <div className="w-20 h-20 rounded-xl bg-brand-dark border-2 border-brand-primary/30 flex items-center justify-center overflow-hidden relative">
                                        {participantData?.avatarUrl ? (
                                            <Image
                                                src={participantData.avatarUrl}
                                                alt="Avatar"
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl font-bold text-brand-primary">{avatarFallback}</span>
                                        )}
                                    </div>
                                    {/* Upload Button Overlay */}
                                    <Label
                                        htmlFor="avatar-upload-hero"
                                        className="absolute bottom-0 right-0 w-7 h-7 bg-brand-dark rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-dark/80 transition-colors shadow-lg"
                                    >
                                        {isAvatarUploading ? (
                                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                                        ) : (
                                            <Camera className="w-4 h-4 text-white" />
                                        )}
                                        <Input
                                            id="avatar-upload-hero"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            disabled={isAvatarUploading}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleAvatarUpload(file);
                                            }}
                                        />
                                    </Label>
                                </div>

                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                        Welcome back, <span className="text-brand-primary">{user.name.split(' ')[0]}</span>! 🎉
                                    </h1>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <Badge variant="outline" className="bg-brand-primary/20 text-brand-primary border-brand-primary/50 font-mono">
                                            {user.teamId || 'N/A'}
                                        </Badge>
                                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                            {participantData?.type || 'Participant'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            {/* Countdown Timer */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Event Starts In</div>
                                <div className="text-2xl font-bold text-brand-primary font-mono">
                                    {(() => {
                                        const eventDate = new Date('2026-01-05T15:00:00');
                                        const now = new Date();
                                        const diff = eventDate.getTime() - now.getTime();
                                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                        return days > 0 ? `${days} Days` : 'Starting Soon!';
                                    })()}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Hint Banner - First Time Users */}
                {showHintBanner && (
                    <Card className="bg-blue-500/10 border-blue-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-blue-200 font-medium">
                                        💡 <strong>Tip:</strong> Click any card below to access features and manage your event experience!
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

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Digital Pass Card */}
                    <Card
                        className="bg-brand-surface border-green-500/20 hover:border-green-500/40 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 transition-all cursor-pointer group"
                        onClick={() => setShowIdCard(true)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                                    <QrCode className="w-6 h-6 text-green-400" />
                                </div>
                                <Badge className="bg-green-500/20 text-green-300">Ready</Badge>
                            </div>
                            <h3 className="font-bold text-white mb-1 flex items-center justify-between">
                                Digital Pass
                                <ChevronRight className="w-4 h-4 text-green-400 group-hover:translate-x-1 transition-transform" />
                            </h3>
                            <p className="text-xs text-gray-400 mb-3">View your ID card</p>
                            <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                                Open <ChevronRight className="w-3 h-3" />
                            </p>
                        </CardContent>
                    </Card>

                    {/* Event Checklist Card */}
                    <Card
                        className="bg-brand-surface border-blue-500/20 hover:border-blue-500/40 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 transition-all cursor-pointer group"
                        onClick={() => setIsChecklistModalOpen(true)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                    <LayoutDashboard className="w-6 h-6 text-blue-400" />
                                </div>
                                <Badge className="bg-blue-500/20 text-blue-300">
                                    {participantData?.eventChecklist?.length || 0}/8
                                </Badge>
                            </div>
                            <h3 className="font-bold text-white mb-1 flex items-center justify-between">
                                Event Checklist
                                <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                            </h3>
                            <p className="text-xs text-gray-400 mb-3">Prepare for the event</p>
                            <p className="text-xs text-blue-400 font-medium flex items-center gap-1">
                                Open <ChevronRight className="w-3 h-3" />
                            </p>
                        </CardContent>
                    </Card>

                    {/* Problem Statement Card */}
                    <Card
                        className="bg-brand-surface border-purple-500/20 hover:border-purple-500/40 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 transition-all cursor-pointer group"
                        onClick={() => setIsProblemModalOpen(true)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                                    <Zap className="w-6 h-6 text-purple-400" />
                                </div>
                                <Badge className={participantData?.hasConfirmedProblem ? "bg-green-500/20 text-green-300" : (participantData?.problemAssignmentId ? "bg-brand-primary/20 text-brand-primary animate-pulse" : "bg-orange-500/20 text-orange-300")}>
                                    {participantData?.hasConfirmedProblem ? '✓ Done' : (participantData?.problemAssignmentId ? 'Action Needed' : 'Pending')}
                                </Badge>
                            </div>
                            <h3 className="font-bold text-white mb-1 flex items-center justify-between">
                                Problem Statement
                                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                            </h3>
                            <p className="text-xs text-gray-400 mb-3">Select your challenge</p>
                            <p className="text-xs text-purple-400 font-medium flex items-center gap-1">
                                Open <ChevronRight className="w-3 h-3" />
                            </p>
                        </CardContent>
                    </Card>

                    {participantData && (
                        <Card
                            className="bg-brand-surface border-blue-500/20 hover:border-blue-500/40 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 transition-all cursor-pointer group"
                            onClick={() => setIsSubmissionModalOpen(true)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                        <Upload className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <Badge className={`${participantData?.projectRepo ? (participantData.submissionStatus === 'verified' ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300") : "bg-blue-500/20 text-blue-300"}`}>
                                        {participantData?.projectRepo ? (participantData.submissionStatus === 'verified' ? '✓ Verified' : '⚠ Flagged') : 'Submit'}
                                    </Badge>
                                </div>
                                <h3 className="font-bold text-white mb-1 flex items-center justify-between">
                                    Project Submission
                                    <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                                </h3>
                                <p className="text-xs text-gray-400 mb-3">Submit your repository</p>
                                <p className="text-xs text-blue-400 font-medium flex items-center gap-1">
                                    Open <ChevronRight className="w-3 h-3" />
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Get Support Card */}
                    <Card
                        className="bg-brand-surface border-orange-500/20 hover:border-orange-500/40 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/20 transition-all cursor-pointer group"
                        onClick={() => setIsSupportMenuOpen(true)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                                    <HelpCircle className="w-6 h-6 text-orange-400" />
                                </div>
                                <Badge className="bg-orange-500/20 text-orange-300">24/7</Badge>
                            </div>
                            <h3 className="font-bold text-white mb-1 flex items-center justify-between">
                                Get Support
                                <ChevronRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
                            </h3>
                            <p className="text-xs text-gray-400 mb-3">Need help? Ask us</p>
                            <p className="text-xs text-orange-400 font-medium flex items-center gap-1">
                                Open <ChevronRight className="w-3 h-3" />
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Information Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lab Allocation Card */}
                    <Card className="bg-brand-surface border-brand-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-brand-primary" />
                                <h3 className="font-bold text-white">Lab Allocation</h3>
                            </div>
                            <div className="space-y-3">


                                {/* Hackathon Lab */}
                                {participantData?.assignedHackathonLab ? (
                                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-purple-300 font-semibold uppercase">Hackathon</p>
                                                <p className="text-white font-bold">{participantData.assignedHackathonLab}</p>
                                                {hackathonLabDetails?.roomNumber && (
                                                    <p className="text-xs text-gray-400">Room: {hackathonLabDetails.roomNumber}</p>
                                                )}
                                                <p className="text-xs text-gray-400">Seat: {participantData.assignedSeat || 'TBD'}</p>
                                            </div>
                                            <Badge className="bg-purple-500 text-white">Day 1-2</Badge>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                        <p className="text-sm text-gray-400">Hackathon lab assignment pending...</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Info Card */}
                    <Card className="bg-brand-surface border-brand-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-brand-primary" />
                                <h3 className="font-bold text-white">Team Information</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Team ID</span>
                                    <span className="font-mono font-bold text-white">{user.teamId}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Ticket Type</span>
                                    <Badge className="bg-brand-primary/20 text-brand-primary">{participantData?.type || 'N/A'}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Team Size</span>
                                    <span className="font-bold text-white">{participants.filter(p => p.teamId === user.teamId).length} members</span>
                                </div>
                                <Separator className="bg-white/10" />
                                <div>
                                    <p className="text-xs text-gray-400 mb-2">Team Members</p>
                                    <div className="space-y-1">
                                        {participants.filter(p => p.teamId === user.teamId).map((member, idx) => (
                                            <div key={member.participantId} className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-xs font-bold text-brand-primary">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-sm text-white">{member.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator className="bg-white/10" />
                                <div>
                                    <p className="text-xs text-gray-400 mb-2">Contact Coordinator</p>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-brand-primary" />
                                        <Link href="tel:8897892720" className="text-sm text-brand-primary hover:underline">
                                            8897892720
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Timeline */}
                <Card className="bg-brand-surface border-brand-primary/20">
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="font-bold text-white mb-4 sm:mb-6 text-center text-sm sm:text-base">Your Journey</h3>
                        <div className="flex flex-col sm:flex-row items-center justify-between relative gap-4 sm:gap-0">
                            {/* Progress Line */}
                            <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/10 hidden sm:block">
                                <div
                                    className="h-full bg-brand-primary transition-all"
                                    style={{
                                        width: participantData?.hasConfirmedProblem ? '80%' :
                                            participantData?.assignedLab ? '60%' :
                                                (participantData?.eventChecklist?.length || 0) >= 4 ? '40%' : '20%'
                                    }}
                                />
                            </div>

                            {/* Stage 1: Registration */}
                            <div className="flex sm:flex-col items-center gap-3 sm:gap-2 relative z-10 w-full sm:w-auto">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="flex-1 sm:flex-none text-left sm:text-center">
                                    <Badge className="bg-green-500/20 text-green-300 mb-1">✓ Complete</Badge>
                                    <span className="block text-xs text-gray-400">Registration</span>
                                </div>
                            </div>

                            {/* Stage 2: Checklist (Optional) */}
                            <div className="flex sm:flex-col items-center gap-3 sm:gap-2 relative z-10 w-full sm:w-auto">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${(participantData?.eventChecklist?.length || 0) >= 4 ? 'bg-brand-primary' : 'bg-white/10'}`}>
                                    <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="flex-1 sm:flex-none text-left sm:text-center">
                                    <Badge className={(participantData?.eventChecklist?.length || 0) >= 4 ? "bg-green-500/20 text-green-300 mb-1" : "bg-gray-500/20 text-gray-300 mb-1"}>
                                        {(participantData?.eventChecklist?.length || 0) >= 4 ? '✓ Ready' : '📝 Optional'}
                                    </Badge>
                                    <span className="block text-xs text-gray-400">Checklist</span>
                                </div>
                            </div>

                            {/* Stage 3: Allocation */}
                            <div className="flex sm:flex-col items-center gap-3 sm:gap-2 relative z-10 w-full sm:w-auto">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${participantData?.assignedLab ? 'bg-brand-primary' : 'bg-white/10'}`}>
                                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="flex-1 sm:flex-none text-left sm:text-center">
                                    <Badge className={participantData?.assignedLab ? "bg-green-500/20 text-green-300 mb-1" : "bg-orange-500/20 text-orange-300 mb-1"}>
                                        {participantData?.assignedLab ? '✓ Assigned' : '⏳ Pending'}
                                    </Badge>
                                    <span className="block text-xs text-gray-400">Lab Allocation</span>
                                </div>
                            </div>

                            {/* Stage 4: Problem */}
                            <div className="flex sm:flex-col items-center gap-3 sm:gap-2 relative z-10 w-full sm:w-auto">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${participantData?.hasConfirmedProblem ? 'bg-brand-primary' : 'bg-white/10'}`}>
                                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="flex-1 sm:flex-none text-left sm:text-center">
                                    <Badge className={participantData?.hasConfirmedProblem ? "bg-green-500/20 text-green-300 mb-1" : (participantData?.problemAssignmentId ? "bg-brand-primary/20 text-brand-primary mb-1 animate-pulse" : "bg-blue-500/20 text-blue-300 mb-1")}>
                                        {participantData?.hasConfirmedProblem ? '✓ Confirmed' : (participantData?.problemAssignmentId ? 'Action Needed' : 'Wait')}
                                    </Badge>
                                    <span className="block text-xs text-gray-400">Problem</span>
                                </div>
                            </div>

                            {/* Stage 5: Submission */}
                            <div className="flex sm:flex-col items-center gap-3 sm:gap-2 relative z-10 w-full sm:w-auto">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="flex-1 sm:flex-none text-left sm:text-center">
                                    <Badge className="bg-purple-500/20 text-purple-300 mb-1">🚀 Final</Badge>
                                    <span className="block text-xs text-gray-400">Submission</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Checklist Modal */}
            <Dialog open={isChecklistModalOpen} onOpenChange={setIsChecklistModalOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-brand-dark border-white/20">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">Event Preparation Checklist</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Make sure you have everything ready for the event
                        </DialogDescription>
                    </DialogHeader>
                    {participantData && (
                        <EventChecklist
                            participantId={participantData.participantId}
                            initialCheckedItems={participantData.eventChecklist || []}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Project Submission Modal */}
            <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
                <DialogContent className="max-w-2xl bg-brand-dark border-white/20">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Project Submission</DialogTitle>
                        <DialogDescription>Submit your project repository</DialogDescription>
                    </DialogHeader>
                    {participantData && (
                        <ProjectSubmission participantId={participantData.participantId} />
                    )}
                </DialogContent>
            </Dialog>

            {/* Problem Selection Modal */}
            <Dialog open={isProblemModalOpen} onOpenChange={setIsProblemModalOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-brand-dark border-white/20">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">Problem Statement Selection</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Choose your challenge for the hackathon
                        </DialogDescription>
                    </DialogHeader>
                    {participantData && (
                        <ProblemSelection
                            participantId={participantData.participantId}
                            onSuccess={() => {
                                fetchParticipants(true);
                                // Optional: Close modal if desired? Or let them see confirmation?
                                // "Problem Statement Card ... should update".
                                // Keeping modal open lets them see "Confirmed!" message inside too.
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Support Menu Modal */}
            <Dialog open={isSupportMenuOpen} onOpenChange={setIsSupportMenuOpen}>
                <DialogContent className="bg-brand-dark border-white/20 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">Get Support</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Choose the type of assistance you need
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        {/* Help Option */}
                        <Card
                            className="bg-brand-surface border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer group"
                            onClick={() => {
                                setIsSupportMenuOpen(false);
                                handleAction('Help');
                            }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                        <HelpCircle className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Request Help</h4>
                                        <p className="text-xs text-gray-400">General questions or assistance</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Complaint Option */}
                        <Card
                            className="bg-brand-surface border-orange-500/20 hover:border-orange-500/40 transition-all cursor-pointer group"
                            onClick={() => {
                                setIsSupportMenuOpen(false);
                                handleAction('Complaint');
                            }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                                        <MessageSquare className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Submit Complaint</h4>
                                        <p className="text-xs text-gray-400">Report an issue or concern</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SOS Emergency Option */}
                        <Card
                            className="bg-brand-surface border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer group"
                            onClick={() => {
                                setIsSupportMenuOpen(false);
                                handleAction('SOS');
                            }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Emergency SOS</h4>
                                        <p className="text-xs text-gray-400">Urgent help needed immediately</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ID Card Modal - Keep from original */}
            <Dialog open={showIdCard} onOpenChange={setShowIdCard}>
                <DialogContent className="max-w-sm p-0 bg-brand-dark border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                    <DialogTitle className="sr-only">Digital ID Card</DialogTitle>
                    <DialogDescription className="sr-only">Digital ID Card with QR code</DialogDescription>
                    {participantData && (
                        <div ref={idCardRef} className="relative flex flex-col">
                            <div className="h-32 bg-linear-to-br from-brand-primary via-brand-secondary to-purple-600 p-6 flex items-start justify-between relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent)] opacity-50" />
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
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg relative group">
                                    <div className="w-full h-full bg-brand-dark rounded-xl flex items-center justify-center overflow-hidden relative">
                                        {participantData?.avatarUrl ? (
                                            <Image
                                                src={participantData.avatarUrl}
                                                alt="Avatar"
                                                fill
                                                sizes="96px"
                                                priority
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-4xl font-bold text-brand-primary">{avatarFallback}</span>
                                        )}
                                    </div>
                                    {/* Upload Button Overlay */}
                                    <Label
                                        htmlFor="avatar-upload"
                                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl"
                                    >
                                        {isAvatarUploading ? (
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        ) : (
                                            <Camera className="w-6 h-6 text-white" />
                                        )}
                                        <Input
                                            id="avatar-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            disabled={isAvatarUploading}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleAvatarUpload(file);
                                            }}
                                        />
                                    </Label>
                                </div>
                            </div>

                            <div className="pt-16 pb-6 px-6 text-center">
                                <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                                <p className="text-sm text-gray-400 mb-1">{participantData.college}</p>
                                <p className="text-xs text-gray-500 mb-4">{participantData.department} • {participantData.year}</p>

                                <div className="bg-white p-4 rounded-2xl mb-4">
                                    <div className="bg-white flex items-center justify-center h-32 w-32 mx-auto">
                                        {participantData?.participantId ? (
                                            <Image
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${participantData.participantId}&color=020617&bgcolor=ffffff`}
                                                alt="QR Code"
                                                width={128}
                                                height={128}
                                                className="w-full h-full"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="text-center text-brand-dark">
                                                <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <span className="text-[10px] font-bold">GENERATING...</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-brand-dark font-mono font-bold mt-2">{user.teamId}</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={downloadIdCard}
                                        className="flex-1 bg-brand-primary hover:bg-brand-primary/80 text-white"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                    <Button
                                        onClick={() => setShowIdCard(false)}
                                        variant="outline"
                                        className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Support Modals */}
            <Dialog open={isSOSModalOpen} onOpenChange={setIsSOSModalOpen}>
                <DialogContent className="bg-brand-dark border-red-500/50">
                    <DialogHeader>
                        <DialogTitle className="text-red-500 text-2xl flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6" /> Emergency SOS
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            This will immediately alert all coordinators. Use only for urgent emergencies.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={reportMessage}
                        onChange={(e) => setReportMessage(e.target.value)}
                        placeholder="Describe the emergency..."
                        className="bg-brand-surface border-white/10"
                        rows={4}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSOSModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={() => {
                                setReportType('SOS');
                                submitSupportRequest();
                            }}
                            disabled={isSubmittingReport}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isSubmittingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send SOS'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                <DialogContent className="bg-brand-dark border-white/20">
                    <DialogHeader>
                        <DialogTitle className="text-white">{reportType === 'Help' ? 'Request Help' : 'Submit Complaint'}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Our team will respond as soon as possible.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={reportMessage}
                        onChange={(e) => setReportMessage(e.target.value)}
                        placeholder={reportType === 'Help' ? 'How can we help you?' : 'Describe your complaint...'}
                        className="bg-brand-surface border-white/10"
                        rows={4}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={submitSupportRequest}
                            disabled={isSubmittingReport}
                            className="bg-brand-primary hover:bg-brand-primary/80"
                        >
                            {isSubmittingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardShell>
    );
};

export default ParticipantDashboardV2;
