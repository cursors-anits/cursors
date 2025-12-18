import { google } from 'googleapis';
import { Readable } from 'stream';

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !FOLDER_ID) {
    console.warn('Google Drive OAuth2 credentials missing. Screenshots will fallback to local storage or fail.');
}

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

/**
 * Uploads a base64 string to Google Drive
 * @param base64Data The base64 encoded image string
 * @param fileName Name of the file in Drive
 * @returns The web view link of the uploaded file
 */
export async function uploadToDrive(base64Data: string, fileName: string): Promise<string> {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !FOLDER_ID) {
        throw new Error('Google Drive OAuth2 configuration is incomplete');
    }

    try {
        // Verify folder access
        try {
            await drive.files.get({
                fileId: FOLDER_ID,
                fields: 'id, name, driveId',
                supportsAllDrives: true
            });
        } catch (folderError: any) {
            console.error('GDrive Folder Access Error:', {
                message: folderError.message,
                data: folderError.response?.data
            });
            throw new Error(`Cannot access destination folder ${FOLDER_ID}. Ensure the authenticated account has access to this folder.`);
        }

        // Remove the data URL prefix if it exists
        const base64Content = base64Data.includes('base64,')
            ? base64Data.split('base64,')[1]
            : base64Data;

        const buffer = Buffer.from(base64Content, 'base64');
        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);

        const response = await drive.files.create({
            requestBody: {
                name: `${fileName}.jpg`,
                parents: [FOLDER_ID],
                mimeType: 'image/jpeg',
            },
            media: {
                mimeType: 'image/jpeg',
                body: bufferStream,
            },
            fields: 'id, webViewLink, webContentLink',
            supportsAllDrives: true,
        });

        const fileId = response.data.id;

        // Make the file publicly viewable (Required for dashboards to display it)
        await drive.permissions.create({
            fileId: fileId!,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
            supportsAllDrives: true,
        });

        // Use the webContentLink for direct image embedding or webViewLink for the page
        return response.data.webViewLink || '';
    } catch (error: any) {
        console.error('Google Drive Upload Error Details:', {
            message: error.message,
            data: error.response?.data,
            code: error.code
        });

        if (error.message?.includes('storage quota')) {
            throw new Error('Google Drive storage quota exceeded. Please check your account storage.');
        }

        throw new Error('Failed to upload screenshot to Google Drive');
    }
}
