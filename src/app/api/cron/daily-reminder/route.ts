import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import Settings from '@/lib/db/models/Settings';
import { sendGenericEmail } from '@/lib/email';
import { getEventReminderTemplate } from '@/lib/email-templates';

export async function GET(request: Request) {
    // SECURITY: Validate Cron Secret if needed (e.g. from header)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    try {
        await dbConnect();

        // 1. Check if Event is Active/Upcoming
        const settings = await Settings.findOne();
        if (!settings) return NextResponse.json({ error: 'Settings not found' }, { status: 500 });

        // Example: Only send if event is in future/ongoing
        // For now, we assume this cron runs when intended.

        // 2. Fetch Approved Participants
        const participants = await Participant.find({ status: 'approved' });

        if (participants.length === 0) {
            return NextResponse.json({ message: 'No approved participants found' });
        }

        // 3. Calculate Days Left (Static or Dynamic)
        // Ideally calculate `daysLeft` based on `settings.hackathonStartDate`
        const startDate = settings.eventDate || new Date('2026-01-05');
        const now = new Date();
        const diffTime = Math.max(0, startDate.getTime() - now.getTime());
        const daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const template = getEventReminderTemplate(daysLeft);
        const subject = `⏳ ${daysLeft} Days Left: Vibe Coding 2026`;

        // 4. Send Emails (Batching/Throttling suggested for production)
        let successCount = 0;
        let failCount = 0;

        // Simple loop limitation for reliability in serverless (timeout awareness)
        // If 2000 users, might timeout. 
        // Better implementation: Use `ScheduledEmail` collection and a processor.

        // For MVP/Demo: Send to first 50 or use fire-and-forget logic if possible?
        // Let's iterate.

        for (const p of participants) {
            if (!p.email) continue;
            try {
                await sendGenericEmail(p.email, subject, template);
                successCount++;
            } catch (err) {
                console.error(`Failed to send reminder to ${p.email}`, err);
                failCount++;
            }
        }

        return NextResponse.json({
            success: true,
            total: participants.length,
            sent: successCount,
            failed: failCount
        });

    } catch (error: any) {
        console.error('Daily Reminder Job Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
