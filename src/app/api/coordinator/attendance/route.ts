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
        // If type is 'workshop', we might default to day 1 if not specified, 
        // OR we should have required 'day' in the payload. 
        // Given the simplified frontend call, we assume a "Mark Present" button for the *current* relevant session.
        // However, looking at standard hackathon flows:

        if (type === 'workshop') {
            // Assume Day 1 for now or handle logic. Ideally frontend sends day.
            // If frontend doesn't send day, we might need to deduce it or update specific field.
            // Safe bet: Update 'workshopDay1' or use a generic 'workshopAttendance' field if schema allows.
            // Existing schema (from api/attendance/route.ts) has workshopDay1, workshopDay2, workshopDay3.
            // Let's assume Day 1 for simplified flow unless we see 'day' in payload.
            // BETTER: Check if the payload *can* accept day, and update DataContext to pass it if needed.
            // For now, let's include 'workshopDay1' as default or inspect body.day if I add it.
            // Checking body.day...
            const day = body.day || '1';
            updateField[`workshopDay${day}`] = now;
        } else if (type === 'hackathon') {
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
