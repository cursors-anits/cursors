// Script to seed initial data to MongoDB
// Run with: node --loader ts-node/esm scripts/seed.ts
// Or: ts-node scripts/seed.ts

import dbConnect from '../src/lib/db/mongodb';
import User from '../src/lib/db/models/User';
import Coordinator from '../src/lib/db/models/Coordinator';
import mongoose from 'mongoose';

async function seed() {
    try {
        await dbConnect();

        console.log('🌱 Seeding database...');

        // Create admin user
        const adminExists = await User.findOne({ email: 'admin@vibe.com' });
        if (!adminExists) {
            await User.create({
                email: 'admin@vibe.com',
                name: 'Admin User',
                role: 'admin',
                password: 'admin123', // Will be hashed automatically
            });
            console.log('✅ Admin user created');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // Create coordinator user
        const coordExists = await User.findOne({ email: 'coordinator@vibe.com' });
        if (!coordExists) {
            const coordUser = await User.create({
                email: 'coordinator@vibe.com',
                name: 'Coordinator User',
                role: 'coordinator',
                password: 'coord123',
                assignedLab: 'Lab 1 (CSE)',
            });

            await Coordinator.create({
                name: 'Coordinator User',
                email: 'coordinator@vibe.com',
                role: 'Student',
                assigned: 'Lab 1 (CSE)',
                userId: coordUser._id,
            });
            console.log('✅ Coordinator user created');
        } else {
            console.log('ℹ️  Coordinator user already exists');
        }

        // Create faculty user
        const facultyExists = await User.findOne({ email: 'faculty@vibe.com' });
        if (!facultyExists) {
            await User.create({
                email: 'faculty@vibe.com',
                name: 'Faculty User',
                role: 'faculty',
                password: 'faculty123',
            });

            await Coordinator.create({
                name: 'Faculty User',
                email: 'faculty@vibe.com',
                role: 'Faculty',
                assigned: 'Stage',
            });
            console.log('✅ Faculty user created');
        } else {
            console.log('ℹ️  Faculty user already exists');
        }

        console.log('✨ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seed();
