import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and site name */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">MyDentalFly</span>
            </a>
          </Link>
          
          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <a className="text-gray-600 hover:text-primary transition-colors">Home</a>
            </Link>
            <Link href="/treatments">
              <a className="text-gray-600 hover:text-primary transition-colors">Treatments</a>
            </Link>
            <Link href="/clinics">
              <a className="text-gray-600 hover:text-primary transition-colors">Clinics</a>
            </Link>
            <Link href="/standalone-quote">
              <a className="text-primary font-medium hover:text-primary/80 transition-colors">Quote Builder</a>
            </Link>
            <Link href="/blog">
              <a className="text-gray-600 hover:text-primary transition-colors">Blog</a>
            </Link>
            <Link href="/contact">
              <a className="text-gray-600 hover:text-primary transition-colors">Contact</a>
            </Link>
          </nav>
          
          {/* Call to action buttons */}
          <div className="flex items-center space-x-2">
            <Link href="/portal/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/auth">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;