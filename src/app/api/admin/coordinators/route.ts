import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Coordinator from '@/lib/db/models/Coordinator';
import User from '@/lib/db/models/User';
import { sendStaffWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { name, email, role, assigned } = body; // email is personalEmail from form

        // Check if personal email is already used
        const existingCoord = await Coordinator.findOne({ personalEmail: email });
        if (existingCoord) {
            return NextResponse.json({ error: 'Staff with this personal email already exists' }, { status: 400 });
        }

        // Generate unique vibe email
        const baseEmail = name.toLowerCase().replace(/\s+/g, '');
        let vibeEmail = `${baseEmail}@vibe.com`;
        let counter = 1;
        while (await User.findOne({ email: vibeEmail })) {
            vibeEmail = `${baseEmail}${counter}@vibe.com`;
            counter++;
        }

        // Create User account first
        const newUser = await User.create({
            email: vibeEmail,
            name,
            role: (role || 'coordinator').toLowerCase(),
            isPasswordSet: false,
            assignedLab: assigned
        });

        // Create Coordinator profile
        const newCoordinator = await Coordinator.create({
            name,
            email: vibeEmail,
            personalEmail: email,
            role: role || 'Coordinator',
            assigned: assigned || 'General',
            assignedLab: assigned,
            userId: newUser._id
        });

        // Send Welcome Email to PERSONAL email
        try {
            await sendStaffWelcomeEmail(email, name, role, vibeEmail, assigned);
        } catch (emailError) {
            console.error('Failed to send staff welcome email:', emailError);
        }

        return NextResponse.json({ success: true, coordinator: newCoordinator, vibeEmail }, { status: 201 });
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
