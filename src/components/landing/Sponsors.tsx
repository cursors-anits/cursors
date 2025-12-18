import React from 'react';
import { Building2, Code2, Cpu, Shirt } from 'lucide-react';
import Image from 'next/image';

interface Sponsor {
    name: string;
    role: string;
    icon: React.ReactNode;
    color: string;
    logo?: string;
}

const sponsors: Sponsor[] = [
    {
        name: "ANITS",
        role: "Hosting Partner",
        icon: <Building2 className="w-8 h-8" />,
        color: "text-blue-400",
        logo: "/sponsors/anits.png"
    },
    {
        name: "Cursors",
        role: "As Part of",
        icon: <Code2 className="w-8 h-8" />,
        color: "text-emerald-400",
        logo: "/sponsors/cursors.png"
    },
    {
        name: "Brain o Vision",
        role: "Powered By",
        icon: <Cpu className="w-8 h-8" />,
        color: "text-purple-400",
        logo: "/sponsors/brainovision.png"
    },
    {
        name: "GeeksforGeeks",
        role: "Merchandise Partner",
        icon: <Shirt className="w-8 h-8" />,
        color: "text-green-500",
        logo: "/sponsors/gfg.svg"
    },
];

const Sponsors: React.FC = () => {
    return (
        <section className="py-24 bg-brand-surface border-y border-white/5 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-linear-stops))] from-brand-primary/5 via-brand-dark to-brand-dark"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <p className="text-brand-primary font-mono text-sm uppercase tracking-widest mb-3">Collaborations</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Our Partners</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sponsors.map((sponsor, index) => (
                        <div
                            key={index}
                            className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-primary/30 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-linear-to-br from-brand-primary/0 to-brand-primary/0 group-hover:from-brand-primary/5 group-hover:to-transparent transition-all duration-500"></div>

                            <span className="relative z-10 text-gray-500 text-xs font-mono uppercase tracking-[0.2em] mb-6 group-hover:text-gray-300 transition-colors">
                                {sponsor.role}
                            </span>

                            <div className={`relative z-10 w-20 h-20 flex items-center justify-center p-4 rounded-xl bg-black/20 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${sponsor.color} border border-white/5 overflow-hidden`}>
                                {sponsor.logo ? (
                                    <Image
                                        src={sponsor.logo}
                                        alt={sponsor.name}
                                        width={100}
                                        height={100}
                                        className="w-full h-full object-contain filter brightness-110 contrast-110 group-hover:brightness-125 transition-all"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = ""; // Clear src to show fallback
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                ) : sponsor.icon}
                                {sponsor.logo && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-0 pointer-events-none">
                                        {/* This ensures icon is only visible if image fails or not present */}
                                    </div>
                                )}
                            </div>

                            <h3 className="relative z-10 text-xl font-bold text-white group-hover:text-brand-primary transition-colors">
                                {sponsor.name}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Sponsors;
