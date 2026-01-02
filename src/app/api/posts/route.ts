
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/lib/db/models/Post';
import { uploadToFolder, ensureFolderExists } from '@/lib/gdrive';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = parseInt(searchParams.get('skip') || '0');
        const type = searchParams.get('type'); // 'image' | 'video' | undefined

        const query: any = {};
        if (type && type !== 'all') {
            // If type is specified, we filter posts that HAVE that type of media
            query['media.type'] = type;
        }

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments(query);

        return NextResponse.json({
            posts,
            hasMore: skip + posts.length < total,
            total
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const formData = await request.formData();

        const teamId = formData.get('teamId') as string;
        const authorName = formData.get('authorName') as string;
        const authorAvatar = formData.get('authorAvatar') as string;
        const content = formData.get('content') as string;

        if (!teamId || !authorName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const files = formData.getAll('files') as File[];
        const uploadedMedia = [];

        // 1. Root Folder
        const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (!rootFolderId) throw new Error('Missing Drive Folder ID');

        // 2. Ensure "Social Feed" folder exists
        const socialFolderId = await ensureFolderExists('Social Feed', rootFolderId);

        // 3. Ensure Team Folder exists inside Social Feed
        // "saved to db under team names folder"
        const teamFolderId = await ensureFolderExists(teamId, socialFolderId);

        // 4. Upload Files
        for (const file of files) {
            if (file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const mimeType = file.type;
                const isVideo = mimeType.startsWith('video/');

                const driveUrl = await uploadToFolder(
                    buffer,
                    `${Date.now()}_${file.name}`,
                    teamFolderId,
                    mimeType
                );

                uploadedMedia.push({
                    url: driveUrl,
                    type: isVideo ? 'video' : 'image' as any
                });
            }
        }

        const newPost = await Post.create({
            teamId,
            authorName,
            authorAvatar,
            content,
            media: uploadedMedia,
            category: uploadedMedia.some(m => m.type === 'video') ? (uploadedMedia.some(m => m.type === 'image') ? 'mixed' : 'video') : 'image',
            likes: [],
            comments: []
        });

        return NextResponse.json({ success: true, post: newPost }, { status: 201 });

    } catch (error: any) {
        console.error('Create Post Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 });
    }
}
