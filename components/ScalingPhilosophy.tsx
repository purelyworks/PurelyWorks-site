"use client";

import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import { GitGraph, Rocket, LineChart, Layers } from 'lucide-react';

const stages = [
    {
        id: 1,
        title: "Test & Learn",
        period: "Months 1-3",
        recommendation: "Purely Flex",
        icon: <Layers size={24} />,
        points: [
            "Experience all three services",
            "Discover where AI/Remote creates value",
            "Build trust & rhythms",
            "Keep costs contained"
        ],
        colorVar: "var(--brand-sky)",
        softVar: "var(--brand-sky-10)"
    },
    {
        id: 2,
        title: "Strategic Focus",
        period: "Months 4-9",
        recommendation: "+1 Focused Team",
        icon: <GitGraph size={24} />,
        points: [
            "Add Dedicated Team based on value",
            "Keep Flex for other areas",
            "Example: Focused Recruiting + Flex Dev",
            "Scale where ROI is proven"
        ],
        colorVar: "var(--bright-lavender)",
        softVar: "var(--bright-lavender-10)"
    },
    {
        id: 3,
        title: "Multi-Service Excellence",
        period: "Months 10+",
        recommendation: "2-3 Focused Teams",
        icon: <LineChart size={24} />,
        points: [
            "Continuous Talent Pipeline",
            "Professional Proposal Dept",
            "Custom Tech Advantage",
            "Flex as strategic backup"
        ],
        colorVar: "var(--celadon)",
        softVar: "var(--celadon-10)"
    }
];

export const ScalingPhilosophy: React.FC = () => {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal>
                    <div className="text-center mb-20">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Scaling Philosophy</h2>
                        <p className="text-xl text-slate-600">Start Smart, Grow Strategically.</p>
                    </div>
                </ScrollReveal>

                <div className="relative">
                    {/* Connection Line (Desktop) */}
                    <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-slate-100 -z-10">
                         <div
                           className="absolute top-0 left-0 h-full opacity-20"
                           style={{ backgroundImage: 'linear-gradient(to right, var(--brand-sky), var(--bright-lavender), var(--celadon))' }}
                         ></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">
                        {stages.map((stage, idx) => (
                            <ScrollReveal key={stage.id} delay={idx * 200} className="h-full">
                                <div className="relative group h-full flex flex-col">
                                    {/* Timeline Dot */}
                                    <div
                                      className="hidden lg:flex w-12 h-12 mx-auto mb-8 rounded-full text-white items-center justify-center shadow-lg z-10 relative group-hover:scale-110 transition-transform duration-300"
                                      style={{ backgroundColor: stage.colorVar }}
                                    >
                                        <span className="font-bold">{stage.id}</span>
                                    </div>

                                    {/* Card */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                                        <div className="lg:hidden mb-6 inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-white font-bold">
                                            {stage.id}
                                        </div>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-xl" style={{ backgroundColor: stage.softVar, color: stage.colorVar }}>
                                            {stage.icon}
                                        </div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{stage.period}</span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-slate-900 mb-2 lg:min-h-[4rem]">{stage.title}</h3>
                                        <div className="text-sm font-medium text-slate-500 mb-6 lg:min-h-[1.5rem]">Recommended: <span className="text-slate-900">{stage.recommendation}</span></div>

                                        <ul className="space-y-3 flex-1">
                                            {stage.points.map((p, i) => (
                                                <li key={i} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.colorVar }}></span>
                                                    {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>

                {/* Value Prop */}
                <ScrollReveal delay={600}>
                    <div className="mt-20 bg-slate-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-slate-100">
                        <div className="md:w-2/3">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Never pay for capacity you don't need.</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Most agencies front-load costs. We align costs with value. 
                                Prove ROI in Stage 1 before committing to Stage 2.
                            </p>
                        </div>
                        <div className="md:w-1/3 flex justify-center md:justify-end">
                            <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2">
                                <Rocket size={18} />
                                Start Stage 1
                            </button>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
};
