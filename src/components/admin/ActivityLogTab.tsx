import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Log } from '@/types';
import {
    Activity,
    User,
    Clock,
    Filter,
    Search,
    Trash2,
    Users,
    Zap
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ActivityLogTabProps {
    logs: Log[];
}

const ActivityLogTab: React.FC<ActivityLogTabProps> = ({ logs }) => {
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const getActionIcon = (action: string) => {
        if (action.includes('Delete')) return <Trash2 className="w-4 h-4 text-red-400" />;
        if (action.includes('Allocate')) return <Zap className="w-4 h-4 text-yellow-400" />;
        if (action.includes('User')) return <Users className="w-4 h-4 text-blue-400" />;
        return <Activity className="w-4 h-4 text-gray-400" />;
    };

    const formatTime = (isoString: string) => {
        try {
            return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return isoString;
        }
    };

    const formatDate = (isoString: string) => {
        try {
            return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return isoString;
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesType = filterType === 'all' || log.action.toLowerCase().includes(filterType.toLowerCase());
        const matchesSearch = log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    // Group logs by date
    const groupedLogs = filteredLogs.reduce((acc, log) => {
        const date = formatDate(log.time);
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
    }, {} as Record<string, Log[]>);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-brand-primary" />
                        Activity Timeline
                    </h3>
                    <p className="text-sm text-gray-400">Track all administrative actions and system events</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 bg-brand-dark border-white/10"
                        />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[140px] bg-brand-dark border-white/10">
                            <SelectValue placeholder="All Actions" />
                        </SelectTrigger>
                        <SelectContent className="bg-brand-surface border-white/10">
                            <SelectItem value="all">All Actions</SelectItem>
                            <SelectItem value="delete">Delete</SelectItem>
                            <SelectItem value="allocate">Allocate</SelectItem>
                            <SelectItem value="update">Update</SelectItem>
                            <SelectItem value="login">Login</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card className="bg-brand-surface border-white/5">
                <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                        <span>Recent Activity</span>
                        <Badge variant="outline" className="text-xs font-normal text-gray-400">
                            {filteredLogs.length} events
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-8">
                            {Object.entries(groupedLogs).map(([date, dayLogs]) => (
                                <div key={date} className="relative">
                                    <div className="sticky top-0 z-10 bg-brand-surface/95 backdrop-blur py-2 mb-4 border-b border-white/5">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{date}</h4>
                                    </div>
                                    <div className="space-y-4 ml-2 border-l border-white/10 pl-4 py-2">
                                        {dayLogs.map((log) => (
                                            <div key={log._id} className="relative group">
                                                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-dark border border-white/20 group-hover:border-brand-primary group-hover:bg-brand-primary/20 transition-colors" />
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="p-1 rounded bg-white/5 text-gray-300">
                                                                {getActionIcon(log.action)}
                                                            </span>
                                                            <span className="font-medium text-white">{log.action}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-400">{log.details}</p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                                                            <User className="w-3 h-3" />
                                                            <span>{log.user}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-black/20 px-2 py-1 rounded self-start sm:self-center">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTime(log.time)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {filteredLogs.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No logs found matching your criteria</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default ActivityLogTab;
