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
            user = await User.findOne({ email }).select('+password');

            if (!user || !user.password) {
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }

            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }
        } else if (passkey) {
            // Participant login with passkey
            user = await User.findOne({ email, passkey, role: 'participant' });

            if (!user) {
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
