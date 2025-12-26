'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Backpack, Laptop, CreditCard, Zap, BedDouble, Wind, BookOpen } from 'lucide-react';

const CHECKLIST_ITEMS = [
    {
        category: 'Mandatory',
        icon: Laptop,
        items: [
            { name: 'Laptop and charger', icon: Laptop },
            { name: 'College ID Card', icon: CreditCard }
        ]
    },
    {
        category: 'Highly Recommended',
        icon: Zap,
        items: [
            { name: 'Power extension board', icon: Zap },
            { name: 'Mobile charger & headphones', icon: null },
            { name: 'Notebook and pen for brainstorming', icon: BookOpen },
            { name: 'Personal medications (if required)', icon: null }
        ]
    },
    {
        category: 'For Overnight Stay',
        icon: BedDouble,
        items: [
            { name: 'Personal hygiene items', icon: null },
            { name: 'Bedsheet and blanket (if you prefer rest)', icon: BedDouble },
            { name: 'Jacket or sweater (winter)', icon: Wind }
        ]
    }
];

export default function WhatToBring() {
    return (
        <section className="py-20 px-6 bg-linear-to-b from-brand-dark to-brand-surface/30">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">
                        <Backpack className="w-3 h-3 mr-1" />
                        Event Preparation
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        What to <span className="text-brand-primary">Bring</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Make sure you're fully prepared for the event with these essentials
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {CHECKLIST_ITEMS.map((section, idx) => {
                        const IconComponent = section.icon;
                        return (
                            <Card
                                key={idx}
                                className="bg-brand-surface/50 backdrop-blur-xl border-white/10 hover:border-brand-primary/30 transition-all"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.category === 'Mandatory'
                                            ? 'bg-red-500/10 text-red-400'
                                            : section.category === 'Highly Recommended'
                                                ? 'bg-brand-primary/10 text-brand-primary'
                                                : 'bg-blue-500/10 text-blue-400'
                                            }`}>
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-white">{section.category}</h3>
                                    </div>

                                    <ul className="space-y-3">
                                        {section.items.map((item, itemIdx) => (
                                            <li key={itemIdx} className="flex items-start gap-2 text-sm text-gray-300">
                                                <Check className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
                                                <span>{item.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400">
                        <span className="text-xs">💡</span>
                        <span>Pro tip: Pack light but pack smart!</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
