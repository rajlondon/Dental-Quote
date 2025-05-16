import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Home, ArrowRight } from 'lucide-react';
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
  const completedQuoteRef = useRef<any>(null);
  
  // Use a callback ref to avoid issues with state updates
  const handleQuoteComplete = useCallback((quoteData: any) => {
    console.log('Quote completed:', quoteData);
    
    // Store the quote data in a ref to avoid losing it during state updates
    completedQuoteRef.current = quoteData;
    
    // Use setTimeout to ensure the state update happens after any other operations
    setTimeout(() => {
      setCompletedQuote(completedQuoteRef.current);
      
      // Show toast after state is updated
      setTimeout(() => {
        toast({
          title: 'Quote Completed',
          description: `Your quote for £${completedQuoteRef.current?.total || 0} has been created.`,
        });
      }, 100);
    }, 0);
  }, [toast]);
  
  const handleResetQuote = useCallback((e: React.MouseEvent) => {
    // Prevent default behavior
    e.preventDefault();
    
    // Clear the stored quote
    completedQuoteRef.current = null;
    setCompletedQuote(null);
  }, []);
  
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
              <p>Items: {completedQuote.treatments?.length > 0 
                ? `${completedQuote.treatments.length} treatments` 
                : completedQuote.selectedPackage 
                  ? `${completedQuote.selectedPackage.name} package` 
                  : 'None'}</p>
              <p>Promo Code: {completedQuote.promoCode || 'None'}</p>
              {completedQuote.promoCode && (
                <p>Discount: £{completedQuote.promoDiscount || 0}</p>
              )}
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={handleResetQuote}
                  className="mt-2"
                  variant="outline"
                  type="button"
                >
                  Start New Quote
                </Button>
                <Button 
                  className="mt-2"
                  type="button"
                >
                  <span>Proceed to Booking</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
        
        {!completedQuote ? (
          <StandaloneQuoteBuilder 
            onQuoteComplete={handleQuoteComplete}
            hideHeader={true}
          />
        ) : (
          <div className="mt-8 p-6 border rounded-lg bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Quote Integration Example</h2>
            <p className="mb-4">
              The standalone quote builder has successfully generated a quote with ID: <strong>{completedQuote.quoteId || 'Not saved'}</strong>
            </p>
            <p className="mb-4">
              In a real application, you would now:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Store the quote data in your application state</li>
              <li>Save the quote to your database for future reference</li>
              <li>Proceed to the next step in your booking flow</li>
              <li>Or use the quote data to generate PDF documents</li>
            </ul>
            <p>
              The quote builder component is completely decoupled from your application, only communicating through the <code>onQuoteComplete</code> callback.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandaloneQuoteDemo;