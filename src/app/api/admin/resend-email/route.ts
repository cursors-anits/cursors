
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import User from '@/lib/db/models/User';
import { sendEventPassEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { teamId } = await request.json();

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

        // Construct email members list from Participant records
        const emailMembers = participants.map(p => ({
            name: p.name,
            department: p.department,
            year: p.year,
            passkey: sharedPasskey
        }));

        const college = participants[0].college;

        let ticketType: any = 'combo';
        const typeStr = participants[0].type?.toLowerCase();
        if (typeStr?.includes('workshop')) ticketType = 'workshop';
        else if (typeStr?.includes('hackathon')) ticketType = 'hackathon';

        // Resend to ALL members' personal emails
        const personalEmails = participants.map(p => p.email);
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
