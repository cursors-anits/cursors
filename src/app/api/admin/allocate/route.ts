import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Lab from '@/lib/db/models/Lab';
import Participant from '@/lib/db/models/Participant';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const eventType = searchParams.get('type');

        if (eventType !== 'Hackathon') {
            return NextResponse.json({ error: 'Only Hackathon allocation is supported.' }, { status: 400 });
        }

        console.log(`[ALLOCATION] Starting advanced allocation for ${eventType}...`);

        // 1. Get relevant labs and reset counts
        const labs = await Lab.find({ type: eventType });
        if (labs.length === 0) {
            return NextResponse.json({ error: `No labs found for ${eventType}` }, { status: 400 });
        }

        // Reset counts for these labs only
        await Lab.updateMany({ type: eventType }, { currentCount: 0 });

        // 2. Get relevant participants
        // Fetch all participants to ensure we cover everyone
        const allParticipants = await Participant.find({});
        console.log(`[ALLOCATION] Found ${allParticipants.length} eligible participants.`);

        // Group participants by Team ID
        const teams = new Map<string, any[]>();
        allParticipants.forEach(p => {
            if (p.teamId) {
                if (!teams.has(p.teamId)) teams.set(p.teamId, []);
                teams.get(p.teamId)!.push(p);
            }
        });

        // Sort teams by size (Descending: 5 -> 1)
        const sortedTeams = Array.from(teams.values()).sort((a, b) => b.length - a.length);

        // 3. Prepare Lab State with Seating Config
        // We track used slots for each size in each lab
        const labStates = labs.map(l => ({
            id: l._id,
            name: l.name,
            capacity: l.capacity,
            current: 0,
            seatingConfig: l.seatingConfig || { size5: 0, size4: 0, size3: 0, size2: 0, size1: 0 },
            usedSlots: { size5: 0, size4: 0, size3: 0, size2: 0, size1: 0 }
        }));

        const allocations: { participantId: string, labName: string, seatId: string }[] = [];
        const unallocatedTeams: { teamId: string, size: number, reason: string }[] = [];

        // Helper to convert number to Alpha (0->A, 1->B ... 26->AA)
        const toAlpha = (num: number): string => {
            let s = '';
            let t = num;
            while (t >= 0) {
                s = String.fromCharCode((t % 26) + 65) + s;
                t = Math.floor(t / 26) - 1;
            }
            return s;
        };

        // 4. Allocation Algorithm
        for (const teamMembers of sortedTeams) {
            const teamSize = teamMembers.length;
            const teamId = teamMembers[0].teamId;

            // Determine the target slot size (exact match first)
            // If team size is > 5, we treat as 5 for now or log error? Assuming max team size is 5 based on schema.
            // If team size is 0, skip.
            if (teamSize === 0) continue;

            const sizeKey = `size${teamSize}` as keyof typeof labStates[0]['seatingConfig'];

            let allocatedLab = null;
            let seatIndex = -1;

            // Try to find a lab with exact slot available
            // Strategy: Linear iteration to fill labs efficiently (greedy match).
            for (const lab of labStates) {
                const configCapacity = lab.seatingConfig[sizeKey] || 0;
                const used = lab.usedSlots[sizeKey] || 0;

                if (used < configCapacity && (lab.current + teamSize <= lab.capacity)) {
                    allocatedLab = lab;
                    seatIndex = used;
                    break;
                }
            }

            if (allocatedLab) {
                // Allocate
                allocatedLab.usedSlots[sizeKey]++;
                allocatedLab.current += teamSize;

                // Generate Seat ID: TeamSize + Index (e.g., 5A, 5B)
                const seatSuffix = toAlpha(seatIndex); // 0->A, 1->B
                const seatId = `${teamSize}${seatSuffix}`;

                teamMembers.forEach(member => {
                    allocations.push({
                        participantId: member.participantId,
                        labName: allocatedLab!.name,
                        seatId: seatId
                    });
                });
            } else {
                // Critical: No space for this specific team size
                // Current logic enforces strict allocation based on seating config.
                unallocatedTeams.push({ teamId, size: teamSize, reason: 'No matching slot available' });
            }
        }

        if (unallocatedTeams.length > 0) {
            // Fail fast mechanism to prevent partial allocation states.
            // Requires admin intervention (configuring more slots or handling specific teams).
            return NextResponse.json({
                error: `Allocation Incomplete: ${unallocatedTeams.length} teams could not be seated.`,
                details: unallocatedTeams.slice(0, 5), // Show first 5
                allocationsCount: allocations.length
            }, { status: 400 });
        }

        // 5. Update Database
        console.log(`[ALLOCATION] Updating ${allocations.length} participants...`);

        // Update Participants
        // Using Promise.all for parallel updates. For huge datasets, bulkWrite is better.
        const updatePromises = allocations.map(a =>
            Participant.updateOne(
                { participantId: a.participantId },
                {
                    assignedHackathonLab: a.labName,
                    assignedLab: a.labName,
                    assignedSeat: a.seatId
                }
            )
        );

        // Update Labs
        const labUpdatePromises = labStates.map(l =>
            Lab.findByIdAndUpdate(l.id, { currentCount: l.current })
        );

        await Promise.all([...updatePromises, ...labUpdatePromises]);

        return NextResponse.json({
            success: true,
            message: `Successfully allocated ${allocations.length} participants (${sortedTeams.length} teams) across ${labStates.length} labs.`
        });

    } catch (error) {
        console.error('Allocation Error:', error);
        return NextResponse.json({ error: 'Failed to perform allocation' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const eventType = searchParams.get('type');

        if (eventType !== 'Hackathon') {
            return NextResponse.json({ error: 'Only Hackathon allocation revert is supported.' }, { status: 400 });
        }

        console.log(`[ALLOCATION REVERT] Reverting allocation for ${eventType}...`);

        // 1. Reset Participants
        // Clear assignedHackathonLab and also assignedLab (since allocation sets both)
        await Participant.updateMany(
            {},
            {
                $unset: { assignedHackathonLab: 1 },
                $set: { assignedLab: '' } // Clear the legacy field too
            }
        );

        // 2. Reset Labs count
        await Lab.updateMany({ type: eventType }, { currentCount: 0 });

        return NextResponse.json({
            success: true,
            message: `Reverted allocation for ${eventType}. All participants unassigned from labs.`
        });

    } catch (error) {
        console.error('Revert Allocation Error:', error);
        return NextResponse.json({ error: 'Failed to revert allocation' }, { status: 500 });
    }
}
