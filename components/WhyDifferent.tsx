import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import { ShieldCheck, Database, Zap, Cpu, RefreshCw, Globe } from 'lucide-react';

const features = [
    {
        icon: <ShieldCheck />,
        title: "True Ownership",
        desc: "All code, systems, and deliverables are 100% yours from creation. No licensing fees, no IP holding."
    },
    {
        icon: <Database />,
        title: "Your Infrastructure",
        desc: "Dev happens in your repos and cloud accounts. We are an extension, not a vendor with a black box."
    },
    {
        icon: <Zap />,
        title: "Fractional Flexibility",
        desc: "Scale up for busy seasons, scale down when lighter. Stop paying for idle capacity."
    },
    {
        icon: <Cpu />,
        title: "AI-Augmented",
        desc: "We build AI into the workflow. Custom scoring models, automated content gen, and intelligent tools."
    },
    {
        icon: <RefreshCw />,
        title: "Hybrid Philosophy",
        desc: "Humans amplified by AI. Judgment + Speed. Creativity + Scale."
    }
];

export const WhyDifferent: React.FC = () => {
    return (
        <section className="py-24 bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">What Makes Purely Works Different</h2>
                        <div className="w-20 h-1 bg-indigo-500 mx-auto rounded-full"></div>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {features.map((f, i) => (
                        <ScrollReveal key={i} delay={i * 100} className="h-full">
                            <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800 transition-all hover:-translate-y-1 group h-full flex flex-col">
                                <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-indigo-400 mb-6 shrink-0 group-hover:scale-110 transition-transform group-hover:bg-indigo-500/20 group-hover:text-indigo-300">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-0 min-h-[3.5rem]">{f.title}</h3>
                                <p className="text-slate-400 leading-relaxed flex-1">
                                    {f.desc}
                                </p>
                            </div>
                        </ScrollReveal>
                    ))}
                    
                    {/* Highlight Card */}
                    <ScrollReveal delay={500} className="h-full">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-2xl h-full flex flex-col">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white/90 mb-6 shrink-0">
                                <Globe />
                            </div>
                            <h3 className="text-xl font-bold mb-0 min-h-[3.5rem]">Remote-First.</h3>
                            <p className="text-indigo-100 leading-relaxed flex-1">
                                Asynchronous documentation, time zone advantages, and distributed talent access are features, not bugs.
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
};
