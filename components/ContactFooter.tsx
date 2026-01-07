"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLeadCapture } from '../context/LeadCaptureContext';

export const ContactFooter: React.FC = () => {
  const { openLeadCapture } = useLeadCapture();

  return (
    <footer className="bg-slate-900 text-white py-24 border-t border-slate-800 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--ocean-blue-12)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'var(--celadon-06)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to experience <br/>
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--ocean-blue), var(--bright-lavender))' }}>true flexibility?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-12 max-w-md leading-relaxed">
              Stop guessing your future needs. Start building with a team that adapts to them.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-900" style={{ backgroundColor: 'var(--ocean-blue)' }} />
                  <div className="w-8 h-8 rounded-full border-2 border-slate-900" style={{ backgroundColor: 'var(--bright-lavender)' }} />
                  <div className="w-8 h-8 rounded-full border-2 border-slate-900" style={{ backgroundColor: 'var(--celadon)' }} />
                </div>
                <span>Trusted by forward-thinking teams</span>
            </div>
          </div>

          {/* Right Column: CTA Card */}
          <div className="bg-slate-800 rounded-3xl p-2 border border-slate-700 shadow-2xl hover:scale-[1.02] transition-transform duration-300">
            <div className="bg-slate-900 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[320px]">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: 'var(--ocean-blue)', boxShadow: '0 10px 30px -10px var(--ocean-blue-30)' }}>
                  <ArrowRight size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Let's Get Started</h3>
                <p className="text-slate-400 mb-8 max-w-sm">
                    Book a discovery call or send us a message to explore how Purely Works fits your roadmap.
                </p>
                <button 
                  onClick={openLeadCapture}
                  className="w-full text-slate-900 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
                  style={{ backgroundColor: 'white' }}
                >
                    Start Project <ArrowRight size={18} />
                </button>
            </div>
          </div>

        </div>
        
        <div className="mt-20 pt-8 border-t border-slate-800 text-center text-slate-600 text-sm">
          © {new Date().getFullYear()} Purely Works. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
