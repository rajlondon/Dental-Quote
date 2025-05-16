import React from 'react';
import { MainNavigation } from './MainNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNavigation />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} MyDentalFly - Dental Tourism Platform
          </div>
        </div>
      </footer>
    </div>
  );
}