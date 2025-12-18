'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Mail,
    Key,
    Loader2,
    ArrowRight,
    RefreshCw,
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import { User, UserRole } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'auth'>('email');
    const [email, setEmail] = useState('');
    const [authInput, setAuthInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [detectedRole, setDetectedRole] = useState<UserRole | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStep('email');
            setEmail('');
            setAuthInput('');
            setError('');
            setDetectedRole(null);
        }
    }, [isOpen]);

    const validateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/auth/verify-email?email=${encodeURIComponent(email)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Email not found in our records');
            }

            setDetectedRole(data.role);
            setStep('auth');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Invalid email. Please check and try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authInput) return;

        setIsLoading(true);
        setError('');

        const authPayload: any = {
            email,
            role: detectedRole
        };

        if (detectedRole === 'participant') {
            authPayload.passkey = authInput;
        } else {
            authPayload.password = authInput;
        }

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(authPayload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authentication failed');
            }

            // Success
            onLoginSuccess(data.user);
            const rolePath = data.user.role === 'admin' ? '/dashboard/admin' :
                data.user.role === 'coordinator' ? '/dashboard/coordinator' :
                    data.user.role === 'faculty' ? '/dashboard/faculty' :
                        '/dashboard/participant';
            router.push(rolePath);
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const resetLogin = () => {
        setStep('email');
        setAuthInput('');
        setError('');
        setDetectedRole(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-brand-surface border-white/10 text-white shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Welcome Back</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {step === 'email'
                            ? "Enter your email to continue to your dashboard."
                            : "Enter your secure passkey or password."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={step === 'email' ? validateEmail : handleAuthSubmit} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        {/* EMAIL FIELD */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="email" className="text-gray-400">Email Address</Label>
                                {step === 'auth' && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={resetLogin}
                                        className="text-xs text-brand-primary hover:text-white hover:bg-transparent flex items-center gap-1 transition-colors h-auto p-0"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Not you?
                                    </Button>
                                )}
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    disabled={step === 'auth'}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`bg-brand-dark border-gray-700 pl-10 h-11 focus-visible:ring-brand-primary ${step === 'auth' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {/* PASSKEY / PASSWORD FIELD */}
                        {step === 'auth' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="authInput" className="text-gray-400">
                                    {detectedRole === 'participant' ? 'Passkey' : 'Password'}
                                </Label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        id="authInput"
                                        type={detectedRole === 'participant' ? 'text' : (showPassword ? 'text' : 'password')}
                                        required
                                        autoFocus
                                        value={authInput}
                                        onChange={(e) => setAuthInput(detectedRole === 'participant' ? e.target.value.toUpperCase() : e.target.value)}
                                        className="bg-brand-dark border-gray-700 px-10 h-11 focus-visible:ring-brand-primary font-mono tracking-widest"
                                        placeholder={detectedRole === 'participant' ? 'VIBE12' : '••••••••'}
                                    />
                                    {detectedRole !== 'participant' && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {error && (
                            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400 py-3">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-primary text-brand-dark font-bold hover:bg-brand-secondary hover:text-white transition-all h-11 rounded-xl"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : step === 'email' ? (
                                <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default LoginModal;
