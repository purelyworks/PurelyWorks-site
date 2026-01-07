"use client";

import React, { useEffect, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navigation } from './Navigation';
import { ContactFooter } from './ContactFooter';
import { MoleEasterEgg } from './MoleEasterEgg';
import { LeadCaptureModal } from './LeadCaptureModal';
import { LeadCaptureProvider } from '../context/LeadCaptureContext';
import { Page } from '../types';
import { trackHubSpotPageView } from '../services/hubspotService';

const themeFromPath = (pathname: string): Page => {
  if (pathname.startsWith('/purely-flex')) return 'FLEX';
  if (pathname.startsWith('/focused-development')) return 'DEV';
  if (pathname.startsWith('/focused-recruiting')) return 'RECRUITING';
  if (pathname.startsWith('/focused-proposals')) return 'PROPOSALS';
  return 'HOME';
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const currentPage = useMemo(() => themeFromPath(pathname), [pathname]);

  useEffect(() => {
    trackHubSpotPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    let thumbStyle = '';
    let ffThumbColor = '';

    switch (currentPage) {
      case 'PROPOSALS':
        thumbStyle = 'var(--bright-lavender)';
        ffThumbColor = 'var(--bright-lavender)';
        break;
      case 'DEV':
        thumbStyle = 'var(--celadon)';
        ffThumbColor = 'var(--celadon)';
        break;
      case 'RECRUITING':
        thumbStyle = 'var(--ocean-blue)';
        ffThumbColor = 'var(--ocean-blue)';
        break;
      case 'HOME':
      case 'FLEX':
      default:
        thumbStyle =
          'linear-gradient(to bottom, var(--ocean-blue), var(--bright-lavender), var(--celadon))';
        ffThumbColor = 'var(--ocean-blue)';
        break;
    }

    root.style.setProperty('--custom-scroll-thumb', thumbStyle);
    root.style.setProperty('--custom-scroll-ff-thumb', ffThumbColor);
  }, [currentPage]);

  const handleNavigate = useCallback(
    (page: Page) => {
      const routeMap: Record<Page, string> = {
        HOME: '/',
        FLEX: '/purely-flex',
        DEV: '/focused-development',
        RECRUITING: '/focused-recruiting',
        PROPOSALS: '/focused-proposals',
      };

      router.push(routeMap[page]);
      window.scrollTo(0, 0);
    },
    [router]
  );

  return (
    <LeadCaptureProvider>
      <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 font-sans text-slate-900 selection:bg-[color:var(--ocean-blue-100)] selection:text-[color:var(--ocean-blue)]">
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

        <main>{children}</main>

        <div id="contact">
          <ContactFooter />
        </div>

        <LeadCaptureModal />
        <MoleEasterEgg />
      </div>
    </LeadCaptureProvider>
  );
};
