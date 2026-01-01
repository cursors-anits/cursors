'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Terminal, Cpu, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/context/DataContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { useRouter } from 'next/navigation';

interface HeroProps {
    onRegisterClick: () => void;
}

const FAKE_ACTIVITIES = [
    { count: 12, college: 'AITAM' },
    { count: 8, college: 'ANITS' },
    { count: 15, college: 'GITAM' },
    { count: 6, college: 'AU College of Engg' },
    { count: 9, college: 'Gayatri Vidya Parishad' },
    { count: 5, college: 'Raghu Engg College' },
    { count: 7, college: 'Vignan Institute' },
    { count: 4, college: 'Lendi Institute' }
];

const RecentActivityBadge = () => {
    const { participants } = useData();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activities, setActivities] = useState<{ count: number, college: string }[]>([]);

    useEffect(() => {
        // Only use REAL participant data
        const activityMap = new Map<string, { count: number, college: string }>();

        if (participants) {
            // Group real participants by college
            participants.forEach(p => {
                const rawCollege = p.college || 'Unknown College';
                const key = rawCollege.trim().toLowerCase();

                if (!activityMap.has(key)) {
                    activityMap.set(key, { count: 0, college: rawCollege });
                }
                const entry = activityMap.get(key)!;
                entry.count += 1;
            });
        }

        const mixed = Array.from(activityMap.values())
            .sort((a, b) => b.count - a.count);

        setActivities(mixed);
    }, [participants]);

    useEffect(() => {
        if (activities.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % activities.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [activities]);

    if (activities.length === 0) return null;
    const current = activities[currentIndex];

    return (
        <div key={currentIndex} className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-sm font-medium text-blue-300">
                {current.count} members joined from <span className="font-bold text-blue-200">{current.college}</span>
            </span>
        </div>
    );
};

const Hero: React.FC<HeroProps> = ({ onRegisterClick }) => {
    const { settings, participants, isLoading: dataLoading, currentUser } = useData();
    const router = useRouter();

    // CRM / FOMO Logic
    const showFake = settings?.fomoConfig?.showFakeCounts ?? true;

    // Limits (Real Hard Limits)
    const hackathonLimit = settings?.bufferConfig?.hackathonLimit || 500;

    // Fake Bases (The "Starting" count for FOMO)
    const initialFakeBase = settings?.fomoConfig?.hackathonCount || 488;

    // Decay Logic
    const decayRate = settings?.fomoConfig?.fomoDecayRate || 2; // Spots/Hour
    const decayStart = settings?.fomoConfig?.fomoDecayStart ? new Date(settings.fomoConfig.fomoDecayStart).getTime() : Date.now();

    // Calculate effective base with decay
    const now = Date.now();
    let effectiveFakeBase = initialFakeBase;

    if (showFake && settings?.fomoConfig?.fomoDecayStart) {
        const hoursPassed = Math.max(0, (now - decayStart) / (1000 * 60 * 60));
        const totalDecay = Math.floor(hoursPassed * decayRate);
        effectiveFakeBase = Math.max(0, initialFakeBase - totalDecay);
    }

    // Real Counts
    const hackathonReal = participants?.filter(p => p.type === 'Hackathon').length || 0;

    // Displayed "Spots Left" Calculation
    // Ensure we don't show negative or zero if we want to maintain FOMO (unless real buffer hit)
    // If effectiveBase drops below real, we just show real limit logic? 
    // Actually, "Spots Left" = (FakeBase - Real) -> This naturally reduces as Real increases.
    // Decay reduces the FakeBase, so (FakeBase - Real) shrinks FASTER.

    let hackathonLeft = 0;

    if (showFake) {
        // If decay makes base lower than real, clamp it? No, just let it be limited by 5 at absolute minimum visually?
        // Spots Left = EffectiveFakeBase - Real
        hackathonLeft = Math.max(0, effectiveFakeBase - hackathonReal);
    } else {
        hackathonLeft = Math.max(0, hackathonLimit - hackathonReal);
    }

    // The minimum is now just hackathonLeft
    const minLeft = hackathonLeft;

    // Buffer Logic
    const isDeadlinePassed = settings?.registrationDeadline ? new Date() > new Date(settings.registrationDeadline) : false;
    const isRegistrationClosed = (settings?.registrationClosed === true || isDeadlinePassed) && !settings?.onlineRegistrationOpen;

    const isBuffer = !isRegistrationClosed && (hackathonReal >= hackathonLimit);

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        if (!settings?.eventDate) return;

        // Use UTC or specific local date to avoid mismatches
        const targetDate = new Date(settings.eventDate).getTime();

        const calculateTimeLeft = () => {
            const now = Date.now();
            const difference = targetDate - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [settings?.eventDate]);

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
                {!isRegistrationClosed && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
                        <Flame className="w-4 h-4 text-brand-primary" />
                        <span className="flex flex-col text-sm font-medium text-gray-200 tracking-wide">
                            <span className="text-sm font-medium text-gray-200 tracking-wide">
                                Jan 5th - 7th, 2026
                            </span>
                            {/* <div className="w-1 h-1 rounded-full bg-gray-500"></div> */}
                            <span className="text-sm font-medium text-gray-400">Online Event</span>
                        </span>
                    </div>
                )}
                {isRegistrationClosed && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8 backdrop-blur-md">
                        <Flame className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Registration Closed</span>
                    </div>
                )}

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
                                {dataLoading ? (
                                    <Skeleton className="h-8 md:h-10 w-full bg-white/10" />
                                ) : (
                                    String(item.value).padStart(2, '0')
                                )}
                            </div>
                            <span className="text-xs md:text-sm text-gray-400 mt-2 uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Subheadline */}
                <p className="mt-2 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
                    Join the ultimate <span className="text-white font-medium">24-Hour Hackathon</span>. Build, innovate, and vibe with the best minds.
                </p>

                {/* Workshop Cancellation Notice */}
                <div className="mt-6 mx-auto max-w-2xl p-4 rounded-xl bg-yellow-500/10 border-2 border-yellow-500/30 backdrop-blur-md">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">⚠️</span>
                        <div>
                            <h4 className="text-yellow-400 font-bold text-sm mb-1">Important Update</h4>
                            <p className="text-gray-300 text-sm">
                                We have reached <strong className="text-yellow-300">Maximum Capacity</strong> for offline spots.
                                Online participation is now open at <strong className="text-brand-primary">Starts from ₹259</strong>. Join us remotely!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Important Dates Banner */}
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <span className="text-red-400 font-bold">Jan 4th:</span> Reg Closes
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <span className="text-blue-400 font-bold">Jan 6th:</span> Submission
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <span className="text-green-400 font-bold">Jan 7th:</span> Final Eval
                    </div>
                </div>



                {/* Registration Deadline Banner */}
                <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 border-2 border-red-500/30 backdrop-blur-md">
                    <span className="text-lg">⏰</span>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Registration Closes</span>
                        <span className="text-sm font-bold text-white">Jan 4th, 2026</span>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-12 flex flex-col sm:flex-row gap-6 items-center w-full justify-center">
                    <div className="flex flex-col items-center gap-4">
                        {!isRegistrationClosed && (
                            <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${isBuffer ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-green-500/10 border-green-500 text-green-400 animate-pulse'}`}>
                                {isBuffer ? "High Demand • Request Slot" : `🔥 Only ${Math.max(5, Math.min(287, minLeft))} Spots Left`}
                            </div>
                        )}

                        {settings?.onlineRegistrationOpen && !isRegistrationClosed && (
                            <div className="px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <span className="text-lg leading-none">🌐</span> Online Option Available
                            </div>
                        )}


                        {!isRegistrationClosed ? (
                            currentUser ? (
                                <Button
                                    onClick={() => router.push(`/dashboard/${currentUser.role.toLowerCase()}`)}
                                    className="group relative h-14 px-8 rounded-full bg-white text-brand-dark font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(130,212,250,0.3)] border-none"
                                >
                                    <div className="absolute inset-0 bg-linear-to-r from-brand-primary to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="relative flex items-center gap-3">
                                        Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Button>
                            ) : (
                                <Button
                                    onClick={onRegisterClick}
                                    className="group relative h-14 px-8 rounded-full bg-white text-brand-dark font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(130,212,250,0.3)] border-none"
                                >
                                    <div className="absolute inset-0 bg-linear-to-r from-brand-primary to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="relative flex items-center gap-3">
                                        {(settings?.onlineRegistrationOpen === true || (settings?.onlineRegistrationOpen !== false && settings?.registrationClosed))
                                            ? "Register for Online Event"
                                            : "Register Now"
                                        } <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Button>
                            )
                        ) : (
                            <Button
                                disabled
                                className="h-14 px-8 rounded-full bg-white/10 text-gray-500 font-bold text-lg border border-white/5"
                            >
                                Registration Closed
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2 text-sm font-mono text-gray-400 uppercase tracking-widest">
                            Starts From
                        </div>
                        <div className="text-3xl font-bold text-white font-mono">
                            ₹259 <span className="text-lg text-gray-500 font-normal">/ person</span>
                        </div>

                        {!isRegistrationClosed && (
                            <Badge className="bg-brand-primary/20 text-brand-primary border-brand-primary/30 animate-pulse">
                                Group Discounts available!
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Features Grid Mini */}
                <div className={`mt-20 grid ${settings?.showInternships ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'} gap-6 md:gap-10 w-full max-w-5xl pt-10 relative`}>
                    <Separator className="bg-white/10 absolute top-0 left-0 w-full" />
                    <div className="flex flex-col items-center text-center group">
                        <div className="h-10 flex items-center justify-center mb-1">
                            <Cpu className="w-6 h-6 text-brand-secondary group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-sm font-medium text-gray-300">24h Hackathon</span>
                    </div>
                    <div className="flex flex-col items-center text-center group">
                        <div className="h-10 flex items-center justify-center mb-1">
                            <span className="text-2xl font-bold text-white font-mono group-hover:text-brand-primary transition-colors">
                                {(() => {
                                    if (!settings?.prizePool) return '30K+';
                                    const num = parseInt(settings.prizePool.replace(/[^0-9]/g, ''), 10);
                                    return !isNaN(num) && num >= 1000 ? `${Math.floor(num / 1000)}K+` : settings.prizePool;
                                })()}
                            </span>
                        </div>
                        <span className="text-sm font-medium text-gray-300">Prize Pool</span>
                    </div>
                    {settings?.showInternships && (
                        <div className="flex flex-col items-center text-center group">
                            <div className="h-10 flex items-center justify-center mb-1">
                                <span className="text-2xl group-hover:scale-110 transition-transform">🎓</span>
                            </div>
                            <span className="text-sm text-brand-primary font-bold">Internships</span>
                        </div>
                    )}
                    <div className="flex flex-col items-center text-center group">
                        <div className="h-10 flex items-center justify-center mb-1">
                            <span className="text-2xl font-bold text-white font-mono group-hover:text-brand-secondary transition-colors">500+</span>
                        </div>
                        <span className="text-sm font-medium text-gray-300">Participants</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
