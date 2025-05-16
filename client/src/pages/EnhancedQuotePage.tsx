import React from 'react';
import SimpleQuoteBuilder from '@/components/quotes/SimpleQuoteBuilder';
import { SimpleQuoteProvider } from '@/contexts/SimpleQuoteContext';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

/**
 * Enhanced Quote Page
 * 
 * This page implements the simplified but powerful quote builder that addresses
 * the performance and reliability issues in the original implementation.
 */
const EnhancedQuotePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">MyDentalFly Quote System</h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </header>
      
      <SimpleQuoteProvider>
        <SimpleQuoteBuilder />
      </SimpleQuoteProvider>
    </div>
  );
};

export default EnhancedQuotePage;