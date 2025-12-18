import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import User from '@/lib/db/models/User';
import { sendEventPassEmail } from '@/lib/email';

// Helper to generate unique IDs
function generateTeamId(count: number): string {
    const num = String(count + 1).padStart(3, '0');
    return `VIBE-${num}`;
}

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

        const body = await request.json();
        const { members, college, ticketType, screenshot } = body;

        if (!members || members.length === 0) {
            return NextResponse.json(
                { error: 'At least one team member is required' },
                { status: 400 }
            );
        }

        // Generate IDs
        const participantCount = await Participant.countDocuments();
        const teamId = generateTeamId(Math.floor(participantCount / 4)); // Approximate
        const teamEmail = `${teamId.split('-')[1]}@vibe.com`;
        const passkey = generatePasskey();

        // Determine ticket type
        const typeMap: { [key: string]: 'Workshop' | 'Hackathon' | 'Combo' } = {
            workshop: 'Workshop',
            hackathon: 'Hackathon',
            combo: 'Combo',
        };
        const mappedType = typeMap[ticketType] || 'Combo';

        // 1. Create ONE User for the Team
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
            college: college || 'Unknown',
            department: m.department,
            whatsapp: m.whatsapp,
            year: m.year,
            linkedin: m.linkedin,
            type: mappedType,
            status: 'Pending',
            paymentScreenshotUrl: screenshot || '',
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
        const emailMembers = createdParticipants.map(p => ({
            name: p.name,
            department: p.department,
            year: p.year,
            passkey: passkey
        }));

        const personalEmails = members.map((m: any) => m.email);

        Promise.allSettled(personalEmails.map((email: string) =>
            // We pass teamEmail and passkey as the last args for the V2 template
            sendEventPassEmail(email, teamId, emailMembers, college, ticketType as any, teamEmail, passkey)
        )).then(results => {
            console.log('Email sending results:', results.map(r => r.status));
            // Just for logging purposes
        });

        return response;
    } catch (error) {
        console.error('Registration error:', error);

        // Handle duplicate email error (User or Participant)
        if (error && typeof error === 'object' && 'code' in error && (error as any).code === 11000) {
            return NextResponse.json(
                { error: 'Team ID or Email collision. Please try again.' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}
