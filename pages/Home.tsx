import React, { useEffect, useState } from 'react';
import { ArrowRight, Code2, Users, FileText, Zap, Layers } from 'lucide-react';
import { Page } from '../types';
import { generateNanoImage } from '../services/geminiService';
import { ScrollReveal } from '../components/ScrollReveal';
import { ScalingPhilosophy } from '../components/ScalingPhilosophy';
import { WhyDifferent } from '../components/WhyDifferent';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [bgImage, setBgImage] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
       const img = await generateNanoImage("Abstract minimalist architectural glass structure, white and indigo lighting, 8k resolution, futuristic agency headquarters");
       if (img) setBgImage(img);
    };
    if (process.env.API_KEY) init();
  }, []);

  return (
    <div className="pt-24 pb-0">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4">
         <div className="absolute inset-0 z-0">
            {bgImage && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-10 animate-fade-in"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/50 to-slate-50" />
         </div>

         <div className="relative z-10 max-w-5xl mx-auto text-center">
            <ScrollReveal>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-bold tracking-widest uppercase mb-8" style={{ backgroundColor: 'var(--sunlit-clay)' }}>
                    <Zap size={12} style={{ color: 'var(--sunlit-clay)' }} />
                    The Future of Work
                </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 tracking-tighter mb-8 leading-tight">
                    Build Faster.<br />
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--ocean-blue), var(--bright-lavender), var(--celadon))' }}>
                        Scale Smarter.
                    </span>
                </h1>
            </ScrollReveal>

            <ScrollReveal delay={200}>
                <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                    Purely Works fuses <strong>Elite Talent</strong> with <strong>AI Workflows</strong>. 
                    We don't just staff; we engineer outcomes across Development, Recruiting, and Proposals.
                </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button 
                        onClick={() => onNavigate('FLEX')}
                        className="w-full sm:w-auto px-8 py-5 text-white rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-2 group"
                        style={{ backgroundColor: 'var(--ocean-blue)', boxShadow: '0 10px 25px -10px rgba(27,138,191,0.25)' }}
                    >
                        Start with Purely Flex <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a href="#models" className="w-full sm:w-auto px-8 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center">
                        View Team Models
                    </a>
                </div>
            </ScrollReveal>
         </div>
      </section>

      {/* The Model Selector */}
      <section id="models" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Choose Your Velocity</h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">We adapt to your stage of growth. Start flexible, or go deep with dedicated pods.</p>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                {/* Purely Flex Card */}
                <ScrollReveal delay={100}>
                    <div 
                        onClick={() => onNavigate('FLEX')}
                        className="group cursor-pointer relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-10 hover:shadow-2xl transition-all duration-500 h-full flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Layers size={140} style={{ color: 'var(--ocean-blue)' }} />
                        </div>
                        <div className="relative z-10 flex-grow">
                            <div className="w-16 h-16 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: 'var(--ocean-blue)' }}>
                                <Layers size={32} />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-4">Purely Flex</h3>
                            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                <strong>The Intelligent Starting Point.</strong> Access to Recruiting, Proposals, and Dev in one flexible subscription. Rotate bandwidth as priorities shift.
                            </p>
                        </div>
                        <div className="flex items-center font-bold gap-2 group-hover:gap-4 transition-all mt-auto pt-6 border-t border-slate-100" style={{ color: 'var(--ocean-blue)' }}>
                            Explore Flex Model <ArrowRight size={20} />
                        </div>
                    </div>
                </ScrollReveal>

                {/* Focused Teams Overview */}
                <ScrollReveal delay={200}>
                    <div className="rounded-3xl bg-slate-900 text-white p-10 relative overflow-hidden h-full border border-slate-800 flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-slate-900"></div>
                        <div className="relative z-10 h-full flex flex-col">
                            <h3 className="text-3xl font-bold mb-2">Focused Teams</h3>
                            <p className="text-slate-400 mb-8">Dedicated capacity for high-volume needs.</p>
                            <div className="space-y-4 flex-grow">
                                <button 
                                    onClick={() => onNavigate('DEV')}
                                    className="w-full p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-emerald-500/50 transition-all flex items-center gap-4 group"
                                >
                                    <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                                        <Code2 size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-lg group-hover:text-emerald-400 transition-colors">Development</h4>
                                        <p className="text-sm text-slate-400">High-velocity engineering pods</p>
                                    </div>
                                    <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                                </button>

                                <button 
                                    onClick={() => onNavigate('RECRUITING')}
                                    className="w-full p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-blue-500/50 transition-all flex items-center gap-4 group"
                                >
                                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                        <Users size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-lg group-hover:text-blue-400 transition-colors">Recruiting</h4>
                                        <p className="text-sm text-slate-400">Pipeline-as-a-Service</p>
                                    </div>
                                    <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                </button>

                                <button 
                                    onClick={() => onNavigate('PROPOSALS')}
                                    className="w-full p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-purple-500/50 transition-all flex items-center gap-4 group"
                                >
                                    <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                                        <FileText size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-lg group-hover:text-purple-400 transition-colors">Proposals</h4>
                                        <p className="text-sm text-slate-400">Winning bid management</p>
                                    </div>
                                    <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
      </section>

      {/* New Sections */}
      <ScalingPhilosophy />
      <WhyDifferent />
      
    </div>
  );
};