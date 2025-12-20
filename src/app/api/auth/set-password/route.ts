import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing requirements' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.isPasswordSet) {
            return NextResponse.json({ error: 'Password already set' }, { status: 400 });
        }

        // Set password - pre('save') hook in User model will handle hashing
        user.password = password;
        user.isPasswordSet = true;
        await user.save();

        // Prepare user data for session
        const userData = {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            assignedLab: user.assignedLab,
        };

        return NextResponse.json({ success: true, user: userData, message: 'Password set successfully' });
    } catch (error: any) {
        console.error('Set Password error:', error);
        return NextResponse.json({ error: error.message || 'Failed to set password' }, { status: 500 });
    }
}
