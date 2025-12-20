import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { email, oldPassword, newPassword } = await request.json();

        if (!email || !oldPassword || !newPassword) {
            return NextResponse.json({ error: 'Missing requirements' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify old password
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect old password' }, { status: 401 });
        }

        // Update password
        user.password = newPassword;
        user.isPasswordSet = true; // Ensure this is true if they change it
        await user.save();

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('Change Password error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update password' }, { status: 500 });
    }
}
