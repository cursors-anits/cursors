'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/context/DataContext';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Participant } from '@/types';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PendingRequestsTab() {
    const { participants, updateParticipant } = useData();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const pendingParticipants = participants.filter(p => p.status === 'pending');

    const handleApprove = async (participant: Participant) => {
        setProcessingId(participant._id);
        try {
            // Update status to approved
            // In a real app, this might also trigger an email with payment link
            await updateParticipant({ ...participant, status: 'approved' });
            toast.success(`Approved ${participant.name}`);

            // Send email notification (mock or real endpoint)
            await fetch('/api/admin/send-approval-email', {
                method: 'POST',
                body: JSON.stringify({ email: participant.email, name: participant.name, teamId: participant.teamId })
            });

        } catch (error) {
            toast.error('Failed to approve request');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (participant: Participant) => {
        if (!confirm('Are you sure you want to reject this request?')) return;
        setProcessingId(participant._id);
        try {
            await updateParticipant({ ...participant, status: 'rejected' });
            toast.success(`Rejected ${participant.name}`);
        } catch (error) {
            toast.error('Failed to reject request');
        } finally {
            setProcessingId(null);
        }
    };

    const columns: ColumnDef<Participant>[] = [
        {
            accessorKey: "name",
            header: "Participant",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-white">{row.original.name}</div>
                    <div className="text-xs text-gray-500">{row.original.email}</div>
                </div>
            )
        },
        {
            accessorKey: "college",
            header: "College",
            cell: ({ row }) => <span className="text-xs text-gray-400">{row.getValue("college")}</span>
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="outline" className="text-[10px] border-white/10">
                    {row.getValue("type")}
                </Badge>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Requested At",
            cell: ({ row }) => <span className="text-xs text-gray-500">{new Date(row.original.createdAt).toLocaleString()}</span>
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const p = row.original;
                const isProcessing = processingId === p._id;
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            onClick={() => handleApprove(p)}
                            disabled={isProcessing}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => handleReject(p)}
                            disabled={isProcessing}
                        >
                            <XCircle className="w-4 h-4" />
                        </Button>
                    </div>
                );
            }
        }
    ];

    // Group by Team for display? Or flat list? 
    // Request is usually per team if they register as team.
    // Logic: If one member is approved, usually whole team is approved?
    // For now, let's keep individual approval or we can group.
    // Given the data structure, we might want to approve generically.
    // Let's stick to simple individual table for now.

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-brand-surface border-white/5">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle>Pending Requests</CardTitle>
                            <CardDescription>Review and approve registration requests from buffer mode</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {pendingParticipants.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No pending requests at the moment.
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={pendingParticipants}
                            searchKey="name"
                            placeholder="Search requests..."
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
