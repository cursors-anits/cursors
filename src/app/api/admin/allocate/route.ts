import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Lab from '@/lib/db/models/Lab';
import Participant from '@/lib/db/models/Participant';

export async function POST() {
    try {
        await dbConnect();

        // 1. Get all labs and reset counts
        const labs = await Lab.find({});
        await Lab.updateMany({}, { currentCount: 0 });

        // 2. Get all participants and group by teamId
        const allParticipants = await Participant.find({});
        const teams = new Map<string, any[]>();
        allParticipants.forEach(p => {
            if (!teams.has(p.teamId)) teams.set(p.teamId, []);
            teams.get(p.teamId)!.push(p);
        });

        const sortedTeams = Array.from(teams.values()).sort((a, b) => b.length - a.length);

        // 3. Allocation Algorithm
        const allocations = [];
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
                // No room in any lab
                return NextResponse.json({
                    error: `Critical: No space left for team ${teamId} (Size: ${teamSize}). Please add more labs.`,
                    remainingTeams: sortedTeams.length - allocations.length
                }, { status: 400 });
            }
        }

        // 4. Update Database
        const updatePromises = allocations.map(a =>
            Participant.updateMany({ teamId: a.teamId }, { assignedLab: a.labName })
        );
        const labUpdatePromises = labStates.map(l =>
            Lab.findByIdAndUpdate(l.id, { currentCount: l.current })
        );

        await Promise.all([...updatePromises, ...labUpdatePromises]);

        return NextResponse.json({
            success: true,
            message: `Allocated ${allocations.length} teams across ${labStates.length} labs.`
        });

    } catch (error) {
        console.error('Allocation Error:', error);
        return NextResponse.json({ error: 'Failed to perform allocation' }, { status: 500 });
    }
}
