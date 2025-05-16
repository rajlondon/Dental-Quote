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
  { label: 'Dental Services', href: '/services' },
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <nav className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/quote-builder">
              <Button size="sm" className="bg-primary text-primary-foreground">
                Get a Quote
              </Button>
            </Link>
            <div className="flex items-center">
              <Link href="/language" className="flex items-center space-x-1">
                <span className="text-sm">🇬🇧</span>
                <span className="text-sm font-medium">English</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex flex-1 items-center justify-end md:hidden">
          <div className="mr-2">
            <ThemeToggle />
          </div>
          <Link href="/quote-builder" className="mr-2">
            <Button size="sm" className="bg-primary text-primary-foreground">
              Get a Quote
            </Button>
          </Link>
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
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center px-3">
              <Link href="/language" className="flex items-center space-x-1">
                <span className="text-sm">🇬🇧</span>
                <span className="text-sm font-medium">English</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;