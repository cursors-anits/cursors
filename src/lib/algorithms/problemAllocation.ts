// Problem statement allocation algorithm with neighbor-awareness

import { getAllProblems, randomSample } from '@/lib/data/problemStatements';
import type { IOfferedProblem } from '@/lib/db/models/ProblemAssignment';

interface ParticipantSeat {
    participantId: string;
    teamId: string;
    lab: string;
    seat: string;
}

interface NeighborInfo {
    participantId: string;
    seat: string;
    assignedProblems?: number[][]; // [domainIndex, problemIndex]
}

/**
 * Parse seat number from seat string (e.g., "L1-A-12" → 12, "L2-B-5" → 5)
 */
function parseSeatNumber(seat: string): number | null {
    const match = seat.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Get row letter from seat string (e.g., "L1-A-12" → "A", "L2-B-5" → "B")
 */
function getSeatRow(seat: string): string | null {
    const match = seat.match(/[A-Z]+/);
    return match ? match[0] : null;
}

/**
 * Get lab from seat string (e.g., "L1-A-12" → "L1")
 */
function getLab(seat: string): string | null {
    const match = seat.match(/^([^-]+)/);
    return match ? match[1] : null;
}

/**
 * Find neighbors for a participant based on seat position
 * Returns adjacent seats (left, right, front, back)
 */
export function getNeighbors(
    participantSeat: ParticipantSeat,
    allSeats: ParticipantSeat[]
): NeighborInfo[] {
    const { seat } = participantSeat;
    const lab = getLab(seat);
    const row = getSeatRow(seat);
    const seatNum = parseSeatNumber(seat);

    if (!lab || !row || seatNum === null) return [];

    const neighbors: NeighborInfo[] = [];

    // Check left and right seats in same row
    const leftSeat = `${lab}-${row}-${seatNum - 1}`;
    const rightSeat = `${lab}-${row}-${seatNum + 1}`;

    // Check front and back (next row letter)
    const nextRow = String.fromCharCode(row.charCodeAt(0) + 1);
    const prevRow = String.fromCharCode(row.charCodeAt(0) - 1);
    const frontSeat = `${lab}-${nextRow}-${seatNum}`;
    const backSeat = `${lab}-${prevRow}-${seatNum}`;

    const potentialNeighbors = [leftSeat, rightSeat, frontSeat, backSeat];

    allSeats.forEach(s => {
        if (potentialNeighbors.includes(s.seat)) {
            neighbors.push({
                participantId: s.participantId,
                seat: s.seat
            });
        }
    });

    return neighbors;
}

/**
 * Check if two problem sets have any overlap
 */
function hasOverlap(problems1: number[][], problems2: number[][]): boolean {
    const set1 = new Set(problems1.map(p => `${p[0]}-${p[1]}`));
    return problems2.some(p => set1.has(`${p[0]}-${p[1]}`));
}

/**
 * Allocate 1 problem statement to a participant initially
 * Ensures neighbors don't get the same problems
 * Participants can refresh to get more options (up to 3 total)
 */
export function allocateProblemsForParticipant(
    participant: ParticipantSeat,
    allSeats: ParticipantSeat[],
    existingAssignments: Map<string, number[][]> // participantId -> [[domainIdx, problemIdx]]
): IOfferedProblem[] {
    const allProblems = getAllProblems();
    const neighbors = getNeighbors(participant, allSeats);

    // Collect all neighbor problems
    const neighborProblems = neighbors.flatMap(n =>
        existingAssignments.get(n.participantId) || []
    );

    // Filter out problems that neighbors have
    const neighborProblemSet = new Set(
        neighborProblems.map(p => `${p[0]}-${p[1]}`)
    );

    const availableProblems = allProblems.filter(p =>
        !neighborProblemSet.has(`${p.domainIndex}-${p.problemIndex}`)
    );

    // If we don't have enough available problems, include all problems
    // (This happens when there are too many neighbors or limited problem pool)
    const problemPool = availableProblems.length >= 1 ? availableProblems : allProblems;

    // Randomly select 1 problem initially (participants can refresh for more)
    const selected = randomSample(problemPool, 1);

    return selected.map(p => ({
        domainIndex: p.domainIndex,
        problemIndex: p.problemIndex,
        domain: p.domain,
        problem: p.problem
    }));
}

/**
 * Refresh problem options for a participant
 * Adds 1 NEW problem to the existing offered problems (cumulative)
 * Ensures neighbors don't have the same problems
 */
export function refreshProblemsForParticipant(
    participant: ParticipantSeat,
    allSeats: ParticipantSeat[],
    existingAssignments: Map<string, number[][]>,
    currentProblems: number[][] // Current offered problems to avoid
): IOfferedProblem[] {
    const allProblems = getAllProblems();
    const neighbors = getNeighbors(participant, allSeats);

    // Combine neighbor problems AND current problems to avoid
    const problemsToAvoid = [
        ...neighbors.flatMap(n => existingAssignments.get(n.participantId) || []),
        ...currentProblems
    ];

    const avoidSet = new Set(problemsToAvoid.map(p => `${p[0]}-${p[1]}`));

    const availableProblems = allProblems.filter(p =>
        !avoidSet.has(`${p.domainIndex}-${p.problemIndex}`)
    );

    // Select 1 new problem to add to the existing options
    const problemPool = availableProblems.length >= 1 ? availableProblems : allProblems;
    const selected = randomSample(problemPool, 1);

    return selected.map(p => ({
        domainIndex: p.domainIndex,
        problemIndex: p.problemIndex,
        domain: p.domain,
        problem: p.problem
    }));
}

/**
 * Bulk allocation for all participants
 * Processes participants lab-by-lab, row-by-row to maximize neighbor diversity
 */
export function allocateAllProblems(participants: ParticipantSeat[]): Map<string, IOfferedProblem[]> {
    // Sort by lab, then row, then seat number for optimal neighbor handling
    const sorted = [...participants].sort((a, b) => {
        const labA = getLab(a.seat) || '';
        const labB = getLab(b.seat) || '';
        if (labA !== labB) return labA.localeCompare(labB);

        const rowA = getSeatRow(a.seat) || '';
        const rowB = getSeatRow(b.seat) || '';
        if (rowA !== rowB) return rowA.localeCompare(rowB);

        const seatA = parseSeatNumber(a.seat) || 0;
        const seatB = parseSeatNumber(b.seat) || 0;
        return seatA - seatB;
    });

    const assignments = new Map<string, IOfferedProblem[]>();
    const assignedIndices = new Map<string, number[][]>();

    sorted.forEach(participant => {
        const offered = allocateProblemsForParticipant(
            participant,
            sorted,
            assignedIndices
        );

        assignments.set(participant.participantId, offered);
        assignedIndices.set(
            participant.participantId,
            offered.map(p => [p.domainIndex, p.problemIndex])
        );
    });

    return assignments;
}
