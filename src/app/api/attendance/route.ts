import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';

/**
 * POST /api/attendance
 * Mark attendance for participants
 * 
 * This endpoint uses MongoDB's atomic $set operation to safely handle
 * concurrent updates from multiple coordinators marking attendance simultaneously.
 */
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { participantIds, mode, day } = body;

        // Validation
        if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
            return NextResponse.json(
                { error: 'participantIds array is required' },
                { status: 400 }
            );
        }

        if (!mode) {
            return NextResponse.json(
                { error: 'mode is required' },
                { status: 400 }
            );
        }

        // Build update object based on mode
        const updateField: Record<string, Date> = {};
        const now = new Date();

        if (mode === 'workshop') {
            if (!day || !['1', '2', '3'].includes(day)) {
                return NextResponse.json(
                    { error: 'Valid day (1, 2, or 3) is required for workshop mode' },
                    { status: 400 }
                );
            }
            updateField[`workshopDay${day}`] = now;
        } else if (mode === 'hackathon') {
            updateField.hackathonAttendance = now;
        } else if (mode === 'entry') {
            updateField.entryGateTimestamp = now;
        } else if (mode === 'exit') {
            updateField.exitGateTimestamp = now;
        } else if (mode === 'snacks') {
            if (!day) {
                return NextResponse.json(
                    { error: 'day is required for snacks mode' },
                    { status: 400 }
                );
            }
            const snacksField = day === 'hackathon' ? 'snacksHackathon' : `snacksDay${day}`;
            updateField[snacksField] = now;
        } else {
            return NextResponse.json(
                { error: 'Invalid mode. Must be: workshop, hackathon, entry, exit, or snacks' },
                { status: 400 }
            );
        }

        // Atomic update using $set - safe for concurrent operations
        // Multiple coordinators can mark different participants simultaneously
        const result = await Participant.updateMany(
            { _id: { $in: participantIds } },
            { $set: updateField }
        );

        return NextResponse.json({
            success: true,
            updated: result.modifiedCount,
            timestamp: now.toISOString(),
            field: Object.keys(updateField)[0]
        }, { status: 200 });

    } catch (error) {
        console.error('Mark attendance error:', error);
        return NextResponse.json(
            { error: 'Failed to mark attendance', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
