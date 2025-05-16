import React from 'react';
import { Link } from 'wouter';
import { ThemeToggle } from '@/components/ThemeToggle';

const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-2xl text-primary">
              MyDentalFly
              <span className="text-sm font-normal text-muted-foreground">Turkey</span>
            </a>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link href="/">
              <a className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </a>
            </Link>
            <Link href="/dental-implants">
              <a className="text-sm font-medium transition-colors hover:text-primary">
                Implants
              </a>
            </Link>
            <Link href="/veneers">
              <a className="text-sm font-medium transition-colors hover:text-primary">
                Veneers
              </a>
            </Link>
            <Link href="/quote-builder">
              <a className="text-sm font-medium transition-colors hover:text-primary">
                Get Quote
              </a>
            </Link>
            <Link href="/faq">
              <a className="text-sm font-medium transition-colors hover:text-primary">
                FAQ
              </a>
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/quote-builder">
            <a className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Get Your Quote
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;