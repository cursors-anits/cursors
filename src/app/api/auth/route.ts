import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { email, password, passkey } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Find user by email
        let user;

        if (password) {
            // Admin, Coordinator, or Faculty login with password
            console.log(`[AUTH] Attempting password login for: ${email}`);
            user = await User.findOne({ email }).select('+password');

            if (!user) {
                console.log(`[AUTH] User not found: ${email}`);
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }

            // Check if password setup is required for staff
            if (user.role !== 'participant' && !user.isPasswordSet) {
                return NextResponse.json(
                    { error: 'first_login', message: 'Set up your password', vibeEmail: email },
                    { status: 200 }
                );
            }

            if (!user.password) {
                console.log(`[AUTH] User has no password set: ${email}`);
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }

            const isPasswordValid = await user.comparePassword(password);
            console.log(`[AUTH] Password valid: ${isPasswordValid}`);

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }
        } else if (passkey) {
            // Participant login with passkey
            console.log(`[AUTH] Attempting passkey login for: ${email}`);
            user = await User.findOne({ email, passkey, role: 'participant' });

            if (!user) {
                console.log(`[AUTH] Invalid passkey or role for: ${email}`);
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }
        } else {
            return NextResponse.json(
                { error: 'Password or passkey is required' },
                { status: 400 }
            );
        }

        // Return user data (excluding password)
        const userData = {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            passkey: user.passkey,
            teamId: user.teamId,
            assignedLab: user.assignedLab,
        };

        return NextResponse.json({ user: userData }, { status: 200 });
    } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
