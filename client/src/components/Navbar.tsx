import React, { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import Logo from './Logo';

// Navigation items
const navItems = [
  { label: 'Dental Services', href: '/dental-services' },
  { label: 'Patient Portal', href: '/patient-portal' },
  { label: 'Clinic Login', href: '/clinic-login' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' }
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex items-center justify-between h-16">
        <div className="flex items-center">
          <Logo className="h-6 w-auto" onClick={() => window.location.href = '/'} />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium"
            onClick={() => window.location.href = '/'}
          >
            Get a Quote
          </Button>
          
          {navItems.map((item) => (
            <div
              key={item.href}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 cursor-pointer px-3 py-2"
              onClick={() => window.location.href = item.href}
            >
              {item.label}
            </div>
          ))}
          
          <div className="relative group cursor-pointer ml-2">
            <div className="flex items-center space-x-1 px-3 py-2">
              <span className="text-sm">🇬🇧</span>
              <span className="text-sm font-medium text-gray-600">English</span>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </div>
            <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white border border-gray-200 hidden group-hover:block z-50">
              <div className="py-1">
                <div 
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer" 
                  onClick={() => window.location.href = '/language?lang=en'}
                >
                  <span className="text-sm mr-2">🇬🇧</span>
                  <span className="text-sm">English</span>
                </div>
                <div 
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer" 
                  onClick={() => window.location.href = '/language?lang=tr'}
                >
                  <span className="text-sm mr-2">🇹🇷</span>
                  <span className="text-sm">Türkçe</span>
                </div>
                <div 
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer" 
                  onClick={() => window.location.href = '/language?lang=de'}
                >
                  <span className="text-sm mr-2">🇩🇪</span>
                  <span className="text-sm">Deutsch</span>
                </div>
                <div 
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer" 
                  onClick={() => window.location.href = '/language?lang=fr'}
                >
                  <span className="text-sm mr-2">🇫🇷</span>
                  <span className="text-sm">Français</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center md:hidden">
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-2 text-sm font-medium mr-2"
            onClick={() => window.location.href = '/'}
          >
            Get a Quote
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto py-2">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <div
                  key={item.href}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 cursor-pointer"
                  onClick={() => {
                    window.location.href = item.href;
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </div>
              ))}
              <div className="px-3 py-2 border-t border-gray-200 mt-2 pt-2">
                <div className="text-sm font-medium text-gray-600 mb-1">Language</div>
                <div className="space-y-2 mt-2">
                  <div 
                    className="flex items-center space-x-2 px-2 py-1 hover:text-blue-600 cursor-pointer"
                    onClick={() => window.location.href = '/language?lang=en'}
                  >
                    <span className="text-sm">🇬🇧</span>
                    <span className="text-sm">English</span>
                  </div>
                  <div 
                    className="flex items-center space-x-2 px-2 py-1 hover:text-blue-600 cursor-pointer"
                    onClick={() => window.location.href = '/language?lang=tr'}
                  >
                    <span className="text-sm">🇹🇷</span>
                    <span className="text-sm">Türkçe</span>
                  </div>
                  <div 
                    className="flex items-center space-x-2 px-2 py-1 hover:text-blue-600 cursor-pointer"
                    onClick={() => window.location.href = '/language?lang=de'}
                  >
                    <span className="text-sm">🇩🇪</span>
                    <span className="text-sm">Deutsch</span>
                  </div>
                  <div 
                    className="flex items-center space-x-2 px-2 py-1 hover:text-blue-600 cursor-pointer"
                    onClick={() => window.location.href = '/language?lang=fr'}
                  >
                    <span className="text-sm">🇫🇷</span>
                    <span className="text-sm">Français</span>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;