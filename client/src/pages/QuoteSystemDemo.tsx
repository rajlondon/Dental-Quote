import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import LazyQuoteFlow from '@/components/quotes/LazyQuoteFlow';
import { QuoteFlowProvider } from '@/contexts/QuoteFlowContext';
import { useSpecialOffers } from '@/hooks/use-special-offers';
import { useTreatmentPackages } from '@/hooks/use-treatment-packages';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle, 
  Package, 
  Percent, 
  RefreshCcw, 
  Sparkles, 
  Tag
} from 'lucide-react';

/**
 * Quote System Demo Page
 * 
 * A comprehensive demo page that showcases all the functionality of the quote system:
 * - Standard quote flow
 * - Special offers integration
 * - Treatment packages
 * - Promo code application
 */
const QuoteSystemDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('standard');
  const [quoteState, setQuoteState] = useState<any>(null);
  const [demoMode, setDemoMode] = useState<'standard' | 'special-offer' | 'package' | 'promo'>('standard');
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [showQuote, setShowQuote] = useState(false);
  
  const { availableOffers } = useSpecialOffers();
  const { availablePackages } = useTreatmentPackages();
  const { toast } = useToast();
  
  // Reset demo state
  const resetDemo = () => {
    setQuoteState(null);
    setSelectedOfferId(null);
    setSelectedPackageId(null);
    setPromoCode(null);
    setShowQuote(false);
  };
  
  // Handle different demo modes
  const startStandardQuote = () => {
    resetDemo();
    setDemoMode('standard');
    setShowQuote(true);
  };
  
  const startSpecialOfferQuote = (offerId: string) => {
    resetDemo();
    setSelectedOfferId(offerId);
    setDemoMode('special-offer');
    setShowQuote(true);
    
    toast({
      title: "Special Offer Selected",
      description: "The quote will include special offer discounts",
      variant: "default"
    });
  };
  
  const startPackageQuote = (packageId: string) => {
    resetDemo();
    setSelectedPackageId(packageId);
    setDemoMode('package');
    setShowQuote(true);
    
    toast({
      title: "Treatment Package Selected",
      description: "The quote will include bundled treatments",
      variant: "default"
    });
  };
  
  const startPromoQuote = (code: string) => {
    resetDemo();
    setPromoCode(code);
    setDemoMode('promo');
    setShowQuote(true);
    
    toast({
      title: "Promo Code Applied",
      description: `Promo code ${code} will be applied to your quote`,
      variant: "default"
    });
  };
  
  // Handle quote completion
  const handleQuoteComplete = (data: any) => {
    console.log('Quote completed with data:', data);
    setQuoteState(data);
    setActiveTab('summary');
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">MyDentalFly Quote System Demo</h1>
        <p className="text-gray-600 text-lg">
          Test and explore the complete quote management system
        </p>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full gap-2">
          <TabsTrigger value="standard">Standard Quote</TabsTrigger>
          <TabsTrigger value="special-offers">Special Offers</TabsTrigger>
          <TabsTrigger value="packages">Treatment Packages</TabsTrigger>
          <TabsTrigger value="promo-codes">Promo Codes</TabsTrigger>
        </TabsList>
        
        {/* STANDARD QUOTE TAB */}
        <TabsContent value="standard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowRight className="h-5 w-5 mr-2" />
                Standard Quote Flow
              </CardTitle>
              <CardDescription>
                Build a dental treatment quote using the standard quote flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                The standard quote flow allows users to select dental treatments and build a personalized 
                treatment plan. Start the demo to see the complete quote process in action.
              </p>
              
              <Button onClick={startStandardQuote} size="lg" className="w-full md:w-auto">
                Start Standard Quote Demo
              </Button>
            </CardContent>
          </Card>
          
          {showQuote && demoMode === 'standard' && (
            <Card>
              <CardHeader>
                <CardTitle>Quote Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <QuoteFlowProvider>
                  <LazyQuoteFlow 
                    onComplete={handleQuoteComplete}
                    onCancel={() => setShowQuote(false)}
                  />
                </QuoteFlowProvider>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* SPECIAL OFFERS TAB */}
        <TabsContent value="special-offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Special Offers Integration
              </CardTitle>
              <CardDescription>
                Test how special offers are integrated into the quote system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Special offers provide discounts on specific dental treatments. 
                Select an offer below to see how it affects pricing in the quote.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {availableOffers && availableOffers.map((offer: any) => (
                  <Card key={offer.id} className="overflow-hidden border border-gray-200 hover:border-primary/50 transition-all">
                    <div className="bg-primary/10 p-2 text-xs font-medium text-primary">
                      {offer.discount_type === 'percentage' ? 
                        `${offer.discount_value}% OFF` : 
                        `£${offer.discount_value} OFF`}
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">{offer.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{offer.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-2">
                      <Button 
                        onClick={() => startSpecialOfferQuote(offer.id)}
                        size="sm"
                        className="w-full"
                      >
                        Select This Offer
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {showQuote && demoMode === 'special-offer' && (
            <Card>
              <CardHeader>
                <CardTitle>Quote Builder with Special Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <QuoteFlowProvider>
                  <LazyQuoteFlow 
                    specialOfferId={selectedOfferId || undefined}
                    onComplete={handleQuoteComplete}
                    onCancel={() => setShowQuote(false)}
                  />
                </QuoteFlowProvider>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* TREATMENT PACKAGES TAB */}
        <TabsContent value="packages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Treatment Packages
              </CardTitle>
              <CardDescription>
                Explore bundled treatment packages with special pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Treatment packages bundle multiple treatments together at discounted rates.
                Select a package below to see how bundled treatments work.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {availablePackages && availablePackages.map((pkg: any) => (
                  <Card key={pkg.id} className="overflow-hidden border border-gray-200 hover:border-primary/50 transition-all">
                    <div className="bg-emerald-50 p-2 text-xs font-medium text-emerald-700">
                      PACKAGE DEAL
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 pb-2">
                      <div className="text-sm text-gray-500">
                        <div className="font-medium">Includes:</div>
                        <ul className="list-disc pl-4 mt-1">
                          {pkg.treatments && pkg.treatments.map((treatment: string, index: number) => (
                            <li key={index}>{treatment}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-2">
                      <Button 
                        onClick={() => startPackageQuote(pkg.id)}
                        size="sm"
                        className="w-full"
                      >
                        Select This Package
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {showQuote && demoMode === 'package' && (
            <Card>
              <CardHeader>
                <CardTitle>Quote Builder with Treatment Package</CardTitle>
              </CardHeader>
              <CardContent>
                <QuoteFlowProvider>
                  <LazyQuoteFlow 
                    packageId={selectedPackageId || undefined}
                    onComplete={handleQuoteComplete}
                    onCancel={() => setShowQuote(false)}
                  />
                </QuoteFlowProvider>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* PROMO CODES TAB */}
        <TabsContent value="promo-codes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Promo Code Application
              </CardTitle>
              <CardDescription>
                Test how promo codes are applied to quotes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Promo codes can be applied to any quote to receive discounts.
                Select a promo code to see how it affects pricing.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Demo promo codes */}
                {[
                  { code: 'WELCOME20', description: '20% off your first quote', type: 'percentage', value: 20 },
                  { code: 'IMPLANTCROWN30', description: '30% off implant & crown bundles', type: 'percentage', value: 30 },
                  { code: 'FREEWHITE', description: 'Free teeth whitening with veneers', type: 'fixed', value: 150 },
                  { code: 'FREECONSULT', description: 'Free consultation package', type: 'percentage', value: 100 },
                  { code: 'LUXHOTEL20', description: '20% off premium hotel bookings', type: 'percentage', value: 20 },
                  { code: 'LUXTRAVEL', description: 'Free airport transfers (£80 value)', type: 'fixed', value: 80 }
                ].map((promo) => (
                  <Card key={promo.code} className="overflow-hidden border border-gray-200 hover:border-primary/50 transition-all">
                    <div className="bg-blue-50 p-2 text-xs font-medium text-blue-700 flex justify-between items-center">
                      <span>PROMO CODE</span>
                      <span className="font-mono bg-blue-100 px-2 py-1 rounded">{promo.code}</span>
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Percent className="h-4 w-4 mr-1" />
                        {promo.type === 'percentage' ? 
                          `${promo.value}% Discount` : 
                          `£${promo.value} Off`}
                      </CardTitle>
                      <CardDescription>{promo.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-2">
                      <Button 
                        onClick={() => startPromoQuote(promo.code)}
                        size="sm"
                        className="w-full"
                      >
                        Apply This Code
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {showQuote && demoMode === 'promo' && (
            <Card>
              <CardHeader>
                <CardTitle>Quote Builder with Promo Code</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Promo Code Applied</AlertTitle>
                  <AlertDescription>
                    Promo code <span className="font-mono bg-primary/10 px-2 py-0.5 rounded">{promoCode}</span> will be applied to your quote
                  </AlertDescription>
                </Alert>
                <QuoteFlowProvider>
                  <LazyQuoteFlow 
                    promoCode={promoCode || undefined}
                    onComplete={handleQuoteComplete}
                    onCancel={() => setShowQuote(false)}
                  />
                </QuoteFlowProvider>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Quote Summary when a quote is completed */}
      {quoteState && (
        <Card className="mt-8">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="flex items-center text-green-700">
              <CheckCircle className="h-5 w-5 mr-2" />
              Quote Successfully Generated
            </CardTitle>
            <CardDescription className="text-green-600">
              Your quote has been created with the following details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Selected Treatments</h3>
                {quoteState.treatments && quoteState.treatments.length > 0 ? (
                  <ul className="space-y-2">
                    {quoteState.treatments.map((item: any, index: number) => (
                      <li key={index} className="flex justify-between items-center border-b pb-2">
                        <span>
                          {item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}
                          {item.specialOfferApplied && (
                            <span className="ml-2 text-xs font-medium text-green-600">
                              (Special Offer Applied)
                            </span>
                          )}
                        </span>
                        <span className="font-medium">£{item.subtotalGBP}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No treatments selected</p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Pricing Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Subtotal:</span>
                    <span>£{quoteState.subtotal || 0}</span>
                  </div>
                  
                  {quoteState.offerDiscount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Special Offer Discount:</span>
                      <span>-£{quoteState.offerDiscount}</span>
                    </div>
                  )}
                  
                  {quoteState.promoDiscount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Promo Code Discount:</span>
                      <span>-£{quoteState.promoDiscount}</span>
                    </div>
                  )}
                  
                  {quoteState.packageSavings > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Package Savings:</span>
                      <span>-£{quoteState.packageSavings}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>£{quoteState.total || 0}</span>
                  </div>
                </div>
                
                {quoteState.promoCode && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-800">
                      Applied Promo Code: {quoteState.promoCode}
                    </p>
                    <p className="text-xs text-blue-600">
                      {quoteState.discountType === 'percentage' 
                        ? `${quoteState.discountValue}% discount applied` 
                        : `£${quoteState.discountValue} discount applied`}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <Button 
                onClick={resetDemo} 
                variant="outline"
                className="flex items-center"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Start New Quote
              </Button>
              
              <Button>
                Continue to Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuoteSystemDemo;