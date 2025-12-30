
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import User from '@/lib/db/models/User';
import { sendEventPassEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { teamId, memberIds } = await request.json();

        if (!teamId) {
            return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
        }

        // Fetch all participants for this team
        const participants = await Participant.find({ teamId });

        if (!participants || participants.length === 0) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        // Fetch the SINGLE Team User to get shared passkey and login email
        const teamUser = await User.findOne({ teamId, role: 'participant' });

        if (!teamUser) {
            return NextResponse.json({ error: 'Team credentials not found' }, { status: 404 });
        }

        const teamEmail = teamUser.email;
        const sharedPasskey = teamUser.passkey || 'N/A';

        // Define college here so it's available for emailMembers mapping
        const college = participants[0].college;

        // Construct email members list from Participant records (ALL members for context)
        const emailMembers = participants.map(p => ({
            name: p.name,
            college: p.college || college, // Use participant's college or fallback to team college
            department: p.department || '',
            year: p.year || '',
            passkey: sharedPasskey // Team-level shared passkey
        }));

        const ticketType: any = 'hackathon';
        // All participants are hackathon type now

        // Determine who to send to
        let targetParticipants = participants;
        if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
            targetParticipants = participants.filter(p => memberIds.includes(p._id.toString()));
        }

        // Resend only to TARGET members' personal emails
        const personalEmails = targetParticipants.map(p => p.email);
        const results = await Promise.allSettled(personalEmails.map(email =>
            sendEventPassEmail(email, teamId, emailMembers, college, ticketType, teamEmail, sharedPasskey)
        ));

        const failed = results.filter(r => r.status === 'rejected');

        if (failed.length > 0) {
            return NextResponse.json({
                warning: `Sent with ${failed.length} errors`,
                count: personalEmails.length - failed.length
            }, { status: 207 });
        }

        return NextResponse.json({ success: true, count: personalEmails.length });

    } catch (error: any) {
        console.error('Resend error:', error);
        return NextResponse.json({ error: error.message || 'Failed to resend' }, { status: 500 });
    }
}
