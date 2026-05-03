'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/pulse', label: 'PULSE', description: 'Trending Now' },
    { href: '/roots', label: 'ROOTS', description: 'Culture & Heritage' },
    { href: '/arena', label: 'ARENA', description: 'Sports & Competition' },
    { href: '/waves', label: 'WAVES', description: 'Entertainment' },
    { href: '/watch', label: 'WATCH', description: 'Video Content' },
    { href: '/listen', label: 'LISTEN', description: 'Podcasts' },
    { href: '/shop', label: 'SHOP', description: 'Merch Store' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-mono-black/95 backdrop-blur-md shadow-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/"
              className="font-display text-2xl font-bold tracking-tight group"
            >
              <span className={`${isScrolled ? 'text-mono-white' : 'text-mono-black'} transition-colors`}>
                MONO
              </span>
              <span className="text-mono-amber">KROMATIK</span>
              <span className={`ml-2 text-xs ${isScrolled ? 'text-mono-gray' : 'text-mono-charcoal'} font-body font-normal`}>
                NETWORK
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 font-display text-sm font-medium tracking-wide transition-all duration-200 hover:bg-mono-amber hover:text-mono-white ${
                    isScrolled ? 'text-mono-white' : 'text-mono-black'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Honest "1 human + AI agents" badge + Search */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Honest badge — replaces fake live counter */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-mono-amber/10 rounded-full border border-mono-amber/20">
                <div className="w-2 h-2 bg-mono-amber rounded-full animate-pulse-slow" />
                <span className={`text-xs font-body ${isScrolled ? 'text-mono-white' : 'text-mono-charcoal'}`}>
                  <span className="font-bold">1 human + AI</span>
                </span>
              </div>

              {/* Search */}
              <SearchBar />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-md ${
                isScrolled ? 'text-mono-white' : 'text-mono-black'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-mono-black border-t border-mono-gray/20">
            <div className="px-4 py-6 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 px-4 text-mono-white font-display font-medium text-lg hover:bg-mono-amber transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                  <span className="block text-xs text-mono-gray font-body font-normal mt-1">
                    {link.description}
                  </span>
                </Link>
              ))}

              {/* Mobile honest badge */}
              <div className="pt-4 mt-4 border-t border-mono-gray/20">
                <div className="flex items-center space-x-2 px-4 py-2">
                  <div className="w-2 h-2 bg-mono-amber rounded-full animate-pulse-slow" />
                  <span className="text-sm font-body text-mono-white">
                    Built by <span className="font-bold">1 human + AI agents</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-20" />
    </>
  );
}
