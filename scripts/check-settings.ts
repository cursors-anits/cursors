
import dbConnect from '../src/lib/db/mongodb';
import Settings from '../src/lib/db/models/Settings';
import dotenv from 'dotenv';
dotenv.config();

// Standard env vars are usually loaded by Next.js, here we might need to load them if not present.
// Assuming MONGODB_URI is available in the environment created by npx.

async function check() {
    try {
        console.log('Connecting to DB...');
        await dbConnect();
        console.log('Connected. Fetching settings...');
        const settings = await Settings.findOne({});
        console.log('Settings Document:');
        console.log(JSON.stringify(settings, null, 2));

        if (settings) {
            console.log('Colleges count:', settings.colleges?.length);
            console.log('Cities count:', settings.cities?.length);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
