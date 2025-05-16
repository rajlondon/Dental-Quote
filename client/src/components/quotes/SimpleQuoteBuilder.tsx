import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Percent, 
  Tag, 
  Sparkles, 
  Info, 
  Check, 
  X,
  Plus,
  Minus,
  Mail
} from 'lucide-react';
import { useSimpleQuote, Treatment, Package as PackageType, SpecialOffer } from '@/contexts/SimpleQuoteContext';
import { formatCurrency } from '@/utils/currency-formatter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Simple Quote Builder
 * 
 * A streamlined, reliable quote builder component that connects to our backend
 * services while maintaining a simple state management approach.
 */
const SimpleQuoteBuilder: React.FC = () => {
  // State for UI
  const [activeTab, setActiveTab] = useState('treatments');
  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  
  // Get context data and handlers
  const { 
    quote, 
    isLoading,
    error,
    treatments,
    packages,
    specialOffers,
    isTreatmentsLoading,
    isPackagesLoading,
    isOffersLoading,
    handleSelectTreatment,
    handleSelectPackage,
    handleApplyOffer,
    handleApplyPromoCode,
    handleClearPromoCode,
    handleReset,
    handleUpdateQuantity,
    handleSaveQuote,
    handleEmailQuote,
    calculateTotals
  } = useSimpleQuote();
  
  // Calculate quote totals
  const totals = calculateTotals();
  
  // Handle promo code application
  const onApplyPromoCode = async () => {
    if (!promoInput.trim()) return;
    
    setIsApplyingPromo(true);
    try {
      await handleApplyPromoCode(promoInput.trim());
      setPromoInput(''); // Clear input on success
    } finally {
      setIsApplyingPromo(false);
    }
  };
  
  // Handle email submission
  const onSendEmail = async () => {
    if (await handleEmailQuote(emailInput)) {
      setIsEmailDialogOpen(false);
      setEmailInput('');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dental Quote Builder</h1>
        <p className="text-gray-600">
          Create a custom dental treatment quote with special offers and promo codes
        </p>
        
        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Direct promo code application section */}
        <div className="mt-4 p-4 border rounded-md bg-gray-50 max-w-xl">
          <h3 className="text-lg font-medium mb-2">Promo Code</h3>
          <div className="flex gap-2">
            <Input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Enter promo code"
              className="flex-1"
              disabled={!!quote.promoCode || isApplyingPromo || isLoading}
            />
            {quote.promoCode ? (
              <Button 
                onClick={handleClearPromoCode} 
                variant="destructive"
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            ) : (
              <Button 
                onClick={onApplyPromoCode} 
                disabled={isApplyingPromo || !promoInput.trim() || isLoading} 
                variant="default"
              >
                {isApplyingPromo ? 'Applying...' : 'Apply'}
              </Button>
            )}
          </div>
          {quote.promoCode && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700 text-sm">
                Promo code <span className="font-semibold">{quote.promoCode}</span> applied: {formatCurrency(quote.promoDiscount)} discount
              </p>
            </div>
          )}
          <div className="mt-2 text-xs text-gray-500">
            Enter a promotional code to receive special discounts
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button onClick={handleReset} variant="outline" disabled={isLoading}>
            Reset Quote
          </Button>
          <Button 
            onClick={() => handleSaveQuote()} 
            variant="default" 
            disabled={isLoading || (quote.treatments.length === 0 && !quote.selectedPackage)}
          >
            Save Quote
          </Button>
          <Button 
            onClick={() => setIsEmailDialogOpen(true)} 
            variant="outline" 
            disabled={isLoading || (quote.treatments.length === 0 && !quote.selectedPackage)}
          >
            <Mail className="h-4 w-4 mr-1" /> Email Quote
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Selectors */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="treatments" className="flex-1">
                <Tag className="h-4 w-4 mr-1" /> Treatments
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex-1">
                <Package className="h-4 w-4 mr-1" /> Packages
              </TabsTrigger>
              <TabsTrigger value="offers" className="flex-1">
                <Sparkles className="h-4 w-4 mr-1" /> Special Offers
              </TabsTrigger>
            </TabsList>
            
            {/* Treatments Tab */}
            <TabsContent value="treatments" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Select Treatments</h2>
              
              {isTreatmentsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </Card>
                  ))}
                </div>
              ) : treatments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {treatments.map((treatment) => (
                    <Card 
                      key={treatment.id} 
                      className={`p-4 cursor-pointer transition-colors hover:border-primary/50 ${
                        quote.treatments.some(t => t.id === treatment.id) 
                          ? 'border-2 border-primary bg-primary/5' 
                          : ''
                      }`} 
                      onClick={() => handleSelectTreatment(treatment)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{treatment.name}</h3>
                          <p className="text-sm text-gray-600">{treatment.description}</p>
                        </div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(treatment.price)}
                        </div>
                      </div>
                      
                      {/* Quantity controls - only show for selected treatments */}
                      {quote.treatments.some(t => t.id === treatment.id) && (
                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                          <span className="text-sm font-medium">Quantity:</span>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentTreatment = quote.treatments.find(t => t.id === treatment.id);
                                if (currentTreatment) {
                                  handleUpdateQuantity(treatment.id, (currentTreatment.quantity || 1) - 1);
                                }
                              }}
                              disabled={(quote.treatments.find(t => t.id === treatment.id)?.quantity || 1) <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-5 text-center">
                              {quote.treatments.find(t => t.id === treatment.id)?.quantity || 1}
                            </span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentTreatment = quote.treatments.find(t => t.id === treatment.id);
                                if (currentTreatment) {
                                  handleUpdateQuantity(treatment.id, (currentTreatment.quantity || 1) + 1);
                                }
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No treatments available</p>
                </div>
              )}
            </TabsContent>
            
            {/* Packages Tab */}
            <TabsContent value="packages" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Treatment Packages</h2>
              
              {isPackagesLoading ? (
                <div className="grid grid-cols-1 gap-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-5 w-2/3 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-4/5 mb-2" />
                      <Skeleton className="h-20 w-full mt-4" />
                    </Card>
                  ))}
                </div>
              ) : packages.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {packages.map((pkg) => (
                    <Card 
                      key={pkg.id} 
                      className={`p-4 cursor-pointer transition-colors hover:border-primary/50 ${
                        quote.selectedPackage?.id === pkg.id 
                          ? 'border-2 border-primary bg-primary/5' 
                          : ''
                      }`} 
                      onClick={() => handleSelectPackage(pkg)}
                    >
                      <div className="mb-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-lg">{pkg.name}</h3>
                          <div>
                            <div className="text-lg font-semibold">{formatCurrency(pkg.price)}</div>
                            <div className="text-sm text-green-600">Save {formatCurrency(pkg.savings)}</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{pkg.description}</p>
                      </div>
                      <div className="mt-2 border-t pt-2">
                        <h4 className="text-sm font-medium mb-1">Included Treatments:</h4>
                        <ul className="text-sm">
                          {pkg.treatments.map(treatment => (
                            <li key={treatment.id} className="flex justify-between">
                              <span>{treatment.name}</span>
                              <span className="text-gray-600">{formatCurrency(treatment.price)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No packages available</p>
                </div>
              )}
            </TabsContent>
            
            {/* Special Offers Tab */}
            <TabsContent value="offers" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Special Offers</h2>
              
              {isOffersLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-5 w-2/3 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <Skeleton className="h-8 w-1/3" />
                    </Card>
                  ))}
                </div>
              ) : specialOffers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {specialOffers.map((offer) => (
                    <Card 
                      key={offer.id} 
                      className={`overflow-hidden cursor-pointer transition-colors hover:border-primary/50 ${
                        quote.appliedOffer?.id === offer.id 
                          ? 'border-2 border-primary' 
                          : ''
                      }`} 
                      onClick={() => handleApplyOffer(offer)}
                    >
                      {offer.banner_image && (
                        <div className="h-32 bg-gray-100 overflow-hidden">
                          <img 
                            src={offer.banner_image} 
                            alt={offer.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-medium">{offer.title}</h3>
                          <Badge>
                            {(offer.discount_type === 'percentage')
                              ? `${offer.discount_value}% off`
                              : `${formatCurrency(offer.discount_value)} off`}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 my-2">
                          {offer.description}
                        </p>
                        <Button size="sm" className="w-full mt-2">
                          {quote.appliedOffer?.id === offer.id ? 'Remove Offer' : 'Apply This Offer'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No special offers available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right side - Quote Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
              <CardDescription>
                Your selected dental treatments and total cost
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-16 w-full mt-4" />
                </div>
              ) : quote.treatments.length === 0 && !quote.selectedPackage ? (
                <div className="text-center py-6 text-gray-500">
                  <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>Select treatments or a package to create your quote</p>
                </div>
              ) : (
                <>
                  {/* Display selected package */}
                  {quote.selectedPackage && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Selected Package:</h3>
                      <div className="bg-primary/5 p-3 rounded border border-primary/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{quote.selectedPackage.name}</p>
                            <p className="text-sm text-gray-600">{quote.selectedPackage.description}</p>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(quote.selectedPackage.price)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-green-600">
                          Savings: {formatCurrency(quote.selectedPackage.savings)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Display selected treatments */}
                  {quote.treatments.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Selected Treatments:</h3>
                      <ul className="space-y-2">
                        {quote.treatments.map(treatment => (
                          <li key={treatment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span>{treatment.name}</span>
                              {(treatment.quantity || 1) > 1 && (
                                <span className="text-sm text-gray-500 ml-1">
                                  × {treatment.quantity}
                                </span>
                              )}
                            </div>
                            <span className="font-medium">
                              {formatCurrency(treatment.price * (treatment.quantity || 1))}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Display applied offer */}
                  {quote.appliedOffer && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Applied Offer:</h3>
                      <div className="bg-blue-50 p-3 rounded border border-blue-100">
                        <p className="font-medium">{quote.appliedOffer.title}</p>
                        <p className="text-sm text-gray-600">{quote.appliedOffer.description}</p>
                        <p className="text-sm text-blue-700 mt-1">
                          {quote.appliedOffer.discount_type === 'percentage' 
                            ? `${quote.appliedOffer.discount_value}% off` 
                            : `${formatCurrency(quote.appliedOffer.discount_value)} off`
                          }
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Display applied promo code */}
                  {quote.promoCode && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Applied Promo Code:</h3>
                      <div className="bg-green-50 p-3 rounded border border-green-100">
                        <p className="font-medium">{quote.promoCode}</p>
                        <p className="text-sm text-green-700 mt-1">
                          Discount: {formatCurrency(quote.promoDiscount)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Show totals */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                    </div>
                    
                    {totals.savings > 0 && (
                      <div className="flex justify-between mb-2 text-green-600">
                        <span>Savings:</span>
                        <span className="font-medium">-{formatCurrency(totals.savings)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-6 flex flex-col gap-2">
                    <Button 
                      className="w-full" 
                      size="lg"
                      disabled={isLoading}
                      onClick={() => handleSaveQuote()}
                    >
                      Save Quote
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled={isLoading}
                      onClick={() => setIsEmailDialogOpen(true)}
                    >
                      <Mail className="h-4 w-4 mr-1" /> Email Quote
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Email Your Quote</DialogTitle>
            <DialogDescription>
              Enter your email address to receive a copy of your quote.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </Label>
            <Input
              id="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full"
              type="email"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={onSendEmail} 
              disabled={!emailInput.includes('@') || isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SimpleQuoteBuilder;