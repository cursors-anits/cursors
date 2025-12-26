'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const SCHEDULE = {
    day1: [
        { time: '12:30 PM', activity: '🔥 REPORTING TIME', highlight: true },
        { time: '02:00 PM - 03:00 PM', activity: 'Inauguration' },
        { time: '03:00 PM - 03:30 PM', activity: 'Hackathon Instructions & Networking with Team' },
        { time: '03:30 PM - 04:30 PM', activity: 'Ideation & Break' },
        { time: '05:00 PM - 07:30 PM', activity: 'Level 1 – Creating the Problem Statement of the Project' },
        { time: '07:30 PM - 08:30 PM', activity: 'Dinner Break' },
        { time: '08:30 PM - 11:30 PM', activity: 'Level 2 – Project Building' },
        { time: '11:30 PM - 01:30 AM', activity: 'Campfire, Dances, Fun, Water Games etc.' }
    ],
    day2: [
        { time: '01:30 AM - 04:00 AM', activity: 'Level 3 – Database & EFS Connectivity' },
        { time: '04:00 AM - 06:00 AM', activity: 'Level 4 – Integrating Infrastructure' },
        { time: '06:00 AM - 08:30 AM', activity: 'Fresh Up & Breakfast' },
        { time: '08:30 AM - 11:00 AM', activity: 'Document Preparation' },
        { time: '11:00 AM - 01:00 PM', activity: 'Evaluation & Lunch Break' },
        { time: '02:00 PM - 03:00 PM', activity: 'Valedictory' }
    ]
};

const ScheduleCard = ({ day, dayNumber, date, color }: { day: typeof SCHEDULE.day1; dayNumber: number; date: string; color: string }) => (
    <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                    <span className={`text-2xl font-bold ${dayNumber === 1 ? 'text-brand-primary' : 'text-blue-400'}`}>{dayNumber}</span>
                </div>
                <div>
                    <h3 className="font-bold text-white text-xl">Day {dayNumber} of Hackathon</h3>
                    <p className="text-xs text-gray-400">{date}</p>
                </div>
            </div>

            <div className="space-y-3">
                {day.map((item, idx) => (
                    <div
                        key={idx}
                        className={`p-3 rounded-lg border ${item.highlight
                            ? 'bg-orange-500/10 border-orange-500/30'
                            : 'bg-white/5 border-white/10'
                            }`}
                    >
                        <div className={`font-mono text-xs mb-1 ${dayNumber === 1 ? 'text-brand-primary' : 'text-blue-400'}`}>{item.time}</div>
                        <div className={`text-sm ${item.highlight ? 'font-bold text-orange-300' : 'text-gray-300'}`}>
                            {item.activity}
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

export default function HackathonSchedule() {
    return (
        <section className="py-20 px-6 bg-brand-dark relative overflow-hidden" id="schedule">
            {/* Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px]" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/20">
                        <Clock className="w-3 h-3 mr-1" />
                        24-Hour Timeline
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Hackathon <span className="text-brand-primary">Schedule</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        A complete timeline of the 24-hour hackathon journey
                    </p>
                </div>

                {/* Reporting Time Alert */}
                <Card className="bg-linear-to-r from-red-500/10 to-orange-500/10 border-orange-500/30 mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-orange-500 rounded-full p-2">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl mb-1">Important: Reporting Time</h3>
                                <p className="text-orange-300 text-sm">
                                    <span className="font-bold text-orange-400">All participants:</span> 12:30 PM on Monday, January 5, 2026
                                </p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>January 5-6, 2026</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>ANITS Campus</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Desktop: Grid layout */}
                <div className="hidden md:grid md:grid-cols-2 gap-6">
                    <ScheduleCard day={SCHEDULE.day1} dayNumber={1} date="Sunday, January 5, 2026" color="bg-brand-primary/10" />
                    <ScheduleCard day={SCHEDULE.day2} dayNumber={2} date="Monday, January 6, 2026" color="bg-blue-500/10" />
                </div>

                {/* Mobile: Carousel */}
                <div className="md:hidden">
                    <Carousel className="w-full">
                        <CarouselContent>
                            <CarouselItem>
                                <ScheduleCard day={SCHEDULE.day1} dayNumber={1} date="Monday, January 5, 2026" color="bg-brand-primary/10" />
                            </CarouselItem>
                            <CarouselItem>
                                <ScheduleCard day={SCHEDULE.day2} dayNumber={2} date="Tuesday, January 6, 2026" color="bg-blue-500/10" />
                            </CarouselItem>
                        </CarouselContent>
                        <CarouselPrevious className="hidden sm:flex" />
                        <CarouselNext className="hidden sm:flex" />
                    </Carousel>
                    <div className="text-center mt-4 text-xs text-gray-500">
                        Swipe to see Day 2 schedule →
                    </div>
                </div>
            </div>
        </section>
    );
}
