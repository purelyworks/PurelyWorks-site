import React from 'react';

const steps = [
  {
    month: 'Month 1',
    title: 'Readiness Assessment',
    desc: 'Understanding where automation can create the biggest wins.',
    dotColorVar: 'var(--celadon)',
    badgeColorVar: 'var(--celadon)'
  },
  {
    month: 'Month 2',
    title: 'Development Focus',
    desc: 'Building workflow automation that saves your team 10 hours per week.',
    dotColorVar: 'var(--ocean-blue)',
    badgeColorVar: 'var(--ocean-blue)'
  },
  {
    month: 'Month 3',
    title: 'Recruiting Priority',
    desc: 'Filling critical position while development continues at lighter intensity.',
    dotColorVar: 'var(--ocean-blue)',
    badgeColorVar: 'var(--ocean-blue)'
  },
  {
    month: 'Month 4',
    title: 'Proposal Crunch',
    desc: 'Major bid season requires full team attention for 3 weeks.',
    dotColorVar: 'var(--bright-lavender)',
    badgeColorVar: 'var(--bright-lavender)'
  },
  {
    month: 'Month 5',
    title: 'Back to Development',
    desc: 'CRM integration project picks up where we left off.',
    dotColorVar: 'var(--celadon)',
    badgeColorVar: 'var(--celadon)'
  }
];

export const ProcessTimeline: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">How the Flexibility Works</h2>
          <p className="text-slate-600 mt-2">No rigid allocations, no wasted capacity.</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 transform md:-translate-x-1/2"></div>

          <div className="space-y-12">
            {steps.map((step, idx) => (
              <div key={idx} className={`relative flex items-center ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                
                {/* Dot */}
                <div
                  className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-4 border-white shadow transform -translate-x-1/2 z-10"
                  style={{ backgroundColor: step.dotColorVar }}
                ></div>

                {/* Content Box */}
                <div className={`ml-20 md:ml-0 md:w-1/2 ${idx % 2 === 0 ? 'md:pr-12 text-left md:text-right' : 'md:pl-12 text-left'}`}>
                  <div className={`p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow`}>
                    <span className="text-xs font-bold uppercase tracking-widest mb-1 block" style={{ color: step.badgeColorVar }}>{step.month}</span>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};