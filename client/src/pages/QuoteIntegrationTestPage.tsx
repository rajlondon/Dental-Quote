import React from 'react';
import { QuoteBuilder } from '@/components/quotes/QuoteBuilder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Test page for the integrated quote system including special offers and treatment packages
 */
export default function QuoteIntegrationTestPage() {
  const handleCompleteQuote = (quoteData: any) => {
    console.log('Quote completed:', quoteData);
    // In a real application, we would submit the quote to the server
  };

  const handleCancelQuote = () => {
    console.log('Quote cancelled');
    // In a real application, we would navigate back or reset
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Quote Integration Test</CardTitle>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">Testing Mode</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This page tests the integration of special offers and treatment packages with the quote builder.
            Select treatments, apply special offers, or choose a treatment package to see how they work together.
          </p>
        </CardContent>
      </Card>
      
      <QuoteBuilder 
        onComplete={handleCompleteQuote}
        onCancel={handleCancelQuote}
      />
    </div>
  );
}