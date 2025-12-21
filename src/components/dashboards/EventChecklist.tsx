'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Laptop, CreditCard, Zap, BookOpen, BedDouble, Wind, Check } from 'lucide-react';
import { toast } from 'sonner';

const CHECKLIST_ITEMS = [
    { id: 'laptop', name: 'Laptop and charger', icon: Laptop, category: 'Mandatory' },
    { id: 'id-card', name: 'College ID Card', icon: CreditCard, category: 'Mandatory' },
    { id: 'extension', name: 'Power extension board', icon: Zap, category: 'Recommended' },
    { id: 'charger', name: 'Mobile charger & headphones', icon: null, category: 'Recommended' },
    { id: 'notebook', name: 'Notebook and pen', icon: BookOpen, category: 'Recommended' },
    { id: 'hygiene', name: 'Personal hygiene items', icon: null, category: 'Overnight' },
    { id: 'bedding', name: 'Bedsheet and blanket', icon: BedDouble, category: 'Overnight' },
    { id: 'jacket', name: 'Jacket or sweater', icon: Wind, category: 'Overnight' }
];

interface EventChecklistProps {
    participantId: string;
    initialCheckedItems?: string[];
}

export default function EventChecklist({ participantId, initialCheckedItems = [] }: EventChecklistProps) {
    const [checkedItems, setCheckedItems] = useState<string[]>(initialCheckedItems);
    const [isSaving, setIsSaving] = useState(false);

    const progress = (checkedItems.length / CHECKLIST_ITEMS.length) * 100;
    const mandatoryItems = CHECKLIST_ITEMS.filter(item => item.category === 'Mandatory');
    const mandatoryChecked = mandatoryItems.filter(item => checkedItems.includes(item.id)).length;

    const handleCheck = async (itemId: string, checked: boolean) => {
        const newCheckedItems = checked
            ? [...checkedItems, itemId]
            : checkedItems.filter(id => id !== itemId);

        setCheckedItems(newCheckedItems);
        setIsSaving(true);

        try {
            const response = await fetch(`/api/participants/${participantId}/checklist`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checklist: newCheckedItems })
            });

            if (!response.ok) throw new Error('Failed to save checklist');

            toast.success(checked ? 'Item checked!' : 'Item unchecked', {
                duration: 1000
            });
        } catch (error) {
            console.error('Error saving checklist:', error);
            setCheckedItems(checkedItems); // Revert on error
            toast.error('Failed to save. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const groupedItems = {
        Mandatory: CHECKLIST_ITEMS.filter(item => item.category === 'Mandatory'),
        Recommended: CHECKLIST_ITEMS.filter(item => item.category === 'Recommended'),
        Overnight: CHECKLIST_ITEMS.filter(item => item.category === 'Overnight')
    };

    return (
        <Card className="bg-brand-surface border-brand-primary/20">
            <CardContent className="p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-white">Event Preparation Checklist</h3>
                            <Badge
                                className={`${progress === 100
                                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                        : 'bg-brand-primary/20 text-brand-primary border-brand-primary/30'
                                    }`}
                            >
                                {checkedItems.length}/{CHECKLIST_ITEMS.length} Complete
                            </Badge>
                        </div>
                        <Progress value={progress} className="h-2" />
                        {mandatoryChecked < mandatoryItems.length && (
                            <p className="text-xs text-orange-400 mt-2">
                                ⚠️ {mandatoryItems.length - mandatoryChecked} mandatory item(s) remaining
                            </p>
                        )}
                    </div>

                    {/* Checklist Items */}
                    <div className="space-y-6">
                        {Object.entries(groupedItems).map(([category, items]) => (
                            <div key={category}>
                                <h4 className={`text-sm font-semibold mb-3 ${category === 'Mandatory' ? 'text-red-400' :
                                        category === 'Recommended' ? 'text-brand-primary' :
                                            'text-blue-400'
                                    }`}>
                                    {category}
                                </h4>
                                <div className="space-y-2">
                                    {items.map(item => {
                                        const isChecked = checkedItems.includes(item.id);
                                        const IconComponent = item.icon;

                                        return (
                                            <div
                                                key={item.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isChecked
                                                        ? 'bg-green-500/10 border-green-500/30'
                                                        : 'bg-white/5 border-white/10'
                                                    }`}
                                            >
                                                <Checkbox
                                                    id={item.id}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => handleCheck(item.id, checked as boolean)}
                                                    disabled={isSaving}
                                                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                                />
                                                {IconComponent && (
                                                    <IconComponent className={`w-4 h-4 ${isChecked ? 'text-green-400' : 'text-gray-400'}`} />
                                                )}
                                                <label
                                                    htmlFor={item.id}
                                                    className={`flex-1 text-sm cursor-pointer ${isChecked ? 'text-gray-300 line-through' : 'text-white'
                                                        }`}
                                                >
                                                    {item.name}
                                                </label>
                                                {isChecked && (
                                                    <Check className="w-4 h-4 text-green-400" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Success Message */}
                    {progress === 100 && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                            <div className="text-green-400 font-semibold mb-1">🎉 All Set!</div>
                            <div className="text-xs text-gray-400">You're fully prepared for the event</div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
