import React from 'react';
import { Link } from 'wouter';
import { ThemeToggle } from '@/components/ThemeToggle';

const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 text-transparent bg-clip-text">
              MyDentalFly
            </span>
          </Link>
          
          <nav className="hidden gap-6 md:flex">
            <Link href="/" className="flex items-center text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/quote" className="flex items-center text-sm font-medium transition-colors hover:text-primary">
              Get a Quote
            </Link>
            <Link href="/offers" className="flex items-center text-sm font-medium transition-colors hover:text-primary">
              Special Offers
            </Link>
            <Link href="/clinics" className="flex items-center text-sm font-medium transition-colors hover:text-primary">
              Clinics
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/auth" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;