// Script to seed initial data to MongoDB
// Run with: npm run db:seed
// Or: npx tsx --env-file=.env.local scripts/seed.ts

import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Coordinator from '@/lib/db/models/Coordinator';
import Participant from '@/lib/db/models/Participant';

async function seed() {
    try {
        await dbConnect();

        console.log('🌱 Seeding database...');

        // Create/Update admin user
        const adminEmail = 'admin@vibe.com';
        const adminPassword = 'admin123';

        const adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            await User.create({
                email: adminEmail,
                name: 'Admin User',
                role: 'admin',
                password: adminPassword,
            });
            console.log(`✅ Admin user created (${adminEmail})`);
        } else {
            adminUser.password = adminPassword;
            await adminUser.save();
            console.log(`ℹ️  Admin user updated/reset (${adminEmail})`);
        }

        // Create/Update coordinator user
        const coordEmail = 'coordinator@vibe.com';
        const coordPassword = 'coord123';

        let coordUser = await User.findOne({ email: coordEmail });
        if (!coordUser) {
            coordUser = await User.create({
                email: coordEmail,
                name: 'Coordinator User',
                role: 'coordinator',
                password: coordPassword,
                assignedLab: 'Lab 1 (CSE)',
            });

            await Coordinator.create({
                name: 'Coordinator User',
                email: coordEmail,
                role: 'Student',
                assigned: 'Lab 1 (CSE)',
                userId: coordUser._id,
            });
            console.log(`✅ Coordinator user created (${coordEmail})`);
        } else {
            coordUser.password = coordPassword;
            await coordUser.save();
            console.log(`ℹ️  Coordinator user updated/reset (${coordEmail})`);
        }

        // Create/Update faculty user
        const facultyEmail = 'faculty@vibe.com';
        const facultyPassword = 'faculty123';

        const facultyUser = await User.findOne({ email: facultyEmail });
        if (!facultyUser) {
            await User.create({
                email: facultyEmail,
                name: 'Faculty User',
                role: 'faculty',
                password: facultyPassword,
            });

            await Coordinator.create({
                name: 'Faculty User',
                email: facultyEmail,
                role: 'Faculty',
                assigned: 'Stage',
            });
            console.log(`✅ Faculty user created (${facultyEmail})`);
        } else {
            facultyUser.password = facultyPassword;
            await facultyUser.save();
            console.log(`ℹ️  Faculty user updated/reset (${facultyEmail})`);
        }

        // Create test participant user
        const participantExists = await User.findOne({ email: 'test@vibe.com' });
        if (!participantExists) {
            await User.create({
                email: 'test@vibe.com',
                name: 'Test Participant',
                role: 'participant',
                passkey: 'VIBE-TEST',
                teamId: 'T-TEST-001'
            });

            await Participant.create({
                participantId: 'P-TEST-001',
                teamId: 'T-TEST-001',
                name: 'Test Participant',
                email: 'test@vibe.com',
                college: 'Vibe University',
                department: 'CSE',
                whatsapp: '9876543210',
                year: '3rd Year',
                type: 'Combo',
                status: 'Paid',
                assignedLab: 'Lab 1 (CSE)',
                assignedSeat: 'A-01'
            });
            console.log('✅ Test participant created');
        } else {
            console.log('ℹ️  Test participant already exists');
        }

        console.log('✨ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seed();
