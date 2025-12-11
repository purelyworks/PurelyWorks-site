import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { ContactFooter } from './components/ContactFooter';
import { Home } from './pages/Home';
import { PurelyFlex } from './pages/PurelyFlex';
import { FocusedDevelopment } from './pages/FocusedDevelopment';
import { FocusedRecruiting } from './pages/FocusedRecruiting';
import { FocusedProposals } from './pages/FocusedProposals';
import { Blog } from './pages/Blog';
import { AdminLogin } from './pages/AdminLogin';
import { MoleEasterEgg } from './components/MoleEasterEgg';
import { LeadCaptureModal } from './components/LeadCaptureModal';
import { LeadCaptureProvider } from './context/LeadCaptureContext';
import { Page } from './types';
import { trackHubSpotPageView } from './services/hubspotService';

const themeFromPath = (pathname: string): Page => {
  if (pathname.startsWith('/purely-flex')) return 'FLEX';
  if (pathname.startsWith('/focused-development')) return 'DEV';
  if (pathname.startsWith('/focused-recruiting')) return 'RECRUITING';
  if (pathname.startsWith('/focused-proposals')) return 'PROPOSALS';
  return 'HOME';
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = themeFromPath(location.pathname);

  useEffect(() => {
    trackHubSpotPageView(location.pathname);
  }, [location.pathname]);

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
        thumbStyle = 'linear-gradient(to bottom, var(--ocean-blue), var(--bright-lavender), var(--celadon))';
        ffThumbColor = 'var(--ocean-blue)';
        break;
    }

    root.style.setProperty('--custom-scroll-thumb', thumbStyle);
    root.style.setProperty('--custom-scroll-ff-thumb', ffThumbColor);
  }, [currentPage]);

  const handleNavigate = (page: Page) => {
    const routeMap: Record<Page, string> = {
      HOME: '/',
      FLEX: '/purely-flex',
      DEV: '/focused-development',
      RECRUITING: '/focused-recruiting',
      PROPOSALS: '/focused-proposals',
    };

    navigate(routeMap[page]);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      <main>
        <Routes>
          <Route path="/" element={<Home onNavigate={handleNavigate} />} />
          <Route path="/purely-flex" element={<PurelyFlex />} />
          <Route path="/focused-development" element={<FocusedDevelopment />} />
          <Route path="/focused-recruiting" element={<FocusedRecruiting />} />
          <Route path="/focused-proposals" element={<FocusedProposals />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/admin" element={<AdminLogin />} />
        </Routes>
      </main>

      <div id="contact">
        <ContactFooter />
      </div>

      <LeadCaptureModal />
      <MoleEasterEgg />
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <LeadCaptureProvider>
      <AppContent />
    </LeadCaptureProvider>
  </BrowserRouter>
);

export default App;
