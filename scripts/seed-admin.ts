import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedAdmin() {
    try {
        await dbConnect();

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.error('❌ Error: ADMIN_EMAIL or ADMIN_PASSWORD not found in environment variables.');
            process.exit(1);
        }

        console.log(`🌱 Seeding admin: ${adminEmail}...`);

        // Ensure only this admin exists
        await User.deleteMany({ email: { $ne: adminEmail }, role: 'admin' });
        console.log('🧹 Cleaned up other admin accounts.');

        const adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            await User.create({
                email: adminEmail,
                name: 'Omkar Palika',
                role: 'admin',
                password: adminPassword,
            });
            console.log(`✅ Admin user created successfully.`);
        } else {
            adminUser.password = adminPassword;
            if (adminUser.role !== 'admin') {
                adminUser.role = 'admin';
            }
            await adminUser.save();
            console.log(`ℹ️  Admin user updated/reset.`);
        }

        console.log('✨ Admin seed complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
