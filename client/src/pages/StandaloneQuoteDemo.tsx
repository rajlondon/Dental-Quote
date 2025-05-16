import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Home } from 'lucide-react';
import { Link } from 'wouter';
import StandaloneQuoteBuilder from '@/components/standalone/StandaloneQuoteBuilder';

/**
 * Standalone Quote Demo Page
 * 
 * This page demonstrates how to embed the standalone quote builder
 * with minimal integration points
 */
const StandaloneQuoteDemo: React.FC = () => {
  const { toast } = useToast();
  const [completedQuote, setCompletedQuote] = useState<any>(null);
  
  const handleQuoteComplete = (quoteData: any) => {
    console.log('Quote completed:', quoteData);
    setCompletedQuote(quoteData);
    
    toast({
      title: 'Quote Completed',
      description: `Your quote for £${quoteData.total} has been created.`,
    });
  };
  
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
      
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Standalone Quote Builder Demo</h1>
          <p className="text-gray-600 mb-4">
            This demo shows how to embed the standalone quote builder in your application
          </p>
          
          {completedQuote && (
            <Card className="p-4 mb-4 bg-green-50 border-green-200">
              <h2 className="text-lg font-semibold mb-2">Quote Successfully Created!</h2>
              <p>Quote ID: {completedQuote.quoteId || 'Not saved'}</p>
              <p>Total: £{completedQuote.total}</p>
              <p>Items: {completedQuote.treatments.length > 0 
                ? `${completedQuote.treatments.length} treatments` 
                : completedQuote.selectedPackage 
                  ? `${completedQuote.selectedPackage.name} package` 
                  : 'None'}</p>
              <p>Promo Code: {completedQuote.promoCode || 'None'}</p>
              <Button 
                onClick={() => setCompletedQuote(null)}
                className="mt-2"
                variant="outline"
              >
                Start New Quote
              </Button>
            </Card>
          )}
        </div>
        
        {!completedQuote ? (
          <StandaloneQuoteBuilder 
            onQuoteComplete={handleQuoteComplete}
            hideHeader={true}
          />
        ) : null}
      </div>
    </div>
  );
};

export default StandaloneQuoteDemo;