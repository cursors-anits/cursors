import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, UserCircle, Loader2, ShieldCheck, LockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/lib/context/DataContext';

interface SettingsTabProps {
    user: any;
    showPasswordSection?: boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ user, showPasswordSection = true }) => {
    useData();
    const [isLoading, setIsLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update password');

            toast.success('Password updated successfully');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-brand-surface border-white/5 overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/5">
                    <CardTitle className="flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-brand-primary" />
                        Account Information
                    </CardTitle>
                    <CardDescription>Your personal and account details</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <Label className="text-gray-400 text-xs uppercase font-bold">Full Name</Label>
                            <div className="flex items-center gap-2 p-3 bg-brand-dark rounded-xl border border-white/5 text-white">
                                <UserCircle className="w-4 h-4 text-gray-500" />
                                <span>{user.name}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-gray-400 text-xs uppercase font-bold">Email Address</Label>
                            <div className="flex items-center gap-2 p-3 bg-brand-dark rounded-xl border border-white/5 text-white">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="truncate">{user.email}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-gray-400 text-xs uppercase font-bold">Access Role</Label>
                            <div className="flex items-center gap-2 p-3 bg-brand-dark rounded-xl border border-white/5 text-brand-primary font-bold">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="capitalize">{user.role}</span>
                            </div>
                        </div>
                        {user.assignedLab && (
                            <div className="space-y-1">
                                <Label className="text-gray-400 text-xs uppercase font-bold">Assigned Lab/Task</Label>
                                <div className="flex items-center gap-2 p-3 bg-brand-dark rounded-xl border border-white/5 text-white">
                                    <div className="w-4 h-4 text-gray-500 flex items-center justify-center text-[10px] font-bold border border-gray-500 rounded-sm">L</div>
                                    <span>{user.assignedLab}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>



            {showPasswordSection && (
                <Card className="bg-brand-surface border-white/5 overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/5">
                        <CardTitle className="flex items-center gap-2 text-red-400">
                            <LockIcon className="w-5 h-5" />
                            Security & Password
                        </CardTitle>
                        <CardDescription>Update your security credentials</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <Label htmlFor="old">Current Password</Label>
                                <Input
                                    id="old"
                                    type="password"
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    className="bg-brand-dark border-white/10 h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new">New Password</Label>
                                <Input
                                    id="new"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="bg-brand-dark border-white/10 h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Confirm New Password</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="bg-brand-dark border-white/10 h-11"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-brand-primary text-brand-dark hover:bg-white w-full h-11 rounded-xl font-bold"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Update Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
