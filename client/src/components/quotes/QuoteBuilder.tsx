import React, { useState } from 'react';
import { useQuoteBuilder } from '@/hooks/use-quote-builder';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from '@/lib/analytics';

interface QuoteBuilderProps {
  onComplete?: () => void;
}

export function QuoteBuilder({ onComplete }: QuoteBuilderProps) {
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
  
  const [promoCode, setPromoCode] = useState('');
  const [activeTab, setActiveTab] = useState('treatments');
  
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
  
  return (
    <div className="quote-builder space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Build Your Dental Treatment Quote</h2>
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
                        <Badge>{formatCurrency(treatment.price)}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 flex-grow">{treatment.description}</p>
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
            </TabsContent>
            
            {/* Packages Tab */}
            <TabsContent value="packages" className="space-y-4">
              <h3 className="text-xl font-semibold">Treatment Packages</h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {packages && packages.map((pkg: any) => (
                    <Card key={pkg.id} className="p-4 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{pkg.name}</h4>
                        <Badge variant="outline">
                          {pkg.price ? formatCurrency(pkg.price) : "Price on request"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{pkg.description}</p>
                      <div className="mb-4">
                        <h5 className="text-xs font-semibold mb-1">Includes:</h5>
                        <ul className="text-xs text-gray-500 list-disc pl-4">
                          {pkg.treatments && pkg.treatments.map((treatment: any, index: number) => (
                            <li key={index}>{treatment.name}</li>
                          ))}
                        </ul>
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
                        <Badge variant="secondary">{formatCurrency(addon.price)}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 flex-grow">{addon.description}</p>
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
              
              {quote.discount > 0 && (
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
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}