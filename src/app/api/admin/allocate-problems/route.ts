import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import ProblemAssignment from '@/lib/db/models/ProblemAssignment';
import { allocateAllProblems } from '@/lib/algorithms/problemAllocation';

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

        // Run allocation algorithm
        const allocations = allocateAllProblems(participantSeats);

        // Save to database
        const assignments = [];
        for (const [participantId, offeredProblems] of allocations.entries()) {
            const participant = participants.find(p => p.participantId === participantId);
            if (!participant) continue;

            const assignment = new ProblemAssignment({
                participantId,
                teamId: participant.teamId,
                offeredProblems,
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
                { participantId },
                {
                    problemAssignmentId: saved._id,
                    hasConfirmedProblem: false
                }
            );

            assignments.push({
                participantId,
                teamId: participant.teamId,
                assignedProblems: offeredProblems.length
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
