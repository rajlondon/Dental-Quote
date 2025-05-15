import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Package,
  Tag,
  Sparkles,
  Tags,
  Percent,
  ChevronRight,
  PlusCircle,
  Check,
  Info,
  Home
} from 'lucide-react';
import { Link } from 'wouter';
import QuoteSystemDemoNav from '@/components/navigation/QuoteSystemDemoNav';
import LazyQuoteFlow from '@/components/quotes/LazyQuoteFlow';
import { useEnhancedQuoteFlow } from '@/contexts/EnhancedQuoteFlowContext';
import { useSpecialOffers } from '@/components/SpecialOffersProvider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const { toast } = useToast();
  const { 
    resetQuoteFlow, 
    isQuoteInitialized,
    initializeQuoteFlow,
    isSpecialOfferFlow,
    isPackageFlow 
  } = useEnhancedQuoteFlow();
  // Get special offers from context
  const specialOffersContext = useSpecialOffers();
  const specialOffers = specialOffersContext?.offers || [];
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [currentPromoCode, setCurrentPromoCode] = useState<string | null>(null);
  const [currentPackageId, setCurrentPackageId] = useState<string | null>(null);
  const [currentOfferId, setCurrentOfferId] = useState<string | null>(null);

  // Sample treatment packages
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

  const handleStartStandardQuote = () => {
    resetQuoteFlow();
    setActiveDemo('standard');
    setCurrentPackageId(null);
    setCurrentOfferId(null);
    
    // Initialize a standard quote with empty params
    initializeQuoteFlow({
      queryParams: new URLSearchParams(),
      onSuccess: () => {
        toast({
          title: 'Standard Quote Flow Started',
          description: 'You can now select treatments and build your quote.'
        });
      }
    });
  };

  const handleStartPackageQuote = (packageId: string) => {
    resetQuoteFlow();
    setActiveDemo('package');
    setCurrentPackageId(packageId);
    setCurrentOfferId(null);
    
    // Initialize with package params
    const params = new URLSearchParams();
    params.set('packageId', packageId);
    
    initializeQuoteFlow({
      queryParams: params,
      onSuccess: () => {
        toast({
          title: 'Package Quote Started',
          description: `Package ${packageId} selected. Continue with the quote flow.`
        });
      }
    });
  };

  const handleStartSpecialOfferQuote = (offerId: string) => {
    const offer = specialOffers.find((o: any) => o.id === offerId);
    if (offer) {
      resetQuoteFlow();
      setActiveDemo('special_offer');
      setCurrentOfferId(offerId);
      setCurrentPackageId(null);
      
      // Initialize with special offer params
      const params = new URLSearchParams();
      params.set('offerId', offerId);
      
      initializeQuoteFlow({
        queryParams: params,
        onSuccess: () => {
          toast({
            title: 'Special Offer Applied',
            description: `"${offer.title}" offer has been applied to your quote.`
          });
        }
      });
    }
  };

  const handleApplyPromoCode = () => {
    if (!promoCodeInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a promo code',
        variant: 'destructive'
      });
      return;
    }

    // Set current promo code and reset any active flows
    setCurrentPromoCode(promoCodeInput);
    setCurrentPackageId(null);
    setCurrentOfferId(null);
    resetQuoteFlow();
    
    // Initialize with promo code params
    const params = new URLSearchParams();
    params.set('promoCode', promoCodeInput);
    
    initializeQuoteFlow({
      queryParams: params,
      onSuccess: () => {
        toast({
          title: 'Promo Code Applied',
          description: `Promo code "${promoCodeInput}" has been applied.`
        });
        setPromoCodeInput('');
      }
    });
  };

  const handleClearPromoCode = () => {
    setCurrentPromoCode(null);
    resetQuoteFlow();
    toast({
      title: 'Promo Code Cleared',
      description: 'The promo code has been removed from your quote.'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quote System Demo</h1>
            <p className="text-gray-500">
              Explore all features of the dental quote system in one place
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>

        <QuoteSystemDemoNav />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="standard">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="standard">Standard</TabsTrigger>
                <TabsTrigger value="offers">Special Offers</TabsTrigger>
                <TabsTrigger value="packages">Packages</TabsTrigger>
              </TabsList>

              <TabsContent value="standard" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Tags className="h-5 w-5 mr-2 text-primary" />
                      Standard Quote
                    </CardTitle>
                    <CardDescription>
                      Create a custom quote by selecting individual treatments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleStartStandardQuote}
                      className="w-full"
                    >
                      Start New Quote
                    </Button>
                  </CardContent>
                </Card>

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
                            onClick={handleClearPromoCode}
                          >
                            Clear Code
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Enter promo code"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleApplyPromoCode}>Apply</Button>
                      </div>
                    )}

                    <div className="space-y-3 pt-2">
                      <p className="text-sm font-medium">Sample Codes:</p>
                      {promoCodes.map((promo) => (
                        <div
                          key={promo.code}
                          className="border rounded-md p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                          onClick={() => setPromoCodeInput(promo.code)}
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
                        >
                          {(offer.bannerImage || offer.banner_image) && (
                            <div className="h-32 overflow-hidden">
                              <img
                                src={offer.bannerImage || offer.banner_image || '/images/default-offer.png'}
                                alt={offer.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-3">
                            <h3 className="font-medium">{offer.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 my-1">
                              {offer.description}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex flex-col gap-1">
                                <Badge className="self-start">
                                  {(offer.discountType || offer.discount_type) === 'percentage'
                                    ? `${offer.discountValue || offer.discount_value}% off`
                                    : `£${offer.discountValue || offer.discount_value} off`}
                                </Badge>
                                <div className="text-xs text-gray-500">
                                  Regular price: £{offer.treatment_price_gbp || 150}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleStartSpecialOfferQuote(offer.id)}
                              >
                                Apply Offer
                              </Button>
                            </div>
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
                          <Badge variant="secondary">
                            Save {pkg.discount}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 mb-3">
                          {pkg.description}
                        </p>
                        <div className="space-y-2 mb-4">
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
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Package price:</p>
                            <p className="font-bold text-lg">£{pkg.price}</p>
                          </div>
                          <Button
                            onClick={() => handleStartPackageQuote(pkg.id)}
                            className="flex items-center"
                          >
                            Select
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Quote Builder</CardTitle>
                <CardDescription>
                  {activeDemo === 'standard' && 'Build your custom dental quote by selecting treatments'}
                  {activeDemo === 'package' && 'Package selected - customize your package options'}
                  {activeDemo === 'special_offer' && 'Special offer applied - continue with your quote'}
                  {!activeDemo && 'Select an option from the left to start building your quote'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isQuoteInitialized ? (
                  <LazyQuoteFlow 
                    packageId={activeDemo === 'package' && currentPackageId ? currentPackageId : undefined}
                    specialOfferId={activeDemo === 'special_offer' && currentOfferId ? currentOfferId : undefined}
                    promoCode={currentPromoCode || undefined}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Quote Started</h3>
                    <p className="text-gray-500 mb-6">
                      Select an option from the left to begin building your dental quote
                    </p>
                    <Button onClick={handleStartStandardQuote}>
                      Start a Standard Quote
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteSystemDemo;