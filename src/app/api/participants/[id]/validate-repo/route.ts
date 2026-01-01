
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import Settings from '@/lib/db/models/Settings';
import mongoose from 'mongoose';
import { analyzeRepository } from '@/lib/flagging/analyzeRepository';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { repoUrl, projectTitle, projectDocumentUrl } = await request.json();

        if (!projectTitle || projectTitle.length < 3) {
            return NextResponse.json({ error: 'Project Title is required (min 3 chars)' }, { status: 400 });
        }

        if (!projectDocumentUrl) {
            return NextResponse.json({ error: 'Project Document URL is required' }, { status: 400 });
        }

        if (!repoUrl || !repoUrl.includes('github.com')) {
            return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
        }

        await dbConnect();

        // Fetch Participant Early to check for Online Status
        let participant = await Participant.findOne({ participantId: id });
        if (!participant && mongoose.Types.ObjectId.isValid(id)) {
            participant = await Participant.findById(id);
        }

        if (!participant) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        const isOnline = participant.type === 'Online' || participant.ticketType === 'online';
        const settings = await Settings.findOne();

        // 1. Check Submission Window
        if (isOnline) {
            if (!settings?.onlineSubmissionOpen) {
                return NextResponse.json({ error: 'Online submissions are not currently open.' }, { status: 403 });
            }
            // Bypass other time checks for online users when their specific toggle is ON
        } else {
            // Offline Users - Strict Checks
            if (!settings?.submissionWindowOpen && !process.env.NEXT_PUBLIC_DEV_MODE) {
                // Strict check implicit fallthrough
            }

            if (!settings?.submissionWindowOpen) {
                return NextResponse.json({ error: 'Submissions are not currently open.' }, { status: 403 });
            }

            if (settings.submissionWindowStartTime) {
                const ONE_HOUR = 60 * 60 * 1000;
                const now = Date.now();
                const start = new Date(settings.submissionWindowStartTime).getTime();
                if (now > start + ONE_HOUR) {
                    return NextResponse.json({ error: 'Submission window has closed (1 hour limit expired).' }, { status: 403 });
                }
            }
        }

        if (participant.submissionStatus === 'verified') {
            return NextResponse.json({ error: 'Project already submitted.' }, { status: 400 });
        }

        // 2. GitHub API Check
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
            return NextResponse.json({ error: 'Could not parse repository owner and name.' }, { status: 400 });
        }

        const owner = match[1];
        const repo = match[2].replace('.git', '');

        const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);

        if (ghRes.status === 404) {
            return NextResponse.json({ error: 'Repository not found or private. Please make it Public.' }, { status: 400 });
        }

        if (!ghRes.ok) {
            return NextResponse.json({ error: 'Failed to validate with GitHub.' }, { status: 500 });
        }

        const ghData = await ghRes.json();
        const createdAt = new Date(ghData.created_at);
        const hackathonStart = settings.hackathonStartDate || new Date('2026-01-05T15:00:00');

        let isVerified = true;
        const flags: string[] = [];

        // 3. Creation Date Check
        if (createdAt < hackathonStart) {
            return NextResponse.json({
                error: 'Repository must be created after the Hackathon Start Date (Jan 5th 2026, 3 PM). Please create a new repository.'
            }, { status: 400 });
        }

        // 4. Advanced Metrics: Commit Analysis
        try {
            const { isFlagged, flags: analysisFlags } = await analyzeRepository(owner, repo);
            flags.push(...analysisFlags);

            if (isFlagged) {
                isVerified = false;
            }
        } catch (analysisError) {
            console.error('Analysis failed:', analysisError);
            // Don't fail the whole submission, just log
        }

        // 5. Update Participant
        participant.projectRepo = repoUrl;
        participant.projectTitle = projectTitle;
        participant.projectDocumentUrl = projectDocumentUrl;
        participant.projectRepoLocked = true;
        participant.projectRepoSubmittedAt = new Date();
        participant.submissionTime = new Date();

        if (isVerified) {
            participant.submissionStatus = 'verified';
            participant.submissionFlags = undefined;
        } else {
            participant.submissionStatus = 'flagged';
            participant.submissionFlags = {
                isFlagged: true,
                flags: flags,
                flaggedAt: new Date(),
                reviewStatus: 'pending'
            };
        }

        await participant.save();

        // 6. Sync to team members
        const updateFields: any = {
            projectRepo: repoUrl,
            projectTitle: projectTitle,
            projectDocumentUrl: projectDocumentUrl,
            projectRepoLocked: true,
            projectRepoSubmittedAt: new Date(),
            submissionTime: new Date(),
            submissionStatus: participant.submissionStatus,
        };

        if (!isVerified) {
            updateFields.submissionFlags = participant.submissionFlags;
        } else {
            updateFields.$unset = { submissionFlags: 1 };
        }

        await Participant.updateMany(
            { teamId: participant.teamId },
            { $set: updateFields }
        );

        // AUTOMATION: Send Confirmation Email
        if (isVerified) { // Only send if verified? Or always? Usually always to confirm receipt.
            try {
                const { sendGenericEmail: sendEmail } = await import('@/lib/email');
                const { getConfirmationTemplate } = await import('@/lib/email-templates');

                // Send to the submitter (or whole team?) - Logic suggests whole team should know, but submitter for sure.
                // Let's send to the submitter first.
                if (participant.email) {
                    await sendEmail(
                        participant.email,
                        'Domain & Problem Statement Confirmed | Vibe Coding',
                        getConfirmationTemplate(projectTitle, participant.teamId, repoUrl, projectDocumentUrl)
                    );
                }
            } catch (emailErr) {
                console.error("Failed to send submission email", emailErr);
            }
        }

        return NextResponse.json({
            success: true,
            isVerified,
            flags: flags.length > 0 ? flags : undefined
        });

    } catch (error: any) {
        console.error('Validation error:', error);
        return NextResponse.json({ error: 'Failed to process submission. ' + error.message }, { status: 500 });
    }
}
