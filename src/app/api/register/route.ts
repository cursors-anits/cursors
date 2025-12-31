import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import User from '@/lib/db/models/User';
import { sendEventPassEmail } from '@/lib/email';
import { uploadToDrive } from '@/lib/gdrive';

function generateParticipantId(teamId: string, memberIndex: number): string {
    return `${teamId}-${memberIndex + 1}`;
}

function generatePasskey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
    let passkey = '';
    for (let i = 0; i < 6; i++) {
        passkey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return passkey;
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Check Registration Status
        const settings = await import('@/lib/db/models/Settings').then(mod => mod.default.findOne());

        if (settings) {
            const isDeadlinePassed = settings.registrationDeadline ? new Date() > new Date(settings.registrationDeadline) : false;
            if (settings.registrationClosed || isDeadlinePassed) {
                return NextResponse.json(
                    { error: 'Registration is currently closed.' },
                    { status: 403 }
                );
            }
        }

        let body: any;
        let screenshotSource: string | Buffer | undefined;

        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const jsonData = formData.get('data') as string;
            body = JSON.parse(jsonData);

            const file = formData.get('screenshot') as File;
            if (file) {
                const arrayBuffer = await file.arrayBuffer();
                screenshotSource = Buffer.from(arrayBuffer);
            }
        } else {
            body = await request.json();
            screenshotSource = body.screenshot;
        }

        const { members, college, ticketType, transactionId } = body;

        if (!members || members.length === 0) {
            return NextResponse.json(
                { error: 'At least one team member is required' },
                { status: 400 }
            );
        }

        // Generate IDs - Find the last team ID from both collections to increment properly
        const [lastParticipant, lastUser] = await Promise.all([
            Participant.findOne().sort({ teamId: -1 }),
            User.findOne({ role: 'participant' }).sort({ teamId: -1 })
        ]);

        let nextTeamNum = 1;
        const lastTeamId = lastParticipant?.teamId || lastUser?.teamId;

        if (lastTeamId) {
            const match = lastTeamId.match(/VIBE-(\d+)/);
            if (match) {
                nextTeamNum = parseInt(match[1]) + 1;
            }
        }

        const teamId = `VIBE-${String(nextTeamNum).padStart(3, '0')}`;
        const teamEmail = `${String(nextTeamNum).padStart(3, '0')}@vibe.com`;
        const passkey = generatePasskey();

        // Determine ticket type - Default to Hackathon
        const mappedType = 'Hackathon';

        // 1. Check for Duplicate Transaction ID
        const existingTransaction = await Participant.findOne({ transactionId });
        if (existingTransaction) {
            return NextResponse.json(
                { error: 'This Transaction ID has already been used for registration.' },
                { status: 400 }
            );
        }

        // 2. Upload Screenshot to Google Drive FIRST
        let driveUrl = '';
        if (screenshotSource) {
            try {
                driveUrl = await uploadToDrive(screenshotSource, `Payment_${teamId}`);
                if (!driveUrl) throw new Error('GDrive upload returned empty URL');
            } catch (driveError: any) {
                console.error('Registration aborted: GDrive Upload failed:', driveError);
                return NextResponse.json(
                    { error: 'Payment verification failed. Please try again later.' },
                    { status: 500 }
                );
            }
        }

        // 3. Create ONE User for the Team
        const teamUser = await User.create({
            email: teamEmail,
            name: `Team ${teamId}`,
            role: 'participant',
            passkey: passkey,
            teamId: teamId,
        });

        // 2. Create Participant Details for each member
        const participantsToCreate = members.map((m: any, index: number) => ({
            participantId: generateParticipantId(teamId, index),
            teamId,
            name: m.fullName,
            email: m.email,
            college: m.college || 'Unknown', // Use member's college, not team-level
            city: m.city || '',
            department: m.department,
            whatsapp: m.whatsapp,
            year: m.year,
            linkedin: m.linkedin,
            type: mappedType,
            paymentScreenshotUrl: driveUrl || (typeof screenshotSource === 'string' ? screenshotSource : ''),
            transactionId: transactionId,
        }));

        const createdParticipants = await Participant.insertMany(participantsToCreate);

        const response = NextResponse.json(
            {
                success: true,
                teamId,
                teamEmail,
                passkey,
                participants: createdParticipants,
                message: 'Registration successful!',
            },
            { status: 201 }
        );

        // Send Email to all members PERSONAL emails
        const emailMembers = members.map((m: any) => ({
            name: m.fullName,
            college: m.college || 'Unknown',
            department: m.department,
            year: m.year,
            passkey
        }));

        const personalEmails = members.map((m: any) => m.email);
        // Use first member's college for email template
        const collegeForEmail = members[0]?.college || 'Unknown';

        const results = await Promise.allSettled(personalEmails.map((email: string) =>
            // Force 'hackathon' as the ticket type for email purposes
            sendEventPassEmail(email, teamId, emailMembers, collegeForEmail, 'hackathon', teamEmail, passkey)
        ));

        const wasAnyEmailScheduled = results.some((r: any) => r.value?.scheduled);
        if (wasAnyEmailScheduled) {
            console.warn(`Emails for team ${teamId} have been scheduled due to mail limit.`);
        }

        return NextResponse.json(
            {
                success: true,
                teamId,
                teamEmail,
                passkey,
                participants: createdParticipants,
                message: wasAnyEmailScheduled
                    ? 'Registration successful! Your pass will be emailed within 24 hours due to server limits.'
                    : 'Registration successful! Check your email for the pass.',
                scheduled: wasAnyEmailScheduled
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);

        // Handle duplicate email error (User or Participant)
        if (error && typeof error === 'object' && 'code' in error && (error as any).code === 11000) {
            const key = Object.keys((error as any).keyPattern || {})[0];
            const message = key === 'transactionId' ? 'This Transaction ID has already been used.' : 'Team ID or Email collision. Please try again.';
            return NextResponse.json(
                { error: message },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}
