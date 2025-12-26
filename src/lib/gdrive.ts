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
 * Uploads a base64 string or Buffer to Google Drive
 * @param source The base64 encoded image string or a Buffer
 * @param fileName Name of the file in Drive
 * @returns The web view link of the uploaded file
 */
export async function uploadToDrive(source: string | Buffer, fileName: string): Promise<string> {
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

        let buffer: Buffer;
        if (Buffer.isBuffer(source)) {
            buffer = source;
        } else {
            const base64Content = source.includes('base64,')
                ? source.split('base64,')[1]
                : source;
            buffer = Buffer.from(base64Content, 'base64');
        }

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

        // Make the file publicly viewable
        await drive.permissions.create({
            fileId: fileId!,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
            supportsAllDrives: true,
        });

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

/**
 * Ensures a folder exists within a parent folder
 * @param folderName Name of the folder to find or create
 * @param parentId ID of the parent folder
 * @returns The ID of the found or created folder
 */
export async function ensureFolderExists(folderName: string, parentId: string = FOLDER_ID!): Promise<string> {
    try {
        const response = await drive.files.list({
            q: `name = '${folderName}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            fields: 'files(id, name)',
            spaces: 'drive',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });

        const files = response.data.files || [];
        if (files.length > 0) {
            return files[0].id!;
        }

        // Create the folder
        const createResponse = await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId],
            },
            fields: 'id',
            supportsAllDrives: true,
        });

        return createResponse.data.id!;
    } catch (error: any) {
        console.error('GDrive ensureFolderExists Error:', error.message);
        throw new Error(`Failed to ensure folder ${folderName} exists`);
    }
}

/**
 * Uploads a file to a specific parent folder
 */
export async function uploadToFolder(source: string | Buffer, fileName: string, parentId: string, mimeType: string = 'application/octet-stream'): Promise<string> {
    try {
        let buffer: Buffer;
        if (Buffer.isBuffer(source)) {
            buffer = source;
        } else {
            const base64Content = source.includes('base64,')
                ? source.split('base64,')[1]
                : source;
            buffer = Buffer.from(base64Content, 'base64');
        }

        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);

        const response = await drive.files.create({
            requestBody: {
                name: fileName, // fileName should now include extension
                parents: [parentId],
                mimeType: mimeType,
            },
            media: {
                mimeType: mimeType,
                body: bufferStream,
            },
            fields: 'id, webViewLink, webContentLink',
            supportsAllDrives: true,
        });

        const fileId = response.data.id;

        await drive.permissions.create({
            fileId: fileId!,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
            supportsAllDrives: true,
        });

        // Use direct link for display
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    } catch (error: any) {
        console.error('GDrive uploadToFolder Error:', error.message);
        throw new Error('Failed to upload file to GDrive folder');
    }
}
