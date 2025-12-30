
// Common styles and components for "Pass-like" emails
const styles = {
    body: 'margin: 0; padding: 0; background-color: #000000; font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;',
    container: 'max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border-radius: 16px; overflow: hidden; box-shadow: 0 0 50px rgba(168, 85, 247, 0.15); border: 1px solid #222;',
    header: 'background: linear-gradient(135deg, #6b21a8, #a855f7); padding: 30px 20px; text-align: center;',
    logoText: 'margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 2px 10px rgba(0,0,0,0.3); color: #fff;',
    subText: 'margin: 5px 0 0; opacity: 0.9; font-weight: 500; font-size: 13px; color: #f3e8ff;',
    content: 'padding: 30px;',
    card: 'background: rgba(255,255,255,0.03); border: 1px solid #333; border-radius: 12px; padding: 20px; margin-bottom: 20px;',
    highlightBox: 'background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1)); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;',
    button: 'display: inline-block; background-color: #a855f7; color: #fff; text-decoration: none; font-weight: bold; padding: 14px 30px; border-radius: 30px; font-size: 14px; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);',
    footer: 'background-color: #050505; padding: 20px; text-align: center; font-size: 11px; color: #444; border-top: 1px solid #111;',
    textMuted: 'color: #888; font-size: 13px; line-height: 1.6;',
    textNormal: 'color: #ccc; font-size: 14px; line-height: 1.6;',
    heading: 'font-size: 18px; font-weight: bold; color: #fff; margin-bottom: 12px; border-left: 3px solid #a855f7; padding-left: 10px;'
};

const BaseLayout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${styles.body}">
    <div style="${styles.container}">
        <!-- Header -->
        <div style="${styles.header}">
            <h1 style="${styles.logoText}">VIBE CODING</h1>
            <p style="${styles.subText}">CURSORS 2026 • ANITS</p>
        </div>

        <!-- Content -->
        <div style="${styles.content}">
            ${content}
        </div>

        <!-- Footer -->
        <div style="${styles.footer}">
            <p style="margin: 0;">&copy; 2026 Cursors, ANITS. All rights reserved.</p>
            <p style="margin: 5px 0 0;">CSE Department, Sangivalasa, Visakhapatnam</p>
        </div>
    </div>
</body>
</html>
`;

// 1. Welcome Greeting Email (On Entry Scan)
export const getWelcomeEmailTemplate = (name: string, teamId: string) => {
    const content = `
        <div style="${styles.highlightBox}">
            <div style="font-size: 40px; margin-bottom: 10px;">👋</div>
            <h2 style="margin: 0 0 10px; color: #fff; font-size: 24px;">Welcome In, ${name.split(' ')[0]}!</h2>
            <p style="margin: 0; color: #d8b4fe;">You've successfully checked in at the content.</p>
        </div>

        <div style="${styles.card}">
            <p style="${styles.textMuted} text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Status</p>
            <div style="font-size: 18px; color: #4ade80; font-weight: bold;">✅ CHECKED IN</div>
            <div style="margin-top: 15px; border-top: 1px solid #333; padding-top: 15px;">
                <p style="${styles.textMuted} margin-bottom: 0;">Time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>

        <div style="text-align: center;">
            <p style="${styles.textNormal}">
                Head over to the help desk if you need your ID card or swag kit.
                <br><br>
                <strong style="color: #fff;">Let the Vibe Begin! 🚀</strong>
            </p>
        </div>
    `;
    return BaseLayout(content);
};

// 2. Event Reminder (Countdown)
export const getEventReminderTemplate = (daysLeft: number) => {
    const content = `
        <div style="${styles.card}; text-align: center; border-color: #a855f7;">
            <div style="font-size: 12px; text-transform: uppercase; color: #a855f7; letter-spacing: 2px; margin-bottom: 10px;">The Wait is Almost Over</div>
            <div style="font-size: 64px; font-weight: 900; color: #fff; line-height: 1;">${daysLeft}</div>
            <div style="font-size: 16px; color: #888; margin-top: 5px;">DAYS TO GO</div>
        </div>

        <div style="margin-bottom: 30px;">
            <h3 style="${styles.heading}">Are you ready?</h3>
            <p style="${styles.textNormal}">
                Pack your bags, charge your laptops, and get your playlists ready. Vibe Coding 2026 is just around the corner.
            </p>
            <ul style="${styles.textNormal} padding-left: 20px; margin-top: 15px;">
                <li style="margin-bottom: 8px;">Check your dashboard for team status.</li>
                <li style="margin-bottom: 8px;">Review the problem statements.</li>
                <li style="margin-bottom: 8px;">Don't forget your college ID!</li>
            </ul>
        </div>

        <div style="text-align: center;">
             <a href="https://cursors-anits.vercel.app/dashboard" style="${styles.button}">CHECK DASHBOARD</a>
        </div>
    `;
    return BaseLayout(content);
};

// 3. Event Update (Important Announcements)
export const getEventUpdateTemplate = (title: string, messageHtml: string) => {
    const content = `
        <div style="${styles.highlightBox}; background: rgba(234, 179, 8, 0.1); border-color: rgba(234, 179, 8, 0.3);">
            <div style="font-size: 12px; text-transform: uppercase; color: #fbbf24; letter-spacing: 2px; margin-bottom: 5px;">🔔 UPDATE</div>
            <h2 style="margin: 0; color: #fff; font-size: 20px;">${title}</h2>
        </div>

        <div style="${styles.card}">
             <div style="${styles.textNormal}">
                ${messageHtml}
             </div>
        </div>

        <p style="${styles.textMuted}; text-align: center;">
            Please ensure you have read and understood this update. <br>
            Contact support if you have questions.
        </p>
    `;
    return BaseLayout(content);
};

// 4. Refund Email
export const getRefundTemplate = (amount: string, reason: string) => {
    const content = `
        <div style="${styles.card}; border-left: 4px solid #3b82f6;">
            <h3 style="margin: 0 0 15px; color: #fff; font-size: 18px;">Refund Processed</h3>
            <div style="background: rgba(59, 130, 246, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="font-size: 12px; color: #60a5fa; text-transform: uppercase;">Refund Amount</div>
                <div style="font-size: 24px; color: #fff; font-weight: bold;">₹${amount}</div>
            </div>
            <p style="${styles.textNormal}">
                ${reason}
            </p>
        </div>

        <div style="${styles.card}">
            <h4 style="margin: 0 0 10px; color: #fff; font-size: 14px;">Next Steps</h4>
            <p style="${styles.textMuted}">
                You will receive this amount in cash on the Hackathon day (` + "`Day 1`" + `) at the registration desk. 
                Please collect it from the coordinator.
            </p>
        </div>
    `;
    return BaseLayout(content);
};

// 5. Exit Gate Email
export const getExitGateTemplate = (name: string) => {
    const content = `
         <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 10px;">👋</div>
            <h2 style="color: #fff; margin: 0;">Safe Travels, ${name.split(' ')[0]}!</h2>
            <p style="color: #888; margin-top: 5px;">Thanks for vibing with us.</p>
        </div>

        <div style="${styles.card}">
            <p style="${styles.textMuted} text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Status</p>
            <div style="font-size: 18px; color: #f43f5e; font-weight: bold;">Checked Out</div>
            <div style="margin-top: 15px; border-top: 1px solid #333; padding-top: 15px;">
                <p style="${styles.textMuted} margin-bottom: 0;">Time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>

        <div style="${styles.card}">
            <p style="${styles.textNormal}; text-align: center; margin: 0;">
                We hope you had an amazing experience. <br>
                See you at the next event! 🚀
            </p>
        </div>
    `;
    return BaseLayout(content);
};

// 6. Promotional Email
export const getPromotionalTemplate = () => {
    // Content provided by user
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <p style="color: #a855f7; font-weight: bold; letter-spacing: 1px;">🚀 START 2026 WITH A BANG!</p>
            <h1 style="font-size: 28px; color: #fff; margin: 10px 0 5px; line-height: 1.2;">CODE + CAMPFIRE + DJ</h1>
            <p style="color: #888;">The Ultimate Vibe is Here.</p>
        </div>

        <div style="${styles.card}">
            <p style="${styles.textNormal}">
                Get ready for <strong>VIBE CODING</strong> – The ultimate 24-Hour Hackathon, hosted by Dept. of CSE, ANITS! This isn't just about coding; it's about the VIBE.
            </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
             <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                <div style="font-size: 20px;">🏆</div>
                <div style="color: #fff; font-weight: bold; margin-top: 5px;">₹60,000</div>
                <div style="font-size: 11px; color: #888;">Prize Pool</div>
             </div>
             <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                <div style="font-size: 20px;">📜</div>
                <div style="color: #fff; font-weight: bold; margin-top: 5px;">Job Offers</div>
                <div style="font-size: 11px; color: #888;">& Internships</div>
             </div>
        </div>

        <div style="${styles.highlightBox}; text-align: left;">
            <h3 style="color: #fff; margin: 0 0 10px; font-size: 16px;">🎉 THE FUN STUFF</h3>
            <ul style="color: #ccc; font-size: 14px; padding-left: 20px; line-height: 1.6; margin: 0;">
                <li>Cozy Campfire & Midnight Cinema 🔥</li>
                <li>DJ Night & Jamming 🎧</li>
                <li>Snacks & High-Speed Wi-Fi 🍕</li>
                <li>Exclusive Swag & Merch 🎁</li>
            </ul>
        </div>

        <div style="${styles.card}; text-align: center;">
            <p style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Event Details</p>
            <p style="color: #fff; font-weight: bold; margin: 0;">Jan 5-6, 2026 • CSE Labs, ANITS</p>
            <p style="color: #a855f7; margin-top: 5px;">Entry Starts at ₹309</p>
        </div>

        <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
            <a href="https://cursors-anits.vercel.app/" style="${styles.button}; transform: scale(1.1);">REGISTER NOW</a>
            <p style="margin-top: 15px; color: #666; font-size: 12px;">Limited Seats Available!</p>
        </div>
    `;
    return BaseLayout(content);
};

// 7. Waitlist Notification
export const getWaitlistTemplate = (name: string) => {
    const content = `
        <div style="${styles.highlightBox}; border-color: #22c55e; background: rgba(34, 197, 94, 0.1);">
            <div style="font-size: 40px; margin-bottom: 10px;">🎟️</div>
            <h2 style="margin: 0 0 5px; color: #fff; font-size: 24px;">You're In!</h2>
            <p style="margin: 0; color: #86efac;">You've been moved off the waitlist.</p>
        </div>

        <div style="${styles.card}">
            <p style="${styles.textNormal}">
                Great news, ${name.split(' ')[0]}! A spot has opened up for Vibe Coding 2026.
                You have <strong>24 hours</strong> to claim your ticket before we offer it to the next person.
            </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
             <a href="https://cursors-anits.vercel.app/" style="${styles.button}; background-color: #22c55e; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);">CLAIM TICKET NOW</a>
        </div>
    `;
    return BaseLayout(content);
};

// 8. Project Submission Success
export const getSubmissionSuccessTemplate = (projectName: string, teamName: string) => {
    const content = `
        <div style="${styles.card}; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 10px;">🚀</div>
            <h2 style="color: #fff; margin: 0 0 5px;">Submission Received</h2>
            <p style="color: #888; margin: 0;">We've got your project!</p>
        </div>

        <div style="${styles.card}">
            <div style="margin-bottom: 15px;">
                <p style="${styles.textMuted} text-transform: uppercase; margin-bottom: 5px;">Project Name</p>
                <h3 style="color: #fff; margin: 0;">${projectName}</h3>
            </div>
            <div>
                <p style="${styles.textMuted} text-transform: uppercase; margin-bottom: 5px;">Team</p>
                <h4 style="color: #a855f7; margin: 0;">${teamName}</h4>
            </div>
        </div>

        <div style="${styles.card}">
            <h4 style="color: #fff; margin: 0 0 10px;">What's Next?</h4>
            <p style="${styles.textMuted}">
                Judging will begin shortly. Please stay at your designated table and ensure your demo is ready.
                Good luck!
            </p>
        </div>
    `;
    return BaseLayout(content);
};

// 9. Winner Announcement
export const getWinnerTemplate = (prizeName: string, amount: string) => {
    const content = `
        <div style="${styles.highlightBox}; border-color: #eab308; background: rgba(234, 179, 8, 0.15);">
            <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
            <h1 style="margin: 0 0 5px; color: #fff; font-size: 28px;">CONGRATULATIONS!</h1>
            <p style="margin: 0; color: #fde047; font-weight: bold;">You are a Winner!</p>
        </div>

        <div style="${styles.card}; text-align: center;">
            <p style="${styles.textMuted} text-transform: uppercase; margin-bottom: 10px;">You have won</p>
            <h2 style="font-size: 32px; color: #fff; margin: 0 0 5px;">${prizeName}</h2>
            <div style="font-size: 24px; color: #eab308; font-weight: bold;">${amount}</div>
        </div>

        <div style="${styles.card}">
            <p style="${styles.textNormal}">
                This is a huge achievement! The entire team at Vibe Coding is incredibly proud of what you've built.
                Please report to the main stage for the awards ceremony.
            </p>
        </div>
    `;
    return BaseLayout(content);
};

// 10. Certificate Download
export const getCertificateTemplate = (name: string, certificateLink: string) => {
    const content = `
        <div style="${styles.card}; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 10px;">📜</div>
            <h2 style="color: #fff; margin: 0 0 5px;">Certificate of Achievement</h2>
            <p style="color: #888; margin: 0;">Vibe Coding 2026</p>
        </div>

        <div style="${styles.card}">
            <p style="${styles.textNormal}">
                Hi ${name.split(' ')[0]},
                <br><br>
                Thank you for being part of Vibe Coding 2026. Your official certificate is now available for download.
                You can add this to your LinkedIn profile or resume.
            </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
             <a href="${certificateLink}" style="${styles.button}">DOWNLOAD CERTIFICATE</a>
        </div>
    `;
    return BaseLayout(content);
};

// 11. Feedback Request
export const getFeedbackTemplate = (formLink: string) => {
    const content = `
        <div style="${styles.card}; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 15px;">🤔</div>
            <h2 style="color: #fff; margin: 0 0 10px;">How was the Vibe?</h2>
            <p style="${styles.textNormal}">
                We'd love to hear your thoughts on Vibe Coding 2026.
                Your feedback helps us make the next event even better (and vibey-er).
            </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
             <a href="${formLink}" style="${styles.button}">SHARE FEEDBACK</a>
        </div>

        <p style="${styles.textMuted}; text-align: center; margin-top: 20px;">
            It only takes 2 minutes!
        </p>
    `;
    return BaseLayout(content);
};
