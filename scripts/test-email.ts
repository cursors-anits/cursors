
import { sendEventPassEmail } from '../src/lib/email';

async function main() {
    console.log('Testing Email Sending for all ticket types...');

    const testEmail = 'palikaomkar.22.cse@anits.edu.in';
    const testTeamIdBase = 'TEST-VIBE';
    const testMembers = [
        { name: 'John Doe', college: 'ANITS', department: 'CSE', year: '3rd Year', passkey: 'PASS123' },
        { name: 'Jane Smith', college: 'GITAM', department: 'ECE', year: '2nd Year', passkey: 'PASS456' },
        { name: 'Bob Johnson', college: 'ANITS', department: 'IT', year: '4th Year', passkey: 'PASS789' }
    ];

    const types: ('hackathon')[] = ['hackathon'];

    for (const type of types) {
        process.stdout.write(`Sending ${type} pass to ${testEmail}... `);
        try {
            const teamId = `${testTeamIdBase}-${type.toUpperCase()}`;
            const teamEmail = `test-${type}@vibe.com`;
            const teamPasskey = `PASS-${type.toUpperCase()}`;

            const success = await sendEventPassEmail(
                testEmail,
                teamId,
                testMembers,
                'ANITS',
                type,
                teamEmail,
                teamPasskey
            );

            if (success) {
                console.log('✅ Success');
            } else {
                console.log('❌ Failed');
            }
        } catch (error) {
            console.log('❌ Error');
            console.error(error);
        }
    }
}

main();
