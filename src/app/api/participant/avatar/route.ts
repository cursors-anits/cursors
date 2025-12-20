import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Participant from '@/lib/db/models/Participant';
import { ensureFolderExists, uploadToFolder } from '@/lib/gdrive';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        let teamId: string;
        let avatarSource: string | Buffer;

        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            teamId = formData.get('teamId') as string;
            const file = formData.get('file') as File;

            if (!teamId || !file) {
                return NextResponse.json({ error: 'Missing teamId or file' }, { status: 400 });
            }

            const arrayBuffer = await file.arrayBuffer();
            avatarSource = Buffer.from(arrayBuffer);
        } else {
            const body = await request.json();
            teamId = body.teamId;
            avatarSource = body.avatarData;
        }

        if (!teamId || !avatarSource) {
            return NextResponse.json({ error: 'Missing teamId or avatarData' }, { status: 400 });
        }

        // 1. Ensure 'avatars' folder exists
        const avatarsFolderId = await ensureFolderExists('avatars');

        // 2. Upload avatar to GDrive
        const avatarUrl = await uploadToFolder(avatarSource, `Avatar_${teamId}`, avatarsFolderId);

        // 3. Update ALL team members
        const result = await Participant.updateMany(
            { teamId },
            { $set: { avatarUrl } }
        );

        return NextResponse.json({
            success: true,
            avatarUrl,
            updatedCount: result.modifiedCount
        });
    } catch (error: any) {
        console.error('Avatar upload error:', error);
        return NextResponse.json({ error: error.message || 'Failed to upload avatar' }, { status: 500 });
    }
}
