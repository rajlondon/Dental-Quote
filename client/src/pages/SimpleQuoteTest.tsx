import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import TestNavigationHeader from '@/components/navigation/TestNavigationHeader';
import { Package, Tag, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Simplified test page for the quote flow system
 * A lightweight version to test if the issue is with component loading performance
 */
const SimpleQuoteTest: React.FC = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Parse URL parameters for testing different scenarios
  const params = new URLSearchParams(location.split('?')[1] || '');
  const promoCode = params.get('promoCode');
  const specialOfferId = params.get('specialOfferId');
  const packageId = params.get('packageId');
  
  useEffect(() => {
    console.log('SimpleQuoteTest loaded', { promoCode, specialOfferId, packageId });
  }, [promoCode, specialOfferId, packageId]);
  
  const handleTestAction = () => {
    setIsLoading(true);
    
    // Simulate an API call
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: 'Test Action Complete',
        description: 'The test action was successfully executed',
      });
    }, 1000);
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
        <h1 className="text-2xl font-bold mb-6">Simple Quote Test Page</h1>
      
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
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Test Card</CardTitle>
              <CardDescription>A simple test component to check loading performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is a simplified test page to verify if the loading issue is related to component complexity.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleTestAction} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Run Test Action'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Diagnosis</CardTitle>
              <CardDescription>Information about the page loading</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Page loaded successfully with minimal components.</p>
              <p className="mt-2 text-sm text-slate-500">If this page loads quickly but the main quote test page doesn't, the issue may be with component dependencies or data fetching.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SimpleQuoteTest;