import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuoteBuilder, Treatment, Package, Addon } from '@/hooks/use-quote-builder';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { trackEvent } from '@/lib/analytics';
import { Clipboard, X, Plus, Tag, Sparkles } from 'lucide-react';

export interface QuoteBuilderProps {
  initialData?: {
    treatments?: Treatment[];
    packages?: Package[];
    addons?: Addon[];
    promoCode?: string;
  };
  availableTreatments: Treatment[];
  availablePackages: Package[];
  availableAddons: Addon[];
  onSave?: (quoteId: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function QuoteBuilder({
  initialData,
  availableTreatments,
  availablePackages,
  availableAddons,
  onSave,
}: QuoteBuilderProps) {
  const { toast } = useToast();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    quote,
    addTreatment,
    removeTreatment,
    addPackage,
    removePackage,
    addAddon,
    removeAddon,
    applyPromoCode,
    removePromoCode,
    saveQuote
  } = useQuoteBuilder({
    treatments: initialData?.treatments || [],
    packages: initialData?.packages || [],
    addons: initialData?.addons || [],
    promoCode: initialData?.promoCode || null,
  });
  
  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a promo code',
        variant: 'destructive',
      });
      return;
    }
    
    setIsApplyingPromo(true);
    try {
      const result = await applyPromoCode(promoCodeInput);
      
      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      
      if (result.success) {
        setPromoCodeInput('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply promo code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };
  
  const handleSaveQuote = async () => {
    if (quote.treatments.length === 0 && quote.packages.length === 0) {
      toast({
        title: 'Cannot save empty quote',
        description: 'Please add at least one treatment or package to your quote.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const result = await saveQuote();
      
      if (result.success) {
        toast({
          title: 'Quote saved successfully',
          description: 'Your quote has been saved and can be accessed later.',
          variant: 'default',
        });
        
        if (onSave && result.quoteId) {
          onSave(result.quoteId);
        }
      } else {
        toast({
          title: 'Error saving quote',
          description: 'There was a problem saving your quote. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Build Your Dental Quote</CardTitle>
              <CardDescription>
                Select treatments, packages, and add-ons to create your personalized quote
              </CardDescription>
            </CardHeader>
            
            <Tabs defaultValue="treatments">
              <CardContent>
                <TabsList className="mb-4">
                  <TabsTrigger value="treatments">Treatments</TabsTrigger>
                  <TabsTrigger value="packages">Packages</TabsTrigger>
                  <TabsTrigger value="addons">Add-ons</TabsTrigger>
                </TabsList>
                
                <TabsContent value="treatments" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableTreatments.map((treatment) => (
                      <Card key={treatment.id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-lg">{treatment.name}</CardTitle>
                          <CardDescription className="text-sm line-clamp-2">
                            {treatment.description || 'No description available'}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-between items-center p-4 pt-2">
                          <div className="font-semibold">{formatCurrency(treatment.price)}</div>
                          <Button 
                            size="sm"
                            onClick={() => addTreatment(treatment)}
                            disabled={quote.treatments.some(t => t.id === treatment.id)}
                          >
                            {quote.treatments.some(t => t.id === treatment.id) ? 'Added' : 'Add'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="packages" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availablePackages.map((pkg) => (
                      <Card key={pkg.id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          <CardDescription className="text-sm line-clamp-2">
                            {pkg.description || `Package includes ${pkg.treatments.length} treatments`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 pb-2">
                          <div className="flex flex-wrap gap-1">
                            {pkg.treatments.map((treatmentId) => {
                              const treatment = availableTreatments.find(t => t.id === treatmentId);
                              return treatment ? (
                                <Badge key={treatmentId} variant="outline" className="text-xs">
                                  {treatment.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center p-4 pt-2">
                          <div className="font-semibold">{formatCurrency(pkg.price)}</div>
                          <Button 
                            size="sm"
                            onClick={() => addPackage(pkg)}
                            disabled={quote.packages.some(p => p.id === pkg.id)}
                          >
                            {quote.packages.some(p => p.id === pkg.id) ? 'Added' : 'Add'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="addons" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableAddons.map((addon) => (
                      <Card key={addon.id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-lg">{addon.name}</CardTitle>
                          <CardDescription className="text-sm line-clamp-2">
                            {addon.description || 'No description available'}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-between items-center p-4 pt-2">
                          <div className="font-semibold">{formatCurrency(addon.price)}</div>
                          <Button 
                            size="sm"
                            onClick={() => addAddon(addon)}
                            disabled={quote.addons.some(a => a.id === addon.id)}
                          >
                            {quote.addons.some(a => a.id === addon.id) ? 'Added' : 'Add'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
        
        <div className="lg:w-1/3">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Your Quote Summary</CardTitle>
              <CardDescription>Review your selected items</CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Treatments */}
              {quote.treatments.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Treatments</h3>
                  <ul className="space-y-2">
                    {quote.treatments.map((treatment) => (
                      <li key={treatment.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <span>{treatment.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {formatCurrency(treatment.price)}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeTreatment(treatment.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Packages */}
              {quote.packages.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Packages</h3>
                  <ul className="space-y-2">
                    {quote.packages.map((pkg) => (
                      <li key={pkg.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <span>{pkg.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {formatCurrency(pkg.price)}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removePackage(pkg.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Add-ons */}
              {quote.addons.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Add-ons</h3>
                  <ul className="space-y-2">
                    {quote.addons.map((addon) => (
                      <li key={addon.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <span>{addon.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {formatCurrency(addon.price)}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeAddon(addon.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Empty state */}
              {quote.treatments.length === 0 && quote.packages.length === 0 && quote.addons.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <p className="mb-2">Your quote is empty</p>
                  <p className="text-sm">Add treatments, packages, or add-ons to see them here</p>
                </div>
              )}
              
              {/* Promo code input */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    disabled={isApplyingPromo || !!quote.promotion}
                  />
                  <Button
                    onClick={handleApplyPromoCode}
                    disabled={isApplyingPromo || !promoCodeInput.trim() || !!quote.promotion}
                  >
                    Apply
                  </Button>
                </div>
                
                {/* Active promotion */}
                {quote.promotion && (
                  <div className="bg-muted p-3 rounded-md mb-4 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={removePromoCode}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{quote.promotion.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{quote.promotion.description}</p>
                    <div className="text-sm flex items-center">
                      <Sparkles className="h-3 w-3 text-primary mr-1" />
                      <span>
                        {quote.promotion.discount_type === 'percentage' 
                          ? `${quote.promotion.discount_value}% off` 
                          : `${formatCurrency(quote.promotion.discount_value)} off`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Totals */}
              {(quote.treatments.length > 0 || quote.packages.length > 0 || quote.addons.length > 0) && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(quote.subtotal)}</span>
                  </div>
                  
                  {quote.discount > 0 && (
                    <div className="flex justify-between mb-2 text-primary">
                      <span>Discount:</span>
                      <span>-{formatCurrency(quote.discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(quote.total)}</span>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleSaveQuote}
                disabled={
                  isSaving || 
                  (quote.treatments.length === 0 && quote.packages.length === 0 && quote.addons.length === 0)
                }
              >
                {isSaving ? 'Saving...' : 'Save Quote'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}