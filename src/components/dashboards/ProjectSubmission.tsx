'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Github, Timer, CheckCircle, AlertTriangle, XCircle, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { useData } from '@/lib/context/DataContext';
import { toast } from 'sonner';

interface ProjectSubmissionProps {
    participantId: string;
}

// Imports for sub-components
import { MultiPlatformInput } from '@/components/submissions/MultiPlatformInput';
import { FileUploadField } from '@/components/submissions/FileUploadField';
import { MultiFileUpload } from '@/components/submissions/MultiFileUpload';
import { Upload, FileText, Lock, Clock } from 'lucide-react';

type SubmissionPhase = 'initial' | 'success-screen' | 'extended-form' | 'final-submitted';

const ProjectSubmission: React.FC<ProjectSubmissionProps> = ({ participantId }) => {
    const { participants, settings, fetchParticipants } = useData();
    const [projectTitle, setProjectTitle] = useState('');
    const [projectDocumentUrl, setProjectDocumentUrl] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [windowStatus, setWindowStatus] = useState<'waiting' | 'open' | 'closed'>('waiting');

    const participant = participants.find(p => p.participantId === participantId);

    useEffect(() => {
        if (!participant) return;

        if (participant.projectRepo) setRepoUrl(participant.projectRepo);
        if (participant.projectTitle) setProjectTitle(participant.projectTitle);
        if (participant.projectDocumentUrl) setProjectDocumentUrl(participant.projectDocumentUrl);
    }, [participant]);

    // Timer Logic
    useEffect(() => {
        const calculateTimeLeft = () => {
            // Fallback dates if settings aren't loaded yet
            if (!settings) return;

            const now = new Date().getTime();
            const submissionStart = settings.submissionWindowStartTime ? new Date(settings.submissionWindowStartTime).getTime() : 0;
            // 1 Hour window
            const submissionEnd = submissionStart + (60 * 60 * 1000);

            if (settings.submissionWindowOpen) {
                // If manually opened, treat as Open
                if (submissionStart && now < submissionEnd) {
                    setWindowStatus('open');
                    const distance = submissionEnd - now;

                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    setTimeLeft(`${minutes}m ${seconds}s`);
                } else if (submissionStart && now > submissionEnd) {
                    setWindowStatus('closed');
                    setTimeLeft('00m 00s');
                } else {
                    // Open but no specific timer set? Or just open indefinitely?
                    // Assuming manual toggle overrides timer if timer not set
                    setWindowStatus('open');
                    setTimeLeft('Closing Manual');
                }

                // If no start time is set but flag is true, assume open indefinitely or logic needs refinement
                if (!submissionStart) {
                    setWindowStatus('open');
                    setTimeLeft('Open');
                }

            } else {
                // Closed
                if (submissionStart && now > submissionEnd) {
                    setWindowStatus('closed');
                } else {
                    setWindowStatus('waiting');
                }
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft(); // Initial call

        return () => clearInterval(timer);
    }, [settings]);


    const handleInitialSubmit = async () => {
        if (!projectTitle || projectTitle.length < 3) {
            toast.error('Please enter a valid Project Title');
            return;
        }
        if (!projectDocumentUrl) {
            toast.error('Please provided the Document URL');
            return;
        }
        if (!repoUrl) {
            toast.error('Please enter a valid GitHub URL');
            return;
        }

        if (!repoUrl.includes('github.com')) {
            toast.error('Must be a valid GitHub repository URL');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/participants/${participant?._id}/validate-repo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl, projectTitle, projectDocumentUrl })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submission failed');

            if (data.isVerified) {
                toast.success('Project submitted & confirmed successfully!');
            } else {
                // Hiding flag details from participant as requested
                toast.success('Project submitted successfully!');
            }

            await fetchParticipants(true);
        } catch (error) {
            toast.error('An error occurred during submission');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // RENDER: Initial Phase (Repo Submission)
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Github className="w-6 h-6 text-brand-primary" />
                        Domain & Problem Statement Confirmation
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Register your project details to start</p>
                </div>
                <Badge className={`${windowStatus === 'open' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                    windowStatus === 'closed' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                    } border-0`}>
                    {windowStatus === 'open' ? 'Submission Open' : windowStatus === 'closed' ? 'Submission Closed' : 'Not Open Yet'}
                </Badge>
            </div>

            <div className="space-y-4">
                {windowStatus === 'open' ? (
                    <>
                        <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="text-sm text-blue-200">Time Remaining</div>
                            <div className="flex items-center gap-2 text-xl font-mono font-bold text-white">
                                <Timer className="w-5 h-5 text-blue-400 animate-pulse" />
                                {timeLeft}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Project Title</Label>
                            <Input
                                placeholder="Enter your project title"
                                className="bg-brand-dark border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 transition-colors"
                                value={projectTitle}
                                onChange={(e) => setProjectTitle(e.target.value)}
                                disabled={isSubmitting || !!participant?.projectRepoLocked}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Project Abstract / Document URL</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    placeholder="https://docs.google.com/..."
                                    className="pl-9 bg-brand-dark border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 transition-colors"
                                    value={projectDocumentUrl}
                                    onChange={(e) => setProjectDocumentUrl(e.target.value)}
                                    disabled={isSubmitting || !!participant?.projectRepoLocked}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                * Link to your abstract or problem statement doc (Google Docs/Drive/Notion).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">GitHub Repository URL</Label>
                            <div className="relative">
                                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    placeholder="https://github.com/username/repo"
                                    className="pl-9 bg-brand-dark border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 transition-colors"
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    disabled={isSubmitting || !!participant?.projectRepoLocked}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                * Repository URL cannot be changed after submission.
                            </p>
                            <p className="text-xs text-gray-500">
                                * Ensure repository is Public and created AFTER Hackathon Start.
                            </p>
                        </div>

                        {!participant?.projectRepoLocked && (
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                onClick={handleInitialSubmit}
                                disabled={isSubmitting || !repoUrl || !projectTitle || !projectDocumentUrl}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Confirm Domain & Submit
                                    </>
                                )}
                            </Button>
                        )}

                        {participant?.projectRepoLocked && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                                <p className="text-green-400 font-bold">Submission Confirmed!</p>
                            </div>
                        )}
                    </>
                ) : (
                    // Waiting or Closed (same as before)
                    <div className="text-center py-8">
                        {windowStatus === 'waiting' ? (
                            <>
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Timer className="w-6 h-6 text-gray-400" />
                                </div>
                                <h4 className="text-white font-medium mb-1">Submission Window Not Open</h4>
                                <p className="text-sm text-gray-400">
                                    Please wait for the admins to open the project submission phase.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <XCircle className="w-6 h-6 text-red-400" />
                                </div>
                                <h4 className="text-red-400 font-medium mb-1">Submission Closed</h4>
                                <p className="text-sm text-gray-400">
                                    The submission window has ended. Please contact support if you missed it.
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectSubmission;
