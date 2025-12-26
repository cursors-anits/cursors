import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import ProblemAssignment from '@/lib/db/models/ProblemAssignment';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const assignment = await ProblemAssignment.findOne({
            participantId: id
        });

        if (!assignment) {
            return NextResponse.json(
                { error: 'No problem assignment found for this participant' },
                { status: 404 }
            );
        }

        // Self-Healing: If assignment is confirmed but Participant might not be (due to schema bug), fix it.
        // We do this check on read to ensure consistency without manual intervention.
        if (assignment.isConfirmed) {
            import('@/lib/db/models/Participant').then(async ({ default: Participant }) => {
                await Participant.updateOne(
                    { participantId: id, hasConfirmedProblem: { $ne: true } },
                    {
                        hasConfirmedProblem: true,
                        domain: assignment.selectedProblem?.domain,
                        problemAssignmentId: assignment._id
                    }
                ).catch(err => console.error('Self-healing failed:', err));
            });
        }

        return NextResponse.json({
            success: true,
            assignment: {
                participantId: assignment.participantId,
                teamId: assignment.teamId,
                offeredProblems: assignment.offeredProblems,
                selectedProblem: assignment.selectedProblem,
                isConfirmed: assignment.isConfirmed,
                refreshCount: assignment.refreshCount,
                maxRefreshes: assignment.maxRefreshes,
                canRefresh: assignment.refreshCount < assignment.maxRefreshes && !assignment.isConfirmed,
                assignedAt: assignment.assignedAt,
                selectedAt: assignment.selectedAt,
                confirmedAt: assignment.confirmedAt
            }
        });
    } catch (error) {
        console.error('Error fetching problem assignment:', error);
        return NextResponse.json(
            { error: 'Failed to fetch problem assignment' },
            { status: 500 }
        );
    }
}
