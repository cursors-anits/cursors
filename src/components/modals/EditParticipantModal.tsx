'use client';

import React, { useState } from 'react';
import { Participant } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
    participant: Participant | null;
    onSave: (updates: Partial<Participant>) => Promise<void>;
}

export const EditParticipantModal: React.FC<EditParticipantModalProps> = ({
    isOpen,
    onClose,
    participant,
    onSave,
}) => {
    const [formData, setFormData] = useState<Partial<Participant>>({});
    const [isSaving, setIsSaving] = useState(false);

    React.useEffect(() => {
        if (participant) {
            setFormData({
                name: participant.name,
                email: participant.email,
                college: participant.college,
                department: participant.department,
                whatsapp: participant.whatsapp,
                year: participant.year,
                generatedEmail: participant.generatedEmail,
                passkey: participant.passkey,
            });
        }
    }, [participant]);

    const handleSave = async () => {
        if (!participant) return;
        setIsSaving(true);
        try {
            await onSave({ _id: participant._id, ...formData } as Participant);
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    if (!participant) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-brand-surface border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Edit Participant</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Update participant information. Team ID and Type cannot be changed.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
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

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-brand-dark border-white/10"
                        />
                    </div>

                    {/* College */}
                    <div className="space-y-2">
                        <Label htmlFor="college">College *</Label>
                        <Input
                            id="college"
                            value={formData.college || ''}
                            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                            className="bg-brand-dark border-white/10"
                        />
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label htmlFor="department">Department *</Label>
                        <Input
                            id="department"
                            value={formData.department || ''}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="bg-brand-dark border-white/10"
                        />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                        <Input
                            id="whatsapp"
                            value={formData.whatsapp || ''}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                            className="bg-brand-dark border-white/10"
                            placeholder="10-digit number"
                        />
                    </div>

                    {/* Year */}
                    <div className="space-y-2">
                        <Label htmlFor="year">Year *</Label>
                        <Select
                            value={formData.year?.toString() || ''}
                            onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}
                        >
                            <SelectTrigger className="bg-brand-dark border-white/10">
                                <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent className="bg-brand-surface border-white/10">
                                <SelectItem value="1">1st Year</SelectItem>
                                <SelectItem value="2">2nd Year</SelectItem>
                                <SelectItem value="3">3rd Year</SelectItem>
                                <SelectItem value="4">4th Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Generated Email (Read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="generatedEmail">Generated Email</Label>
                        <Input
                            id="generatedEmail"
                            value={formData.generatedEmail || ''}
                            onChange={(e) => setFormData({ ...formData, generatedEmail: e.target.value })}
                            className="bg-brand-dark border-white/10"
                        />
                    </div>

                    {/* Passkey (Read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="passkey">Passkey</Label>
                        <Input
                            id="passkey"
                            value={formData.passkey || ''}
                            onChange={(e) => setFormData({ ...formData, passkey: e.target.value })}
                            className="bg-brand-dark border-white/10 font-mono"
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
