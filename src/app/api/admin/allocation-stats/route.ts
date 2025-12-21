import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import ProblemAssignment from '@/lib/db/models/ProblemAssignment';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get total participants with assigned seats
        const totalWithSeats = await Participant.countDocuments({
            assignedSeat: { $exists: true, $ne: null }
        });

        // Get allocated count
        const allocatedCount = await ProblemAssignment.countDocuments();

        // Get confirmed count
        const confirmedCount = await ProblemAssignment.countDocuments({
            isConfirmed: true
        });

        // Get pending (allocated but not confirmed)
        const pendingCount = allocatedCount - confirmedCount;

        // Get refresh stats
        const refreshStats = await ProblemAssignment.aggregate([
            {
                $group: {
                    _id: null,
                    totalRefreshes: { $sum: '$refreshCount' },
                    avgRefreshes: { $avg: '$refreshCount' }
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                total: totalWithSeats,
                allocated: allocatedCount,
                confirmed: confirmedCount,
                pending: pendingCount,
                totalRefreshes: refreshStats[0]?.totalRefreshes || 0,
                avgRefreshes: Math.round((refreshStats[0]?.avgRefreshes || 0) * 10) / 10
            }
        });
    } catch (error) {
        console.error('Error fetching allocation stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch allocation statistics' },
            { status: 500 }
        );
    }
}
