import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Participant } from '@/types'; // Assuming types are here or use 'any' if generic

interface EditParticipantDialogProps {
    isOpen: boolean;
    onClose: () => void;
    participant: Participant; // Type as Participant if available
    onSuccess: () => void;
}

export function EditParticipantDialog({ isOpen, onClose, participant, onSuccess }: EditParticipantDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        teamId: '',
        college: '',
        ticketType: '',
        paymentStatus: 'pending', // derived usually
        paymentScreenshotUrl: ''
    });

    useEffect(() => {
        if (participant) {
            setFormData({
                name: participant.name || '',
                email: participant.email || '',
                whatsapp: participant.whatsapp || '',
                teamId: participant.teamId || '',
                college: participant.college || '',
                ticketType: participant.ticketType || 'online',
                paymentStatus: participant.paymentScreenshotUrl ? 'paid' : 'pending',
                paymentScreenshotUrl: participant.paymentScreenshotUrl || ''
            });
        }
    }, [participant]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/participants/${participant._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to update participant');

            toast.success('Participant updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update participant');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-brand-surface border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Participant</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Make changes to the participant's profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right text-gray-400">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="col-span-3 bg-white/5 border-white/10"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right text-gray-400">Email</Label>
                        <Input
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="col-span-3 bg-white/5 border-white/10"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="whatsapp" className="text-right text-gray-400">Phone</Label>
                        <Input
                            id="whatsapp"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                            className="col-span-3 bg-white/5 border-white/10"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="teamId" className="text-right text-gray-400">Team ID</Label>
                        <Input
                            id="teamId"
                            value={formData.teamId}
                            onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                            className="col-span-3 bg-white/5 border-white/10"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="college" className="text-right text-gray-400">College</Label>
                        <Input
                            id="college"
                            value={formData.college}
                            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                            className="col-span-3 bg-white/5 border-white/10"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ticketType" className="text-right text-gray-400">Type</Label>
                        <Select
                            value={formData.ticketType}
                            onValueChange={(val) => setFormData({ ...formData, ticketType: val })}
                        >
                            <SelectTrigger className="col-span-3 bg-white/5 border-white/10">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-brand-surface border-white/10">
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="Hackathon">Hackathon (Offline)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="border-white/10 hover:bg-white/5">Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-brand-primary text-brand-dark hover:bg-white">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
