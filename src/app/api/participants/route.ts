import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const lab = searchParams.get('lab');
        const teamId = searchParams.get('teamId');

        // Build filter
        const filter: any = {};
        if (status) filter.status = status;
        if (lab) filter.assignedLab = lab;
        if (teamId) filter.teamId = teamId;

        const participants = await Participant.find(filter).sort({ createdAt: -1 });

        return NextResponse.json({ participants }, { status: 200 });
    } catch (error) {
        console.error('Get participants error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch participants' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const participant = await Participant.create(body);

        return NextResponse.json({ participant }, { status: 201 });
    } catch (error) {
        console.error('Create participant error:', error);
        return NextResponse.json(
            { error: 'Failed to create participant' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json(
                { error: 'Participant ID is required' },
                { status: 400 }
            );
        }

        const participant = await Participant.findByIdAndUpdate(_id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!participant) {
            return NextResponse.json(
                { error: 'Participant not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ participant }, { status: 200 });
    } catch (error) {
        console.error('Update participant error:', error);
        return NextResponse.json(
            { error: 'Failed to update participant' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Participant ID is required' },
                { status: 400 }
            );
        }

        const participant = await Participant.findByIdAndDelete(id);

        if (!participant) {
            return NextResponse.json(
                { error: 'Participant not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Participant deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete participant error:', error);
        return NextResponse.json(
            { error: 'Failed to delete participant' },
            { status: 500 }
        );
    }
}
