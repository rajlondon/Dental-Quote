import React from 'react';
import { EnhancedQuoteBuilder } from '@/components/quotes/EnhancedQuoteBuilder';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Link } from 'wouter';

/**
 * EnhancedQuotePage - Page that hosts the multi-step quote builder implementation
 * 
 * This implementation features:
 * - Multi-step workflow with progress indicators
 * - Enhanced treatment categorization and filtering
 * - Comprehensive patient information collection
 * - Detailed quote summary with review capability
 */
export default function EnhancedQuotePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Enhanced Quote Builder</h1>
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
          <h1 className="text-3xl font-bold mb-2">Enhanced Quote Builder</h1>
          <p className="text-gray-600">
            Multi-step workflow with treatment categories, patient information collection,
            and comprehensive quote review.
          </p>
        </div>
        
        <EnhancedQuoteBuilder />
      </div>
    </div>
  );
}