'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

export default function ProblemSelection({ participantId }: ProblemSelectionProps) {
    const [assignment, setAssignment] = useState<ProblemAssignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const { toast } = useToast();

    const fetchAssignment = async () => {
        try {
            const response = await fetch(`/api/participants/${participantId}/problem-assignment`);
            const data = await response.json();

            if (response.ok) {
                setAssignment(data.assignment);
            } else if (response.status === 404) {
                // No assignment yet
                setAssignment(null);
            } else {
                throw new Error(data.error || 'Failed to fetch assignment');
            }
        } catch (error) {
            console.error('Error fetching assignment:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to load problem assignment',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignment();
    }, [participantId]);

    const handleRefresh = async () => {
        if (!assignment || !assignment.canRefresh) return;

        setRefreshing(true);
        try {
            const response = await fetch(`/api/participants/${participantId}/refresh-problems`, {
                method: 'POST'
            });

            const data = await response.json();

            if (response.ok) {
                setAssignment(data.assignment);
                setSelectedIndex(null);
                toast({
                    title: 'Problems Refreshed',
                    description: `You have ${data.assignment.maxRefreshes - data.assignment.refreshCount} refresh(es) remaining`
                });
            } else {
                throw new Error(data.error || 'Failed to refresh');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to refresh problems',
                variant: 'destructive'
            });
        } finally {
            setRefreshing(false);
        }
    };

    const handleConfirm = async () => {
        if (selectedIndex === null || !assignment) return;

        setConfirming(true);
        try {
            const response = await fetch(`/api/participants/${participantId}/confirm-problem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedProblemIndex: selectedIndex })
            });

            const data = await response.json();

            if (response.ok) {
                await fetchAssignment(); // Refresh to get updated state
                toast({
                    title: 'Problem Confirmed!',
                    description: 'Your problem statement has been confirmed. Good luck! 🚀'
                });
            } else {
                throw new Error(data.error || 'Failed to confirm');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to confirm selection',
                variant: 'destructive'
            });
        } finally {
            setConfirming(false);
        }
    };

    if (loading) {
        return (
            <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-brand-primary" />
                        <span className="ml-2 text-gray-400">Loading problem assignment...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // State 1: Not Allocated Yet
    if (!assignment) {
        return (
            <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                    <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Problem Statement Allocation</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Your problem statements will be allocated when the hackathon begins.
                            Please wait for admin announcement.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // State 3: Confirmed
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
                            <p className="text-gray-300 leading-relaxed">
                                {assignment.selectedProblem.problem}
                            </p>
                            <p className="text-sm text-gray-500 mt-4">
                                Good luck with your project! 🚀
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // State 2: Allocated - Awaiting Selection
    return (
        <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">🎯 Choose Your Problem Statement</h3>
                    <Badge className="bg-brand-primary/20 text-brand-primary border-brand-primary/30">
                        Refreshes: {assignment.refreshCount}/{assignment.maxRefreshes}
                    </Badge>
                </div>

                <p className="text-gray-400 mb-6">
                    Select ONE problem from the 3 options below:
                </p>

                <div className="space-y-4 mb-6">
                    {assignment.offeredProblems.map((problem, index) => (
                        <Card
                            key={index}
                            className={`cursor-pointer transition-all ${selectedIndex === index
                                    ? 'bg-brand-primary/20 border-brand-primary'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                            onClick={() => !assignment.isConfirmed && setSelectedIndex(index)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedIndex === index ? 'bg-brand-primary text-white' : 'bg-white/10 text-gray-400'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Badge className="mb-2 bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
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

                <div className="flex gap-3">
                    <Button
                        onClick={handleRefresh}
                        disabled={!assignment.canRefresh || refreshing}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh Options'}
                    </Button>

                    <Button
                        onClick={handleConfirm}
                        disabled={selectedIndex === null || confirming}
                        className="flex-1 bg-brand-primary hover:bg-brand-primary/80"
                    >
                        {confirming ? 'Confirming...' : 'Confirm Selection'}
                    </Button>
                </div>

                {!assignment.canRefresh && assignment.refreshCount >= assignment.maxRefreshes && (
                    <div className="mt-4 flex items-start gap-2 text-xs text-yellow-400">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>Refresh limit reached. Please select one of the current options.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
