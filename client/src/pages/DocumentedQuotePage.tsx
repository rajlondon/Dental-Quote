import React from 'react';
import { DocumentedQuoteBuilder } from '@/components/quotes/DocumentedQuoteBuilder';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Link } from 'wouter';

/**
 * DocumentedQuotePage - Page that hosts the documented quote builder implementation
 * 
 * This implementation uses:
 * - Zustand for global state management with localStorage persistence
 * - Inline status messages instead of toast notifications
 * - Explicit event handling for all interactive elements
 * - Comprehensive console logging for debugging
 */
export default function DocumentedQuotePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Documented Quote Builder</h1>
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
          <h1 className="text-3xl font-bold mb-2">Documented Quote Builder</h1>
          <p className="text-gray-600">
            An implementation using Zustand for state management with
            comprehensive features and inline status messages.
          </p>
        </div>
        
        <DocumentedQuoteBuilder />
      </div>
    </div>
  );
}