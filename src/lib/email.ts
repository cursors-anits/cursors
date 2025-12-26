import nodemailer from 'nodemailer';
import ScheduledEmail from '@/lib/db/models/ScheduledEmail';
import connectDB from '@/lib/db/mongodb';
import { getReportingTimeHTML } from '@/lib/utils/reportingTimes';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,   // 10 seconds
});

interface EmailMember {
    name: string;
    college: string;
    department: string;
    year: string;
    passkey: string;
}

type TicketType = 'hackathon';

// Helper to convert ticket type to reporting time format
function toReportingTimeType(type: TicketType): 'Hackathon' {
    const typeMap: Record<TicketType, 'Hackathon'> = {
        hackathon: 'Hackathon'
    };
    return typeMap[type];
}

function getTemplate(
    type: TicketType,
    teamId: string,
    members: EmailMember[],
    college: string,
    teamEmail: string,
    teamPasskey: string
): string {
    const colors = {
        hackathon: {
            primary: '#a855f7', // purple-500
            secondary: '#6b21a8', // purple-800
            bg: '#faf5ff', // purple-50
            border: '#d8b4fe'
        }
    };

    const theme = colors[type];

    const titleMap = {
        hackathon: '24H HACKATHON PASS'
    };

    const membersHtml = members.map(m => `
        <div style="background: rgba(255,255,255,0.03); padding: 12px; margin-bottom: 8px; border-radius: 8px; border: 1px solid #222;">
            <div style="font-weight: bold; font-size: 14px; color: #fff; margin-bottom: 4px;">${m.name}</div>
            <div style="font-size: 11px; color: ${theme.primary}; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">${m.college || 'College TBD'}</div>
            <div style="font-size: 11px; color: #888; margin-top: 2px;">${m.department} • ${m.year}</div>
        </div>
    `).join('');

    const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // const whatsappLink = process.env.WHATSAPP_GROUP_LINK || '#'; // REMOVED: Using specific links inline
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${teamId}&color=${theme.primary.replace('#', '')}&bgcolor=1a1a1a&margin=10`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border-radius: 16px; overflow: hidden; box-shadow: 0 0 50px rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.2);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${theme.secondary}, ${theme.primary}); padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">${titleMap[type]}</h1>
            <p style="margin: 5px 0 0; opacity: 0.9; font-weight: 500; font-size: 14px;">VIBE CODING • CURSORS 2026 • ANITS</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
            
            <!-- Quick Info -->
            <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; border-bottom: 1px solid #333; padding-bottom: 20px;">
                <tr>
                    <td align="left" width="50%">
                        <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 4px;">Event Date</div>
                        <div style="font-weight: bold; font-size: 15px; color: #fff;">Jan 5-6, 2026</div>
                    </td>
                    <td align="right" width="50%">
                        <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 4px;">Venue</div>
                        <div style="font-weight: bold; font-size: 15px; color: #fff;">ANITS Campus</div>
                    </td>
                </tr>
            </table>

            <!-- REPORTING TIME ALERT -->
            <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(249, 115, 22, 0.2)); border: 2px solid rgba(249, 115, 22, 0.4); border-radius: 12px; padding: 20px; margin-bottom: 25px; text-align: center;">
                <div style="font-size: 11px; text-transform: uppercase; color: #fb923c; letter-spacing: 2px; margin-bottom: 8px;">⚠️ IMPORTANT</div>
                <div style="font-size: 20px; font-weight: bold; color: #fff; margin-bottom: 8px;">Reporting Time</div>
                <div style="font-size: 13px; color: #fed7aa; line-height: 1.6;">${getReportingTimeHTML(toReportingTimeType(type))}</div>
            </div>

            <!-- Team Card -->
            <div style="background-color: #151515; border: 1px solid #333; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
                <div style="font-size: 11px; color: #888; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Team Identification</div>
                <div style="font-size: 32px; font-weight: 900; color: ${theme.primary}; font-family: monospace; letter-spacing: -1px; margin-bottom: 5px;">${teamId}</div>
                <div style="font-size: 13px; color: #ccc;">${college}</div>
                
                <div style="margin: 20px auto; width: 160px; height: 160px; background: #1a1a1a; padding: 10px; border-radius: 10px; border: 2px dashed ${theme.primary};">
                    <img src="${qrCodeUrl}" alt="Team QR" style="width: 100%; height: 100%; border-radius: 5px; display: block;">
                </div>
            </div>

            <!-- CREDENTIALS BOX -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid ${theme.primary}40; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-size: 12px; text-transform: uppercase; color: ${theme.primary}; letter-spacing: 1px; text-align: center;">Team Login Credentials</h3>
                
                <div style="background: #000; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #333;">
                    <div style="font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 4px;">Login Email</div>
                    <div style="font-family: monospace; font-size: 18px; color: #fff; letter-spacing: 1px;">${teamEmail}</div>
                </div>

                <div style="background: #000; padding: 15px; border-radius: 8px; border: 1px solid #333;">
                    <div style="font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 4px;">Team Passkey</div>
                    <div style="font-family: monospace; font-size: 24px; color: ${theme.primary}; font-weight: bold; letter-spacing: 3px;">${teamPasskey}</div>
                </div>
                
                <p style="text-align: center; font-size: 11px; color: #666; margin-top: 15px; margin-bottom: 0;">
                    Share these credentials with your team. This login allows access to the team dashboard.
                </p>
            </div>

            <!-- Members -->
            <div style="margin-bottom: 25px;">
                <h3 style="font-size: 12px; text-transform: uppercase; color: #666; letter-spacing: 1px; margin-bottom: 10px;">Registered Members</h3>
                ${membersHtml}
            </div>

            <!-- Accommodation & Food Policy -->
            <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 15px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: #f59e0b; letter-spacing: 1px;">Stay & Food Information</h3>
                <p style="margin: 0; font-size: 12px; color: #ccc; line-height: 1.5;">
                    <strong>Accommodation:</strong> NOT provided for the event, except for the <strong>Hackathon night</strong> (for hackathon participants).
                </p>
                <p style="margin: 8px 0 0; font-size: 12px; color: #ccc; line-height: 1.5;">
                    <strong>Food:</strong> Snacks will be provided. <strong>Dinner is NOT included</strong> - available at college canteen or via Swiggy/Zomato at your expense.
                </p>
                <p style="margin: 8px 0 0; font-size: 12px; color: #ccc;">
                    For accommodation info or nearby hostel contacts, reach out to <strong>8897892720</strong>.
                </p>
            </div>

            <!-- Actions -->
            <div style="text-align: center; margin-top: 30px;">
                <a href="${loginUrl}" style="display: inline-block; background-color: ${theme.primary}; color: #fff; text-decoration: none; font-weight: bold; padding: 14px 30px; border-radius: 30px; margin: 0 5px 15px; font-size: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">LOGIN TO DASHBOARD</a>
                
                ${(type === 'hackathon') ? `
                <a href="${process.env.WHATSAPP_HACKATHON_LINK || '#'}" style="display: inline-block; background-color: #25D366; color: #fff; text-decoration: none; font-weight: bold; padding: 14px 30px; border-radius: 30px; margin: 0 5px 15px; font-size: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">JOIN HACKATHON GROUP</a>
                ` : ''}
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #050505; padding: 20px; text-align: center; font-size: 11px; color: #444; border-top: 1px solid #111;">
            <p style="margin: 0;">&copy; 2026 Cursors, ANITS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
}

export async function sendEventPassEmail(
    to: string,
    teamId: string,
    members: EmailMember[],
    college: string,
    ticketType: TicketType,
    teamEmail: string,
    teamPasskey: string
) {
    const html = getTemplate(ticketType, teamId, members, college, teamEmail, teamPasskey);
    const subject = `🎟️ Event Pass: ${teamId} | Vibe Coding`;

    try {
        const info = await transporter.sendMail({
            from: `"Vibe Coding 2026" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log("Message sent to %s: %s", to, info.messageId);
        return { success: true, info };
    } catch (error: any) {
        console.error("Error sending email:", error);

        // Check if it's a limit error
        const errorMessage = error.message?.toLowerCase() || '';
        const isLimitError =
            errorMessage.includes('limit exceeded') ||
            errorMessage.includes('too many messages') ||
            errorMessage.includes('rate limit') ||
            error.responseCode === 421 ||
            error.responseCode === 450 ||
            error.responseCode === 452 ||
            error.responseCode === 550 ||
            error.responseCode === 554;

        if (isLimitError) {
            console.warn("Mail limit detected. Scheduling email for later...");
            await connectDB();
            await ScheduledEmail.create({
                to,
                subject,
                body: html,
                type: 'EventPass',
                teamId,
                scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours later
                status: 'Pending'
            });
            return { success: false, scheduled: true };
        }

        throw error;
    }
}

export async function sendStaffWelcomeEmail(
    to: string,
    name: string,
    role: string,
    vibeEmail: string,
    assigned: string
) {
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #0a0a0a; border-radius: 16px; overflow: hidden; border: 1px solid #333; padding: 40px;">
        <h1 style="color: #3b82f6; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">Welcome to the Team, ${name}!</h1>
        <p style="color: #ccc; line-height: 1.6;">You have been added as <strong>${role}</strong> for VIBE CODING 2026. Your role is assigned to: <strong>${assigned}</strong>.</p>
        
        <div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h2 style="font-size: 14px; text-transform: uppercase; color: #888; margin-bottom: 15px; letter-spacing: 1px;">Your Application Credentials</h2>
            <div style="margin-bottom: 15px;">
                <div style="font-size: 11px; color: #666; text-transform: uppercase;">Login Email</div>
                <div style="font-family: monospace; font-size: 18px; color: #fff;">${vibeEmail}</div>
            </div>
            <p style="font-size: 12px; color: #3b82f6; margin-top: 20px;">
                <strong>IMPORTANT:</strong> Use your official vibe email above for your first login. You will be prompted to set your password upon entering.
            </p>
        </div>

        <div style="text-align: center; margin-top: 40px;">
            <a href="${loginUrl}" style="display: inline-block; background-color: #3b82f6; color: #fff; text-decoration: none; font-weight: bold; padding: 16px 40px; border-radius: 30px; font-size: 14px;">LOGIN TO DASHBOARD</a>
        </div>
        
        <p style="font-size: 11px; color: #444; margin-top: 50px; text-align: center; border-top: 1px solid #111; padding-top: 20px;">
            &copy; 2026 Cursors, ANITS. Internal Staff Communication.
        </p>
    </div>
</body>
</html>
    `;

    const subject = `🚀 Welcome to the Staff Team: ${role} | Vibe Coding`;

    try {
        await transporter.sendMail({
            from: `"Vibe Coding 2026" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending staff welcome email:", error);
        throw error;
    }
}

/**
 * Processes the queue of scheduled emails that were deferred due to limits.
 */
export async function processEmailQueue() {
    await connectDB();
    const now = new Date();
    const pendingEmails = await ScheduledEmail.find({
        status: 'Pending',
        scheduledFor: { $lte: now },
        attempts: { $lt: 3 }
    }).limit(10); // Process in small batches

    console.log(`Processing ${pendingEmails.length} scheduled emails...`);

    for (const email of pendingEmails) {
        try {
            await transporter.sendMail({
                from: `"Vibe Coding 2026" <${process.env.SMTP_USER}>`,
                to: email.to,
                subject: email.subject,
                html: email.body,
            });

            email.status = 'Sent';
            email.attempts += 1;
            await email.save();
            console.log(`Successfully sent scheduled email to ${email.to}`);
        } catch (error: any) {
            console.error(`Failed to send scheduled email to ${email.to}:`, error);
            email.attempts += 1;
            email.lastError = error.message;

            // If it's still a limit error, reschedule for another 24h
            if (error.message?.includes('limit')) {
                email.scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000);
            } else if (email.attempts >= 3) {
                email.status = 'Failed';
            }

            await email.save();
        }
    }
}
