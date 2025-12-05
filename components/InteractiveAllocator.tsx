import React, { useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { AllocationState, MonthScenario } from '../types';
import { ScrollReveal } from './ScrollReveal';
import { ArrowRight, Users, FileText, Code2 } from 'lucide-react';

const SCENARIOS: MonthScenario[] = [
  {
    month: 'January',
    title: 'Critical Hiring Need',
    description: 'Focus on finding a project manager to kickstart the year.',
    allocation: { recruiting: 70, proposals: 10, development: 20 },
    imagePrompt: ''
  },
  {
    month: 'March',
    title: 'Major RFP Season',
    description: 'Full attention shifts to a deadline-driven proposal submission.',
    allocation: { recruiting: 10, proposals: 80, development: 10 },
    imagePrompt: ''
  },
  {
    month: 'May',
    title: 'Workflow Automation',
    description: 'Development focus to streamline internal processes.',
    allocation: { recruiting: 10, proposals: 10, development: 80 },
    imagePrompt: ''
  },
  {
    month: 'July',
    title: 'Summer Expansion',
    description: 'Balanced growth across recruiting and systems maintenance.',
    allocation: { recruiting: 50, proposals: 10, development: 40 },
    imagePrompt: ''
  },
  {
    month: 'October',
    title: 'Balanced Maintenance',
    description: 'Keeping all engines running smoothly.',
    allocation: { recruiting: 33, proposals: 33, development: 34 },
    imagePrompt: ''
  }
];

export const InteractiveAllocator: React.FC = () => {
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const currentScenario = SCENARIOS[activeScenarioIndex];

  const chartData = [
    { subject: 'Recruiting', A: currentScenario.allocation.recruiting, fullMark: 100 },
    { subject: 'Proposals', A: currentScenario.allocation.proposals, fullMark: 100 },
    { subject: 'Development', A: currentScenario.allocation.development, fullMark: 100 },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simulate Your Year</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Your priorities drive the allocation. We adjust bandwidth based on what's most urgent. 
                See how the team shape-shifts month-to-month.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50 rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          
          {/* Left Control Panel */}
          <div className="lg:col-span-4 p-8 bg-slate-900 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--bright-lavender)' }}>Select a Scenario</h3>
              <div className="space-y-3">
                {SCENARIOS.map((scenario, idx) => (
                  <button
                    key={scenario.month}
                    onClick={() => setActiveScenarioIndex(idx)}
                    className={`w-full text-left px-4 py-4 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                      activeScenarioIndex === idx 
                        ? 'text-white shadow-lg ring-2 ring-offset-2 ring-offset-slate-900' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    style={activeScenarioIndex === idx ? { backgroundColor: 'var(--ocean-blue)' } : undefined}
                  >
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-1">{scenario.month}</span>
                      <span className="font-medium group-hover:text-white transition-colors">{scenario.title}</span>
                    </div>
                    {activeScenarioIndex === idx && <ArrowRight size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-700">
                <p className="text-slate-400 text-sm italic">
                    "The team adjusts with you. No rigid allocations, no wasted capacity."
                </p>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="lg:col-span-8 p-8 lg:p-12 flex flex-col md:flex-row items-center gap-12">
            
            {/* Chart */}
            <div className="w-full md:w-1/2 aspect-square max-h-[350px] relative">
               <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <div className="w-full h-full rounded-full border border-slate-400 border-dashed animate-spin-slow"></div>
               </div>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--ocean-blue)', fontSize: 12, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Allocation"
                    dataKey="A"
                    stroke={'var(--ocean-blue)'}
                    strokeWidth={3}
                    fill={'var(--bright-lavender)'}
                    fillOpacity={0.35}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'var(--ocean-blue)', fontWeight: 'bold' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Description Panel */}
            <div className="w-full md:w-1/2 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    Active Focus
                </div>
                <h3 className="text-3xl font-bold text-slate-900">{currentScenario.title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                    {currentScenario.description}
                </p>
                
                <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className={`flex items-center justify-between p-3 rounded-lg ${currentScenario.allocation.recruiting > 40 ? 'border' : 'opacity-50 grayscale'}`} style={currentScenario.allocation.recruiting > 40 ? { backgroundColor: 'rgba(27,138,191,0.06)', borderColor: 'rgba(27,138,191,0.12)' } : undefined}>
                      <div className="flex items-center gap-3">
                        <Users size={18} style={{ color: 'var(--ocean-blue)' }} />
                        <span className="font-medium text-slate-700">Recruiting</span>
                      </div>
                      <div className="font-bold text-slate-900">{currentScenario.allocation.recruiting}%</div>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-lg ${currentScenario.allocation.proposals > 40 ? 'border' : 'opacity-50 grayscale'}`} style={currentScenario.allocation.proposals > 40 ? { backgroundColor: 'rgba(186,145,242,0.08)', borderColor: 'rgba(186,145,242,0.14)' } : undefined}>
                      <div className="flex items-center gap-3">
                        <FileText size={18} style={{ color: 'var(--bright-lavender)' }} />
                        <span className="font-medium text-slate-700">Proposals</span>
                      </div>
                      <div className="font-bold text-slate-900">{currentScenario.allocation.proposals}%</div>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-lg ${currentScenario.allocation.development > 40 ? 'border' : 'opacity-50 grayscale'}`} style={currentScenario.allocation.development > 40 ? { backgroundColor: 'rgba(119,217,171,0.06)', borderColor: 'rgba(119,217,171,0.12)' } : undefined}>
                       <div className="flex items-center gap-3">
                        <Code2 size={18} style={{ color: 'var(--celadon)' }} />
                        <span className="font-medium text-slate-700">Development</span>
                      </div>
                      <div className="font-bold text-slate-900">{currentScenario.allocation.development}%</div>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};