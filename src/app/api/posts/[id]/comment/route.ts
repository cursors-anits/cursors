
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/lib/db/models/Post';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const { author, authorId, text } = await request.json();

        if (!author || !authorId || !text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const newComment = {
            author, // Name of commenter
            authorId,
            text,
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        return NextResponse.json({ success: true, comments: post.comments });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
