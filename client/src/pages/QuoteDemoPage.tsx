import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuoteIntegrationWidget from '@/components/quotes/QuoteIntegrationWidget';
import TreatmentList, { Treatment } from '@/components/quotes/TreatmentList';
import { useAutoApplyCode } from '@/hooks/use-auto-apply-code';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, CurrencyCode } from '@/utils/format-utils';

// Sample treatments for demonstration
const sampleTreatments: Treatment[] = [
  {
    id: '1',
    name: 'Dental Implant',
    price: 850,
    description: 'Titanium implant post (excludes crown)',
    category: 'Implants',
    quantity: 1
  },
  {
    id: '2',
    name: 'Porcelain Crown',
    price: 350,
    description: 'High-quality porcelain dental crown',
    category: 'Crowns',
    quantity: 1
  },
  {
    id: '3',
    name: 'Teeth Whitening',
    price: 200,
    description: 'Professional teeth whitening treatment',
    category: 'Cosmetic',
    quantity: 1
  },
  {
    id: '4',
    name: 'Root Canal',
    price: 300,
    description: 'Complete root canal procedure',
    category: 'Endodontics',
    quantity: 1
  }
];

// Component to demonstrate URL promo code auto-application
const URLPromoDemo: React.FC = () => {
  const { toast } = useToast();
  const [promoApplied, setPromoApplied] = useState(false);
  
  const promoCode = useAutoApplyCode((code) => {
    if (!promoApplied) {
      toast({
        title: 'Promo Code Detected',
        description: `Promo code "${code}" was automatically detected from the URL.`,
      });
      setPromoApplied(true);
    }
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>URL Promo Code Detection</CardTitle>
        <CardDescription>
          Add a promo code to the URL using ?promo=CODE to test automatic detection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 border rounded-md bg-muted/50">
          <h3 className="text-lg font-semibold mb-2">Status</h3>
          {promoCode ? (
            <div className="text-green-600">
              Promo code detected: <span className="font-bold">{promoCode}</span>
            </div>
          ) : (
            <div className="text-amber-600">
              No promo code detected in URL. Try adding ?promo=SUMMER15 to the URL.
            </div>
          )}
          <div className="mt-4">
            <h4 className="font-medium">Available Test Codes:</h4>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>SUMMER15 - 15% off</li>
              <li>DENTAL25 - 25% off</li>
              <li>NEWPATIENT - 20% off</li>
              <li>FREECONSULT - $150 off</li>
              <li>FREEWHITE - $200 off</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main demo page with tabs
const QuoteDemoPage: React.FC = () => {
  // State for currency selection
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  // Handle currency change
  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Dental Tourism Quote System</h1>
        <p className="text-muted-foreground">
          A comprehensive system for dental treatments quotes with promo code functionality
        </p>
        
        {/* Currency selector */}
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => handleCurrencyChange('USD')}
            className={`px-3 py-1 rounded-md ${currency === 'USD' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            USD ($)
          </button>
          <button
            onClick={() => handleCurrencyChange('EUR')}
            className={`px-3 py-1 rounded-md ${currency === 'EUR' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            EUR (€)
          </button>
          <button
            onClick={() => handleCurrencyChange('GBP')}
            className={`px-3 py-1 rounded-md ${currency === 'GBP' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            GBP (£)
          </button>
        </div>
      </div>
      
      <Tabs defaultValue="complete" className="max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="complete">Complete Widget</TabsTrigger>
          <TabsTrigger value="treatment-list">Treatment List</TabsTrigger>
          <TabsTrigger value="url-promo">URL Promo Codes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="complete">
          <QuoteIntegrationWidget 
            initialTreatments={sampleTreatments} 
            currency={currency}
            autoApplyPromo={true}
          />
        </TabsContent>
        
        <TabsContent value="treatment-list">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Treatment List Component</CardTitle>
                <CardDescription>
                  Standalone component for displaying and managing dental treatments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TreatmentList 
                  treatments={sampleTreatments}
                  currency={currency}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Read-Only Treatment List</CardTitle>
                <CardDescription>
                  Read-only mode with quantity controls disabled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TreatmentList 
                  treatments={sampleTreatments}
                  currency={currency}
                  readonly={true}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="url-promo">
          <URLPromoDemo />
          
          <div className="mt-8">
            <QuoteIntegrationWidget 
              initialTreatments={sampleTreatments} 
              currency={currency}
              autoApplyPromo={true}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuoteDemoPage;