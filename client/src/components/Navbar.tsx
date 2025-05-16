import React, { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';

// Navigation items
const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Dental Services', href: '/dental-services' },
  { label: 'Patient Portal', href: '/patient-portal' },
  { label: 'Clinic Login', href: '/clinic-login' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact-us' }
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <div className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-auto" onClick={() => window.location.href = '/'} />
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <nav className="flex items-center space-x-6">
            {navItems.map((item) => (
              <div
                key={item.href}
                className="text-sm font-medium transition-colors hover:text-primary cursor-pointer"
                onClick={() => window.location.href = item.href}
              >
                {item.label}
              </div>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <Button 
              size="sm" 
              className="bg-primary text-primary-foreground"
              onClick={() => window.location.href = '/quote-builder'}
            >
              Get a Quote
            </Button>
            <div className="flex items-center">
              <div className="relative group cursor-pointer">
                <div className="flex items-center space-x-1">
                  <span className="text-sm">🇬🇧</span>
                  <span className="text-sm font-medium">English</span>
                </div>
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-background border border-border hidden group-hover:block z-50">
                  <div className="py-1">
                    <div 
                      className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer" 
                      onClick={() => window.location.href = '/language?lang=en'}
                    >
                      <span className="text-sm mr-2">🇬🇧</span>
                      <span className="text-sm">English</span>
                    </div>
                    <div 
                      className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer" 
                      onClick={() => window.location.href = '/language?lang=tr'}
                    >
                      <span className="text-sm mr-2">🇹🇷</span>
                      <span className="text-sm">Türkçe</span>
                    </div>
                    <div 
                      className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer" 
                      onClick={() => window.location.href = '/language?lang=de'}
                    >
                      <span className="text-sm mr-2">🇩🇪</span>
                      <span className="text-sm">Deutsch</span>
                    </div>
                    <div 
                      className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer" 
                      onClick={() => window.location.href = '/language?lang=fr'}
                    >
                      <span className="text-sm mr-2">🇫🇷</span>
                      <span className="text-sm">Français</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex flex-1 items-center justify-end md:hidden">
          <Button 
            size="sm" 
            className="bg-primary text-primary-foreground mr-2"
            onClick={() => window.location.href = '/quote-builder'}
          >
            Get a Quote
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="-mr-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="container md:hidden">
          <nav className="mt-2 flex flex-col space-y-3 pb-4">
            {navItems.map((item) => (
              <div
                key={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent cursor-pointer"
                onClick={() => {
                  window.location.href = item.href;
                  setMobileMenuOpen(false);
                }}
              >
                {item.label}
              </div>
            ))}
            <div className="mt-4 px-3">
              <div className="text-sm font-medium mb-2">Language</div>
              <div className="space-y-2">
                <div 
                  className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-accent cursor-pointer"
                  onClick={() => window.location.href = '/language?lang=en'}
                >
                  <span className="text-sm">🇬🇧</span>
                  <span className="text-sm">English</span>
                </div>
                <div 
                  className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-accent cursor-pointer"
                  onClick={() => window.location.href = '/language?lang=tr'}
                >
                  <span className="text-sm">🇹🇷</span>
                  <span className="text-sm">Türkçe</span>
                </div>
                <div 
                  className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-accent cursor-pointer"
                  onClick={() => window.location.href = '/language?lang=de'}
                >
                  <span className="text-sm">🇩🇪</span>
                  <span className="text-sm">Deutsch</span>
                </div>
                <div 
                  className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-accent cursor-pointer"
                  onClick={() => window.location.href = '/language?lang=fr'}
                >
                  <span className="text-sm">🇫🇷</span>
                  <span className="text-sm">Français</span>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;