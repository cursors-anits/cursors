import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Lab from '@/lib/db/models/Lab';
import Participant from '@/lib/db/models/Participant';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const eventType = searchParams.get('type') as 'Workshop' | 'Hackathon' | null;

        if (!eventType || !['Workshop', 'Hackathon'].includes(eventType)) {
            return NextResponse.json({ error: 'Valid type (Workshop or Hackathon) is required' }, { status: 400 });
        }

        console.log(`[ALLOCATION] Starting allocation for ${eventType}...`);

        // 1. Get relevant labs and reset counts
        const labs = await Lab.find({ type: eventType });
        if (labs.length === 0) {
            return NextResponse.json({ error: `No labs found for ${eventType}` }, { status: 400 });
        }

        // Reset counts for these labs only
        await Lab.updateMany({ type: eventType }, { currentCount: 0 });

        // 2. Get relevant participants
        // Workshop: Workshop + Combo
        // Hackathon: Hackathon + Combo
        const participantQuery = eventType === 'Workshop'
            ? { type: { $in: ['Workshop', 'Combo'] } }
            : { type: { $in: ['Hackathon', 'Combo'] } };

        const allParticipants = await Participant.find(participantQuery);
        console.log(`[ALLOCATION] Found ${allParticipants.length} eligible participants.`);

        const teams = new Map<string, any[]>();
        allParticipants.forEach(p => {
            if (!teams.has(p.teamId)) teams.set(p.teamId, []);
            teams.get(p.teamId)!.push(p);
        });

        const sortedTeams = Array.from(teams.values()).sort((a, b) => b.length - a.length);

        // 3. Allocation Algorithm
        const allocations: { teamId: string, labName: string }[] = [];
        const labStates = labs.map(l => ({
            id: l._id,
            name: l.name,
            capacity: l.capacity,
            current: 0
        }));

        for (const teamMembers of sortedTeams) {
            const teamSize = teamMembers.length;
            const teamId = teamMembers[0].teamId;

            // Find best lab (smallest lab that can fit the team)
            let bestLab = null;
            for (const lab of labStates) {
                if (lab.current + teamSize <= lab.capacity) {
                    if (!bestLab || lab.capacity < bestLab.capacity) {
                        bestLab = lab;
                    }
                }
            }

            if (bestLab) {
                bestLab.current += teamSize;
                allocations.push({
                    teamId,
                    labName: bestLab.name
                });
            } else {
                // Return error if space runs out
                return NextResponse.json({
                    error: `Critical: No space left in ${eventType} labs for team ${teamId} (Size: ${teamSize}).`,
                    remainingTeams: sortedTeams.length - allocations.length
                }, { status: 400 });
            }
        }

        // 4. Update Database
        const targetField = eventType === 'Workshop' ? 'assignedWorkshopLab' : 'assignedHackathonLab';

        console.log(`[ALLOCATION] Updating ${allocations.length} teams...`);

        // Batch updates might be slow if done one by one, but reliable for Mongo
        // For performance, we can use bulkWrite if needed, but Promise.all is okay for < 1000 participants
        const updatePromises = allocations.map(a =>
            Participant.updateMany(
                { teamId: a.teamId },
                {
                    [targetField]: a.labName,
                    // Also update legacy/active assignedLab to the current allocation
                    assignedLab: a.labName
                }
            )
        );

        const labUpdatePromises = labStates.map(l =>
            Lab.findByIdAndUpdate(l.id, { currentCount: l.current })
        );

        await Promise.all([...updatePromises, ...labUpdatePromises]);

        return NextResponse.json({
            success: true,
            message: `Allocated ${allocations.length} teams across ${labStates.length} ${eventType} labs.`
        });

    } catch (error) {
        console.error('Allocation Error:', error);
        return NextResponse.json({ error: 'Failed to perform allocation' }, { status: 500 });
    }
}
