import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { teamId, participantId, participantIds, type, status } = body;

        if ((!teamId && !participantId && (!participantIds || participantIds.length === 0)) || !type) {
            return NextResponse.json({ error: 'TeamId, ParticipantId(s), and Type are required' }, { status: 400 });
        }

        const now = new Date();
        let updateOperation: any = {};

        if (type === 'hackathon') {
            updateOperation = { $set: { hackathonAttendance: now } };
        } else if (type === 'hackathon_exit') {
            updateOperation = { $set: { exitGateTimestamp: now } };
        } else if (type === 'entry') {
            updateOperation = { $set: { entryGateTimestamp: now } };
        } else if (type === 'snacks') {
            const snackTag = `Snacks (${now.toLocaleTimeString()})`;
            updateOperation = { $push: { foodAttendance: snackTag } };
        }

        if (Object.keys(updateOperation).length > 0) {
            let query = {};
            if (participantIds && Array.isArray(participantIds) && participantIds.length > 0) {
                query = { _id: { $in: participantIds } };
            } else if (participantId) {
                query = { _id: participantId };
            } else {
                query = { teamId: teamId };
            }

            const result = await Participant.updateMany(query, updateOperation);

            // AUTOMATION: Send Emails for Entry/Exit
            if (result.modifiedCount > 0 && (type === 'entry' || type === 'hackathon_exit')) {
                // Fetch affected participants to send emails
                const participants = await Participant.find(query);

                // Import email utils dynamically to avoid circular deps if any (though standard import is fine usually)
                const { sendGenericEmail: sendEmail } = await import('@/lib/email');
                const { getWelcomeEmailTemplate, getExitGateTemplate } = await import('@/lib/email-templates');

                for (const p of participants) {
                    if (!p.email || !p.name) continue;

                    try {
                        if (type === 'entry') {
                            await sendEmail(
                                p.email,
                                'Welcome to Vibe Coding 2026! 🚀',
                                getWelcomeEmailTemplate(p.name)
                            );
                        } else if (type === 'hackathon_exit') {
                            await sendEmail(
                                p.email,
                                '👋 Safe Travels!',
                                getExitGateTemplate(p.name)
                            );
                        }
                    } catch (emailErr) {
                        console.error(`Failed to send ${type} email to ${p.email}:`, emailErr);
                        // Don't fail the request, just log
                    }
                }
            }

            return NextResponse.json({
                success: true,
                updated: result.modifiedCount,
                message: `Attendance marked`
            });
        }

        return NextResponse.json({ success: false, message: "No valid type specified" });

    } catch (error: any) {
        console.error('Coordinator Attendance Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
