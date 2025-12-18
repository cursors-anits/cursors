'use client';

import React, { useEffect, useState } from 'react';
import { User, Participant as IParticipant } from '@/types';
import {
    QrCode,
    Users,
    AlertTriangle,
    HelpCircle,
    MessageSquare,
    MapPin,
    X,
    Download,
    ShieldCheck,
    Calendar
} from 'lucide-react';
import { useData } from '@/lib/context/DataContext';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ParticipantDashboardProps {
    user: User;
}

const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({ user }) => {
    const { participants } = useData();
    const [participantData, setParticipantData] = useState<IParticipant | null>(null);
    const [showIdCard, setShowIdCard] = useState(false);

    useEffect(() => {
        const data = participants.find(p => p.email === user.email || p.teamId === user.teamId);
        if (data) setParticipantData(data);
    }, [participants, user]);

    const handleAction = (type: string) => {
        alert(`${type} request sent! Help is on the way.`);
    };

    return (
        <div className="pt-24 pb-12 px-6 max-w-2xl mx-auto space-y-6">
            {/* Profile Card */}
            <Card className="bg-linear-to-br from-brand-surface to-brand-dark border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 bg-brand-primary/10 blur-[50px] rounded-full" />
                <CardContent className="p-8 text-center relative z-10">
                    <div className="w-24 h-24 bg-brand-primary rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-brand-dark shadow-xl shadow-brand-primary/20">
                        {user.name.charAt(0)}
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

                    {participantData?.assignedLab ? (
                        <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-between text-left">
                            <div className="flex items-center gap-4">
                                <MapPin className="w-6 h-6 text-green-400" />
                                <div>
                                    <p className="text-xs text-green-300 font-bold uppercase">Allocated Workstation</p>
                                    <p className="text-white font-bold">{participantData.assignedLab} • {participantData.assignedSeat}</p>
                                </div>
                            </div>
                            <Badge className="bg-green-500 text-white">Active</Badge>
                        </div>
                    ) : (
                        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                            <p className="text-sm text-gray-400">Lab allocation in progress...</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Help', icon: HelpCircle, color: 'text-blue-400', action: 'Help' },
                    { label: 'Issue', icon: MessageSquare, color: 'text-green-400', action: 'Complaint' },
                    { label: 'SOS', icon: AlertTriangle, color: 'text-red-500', action: 'SOS', pulse: true },
                ].map((item, i) => (
                    <Button
                        key={i}
                        variant="outline"
                        onClick={() => handleAction(item.action)}
                        className={`h-24 flex flex-col gap-2 rounded-2xl bg-brand-surface border-white/5 hover:bg-white/5 ${item.pulse ? 'border-red-500/20' : ''}`}
                    >
                        <item.icon className={`w-6 h-6 ${item.color} ${item.pulse ? 'animate-pulse' : ''}`} />
                        <span className="text-xs font-medium text-gray-400">{item.label}</span>
                    </Button>
                ))}
            </div>

            {/* ID Card Modal */}
            <Dialog open={showIdCard} onOpenChange={setShowIdCard}>
                <DialogContent className="max-w-sm p-0 bg-brand-dark border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="relative flex flex-col">
                        <div className="h-32 bg-linear-to-r from-brand-primary to-brand-secondary p-6 flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-brand-dark font-bold">V</div>
                                    <span className="text-white font-bold tracking-tight">VIBE</span>
                                </div>
                                <Badge className="bg-white/20 text-white border-white/30 uppercase text-[10px]">
                                    {participantData?.type || 'Participant'}
                                </Badge>
                            </div>
                            <div className="text-right text-white/80">
                                <Calendar className="w-5 h-5 ml-auto mb-1" />
                                <span className="text-[10px] font-mono">JAN 02-06</span>
                            </div>
                        </div>

                        <div className="absolute top-20 left-1/2 -translate-x-1/2">
                            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                                <div className="w-full h-full bg-brand-dark rounded-xl flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white">{user.name.charAt(0)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 px-6 pb-8 text-center space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <p className="text-gray-500 text-sm mt-1">{participantData?.college || 'ANITS Engineering'}</p>
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
                                {/* Simulated QR Code for the demo */}
                                <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white">
                                    <QrCode className="w-20 h-20" />
                                    <p className="text-[8px] mt-1 font-mono">{participantData?.participantId}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-xs uppercase tracking-widest">
                                <ShieldCheck className="w-4 h-4" /> Verified Attendee
                            </div>
                        </div>

                        <div className="bg-black/60 p-4 text-center text-[8px] text-gray-600 font-mono border-t border-white/5">
                            OFFICIAL ENTRY PASS • VIBE CODING 2025
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ParticipantDashboard;
