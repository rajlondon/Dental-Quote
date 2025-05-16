import React from 'react';
import { FinalQuoteBuilder } from '@/components/quotes/FinalQuoteBuilder';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Link } from 'wouter';

/**
 * FinalQuotePage - Page with the most reliable quote builder implementation
 * 
 * Key features:
 * - No toast notifications that might cause page resets
 * - Simple boolean navigation without complex tab state
 * - Inline status messages for better stability
 * - All API calls isolated from UI navigation
 * - Error handling without component resets
 */
export default function FinalQuotePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Final Quote Builder (No Toasts)</h1>
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
          <h1 className="text-3xl font-bold mb-2">Final Quote Builder</h1>
          <p className="text-gray-600">
            Our most stable implementation with no toast notifications and
            simple page navigation for maximum reliability
          </p>
        </div>
        
        <FinalQuoteBuilder />
      </div>
    </div>
  );
}