import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Coordinator from '@/lib/db/models/Coordinator';
import User from '@/lib/db/models/User';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { name, email, role, assigned } = body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
        }

        // Create User account first
        const newUser = await User.create({
            email,
            name,
            role: 'coordinator',
            password: 'Vibe@Coordinator', // Default password
            assignedLab: assigned
        });

        // Create Coordinator profile
        const newCoordinator = await Coordinator.create({
            name,
            email,
            role: role || 'Coordinator',
            assigned: assigned || 'General',
            assignedLab: assigned,
            userId: newUser._id
        });

        return NextResponse.json({ success: true, coordinator: newCoordinator }, { status: 201 });
    } catch (error: any) {
        console.error('Admin Add Coordinator error:', error);
        return NextResponse.json({ error: error.message || 'Failed to add coordinator' }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const coordinators = await Coordinator.find().sort({ createdAt: -1 });
        return NextResponse.json(coordinators);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, _id, ...updateData } = body;
        const targetId = id || _id;

        if (!targetId) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const coordinator = await Coordinator.findByIdAndUpdate(targetId, updateData, { new: true });

        if (!coordinator) {
            return NextResponse.json({ error: 'Coordinator not found' }, { status: 404 });
        }

        // Sync User assignedLab if changed
        if (updateData.assignedLab || updateData.assigned) {
            await User.findOneAndUpdate(
                { email: coordinator.email },
                { assignedLab: updateData.assignedLab || updateData.assigned }
            );
        }

        return NextResponse.json({ success: true, coordinator });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const coordinator = await Coordinator.findById(id);
        if (!coordinator) {
            return NextResponse.json({ error: 'Coordinator not found' }, { status: 404 });
        }

        // Delete User and Coordinator
        await User.findOneAndDelete({ email: coordinator.email });
        await Coordinator.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 });
    }
}
