import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QuoteBuilder } from '@/components/quotes/QuoteBuilder';
import { QuoteSummary } from '@/components/quotes/QuoteSummary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSpecialOffers } from '@/hooks/use-special-offers';
import { useTreatmentPackages } from '@/hooks/use-treatment-packages';

/**
 * Test page for the integrated quote system including special offers and treatment packages
 */
export default function QuoteIntegrationTestPage() {
  // Test data for the quote state
  const [quoteState, setQuoteState] = useState<any>({
    treatments: [],
    packages: [],
    addons: [],
    subtotal: 0,
    discount: 0,
    total: 0,
    promoCode: null,
    promoCodeId: null,
    discountType: null,
    discountValue: null,
    offerDiscount: 0,
    promoDiscount: 0,
    packageSavings: 0,
    includedPerks: []
  });

  const [activeTab, setActiveTab] = useState('builder');
  const [testMode, setTestMode] = useState<'normal' | 'special-offer' | 'package'>('normal');

  // Special offer test data
  const { data: specialOffers } = useSpecialOffers();
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // Treatment package test data
  const { data: treatmentPackages } = useTreatmentPackages();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  // Handle quote builder completion
  const handleQuoteComplete = (data: any) => {
    console.log('Quote completed:', data);
    setQuoteState(data);
    setActiveTab('summary');
  };

  // Reset test data
  const resetTest = () => {
    setQuoteState({
      treatments: [],
      packages: [],
      addons: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      promoCode: null,
      promoCodeId: null,
      discountType: null,
      discountValue: null,
      offerDiscount: 0,
      promoDiscount: 0,
      packageSavings: 0,
      includedPerks: []
    });
    setSelectedOfferId(null);
    setSelectedPackageId(null);
    setTestMode('normal');
    setActiveTab('builder');
  };

  // Start a test with a special offer
  const startSpecialOfferTest = () => {
    if (specialOffers && specialOffers.length > 0) {
      setSelectedOfferId(specialOffers[0].id);
      setTestMode('special-offer');
    }
  };

  // Start a test with a treatment package
  const startPackageTest = () => {
    if (treatmentPackages && treatmentPackages.length > 0) {
      setSelectedPackageId(treatmentPackages[0].id);
      setTestMode('package');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Quote System Integration Test</CardTitle>
          <CardDescription>
            Test the integrated quote system with special offers and treatment packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                onClick={resetTest} 
                className="flex items-center gap-2"
              >
                Reset Test
              </Button>
              <Button 
                variant="default" 
                onClick={startSpecialOfferTest}
                className="flex items-center gap-2"
                disabled={!specialOffers || specialOffers.length === 0}
              >
                Start Special Offer Test
              </Button>
              <Button 
                variant="default" 
                onClick={startPackageTest}
                className="flex items-center gap-2"
                disabled={!treatmentPackages || treatmentPackages.length === 0}
              >
                Start Package Test
              </Button>
            </div>
            {testMode !== 'normal' && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium">
                  Test Mode: {testMode === 'special-offer' ? 'Special Offer' : 'Treatment Package'}
                </p>
                {testMode === 'special-offer' && selectedOfferId && (
                  <p className="text-xs">
                    Testing with offer ID: {selectedOfferId}
                  </p>
                )}
                {testMode === 'package' && selectedPackageId && (
                  <p className="text-xs">
                    Testing with package ID: {selectedPackageId}
                  </p>
                )}
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="builder">Quote Builder</TabsTrigger>
              <TabsTrigger value="summary">Quote Summary</TabsTrigger>
            </TabsList>
            <TabsContent value="builder">
              <div className="border rounded-lg p-6">
                <QuoteBuilder 
                  onComplete={handleQuoteComplete}
                  onCancel={() => console.log('Quote builder cancelled')}
                  specialOfferId={selectedOfferId || undefined}
                  packageId={selectedPackageId || undefined}
                />
              </div>
            </TabsContent>
            <TabsContent value="summary">
              <div className="border rounded-lg p-6">
                <QuoteSummary quote={quoteState} />
                
                <div className="mt-6">
                  <Button onClick={() => setActiveTab('builder')}>
                    Return to Builder
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <div className="text-sm text-muted-foreground">
            <p>Test the integration between QuoteBuilder, special offers, and treatment packages.</p>
            <p>Log data is printed to the console for debugging.</p>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(quoteState, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}