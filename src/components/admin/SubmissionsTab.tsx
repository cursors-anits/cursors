
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Search, ExternalLink, Filter, FolderOpen, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import { Participant } from '@/types';

interface SubmissionsTabProps {
    participants: Participant[];
    loading: boolean;
}

export const SubmissionsTab: React.FC<SubmissionsTabProps> = ({ participants, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'flagged' | 'pending'>('all');

    // Filter participants who have submitted a repo
    const submissions = participants.filter(p => p.projectRepo);

    // Filter Logic
    const filteredSubmissions = submissions.filter(p => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.teamId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.participantId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || p.submissionStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Unique by teamId to avoid duplicates in display
    const uniqueTeams = Array.from(new Map(filteredSubmissions.map(p => [p.teamId, p])).values());

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-bold font-heading text-white">Project Submissions</h2>
                    <p className="text-gray-400">Review and manage team project submissions</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-brand-dark/50 p-2 rounded-lg border border-white/10 flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-gray-300">Verified: </span>
                            <span className="text-white font-bold">{submissions.filter(s => s.submissionStatus === 'verified').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            <span className="text-gray-300">Flagged: </span>
                            <span className="text-white font-bold">{submissions.filter(s => s.submissionStatus === 'flagged').length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Search team, name, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-brand-dark border-white/10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                    <SelectTrigger className="w-[180px] bg-brand-dark border-white/10">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="flagged">Flagged</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-gray-400 font-medium">Team ID</TableHead>
                            <TableHead className="text-gray-400 font-medium">Repository</TableHead>
                            <TableHead className="text-gray-400 font-medium">Status</TableHead>
                            <TableHead className="text-gray-400 font-medium">Submitted At</TableHead>
                            <TableHead className="text-gray-400 font-medium">Files</TableHead>
                            <TableHead className="text-gray-400 font-medium text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {uniqueTeams.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No submissions found matching criteria
                                </TableCell>
                            </TableRow>
                        ) : (
                            uniqueTeams.map((p) => (
                                <TableRow key={p._id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="font-mono text-white">
                                        {p.teamId || p.participantId}
                                        {p.submissionFlags?.isFlagged && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {p.submissionFlags.flags.map((flag, idx) => (
                                                    <Badge key={idx} variant="destructive" className="text-[10px] px-1 py-0 h-5">
                                                        {flag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href={p.projectRepo}
                                            target="_blank"
                                            className="text-blue-400 hover:underline flex items-center gap-1 text-sm max-w-[200px] truncate"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            {p.projectRepo?.replace('https://github.com/', '')}
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${p.submissionStatus === 'verified' ? 'bg-green-500/20 text-green-400' :
                                            p.submissionStatus === 'flagged' ? 'bg-red-500/20 text-red-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            } border-0 capitalize`}>
                                            {p.submissionStatus === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                                            {p.submissionStatus === 'flagged' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                            {p.submissionStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-400 text-sm">
                                        {p.submissionTime ? new Date(p.submissionTime).toLocaleString() : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {p.extendedSubmissionData?.folderPath ? (
                                            <a
                                                href={`https://drive.google.com/drive/folders/${p.extendedSubmissionData.folderPath}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm"
                                            >
                                                <FolderOpen className="w-4 h-4" />
                                                View Drive
                                            </a>
                                        ) : (
                                            <span className="text-gray-600 text-xs italic">Pending Extended</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Menu</span>
                                            {/* Action Menu could go here */}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
