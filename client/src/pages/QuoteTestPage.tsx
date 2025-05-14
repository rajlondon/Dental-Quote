import React from 'react';
import LazyQuoteFlow from '@/components/quotes/LazyQuoteFlow';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import TestNavigationHeader from '@/components/navigation/TestNavigationHeader';

/**
 * Test page for the quote flow system
 * Allows testing of the quote components in isolation
 */
const QuoteTestPage: React.FC = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Parse URL parameters for testing different scenarios
  const params = new URLSearchParams(location.split('?')[1] || '');
  const promoCode = params.get('promoCode');
  const specialOfferId = params.get('specialOfferId');
  
  // Handle quote completion
  const handleQuoteComplete = (quoteData: any) => {
    console.log('Quote process completed', quoteData);
    trackEvent('quote_test_completed', 'testing', `quote_id_${quoteData?.id || 'unknown'}`);
    
    toast({
      title: 'Quote Completed',
      description: `Quote #${quoteData?.id || 'New'} has been successfully created`,
    });
    
    // We can add redirect logic here later
  };
  
  // Handle quote cancellation
  const handleQuoteCancel = () => {
    console.log('Quote process cancelled');
    trackEvent('quote_test_cancelled', 'testing');
    
    toast({
      title: 'Quote Cancelled',
      description: 'You have cancelled the quote process',
      variant: 'destructive',
    });
  };

  return (
    <>
      <TestNavigationHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Quote System Test Page</h1>
      
        {/* Display test parameters */}
        {(promoCode || specialOfferId) && (
          <div className="bg-slate-50 p-4 mb-6 rounded-lg">
            <p className="text-sm font-medium text-slate-700">Testing with parameters:</p>
            <ul className="mt-2 space-y-1">
              {promoCode && (
                <li className="text-sm">
                  <span className="font-semibold">Promo Code:</span> {promoCode}
                </li>
              )}
              {specialOfferId && (
                <li className="text-sm">
                  <span className="font-semibold">Special Offer ID:</span> {specialOfferId}
                </li>
              )}
            </ul>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <LazyQuoteFlow 
            promoCode={promoCode || undefined}
            specialOfferId={specialOfferId || undefined}
            onComplete={handleQuoteComplete}
            onCancel={handleQuoteCancel}
          />
        </div>
      </div>
    </>
  );
};

export default QuoteTestPage;