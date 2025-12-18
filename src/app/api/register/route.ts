import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import User from '@/lib/db/models/User';

// Helper to generate unique IDs
function generateTeamId(count: number): string {
    const num = String(count + 1).padStart(3, '0');
    return `VIBE-ID-${num}`;
}

function generateParticipantId(teamId: string, memberIndex: number): string {
    return `${teamId}-${memberIndex + 1}`;
}

function generatePasskey(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { members, college, city, ticketType, transactionId, screenshot } = body;

        if (!members || members.length === 0) {
            return NextResponse.json(
                { error: 'At least one team member is required' },
                { status: 400 }
            );
        }

        // Get current participant count to generate unique team ID
        const participantCount = await Participant.countDocuments();
        const teamId = generateTeamId(Math.floor(participantCount / 4)); // Approximate team count

        // Determine ticket type
        const typeMap: { [key: string]: 'Workshop' | 'Hackathon' | 'Combo' } = {
            workshop: 'Workshop',
            hackathon: 'Hackathon',
            combo: 'Combo',
        };
        const mappedType = typeMap[ticketType] || 'Combo';

        // Create participants and users
        const createdParticipants = [];
        const createdUsers = [];

        for (let i = 0; i < members.length; i++) {
            const member = members[i];
            const participantId = generateParticipantId(teamId, i);
            const passkey = generatePasskey();

            // Create User document
            const user = await User.create({
                email: member.email,
                name: member.fullName,
                role: 'participant',
                passkey: passkey,
                teamId: teamId,
            });

            // Create Participant document
            const participant = await Participant.create({
                participantId,
                teamId,
                name: member.fullName,
                email: member.email,
                college: college,
                department: member.department,
                whatsapp: member.whatsapp,
                year: member.year,
                linkedin: member.linkedin,
                type: mappedType,
                status: 'Pending', // Will be updated to 'Paid' after verification
                paymentScreenshotUrl: screenshot || '',
            });

            createdParticipants.push(participant);
            createdUsers.push({
                email: user.email,
                passkey: passkey,
                participantId,
            });
        }

        return NextResponse.json(
            {
                success: true,
                teamId,
                participants: createdUsers,
                message: 'Registration successful! Save your passkeys for login.',
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Registration error:', error);

        // Handle duplicate email error
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'One or more email addresses are already registered' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}
