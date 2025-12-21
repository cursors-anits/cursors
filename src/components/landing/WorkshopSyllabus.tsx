'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Sparkles, Target, Code } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const SYLLABUS = [
    {
        day: 1,
        date: 'Friday, January 2, 2026',
        title: 'Foundations of Gen AI & Prompt Engineering',
        icon: Sparkles,
        color: 'from-blue-500/20 to-purple-500/20',
        topics: [
            'Evolution of AI, ML, DL, LLMs',
            'Vibe Coding Concepts',
            'Prompt Engineering Basics',
            'AI Tools Overview'
        ],
        activities: [
            'AI Introduction Quiz',
            'Tool Demonstrations (ChatGPT, Gemini, Claude)',
            'Group Discussion: "How AI is transforming industries"'
        ],
        assignments: [
            'Create 3 prompts using Zero-Shot, Few-Shot, Role Prompting',
            'Generate an AI-based creative content output'
        ]
    },
    {
        day: 2,
        date: 'Saturday, January 3, 2026',
        title: 'Mastering AI Tools for Creativity & Productivity',
        icon: Target,
        color: 'from-green-500/20 to-cyan-500/20',
        topics: [
            'Advanced Prompt Frameworks',
            'AI Writing & Design Tools',
            'Resume & Portfolio Building'
        ],
        activities: [
            'Live Practice on Canva AI, Tome, Gamma',
            'Resume Creation using ChatGPT & Notion AI',
            'Peer Review Session'
        ],
        assignments: [
            'Design a Resume using AI Tool',
            'Generate a Personal Portfolio Outline'
        ]
    },
    {
        day: 3,
        date: 'Monday, January 5, 2026 (Half-day)',
        title: 'AI for Development & Innovation',
        icon: Code,
        color: 'from-orange-500/20 to-red-500/20',
        topics: [
            'Research & Automation Tools',
            'AI in Web Design & Development',
            'Innovation Mindset'
        ],
        activities: [
            'Hands-on Development Practice',
            'AI-Assisted Coding Sessions',
            'Innovation Case Studies'
        ],
        assignments: [
            'Build a simple AI-powered web feature',
            'Document innovation insights'
        ]
    },
    {
        day: '3-4',
        date: 'Monday-Tuesday, January 5-6, 2026',
        title: 'HACKATHON DAY',
        icon: BookOpen,
        color: 'from-purple-500/20 to-pink-500/20',
        topics: [
            'Real-world Problem Exploration',
            'Ideation & Concept Design',
            'Prototype Frameworks'
        ],
        activities: [
            'Domain Selection (AgriTech, Health, EduTech, etc.)',
            'Team Brainstorming Session',
            'Idea Poster Creation'
        ],
        assignments: [
            '24-hour Hackathon Challenge',
            'Build and present working prototype'
        ]
    }
];

const SyllabusCard = ({ day }: { day: typeof SYLLABUS[0] }) => {
    const IconComponent = day.icon;
    return (
        <Card className="bg-brand-surface/50 backdrop-blur-xl border-white/10 overflow-hidden h-full">
            <div className={`absolute inset-0 opacity-50 bg-linear-to-br ${day.color} pointer-events-none`} />
            <CardContent className="p-6 relative z-10">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                        <div>
                            <div className="text-xs text-gray-400 text-center">DAY</div>
                            <div className="text-2xl font-bold text-brand-primary">{day.day}</div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-1">{day.title}</h3>
                        <p className="text-xs text-gray-400 mb-2">{day.date}</p>
                        {day.day === '3-4' && (
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                24-Hour Challenge
                            </Badge>
                        )}
                    </div>
                    <IconComponent className="w-8 h-8 text-brand-primary" />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Topics */}
                    <div>
                        <h4 className="text-sm font-semibold text-brand-primary mb-3 uppercase tracking-wider">Topics</h4>
                        <ul className="space-y-2">
                            {day.topics.map((topic, idx) => (
                                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-brand-primary mt-1">•</span>
                                    <span>{topic}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Activities */}
                    <div>
                        <h4 className="text-sm font-semibold text-green-400 mb-3 uppercase tracking-wider">Activities</h4>
                        <ul className="space-y-2">
                            {day.activities.map((activity, idx) => (
                                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-green-400 mt-1">•</span>
                                    <span>{activity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Assignments */}
                    <div>
                        <h4 className="text-sm font-semibold text-orange-400 mb-3 uppercase tracking-wider">On-Bench Work</h4>
                        <ul className="space-y-2">
                            {day.assignments.map((assignment, idx) => (
                                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-orange-400 mt-1">•</span>
                                    <span>{assignment}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function WorkshopSyllabus() {
    return (
        <section className="py-20 px-6 bg-brand-dark" id="syllabus">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                        <BookOpen className="w-3 h-3 mr-1" />
                        Workshop Curriculum
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Workshop <span className="text-brand-primary">Syllabus</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        4-day comprehensive Gen AI workshop with hands-on practice and hackathon
                    </p>
                </div>

                {/* Desktop: Vertical stack */}
                <div className="hidden md:grid gap-6">
                    {SYLLABUS.map((day) => (
                        <SyllabusCard key={day.day} day={day} />
                    ))}
                </div>

                {/* Mobile: Carousel */}
                <div className="md:hidden">
                    <Carousel className="w-full">
                        <CarouselContent>
                            {SYLLABUS.map((day) => (
                                <CarouselItem key={day.day}>
                                    <SyllabusCard day={day} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden sm:flex" />
                        <CarouselNext className="hidden sm:flex" />
                    </Carousel>
                    <div className="text-center mt-4 text-xs text-gray-500">
                        Swipe to see Days 2-4 →
                    </div>
                </div>
            </div>
        </section>
    );
}
