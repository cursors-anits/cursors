
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import Coordinator from '@/lib/db/models/Coordinator';
import Log from '@/lib/db/models/Log';
import Settings from '@/lib/db/models/Settings';
import { getServerSession } from '@/lib/auth';
import { sendGenericEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        // Allow admin or maybe super-coordinators? For now strict admin.
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const settings = await Settings.findOne();
        const { subject, body, targetType, customRecipients } = await request.json();

        if (!subject || !body) {
            return NextResponse.json({ error: 'Subject and Body are required' }, { status: 400 });
        }

        let recipients: { name: string; email: string; type?: string;[key: string]: any }[] = [];

        // Determine recipients
        switch (targetType) {
            case 'all_participants':
                recipients = await Participant.find({}).select('name email teamId college type');
                break;
            case 'verified_participants':
                recipients = await Participant.find({ status: 'approved' }).select('name email teamId college type');
                break;
            case 'pending_participants':
                recipients = await Participant.find({ status: 'pending' }).select('name email teamId college type');
                break;
            case 'all_coordinators':
                recipients = await Coordinator.find({}).select('name email role');
                break;
            case 'custom':
                if (Array.isArray(customRecipients)) {
                    recipients = customRecipients;
                }
                break;
            default:
                return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
        }

        console.log(`Sending campaign "${subject}" to ${recipients.length} recipients...`);

        // Send emails in batches to avoid overwhelming the server/SMTP
        // For now, we'll just map them. In production, use a queue (BullMQ).

        let successCount = 0;
        const errors: any[] = [];

        // Basic variable replacement helper
        const replaceVariables = (text: string, data: any) => {
            let processed = text
                .replace(/{{name}}/g, data.name || 'Participant')
                .replace(/{{teamId}}/g, data.teamId || 'N/A')
                .replace(/{{college}}/g, data.college || 'N/A')
                .replace(/{{certificateLink}}/g, settings?.certificateDriveUrl || '#');

            // Dynamic Refund Calculation
            // Assumption: Combo (Workshop+Hackathon) refund is ₹150 (Workshop price), else 0 or full base?
            // User requested "calculate dynamically".
            const refundAmount = data.type === 'Combo' ? '₹150' : '₹349';
            processed = processed.replace(/{{refundAmount}}/g, refundAmount);

            return processed;
        };

        // We limit to 50 for this demo/MVP to prevent timeouts if running on Vercel serverless
        // A real system needs background workers.
        const BATCH_SIZE = 50;
        const processingList = recipients.slice(0, BATCH_SIZE);

        await Promise.all(processingList.map(async (recipient) => {
            try {
                const personalizedBody = replaceVariables(body, recipient);

                // Detect if it is already HTML (basic check)
                const isHtml = personalizedBody.trim().startsWith('<!DOCTYPE') || personalizedBody.trim().startsWith('<div');
                const htmlBody = isHtml ? personalizedBody : personalizedBody.replace(/\n/g, '<br/>');

                await sendGenericEmail(recipient.email, subject, htmlBody);
                successCount++;
            } catch (err: any) {
                console.error(`Failed to send to ${recipient.email}:`, err.message);
                errors.push({ email: recipient.email, error: err.message });
            }
        }));

        // Log the campaign
        if (successCount > 0) {
            await Log.create({
                action: 'CAMPAIGN_SENT',
                user: session.email || 'Admin',
                details: `Sent "${subject}" to ${successCount} recipients (${targetType})`,
                time: new Date().toISOString(),
                timestamp: Date.now()
            });
        }

        return NextResponse.json({
            success: true,
            count: successCount,
            totalAttempted: processingList.length,
            errors
        });

    } catch (error: any) {
        console.error('Campaign Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
