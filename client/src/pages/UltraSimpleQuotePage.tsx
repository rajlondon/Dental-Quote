import React from 'react';
import { UltraSimpleQuoteBuilder } from '@/components/quotes/UltraSimpleQuoteBuilder';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Link } from 'wouter';

/**
 * UltraSimpleQuotePage - Page that hosts the ultra simplified quote builder
 * 
 * This implementation completely avoids complex tab state management
 * and uses a basic boolean toggle for page navigation instead.
 */
export default function UltraSimpleQuotePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Ultra Simple Quote Builder</h1>
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
          <h1 className="text-3xl font-bold mb-2">Ultra Simple Quote Builder</h1>
          <p className="text-gray-600">
            This implementation uses a straightforward approach with no tabs 
            - just simple page toggling for maximum reliability
          </p>
        </div>
        
        <UltraSimpleQuoteBuilder />
      </div>
    </div>
  );
}