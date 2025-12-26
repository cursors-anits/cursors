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
    const [repoUrl, setRepoUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isWindowActive, setIsWindowActive] = useState(false);
    const [windowStatus, setWindowStatus] = useState<'waiting' | 'open' | 'closed'>('waiting');

    // Extended Submission State
    const [submissionPhase, setSubmissionPhase] = useState<SubmissionPhase>('initial');
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [files, setFiles] = useState<{
        envFile: File | null;
        requirementsFile: File | null;
        documentFile: File | null;
        otherFiles: File[];
    }>({
        envFile: null,
        requirementsFile: null,
        documentFile: null,
        otherFiles: []
    });

    const participant = participants.find(p => p.participantId === participantId);

    // Determine Phase
    useEffect(() => {
        if (!participant) return;

        if (participant.extendedSubmissionData?.submittedAt) {
            setSubmissionPhase('final-submitted');
        } else if (participant.projectRepoLocked) {
            const submittedAt = participant.projectRepoSubmittedAt ? new Date(participant.projectRepoSubmittedAt) : new Date();
            const hoursSinceSubmission = (new Date().getTime() - submittedAt.getTime()) / (1000 * 60 * 60);

            // If less than 12 hours, show success screen
            // BUT logic check: User said "show success screen for at least 12 hours".
            // This means after 12 hours they can proceed.
            if (hoursSinceSubmission < 12) {
                setSubmissionPhase('success-screen');
            } else {
                setSubmissionPhase('extended-form');
            }
        } else {
            setSubmissionPhase('initial');
        }

        if (participant.projectRepo) {
            setRepoUrl(participant.projectRepo);
        }
    }, [participant]);

    // Timer Logic
    useEffect(() => {
        if (!settings) return;

        const checkTime = () => {
            const now = new Date();

            if (!settings.submissionWindowOpen) {
                setWindowStatus('waiting');
                setIsWindowActive(false);
                return;
            }

            if (settings.submissionWindowOpen && settings.submissionWindowStartTime) {
                // Initial Repo Submission Window
                const startTime = new Date(settings.submissionWindowStartTime);
                const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour window for initial repo

                // Extended window is open until hackathon end technically, but let's stick to this for initial
                if (now < endTime) {
                    setWindowStatus('open');
                    setIsWindowActive(true);
                    const diff = endTime.getTime() - now.getTime();
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    setTimeLeft(`${minutes}m ${seconds}s`);
                } else {
                    setWindowStatus('closed');
                    setIsWindowActive(false);
                    setTimeLeft('0m 0s');
                }
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 1000);
        return () => clearInterval(interval);
    }, [settings]);

    const handleInitialSubmit = async () => {
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
                body: JSON.stringify({ repoUrl })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submission failed');

            if (data.isVerified) {
                toast.success('Repository submitted successfully!');
            } else {
                toast.warning('Repository submitted but flagged: ' + (data.flags?.join(', ') || 'Validation issues'));
            }

            await fetchParticipants(true);
        } catch (error) {
            toast.error('An error occurred during submission');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExtendedSubmit = async () => {
        if (platforms.length === 0) {
            toast.error('Please list at least one coding platform used');
            return;
        }

        // Validate File Size (Frontend Check)
        const MAX_SIZE_MB = 50;
        let totalSize = 0;
        if (files.envFile) totalSize += files.envFile.size;
        if (files.requirementsFile) totalSize += files.requirementsFile.size;
        if (files.documentFile) totalSize += files.documentFile.size;
        files.otherFiles.forEach(f => totalSize += f.size);

        if (totalSize > MAX_SIZE_MB * 1024 * 1024) {
            toast.error(`Total file size exceeds ${MAX_SIZE_MB}MB limit`);
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('platforms', JSON.stringify(platforms));

            if (files.envFile) formData.append('envFile', files.envFile);
            if (files.requirementsFile) formData.append('requirementsFile', files.requirementsFile);
            if (files.documentFile) formData.append('documentFile', files.documentFile);
            files.otherFiles.forEach(f => formData.append('otherFiles', f));

            const res = await fetch(`/api/participants/${participant?._id}/extended-submission`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submission failed');

            toast.success('Final project submitted successfully!');
            await fetchParticipants(true);
        } catch (error) {
            toast.error('Failed to submit extended project details');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!participant) return null;
    if (!participant.hasConfirmedProblem) return null;

    // RENDER: Final Submitted State
    if (submissionPhase === 'final-submitted') {
        return (
            <div className="space-y-6">
                <div className="p-6 bg-brand-dark rounded-xl border border-white/10 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Project Successfully Submitted!</h3>
                    <p className="text-gray-400 mb-6">You have completed all submission requirements.</p>

                    <div className="flex flex-col gap-3 text-left bg-white/5 p-4 rounded-lg max-w-md mx-auto">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Repository:</span>
                            <a href={participant.projectRepo} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1">
                                View Repo <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Platforms:</span>
                            <span className="text-white">{participant.extendedSubmissionData?.codingPlatforms?.join(', ')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Files Uploaded:</span>
                            <span className="text-white">
                                {[
                                    participant.extendedSubmissionData?.filesUploaded?.envFile && '.env',
                                    participant.extendedSubmissionData?.filesUploaded?.requirementsFile && 'requirements.txt',
                                    participant.extendedSubmissionData?.filesUploaded?.documentFile && 'Report',
                                    participant.extendedSubmissionData?.filesUploaded?.otherFiles && `${participant.extendedSubmissionData?.filesUploaded?.otherFiles.length} others`
                                ].filter(Boolean).join(', ')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // RENDER: Success Screen (Wait 12 Hours)
    if (submissionPhase === 'success-screen') {
        const submittedAt = participant.projectRepoSubmittedAt ? new Date(participant.projectRepoSubmittedAt) : new Date();
        const unlockTime = new Date(submittedAt.getTime() + 12 * 60 * 60 * 1000);

        return (
            <div className="space-y-6">
                <div className="p-6 bg-brand-dark rounded-xl border border-white/10 text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Repository Locked!</h3>
                    <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                        Your GitHub repository has been registered. You can continue working on your project.
                        The final submission form for reports and additional files will open in:
                    </p>

                    <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full font-mono font-medium">
                        <Clock className="w-4 h-4" />
                        Next Phase Opens: {unlockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10 text-left max-w-lg mx-auto">
                        <Label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">Registered Repository</Label>
                        <div className="flex items-center gap-2 text-white font-mono text-sm bg-black/30 p-2 rounded border border-white/5">
                            <Lock className="w-3 h-3 text-gray-500" />
                            {participant.projectRepo}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // RENDER: Extended Submission Form
    if (submissionPhase === 'extended-form') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Upload className="w-6 h-6 text-brand-primary" />
                            Final Project Submission
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">Upload project files and details</p>
                    </div>
                </div>

                <div className="space-y-6 p-6 bg-brand-dark rounded-xl border border-white/10">
                    {/* Repo Info */}
                    <div className="p-3 bg-black/30 rounded border border-white/5 mb-4">
                        <Label className="text-xs text-gray-500 uppercase">Repository</Label>
                        <div className="text-white font-mono text-sm flex items-center gap-2 mt-1">
                            <Lock className="w-3 h-3 text-gray-500" />
                            {participant.projectRepo}
                        </div>
                    </div>

                    {/* Platforms */}
                    <MultiPlatformInput
                        platforms={platforms}
                        onPlatformsChange={setPlatforms}
                    />

                    <div className="h-px bg-white/10 my-4" />

                    {/* File Uploads */}
                    <h4 className="text-white font-semibold">Project Files</h4>
                    <p className="text-xs text-gray-500 -mt-1 mb-4">Max total size: 50MB</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FileUploadField
                            label=".env File"
                            sublabel="Environment variables"
                            accept=".env,text/plain" // .env often has no MIME type or text/plain
                            file={files.envFile}
                            onFileChange={(f) => setFiles({ ...files, envFile: f })}
                        />
                        <FileUploadField
                            label="requirements.txt"
                            sublabel="For Python projects"
                            accept=".txt"
                            file={files.requirementsFile}
                            onFileChange={(f) => setFiles({ ...files, requirementsFile: f })}
                        />
                    </div>

                    <FileUploadField
                        label="Project Report / Document"
                        sublabel="PDF format preferred"
                        accept=".pdf,.doc,.docx"
                        file={files.documentFile}
                        onFileChange={(f) => setFiles({ ...files, documentFile: f })}
                    />

                    <MultiFileUpload
                        label="Other Files"
                        sublabel="Any other relevant assets (images, configs, etc.)"
                        files={files.otherFiles}
                        onFilesChange={(fs) => setFiles({ ...files, otherFiles: fs })}
                        maxFiles={5}
                    />

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-lg"
                            onClick={handleExtendedSubmit}
                            disabled={isSubmitting || platforms.length === 0}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Uploading & Submitting...
                                </>
                            ) : (
                                <>
                                    Complete Submission
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // RENDER: Initial Phase (Repo Submission)
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Github className="w-6 h-6 text-brand-primary" />
                        Project Submission
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Register your repository to start</p>
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
                            <Label className="text-gray-300">GitHub Repository URL</Label>
                            <div className="relative">
                                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    placeholder="https://github.com/username/repo"
                                    className="pl-9 bg-brand-dark border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 transition-colors"
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                * Repository URL cannot be changed after submission.
                            </p>
                            <p className="text-xs text-gray-500">
                                * Ensure repository is Public and created AFTER Hackathon Start.
                            </p>
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            onClick={handleInitialSubmit}
                            disabled={isSubmitting || !repoUrl}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Verify & Register Repository
                                </>
                            )}
                        </Button>
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
