"use client";

import React from 'react';
import { XCircle, CheckCircle } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">What Makes This Different</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Stop paying for idle resources. Start paying for active capacity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Traditional */}
             <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <XCircle size={120} style={{ color: 'var(--salmon-20)' }} />
             </div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="bg-red-500/20 text-red-400 p-2 rounded-lg"><XCircle size={24} /></span>
              Traditional Approach
            </h3>
            
            <div className="space-y-6 text-slate-300">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-400">Recruiter</span>
                    <span className="text-white font-mono">$70k</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="h-full w-[60%]" style={{ backgroundColor: 'var(--ocean-blue)' }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Idle 40% of the year</p>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-400">Proposal Writer</span>
                    <span className="text-white font-mono">$85k</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="h-full w-[30%]" style={{ backgroundColor: 'var(--bright-lavender)' }}></div>
                </div>
                 <p className="text-xs text-slate-500 mt-2">Idle 70% of the year</p>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-400">Developer</span>
                    <span className="text-white font-mono">$95k</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="h-full w-[50%]" style={{ backgroundColor: 'var(--celadon)' }}></div>
                </div>
                 <p className="text-xs text-slate-500 mt-2">Idle 50% of the year</p>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-xl font-bold text-white">Total: $250k+ annually</p>
                <p className="text-sm text-red-400">High overhead, high waste.</p>
              </div>
            </div>
          </div>

          {/* Purely Flex */}
          <div className="rounded-3xl p-8 border relative overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(135deg, var(--ocean-blue-95), rgba(17,24,39,0.95))', borderColor: 'var(--ocean-blue-15)', boxShadow: '0 20px 60px var(--ocean-blue-100)' }}>
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <CheckCircle size={120} />
             </div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bright-lavender-100)', color: 'var(--bright-lavender)' }}><CheckCircle size={24} /></span>
              Purely Flex
            </h3>

            <div className="space-y-6 text-slate-300">
               <p className="text-lg font-light leading-relaxed">
                Access to specialized teams across all three domains, with bandwidth that flexes to match your actual needs.
               </p>

               <div className="p-6 rounded-xl border" style={{ backgroundColor: 'rgba(17,24,39,0.6)', borderColor: 'var(--ocean-blue-12)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm uppercase font-bold tracking-wider" style={{ color: 'var(--bright-lavender)' }}>Active Capacity</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--celadon-12)', color: 'var(--celadon)' }}>100% UTILIZATION</span>
                  </div>
                  {/* Visualization of fluid capacity */}
                  <div className="flex h-12 gap-1">
                      <div className="flex-1 rounded-l-md opacity-80 flex items-center justify-center text-xs text-white font-bold" style={{ backgroundColor: 'var(--ocean-blue)' }}>Recruit</div>
                      <div className="flex-1 opacity-80 flex items-center justify-center text-xs text-white font-bold" style={{ backgroundColor: 'var(--bright-lavender)' }}>Proposal</div>
                      <div className="flex-1 rounded-r-md opacity-80 flex items-center justify-center text-xs text-white font-bold" style={{ backgroundColor: 'var(--celadon)' }}>Dev</div>
                  </div>
                  <p className="text-xs mt-3 text-center" style={{ color: 'var(--bright-lavender)' }}>Scale up instantly. Scale down when demand is lighter.</p>
               </div>

               <div className="pt-4 border-t border-slate-700/50">
                <p className="text-xl font-bold text-white">Pay only for active capacity</p>
                <p className="text-sm text-[color:var(--celadon)]">No hiring. No training. No idle resources.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
