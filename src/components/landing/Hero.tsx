'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Terminal, Cpu, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
    onRegisterClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onRegisterClick }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const targetDate = new Date('2025-01-02T09:00:00').getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-10">

            {/* Dynamic Background */}
            <div className="absolute inset-0 w-full h-full bg-brand-dark">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-brand-secondary/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
                    <Flame className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm font-medium text-gray-200 tracking-wide">Jan 2nd - 6th, 2025</span>
                    <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                    <span className="text-sm font-medium text-gray-400">ANITS</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
                    <span className="block text-transparent bg-clip-text bg-linear-to-b from-white to-gray-400">
                        Ignite Your
                    </span>
                    <span className="block text-transparent bg-clip-text bg-linear-to-r from-brand-primary via-blue-400 to-brand-secondary pb-4">
                        Creative Code.
                    </span>
                </h1>

                {/* Countdown */}
                <div className="grid grid-cols-4 gap-4 md:gap-8 mb-10">
                    {[
                        { label: 'Days', value: timeLeft.days },
                        { label: 'Hours', value: timeLeft.hours },
                        { label: 'Mins', value: timeLeft.minutes },
                        { label: 'Secs', value: timeLeft.seconds }
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <div className="text-2xl md:text-4xl font-bold font-mono text-white bg-white/5 border border-white/10 rounded-lg p-3 md:p-4 min-w-[70px] md:min-w-[100px] backdrop-blur-sm">
                                {String(item.value).padStart(2, '0')}
                            </div>
                            <span className="text-xs md:text-sm text-gray-400 mt-2 uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Subheadline */}
                <p className="mt-2 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
                    Join the ultimate fusion of <span className="text-white font-medium">Gen AI Workshop</span> and a <span className="text-white font-medium">24-Hour Hackathon</span>. Build, innovate, and vibe with the best minds.
                </p>

                {/* CTA Section */}
                <div className="mt-12 flex flex-col sm:flex-row gap-6 items-center w-full justify-center">
                    <Button
                        onClick={onRegisterClick}
                        className="group relative h-14 px-8 rounded-full bg-white text-brand-dark font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(130,212,250,0.3)] border-none"
                    >
                        <div className="absolute inset-0 bg-linear-to-r from-brand-primary to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative flex items-center gap-3">
                            Register Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Button>

                    <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2 text-sm font-mono text-gray-400 uppercase tracking-widest">
                            Starts From
                        </div>
                        <div className="text-3xl font-bold text-white font-mono">
                            ₹199 <span className="text-lg text-gray-500 font-normal">/ person</span>
                        </div>
                    </div>
                </div>

                {/* Features Grid Mini */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-4xl border-t border-white/10 pt-10">
                    <div className="flex flex-col items-center gap-2">
                        <Terminal className="w-6 h-6 text-brand-primary" />
                        <span className="text-sm font-medium text-gray-300">Gen AI Workshop</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Cpu className="w-6 h-6 text-brand-secondary" />
                        <span className="text-sm font-medium text-gray-300">24h Hackathon</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xl font-bold text-white font-mono">40K+</span>
                        <span className="text-sm font-medium text-gray-300">Prize Pool</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xl font-bold text-white font-mono">500+</span>
                        <span className="text-sm font-medium text-gray-300">Participants</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
