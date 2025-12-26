import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import ProblemAssignment from '@/lib/db/models/ProblemAssignment';
import { getNeighbors } from '@/lib/algorithms/problemAllocation';
import { getAllProblems, randomSample } from '@/lib/data/problemStatements';

// Importing types
import type { IOfferedProblem } from '@/lib/db/models/ProblemAssignment';

interface ParticipantSeat {
    participantId: string;
    teamId: string;
    lab: string;
    seat: string;
}

interface ProblemType {
    domainIndex: number;
    problemIndex: number;
    domain: string;
    problem: string;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { domain } = await request.json();
        const { id } = await params;

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        // 1. Get Assignment
        let assignment = await ProblemAssignment.findOne({ participantId: id });
        if (!assignment) {
            // Should usually exist if "Allocated" state is true, but handle case where it doesn't
            return NextResponse.json({ error: 'Assignment not found. Please wait for admin allocation.' }, { status: 404 });
        }

        if (assignment.isConfirmed) {
            return NextResponse.json({ error: 'Problem already confirmed' }, { status: 400 });
        }

        // 2. Neighbor Logic Setup
        const participant = await Participant.findOne({ participantId: id });
        if (!participant) return NextResponse.json({ error: 'Participant not found' }, { status: 404 });

        // Update participant domain preference immediately
        participant.domain = domain;
        await participant.save();

        const allParticipants = await Participant.find({});
        const allAssignments = await ProblemAssignment.find();

        const assignmentMap = new Map<string, number[][]>();
        allAssignments.forEach(a => {
            assignmentMap.set(
                a.participantId,
                a.offeredProblems.map(p => [p.domainIndex, p.problemIndex])
            );
        });

        // Prepare seats
        const participantSeats: ParticipantSeat[] = allParticipants.map(p => ({
            participantId: p.participantId,
            teamId: p.teamId,
            lab: p.assignedLab || '',
            seat: p.assignedSeat || ''
        }));

        const currentSeat = participantSeats.find((p: ParticipantSeat) => p.participantId === id);

        let neighborProblems: number[][] = [];
        if (currentSeat && currentSeat.seat) {
            // Only check neighbors if seat is assigned
            const neighbors = getNeighbors(currentSeat, participantSeats);
            neighborProblems = neighbors.flatMap(n => assignmentMap.get(n.participantId) || []);
        }

        const neighborProblemSet = new Set(neighborProblems.map(p => `${p[0]}-${p[1]}`));

        // 3. Problem Selection Logic
        const allProb = getAllProblems();

        // Filter by Domain
        const sameDomainProblems = allProb.filter((p: ProblemType) => p.domain === domain && !neighborProblemSet.has(`${p.domainIndex}-${p.problemIndex}`));
        const otherDomainProblems = allProb.filter((p: ProblemType) => p.domain !== domain && !neighborProblemSet.has(`${p.domainIndex}-${p.problemIndex}`));

        // Fallbacks if filtered lists are empty (ignore neighbor constraint if impossible)
        const sameDomainPool = sameDomainProblems.length > 0 ? sameDomainProblems : allProb.filter((p: ProblemType) => p.domain === domain);
        const otherDomainPool = otherDomainProblems.length > 0 ? otherDomainProblems : allProb.filter((p: ProblemType) => p.domain !== domain);

        // Pick 2 from Same
        const pickedSame = randomSample<ProblemType>(sameDomainPool, 2);

        // Pick 1 from Other
        const pickedOther = randomSample<ProblemType>(otherDomainPool, 1);

        const newOffered: IOfferedProblem[] = [...pickedSame, ...pickedOther].map((p: ProblemType) => ({
            domainIndex: p.domainIndex,
            problemIndex: p.problemIndex,
            domain: p.domain,
            problem: p.problem
        }));

        // 4. Update Assignment
        assignment.offeredProblems = newOffered;
        await assignment.save();

        return NextResponse.json({
            success: true,
            assignment: {
                participantId: assignment.participantId,
                offeredProblems: assignment.offeredProblems,
                refreshCount: assignment.refreshCount,
                canRefresh: false // Refresh disabled per requirements
            }
        });

    } catch (error) {
        console.error('Error allocating domain problems:', error);
        return NextResponse.json(
            { error: 'Failed to allocate problems' },
            { status: 500 }
        );
    }
}
