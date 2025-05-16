import React from 'react';
import { RobustQuoteBuilder } from '../components/quotes/RobustQuoteBuilder';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export function RobustQuoteDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">MyDentalFly</h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </header>
      
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Robust Quote Builder</h1>
          <p className="text-gray-600">
            A rock-solid implementation with state management that persists throughout interactions
          </p>
        </div>
        
        <RobustQuoteBuilder />
      </div>
    </div>
  );
}

export default RobustQuoteDemo;