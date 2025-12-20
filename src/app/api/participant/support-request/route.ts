import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import SupportRequest from '@/lib/db/models/SupportRequest';
import Participant from '@/lib/db/models/Participant';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { type, teamId, message } = body;

        if (!type || !teamId) {
            return NextResponse.json({ error: 'Type and Team ID are required' }, { status: 400 });
        }

        // Find the lab for this team
        const participant = await Participant.findOne({ teamId });
        if (!participant) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const labName = participant.assignedLab || 'Unassigned';

        const supportRequest = await SupportRequest.create({
            type,
            teamId,
            message: message || '',
            labName,
            status: 'Open',
            timestamp: Date.now()
        });

        return NextResponse.json(supportRequest, { status: 201 });
    } catch (error) {
        console.error('Support Request Error:', error);
        return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }
}
