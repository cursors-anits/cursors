import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { teamId, participantId, type, status } = body; // status ('present'|'absent') is used for logging/toast but backend logic uses timestamps

        if ((!teamId && !participantId) || !type) {
            return NextResponse.json({ error: 'TeamId OR ParticipantId, and Type are required' }, { status: 400 });
        }

        const now = new Date();

        // Mapping logic consistent with existing attendance requirements
        // Default to day 1 if not specified 
        // OR we should have required 'day' in the payload. 
        // Given the simplified frontend call, we assume a "Mark Present" button for the *current* relevant session.
        // However, looking at standard hackathon flows:

        let updateOperation: any = {};

        if (type === 'hackathon') {
            updateOperation = { $set: { hackathonAttendance: now } };
        } else if (type === 'hackathon_exit') {
            updateOperation = { $set: { exitGateTimestamp: now } };
        } else if (type === 'entry') {
            updateOperation = { $set: { entryGateTimestamp: now } };
        } else if (type === 'snacks') {
            const snackTag = `Snacks (${now.toLocaleTimeString()})`;
            updateOperation = { $push: { foodAttendance: snackTag } };
        }

        // Logic: Find participants
        if (Object.keys(updateOperation).length > 0) {
            const query = participantId ? { _id: participantId } : { teamId: teamId };
            const result = await Participant.updateMany(
                query,
                updateOperation
            );

            return NextResponse.json({
                success: true,
                updated: result.modifiedCount,
                message: `Attendance marked`
            });
        }

        return NextResponse.json({ success: false, message: "No valid type specified" });

    } catch (error: any) {
        console.error('Coordinator Attendance Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
