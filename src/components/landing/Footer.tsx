import React from 'react';
import { Phone, MapPin, Mail } from 'lucide-react';
import { siInstagram } from 'simple-icons';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
    return (
        <footer id="contact" className="bg-brand-dark pt-20 pb-10 relative">
            <Separator className="bg-white/5 absolute top-0 left-0 w-full" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 relative rounded-lg overflow-hidden border border-white/10">
                                <Image
                                    src="/sponsors/cursors.png"
                                    alt="Cursors Logo"
                                    fill
                                    sizes='max-width: 768px'
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">VIBE CODING</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Igniting innovation through code. Join the most electrifying tech event of the year at ANITS.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center"
                            >
                                <a
                                    href="https://www.instagram.com/cursors_2026"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                >
                                    <svg
                                        role="img"
                                        viewBox="0 0 24 24"
                                        className="w-5 h-5 fill-current"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d={siInstagram.path} />
                                    </svg>
                                </a>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-accent hover:text-white transition-all flex items-center justify-center"
                            >
                                <a
                                    href="mailto:palikaomkar.22.cse@anits.edu.in"
                                    aria-label="Email"
                                >
                                    <Mail className="w-5 h-5" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg">Event</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link href="#schedule" className="hover:text-brand-primary transition-colors">Schedule</Link></li>
                            <li><Link href="#about" className="hover:text-brand-primary transition-colors">About</Link></li>
                            <li><Link href="#rewards" className="hover:text-brand-primary transition-colors">Prizes</Link></li>
                        </ul>
                    </div>

                    {/* Team */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg">Team</h4>
                        <div className="space-y-6 text-sm text-gray-400">
                            <div>
                                <p className="text-white font-medium mb-2">Student Coordinators</p>
                                <ul className="space-y-1">
                                    <li>Afeefa Shahzadi</li>
                                    <li>Md. Sheihjadi</li>
                                </ul>
                            </div>
                            <div>
                                <p className="text-white font-medium mb-2">Faculty Coordinators</p>
                                <ul className="space-y-1">
                                    <li>Mr. B. Mahesh</li>
                                    <li>Mrs. G. Pranitha</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg">Get in Touch</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                                <span>
                                    ANITS (Anil Neerukonda Institute of Technology & Sciences)<br />
                                    Sangivalasa, Visakhapatnam
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-brand-primary shrink-0" />
                                <Link href="tel:+918897892720" className="hover:text-brand-primary transition-colors">
                                    +91 8897892720 (Omkar)
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 relative">
                    <Separator className="bg-white/5 absolute top-0 left-0 w-full" />
                    <p>&copy; 2026 Cursors, ANITS. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
