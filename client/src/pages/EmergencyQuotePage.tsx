import React from 'react';
import { EmergencyQuoteBuilder } from '@/components/quotes/EmergencyQuoteBuilder';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Link } from 'wouter';

/**
 * EmergencyQuotePage - Completely standalone implementation without any external dependencies
 * 
 * Key characteristics:
 * - Uses no external state management
 * - Everything contained in local component state
 * - No toast notifications whatsoever
 * - No API calls that could disrupt user flow
 * - Simulated promo code processing
 * - No complex navigation patterns
 */
export default function EmergencyQuotePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Emergency Quote Builder</h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Emergency Quote Builder</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This is a completely standalone implementation 
            with no external dependencies, API calls, or toast notifications.
            It uses only local component state and simulated promo code handling.
          </p>
        </div>
        
        <EmergencyQuoteBuilder />
      </div>
    </div>
  );
}