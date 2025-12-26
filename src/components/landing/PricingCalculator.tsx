'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';

const PRICES = {
    hackathon: 349
};

type TicketType = 'hackathon';

export default function PricingCalculator() {
    const [teamSize, setTeamSize] = useState(1);
    const [ticketType, setTicketType] = useState<TicketType>('hackathon');

    const calculatePricing = () => {
        const basePrice = PRICES[ticketType];
        const discountPerPerson = (teamSize - 1) * 10;
        const pricePerPerson = basePrice - discountPerPerson;
        const total = pricePerPerson * teamSize;
        return {
            total,
            basePrice,
            discountPerPerson,
            perPerson: pricePerPerson
        };
    };

    const pricing = calculatePricing();

    return (
        <section id="pricing" className="py-20 px-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-linear-to-b from-brand-dark via-brand-surface/20 to-brand-dark" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px]" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                        Pricing
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Calculate Your <span className="text-brand-primary">Pass Price</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Select your ticket type and team size to see live pricing with group discounts
                    </p>
                </div>

                <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
                    <CardContent className="p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left: Selections */}
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-400 mb-3 block">Select Ticket Type</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { type: 'hackathon' as TicketType, name: 'Hackathon Pass', price: 349, desc: '24H Hackathon Only' }
                                        ].map(ticket => (
                                            <button
                                                key={ticket.type}
                                                className={`p-4 rounded-xl border-2 transition-all text-left border-brand-primary bg-brand-primary/10 cursor-default`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-white">{ticket.name}</div>
                                                        <div className="text-xs text-gray-400 mt-1">{ticket.desc}</div>
                                                    </div>
                                                    <div className="text-brand-primary font-bold">₹{ticket.price}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-400 mb-3 block">Team Size</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(size => (
                                            <Button
                                                key={size}
                                                onClick={() => setTeamSize(size)}
                                                variant={teamSize === size ? 'default' : 'outline'}
                                                className={teamSize === size ? 'bg-brand-primary text-brand-dark' : 'border-white/10'}
                                            >
                                                {size}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Price Breakdown */}
                            <div className="bg-black/40 rounded-2xl p-6 border border-brand-primary/20">
                                <div className="flex items-start gap-2 mb-4">
                                    <Info className="w-5 h-5 text-brand-primary mt-0.5" />
                                    <div>
                                        <h3 className="font-bold text-white mb-1">Price Breakdown</h3>
                                        <p className="text-xs text-gray-400">Live calculation with group discount</p>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Base Price (per person)</span>
                                        <span className="text-white font-mono">₹{pricing.basePrice}</span>
                                    </div>

                                    {teamSize > 1 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Group Discount (₹10 × {teamSize - 1})</span>
                                            <span className="font-mono">-₹{pricing.discountPerPerson} each</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Price per Person</span>
                                        <span className="text-white font-mono font-semibold">₹{pricing.perPerson}</span>
                                    </div>

                                    <Separator className="bg-brand-primary/20" />

                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold text-white">Total Amount</span>
                                        <span className="font-bold text-brand-primary font-mono">₹{pricing.total}</span>
                                    </div>

                                    <div className="text-xs text-gray-500 pt-2">
                                        {teamSize} × ₹{pricing.perPerson} = ₹{pricing.total}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
