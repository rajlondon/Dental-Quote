import React, { ReactNode } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};