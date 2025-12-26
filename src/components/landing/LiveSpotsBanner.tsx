'use client';

import { useData } from '@/lib/context/DataContext';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveSpotsBanner() {
    const { participants, settings } = useData();

    if (!settings?.fomoConfig?.showFakeCounts) return null;

    const { hackathonCount: hackathonBase } = settings.fomoConfig;

    // Real Counts
    const hackathonReal = participants.filter(p => p.type === 'Hackathon').length;

    // Calculate Dynamic Left (Base - Real)
    const hackathonLeft = Math.max(5, hackathonBase - hackathonReal);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-brand-secondary/90 backdrop-blur-sm text-brand-dark overflow-hidden relative z-50 border-b border-brand-secondary/50"
            >
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm md:text-base font-bold tracking-wide">
                    <TrendingUp className="w-4 h-4 animate-pulse" />
                    <span className="flex items-center gap-2">
                        <span>🔥 High Demand:</span>
                        <span className="bg-brand-dark/10 px-2 py-0.5 rounded-full">Only {hackathonLeft} Hackathon</span>
                        <span>slots left!</span>
                    </span>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
