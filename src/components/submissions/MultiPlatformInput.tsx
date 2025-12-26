import React, { useState, KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MultiPlatformInputProps {
    platforms: string[];
    onPlatformsChange: (platforms: string[]) => void;
}

export const MultiPlatformInput: React.FC<MultiPlatformInputProps> = ({ platforms, onPlatformsChange }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addPlatform();
        }
    };

    const addPlatform = () => {
        if (inputValue.trim()) {
            const newPlatform = inputValue.trim();
            if (!platforms.includes(newPlatform)) {
                onPlatformsChange([...platforms, newPlatform]);
            }
            setInputValue('');
        }
    };

    const removePlatform = (indexToRemove: number) => {
        onPlatformsChange(platforms.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="space-y-3">
            <Label className="text-gray-300">Vibe Coding Platforms Used</Label>
            <div className="flex flex-wrap gap-2 min-h-[32px]">
                {platforms.map((platform, index) => (
                    <Badge
                        key={index}
                        className="bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border-brand-primary/20 px-3 py-1 text-sm flex items-center gap-1 transition-colors"
                    >
                        {platform}
                        <button
                            onClick={() => removePlatform(index)}
                            className="ml-1 hover:text-white rounded-full p-0.5 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type platform (e.g., Replit, Vercel) and press Enter"
                    className="bg-brand-dark border-white/10 text-white placeholder:text-gray-600 focus:border-brand-primary/50"
                />
                <Button
                    type="button"
                    onClick={addPlatform}
                    variant="outline"
                    className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <p className="text-xs text-gray-500">
                List all platforms, tools, and services you used during development.
            </p>
        </div>
    );
};
