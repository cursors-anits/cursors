import * as dotenv from 'dotenv';
import path from 'path';
import { google } from 'googleapis';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

async function diagnoseGDrive() {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        console.error('❌ Missing OAuth2 credentials in .env.local');
        return;
    }

    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
        console.log('--- Testing Account Access ---');
        const about = await drive.about.get({ fields: 'user' });
        console.log(`✅ Authenticated as: ${about.data.user?.emailAddress}`);

        console.log('\n--- Listing Recent Folders ---');
        const res = await drive.files.list({
            q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields: 'files(id, name)',
            pageSize: 10,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });

        const folders = res.data.files;
        if (folders?.length) {
            console.log('Found these folders:');
            folders.forEach(f => console.log(`- ${f.name} (ID: ${f.id})`));
        } else {
            console.log('No folders found.');
        }

        console.log('\n--- Checking Target Folder ID ---');
        const targetId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (targetId) {
            try {
                const target = await drive.files.get({
                    fileId: targetId,
                    fields: 'id, name',
                    supportsAllDrives: true
                });
                console.log(`✅ Target folder found: ${target.data.name}`);
            } catch (err: any) {
                console.log(`❌ Target folder ${targetId} NOT FOUND. Error: ${err.message}`);
            }
        }

    } catch (error: any) {
        console.error('❌ Diagnostic failed:', error.message);
        if (error.response?.data) console.error(JSON.stringify(error.response.data, null, 2));
    }
}

diagnoseGDrive();
