import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { checklist } = await request.json();
        const { id } = await params;

        const participant = await Participant.findOneAndUpdate(
            { participantId: id },
            { eventChecklist: checklist },
            { new: true }
        );

        if (!participant) {
            return NextResponse.json(
                { error: 'Participant not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, checklist: participant.eventChecklist });
    } catch (error) {
        console.error('Error updating checklist:', error);
        return NextResponse.json(
            { error: 'Failed to update checklist' },
            { status: 500 }
        );
    }
}
