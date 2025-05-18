import React, { useState } from 'react';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import PatientQuoteDetail from '@/components/patient/PatientQuoteDetail';

/**
 * Test page to demonstrate the enhanced quote display with promo codes
 */
const QuoteDisplayTestPage: React.FC = () => {
  const [quoteId, setQuoteId] = useState('quote-123');
  const [showQuote, setShowQuote] = useState(false);

  const handleViewQuote = () => {
    setShowQuote(true);
  };

  return (
    <Container>
      <PageHeader
        title="Enhanced Quote Display Demo"
        description="Test the enhanced quote detail display with promo code information"
      />
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              This demo page allows you to test the enhanced quote display component that prominently 
              shows promo codes and discount information.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <p className="font-medium mb-2">Available Sample Quote IDs:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><code>quote-123</code> - Quote with "WELCOME10" promo code (10% off)</li>
                  <li><code>quote-456</code> - Quote with "SUMMER20" promo code (20% off)</li>
                  <li><code>quote-789</code> - Quote without a promo code</li>
                </ul>
              </div>
              
              <div className="flex-1">
                <p className="font-medium mb-2">Features Demonstrated:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Promo code display with green highlight box</li>
                  <li>Savings amount calculation and display</li>
                  <li>PDF download functionality</li>
                  <li>Responsive layout across all devices</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Enter Quote ID
                </label>
                <Input 
                  value={quoteId} 
                  onChange={(e) => setQuoteId(e.target.value)}
                  placeholder="e.g., quote-123"
                />
              </div>
              <Button onClick={handleViewQuote}>View Quote</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showQuote && (
        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-bold mb-6">Quote Display:</h2>
          <PatientQuoteDetail id={quoteId} />
        </div>
      )}
    </Container>
  );
};

export default QuoteDisplayTestPage;