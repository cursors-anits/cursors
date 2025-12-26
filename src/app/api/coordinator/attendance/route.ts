import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { teamId, type, status } = body; // status ('present'|'absent') is used for logging/toast but backend logic uses timestamps

        if (!teamId || !type) {
            return NextResponse.json({ error: 'TeamId and Type are required' }, { status: 400 });
        }

        const now = new Date();
        const updateField: Record<string, any> = {};

        // Mapping logic consistent with existing attendance requirements
        // Default to day 1 if not specified 
        // OR we should have required 'day' in the payload. 
        // Given the simplified frontend call, we assume a "Mark Present" button for the *current* relevant session.
        // However, looking at standard hackathon flows:

        if (type === 'hackathon') {
            updateField.hackathonAttendance = now;
        } else if (type === 'hackathon_exit') {
            updateField.exitGateTimestamp = now;
        } else {
            // Entry/Snacks/etc if needed
            if (type === 'entry') updateField.entryGateTimestamp = now;
        }

        // Logic: Find all participants in the team and update them
        // This effectively "marks attendance for the team"
        const result = await Participant.updateMany(
            { teamId: teamId },
            { $set: updateField }
        );

        return NextResponse.json({
            success: true,
            updated: result.modifiedCount,
            message: `Attendance marked for ${result.modifiedCount} members of team ${teamId}`
        });

    } catch (error: any) {
        console.error('Coordinator Attendance Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
