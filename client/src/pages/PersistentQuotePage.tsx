import React from 'react';
import { PersistentQuoteBuilder } from '@/components/quotes/PersistentQuoteBuilder';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Link } from 'wouter';

/**
 * PersistentQuotePage - Page that hosts the production-ready quote builder
 * 
 * This implementation uses global state management with Zustand to ensure
 * state persistence across component mounts and page refreshes.
 */
export default function PersistentQuotePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Production Quote Builder</h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Production Quote Builder</h1>
          <p className="text-gray-600">
            This implementation uses global state with localStorage persistence for maximum reliability
          </p>
        </div>
        
        <PersistentQuoteBuilder />
      </div>
    </div>
  );
}