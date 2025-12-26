import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import ProblemAssignment from '@/lib/db/models/ProblemAssignment';


export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Check admin authorization (you can enhance this with proper auth)
        const { adminEmail } = await request.json();

        if (!adminEmail) {
            return NextResponse.json(
                { error: 'Admin email required' },
                { status: 401 }
            );
        }

        // Get all participants (with or without assigned seats)
        // For neighbor-aware allocation, seats are optional - algorithm handles it gracefully
        const participants = await Participant.find({});

        if (participants.length === 0) {
            return NextResponse.json(
                { error: 'No participants found' },
                { status: 400 }
            );
        }

        // Check if allocation already exists
        const existingCount = await ProblemAssignment.countDocuments();
        if (existingCount > 0) {
            return NextResponse.json(
                {
                    error: 'Problem statements have already been allocated',
                    existing: existingCount
                },
                { status: 400 }
            );
        }

        // Prepare participant seat data
        const participantSeats = participants.map(p => ({
            participantId: p.participantId,
            teamId: p.teamId,
            lab: p.assignedLab || '',
            seat: p.assignedSeat || ''
        }));

        // Initialize empty assignments for all participants to enable choices
        const assignments = [];
        for (const participant of participants) {
            const assignment = new ProblemAssignment({
                participantId: participant.participantId,
                teamId: participant.teamId,
                offeredProblems: [], // Empty initially to trigger selection flow
                isConfirmed: false,
                refreshCount: 0,
                maxRefreshes: 2,
                refreshHistory: [],
                assignedBy: adminEmail,
                assignedAt: new Date()
            });

            const saved = await assignment.save();

            // Update participant reference
            await Participant.updateOne(
                { participantId: participant.participantId },
                {
                    problemAssignmentId: saved._id,
                    hasConfirmedProblem: false
                }
            );

            assignments.push({
                participantId: participant.participantId,
                teamId: participant.teamId,
                assignedProblems: 0
            });
        }

        return NextResponse.json({
            success: true,
            message: `Allocated problem statements to ${assignments.length} participants`,
            allocated: assignments.length,
            assignments
        });

    } catch (error) {
        console.error('Error allocating problems:', error);
        return NextResponse.json(
            { error: 'Failed to allocate problem statements', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
