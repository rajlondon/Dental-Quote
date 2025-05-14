import React, { useEffect } from 'react';
import LazyQuoteFlow from '@/components/quotes/LazyQuoteFlow';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import TestNavigationHeader from '@/components/navigation/TestNavigationHeader';
import { Package, Tag, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const packageId = params.get('packageId');
  
  // Track page views with appropriate parameters
  useEffect(() => {
    const category = packageId ? 'package_test' : 
                   promoCode ? 'promo_test' : 
                   specialOfferId ? 'special_offer_test' : 'basic_test';
    
    trackEvent('quote_test_page_view', category, packageId || promoCode || specialOfferId || 'standard');
  }, [packageId, promoCode, specialOfferId]);
  
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
  
  // Map package IDs to friendly names
  const getPackageName = (id: string) => {
    const packageNames: Record<string, string> = {
      'pkg-001': '6 Implants + 6 Crowns Bundle',
      'pkg-002': '4 Implants + 4 Crowns Bundle',
      'pkg-003': 'All-on-4 Implant Package',
      'pkg-004': '8 Veneers Smile Makeover'
    };
    return packageNames[id] || id;
  };

  return (
    <>
      <TestNavigationHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Quote System Test Page</h1>
      
        {/* Display test parameters */}
        {(promoCode || specialOfferId || packageId) && (
          <div className="bg-slate-50 p-4 mb-6 rounded-lg">
            <p className="text-sm font-medium text-slate-700">Testing with parameters:</p>
            <ul className="mt-2 space-y-1">
              {packageId && (
                <li className="flex items-center text-sm">
                  <Package className="h-4 w-4 mr-2 text-indigo-600" />
                  <span className="font-semibold">Package:</span> 
                  <span className="ml-1">{getPackageName(packageId)}</span>
                </li>
              )}
              {promoCode && (
                <li className="flex items-center text-sm">
                  <Tag className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-semibold">Promo Code:</span>
                  <span className="ml-1">{promoCode}</span>
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
        
        {packageId && !promoCode && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Testing treatment package: <span className="font-medium">{getPackageName(packageId)}</span>
            </AlertDescription>
          </Alert>
        )}
        
        {packageId && promoCode && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Testing treatment package with promo code: <span className="font-medium">{getPackageName(packageId)}</span> with <span className="font-medium">{promoCode}</span>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <LazyQuoteFlow 
            promoCode={promoCode || undefined}
            specialOfferId={specialOfferId || undefined}
            packageId={packageId || undefined}
            onComplete={handleQuoteComplete}
            onCancel={handleQuoteCancel}
          />
        </div>
      </div>
    </>
  );
};

export default QuoteTestPage;