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

        // Get all participants
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

        // 1. Group Participants by Seat (Team)
        // Key: `${labName}::${seatId}`
        // This ensures the whole team gets the SAME options (consistency)
        const seatGroups = new Map<string, typeof participants>();

        participants.forEach(p => {
            const lab = p.assignedLab || 'Unassigned';
            const seat = p.assignedSeat || 'Unassigned';
            const key = `${lab}::${seat}`;

            if (!seatGroups.has(key)) seatGroups.set(key, []);
            seatGroups.get(key)!.push(p);
        });

        // 2. Sort Seats
        // Order: Lab -> Team Size (Desc) -> Seat Alpha (Asc)
        // This effectively creates a linear walk through the lab seats
        const sortedKeys = Array.from(seatGroups.keys()).sort((keyA, keyB) => {
            const [labA, seatA] = keyA.split('::');
            const [labB, seatB] = keyB.split('::');

            if (labA !== labB) return labA.localeCompare(labB);

            // Parse Seat: "5A" -> size 5, alpha A
            const getSeatParts = (s: string) => {
                const match = s?.match(/^(\d+)([A-Z]+)$/);
                if (match) return { size: parseInt(match[1]), alpha: match[2] };
                return { size: 0, alpha: s || '' };
            };

            const pA = getSeatParts(seatA);
            const pB = getSeatParts(seatB);

            if (pA.size !== pB.size) return pB.size - pA.size; // Size Desc
            return pA.alpha.localeCompare(pB.alpha); // Alpha Asc
        });

        // 3. Allocate Problem Sets with Spatial Awareness (History Buffer)
        // Buffer Size = 15. This assumes row widths < 15. 
        // We ensure current set is distinct from ANY set in the last 15 seats.
        const ROW_BUFFER_SIZE = 15;
        const TOTAL_PROBLEMS = 50;

        const assignments = [];
        const labHistory = new Map<string, string[][]>(); // LabName -> Array of lastSets

        console.log(`[PROBLEM ALLOCATION] Processing ${sortedKeys.length} seats (teams)...`);

        for (const key of sortedKeys) {
            const [lab, seat] = key.split('::');
            const groupMembers = seatGroups.get(key)!;

            if (!labHistory.has(lab)) labHistory.set(lab, []);
            const history = labHistory.get(lab)!;

            // Generate a set distinct from History Window
            let offered: string[] = [];
            let attempts = 0;
            let isValid = false;

            while (!isValid && attempts < 20) {
                offered = [];
                // Pick 3 random problems
                while (offered.length < 3) {
                    const pId = Math.floor(Math.random() * TOTAL_PROBLEMS) + 1;
                    const pStr = `Problem ${pId}`;
                    if (!offered.includes(pStr)) offered.push(pStr);
                }
                offered.sort();

                // Use a 'soft' conflict check first (no intersection >= 2)
                let closeConflict = false;
                const lookback = history.slice(-ROW_BUFFER_SIZE);

                for (const prevSet of lookback) {
                    // Check overlap: if 2 or more problems are same, it's too similar
                    const intersection = prevSet.filter(x => offered.includes(x));
                    if (intersection.length >= 2) {
                        closeConflict = true;
                        break;
                    }
                }

                if (!closeConflict) isValid = true;
                attempts++;
            }

            // Record history
            history.push(offered);
            if (history.length > 50) history.shift();

            // Assign to ALL members of this seat
            for (const participant of groupMembers) {
                const assignment = new ProblemAssignment({
                    participantId: participant.participantId,
                    teamId: participant.teamId,
                    offeredProblems: offered,
                    isConfirmed: false,
                    assignedBy: adminEmail,
                    assignedAt: new Date()
                });

                const saved = await assignment.save();

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
                    seatId: seat,
                    assignedProblems: 3 // count
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Allocated problem statements to ${assignments.length} participants (${sortedKeys.length} Teams) with spatial separation.`,
            allocated: assignments.length,
            assignments: assignments.slice(0, 50)
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
