'use client';

import React, { useState, useEffect } from 'react';
import { Coordinator } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditCoordinatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    coordinator: Coordinator | null;
    onSave: (updates: Coordinator) => Promise<void>;
}

export const EditCoordinatorModal: React.FC<EditCoordinatorModalProps> = ({
    isOpen,
    onClose,
    coordinator,
    onSave,
}) => {
    const [formData, setFormData] = useState<Partial<Coordinator>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (coordinator) {
            setFormData({
                name: coordinator.name,
                email: coordinator.email,
                role: coordinator.role,
                assigned: coordinator.assigned,
                assignedLab: coordinator.assignedLab,
            });
        }
    }, [coordinator]);

    const handleSave = async () => {
        if (!coordinator) return;
        setIsSaving(true);
        try {
            await onSave({ _id: coordinator._id, ...formData } as Coordinator);
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    if (!coordinator) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-brand-surface border-white/10 text-white max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl">Edit Coordinator</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Update coordinator information.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-brand-dark border-white/10"
                        />
                    </div>

                    {/* Generated Email (Read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="generatedEmail">Generated Email (Login)</Label>
                        <Input
                            id="generatedEmail"
                            value={formData.email || ''}
                            className="bg-brand-dark/50 border-white/10 text-gray-400"
                            disabled
                            readOnly
                        />
                        <p className="text-xs text-gray-500">This is the @vibe.com email used for login</p>
                    </div>

                    {/* Role and Assigned */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Staff Role</Label>
                            <Select
                                value={formData.role?.toLowerCase() || 'coordinator'}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger className="bg-brand-dark border-white/10">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-brand-surface border-white/10">
                                    <SelectItem value="coordinator">Coordinator</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="faculty">Faculty</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="assigned">Assigned To (Lab/Task)</Label>
                            <Input
                                id="assigned"
                                value={formData.assigned || ''}
                                onChange={(e) => setFormData({ ...formData, assigned: e.target.value })}
                                className="bg-brand-dark border-white/10"
                            />
                        </div>
                    </div>

                    {/* Assigned Lab */}
                    <div className="space-y-2">
                        <Label htmlFor="assignedLab">Assigned Lab</Label>
                        <Input
                            id="assignedLab"
                            value={formData.assignedLab || ''}
                            onChange={(e) => setFormData({ ...formData, assignedLab: e.target.value })}
                            className="bg-brand-dark border-white/10"
                            placeholder="e.g., Lab 1"
                        />
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onClose} className="border-white/10">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !formData.name || !formData.email}
                        className="bg-brand-primary text-brand-dark hover:bg-white"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
