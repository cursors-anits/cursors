import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Coordinator from '@/lib/db/models/Coordinator';

export async function GET() {
    try {
        await dbConnect();

        const coordinators = await Coordinator.find().sort({ createdAt: -1 });

        return NextResponse.json({ coordinators }, { status: 200 });
    } catch (error) {
        console.error('Get coordinators error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch coordinators' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const coordinator = await Coordinator.create(body);

        return NextResponse.json({ coordinator }, { status: 201 });
    } catch (error) {
        console.error('Create coordinator error:', error);

        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create coordinator' },
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
                { error: 'Coordinator ID is required' },
                { status: 400 }
            );
        }

        const coordinator = await Coordinator.findByIdAndUpdate(_id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!coordinator) {
            return NextResponse.json(
                { error: 'Coordinator not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ coordinator }, { status: 200 });
    } catch (error) {
        console.error('Update coordinator error:', error);
        return NextResponse.json(
            { error: 'Failed to update coordinator' },
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
                { error: 'Coordinator ID is required' },
                { status: 400 }
            );
        }

        const coordinator = await Coordinator.findByIdAndDelete(id);

        if (!coordinator) {
            return NextResponse.json(
                { error: 'Coordinator not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Coordinator deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete coordinator error:', error);
        return NextResponse.json(
            { error: 'Failed to delete coordinator' },
            { status: 500 }
        );
    }
}
