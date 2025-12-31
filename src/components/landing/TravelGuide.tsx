'use client';

import React from 'react';
import { Bus, Train, Plane, MapPin, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const TravelGuide = () => {
    return (
        <section id="travel-guide" className="py-20 bg-brand-dark/50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-primary to-blue-400 mb-4">
                        How to Reach
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Your journey to Vibe Coding 2026 starts here. Follow these directions to reach ANITS College securely.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Bus Info */}
                    <Card className="bg-brand-surface border-white/10 hover:border-brand-primary/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
                                <Bus className="w-6 h-6 text-brand-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">By Bus</h3>
                            <div className="space-y-4 text-sm text-gray-300">
                                <div>
                                    <span className="block text-brand-primary font-medium mb-1">Dwarakanagar</span>
                                    Board <span className="text-white font-mono">222</span> on South Side bus bay.
                                </div>
                                <div>
                                    <span className="block text-brand-primary font-medium mb-1">Gurudwara</span>
                                    Board <span className="text-white font-mono">111</span> on Vizag-Srikakulam Highway.
                                </div>
                                <div>
                                    <span className="block text-brand-primary font-medium mb-1">Maddilapalem</span>
                                    Board <span className="text-white font-mono">111</span>, <span className="text-white font-mono">222</span>, <span className="text-white font-mono">411</span>, or <span className="text-white font-mono">211</span>.
                                </div>
                                <div className="p-3 bg-brand-dark/50 rounded border border-white/5 mt-4">
                                    <p className="text-xs text-gray-400">
                                        <InfoIcon className="w-3 h-3 inline mr-1" />
                                        All buses towards Vizianagaram or Srikakulam go via Tagarapuvalasa.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Train Info */}
                    <Card className="bg-brand-surface border-white/10 hover:border-brand-primary/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
                                <Train className="w-6 h-6 text-brand-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">By Train</h3>
                            <div className="space-y-4 text-sm text-gray-300">
                                <div>
                                    <span className="block text-brand-primary font-medium mb-1">Visakhapatnam Station (Vizag)</span>
                                    <p>Board <span className="text-white font-mono">222</span> or <span className="text-white font-mono">411</span> at the bus stop outside Platform 1.</p>
                                </div>
                                <div>
                                    <span className="block text-brand-primary font-medium mb-1">Vizianagaram Station</span>
                                    <p>Reach the bus stop. Board <span className="text-white font-mono">111</span>, <span className="text-white font-mono">411</span>, <span className="text-white font-mono">211</span>, <span className="text-white font-mono">222V</span>, or any bus towards Visakhapatnam via Tagarapuvalasa.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Flight Info */}
                    <Card className="bg-brand-surface border-white/10 hover:border-brand-primary/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
                                <Plane className="w-6 h-6 text-brand-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">By Flight</h3>
                            <div className="space-y-4 text-sm text-gray-300">
                                <div>
                                    <span className="block text-brand-primary font-medium mb-1">From Airport</span>
                                    <p>Reach the Highway.</p>
                                    <p className="mt-2">Board <span className="text-white font-mono">111</span> on Vizag-Srikakulam Highway.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Last Mile Connectivity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-linear-to-r from-brand-dark to-brand-surface border border-brand-primary/20 rounded-2xl p-6 md:p-8"
                >
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-green-500/10 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <h3 className="text-lg md:text-xl font-semibold text-white">Destination: Tagarapuvalasa [ANITS College Stop]</h3>
                            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
                                <div className="flex gap-3">
                                    <Navigation className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                                    <p>Deboard at <strong>ANITS College Stop</strong>. Look for the "Anil Neerukonda Institute of Technology and Sciences" arch name board on the other side of the Highway.</p>
                                </div>
                                <div className="flex gap-3">
                                    <Navigation className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                                    <p>Safely cross the highway or take the <strong>tunnel way</strong> (just a few steps forward) to reach the college side. Walk 500m or take an auto to reach the campus.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const InfoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </svg>
);

export default TravelGuide;
