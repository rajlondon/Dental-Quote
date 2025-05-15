import React, { useState, useEffect } from 'react';
import { useQuoteBuilder } from '@/hooks/use-quote-builder';
import { useSpecialOffers } from '@/hooks/use-special-offers';
import { useTreatmentPackages } from '@/hooks/use-treatment-packages';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from '@/lib/analytics';
import { useQuoteFlow } from '@/contexts/QuoteFlowContext';
import { Package as PackageIcon, CheckCircle, Sparkles, Gift } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SpecialOffersSelector } from '@/components/offers/SpecialOffersSelector';
import { TreatmentPackageSelector } from '@/components/packages/TreatmentPackageSelector';
import { SpecialOffer, TreatmentPackage } from '@shared/offer-types';

interface QuoteBuilderProps {
  onComplete?: (quoteData: any) => void;
  onCancel?: () => void;
  quoteId?: string | number;
  specialOfferId?: string;
  promoCode?: string;
  packageId?: string;
}

export function QuoteBuilder({ 
  onComplete, 
  onCancel,
  quoteId,
  specialOfferId,
  promoCode: initialPromoCode,
  packageId
}: QuoteBuilderProps) {
  const { 
    quote, 
    addTreatment, 
    removeTreatment, 
    addPackage,
    removePackage,
    addAddon,
    removeAddon,
    applyPromoCode,
    resetQuote,
    isLoading,
    treatments,
    packages,
    addons
  } = useQuoteBuilder();
  
  // Special offers integration
  const { 
    availableOffers, 
    selectedOffer, 
    discountAmount: offerDiscountAmount,
    selectOffer,
    isLoading: isLoadingOffers
  } = useSpecialOffers(quote.treatments);
  
  // Treatment packages integration
  const {
    availablePackages,
    selectedPackage: selectedTreatmentPackage,
    selectPackage,
    isLoading: isLoadingPackages
  } = useTreatmentPackages(quote.treatments);
  
  const [promoCode, setPromoCode] = useState(initialPromoCode || '');
  const [activeTab, setActiveTab] = useState(packageId ? 'packages' : 'treatments');
  const [initialPackageAdded, setInitialPackageAdded] = useState(false);
  
  // Handle initial promo code if provided
  useEffect(() => {
    if (initialPromoCode && !quote.promoCode) {
      (async () => {
        const result = await applyPromoCode(initialPromoCode);
        if (result.success) {
          toast({
            title: "Promo Code Applied",
            description: result.message,
          });
          trackEvent('automatic_promo_code_applied', 'promotion', initialPromoCode);
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          });
          trackEvent('automatic_promo_code_error', 'promotion_error', result.message);
        }
      })();
    }
  }, [initialPromoCode, quote.promoCode, applyPromoCode]);
  
  // Handle initial packageId if provided
  useEffect(() => {
    if (packageId && packages && !initialPackageAdded) {
      const packageToAdd = packages.find((pkg: any) => pkg.id === packageId);
      if (packageToAdd) {
        addPackage(packageToAdd);
        // Use selectPackage from useTreatmentPackages hook
        selectPackage(packageId);
        setInitialPackageAdded(true);
        toast({
          title: "Package Selected",
          description: `Added ${packageToAdd.name} to your quote`,
        });
        trackEvent('package_auto_selected', 'package', packageToAdd.name);
      }
    }
  }, [packageId, packages, initialPackageAdded, addPackage, selectPackage]);
  
  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive"
      });
      return;
    }
    
    const result = await applyPromoCode(promoCode);
    
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      trackEvent('promo_code_applied', 'promotion', promoCode);
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive"
      });
      trackEvent('promo_code_error', 'promotion_error', result.message);
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Modified onComplete handler to add test metadata 
  const handleComplete = () => {
    if (onComplete) {
      const enrichedQuote = {
        ...quote,
        testMetadata: {
          containsPackage: packageId ? true : false,
          hasPromoCode: initialPromoCode ? true : false,
          packageId: packageId,
          promoCode: initialPromoCode,
          timestamp: new Date().toISOString()
        }
      };
      onComplete(enrichedQuote);
    }
  };
  
  return (
    <div className="quote-builder space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Build Your Dental Treatment Quote</h2>
        <div className="flex gap-2">
          {onCancel && (
            <Button 
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={resetQuote}
            disabled={
              (!quote.treatments || quote.treatments.length === 0) && 
              (!quote.packages || quote.packages.length === 0) && 
              (!quote.addons || quote.addons.length === 0)
            }
          >
            Reset Quote
          </Button>
        </div>
      </div>
      
      {/* Package notification */}
      {selectedTreatmentPackage && (
        <Alert className="bg-blue-50 border-blue-200">
          <PackageIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You are viewing the <span className="font-semibold">{selectedTreatmentPackage.title}</span> package with {selectedTreatmentPackage.includedTreatments?.length || 0} treatments.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Selection tabs */}
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="addons">Add-ons</TabsTrigger>
            </TabsList>
            
            {/* Treatments Tab */}
            <TabsContent value="treatments" className="space-y-4">
              <h3 className="text-xl font-semibold">Select Treatments</h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {treatments && treatments.map((treatment: any) => (
                    <Card key={treatment.id} className="p-4 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{treatment.name}</h4>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-2.5 py-0.5">
                          {formatCurrency(treatment.price)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 flex-grow">{treatment.description}</p>
                      <div className="bg-green-50 p-2 rounded-md my-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Treatment Price:</span>
                          <span className="font-bold text-green-700">{formatCurrency(treatment.price)}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addTreatment(treatment)}
                          className="w-full"
                        >
                          Add to Quote
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Special Offers Section */}
              {!isLoadingOffers && availableOffers.length > 0 && (
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Special Offers Available
                  </h3>
                  
                  <SpecialOffersSelector 
                    offers={availableOffers}
                    selectedOfferId={selectedOffer?.id || null}
                    onChange={(offerId: string | null) => selectOffer(offerId || '')}
                  />
                  
                  {selectedOffer && offerDiscountAmount > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <p className="text-sm text-yellow-800 flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        <span>You're saving <strong>{formatCurrency(offerDiscountAmount)}</strong> with this offer!</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Packages Tab */}
            <TabsContent value="packages" className="space-y-4">
              <h3 className="text-xl font-semibold">Treatment Packages</h3>
              
              {isLoading || isLoadingPackages ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Legacy packages (from the existing system) */}
                  {packages && packages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {packages.map((pkg: any) => (
                        <Card key={pkg.id} className="p-4 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{pkg.name}</h4>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-2.5 py-0.5">
                              {pkg.price ? formatCurrency(pkg.price) : "Price on request"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{pkg.description}</p>
                          <div className="mb-4">
                            <h5 className="text-xs font-semibold mb-1">Includes:</h5>
                            <ul className="text-xs text-gray-500 list-disc pl-4">
                              {pkg.treatments && pkg.treatments.map((treatment: any, index: number) => (
                                <li key={index} className="flex justify-between">
                                  <span>{treatment.name}</span>
                                  <span className="font-medium">{formatCurrency(treatment.price)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-md mb-3">
                            <div className="flex justify-between items-center text-sm font-medium">
                              <span>Total Package Price:</span>
                              <span className="text-blue-700">{formatCurrency(pkg.price)}</span>
                            </div>
                          </div>
                          <div className="mt-auto">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => addPackage(pkg)}
                              className="w-full"
                            >
                              Add Package
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {/* New treatment packages system */}
                  {availablePackages && availablePackages.length > 0 && (
                    <div className="mt-8 pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <PackageIcon className="h-5 w-5 text-blue-500" />
                        Recommended Treatment Packages
                      </h3>
                      
                      <TreatmentPackageSelector 
                        packages={availablePackages}
                        selectedPackageId={selectedTreatmentPackage?.id || null}
                        onChange={(packageId: string | null) => selectPackage(packageId || '')}
                      />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Add-ons Tab */}
            <TabsContent value="addons" className="space-y-4">
              <h3 className="text-xl font-semibold">Additional Services</h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addons && addons.map((addon: any) => (
                    <Card key={addon.id} className="p-4 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{addon.name}</h4>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-2.5 py-0.5">
                          {formatCurrency(addon.price)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 flex-grow">{addon.description}</p>
                      <div className="bg-purple-50 p-2 rounded-md my-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Addon Price:</span>
                          <span className="font-bold text-purple-700">{formatCurrency(addon.price)}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addAddon(addon)}
                          className="w-full"
                        >
                          Add to Quote
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right column: Quote summary */}
        <div>
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Quote Summary</h3>
            
            {/* Selected items */}
            <div className="space-y-4 mb-6">
              {/* Treatments */}
              {quote.treatments && quote.treatments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Treatments</h4>
                  <ul className="space-y-2">
                    {quote.treatments.map((item, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span>{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span>{formatCurrency(item.price)}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => removeTreatment(item)}
                          >
                            <span className="sr-only">Remove</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Packages */}
              {quote.packages && quote.packages.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Packages</h4>
                  <ul className="space-y-2">
                    {quote.packages.map((item, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span>{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span>{item.price ? formatCurrency(item.price) : "Price on request"}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => removePackage(item)}
                          >
                            <span className="sr-only">Remove</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Add-ons */}
              {quote.addons && quote.addons.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Add-ons</h4>
                  <ul className="space-y-2">
                    {quote.addons.map((item, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span>{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span>{formatCurrency(item.price)}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => removeAddon(item)}
                          >
                            <span className="sr-only">Remove</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {(!quote.treatments || quote.treatments.length === 0) && 
               (!quote.packages || quote.packages.length === 0) && 
               (!quote.addons || quote.addons.length === 0) && (
                <p className="text-gray-500 text-sm italic">No items added to quote yet</p>
              )}
            </div>
            
            <Separator className="my-4" />
            
            {/* Promo code */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Promo Code</h4>
              <form onSubmit={handlePromoSubmit} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    disabled={isLoading || !!quote.promoCode}
                  />
                </div>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={isLoading || !!quote.promoCode}
                >
                  Apply
                </Button>
              </form>
              {quote.promoCode && (
                <div className="mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50">
                      {quote.promoCode}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        resetQuote();
                        setPromoCode('');
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              
              {/* Always show any available discount information with enhanced visibility */}
              {quote.promoCode && (
                <div 
                  className="flex flex-col text-sm text-green-600 font-semibold bg-green-50 p-3 rounded-md border border-green-200 mt-2 mb-2"
                  data-testid="promo-discount-display"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <PackageIcon className="h-4 w-4 mr-2" />
                      <span>Promo Code Applied: <strong>{quote.promoCode}</strong></span>
                    </div>
                    <Badge variant="outline" className="bg-green-100">
                      {quote.discountType === 'percentage' && quote.discountValue 
                        ? `${quote.discountValue}% off` 
                        : 'Discount'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Discount Amount:</span>
                    <span className="font-bold">-{formatCurrency(quote.promoDiscount || 0)}</span>
                  </div>
                </div>
              )}
              
              {/* Show offer discount separately if it exists */}
              {(quote.offerDiscount || 0) > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>Special Offer Discount</span>
                  <span>-{formatCurrency(quote.offerDiscount || 0)}</span>
                </div>
              )}
              
              {/* For backward compatibility - show total discount if nothing specific */}
              {quote.discount > 0 && !quote.promoCode && !(quote.offerDiscount || 0) && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(quote.discount)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center font-bold">
                <span>Total</span>
                <span>{formatCurrency(quote.total)}</span>
              </div>
              
              {/* Complete Button */}
              <Button 
                className="w-full mt-4" 
                onClick={handleComplete}
                disabled={
                  (!quote.treatments || quote.treatments.length === 0) && 
                  (!quote.packages || quote.packages.length === 0)
                }
              >
                Continue to Summary
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}