import { Wifi, Coffee, Music, Trophy, Gift, Award, Star, Globe } from 'lucide-react';
import { useData } from '@/lib/context/DataContext';

const FeaturesRewards: React.FC = () => {
    const { settings } = useData();
    return (
        <div className="py-24 bg-brand-surface relative overflow-hidden">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* The Vibe Check */}
                <section id="about" className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">The Vibe Check</h2>
                        <p className="text-gray-400">Everything you need to stay focused and energized.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-3xl bg-brand-dark border border-white/5 hover:border-brand-primary/30 transition-colors group">
                            <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-brand-dark transition-all text-brand-primary">
                                <Wifi className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Super Speed Internet</h3>
                            <p className="text-gray-400 leading-relaxed">Dedicated high-speed connectivity ensuring your development flow is never interrupted.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-3xl bg-brand-dark border border-white/5 hover:border-brand-secondary/30 transition-colors group">
                            <div className="w-14 h-14 bg-brand-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-secondary group-hover:text-brand-dark transition-all text-brand-secondary">
                                <Coffee className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Quality Refreshments</h3>
                            <p className="text-gray-400 leading-relaxed">Stay energized with high-quality snacks and beverages served throughout the event.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-3xl bg-brand-dark border border-white/5 hover:border-gray-500/30 transition-colors group">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all text-white">
                                <Music className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Entertainment Zone</h3>
                            <p className="text-gray-400 leading-relaxed">Relax with our Full Bass DJ, Cozy Campfire, and Movie Masti sessions during breaks.</p>
                        </div>
                    </div>
                </section>

                {/* Rewards Section */}
                <section id="rewards" className="relative rounded-[2.5rem] overflow-hidden">
                    {/* Background for rewards */}
                    <div className="absolute inset-0 bg-linear-to-br from-gray-900 to-black border border-white/10 backdrop-blur-sm"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-secondary/10 blur-[120px]"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 md:p-16 gap-12">
                        <div className="lg:w-1/2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-secondary/20 text-brand-secondary text-xs font-bold uppercase tracking-wider mb-6">
                                <Star className="w-3 h-3" />
                                Prizes & Perks
                            </div>
                            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                Win Big. <br />
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">
                                    {settings?.prizePool || '₹40,000'} Prize Pool
                                </span>
                            </h2>
                            <p className="text-lg text-gray-300 mb-10 leading-relaxed">
                                Compete for the <strong>Top 3 Positions</strong>. Winners take home cash prizes, exclusive merchandise, and recognized certifications.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-brand-primary/10 rounded-xl">
                                        <Trophy className="w-6 h-6 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">Cash Rewards</h4>
                                        <p className="text-gray-400 text-sm">Substantial cash prizes for the 1st, 2nd, and 3rd place teams.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-brand-secondary/10 rounded-xl">
                                        <Gift className="w-6 h-6 text-brand-secondary" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">Exclusive Merch</h4>
                                        <p className="text-gray-400 text-sm">Official GeeksforGeeks swag and Vibe Coding tees.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/10 rounded-xl">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">Certifications</h4>
                                        <p className="text-gray-400 text-sm">Verified certificates of merit and participation for all.</p>
                                    </div>
                                </div>
                                {settings?.showInternships && (
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-500/10 rounded-xl">
                                            <Globe className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">Internship Opportunities</h4>
                                            <p className="text-gray-400 text-sm">Exclusive internship offers for top performers at the event.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:w-1/2 flex justify-center items-center">
                            <div className="relative w-72 h-72 md:w-96 md:h-96">
                                {/* Glowing ring effects */}
                                <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full animate-spin-slow"></div>
                                <div className="absolute inset-8 border border-white/5 rounded-full"></div>
                                <div className="absolute inset-0 bg-linear-to-tr from-brand-primary/10 to-brand-secondary/10 rounded-full blur-3xl animate-pulse"></div>

                                {/* Center Content */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="glass-card w-48 h-48 rounded-2xl flex flex-col items-center justify-center text-center transform rotate-6 hover:rotate-0 transition-transform duration-500">
                                        <span className="text-6xl font-bold text-transparent bg-clip-text bg-linear-to-b from-white to-gray-400">#1</span>
                                        <span className="text-gray-400 uppercase tracking-widest text-sm mt-2">Win It All</span>
                                        <div className="mt-2 w-16 h-1 bg-brand-primary rounded-full"></div>
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <div className="absolute top-10 right-10 glass p-3 rounded-lg animate-bounce duration-3000">
                                    <span className="text-2xl">🚀</span>
                                </div>
                                <div className="absolute bottom-20 left-10 glass p-3 rounded-lg animate-bounce duration-4000">
                                    <span className="text-2xl">💻</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default FeaturesRewards;
