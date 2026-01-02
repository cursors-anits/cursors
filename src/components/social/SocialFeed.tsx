
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus, Image as LucideImage, Video as LucideVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PostCard, { Post } from './PostCard';
import CreatePostModal from './CreatePostModal';
import { toast } from 'sonner';

interface SocialFeedProps {
    currentUserId: string; // Team ID or Admin ID
    currentUserName: string;
    currentUserAvatar?: string;
    teamId: string;
    members: { name: string;[key: string]: any }[];
}

const SocialFeed = ({ currentUserId, currentUserName, currentUserAvatar, teamId, members }: SocialFeedProps) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchPosts = useCallback(async (reset = false) => {
        try {
            const currentPage = reset ? 0 : page;
            const res = await fetch(`/api/posts?skip=${currentPage * 10}&limit=10&type=${activeTab === 'all' ? '' : activeTab === 'photos' ? 'image' : 'video'}`);
            if (!res.ok) throw new Error();
            const data = await res.json();

            if (reset) {
                setPosts(data.posts);
                setPage(1);
            } else {
                setPosts(prev => [...prev, ...data.posts]);
                setPage(prev => prev + 1);
            }
            setHasMore(data.hasMore);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    }, [page, activeTab]);

    useEffect(() => {
        setLoading(true);
        fetchPosts(true);
    }, [activeTab]);

    const handlePostCreated = () => {
        fetchPosts(true);
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* Header / Tabs */}
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="bg-brand-surface border border-white/10">
                        <TabsTrigger value="all" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">All</TabsTrigger>
                        <TabsTrigger value="photos" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white gap-2">
                            <LucideImage className="w-4 h-4" /> Photos
                        </TabsTrigger>
                        <TabsTrigger value="videos" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white gap-2">
                            <LucideVideo className="w-4 h-4" /> Videos
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <Button
                    className="bg-brand-primary text-white hover:bg-brand-primary/80"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2" /> Create Post
                </Button>
            </div>

            {/* Feed */}
            <div className="space-y-6">
                {loading && page === 0 ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                    </div>
                ) : posts.length > 0 ? (
                    <>
                        {posts.map(post => (
                            <PostCard
                                key={post._id}
                                post={post}
                                currentUserId={currentUserId}
                                currentUserName={currentUserName}
                                currentUserAvatar={currentUserAvatar}
                            />
                        ))}

                        {hasMore && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    variant="outline"
                                    className="border-white/10 text-gray-400 hover:text-white"
                                    onClick={() => fetchPosts()}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Load More
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <p>No posts yet. Be the first to share!</p>
                    </div>
                )}
            </div>

            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                teamId={teamId}
                members={members}
                onPostCreated={handlePostCreated}
                teamAvatar={currentUserAvatar} // Just pass something for now
            />
        </div>
    );
};

export default SocialFeed;
