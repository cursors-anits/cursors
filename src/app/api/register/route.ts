import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import User from '@/lib/db/models/User';
import { sendEventPassEmail } from '@/lib/email';
import { uploadToDrive } from '@/lib/gdrive';
import Settings from '@/lib/db/models/Settings';

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

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // 1. Initial Parsing to check Ticket Type
        let body: any;
        let screenshotSource: string | Buffer | undefined;

        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const dataStr = formData.get('data') as string;
            if (!dataStr) {
                return NextResponse.json({ error: 'Invalid registration data' }, { status: 400 });
            }
            body = JSON.parse(dataStr);
            const file = formData.get('screenshot') as File;
            if (file) {
                const arrayBuffer = await file.arrayBuffer();
                screenshotSource = Buffer.from(arrayBuffer);
            }
        } else {
            body = await req.json();
            screenshotSource = body.screenshot;
        }

        const { ticketType, transactionId, members } = body;

        // 2. Settings & Validation Override Logic
        const settings = await Settings.findOne().lean();

        if (settings) {
            const isDeadlinePassed = settings.registrationDeadline ? new Date() > new Date(settings.registrationDeadline) : false;
            const isGlobalClosed = settings.registrationClosed || isDeadlinePassed;

            if (ticketType === 'online') {
                // Online Config: If explicit false, it's closed. Otherwise open.
                if (settings.onlineRegistrationOpen === false) {
                    return NextResponse.json({ error: 'Online registration is currently closed.' }, { status: 403 });
                }
            } else {
                // Hackathon (Offline) Config
                if (isGlobalClosed) {
                    return NextResponse.json({ error: 'Registration is currently closed.' }, { status: 403 });
                }
            }
        }

        if (!members || members.length === 0) {
            return NextResponse.json({ error: 'At least one team member is required' }, { status: 400 });
        }

        // 3. Generate IDs
        const [lastParticipant, lastUser] = await Promise.all([
            Participant.findOne().sort({ teamId: -1 }),
            User.findOne({ role: 'participant' }).sort({ teamId: -1 })
        ]);

        let nextTeamNum = 1;

        const getNum = (id: string | undefined): number => {
            if (!id) return 0;
            const match = id.match(/VIBE-(\d+)/);
            return match ? parseInt(match[1]) : 0;
        };

        const lastParticipantNum = getNum(lastParticipant?.teamId);
        const lastUserNum = getNum(lastUser?.teamId);

        nextTeamNum = Math.max(lastParticipantNum, lastUserNum) + 1;

        const teamId = `VIBE-${String(nextTeamNum).padStart(3, '0')}`;
        const teamEmail = `${String(nextTeamNum).padStart(3, '0')}@vibe.com`;
        const passkey = generatePasskey();

        // Determine ticket type details
        const mappedType = ticketType === 'online' ? 'Online' : 'Hackathon';
        const isOnline = ticketType === 'online';
        const whatsappLink = isOnline
            ? (settings?.onlineWhatsappUrl || '#')
            : (process.env.WHATSAPP_HACKATHON_LINK || '#');

        // 4. Duplicate Checks
        const existingTransaction = await Participant.findOne({ transactionId });
        if (existingTransaction) {
            return NextResponse.json({ error: 'This Transaction ID has already been used for registration.' }, { status: 400 });
        }

        // 5. Upload Screenshot
        let driveUrl = '';
        if (screenshotSource && screenshotSource !== 'BUFFER-REQUEST') {
            try {
                // Using uploadToFolder instead of uploadToDrive to support dynamic folder selection
                const { uploadToFolder, ensureFolderExists } = await import('@/lib/gdrive');

                let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

                if (!folderId) {
                    console.error("Missing Google Drive Folder ID");
                    throw new Error("Server Configuration Error: Missing Drive Folder ID");
                }

                if (isOnline) {
                    try {
                        // Create or get 'Online Payments' subfolder
                        folderId = await ensureFolderExists('Online Payments', folderId);
                    } catch (folderError) {
                        console.error('Failed to ensure Online Payments folder, falling back to root:', folderError);
                        // Fallback to root folderId which is already set
                    }
                }

                driveUrl = await uploadToFolder(
                    screenshotSource,
                    `Payment_${teamId}.jpg`, // Ensure extension is added as uploadToFolder might expect it or we add it
                    folderId,
                    'image/jpeg'
                );

                if (!driveUrl) throw new Error('GDrive upload returned empty URL');
            } catch (driveError: any) {
                console.error('Registration aborted: GDrive Upload failed:', driveError);
                return NextResponse.json({ error: 'Payment verification failed. Please try again later.' }, { status: 500 });
            }
        }

        // 6. Create User
        await User.create({
            email: teamEmail,
            name: `Team ${teamId}`,
            role: 'participant',
            passkey: passkey,
            teamId: teamId,
        });

        // 7. Create Participants
        const participantsToCreate = members.map((m: any, index: number) => ({
            participantId: generateParticipantId(teamId, index),
            teamId,
            name: m.fullName,
            email: m.email,
            college: m.college || 'Unknown',
            city: m.city || '',
            department: m.department,
            whatsapp: m.whatsapp,
            year: m.year,
            linkedin: m.linkedin,
            type: mappedType,
            ticketType: isOnline ? 'online' : 'hackathon',
            paymentScreenshotUrl: driveUrl || (typeof screenshotSource === 'string' ? screenshotSource : ''),
            transactionId: transactionId,
        }));

        const createdParticipants = await Participant.insertMany(participantsToCreate);

        // 8. Send Emails
        const emailMembers = members.map((m: any) => ({
            name: m.fullName,
            college: m.college || 'Unknown',
            department: m.department,
            year: m.year,
            passkey
        }));

        const personalEmails = members.map((m: any) => m.email);
        const collegeForEmail = members[0]?.college || 'Unknown';

        const results = await Promise.allSettled(personalEmails.map((email: string) =>
            sendEventPassEmail(email, teamId, emailMembers, collegeForEmail, isOnline ? 'online' : 'hackathon', teamEmail, passkey, whatsappLink)
        ));

        const wasAnyEmailScheduled = results.some((r: any) => r.value?.scheduled);
        if (wasAnyEmailScheduled) console.warn(`Emails for team ${teamId} have been scheduled due to mail limit.`);

        return NextResponse.json({
            success: true,
            teamId,
            teamEmail,
            passkey,
            participants: createdParticipants,
            message: wasAnyEmailScheduled
                ? 'Registration successful! Your pass will be emailed within 24 hours due to server limits.'
                : 'Registration successful! Check your email for the pass.',
            scheduled: wasAnyEmailScheduled
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        if (error && typeof error === 'object' && 'code' in error && (error as any).code === 11000) {
            const key = Object.keys((error as any).keyPattern || {})[0];
            const message = key === 'transactionId' ? 'This Transaction ID has already been used.' : 'Team ID or Email collision. Please try again.';
            return NextResponse.json({ error: message }, { status: 409 });
        }
        return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
    }
}
