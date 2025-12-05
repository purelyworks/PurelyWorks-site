import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { generateNanoImage } from '../services/geminiService';

export const Hero: React.FC = () => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateHeroImage = async () => {
    setIsLoading(true);
    // Prompt designed for Nano Banana (Gemini Flash Image)
    const prompt = "A highly artistic, photorealistic corporate abstract representation of fluid team dynamics. Glass geometric shapes morphing, connected by glowing data lines, warm professional lighting, depth of field, corporate blue and violet color palette, minimal, clean, 8k resolution.";
    
    const image = await generateNanoImage(prompt);
    if (image) {
      setBgImage(image);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Try to generate an initial image on mount if API key exists
    if (process.env.API_KEY) {
        generateHeroImage();
    }
  }, []);

  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
            {bgImage ? (
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-20"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-slate-100 opacity-50" />
            )}
             <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/60 to-slate-50" />
        </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-8 animate-fade-in-up" style={{ backgroundColor: 'rgba(186,145,242,0.12)', color: 'var(--bright-lavender)' }}>
          <Sparkles size={16} />
          <span>Bandwidth that shifts with your priorities</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
          Flexible access to <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--ocean-blue), var(--bright-lavender))' }}>
            Recruiting, Proposals, & Development
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Not every company needs full dedicated teams from day one. 
          Stop choosing between expensive commitments and missed opportunities.
          One team, three capabilities, infinite flexibility.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 text-white rounded-xl font-semibold text-lg transition-all shadow-lg flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--ocean-blue)' }}>
            See How It Works <ArrowRight size={20} />
          </a>
          <a href="#comparison" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all flex items-center justify-center">
            Compare Models
          </a>
        </div>

        {/* Interactive Generation Trigger (Subtle) */}
        <div className="mt-12 flex justify-center">
            <button 
                onClick={generateHeroImage}
                disabled={isLoading}
                className="text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1 transition-colors"
            >
                <Sparkles size={12} />
                {isLoading ? "Dreaming up a new background..." : "Refresh Visuals with AI"}
            </button>
        </div>
      </div>
    </div>
  );
};