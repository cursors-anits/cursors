import dbConnect from '../src/lib/db/mongodb';
import mongoose from 'mongoose';

async function dropConflictingIndex() {
    try {
        await dbConnect();
        const db = mongoose.connection.db;
        if (!db) throw new Error('Database connection failed');

        console.log('Checking indexes for participants collection...');
        const collection = db.collection('participants');
        const indexes = await collection.indexes();

        const hasIndex = indexes.some(idx => idx.name === 'transactionId_1');

        if (hasIndex) {
            console.log('Dropping unique index transactionId_1...');
            await collection.dropIndex('transactionId_1');
            console.log('✅ Index dropped successfully.');
        } else {
            console.log('ℹ️ Index transactionId_1 not found or already dropped.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error dropping index:', error);
        process.exit(1);
    }
}

dropConflictingIndex();
