import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import ProblemAssignment from '@/lib/db/models/ProblemAssignment';
import { PROBLEM_STATEMENTS } from '@/lib/data/problemStatements';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Check admin authorization
        const { adminEmail } = await request.json();

        if (!adminEmail) {
            return NextResponse.json(
                { error: 'Admin email required' },
                { status: 401 }
            );
        }

        // Get all participants
        // Optimization: Lean query (only needed fields)
        const participants = await Participant.find({}).select('participantId teamId assignedLab assignedSeat name');

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

        // 1. Group by Team
        // We allocate to the TEAM, not the seat (though seat usually == team)
        // Grouping by teamId is safer for unassigned participants.
        const teamGroups = new Map<string, typeof participants>();

        participants.forEach(p => {
            const teamId = p.teamId || 'UnknownTeam';
            if (!teamGroups.has(teamId)) teamGroups.set(teamId, []);
            teamGroups.get(teamId)!.push(p);
        });

        // 2. Prepare Data Source
        // Flatten all problems into a single array
        const allProblems: { domainIndex: number; problemIndex: number; domain: string; problem: string }[] = [];
        PROBLEM_STATEMENTS.forEach((domain, dIdx) => {
            domain.problems.forEach((prob, pIdx) => {
                allProblems.push({
                    domainIndex: dIdx,
                    problemIndex: pIdx,
                    domain: domain.domain,
                    problem: prob
                });
            });
        });

        console.log(`[PROBLEM ALLOCATION] Processing ${teamGroups.size} teams...`);

        const bulkAssignments = [];
        const updateOps = [];

        // 3. Allocate
        // Simple random allocation for now (Spatial separation requirement is tricky without Seat sorting, 
        // but if we want strictly random "3 options" from the real list, shuffling is best).
        // Since we have ~50-60 total problems, calling random for each team is fine.

        for (const [teamId, members] of teamGroups) {
            // Pick 3 unique random problems
            // Fisher-Yates shuffle concept or simple splice clone
            // Since we need only 3, a full shuffle is expensive if array is huge, but here it's small (~100 items).

            const shuffled = [...allProblems].sort(() => 0.5 - Math.random());
            const offered = shuffled.slice(0, 3);

            // Assign to ALL members of the team
            for (const participant of members) {
                // We need to know the _id of the inserted assignment to update Participant.
                // However, bulkInsert doesn't easily return mapped _ids for subsequent updates unless we generate _id client-side.
                // Mongoose can generate _id. 
                // Better approach: Generate _id manually here.
                const assignmentId = new mongoose.Types.ObjectId();

                // Prepare ProblemAssignment document
                // Prepare ProblemAssignment document with EMPTY offeredProblems
                const assignmentData = {
                    _id: assignmentId,
                    participantId: participant.participantId,
                    teamId: participant.teamId,
                    offeredProblems: [], // Empty to trigger Domain Selection UI
                    isConfirmed: false,
                    assignedBy: adminEmail,
                    assignedAt: new Date()
                };

                bulkAssignments.push(assignmentData);

                updateOps.push({
                    updateOne: {
                        filter: { participantId: participant.participantId },
                        update: {
                            problemAssignmentId: assignmentId,
                            hasConfirmedProblem: false
                        }
                    }
                });
            }
        }

        // 4. Batch Write
        // A. Insert Assignments
        if (bulkAssignments.length > 0) {
            await ProblemAssignment.insertMany(bulkAssignments);
        }

        // B. Update Participants
        // Participant.bulkWrite is efficient
        if (updateOps.length > 0) {
            await Participant.bulkWrite(updateOps);
        }

        return NextResponse.json({
            success: true,
            message: `Allocated problem statements to ${bulkAssignments.length} participants (${teamGroups.size} Teams).`,
            allocated: bulkAssignments.length,
            sample: bulkAssignments.slice(0, 3)
        });

    } catch (error) {
        console.error('Error allocating problems:', error);
        return NextResponse.json(
            { error: 'Failed to allocate problem statements', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();

        // 1. Delete all problem assignments
        const deleteResult = await ProblemAssignment.deleteMany({});

        // 2. Reset all participants
        const updateResult = await Participant.updateMany(
            {},
            {
                $unset: { problemAssignmentId: 1 },
                $set: { hasConfirmedProblem: false }
            }
        );

        return NextResponse.json({
            success: true,
            message: `Reverted problem allocation. Deleted ${deleteResult.deletedCount} assignments.`,
            deletedCount: deleteResult.deletedCount
        });

    } catch (error) {
        console.error('Revert Problem Allocation Error:', error);
        return NextResponse.json({ error: 'Failed to revert problem allocation' }, { status: 500 });
    }
}
