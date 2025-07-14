import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Calculator, ArrowRight, Package, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PromoCodeInput } from './PromoCodeInput';
import { useOptionalQuote } from '../contexts/QuoteContext';
import { initializePrices, getAllTreatments, getTreatmentByName } from '../services/pricingService';
import { getEducationContent } from '../data/treatmentEducation';

interface TreatmentItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

interface PendingOffer {
  id: string;
  title: string;
  clinicId: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed_amount';
  applicableTreatment?: string;
}

interface PendingPackage {
  name: string;
  treatments: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  originalPrice: number;
  packagePrice: number;
  clinicId?: string;
}

export function TreatmentPlanBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [availableTreatments, setAvailableTreatments] = useState<any[]>([]);
  const [selectedTreatments, setSelectedTreatments] = useState<TreatmentItem[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);

  // Check for special offers/packages flow
  const [isSpecialOfferFlow, setIsSpecialOfferFlow] = useState(false);
  const [pendingOffer, setPendingOffer] = useState<PendingOffer | null>(null);
  const [pendingPackage, setPendingPackage] = useState<PendingPackage | null>(null);
  const [associatedClinicId, setAssociatedClinicId] = useState<string | null>(null);

  const quoteContext = useOptionalQuote();

  useEffect(() => {
    initializeTreatmentData();
    checkForSpecialOffers();
    handlePendingPromoCode();
  }, []);

  const initializeTreatmentData = async () => {
    try {
      await initializePrices();
      const treatments = getAllTreatments();
      setAvailableTreatments(treatments);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize treatment data:', error);
      toast({
        title: "Error",
        description: "Failed to load treatment data. Please refresh the page.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const checkForSpecialOffers = () => {
    // Check for pending special offer
    const pendingOfferData = sessionStorage.getItem('pendingSpecialOffer');
    if (pendingOfferData) {
      try {
        const offer = JSON.parse(pendingOfferData);
        setPendingOffer(offer);
        setIsSpecialOfferFlow(true);
        setAssociatedClinicId(offer.clinicId);
        console.log('🎯 Special offer flow detected:', offer);
      } catch (error) {
        console.error('Error parsing pending offer:', error);
      }
    }

    // Check for pending package
    const pendingPackageData = sessionStorage.getItem('pendingPackageData');
    if (pendingPackageData) {
      try {
        const packageData = JSON.parse(pendingPackageData);
        setPendingPackage(packageData);
        setIsSpecialOfferFlow(true);
        setAssociatedClinicId(packageData.clinicId);
        console.log('📦 Package flow detected:', packageData);
      } catch (error) {
        console.error('Error parsing pending package:', error);
      }
    }

    // Check for promo code clinic ID
    const promoCodeClinicId = sessionStorage.getItem('pendingPromoCodeClinicId');
    if (promoCodeClinicId) {
      setAssociatedClinicId(promoCodeClinicId);
      setIsSpecialOfferFlow(true);
      console.log('🏥 Promo code clinic flow detected:', promoCodeClinicId);
    }
  };

  const handlePendingPromoCode = () => {
    if (quoteContext) {
      const storedPromoCode = sessionStorage.getItem("pendingPromoCode");
      if (storedPromoCode && typeof quoteContext.applyPromoCode === "function") {
        console.log("🔄 Found pending promo code:", storedPromoCode);

        setTimeout(() => {
          quoteContext.applyPromoCode(storedPromoCode);
          sessionStorage.removeItem("pendingPromoCode");
        }, 1000);
      }

      // Handle discount info from session storage
      const packageData = sessionStorage.getItem("pendingPackageData");
      if (packageData) {
        try {
          const parsedPackage = JSON.parse(packageData);
          if (parsedPackage.originalPrice && parsedPackage.packagePrice) {
            setDiscountAmount(parsedPackage.originalPrice - parsedPackage.packagePrice);
          }

          if (parsedPackage.discountType && parsedPackage.discountValue) {
            setDiscountType(parsedPackage.discountType);
            setDiscountValue(parsedPackage.discountValue);
          }
        } catch (e) {
          console.error("Failed to parse package data from session storage", e);
        }
      }
    }
  };

  const getTreatmentPricing = (treatment: any) => {
    if (isSpecialOfferFlow) {
      // Special offer flow: Show actual clinic-specific prices
      return {
        price: treatment.priceGBP,
        displayPrice: `£${treatment.priceGBP}`,
        showRange: false
      };
    } else {
      // Normal quote flow: Show price ranges
      const basePrice = treatment.priceGBP;
      const minPrice = Math.round(basePrice * 0.8); // 20% below base
      const maxPrice = Math.round(basePrice * 1.2); // 20% above base

      return {
        price: basePrice,
        displayPrice: `£${minPrice} - £${maxPrice}`,
        showRange: true,
        priceRange: { min: minPrice, max: maxPrice }
      };
    }
  };

  const handleAddTreatment = () => {
    if (!selectedTreatment || !availableTreatments.length) {
      toast({
        title: "Error",
        description: "Please select a treatment first.",
        variant: "destructive"
      });
      return;
    }

    const treatmentData = getTreatmentByName(selectedTreatment);
    if (!treatmentData) {
      toast({
        title: "Error",
        description: "Treatment not found.",
        variant: "destructive"
      });
      return;
    }

    const existingTreatment = selectedTreatments.find(t => t.id === treatmentData.treatment);
    if (existingTreatment) {
      toast({
        title: "Treatment Already Added",
        description: "This treatment is already in your plan. You can adjust the quantity below.",
        variant: "destructive"
      });
      return;
    }

    const pricing = getTreatmentPricing(treatmentData);
    const newTreatment: TreatmentItem = {
      id: treatmentData.treatment,
      name: treatmentData.treatment,
      quantity: quantity,
      unitPrice: pricing.price,
      total: pricing.price * quantity,
      category: treatmentData.category,
      priceRange: pricing.showRange ? pricing.priceRange : undefined
    };

    setSelectedTreatments([...selectedTreatments, newTreatment]);
    setSelectedTreatment('');
    setQuantity(1);

    // Add to quote context if available
    if (quoteContext && typeof quoteContext.addTreatment === 'function') {
      quoteContext.addTreatment({
        id: treatmentData.treatment,
        name: treatmentData.treatment,
        price: pricing.price,
        quantity: quantity
      });
    }

    toast({
      title: "Treatment Added",
      description: `${treatmentData.treatment} has been added to your treatment plan.`,
    });
  };

  const updateTreatmentQuantity = (treatmentId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setSelectedTreatments(prev => 
      prev.map(treatment => 
        treatment.id === treatmentId 
          ? { ...treatment, quantity: newQuantity, total: treatment.unitPrice * newQuantity }
          : treatment
      )
    );
  };

  const removeTreatment = (treatmentId: string) => {
    setSelectedTreatments(prev => prev.filter(t => t.id !== treatmentId));

    if (quoteContext && typeof quoteContext.removeTreatment === 'function') {
      quoteContext.removeTreatment(treatmentId);
    }
  };

  const calculateSubtotal = () => {
    return selectedTreatments.reduce((sum, treatment) => sum + treatment.total, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - discountAmount);
  };

  const handleGetQuotes = () => {
    if (selectedTreatments.length === 0) {
      toast({
        title: "No Treatments Selected",
        description: "Please add at least one treatment to your plan before getting quotes.",
        variant: "destructive"
      });
      return;
    }

    // Store treatment data in session storage
    sessionStorage.setItem('selectedTreatments', JSON.stringify(selectedTreatments));
    sessionStorage.setItem('treatmentSubtotal', JSON.stringify(calculateSubtotal()));
    sessionStorage.setItem('treatmentTotal', JSON.stringify(calculateTotal()));
    sessionStorage.setItem('isSpecialOfferFlow', JSON.stringify(isSpecialOfferFlow));

    if (associatedClinicId) {
      sessionStorage.setItem('associatedClinicId', associatedClinicId);
    }

    // Navigate to results page
    if (isSpecialOfferFlow && associatedClinicId) {
      // Special offer flow: Go directly to specific clinic
      setLocation(`/results?clinicId=${associatedClinicId}&from=special-offer`);
    } else {
      // Normal flow: Show all matched clinics
      setLocation(`/results?from=normal-quote`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isSpecialOfferFlow ? 'Special Offer Treatment Plan' : 'Build Your Treatment Plan'}
        </h1>
        <p className="text-muted-foreground">
          {isSpecialOfferFlow 
            ? 'Configure your treatment plan for this special offer'
            : 'Select your treatments and get quotes from top Istanbul clinics'
          }
        </p>

        {isSpecialOfferFlow && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-amber-600 mr-2" />
              <span className="text-amber-800 font-medium">
                Special offer pricing from selected clinic
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Treatment Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Add Treatment</CardTitle>
              <CardDescription>
                {isSpecialOfferFlow 
                  ? 'Select treatments with clinic-specific pricing'
                  : 'Select treatments to see price ranges from Istanbul clinics'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Treatment</label>
                  <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a treatment" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTreatments.map((treatment) => {
                        const pricing = getTreatmentPricing(treatment);
                        return (
                          <SelectItem key={treatment.treatment} value={treatment.treatment}>
                            <div className="flex justify-between items-center w-full">
                              <span>{treatment.treatment}</span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {pricing.displayPrice}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button onClick={handleAddTreatment} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Treatment
              </Button>
            </CardContent>
          </Card>

          {/* Selected Treatments */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Treatments</CardTitle>
              <CardDescription>
                {isSpecialOfferFlow 
                  ? 'Your treatments with clinic-specific pricing'
                  : 'Your selected treatments with estimated price ranges'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTreatments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No treatments selected yet. Add treatments above to build your plan.
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedTreatments.map((treatment) => {
                    const educationContent = getEducationContent(treatment.id);
                    return (
                      <div key={treatment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{treatment.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {treatment.category}
                            </Badge>
                          </div>

                          {educationContent && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {educationContent.warranty}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm">
                            <span>
                              {isSpecialOfferFlow 
                                ? `£${treatment.unitPrice} each`
                                : `£${treatment.priceRange?.min} - £${treatment.priceRange?.max} each`
                              }
                            </span>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateTreatmentQuantity(treatment.id, treatment.quantity - 1)}
                                disabled={treatment.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{treatment.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateTreatmentQuantity(treatment.id, treatment.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-medium">
                            {isSpecialOfferFlow 
                              ? `£${treatment.total}`
                              : `£${(treatment.priceRange?.min || 0) * treatment.quantity} - £${(treatment.priceRange?.max || 0) * treatment.quantity}`
                            }
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTreatment(treatment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quote Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Quote Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>
                    {isSpecialOfferFlow 
                      ? `£${calculateSubtotal()}`
                      : 'Range varies by clinic'
                    }
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-£{discountAmount}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>
                    {isSpecialOfferFlow 
                      ? `£${calculateTotal()}`
                      : 'See clinic quotes'
                    }
                  </span>
                </div>
              </div>

              {!isSpecialOfferFlow && (
                <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded">
                  <strong>Note:</strong> Prices shown are estimated ranges. 
                  Actual prices will vary by clinic and will be shown in your personalized quotes.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Promo Code Input */}
          <Card>
            <CardHeader>
              <CardTitle>Promo Code</CardTitle>
            </CardHeader>
            <CardContent>
              <PromoCodeInput />
            </CardContent>
          </Card>

          {/* Get Quotes Button */}
          <Button 
            onClick={handleGetQuotes}
            className="w-full"
            size="lg"
            disabled={selectedTreatments.length === 0}
          >
            {isSpecialOfferFlow ? (
              <>
                <Package className="h-5 w-5 mr-2" />
                View Clinic Details
              </>
            ) : (
              <>
                <ArrowRight className="h-5 w-5 mr-2" />
                Get Quotes from Clinics
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}