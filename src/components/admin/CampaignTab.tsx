import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Send, History, Users, RefreshCw, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Participant, Coordinator } from '@/types';
import { useData } from '@/lib/context/DataContext';

import {
    getWelcomeEmailTemplate,
    getEventReminderTemplate,
    getEventUpdateTemplate,
    getRefundTemplate,
    getExitGateTemplate,
    getPromotionalTemplate,
    getWaitlistTemplate,
    getSubmissionSuccessTemplate,
    getWinnerTemplate,
    getCertificateTemplate,
    getFeedbackTemplate
} from '@/lib/email-templates';

interface CampaignTabProps {
    participants: Participant[];
    coordinators: Coordinator[];
}

export const CampaignTab: React.FC<CampaignTabProps> = ({ participants, coordinators }) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [targetType, setTargetType] = useState('all_participants');
    const [customAudienceInput, setCustomAudienceInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { logs } = useData();

    // Simple template logic
    const applyTemplate = (type: string) => {
        switch (type) {
            case 'welcome':
                setSubject('Welcome to Vibe Coding 2026! 🚀');
                setBody(getWelcomeEmailTemplate('{{name}}', '{{teamId}}'));
                break;
            case 'reminder':
                setSubject('⏳ 5 Days Left: Vibe Coding 2026');
                setBody(getEventReminderTemplate(5));
                break;
            case 'update':
                setSubject('🔔 Important Update: Reporting Time Changed');
                setBody(getEventUpdateTemplate('New Reporting Time', '<p>The reporting time is now <strong>10:00 AM</strong>.</p>'));
                break;
            case 'refund':
                setSubject('💳 Refund Processed');
                setBody(getRefundTemplate('{{refundAmount}}', 'Workshop cancellation adjustment'));
                break;
            case 'exit':
                setSubject('👋 Safe Travels!');
                setBody(getExitGateTemplate('{{name}}'));
                break;
            case 'promo':
                setSubject('🚀 START 2026 WITH A BANG! - Vibe Coding');
                setBody(getPromotionalTemplate());
                break;
            case 'waitlist':
                setSubject('🎟️ You\'re In! Claim your ticket now');
                setBody(getWaitlistTemplate('{{name}}'));
                break;
            case 'submission':
                setSubject('🚀 Project Submission Received');
                setBody(getSubmissionSuccessTemplate('Project Name', 'Team Name'));
                break;
            case 'winner':
                setSubject('🏆 CONGRATULATIONS! You won!');
                setBody(getWinnerTemplate('1st Prize', '₹25,000'));
                break;
            case 'certificate':
                setSubject('📜 Your Certificate is Ready');
                setBody(getCertificateTemplate('{{name}}', '{{certificateLink}}'));
                break;
            case 'feedback':
                setSubject('🤔 How was the Vibe?');
                setBody(getFeedbackTemplate('https://forms.gle/feedback-link'));
                break;
            case 'custom':
                setSubject('');
                setBody('');
                break;
        }
    };

    const handleSend = async () => {
        if (!subject || !body) {
            toast.error('Please fill in both subject and body');
            return;
        }

        let customRecipients: any[] = [];
        if (targetType === 'custom') {
            if (!customAudienceInput) {
                toast.error('Please enter email addresses for custom audience');
                return;
            }
            // Parse CSV/Lines
            const lines = customAudienceInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
            customRecipients = lines.map(email => ({ email, name: 'Participant' })); // Basic
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/campaign/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    body,
                    targetType,
                    customRecipients
                })
            });

            if (!res.ok) throw new Error('Failed to send campaign');

            const data = await res.json();
            toast.success(`Campaign sent to ${data.count} recipients!`);
            setSubject('');
            setBody('');
            setCustomAudienceInput('');
        } catch (error) {
            toast.error('Failed to send campaign');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const campaignLogs = logs?.filter(log => log.action === 'CAMPAIGN_SENT') || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Email Campaigns</h2>
                    <p className="text-gray-400">Manage and send mass emails to participants and coordinators.</p>
                </div>
            </div>

            <Tabs defaultValue="compose" className="space-y-4">
                <TabsList className="bg-white/5 border-white/10">
                    <TabsTrigger value="compose" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                        <Send className="w-4 h-4 mr-2" /> Compose
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                        <History className="w-4 h-4 mr-2" /> History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 bg-brand-surface border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">New Campaign</CardTitle>
                                <CardDescription>Compose a new email blast.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Target Audience</Label>
                                    <Select value={targetType} onValueChange={setTargetType}>
                                        <SelectTrigger className="bg-brand-dark border-white/10 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all_participants">All Participants ({participants.length})</SelectItem>
                                            <SelectItem value="verified_participants">Approved Participants ({participants.filter(p => p.status === 'approved').length})</SelectItem>
                                            <SelectItem value="pending_participants">Pending Participants ({participants.filter(p => p.status === 'pending').length})</SelectItem>
                                            <SelectItem value="all_coordinators">All Coordinators ({coordinators.length})</SelectItem>
                                            <SelectItem value="custom">Custom List (Enter Emails)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {targetType === 'custom' && (
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Custom Recipient Emails</Label>
                                        <Textarea
                                            value={customAudienceInput}
                                            onChange={(e) => setCustomAudienceInput(e.target.value)}
                                            className="bg-brand-dark border-white/10 text-white font-mono text-sm"
                                            placeholder="enter@email.com, another@email.com..."
                                            rows={4}
                                        />
                                        <p className="text-xs text-gray-500">Separate emails by commas or new lines.</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-gray-300">Template</Label>
                                        <Select onValueChange={applyTemplate}>
                                            <SelectTrigger className="w-[220px] h-8 bg-brand-dark border-white/10 text-xs">
                                                <SelectValue placeholder="Load Template" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="welcome">Welcome Greeting</SelectItem>
                                                <SelectItem value="reminder">Event Reminder (Countdown)</SelectItem>
                                                <SelectItem value="update">Event Update (Announcement)</SelectItem>
                                                <SelectItem value="promo">Promotional (Big Bang)</SelectItem>
                                                <SelectItem value="waitlist">Waitlist Notification</SelectItem>
                                                <SelectItem value="submission">Project Submission Received</SelectItem>
                                                <SelectItem value="winner">Winner Announcement</SelectItem>
                                                <SelectItem value="certificate">Certificate Download</SelectItem>
                                                <SelectItem value="feedback">Feedback Request</SelectItem>
                                                <SelectItem value="refund">Refund Processed</SelectItem>
                                                <SelectItem value="exit">Exit Gate Email</SelectItem>
                                                <SelectItem value="custom">Clear / Custom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300">Subject Line</Label>
                                    <Input
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="bg-brand-dark border-white/10 text-white"
                                        placeholder="Enter subject..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300">Message Body (HTML Supported)</Label>
                                    <Textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        className="bg-brand-dark border-white/10 text-white min-h-[300px] font-mono text-sm"
                                        placeholder="Type your message here... Use {{name}} for dynamic names."
                                    />
                                    <p className="text-xs text-gray-500">Available variables: {'{{name}}'}, {'{{teamId}}'}, {'{{college}}'}</p>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        onClick={handleSend}
                                        disabled={isLoading}
                                        className="bg-brand-primary text-white hover:bg-brand-primary/80"
                                    >
                                        {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                        Send Campaign
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="bg-brand-surface border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-gray-400">Audience Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white mb-1">
                                        {targetType === 'all_participants' ? participants.length :
                                            targetType === 'all_coordinators' ? coordinators.length :
                                                targetType === 'verified_participants' ? participants.filter(p => p.status === 'approved').length :
                                                    targetType === 'pending_participants' ? participants.filter(p => p.status === 'pending').length :
                                                        targetType === 'custom' ? customAudienceInput.split(/[\n,]+/).filter(Boolean).length :
                                                            '--'}
                                    </div>
                                    <p className="text-xs text-gray-500">Estimated Recipients</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-brand-surface border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-gray-400">Tips</CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-gray-400 space-y-2">
                                    <p>• Avoid using too many images to prevent spam flagging.</p>
                                    <p>• Test your email with a small group before sending to everyone.</p>
                                    <p>• Campaigns are processed in background queues.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card className="bg-brand-surface border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Campaign History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {campaignLogs.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No campaigns sent yet.</p>
                                ) : (
                                    campaignLogs.map((log) => (
                                        <div key={log._id} className="flex items-center justify-between p-4 bg-brand-dark/50 rounded-xl border border-white/5">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                                    <Mail className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{log.details}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                        <span>•</span>
                                                        <span>{log.user}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-green-400 bg-green-500/10 border-green-500/20">Sent</Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
