import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import QuoteIntegrationWidget from '@/components/quotes/QuoteIntegrationWidget';
import TreatmentList, { TreatmentLineItem } from '@/components/quotes/TreatmentList';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useAutoApplyCode } from '@/hooks/use-auto-apply-code';

// Mock treatment data
const mockTreatments: TreatmentLineItem[] = [
  {
    id: 'dental_implant_standard',
    name: 'Dental Implant (Standard)',
    description: 'High-quality standard dental implant procedure',
    price: 950,
    quantity: 1,
    lineTotal: 950,
    category: 'implants'
  },
  {
    id: 'porcelain_veneers',
    name: 'Porcelain Veneers',
    description: 'Premium porcelain veneers for a natural-looking smile',
    price: 550,
    quantity: 2,
    lineTotal: 1100,
    category: 'cosmetic'
  }
];

// Mock quote service implementation
const createMockQuoteService = () => {
  // Internal state
  let treatments = [...mockTreatments];
  let subtotal = treatments.reduce((sum, t) => sum + t.lineTotal, 0);
  let discountAmount = 0;
  let discountType: 'percentage' | 'fixed_amount' | undefined = undefined;
  let discountValue = 0;
  let promoCode: string | undefined = undefined;
  let currency = 'USD';
  let patientInfo: any = undefined;

  // Available promo codes
  const promoCodes: Record<string, { type: 'percentage' | 'fixed_amount', value: number }> = {
    'SUMMER15': { type: 'percentage', value: 15 },
    'DENTAL25': { type: 'percentage', value: 25 },
    'NEWPATIENT': { type: 'percentage', value: 20 },
    'TEST10': { type: 'percentage', value: 10 },
    'FREECONSULT': { type: 'fixed_amount', value: 75 },
    'LUXHOTEL20': { type: 'percentage', value: 20 },
    'IMPLANTCROWN30': { type: 'percentage', value: 30 },
    'FREEWHITE': { type: 'fixed_amount', value: 150 },
    'LUXTRAVEL': { type: 'fixed_amount', value: 80 }
  };

  // Recalculate totals
  const recalculate = () => {
    subtotal = treatments.reduce((sum, t) => sum + t.lineTotal, 0);
    
    if (discountType && discountValue) {
      if (discountType === 'percentage') {
        discountAmount = (subtotal * discountValue) / 100;
      } else {
        discountAmount = Math.min(discountValue, subtotal);
      }
    } else {
      discountAmount = 0;
    }
  };

  return {
    initialize: async () => {
      // Reset to initial state
      treatments = [...mockTreatments];
      recalculate();
      return Promise.resolve();
    },
    
    addTreatment: async (treatmentId: string, quantity: number) => {
      const existingIndex = treatments.findIndex(t => t.id === treatmentId);
      
      if (existingIndex >= 0) {
        treatments[existingIndex].quantity += quantity;
        treatments[existingIndex].lineTotal = treatments[existingIndex].price * treatments[existingIndex].quantity;
      } else {
        // This would fetch the treatment details from the server in a real implementation
        const newTreatment = {
          id: treatmentId,
          name: `New Treatment (${treatmentId})`,
          description: 'Added treatment',
          price: 500,
          quantity,
          lineTotal: 500 * quantity,
          category: 'other'
        };
        
        treatments.push(newTreatment);
      }
      
      recalculate();
      return Promise.resolve();
    },
    
    removeTreatment: async (treatmentId: string) => {
      treatments = treatments.filter(t => t.id !== treatmentId);
      recalculate();
      return Promise.resolve();
    },
    
    updateQuantity: async (treatmentId: string, quantity: number) => {
      const treatment = treatments.find(t => t.id === treatmentId);
      
      if (treatment) {
        treatment.quantity = quantity;
        treatment.lineTotal = treatment.price * quantity;
        recalculate();
      }
      
      return Promise.resolve();
    },
    
    applyPromoCode: async (code: string) => {
      const promoInfo = promoCodes[code];
      
      if (promoInfo) {
        promoCode = code;
        discountType = promoInfo.type;
        discountValue = promoInfo.value;
        recalculate();
        return Promise.resolve({ success: true });
      } else {
        return Promise.resolve({ 
          success: false, 
          message: 'Invalid promo code. Please try a different code.' 
        });
      }
    },
    
    clearPromoCode: async () => {
      promoCode = undefined;
      discountType = undefined;
      discountValue = 0;
      recalculate();
      return Promise.resolve();
    },
    
    processOffer: async (offerId: string) => {
      // In a real implementation, this would fetch the offer details and add its treatments
      // For this demo, we'll simulate adding a bundle
      await Promise.all([
        mockQuoteService.clearPromoCode(),
        mockQuoteService.addTreatment('dental_implant_standard', 1),
        mockQuoteService.addTreatment('dental_crowns', 1)
      ]);
      
      // Apply the special offer promo code
      await mockQuoteService.applyPromoCode('IMPLANTCROWN30');
      
      return Promise.resolve();
    },
    
    submitPatientInfo: async (info: any) => {
      patientInfo = info;
      return Promise.resolve();
    },
    
    saveQuote: async () => {
      // In a real implementation, this would send the quote data to the server
      // For this demo, we'll just generate a random ID
      const quoteId = Math.random().toString(36).substring(2, 10);
      return Promise.resolve({ quoteId });
    },
    
    getState: async () => {
      return Promise.resolve({
        treatments,
        subtotal,
        discountAmount,
        total: subtotal - discountAmount,
        promoCode,
        discountType,
        discountValue,
        currency,
        patientInfo
      });
    }
  };
};

const mockQuoteService = createMockQuoteService();

/**
 * Demo page for quote integration components
 * This page showcases all the features built for the quote system
 */
const QuoteDemoPage = () => {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('widget');
  
  // Auto-apply promo code from URL
  const promoCode = useAutoApplyCode((code) => {
    toast({
      title: "URL Promo Code Detected",
      description: `The promo code "${code}" has been automatically applied from the URL.`,
    });
  });

  // Handle quote saved
  const handleQuoteSaved = (id: string) => {
    setQuoteId(id);
    toast({
      title: "Quote Saved",
      description: `Your quote has been saved with ID: ${id}`,
    });
  };

  // Simulate adding promo code to URL
  const addPromoToUrl = (code: string) => {
    // Create a new URL with the promo code parameter
    const url = new URL(window.location.href);
    url.searchParams.set('code', code);
    
    // Update the browser URL without refreshing the page
    window.history.pushState({}, '', url.toString());
    
    // Force a location update to trigger the auto-apply hook
    setLocation(url.pathname + url.search);
    
    toast({
      title: "URL Updated",
      description: `The URL has been updated with promo code: ${code}`,
    });
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Quote Integration Demo</h1>
          <p className="text-muted-foreground">
            Explore the components and features of the quote integration system
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="widget">Complete Widget</TabsTrigger>
            <TabsTrigger value="treatment-list">Treatment List</TabsTrigger>
            <TabsTrigger value="promo-url">URL Promo Codes</TabsTrigger>
          </TabsList>

          {/* Complete Widget Tab */}
          <TabsContent value="widget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quote Integration Widget</CardTitle>
                <CardDescription>
                  The complete quote integration widget with all features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuoteIntegrationWidget 
                  quoteService={mockQuoteService}
                  onQuoteSaved={handleQuoteSaved}
                />
              </CardContent>
            </Card>
            
            {quoteId && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700">Quote Saved Successfully!</CardTitle>
                  <CardDescription className="text-green-600">
                    Your quote has been saved with ID: <strong>{quoteId}</strong>
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          {/* Treatment List Tab */}
          <TabsContent value="treatment-list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Treatment List Component</CardTitle>
                <CardDescription>
                  Standalone treatment list component with various configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Basic Treatment List</h3>
                  <div className="border rounded-md p-4">
                    <TreatmentList treatments={mockTreatments} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">With Discount Applied</h3>
                  <div className="border rounded-md p-4">
                    <TreatmentList 
                      treatments={mockTreatments} 
                      discountType="percentage"
                      discountValue={20}
                      promoCode="DENTAL20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Read-Only View</h3>
                  <div className="border rounded-md p-4">
                    <TreatmentList 
                      treatments={mockTreatments} 
                      isReadOnly={true}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Different Currency</h3>
                  <div className="border rounded-md p-4">
                    <TreatmentList 
                      treatments={mockTreatments} 
                      currency="EUR"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* URL Promo Codes Tab */}
          <TabsContent value="promo-url" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Apply Promo Codes from URL</CardTitle>
                <CardDescription>
                  Test how promo codes automatically apply when present in the URL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Current URL Status</h3>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm break-all">
                    {window.location.href}
                  </div>
                  {promoCode && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-md border border-green-200">
                      Detected promo code: <strong>{promoCode}</strong>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Test Promo Code Auto-Apply</h3>
                  <p className="text-muted-foreground">
                    Click on any of these promo codes to update the URL and trigger auto-apply:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" onClick={() => addPromoToUrl('SUMMER15')}>
                      SUMMER15
                    </Button>
                    <Button variant="outline" onClick={() => addPromoToUrl('DENTAL25')}>
                      DENTAL25
                    </Button>
                    <Button variant="outline" onClick={() => addPromoToUrl('NEWPATIENT')}>
                      NEWPATIENT
                    </Button>
                    <Button variant="outline" onClick={() => addPromoToUrl('FREECONSULT')}>
                      FREECONSULT
                    </Button>
                    <Button variant="outline" onClick={() => addPromoToUrl('INVALID123')}>
                      INVALID123
                    </Button>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Demo Widget with Auto-Apply</h3>
                  <QuoteIntegrationWidget 
                    quoteService={mockQuoteService}
                    initialTab="treatments"
                    showPatientInfoSection={false}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QuoteDemoPage;