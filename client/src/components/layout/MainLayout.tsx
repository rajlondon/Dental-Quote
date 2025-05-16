import React from 'react';
import MainNavigation from './MainNavigation';
import { Toaster } from '@/components/ui/toaster';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNavigation />
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} MyDentalFly. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <a 
              href="#" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact Us
            </a>
          </div>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}