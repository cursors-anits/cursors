import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import User from '@/lib/db/models/User';

function generatePasskey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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
        const { name, email, college, department, whatsapp, year, type, status, transactionId, teamId: existingTeamId } = body;

        let teamId = existingTeamId;

        if (!teamId) {
            // Generate IDs for new Team
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

            teamId = `VIBE-${String(nextTeamNum).padStart(3, '0')}`;
            const teamEmail = `${String(nextTeamNum).padStart(3, '0')}@vibe.com`;
            const passkey = generatePasskey();

            // Create Team User
            await User.create({
                email: teamEmail,
                name: `Team ${teamId}`,
                role: 'participant',
                passkey: passkey,
                teamId: teamId,
            });
        }

        // Determine Participant ID suffix
        const teamMembersCount = await Participant.countDocuments({ teamId });
        const participantId = `${teamId}-${teamMembersCount + 1}`;

        // Create Participant
        const newParticipant = await Participant.create({
            participantId,
            teamId,
            name,
            email,
            college,
            department,
            whatsapp,
            year,
            type: type || 'Hackathon',
            status: status || 'Confirmed',
            transactionId: transactionId || 'ADMIN_ADDED',
            isManual: true, // Flag as manually added
        });

        // --- Send Event Pass Email to ALL Team Members ---
        try {
            // 1. Fetch all updated members
            const allMembers = await Participant.find({ teamId });

            // 2. Fetch Team Password (Passkey)
            const teamUser = await User.findOne({ teamId });
            const passkey = teamUser?.passkey || 'CONTACT_ADMIN';

            // 3. Prepare Email Data
            const emailMembers = allMembers.map(m => ({
                name: m.name,
                college: m.college || 'Unknown',
                department: m.department || '',
                year: m.year?.toString() || '',
                passkey
            }));

            const collegeForEmail = allMembers[0]?.college || 'Unknown';
            const teamEmail = teamUser?.email || `${teamId}@vibe.com`;

            // 4. Send Emails in Background
            const personalEmails = allMembers.map(m => m.email);

            // Send to ALL members so everyone has the updated list/QR
            await Promise.allSettled(personalEmails.map(email =>
                import('@/lib/email').then(mod =>
                    mod.sendEventPassEmail(email, teamId, emailMembers, collegeForEmail, 'hackathon', teamEmail, passkey)
                )
            ));

        } catch (emailError) {
            console.error('Failed to send update emails:', emailError);
            // Don't fail the request, just log it
        }

        return NextResponse.json({ success: true, participant: newParticipant }, { status: 201 });
    } catch (error: any) {
        console.error('Admin Add Participant error:', error);
        return NextResponse.json({ error: error.message || 'Failed to add participant' }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const participants = await Participant.find().sort({ createdAt: -1 });
        return NextResponse.json(participants);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, _id, ...updateData } = body;
        const targetId = id || _id;

        if (!targetId) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const participant = await Participant.findByIdAndUpdate(targetId, updateData, { new: true });

        if (!participant) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, participant });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const participant = await Participant.findById(id);

        if (!participant) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        // Delete the participant
        await Participant.findByIdAndDelete(id);

        // Also delete the associated User document to prevent Team ID/Email collision
        if (participant.teamId) {
            await User.findOneAndDelete({ teamId: participant.teamId });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 });
    }
}
