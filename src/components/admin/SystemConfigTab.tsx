'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Lock, Globe, Zap, AlertTriangle, Settings2, ShieldAlert, Info, Calendar, Trophy, CreditCard, Server, Power } from 'lucide-react';

export default function SystemConfigTab() {
    const { settings, updateSettings, allocateLabs, processEmailQueue } = useData();
    const [config, setConfig] = useState({
        workshopLimit: settings?.bufferConfig?.workshopLimit || 300,
        hackathonLimit: settings?.bufferConfig?.hackathonLimit || 500,
        workshopBuffer: settings?.bufferConfig?.workshopBuffer || 50,
        hackathonBuffer: settings?.bufferConfig?.hackathonBuffer || 100,
        workshopCount: settings?.fomoConfig?.workshopCount || 284,
        hackathonCount: settings?.fomoConfig?.hackathonCount || 488
    });

    const handleSaveBuffer = async () => {
        try {
            await updateSettings({
                bufferConfig: {
                    workshopLimit: Number(config.workshopLimit),
                    hackathonLimit: Number(config.hackathonLimit),
                    workshopBuffer: Number(config.workshopBuffer),
                    hackathonBuffer: Number(config.hackathonBuffer)
                }
            });
            toast.success('Buffer limits updated');
        } catch (e) {
            toast.error('Failed to update buffer limits');
        }
    };

    const handleSaveFomo = async () => {
        try {
            await updateSettings({
                fomoConfig: {
                    workshopCount: Number(config.workshopCount),
                    hackathonCount: Number(config.hackathonCount),
                    showFakeCounts: settings?.fomoConfig?.showFakeCounts ?? true
                }
            });
            toast.success('FOMO counts updated');
        } catch (e) {
            toast.error('Failed to update FOMO counts');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Global Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-brand-surface border-white/5 p-6">
                    <CardHeader className="px-0 pt-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Maintenance Mode</CardTitle>
                                <CardDescription>Restrict all public access</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 pt-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                            <div>
                                <p className="font-medium">System State</p>
                                <p className="text-xs text-gray-400">Currently {settings?.maintenanceMode ? 'Active' : 'Disabled'}</p>
                            </div>
                            <Button
                                onClick={() => updateSettings({ maintenanceMode: !settings?.maintenanceMode })}
                                variant={settings?.maintenanceMode ? "destructive" : "outline"}
                                className={!settings?.maintenanceMode ? "border-blue-500/20 text-blue-400" : ""}
                            >
                                {settings?.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-brand-surface border-white/5 p-6">
                    <CardHeader className="px-0 pt-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Internships</CardTitle>
                                <CardDescription>Show internship opportunities</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 pt-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                            <div>
                                <p className="font-medium">Feature Visibility</p>
                                <p className="text-xs text-gray-400">Currently {settings?.showInternships ? 'Visible' : 'Hidden'}</p>
                            </div>
                            <Button
                                onClick={() => updateSettings({ showInternships: !settings?.showInternships })}
                                variant={settings?.showInternships ? "destructive" : "outline"}
                                className={!settings?.showInternships ? "border-brand-primary/20 text-brand-primary" : ""}
                            >
                                {settings?.showInternships ? 'Hide Feature' : 'Show Feature'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-brand-surface border-white/5 p-6">
                    <CardHeader className="px-0 pt-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                <Power className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Registration</CardTitle>
                                <CardDescription>Control event registration status</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 pt-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                            <div>
                                <p className="font-medium">Registration Status</p>
                                <p className="text-xs text-gray-400">Currently {settings?.registrationClosed ? 'Closed' : 'Open'}</p>
                            </div>
                            <Switch
                                checked={!settings?.registrationClosed}
                                onCheckedChange={(checked) => updateSettings({ registrationClosed: !checked })}
                                className="data-[state=checked]:bg-green-500"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Event Configuration */}
            <Card className="bg-brand-surface border-white/5 p-6">
                <CardHeader className="px-0 pt-0 border-b border-white/5 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Event Details</CardTitle>
                            <CardDescription>Main event timing and prize pool settings</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">Event Start Date</Label>
                            <Input
                                type="datetime-local"
                                className="bg-brand-dark/50 border-white/10"
                                defaultValue={settings?.eventDate ? new Date(settings.eventDate).toISOString().slice(0, 16) : ''}
                                onBlur={(e) => updateSettings({ eventDate: new Date(e.target.value) })}
                            />
                            <p className="text-[10px] text-gray-500">Affects landing page countdown.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">Total Prize Pool</Label>
                            <Input
                                defaultValue={settings?.prizePool}
                                onBlur={(e) => updateSettings({ prizePool: e.target.value })}
                                className="bg-brand-dark/50 border-white/10"
                                placeholder="₹60,000"
                            />
                            <p className="text-[10px] text-gray-500">Shown on hero section.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Settings */}
            <Card className="bg-brand-surface border-white/5 p-6">
                <CardHeader className="px-0 pt-0 border-b border-white/5 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Payment Settings</CardTitle>
                            <CardDescription>Configure payment gateway details</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">UPI ID</Label>
                            <Input
                                defaultValue={settings?.upiId}
                                onBlur={(e) => updateSettings({ upiId: e.target.value })}
                                className="bg-brand-dark/50 border-white/10"
                                placeholder="merchant@upi"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">QR Code URL</Label>
                            <Input
                                defaultValue={settings?.qrImageUrl}
                                onBlur={(e) => updateSettings({ qrImageUrl: e.target.value })}
                                className="bg-brand-dark/50 border-white/10"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Buffer Configuration */}
            <Card className="bg-brand-surface border-white/5 p-6">
                <CardHeader className="px-0 pt-0 border-b border-white/5 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Registration Limits & Buffer</CardTitle>
                            <CardDescription>Configure when registration switches to 'Request Mode'</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Workshop Config */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wider">Workshop</h3>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="flex items-center gap-2">
                                        Soft Limit (Open Reg)
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-3 h-3 text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-black border border-white/10 text-white">
                                                    <p>Registration remains fully open until this count.</p>
                                                    <p>After this, it switches to 'Request' mode.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Label>
                                    <Input
                                        type="number"
                                        value={config.workshopLimit}
                                        onChange={(e) => setConfig({ ...config, workshopLimit: Number(e.target.value) })}
                                        className="bg-brand-dark/50 border-white/10"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="flex items-center gap-2">Buffer Size</Label>
                                    <Input
                                        type="number"
                                        value={config.workshopBuffer}
                                        onChange={(e) => setConfig({ ...config, workshopBuffer: Number(e.target.value) })}
                                        className="bg-brand-dark/50 border-white/10"
                                    />
                                    <p className="text-[10px] text-gray-500">
                                        Requests accepted up to {Number(config.workshopLimit) + Number(config.workshopBuffer)} total participants.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hackathon Config */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wider">Hackathon</h3>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="flex items-center gap-2">
                                        Soft Limit (Open Reg)
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-3 h-3 text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-black border border-white/10 text-white">
                                                    <p>Registration remains fully open until this count.</p>
                                                    <p>After this, it switches to 'Request' mode.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Label>
                                    <Input
                                        type="number"
                                        value={config.hackathonLimit}
                                        onChange={(e) => setConfig({ ...config, hackathonLimit: Number(e.target.value) })}
                                        className="bg-brand-dark/50 border-white/10"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="flex items-center gap-2">Buffer Size</Label>
                                    <Input
                                        type="number"
                                        value={config.hackathonBuffer}
                                        onChange={(e) => setConfig({ ...config, hackathonBuffer: Number(e.target.value) })}
                                        className="bg-brand-dark/50 border-white/10"
                                    />
                                    <p className="text-[10px] text-gray-500">
                                        Requests accepted up to {Number(config.hackathonLimit) + Number(config.hackathonBuffer)} total participants.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/5">
                        <Button onClick={handleSaveBuffer} className="bg-brand-primary text-brand-dark">
                            Save Buffer Configuration
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* FOMO Config */}
            <Card className="bg-brand-surface border-white/5 p-6">
                <CardHeader className="px-0 pt-0 border-b border-white/5 pb-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                <Settings2 className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">FOMO Configuration</CardTitle>
                                <CardDescription>Manage fake popularity counters</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="fake-counts" className="text-sm font-medium text-gray-300">Enable Fake Counts</Label>
                            <Switch
                                id="fake-counts"
                                checked={settings?.fomoConfig?.showFakeCounts}
                                onCheckedChange={(checked) => updateSettings({
                                    fomoConfig: {
                                        workshopCount: settings?.fomoConfig?.workshopCount ?? 284,
                                        hackathonCount: settings?.fomoConfig?.hackathonCount ?? 488,
                                        showFakeCounts: checked
                                    }
                                })}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label>Workshop Fake Count</Label>
                            <Input
                                type="number"
                                value={config.workshopCount}
                                onChange={(e) => setConfig({ ...config, workshopCount: Number(e.target.value) })}
                                className="bg-brand-dark/50 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Hackathon Fake Count</Label>
                            <Input
                                type="number"
                                value={config.hackathonCount}
                                onChange={(e) => setConfig({ ...config, hackathonCount: Number(e.target.value) })}
                                className="bg-brand-dark/50 border-white/10"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSaveFomo} variant="outline" className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10">
                            Update Fake Counts
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* System Actions */}
            <Card className="bg-brand-surface p-6 border-red-500">
                <CardHeader className="px-0 pt-0 border-b border-white/5 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                            <Server className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-red-400">System Actions</CardTitle>
                            <CardDescription>Critical system operations</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            onClick={() => allocateLabs('Workshop')}
                            variant="outline"
                            className="w-full justify-start h-auto p-4 border-white/5 hover:bg-white/5 hover:border-white/10"
                        >
                            <div className="flex flex-col items-start gap-1">
                                <span className="font-medium flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    Allocate Workshops
                                </span>
                                <span className="text-xs text-gray-400">Run auto-allocation for workshop labs</span>
                            </div>
                        </Button>

                        <Button
                            onClick={() => processEmailQueue()}
                            variant="outline"
                            className="w-full justify-start h-auto p-4 border-white/5 hover:bg-white/5 hover:border-white/10"
                        >
                            <div className="flex flex-col items-start gap-1">
                                <span className="font-medium flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-400" />
                                    Process Emails
                                </span>
                                <span className="text-xs text-gray-400">Force process the email queue</span>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
