
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useEmblaCarousel from 'embla-carousel-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface PostMedia {
    url: string;
    type: 'image' | 'video';
}

interface Comment {
    author: string;
    text: string;
    createdAt: string; // ISO date
}

export interface Post {
    _id: string;
    teamId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    media: PostMedia[];
    likes: string[];
    comments: Comment[];
    createdAt: string;
}

interface PostCardProps {
    post: Post;
    currentUserId: string; // Team ID or Admin ID
    currentUserAvatar?: string;
    currentUserName: string;
    onLikeToggle?: (postId: string, liked: boolean) => void; // Optional callback for parent state update
}

const PostCard = ({ post, currentUserId, currentUserAvatar, currentUserName }: PostCardProps) => {
    const [likes, setLikes] = useState<string[]>(post.likes);
    const [comments, setComments] = useState<Comment[]>(post.comments);
    const [commentText, setCommentText] = useState('');
    const [isLiked, setIsLiked] = useState(post.likes.includes(currentUserId));
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

    // Handle Like
    const handleLike = async () => {
        // Optimistic update
        const previouslyLiked = isLiked;
        setIsLiked(!previouslyLiked);
        setLikes(prev => previouslyLiked ? prev.filter(id => id !== currentUserId) : [...prev, currentUserId]);

        try {
            const res = await fetch(`/api/posts/${post._id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });
            if (!res.ok) throw new Error();
        } catch (error) {
            // Revert
            setIsLiked(previouslyLiked);
            setLikes(previouslyLiked ? [...likes, currentUserId] : likes.filter(id => id !== currentUserId));
            toast.error('Failed to like post');
        }
    };

    // Handle Comment
    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setIsSubmittingComment(true);
        try {
            const res = await fetch(`/api/posts/${post._id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author: currentUserName,
                    authorId: currentUserId,
                    text: commentText
                })
            });

            if (!res.ok) throw new Error();
            const data = await res.json();

            // Append new comment locally (or use response data which returns updated comments array)
            // The API returns { success: true, comments: updatedComments }
            setComments(data.comments);
            setCommentText('');
            toast.success('Comment added');
        } catch (error) {
            toast.error('Failed to add comment');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    return (
        <Card className="bg-brand-surface border-white/10 overflow-hidden mb-6">
            {/* Header */}
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 overflow-hidden relative border border-white/10">
                        {post.authorAvatar ? (
                            <Image src={post.authorAvatar} alt={post.authorName} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-primary font-bold">
                                {post.authorName.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white leading-none">{post.authorName}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-brand-dark border-white/10">
                        <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-900/10 cursor-pointer">
                            Report Post
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            {/* Media Carousel */}
            {post.media.length > 0 && (
                <div className="relative bg-black/50 aspect-square sm:aspect-video w-full" ref={emblaRef}>
                    <div className="flex h-full touch-pan-y">
                        {post.media.map((item, index) => (
                            <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center bg-black">
                                {item.type === 'video' ? (
                                    <video src={item.url} controls className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <div className="relative w-full h-full">
                                        <Image src={item.url} alt={`Post media ${index + 1}`} fill className="object-contain" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Dots/Indicators could go here if multiple */}
                    {post.media.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                            {post.media.map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === 0 ? 'bg-brand-primary' : 'bg-white/30'}`} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Actions & Caption */}
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto hover:bg-transparent text-white gap-2"
                        onClick={handleLike}
                    >
                        <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                        {likes.length > 0 && <span className="text-sm font-semibold">{likes.length}</span>}
                    </Button>
                    <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent text-white gap-2">
                        <MessageCircle className="w-6 h-6" />
                        {comments.length > 0 && <span className="text-sm font-semibold">{comments.length}</span>}
                    </Button>
                    <div className="flex-1" />
                    {/* Share button can be added here */}
                </div>

                {/* Caption */}
                {post.content && (
                    <div className="text-sm text-gray-200">
                        <span className="font-bold mr-2 text-white">{post.authorName}</span>
                        {post.content}
                    </div>
                )}

                {/* Comments */}
                {comments.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                        {comments.slice(-3).map((comment, i) => (
                            <div key={i} className="text-xs">
                                <span className="font-semibold text-gray-300 mr-2">{comment.author}</span>
                                <span className="text-gray-400">{comment.text}</span>
                            </div>
                        ))}
                        {comments.length > 3 && (
                            <button className="text-xs text-brand-primary/80 hover:text-brand-primary mt-1">
                                View all {comments.length} comments
                            </button>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Add Comment */}
            <CardFooter className="p-4 pt-0">
                <form onSubmit={handleComment} className="w-full flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 shrink-0 overflow-hidden relative">
                        {currentUserAvatar ? (
                            <Image src={currentUserAvatar} alt="Me" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-brand-primary">ME</div>
                        )}
                    </div>
                    <Input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-transparent border-none text-sm focus-visible:ring-0 placeholder:text-gray-600 p-0 h-auto"
                        disabled={isSubmittingComment}
                    />
                    {commentText.trim() && (
                        <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-brand-primary hover:text-brand-primary/80 p-0 h-auto font-semibold"
                            disabled={isSubmittingComment}
                        >
                            Post
                        </Button>
                    )}
                </form>
            </CardFooter>
        </Card>
    );
};

export default PostCard;
