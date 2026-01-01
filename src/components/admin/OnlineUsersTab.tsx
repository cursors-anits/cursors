import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Users, IndianRupee, Save, RefreshCw, Globe, Search, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { EditParticipantDialog } from '@/components/modals/EditParticipantDialog';

export const OnlineUsersTab = () => {
    const { participants, settings, updateSettings, isLoading, fetchParticipants } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingParticipant, setEditingParticipant] = useState<any>(null);

    // Local state for settings to avoid jitter

    // Local state for settings to avoid jitter
    const [localSettings, setLocalSettings] = useState({
        onlineBasePrice: settings?.onlineBasePrice || 199,
        onlineUpiId: settings?.onlineUpiId || '',
        onlineQrImageUrl: settings?.onlineQrImageUrl || '',
        onlineRegistrationOpen: settings?.onlineRegistrationOpen ?? true,
        onlineProblemSelectionOpen: settings?.onlineProblemSelectionOpen ?? false,
        onlineSubmissionOpen: settings?.onlineSubmissionOpen ?? false,
        prizePool: settings?.prizePool || '',
        hackathonCount: settings?.fomoConfig?.hackathonCount || 200,
        onlineWhatsappUrl: settings?.onlineWhatsappUrl || ''
    });

    // Pagination & Filters State
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
    const ITEMS_PER_PAGE = 10;

    // Update local state when settings change from context
    React.useEffect(() => {
        if (settings) {
            setLocalSettings({
                onlineBasePrice: settings.onlineBasePrice || 199,
                onlineUpiId: settings.onlineUpiId || '',
                onlineQrImageUrl: settings.onlineQrImageUrl || '',
                onlineRegistrationOpen: settings.onlineRegistrationOpen ?? true,
                onlineProblemSelectionOpen: settings.onlineProblemSelectionOpen ?? false,
                onlineSubmissionOpen: settings.onlineSubmissionOpen ?? false,
                prizePool: settings.prizePool || '',
                hackathonCount: settings.fomoConfig?.hackathonCount || 200,
                onlineWhatsappUrl: settings.onlineWhatsappUrl || ''
            });
        }
    }, [settings]);

    const handleSaveSettings = async () => {
        try {
            await updateSettings({
                ...localSettings,
                fomoConfig: {
                    ...settings?.fomoConfig,
                    hackathonCount: localSettings.hackathonCount,
                    showFakeCounts: settings?.fomoConfig?.showFakeCounts ?? true,
                    fomoDecayRate: settings?.fomoConfig?.fomoDecayRate,
                    fomoDecayStart: settings?.fomoConfig?.fomoDecayStart
                }
            });
            toast.success('Online settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    const onlineParticipants = useMemo(() => {
        return participants.filter(p => !p.isManual && (p.ticketType === 'online' || p.type === 'Online'));
    }, [participants]);

    const filteredParticipants = useMemo(() => {
        let filtered = onlineParticipants.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.teamId.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => {
                const isPaid = !!p.paymentScreenshotUrl;
                return statusFilter === 'paid' ? isPaid : !isPaid;
            });
        }

        return filtered;
    }, [onlineParticipants, searchQuery, statusFilter]);

    const paginatedParticipants = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredParticipants.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredParticipants, currentPage]);

    const totalPages = Math.ceil(filteredParticipants.length / ITEMS_PER_PAGE);

    const analytics = useMemo(() => {
        const total = onlineParticipants.length;
        const paidCount = onlineParticipants.filter(p => p.paymentScreenshotUrl).length;
        const revenue = onlineParticipants.reduce((acc, p) => {
            if (p.paymentScreenshotUrl) return acc + (p.amountPaid || settings?.onlineBasePrice || 199);
            return acc;
        }, 0);

        return { total, paidCount, revenue };
    }, [onlineParticipants, settings]);

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Globe className="w-6 h-6 text-brand-primary" />
                        Online Users Management
                    </h2>
                    <p className="text-gray-400">Manage remote participants and exclusive settings</p>
                </div>
                <Button onClick={() => fetchParticipants(false)} variant="outline" className="border-white/10 bg-white/5">
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-brand-surface border-blue-500/20">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Total Online Users</p>
                            <h3 className="text-3xl font-bold text-white">{analytics.total}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <Users className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-brand-surface border-green-500/20">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Verified Payments</p>
                            <h3 className="text-3xl font-bold text-white">{analytics.paidCount}</h3>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                            <Save className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-brand-surface border-yellow-500/20">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Estimated Revenue</p>
                            <h3 className="text-3xl font-bold text-white">₹{analytics.revenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings Section */}
                <Card className="bg-brand-surface border-white/10 lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Global Settings</CardTitle>
                        <CardDescription>Configuration for online mode</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-brand-dark/50 rounded-lg border border-white/5">
                            <Label className="cursor-pointer" htmlFor="online-toggle">Accept Registrations</Label>
                            <Switch
                                id="online-toggle"
                                checked={localSettings.onlineRegistrationOpen}
                                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, onlineRegistrationOpen: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-brand-dark/50 rounded-lg border border-white/5">
                            <Label className="cursor-pointer" htmlFor="online-problem-toggle">Problem Selection</Label>
                            <Switch
                                id="online-problem-toggle"
                                checked={localSettings.onlineProblemSelectionOpen}
                                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, onlineProblemSelectionOpen: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-brand-dark/50 rounded-lg border border-white/5">
                            <Label className="cursor-pointer" htmlFor="online-submission-toggle">Project Submission</Label>
                            <Switch
                                id="online-submission-toggle"
                                checked={localSettings.onlineSubmissionOpen}
                                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, onlineSubmissionOpen: checked })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Prize Pool Display</Label>
                            <Input
                                value={localSettings.prizePool}
                                onChange={e => setLocalSettings({ ...localSettings, prizePool: e.target.value })}
                                className="bg-brand-dark border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Active Spots Left (FOMO)</Label>
                            <Input
                                type="number"
                                value={localSettings.hackathonCount}
                                onChange={e => setLocalSettings({ ...localSettings, hackathonCount: parseInt(e.target.value) || 0 })}
                                className="bg-brand-dark border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Base Price (₹)</Label>
                            <Input
                                type="number"
                                value={localSettings.onlineBasePrice}
                                onChange={e => setLocalSettings({ ...localSettings, onlineBasePrice: parseInt(e.target.value) || 0 })}
                                className="bg-brand-dark border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>WhatsApp Group URL</Label>
                            <Input
                                value={localSettings.onlineWhatsappUrl}
                                onChange={e => setLocalSettings({ ...localSettings, onlineWhatsappUrl: e.target.value })}
                                placeholder="https://chat.whatsapp.com/..."
                                className="bg-brand-dark border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>UPI ID</Label>
                            <Input
                                value={localSettings.onlineUpiId}
                                onChange={e => setLocalSettings({ ...localSettings, onlineUpiId: e.target.value })}
                                placeholder="omkar@vibe.com"
                                className="bg-brand-dark border-white/10"
                            />
                        </div>
                        <Button onClick={handleSaveSettings} className="w-full bg-brand-primary text-brand-dark hover:bg-brand-secondary">
                            <Save className="w-4 h-4 mr-2" /> Save Settings
                        </Button>
                    </CardContent>
                </Card>

                {/* Users List Section */}
                <Card className="bg-brand-surface border-white/10 lg:col-span-2">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <CardTitle>Online Participants</CardTitle>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="pl-8 bg-brand-dark border-white/10 h-9"
                                    />
                                </div>
                                <select
                                    className="h-9 bg-brand-dark border border-white/10 rounded-md text-sm px-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value as any);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">All Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-white/10 overflow-hidden min-h-[400px]">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow>
                                        <TableHead className="text-gray-400">Team / Participant</TableHead>
                                        <TableHead className="text-gray-400">Contact</TableHead>
                                        <TableHead className="text-gray-400">Education</TableHead>
                                        <TableHead className="text-gray-400">Members</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-right text-gray-400">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedParticipants.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No online participants found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedParticipants.map((p) => (
                                            <TableRow key={p._id} className="hover:bg-white/5">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white">{p.teamId}</span>
                                                        <span className="text-xs text-gray-400">{p.name} (Leader)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-300">{p.email}</span>
                                                        <span className="text-xs text-brand-primary">{p.whatsapp}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col max-w-[200px]">
                                                        <span className="text-sm text-gray-300 truncate" title={p.college}>{p.college}</span>
                                                        <span className="text-xs text-gray-500">{p.city}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-white/10">
                                                        {1 + (p.members?.length || 0)} Members
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {p.paymentScreenshotUrl ? (
                                                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Paid</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-gray-500">Pending</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {p.paymentScreenshotUrl && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-blue-400"
                                                                onClick={() => window.open(p.paymentScreenshotUrl, '_blank')}
                                                                title="View Payment"
                                                            >
                                                                <IndianRupee className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-gray-400 hover:text-white"
                                                            onClick={() => setEditingParticipant(p)}
                                                            title="Edit Participant"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-xs text-gray-500">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredParticipants.length)} of {filteredParticipants.length} entries
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 border-white/10"
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center px-2 text-sm text-gray-400 bg-brand-dark rounded border border-white/10">
                                    {currentPage} / {totalPages || 1}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="h-8 border-white/10"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
