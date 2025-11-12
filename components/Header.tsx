import React, { useState, useEffect } from 'react';
import { MarketingPage } from '../App';

interface HeaderProps {
  onNavigate: (page: MarketingPage) => void;
  onGetStarted: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Features', page: 'features' as MarketingPage },
    { name: 'How It Works', page: 'how-it-works' as MarketingPage },
    { name: 'SAFE AI', page: 'safe-ai' as MarketingPage },
    { name: 'Plans', page: 'plans' as MarketingPage },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, page: MarketingPage) => {
    e.preventDefault();
    onNavigate(page);
    setIsMenuOpen(false);
  };
  
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigate('home');
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? 'bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="#" onClick={handleLogoClick} className="text-2xl font-bold text-white">
              SME<span className="text-cyan-400">Pro</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href="#"
                className="text-slate-300 hover:text-cyan-400 transition-colors text-sm font-medium"
                onClick={(e) => handleNavClick(e, link.page)}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* CTA & Mobile Menu Button */}
          <div className="flex items-center">
            <div className="hidden md:block">
              <button
                onClick={onGetStarted}
                className="bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 text-sm"
              >
                Get Started
              </button>
            </div>
            <div className="md:hidden ml-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href="#"
                className="text-slate-300 hover:text-cyan-400 block px-3 py-2 rounded-md text-base font-medium"
                onClick={(e) => handleNavClick(e, link.page)}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 px-2">
                 <button
                    onClick={() => {
                        setIsMenuOpen(false);
                        onGetStarted();
                    }}
                    className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300"
                >
                    Get Started
                </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;