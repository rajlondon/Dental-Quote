import React from 'react';
import { Link } from 'wouter';
import { ThemeToggle } from '@/components/ThemeToggle';

const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary">
            MyDentalFly
            <span className="text-sm font-normal text-muted-foreground">Turkey</span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/dental-implants" className="text-sm font-medium transition-colors hover:text-primary">
              Implants
            </Link>
            <Link href="/veneers" className="text-sm font-medium transition-colors hover:text-primary">
              Veneers
            </Link>
            <Link href="/quote-builder" className="text-sm font-medium transition-colors hover:text-primary">
              Get Quote
            </Link>
            <Link href="/faq" className="text-sm font-medium transition-colors hover:text-primary">
              FAQ
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/quote-builder" className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            Get Your Quote
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;