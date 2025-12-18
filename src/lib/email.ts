import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface EmailMember {
    name: string;
    department: string;
    year: string;
    passkey: string;
}

type TicketType = 'workshop' | 'hackathon' | 'combo';

function getTemplate(
    type: TicketType,
    teamId: string,
    members: EmailMember[],
    college: string,
    teamEmail: string,
    teamPasskey: string
): string {
    const colors = {
        workshop: {
            primary: '#3b82f6', // blue-500
            secondary: '#1e40af', // blue-800
            bg: '#eff6ff', // blue-50
            border: '#93c5fd'
        },
        hackathon: {
            primary: '#a855f7', // purple-500
            secondary: '#6b21a8', // purple-800
            bg: '#faf5ff', // purple-50
            border: '#d8b4fe'
        },
        combo: {
            primary: '#f59e0b', // amber-500
            secondary: '#92400e', // amber-800
            bg: '#fffbeb', // amber-50
            border: '#fcd34d'
        }
    };

    const theme = colors[type] || colors.combo;

    const titleMap = {
        workshop: 'GEN AI WORKSHOP PASS',
        hackathon: '24H HACKATHON PASS',
        combo: 'ALL ACCESS VIP PASS'
    };

    const membersHtml = members.map(m => `
        <div style="background: rgba(255,255,255,0.03); padding: 12px; margin-bottom: 8px; border-radius: 8px; border: 1px solid #222;">
            <div style="font-weight: bold; font-size: 14px; color: #fff; margin-bottom: 4px;">${m.name}</div>
            <div style="font-size: 11px; color: ${theme.primary}; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">${m.department} • ${m.year}</div>
        </div>
    `).join('');

    const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const whatsappLink = process.env.WHATSAPP_GROUP_LINK || '#';
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
                        <div style="font-weight: bold; font-size: 15px; color: #fff;">Jan 2-3, 2026</div>
                    </td>
                    <td align="right" width="50%">
                        <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 4px;">Venue</div>
                        <div style="font-weight: bold; font-size: 15px; color: #fff;">ANITS Campus</div>
                    </td>
                </tr>
            </table>

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
            <div style="margin-bottom: 30px;">
                <h3 style="font-size: 12px; text-transform: uppercase; color: #666; letter-spacing: 1px; margin-bottom: 10px;">Registered Members</h3>
                ${membersHtml}
            </div>

            <!-- Actions -->
            <div style="text-align: center; margin-top: 30px;">
                <a href="${loginUrl}" style="display: inline-block; background-color: ${theme.primary}; color: #fff; text-decoration: none; font-weight: bold; padding: 14px 30px; border-radius: 30px; margin: 0 5px 15px; font-size: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">LOGIN TO DASHBOARD</a>
                <a href="${whatsappLink}" style="display: inline-block; background-color: #25D366; color: #fff; text-decoration: none; font-weight: bold; padding: 14px 30px; border-radius: 30px; margin: 0 5px 15px; font-size: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">JOIN WHATSAPP GROUP</a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #050505; padding: 20px; text-align: center; font-size: 11px; color: #444; border-top: 1px solid #111;">
            <p style="margin: 0;">&copy; 2026 Vibe Coding. All rights reserved.</p>
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

    try {
        const info = await transporter.sendMail({
            from: `"Vibe Coding 2026" <${process.env.SMTP_USER}>`,
            to,
            subject: `🎟️ Event Pass: ${teamId} | Vibe Coding`,
            html,
        });
        console.log("Message sent to %s: %s", to, info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}
