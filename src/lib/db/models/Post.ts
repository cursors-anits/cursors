
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment {
    author: string; // Name + Team ID
    authorId: string; // User ID or Team ID
    text: string;
    createdAt: Date;
}

export interface IPost extends Document {
    teamId: string;
    authorName: string;
    authorAvatar?: string;
    content?: string;
    media: {
        url: string;
        type: 'image' | 'video';
    }[];
    likes: string[]; // Array of IDs who liked
    comments: IComment[];
    category: 'image' | 'video' | 'mixed';
    createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
    author: { type: String, required: true },
    authorId: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const PostSchema = new Schema<IPost>({
    teamId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String },
    content: { type: String },
    media: [{
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true }
    }],
    likes: [{ type: String }],
    comments: [CommentSchema],
    category: { type: String, enum: ['image', 'video', 'mixed'], default: 'mixed' },
    createdAt: { type: Date, default: Date.now }
});

// Create model if it doesn't exist
const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
