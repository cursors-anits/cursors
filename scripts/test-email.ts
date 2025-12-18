
import { sendEventPassEmail } from '../src/lib/email';

async function main() {
    console.log('Testing Email Sending for all ticket types...');

    const testEmail = 'palikaomkar.22.cse@anits.edu.in';
    const testTeamIdBase = 'TEST-VIBE';
    const testMembers = [
        { name: 'Omkar Palika', department: 'CSE', year: '3rd Year', passkey: 'OMKAR-123' },
        { name: 'Test Member', department: 'ECE', year: '2nd Year', passkey: 'TEST-KEY' }
    ];

    const types: ('workshop' | 'hackathon' | 'combo')[] = ['workshop', 'hackathon', 'combo'];

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
