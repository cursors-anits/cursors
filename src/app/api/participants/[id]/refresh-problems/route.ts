import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import ProblemAssignment from '@/lib/db/models/ProblemAssignment';
import { refreshProblemsForParticipant } from '@/lib/algorithms/problemAllocation';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        // Get current assignment
        const assignment = await ProblemAssignment.findOne({
            participantId: id
        });

        if (!assignment) {
            return NextResponse.json(
                { error: 'No problem assignment found' },
                { status: 404 }
            );
        }

        // Check if refresh is allowed
        if (assignment.isConfirmed) {
            return NextResponse.json(
                { error: 'Cannot refresh after confirmation' },
                { status: 400 }
            );
        }

        if (assignment.refreshCount >= assignment.maxRefreshes) {
            return NextResponse.json(
                {
                    error: 'Refresh limit reached',
                    refreshCount: assignment.refreshCount,
                    maxRefreshes: assignment.maxRefreshes
                },
                { status: 400 }
            );
        }

        // Get participant and all participants for neighbor detection
        const participant = await Participant.findOne({ participantId: id });
        if (!participant) {
            return NextResponse.json(
                { error: 'Participant not found' },
                { status: 404 }
            );
        }

        const allParticipants = await Participant.find({});

        // Get all current assignments for neighbor checking
        const allAssignments = await ProblemAssignment.find();
        const assignmentMap = new Map();
        allAssignments.forEach(a => {
            assignmentMap.set(
                a.participantId,
                a.offeredProblems.map(p => [p.domainIndex, p.problemIndex])
            );
        });

        // Prepare participant seats (use empty strings if not assigned)
        const participantSeats = allParticipants.map(p => ({
            participantId: p.participantId,
            teamId: p.teamId,
            lab: p.assignedLab || '',
            seat: p.assignedSeat || ''
        }));

        const currentSeat = participantSeats.find(p => p.participantId === id) || {
            participantId: id,
            teamId: participant.teamId,
            lab: '',
            seat: ''
        };

        // Get current problems to avoid
        const currentProblems = assignment.offeredProblems.map(p => [p.domainIndex, p.problemIndex]);

        // Generate 1 new problem to add (cumulative approach)
        const newProblem = refreshProblemsForParticipant(
            currentSeat,
            participantSeats,
            assignmentMap,
            currentProblems
        );

        // Save refresh history
        assignment.refreshHistory.push({
            timestamp: new Date(),
            previousOptions: currentProblems
        });

        // ADD the new problem to existing ones (cumulative)
        assignment.offeredProblems = [...assignment.offeredProblems, ...newProblem];
        assignment.refreshCount += 1;

        await assignment.save();

        return NextResponse.json({
            success: true,
            message: 'New problem option added successfully',
            assignment: {
                participantId: assignment.participantId,
                offeredProblems: assignment.offeredProblems,
                refreshCount: assignment.refreshCount,
                maxRefreshes: assignment.maxRefreshes,
                canRefresh: assignment.refreshCount < assignment.maxRefreshes
            }
        });

    } catch (error) {
        console.error('Error refreshing problems:', error);
        return NextResponse.json(
            { error: 'Failed to refresh problems', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
