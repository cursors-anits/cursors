import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import ProblemAssignment from '@/lib/db/models/ProblemAssignment';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { selectedProblemIndex, type, customProblem } = await request.json();
        const { id } = await params;

        // Get assignment
        const assignment = await ProblemAssignment.findOne({
            participantId: id
        });

        if (!assignment) {
            return NextResponse.json(
                { error: 'No problem assignment found' },
                { status: 404 }
            );
        }

        // Check if already confirmed
        if (assignment.isConfirmed) {
            return NextResponse.json(
                {
                    error: 'Problem already confirmed',
                    selectedProblem: assignment.selectedProblem
                },
                { status: 400 }
            );
        }

        let selectedProblem;

        if (type === 'custom') {
            if (!customProblem || typeof customProblem !== 'string' || customProblem.trim().length < 10) {
                return NextResponse.json(
                    { error: 'Invalid custom problem statement. Must be at least 10 characters.' },
                    { status: 400 }
                );
            }
            selectedProblem = {
                domainIndex: -1,
                problemIndex: -1,
                domain: 'Open Innovation',
                problem: customProblem.trim()
            };
        } else {
            if (selectedProblemIndex === undefined || selectedProblemIndex < 0 || selectedProblemIndex > 2) {
                return NextResponse.json(
                    { error: 'Invalid problem selection. Must be 0, 1, or 2' },
                    { status: 400 }
                );
            }
            selectedProblem = assignment.offeredProblems[selectedProblemIndex];
            if (!selectedProblem) {
                return NextResponse.json(
                    { error: 'Selected problem not found in offered problems' },
                    { status: 400 }
                );
            }
        }

        // Update assignment
        // Update assignment for ALL team members to ensure data consistency
        await ProblemAssignment.updateMany(
            { teamId: assignment.teamId },
            {
                $set: {
                    selectedProblem: selectedProblem,
                    isConfirmed: true,
                    selectedAt: new Date(),
                    confirmedAt: new Date()
                }
            }
        );

        // Update ALL participants in the team
        await Participant.updateMany(
            { teamId: assignment.teamId },
            {
                hasConfirmedProblem: true,
                domain: selectedProblem.domain // Update domain to match selection
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Problem statement confirmed successfully',
            selectedProblem: {
                domain: selectedProblem.domain,
                problem: selectedProblem.problem,
                domainIndex: selectedProblem.domainIndex,
                problemIndex: selectedProblem.problemIndex
            },
            confirmedAt: assignment.confirmedAt
        });

    } catch (error) {
        console.error('Error confirming problem:', error);
        return NextResponse.json(
            { error: 'Failed to confirm problem selection', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
