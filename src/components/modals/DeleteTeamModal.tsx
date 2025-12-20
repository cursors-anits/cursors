'use client';

import React from 'react';
import { Participant } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamData: { teamId: string; members: Participant[] } | null;
    selectedMembers: Set<string>;
    onToggleMember: (memberId: string) => void;
    onDeleteSelected: () => void;
    onDeleteAll: () => void;
}

export const DeleteTeamModal: React.FC<DeleteTeamModalProps> = ({
    isOpen,
    onClose,
    teamData,
    selectedMembers,
    onToggleMember,
    onDeleteSelected,
    onDeleteAll,
}) => {
    if (!teamData) return null;

    const selectedCount = selectedMembers.size;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-brand-surface border-white/10 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        Delete Team Members - {teamData.teamId}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Select members to delete or delete the entire team. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
                    {teamData.members.map((member) => (
                        <div
                            key={member._id}
                            className="flex items-center gap-3 p-3 bg-brand-dark rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <Checkbox
                                checked={selectedMembers.has(member._id)}
                                onCheckedChange={() => onToggleMember(member._id)}
                            />
                            <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Name:</span>
                                    <span className="text-white ml-2">{member.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Email:</span>
                                    <span className="text-gray-300 ml-2 text-xs">{member.email}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onClose} className="border-white/10">
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onDeleteSelected}
                        disabled={selectedCount === 0}
                        className="bg-orange-500 hover:bg-orange-600"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected ({selectedCount})
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onDeleteAll}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete All ({teamData.members.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
