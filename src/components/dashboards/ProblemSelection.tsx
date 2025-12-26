'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, Clock, AlertCircle, Sparkles, Building2, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Hardcoded for now, or could be fetched
const DOMAINS = [
    'Artificial Intelligence & Machine Learning',
    'Sustainability & Green Tech',
    'Healthcare & BioTech',
    'Smart Cities & IoT',
    'EdTech & Skill Development',
    'FinTech & Blockchain',
    'Cybersecurity',
    'AgriTech',
    'Industry 4.0 & Automation',
    'Social Impact & Governance',
    'AR/VR & Metaverse'
];

interface OfferedProblem {
    domainIndex: number;
    problemIndex: number;
    domain: string;
    problem: string;
}

interface ProblemAssignment {
    participantId: string;
    teamId: string;
    offeredProblems: OfferedProblem[];
    selectedProblem?: OfferedProblem;
    isConfirmed: boolean;
    refreshCount: number;
    maxRefreshes: number;
    canRefresh: boolean;
    assignedAt: string;
    selectedAt?: string;
    confirmedAt?: string;
}

interface ProblemSelectionProps {
    participantId: string;
    onSuccess?: () => void;
}

type ViewMode = 'INITIAL_CHOICE' | 'OPEN_INNOVATION' | 'DOMAIN_SELECTION' | 'PROBLEM_DISPLAY';

export default function ProblemSelection({ participantId, onSuccess }: ProblemSelectionProps) {
    const [assignment, setAssignment] = useState<ProblemAssignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('INITIAL_CHOICE');
    const [selectedDomain, setSelectedDomain] = useState<string>('');
    const [customProblem, setCustomProblem] = useState('');
    const [processing, setProcessing] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const { toast } = useToast();
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastFetchedIdRef = useRef<string | null>(null);

    const fetchAssignment = async () => {
        if (lastFetchedIdRef.current === participantId && assignment) return;
        if (abortControllerRef.current) abortControllerRef.current.abort();

        abortControllerRef.current = new AbortController();
        lastFetchedIdRef.current = participantId;

        try {
            const response = await fetch(`/api/participants/${participantId}/problem-assignment`, {
                signal: abortControllerRef.current.signal
            });
            const data = await response.json();

            if (response.ok) {
                setAssignment(data.assignment);
                // If already confirmed or has offered problems populated (and it's not the old single-random one, although hard to tell), show display.
                // We assume if offeredProblems > 0, we show them.
                // If user wants to reset flow, they can't unless we provide 'Back'.
                // Per requirement, if "Allocated" (meaning admin turned it on), we show choices.
                // If data.assignment.offeredProblems.length > 0, go to PROBLEM_DISPLAY
                if (data.assignment.isConfirmed) {
                    setViewMode('PROBLEM_DISPLAY');
                } else if (data.assignment.offeredProblems.length > 0) {
                    setViewMode('PROBLEM_DISPLAY');
                } else {
                    setViewMode('INITIAL_CHOICE');
                }
            } else if (response.status === 404) {
                setAssignment(null);
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (participantId) fetchAssignment();
        return () => { abortControllerRef.current?.abort(); };
    }, [participantId]);

    const handleAllocateDomain = async () => {
        if (!selectedDomain) {
            toast({ title: 'Select a Domain', description: 'Please choose a preferred domain.', variant: 'destructive' });
            return;
        }
        setProcessing(true);
        try {
            const res = await fetch(`/api/participants/${participantId}/allocate-domain-problems`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: selectedDomain })
            });
            const data = await res.json();
            if (res.ok) {
                setAssignment(data.assignment);
                setViewMode('PROBLEM_DISPLAY');
                toast({ title: 'Problems Allocated', description: `Here are your choices for ${selectedDomain}` });
            } else {
                throw new Error(data.error);
            }
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirmSelection = async () => {
        if (selectedIndex === null) return;
        setProcessing(true);
        try {
            const res = await fetch(`/api/participants/${participantId}/confirm-problem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedProblemIndex: selectedIndex, type: 'selection' })
            });
            const data = await res.json();
            if (res.ok) {
                // Optimistic update to show Confirmed screen immediately
                setAssignment(prev => prev ? ({
                    ...prev,
                    isConfirmed: true,
                    selectedProblem: data.selectedProblem,
                    confirmedAt: data.confirmedAt,
                    // If we want to hide offered problems, we can clear them, but keeping them might be useful debug info
                    // The UI checks assignment.isConfirmed && assignment.selectedProblem to show success card.
                }) : null);

                toast({ title: 'Confirmed!', description: 'Your problem statement is locked in.' });
                onSuccess?.();
                // We still fetch in background to ensure sync
                fetchAssignment();
            } else {
                throw new Error(data.error);
            }
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirmCustom = async () => {
        if (customProblem.length < 10) return;
        setProcessing(true);
        try {
            const res = await fetch(`/api/participants/${participantId}/confirm-problem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customProblem, type: 'custom' })
            });
            const data = await res.json();
            if (res.ok) {
                // Optimistic update
                setAssignment(prev => prev ? ({
                    ...prev,
                    isConfirmed: true,
                    selectedProblem: data.selectedProblem,
                    confirmedAt: data.confirmedAt
                }) : null);

                toast({ title: 'Confirmed!', description: 'Your custom problem statement is submitted.' });
                onSuccess?.();
                fetchAssignment();
            } else {
                throw new Error(data.error);
            }
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                <CardContent className="p-6 flex justify-center py-10">
                    <RefreshCw className="animate-spin text-brand-primary" />
                </CardContent>
            </Card>
        );
    }

    if (!assignment) {
        return (
            <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                <CardContent className="p-6 text-center py-10">
                    <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white">Allocation Pending</h3>
                    <p className="text-gray-400">Please wait for admin announcement.</p>
                </CardContent>
            </Card>
        );
    }

    if (assignment.isConfirmed && assignment.selectedProblem) {
        return (
            <Card className="bg-linear-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <CheckCircle2 className="w-12 h-12 text-green-500 shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">✅ Problem Statement Confirmed</h3>
                            <Badge className="mb-3 bg-green-500/20 text-green-300 border-green-500/30">
                                {assignment.selectedProblem.domain}
                            </Badge>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                {assignment.selectedProblem.problem}
                            </p>
                            <p className="text-sm text-gray-500 mt-4">
                                Domain: {assignment.selectedProblem.domain}
                            </p>
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-brand-primary font-semibold text-center italic">
                                    Wishing you all the best for the hackathon! 🚀
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // New Workflow Views
    if (viewMode === 'INITIAL_CHOICE') {
        return (
            <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Choose Your Path</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            onClick={() => setViewMode('OPEN_INNOVATION')}
                            className="p-6 border border-white/10 rounded-xl hover:bg-white/5 cursor-pointer transition-all group hover:border-brand-primary/50"
                        >
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">Open Innovation</h4>
                            <p className="text-sm text-gray-400">
                                Have a unique idea? Submit your own problem statement and work on your vision.
                            </p>
                        </div>

                        <div
                            onClick={() => setViewMode('DOMAIN_SELECTION')}
                            className="p-6 border border-white/10 rounded-xl hover:bg-white/5 cursor-pointer transition-all group hover:border-brand-primary/50"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">Choose a Domain</h4>
                            <p className="text-sm text-gray-400">
                                Select a domain and we'll allocate relevant problem statements for you to choose from.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (viewMode === 'OPEN_INNOVATION') {
        return (
            <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                    <Button variant="ghost" className="mb-4 pl-0 text-gray-400 hover:text-white" onClick={() => setViewMode('INITIAL_CHOICE')}>← Back</Button>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" /> Open Innovation
                        </h3>
                        <p className="text-gray-400 text-sm">Describe the problem you want to solve.</p>
                    </div>

                    <div className="space-y-4">
                        <Label>Problem Statement</Label>
                        <Textarea
                            placeholder="Describe your problem statement clearly (min 10 chars)..."
                            className="bg-black/20 border-white/10 min-h-[150px]"
                            value={customProblem}
                            onChange={(e) => setCustomProblem(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={handleConfirmCustom}
                                disabled={customProblem.length < 10 || processing}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {processing ? 'Submitting...' : 'Confirm Problem'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (viewMode === 'DOMAIN_SELECTION') {
        return (
            <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                    <Button variant="ghost" className="mb-4 pl-0 text-gray-400 hover:text-white" onClick={() => setViewMode('INITIAL_CHOICE')}>← Back</Button>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-400" /> Select Domain
                        </h3>
                        <p className="text-gray-400 text-sm">Choose your preferred domain to see options.</p>
                    </div>

                    <div className="space-y-6 max-w-md">
                        <div className="space-y-2">
                            <Label>Preferred Domain</Label>
                            <Select onValueChange={setSelectedDomain} value={selectedDomain}>
                                <SelectTrigger className="bg-black/20 border-white/10">
                                    <SelectValue placeholder="Select a domain" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOMAINS.map(d => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleAllocateDomain}
                            disabled={!selectedDomain || processing}
                            className="w-full bg-brand-primary text-brand-dark font-bold hover:bg-white"
                        >
                            {processing ? 'Allocating...' : 'See Problem Statements'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // PROBLEM_DISPLAY
    return (
        <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Select Your Problem</h3>
                        <p className="text-sm text-gray-400">Choose one option below. This action is final.</p>
                    </div>
                    <Badge className="bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                        {assignment.offeredProblems.length} Options
                    </Badge>
                </div>

                <div className="space-y-4 mb-6">
                    {assignment.offeredProblems.map((problem, index) => (
                        <Card
                            key={index}
                            className={`cursor-pointer transition-all ${selectedIndex === index
                                ? 'bg-brand-primary/20 border-brand-primary'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                            onClick={() => setSelectedIndex(index)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedIndex === index ? 'bg-brand-primary text-white' : 'bg-white/10 text-gray-400'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Badge className={`mb-2 text-xs border ${problem.domain === selectedDomain
                                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                            : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                            }`}>
                                            {problem.domain}
                                        </Badge>
                                        <p className="text-sm text-gray-300 leading-relaxed whitespace-normal overflow-wrap-break-word">
                                            {problem.problem}
                                        </p>
                                    </div>
                                    {selectedIndex === index && (
                                        <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-end gap-3">
                    {/* User said no refresh button needed, but maybe "Back"? 
                       The prompt says "No need for refresh button". 
                       If they want to change domain, the prompt says "if selected problem ... of other domain, update".
                       It doesn't say they can go back and re-roll the OTHER domain. 
                       So I will NOT provide a Back button here to avoid re-rolling. 
                       Once allocated, they must choose.
                    */}
                    <Button
                        onClick={handleConfirmSelection}
                        disabled={selectedIndex === null || processing}
                        className="bg-brand-primary hover:bg-brand-primary/80 w-full sm:w-auto"
                    >
                        {processing ? 'Confirming...' : 'Confirm Selection'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
