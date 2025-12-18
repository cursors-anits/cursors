import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Settings from '@/lib/db/models/Settings';

export async function GET() {
    try {
        await dbConnect();
        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({
                registrationClosed: process.env.NEXT_PUBLIC_REGISTRATION_CLOSED === 'true',
                maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
            });
        }

        return NextResponse.json(settings);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        await dbConnect();
        // In a real app, we'd check the session here for admin role
        // For now, we'll implement the logic
        const body = await request.json();

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        Object.assign(settings, body);
        await settings.save();

        return NextResponse.json(settings);
    } catch {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
