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
import { Lock, Globe, Zap, AlertTriangle, Settings2, ShieldAlert, Info, Calendar, Trophy, CreditCard, Server, Power, Clock, AlertCircle } from 'lucide-react';

export default function SystemConfigTab() {
    const { settings, updateSettings, allocateLabs, processEmailQueue } = useData();
    const [config, setConfig] = useState({
        hackathonLimit: settings?.bufferConfig?.hackathonLimit || 500,
        hackathonBuffer: settings?.bufferConfig?.hackathonBuffer || 100,
        hackathonCount: settings?.fomoConfig?.hackathonCount || 488,
    });

    const handleSaveBuffer = async () => {
        try {
            await updateSettings({
                bufferConfig: {
                    hackathonLimit: Number(config.hackathonLimit),
                    hackathonBuffer: Number(config.hackathonBuffer),
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
                {/* Hackathon Timeline */}
                <Card className="bg-brand-surface border-white/5 p-6">
                    <CardHeader className="px-0 pt-0 border-b border-white/5 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Hackathon Timeline</CardTitle>
                                <CardDescription>Event duration and submission controls</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wider">Event Duration</h3>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="flex items-center gap-2">Hackathon Start</Label>
                                        <Input
                                            type="datetime-local"
                                            className="bg-brand-dark/50 border-white/10"
                                            defaultValue={settings?.hackathonStartDate ? new Date(new Date(settings.hackathonStartDate).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                                            onBlur={(e) => updateSettings({ hackathonStartDate: new Date(e.target.value) })}
                                        />
                                        <p className="text-[10px] text-gray-500">Validation checks repo age against this date.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="flex items-center gap-2">Hackathon End</Label>
                                        <Input
                                            type="datetime-local"
                                            className="bg-brand-dark/50 border-white/10"
                                            defaultValue={settings?.hackathonEndDate ? new Date(new Date(settings.hackathonEndDate).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                                            onBlur={(e) => updateSettings({ hackathonEndDate: new Date(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wider">Submission Window</h3>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="font-medium">Accepting Submissions</p>
                                        <p className="text-xs text-gray-400">
                                            {settings?.submissionWindowOpen ? 'Window Open (1 hour timer active)' : 'Window Closed'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings?.submissionWindowOpen}
                                        onCheckedChange={(checked) => updateSettings({
                                            submissionWindowOpen: checked,
                                            submissionWindowStartTime: checked ? new Date() : undefined // Set start time when opened
                                        })}
                                        className="data-[state=checked]:bg-green-500"
                                    />
                                </div>
                                {settings?.submissionWindowOpen && settings.submissionWindowStartTime && (
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                        <div className="flex items-center gap-2 text-yellow-400 mb-1">
                                            <AlertCircle className="w-4 h-4" />
                                            <span className="text-sm font-bold">Window Closes At</span>
                                        </div>
                                        <p className="text-sm text-yellow-200">
                                            {new Date(new Date(settings.submissionWindowStartTime).getTime() + 60 * 60 * 1000).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
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
                                defaultValue={settings?.eventDate ? new Date(new Date(settings.eventDate).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
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
                    <div className="grid grid-cols-1 gap-8">

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
