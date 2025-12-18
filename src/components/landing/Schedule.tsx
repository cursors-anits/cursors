import React from 'react';
import { Terminal, Cpu, Play, Zap } from 'lucide-react';
import { ScheduleItem } from '@/types';

const scheduleData: ScheduleItem[] = [
    {
        date: 'Jan 2nd',
        title: 'Foundations of Gen AI',
        description: 'Kickstart your journey with Prompt Engineering and AI basics.',
        icon: <Terminal className="w-6 h-6 text-white" />,
    },
    {
        date: 'Jan 3rd',
        title: 'Mastering AI Tools',
        description: 'Unlock creativity & productivity with cutting-edge AI tools.',
        icon: <Cpu className="w-6 h-6 text-white" />,
    },
    {
        date: 'Jan 5th',
        title: 'AI for Development',
        description: 'Deep dive into Innovation and Development using AI.',
        icon: <Play className="w-6 h-6 text-white" />,
    },
    {
        date: 'Jan 5-6',
        title: '24-Hour Hackathon',
        description: 'The ultimate test. Build, Deploy, Win. Includes Campfire & DJ.',
        icon: <Zap className="w-6 h-6 text-white" />,
    },
];

const Schedule: React.FC = () => {
    return (
        <section id="schedule" className="py-32 relative bg-brand-dark">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Event Schedule
                    </h2>
                    <div className="w-24 h-1 bg-linear-to-r from-brand-primary to-brand-secondary mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Four days of intense learning, creation, and celebration. From basics to building, we&apos;ve got you covered.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {scheduleData.map((item, index) => (
                        <div
                            key={index}
                            className="glass-card rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 group border border-white/5 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-20 bg-brand-primary/10 blur-[60px] rounded-full group-hover:bg-brand-primary/20 transition-colors"></div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-primary font-mono text-sm font-semibold">
                                        {item.date}
                                    </span>
                                    <div className={`p-3 rounded-xl bg-linear-to-br ${index % 2 === 0 ? 'from-brand-primary to-blue-600' : 'from-brand-secondary to-cyan-600'
                                        } shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {item.icon}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-brand-primary transition-colors">
                                    {item.title}
                                </h3>

                                <p className="text-gray-400 text-sm leading-relaxed mb-4 grow">
                                    {item.description}
                                </p>

                                <div className="h-1 w-12 bg-gray-700 rounded-full group-hover:w-full group-hover:bg-brand-primary/50 transition-all duration-500"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Schedule;
