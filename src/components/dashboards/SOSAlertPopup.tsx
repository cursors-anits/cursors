'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/lib/context/DataContext';
import { AlertTriangle, Users, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const SOSAlertPopup = () => {
    const { supportRequests, updateSupportRequest } = useData();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [currentSOS, setCurrentSOS] = useState<any>(null);

    // Filter for active, UNACKNOWLEDGED SOS requests
    useEffect(() => {
        const activeSOS = supportRequests.find(
            req => req.type === 'SOS' && req.status === 'Open' && !req.acknowledged
        );

        if (activeSOS) {
            setCurrentSOS(activeSOS);
            setOpen(true);
            // Play sound if needed
            const audio = new Audio('/alarm.mp3'); // Assuming file exists or fails silently
            audio.play().catch(() => { });
        } else {
            setOpen(false);
            setCurrentSOS(null);
        }
    }, [supportRequests]);

    const handleAcknowledge = async () => {
        if (!currentSOS) return;

        try {
            // Update to acknowledged = true
            // We keep status = 'Open' so it is still visible in the list to be resolved,
            // but the popup stops screaming for everyone.
            await updateSupportRequest(currentSOS._id, 'Open', undefined, undefined, undefined, true);
            toast.success('SOS Alert Acknowledged');
            setOpen(false);
            // Refresh logic handled by DataContext update
        } catch (error) {
            toast.error('Failed to acknowledge alert');
        }
    };

    if (!currentSOS) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-red-950 border-red-500 text-white sm:max-w-md animate-pulse-subtle">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-red-600 p-2 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-white">EMERGENCY SOS</DialogTitle>
                    </div>
                    <DialogDescription className="text-red-200 text-base">
                        An emergency assistance request has been triggered.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-red-900/50 p-4 rounded-lg border border-red-500/30 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <h4 className="font-semibold text-lg text-white mb-1">
                                {currentSOS.message || "Emergency assistance requested immediately!"}
                            </h4>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex items-center gap-2 text-white/90 bg-red-900/80 p-2 rounded">
                            <Users className="w-4 h-4 text-red-300" />
                            <span className="font-semibold">Team {currentSOS.teamId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/90 bg-red-900/80 p-2 rounded">
                            <MapPin className="w-4 h-4 text-red-300" />
                            <span className="font-semibold">{currentSOS.labName}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button
                        variant="destructive"
                        size="lg"
                        className="w-full bg-white text-red-700 hover:bg-gray-100 font-bold"
                        onClick={handleAcknowledge}
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Acknowledge Alert
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full border-red-400 text-red-100 hover:bg-red-900 hover:text-white"
                        onClick={() => {
                            setOpen(false);
                            const params = new URLSearchParams(window.location.search);
                            params.set('view', 'requests'); // For Coordinator
                            router.push(`${window.location.pathname}?${params.toString()}`);
                        }}
                    >
                        View Details
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
