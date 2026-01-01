import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        // Remove ID fields to prevent accidental overwrites
        delete body._id;
        delete body.participantId;

        const updatedParticipant = await Participant.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!updatedParticipant) {
            return NextResponse.json(
                { error: 'Participant not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedParticipant);
    } catch (error) {
        console.error('Error updating participant:', error);
        return NextResponse.json(
            { error: 'Failed to update participant' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const deletedParticipant = await Participant.findByIdAndDelete(id);

        if (!deletedParticipant) {
            return NextResponse.json(
                { error: 'Participant not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Participant deleted successfully' });
    } catch (error) {
        console.error('Error deleting participant:', error);
        return NextResponse.json(
            { error: 'Failed to delete participant' },
            { status: 500 }
        );
    }
}
