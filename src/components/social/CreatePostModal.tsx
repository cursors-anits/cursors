
'use client';

import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Member {
    name: string;
    // Add other fields if necessary
}

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    members: { name: string }[]; // List of team members to select author
    teamId: string;
    teamAvatar?: string;
    onPostCreated: () => void;
}

const CreatePostModal = ({ isOpen, onClose, members, teamId, teamAvatar, onPostCreated }: CreatePostModalProps) => {
    const [authorName, setAuthorName] = useState(members[0]?.name || '');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content.trim() && files.length === 0) {
            toast.error('Please add some content or media');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('teamId', teamId);
            formData.append('authorName', authorName || `Team ${teamId}`);
            if (teamAvatar) formData.append('authorAvatar', teamAvatar);
            formData.append('content', content);

            files.forEach(file => {
                formData.append('files', file);
            });

            const res = await fetch('/api/posts', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create post');
            }

            toast.success('Post shared successfully!');
            setContent('');
            setFiles([]);
            onPostCreated();
            onClose();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-brand-dark border-white/10 sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-white">Create New Post</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Author Selection */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 overflow-hidden relative">
                            {/* Just show team avatar or generic */}
                            <div className="w-full h-full flex items-center justify-center text-brand-primary font-bold">
                                {teamId.split('-')[1] || 'TM'}
                            </div>
                        </div>
                        <div className="flex-1">
                            {members.length > 0 ? (
                                <Select value={authorName} onValueChange={setAuthorName}>
                                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Select who is posting" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-brand-dark border-white/10 text-white">
                                        {members.map((m, i) => (
                                            <SelectItem key={i} value={m.name}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-white font-semibold">Team {teamId}</p>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="bg-transparent border-none focus-visible:ring-0 text-lg min-h-[100px] resize-none p-0 placeholder:text-gray-600"
                    />

                    {/* Media Previews */}
                    {files.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {files.map((file, i) => (
                                <div key={i} className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-white/10 group">
                                    {file.type.startsWith('image') ? (
                                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                    )}
                                    <button
                                        onClick={() => removeFile(i)}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Media Actions */}
                    <div className="flex gap-2 pt-2 border-t border-white/10">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-brand-primary hover:bg-brand-primary/10"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Photo/Video
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || (!content && files.length === 0)} className="bg-brand-primary text-white hover:bg-brand-primary/80">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                        Post
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePostModal;
