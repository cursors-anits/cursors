import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Settings from '@/lib/db/models/Settings';
import { isAdmin } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        let settings = await Settings.findOne();

        // Ensure singleton: if more than one exists, clean up
        const count = await Settings.countDocuments();
        if (count > 1) {
            const allSettings = await Settings.find().sort({ createdAt: 1 });
            settings = allSettings[0];
            await Settings.deleteMany({ _id: { $ne: settings._id } });
            console.log('🧹 Cleaned up duplicate settings documents');
        }

        if (!settings) {
            settings = await Settings.create({
                registrationClosed: process.env.NEXT_PUBLIC_REGISTRATION_CLOSED === 'true',
                maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
                upiId: 'bmahesh498@okhdfcbank',
                qrImageUrl: '/payment qr.jpg',
                eventDate: new Date('2026-01-02T09:00:00'),
            });
        } else {
            // Migration: Ensure existing settings have the new fields
            let modified = false;
            if (!settings.upiId) {
                settings.upiId = 'bmahesh498@okhdfcbank';
                modified = true;
            }
            if (!settings.qrImageUrl || settings.qrImageUrl === '/qr-payment.png') {
                settings.qrImageUrl = '/payment qr.jpg';
                modified = true;
            }
            if (modified) {
                await settings.save();
                console.log('✅ Migrated settings with new fields');
            }
        }

        // Ensure showInternships exists (local migration if needed)
        if (settings.showInternships === undefined) {
            settings.showInternships = false;
            await settings.save();
        }

        return NextResponse.json(settings);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        // Authenticate as Admin
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
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
