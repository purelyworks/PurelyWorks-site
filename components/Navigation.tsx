"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';
import { Page } from '../types';
import { useLeadCapture } from '../context/LeadCaptureContext';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openLeadCapture } = useLeadCapture();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; page: Page }[] = [
    { label: 'Purely Flex', page: 'FLEX' },
    { label: 'Development', page: 'DEV' },
    { label: 'Recruiting', page: 'RECRUITING' },
    { label: 'Proposals', page: 'PROPOSALS' },
  ];

  const handleNav = (page: Page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const getPageTheme = (page: Page) => {
    if (page === 'HOME' || page === 'FLEX') {
      return {
        textStyle: {
          backgroundImage: 'linear-gradient(to right, var(--ocean-blue), var(--bright-lavender), var(--celadon))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
        },
        bgStyle: {
          backgroundImage: 'linear-gradient(to right, var(--ocean-blue), var(--bright-lavender), var(--celadon))',
        },
        solidColor: 'var(--bright-lavender)'
      };
    }

    let color = 'var(--bright-lavender)';
    if (page === 'DEV') color = 'var(--celadon)';
    if (page === 'RECRUITING') color = 'var(--ocean-blue)';
    if (page === 'PROPOSALS') color = 'var(--bright-lavender)';

    return {
      textStyle: { color },
      bgStyle: { backgroundColor: color },
      solidColor: color
    };
  };

  const theme = getPageTheme(currentPage);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md shadow-sm py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        
        {/* Logo (image only) */}
        <button onClick={() => handleNav('HOME')} aria-label="Go to homepage" className="group">
          <div className="group-hover:opacity-80 transition-opacity">
            <Logo className="h-10 w-auto" />
          </div>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={`text-sm font-medium transition-all flex items-center gap-1 ${
                  isActive 
                    ? 'font-bold' 
                    : 'text-slate-600 hover:text-[color:var(--ocean-blue)]'
                }`}
              >
                <span style={isActive ? theme.textStyle : {}}>{item.label}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={theme.bgStyle} />}
              </button>
            );
          })}

          <div className="pl-4 border-l border-slate-200">
            <button
              onClick={openLeadCapture}
              className="text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group"
              style={{ backgroundColor: 'var(--ocean-blue)' }}
            >
              Let's Talk <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-slate-600 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 right-0 shadow-lg border-t border-gray-100 p-4 flex flex-col space-y-2 h-screen">
          <button 
            onClick={() => handleNav('HOME')}
            className="text-left px-4 py-3 text-lg font-bold text-slate-900 border-b border-slate-100 mb-2"
          >
            Home
          </button>
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={`text-left px-4 py-3 rounded-lg font-medium flex justify-between items-center ${
                  isActive ? 'bg-slate-50' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span style={isActive ? theme.textStyle : {}}>{item.label}</span>
                {isActive && <ChevronRight size={16} style={{ color: theme.solidColor }} />}
              </button>
            );
          })}
          <div className="pt-8 px-4">
            <button
              onClick={() => {
                openLeadCapture();
                setIsMobileMenuOpen(false);
              }}
              className="text-white text-center py-4 rounded-xl font-bold block w-full shadow-lg"
              style={theme.bgStyle}
            >
              Start a Project
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
