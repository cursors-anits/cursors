'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Leaf, Heart, Building2, GraduationCap, Wallet, Shield, Tractor, Factory, Users, Globe, Lightbulb } from 'lucide-react';

const PROBLEM_STATEMENTS = [
    {
        domain: 'Artificial Intelligence & Machine Learning',
        icon: Brain,
        color: 'purple',
        problems: [
            'Build an AI system to detect plagiarism in academic submissions with explainable results',
            'Develop a chatbot for college student support (admissions, exams, placements)',
            'Create a model to predict student dropout risk using historical data',
            'Design an AI agent for resume screening and skill-gap analysis',
            'Build a fake news detection platform for regional languages'
        ]
    },
    {
        domain: 'Sustainability & Green Tech',
        icon: Leaf,
        color: 'green',
        problems: [
            'Smart waste segregation system using IoT + AI',
            'Carbon footprint tracker for individuals and institutions',
            'AI-based crop disease detection using mobile images',
            'Energy optimization system for smart campuses',
            'Water leakage detection and monitoring system'
        ]
    },
    {
        domain: 'Healthcare & BioTech',
        icon: Heart,
        color: 'red',
        problems: [
            'Remote patient monitoring dashboard using wearable data',
            'AI tool for early detection of diabetes/heart disease',
            'Hospital queue & appointment management system',
            'Mental health support chatbot for students',
            'Drug reminder & adherence mobile app'
        ]
    },
    {
        domain: 'Smart Cities & IoT',
        icon: Building2,
        color: 'blue',
        problems: [
            'Smart traffic signal system to reduce congestion',
            'IoT-based streetlight automation for energy saving',
            'Smart parking solution with real-time availability',
            'Flood monitoring and early warning system',
            'Air quality monitoring and alert platform'
        ]
    },
    {
        domain: 'EdTech & Skill Development',
        icon: GraduationCap,
        color: 'indigo',
        problems: [
            'Personalized learning platform using AI recommendations',
            'Virtual lab for engineering experiments',
            'LMS with analytics for faculty performance tracking',
            'Skill assessment & certification platform for colleges',
            'Peer-to-peer doubt solving app for students'
        ]
    },
    {
        domain: 'FinTech & Blockchain',
        icon: Wallet,
        color: 'yellow',
        problems: [
            'Expense tracker with AI-based financial insights',
            'Fraud detection system for online transactions',
            'Blockchain-based certificate verification system',
            'Digital wallet for campus transactions',
            'Credit scoring model for underserved users'
        ]
    },
    {
        domain: 'Cybersecurity',
        icon: Shield,
        color: 'orange',
        problems: [
            'Phishing detection browser plugin',
            'Secure file sharing platform with encryption',
            'Intrusion detection dashboard for networks',
            'Password strength & breach alert system',
            'Cyber awareness training simulator'
        ]
    },
    {
        domain: 'AgriTech',
        icon: Tractor,
        color: 'lime',
        problems: [
            'Smart irrigation system using sensors and weather data',
            'Crop price prediction platform for farmers',
            'Marketplace app connecting farmers directly to buyers',
            'AI chatbot for farming advisory in local languages',
            'Soil health analysis tool'
        ]
    },
    {
        domain: 'Industry 4.0 & Automation',
        icon: Factory,
        color: 'cyan',
        problems: [
            'Predictive maintenance system for machinery',
            'Robotic process automation (RPA) for office workflows',
            'Digital twin for manufacturing units',
            'Supply chain optimization dashboard',
            'Quality inspection using computer vision'
        ]
    },
    {
        domain: 'Social Impact & Governance',
        icon: Users,
        color: 'pink',
        problems: [
            'Grievance redressal platform for citizens',
            'Missing person identification using AI',
            'Donation & NGO transparency platform',
            'Women safety app with real-time alerts',
            'Accessibility tool for visually/hearing impaired users'
        ]
    },
    {
        domain: 'AR/VR & Metaverse',
        icon: Globe,
        color: 'violet',
        problems: [
            'VR-based campus tour for admissions',
            'AR learning app for engineering concepts',
            'Virtual job fair platform',
            'VR safety training for industries',
            'Metaverse collaboration space for teams'
        ]
    },
    {
        domain: 'Open Innovation / Student Choice',
        icon: Lightbulb,
        color: 'amber',
        problems: [
            'Any innovative solution addressing a real-world problem',
            'Tools improving campus life or student productivity',
            'AI agents for daily automation',
            'Apps supporting local community needs'
        ]
    }
];

const COLOR_MAPS: Record<string, { bg: string; text: string; border: string }> = {
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    lime: { bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' }
};

export default function ProblemStatements() {
    return (
        <section className="py-20 px-6 bg-linear-to-b from-brand-surface/30 to-brand-dark" id="problems">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                        <Lightbulb className="w-3 h-3 mr-1" />
                        Hackathon Challenges
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Problem <span className="text-brand-primary">Domains</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-4">
                        12 diverse domains for real-world problem solving
                    </p>

                    {/* Allocation Note */}
                    <div className="max-w-2xl mx-auto mt-6 p-4 bg-brand-primary/10 border border-brand-primary/30 rounded-lg">
                        <p className="text-sm text-brand-primary font-medium">
                            ℹ️ Problem statements will be allocated at the venue. Each participant will receive 3 options to choose from.
                        </p>
                    </div>
                </div>

                {/* Domain Grid - Non-expandable */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PROBLEM_STATEMENTS.map((domain, index) => {
                        const IconComponent = domain.icon;
                        const colors = COLOR_MAPS[domain.color];

                        return (
                            <Card key={index} className="bg-brand-surface/50 backdrop-blur-xl border-white/10 overflow-hidden hover:border-brand-primary/30 transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} shrink-0`}>
                                            <IconComponent className={`w-6 h-6 ${colors.text}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white text-lg flex-1 min-w-0 whitespace-normal overflow-wrap-break-word">{domain.domain}</h3>
                                            <p className="text-xs text-gray-400 mt-1">{domain.problems.length} problem statements</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
