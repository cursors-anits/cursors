'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Zap,
    CheckCircle2,
    Clock,
    RefreshCw,
    Users,
    AlertCircle,
    FileCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PROBLEM_STATEMENTS } from '@/lib/data/problemStatements';

interface AllocationStats {
    total: number;
    allocated: number;
    confirmed: number;
    pending: number;
    totalRefreshes?: number;
    avgRefreshes?: number;
}

interface ProblemAllocationTabProps {
    adminEmail: string;
}

export default function ProblemAllocationTab({ adminEmail }: ProblemAllocationTabProps) {
    const [stats, setStats] = useState<AllocationStats | null>(null);
    const [allocating, setAllocating] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/allocation-stats');
            const data = await response.json();

            if (response.ok) {
                setStats(data.stats);
            } else {
                throw new Error(data.error || 'Failed to fetch stats');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast({
                title: 'Error',
                description: 'Failed to load allocation statistics',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleAllocate = async () => {
        setAllocating(true);
        try {
            const response = await fetch('/api/admin/allocate-problems', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminEmail })
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: 'Success!',
                    description: `Allocated problem statements to ${data.allocated} participants`
                });
                await fetchStats();
            } else {
                throw new Error(data.error || 'Failed to allocate');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to allocate problems',
                variant: 'destructive'
            });
        } finally {
            setAllocating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-primary" />
                <span className="ml-2 text-gray-400">Loading allocation data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Problem Statement Allocation</h2>
                <p className="text-gray-400">
                    Allocate problem statements to all participants with assigned seats
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-gray-400">Total Participants</p>
                                <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Zap className="w-8 h-8 text-yellow-500" />
                            <div>
                                <p className="text-sm text-gray-400">Allocated</p>
                                <p className="text-2xl font-bold text-white">{stats?.allocated || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                            <div>
                                <p className="text-sm text-gray-400">Confirmed</p>
                                <p className="text-2xl font-bold text-white">{stats?.confirmed || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="w-8 h-8 text-orange-500" />
                            <div>
                                <p className="text-sm text-gray-400">Pending</p>
                                <p className="text-2xl font-bold text-white">{stats?.pending || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Allocation Control */}
            <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">Allocate Problem Statements</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                This will assign 3 problem statement options to each participant based on their seat assignments.
                                Neighboring participants will receive different problems.
                            </p>

                            {stats && stats.allocated > 0 && (
                                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
                                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                    <div className="text-sm text-yellow-300">
                                        <p className="font-semibold">Warning:</p>
                                        <p>Problem statements have already been allocated to {stats.allocated} participants.</p>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleAllocate}
                                disabled={allocating || (stats !== null && stats.allocated > 0)}
                                className="bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-50"
                                size="lg"
                            >
                                {allocating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Allocating...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Allocate Problems
                                    </>
                                )}
                            </Button>
                        </div>
                        <FileCheck className="w-16 h-16 text-brand-primary opacity-20" />
                    </div>
                </CardContent>
            </Card>

            {/* Instructions - How It Works */}
            <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-white mb-3">How It Works</h3>
                    <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-start gap-2">
                            <span className="text-brand-primary font-bold">1.</span>
                            <p>System checks all participants with assigned seats</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-brand-primary font-bold">2.</span>
                            <p>Allocates 3 random problem statements to each participant</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-brand-primary font-bold">3.</span>
                            <p>Ensures neighboring seats receive different problems</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-brand-primary font-bold">4.</span>
                            <p>Participants can view their options and select one</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-brand-primary font-bold">5.</span>
                            <p>Each participant gets 2 refreshes to get new options</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Problem Statements Display */}
            <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4">All Problem Statements</h3>
                    <div className="space-y-4">
                        {PROBLEM_STATEMENTS.map((domain, domainIdx) => (
                            <div key={domainIdx} className="border border-white/10 rounded-lg p-4 bg-white/5">
                                <h4 className="font-semibold text-brand-primary mb-3">{domain.domain}</h4>
                                <div className="space-y-2">
                                    {domain.problems.map((problem, problemIdx) => (
                                        <div key={problemIdx} className="text-sm text-gray-300 pl-4 py-1">
                                            <span className="text-gray-500 mr-2">{domainIdx + 1}.{problemIdx + 1}</span>
                                            {problem}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
