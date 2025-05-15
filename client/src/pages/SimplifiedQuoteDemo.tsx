import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Package, Percent, Tag, Sparkles, Info, Home } from 'lucide-react';
import { Link } from 'wouter';
import LazyQuoteFlow from '@/components/quotes/LazyQuoteFlow';
import { useEnhancedQuoteFlow } from '@/contexts/EnhancedQuoteFlowContext';
import { useSpecialOffers } from '@/components/SpecialOffersProvider';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Simplified Quote System Demo Page
 * 
 * A streamlined version that addresses UI performance issues
 */
const SimplifiedQuoteDemo: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('standard');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [currentPromoCode, setCurrentPromoCode] = useState<string | null>(null);
  
  // Get from context
  const { 
    resetQuoteFlow, 
    isQuoteInitialized,
    initializeQuoteFlow 
  } = useEnhancedQuoteFlow();
  
  // Special offers from context
  const specialOffersContext = useSpecialOffers();
  const specialOffers = specialOffersContext?.offers || [];
  
  // Sample treatment packages (same as original file)
  const treatmentPackages = [
    {
      id: 'pkg-001',
      name: 'Dental Implant Package',
      description: 'Complete package including implant, abutment, and crown',
      price: 1200,
      treatments: ['Dental Implant', 'Abutment', 'Crown'],
      discount: 15,
      discountType: 'percentage'
    },
    {
      id: 'pkg-002',
      name: 'Hollywood Smile',
      description: '8 premium porcelain veneers for a perfect smile',
      price: 2400,
      treatments: ['Dental Exam', 'X-rays', '8 Porcelain Veneers'],
      discount: 10,
      discountType: 'percentage'
    },
    {
      id: 'pkg-003',
      name: 'Full Mouth Reconstruction',
      description: 'Complete restoration with implants and fixed prosthetics',
      price: 7500,
      treatments: ['Dental Implants (6)', 'Fixed Bridge', 'Extractions', 'Bone Grafting'],
      discount: 20,
      discountType: 'percentage'
    }
  ];
  
  // Sample promo codes
  const promoCodes = [
    { code: 'WELCOME20', discount: 20, type: 'percentage', description: '20% off your first quote' },
    { code: 'FREECONSULT', discount: 100, type: 'fixed', description: 'Free consultation (£100 value)' },
    { code: 'SUMMER50', discount: 50, type: 'fixed', description: '£50 off any treatment' }
  ];
  
  // Reset everything on unmount
  useEffect(() => {
    return () => resetQuoteFlow();
  }, [resetQuoteFlow]);
  
  // Simplified handlers with fewer state updates and better error handling
  
  const startStandardQuote = useCallback(() => {
    console.log('Starting standard quote flow');
    resetQuoteFlow();
    
    // Initialize with empty params
    initializeQuoteFlow({
      queryParams: new URLSearchParams(),
      onSuccess: () => {
        toast({
          title: 'Standard Quote Started',
          description: 'Your quote has been initialized'
        });
      },
      onError: (error) => {
        console.error('Error starting quote:', error);
        toast({
          title: 'Error',
          description: 'Failed to start the quote',
          variant: 'destructive'
        });
      }
    });
  }, [resetQuoteFlow, initializeQuoteFlow, toast]);
  
  const startPackageQuote = useCallback((packageId: string) => {
    console.log('Starting package quote with ID:', packageId);
    resetQuoteFlow();
    setSelectedPackageId(packageId);
    
    // Get package details for notification
    const pkgDetails = treatmentPackages.find(p => p.id === packageId);
    
    // Set up parameters
    const params = new URLSearchParams();
    params.set('packageId', packageId);
    
    initializeQuoteFlow({
      queryParams: params,
      onSuccess: () => {
        toast({
          title: 'Package Quote Started',
          description: pkgDetails 
            ? `Package "${pkgDetails.name}" has been applied` 
            : `Package ID: ${packageId} has been applied`
        });
      },
      onError: (error) => {
        console.error('Error starting package quote:', error);
        toast({
          title: 'Error',
          description: 'Failed to apply the package',
          variant: 'destructive'
        });
      }
    });
  }, [resetQuoteFlow, initializeQuoteFlow, toast, treatmentPackages]);
  
  const startSpecialOfferQuote = useCallback((offerId: string) => {
    console.log('Starting special offer quote with ID:', offerId);
    resetQuoteFlow();
    setSelectedOfferId(offerId);
    
    // Find offer details for notification
    const offerDetails = specialOffers.find((o: any) => o.id === offerId);
    
    // Set up parameters
    const params = new URLSearchParams();
    params.set('offerId', offerId);
    
    initializeQuoteFlow({
      queryParams: params,
      onSuccess: () => {
        toast({
          title: 'Special Offer Applied',
          description: offerDetails 
            ? `"${offerDetails.title}" offer has been applied` 
            : `Offer ID: ${offerId} has been applied`
        });
      },
      onError: (error) => {
        console.error('Error applying special offer:', error);
        toast({
          title: 'Error',
          description: 'Failed to apply the special offer',
          variant: 'destructive'
        });
      }
    });
  }, [resetQuoteFlow, initializeQuoteFlow, toast, specialOffers]);
  
  const applyPromoCode = useCallback((code: string) => {
    if (!code.trim()) return;
    
    console.log('Applying promo code:', code);
    resetQuoteFlow();
    setCurrentPromoCode(code);
    
    // Set up parameters
    const params = new URLSearchParams();
    params.set('promoCode', code);
    
    initializeQuoteFlow({
      queryParams: params,
      onSuccess: () => {
        toast({
          title: 'Promo Code Applied',
          description: `Promo code "${code}" has been applied to your quote`
        });
      },
      onError: (error) => {
        console.error('Error applying promo code:', error);
        toast({
          title: 'Error',
          description: 'Failed to apply the promo code',
          variant: 'destructive'
        });
      }
    });
  }, [resetQuoteFlow, initializeQuoteFlow, toast]);
  
  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCodeInput.trim()) {
      applyPromoCode(promoCodeInput.trim());
      setPromoCodeInput(''); // Clear input after applying
    }
  };
  
  const clearPromoCode = () => {
    setCurrentPromoCode(null);
    resetQuoteFlow();
    
    toast({
      title: 'Promo Code Cleared',
      description: 'The promo code has been removed'
    });
    
    // Start a fresh quote
    startStandardQuote();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quote System Demo</h1>
            <p className="text-gray-500">
              Streamlined demo with better performance
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="standard">Standard</TabsTrigger>
                <TabsTrigger value="offers">Offers</TabsTrigger>
                <TabsTrigger value="packages">Packages</TabsTrigger>
              </TabsList>
              
              {/* Standard quote tab */}
              <TabsContent value="standard" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-primary" />
                      Standard Quote
                    </CardTitle>
                    <CardDescription>
                      Create a custom quote by selecting individual treatments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={startStandardQuote}
                      className="w-full"
                    >
                      Start New Quote
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Promo code section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Percent className="h-5 w-5 mr-2 text-primary" />
                      Apply Promo Code
                    </CardTitle>
                    <CardDescription>
                      Add a discount code to your quote
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentPromoCode ? (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Active Promo Code</AlertTitle>
                        <AlertDescription className="flex items-center justify-between">
                          <span>{currentPromoCode}</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={clearPromoCode}
                          >
                            Clear Code
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <form onSubmit={handlePromoSubmit} className="flex space-x-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Enter promo code"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value)}
                          />
                        </div>
                        <Button type="submit">Apply</Button>
                      </form>
                    )}
                    
                    <div className="space-y-3 pt-2">
                      <p className="text-sm font-medium">Sample Codes:</p>
                      {promoCodes.map((promo) => (
                        <div
                          key={promo.code}
                          className="border rounded-md p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            setPromoCodeInput(promo.code);
                          }}
                        >
                          <div>
                            <p className="font-medium">{promo.code}</p>
                            <p className="text-xs text-gray-500">{promo.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {promo.type === 'percentage' ? `${promo.discount}%` : `£${promo.discount}`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Special offers tab */}
              <TabsContent value="offers" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-primary" />
                      Special Offers
                    </CardTitle>
                    <CardDescription>
                      Apply special promotions to your dental quote
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {specialOffers.length > 0 ? (
                      specialOffers.map((offer: any) => (
                        <div
                          key={offer.id}
                          className="border rounded-md overflow-hidden hover:border-primary/50 cursor-pointer transition-all"
                          onClick={() => startSpecialOfferQuote(offer.id)}
                        >
                          <div className="p-3">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-medium">{offer.title}</h3>
                              <Badge>
                                {(offer.discount_type === 'percentage')
                                  ? `${offer.discount_value}% off`
                                  : `£${offer.discount_value} off`}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 my-2">
                              {offer.description}
                            </p>
                            <Button size="sm" className="w-full mt-2">
                              Apply This Offer
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p>Loading special offers...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Packages tab */}
              <TabsContent value="packages" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="h-5 w-5 mr-2 text-primary" />
                      Treatment Packages
                    </CardTitle>
                    <CardDescription>
                      Pre-bundled treatments with special package pricing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {treatmentPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="border rounded-md p-4 hover:border-primary/50 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold">{pkg.name}</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            Save {pkg.discount}%
                          </Badge>
                        </div>
                        
                        <div className="my-2">
                          <div className="bg-gray-50 px-2 py-1 rounded text-xs font-mono mb-2">
                            ID: {pkg.id}
                          </div>
                          <p className="text-sm text-gray-600">{pkg.description}</p>
                        </div>
                        
                        <div className="space-y-2 my-3">
                          <p className="text-sm font-medium">Includes:</p>
                          <ul className="space-y-1">
                            {pkg.treatments.map((treatment, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <Check className="h-4 w-4 mr-1 mt-0.5 text-green-500 flex-shrink-0" />
                                <span>{treatment}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded mb-3">
                          <div className="flex justify-between">
                            <span className="text-sm">Package price:</span>
                            <span className="font-bold">£{pkg.price}</span>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => startPackageQuote(pkg.id)}
                          className="w-full"
                        >
                          Select This Package
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right quote area */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Quote Builder</CardTitle>
                <CardDescription>
                  Build and customize dental treatment quotes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[600px]">
                  {isQuoteInitialized ? (
                    <LazyQuoteFlow 
                      packageId={selectedPackageId || undefined}
                      specialOfferId={selectedOfferId || undefined}
                      promoCode={currentPromoCode || undefined}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No Quote Started</h3>
                      <p className="text-gray-500 mb-6">
                        Select an option from the left or use the button below
                      </p>
                      
                      <Button 
                        onClick={startStandardQuote}
                        className="w-full max-w-md mx-auto"
                      >
                        Start a New Quote
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedQuoteDemo;