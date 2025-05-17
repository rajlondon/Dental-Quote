import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Package, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import TreatmentPackageService, { TreatmentPackage, Treatment, AdditionalService } from '@/services/treatment-package-service';
import { usePersistentQuote } from '@/hooks/use-persistent-quote';
import { formatPriceInCurrency, CurrencyCode } from '@/utils/format-utils';
import { useAutoApplyCode } from '@/hooks/use-auto-apply-code';

// Simple mock treatments for demonstration purposes
const mockTreatments: Treatment[] = [
  {
    id: 'treat-001',
    name: 'Dental Implant',
    description: 'Titanium dental implant placement',
    price: 850,
    category: 'implants'
  },
  {
    id: 'treat-002',
    name: 'Porcelain Crown',
    description: 'Premium porcelain crown',
    price: 450,
    category: 'crowns'
  },
  {
    id: 'treat-003',
    name: 'Root Canal Treatment',
    description: 'Standard root canal treatment',
    price: 350,
    category: 'endodontics'
  },
  {
    id: 'treat-004',
    name: 'Professional Teeth Whitening',
    description: 'In-office laser teeth whitening',
    price: 400,
    category: 'cosmetic'
  },
  {
    id: 'treat-005',
    name: 'Porcelain Veneer',
    description: 'Premium porcelain veneer',
    price: 550,
    category: 'cosmetic'
  }
];

const QuoteBuilderPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Use the persistent state hook
  const {
    treatments: selectedTreatments,
    promoCode,
    currentPackage,
    additionalServices,
    patientInfo,
    step,
    currency,
    updateState,
    resetState
  } = usePersistentQuote();
  
  const [availableTreatments, setAvailableTreatments] = useState<Treatment[]>(mockTreatments);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [pendingPackage, setPendingPackage] = useState<TreatmentPackage | null>(null);
  
  // Handle auto-applying promo code from URL parameters
  const handleApplyPromoCode = async (code: string) => {
    if (!code) return;
    
    try {
      setIsApplyingPromo(true);
      setPromoInput(code);
      
      // Check if promo code is for a package
      const packageResult = await TreatmentPackageService.getPackageByPromoCode(code);
      
      if (packageResult) {
        // If we have existing treatments and this is a package, confirm replacement
        if (selectedTreatments.length > 0) {
          setPendingPackage(packageResult);
          setShowReplaceConfirm(true);
          return; // Wait for user confirmation
        } else {
          // No existing treatments, apply package directly
          applyPackage(packageResult);
        }
      } else {
        // Regular discount promo code (we'll just fake it for now)
        const discountPercent = 15; // Fake 15% discount
        updateState({
          promoCode: code
        });
        
        toast({
          title: 'Promo Code Applied',
          description: `You've received a ${discountPercent}% discount!`,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply promo code',
        variant: 'destructive',
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };
  
  useAutoApplyCode(handleApplyPromoCode);
  
  // Apply a package to the quote
  const applyPackage = (pkg: TreatmentPackage) => {
    // Extract treatments from package
    const packageTreatments = TreatmentPackageService.getExpandedTreatments(pkg);
    
    // Update state with package info
    updateState({
      treatments: packageTreatments,
      currentPackage: pkg,
      additionalServices: pkg.additionalServices,
      promoCode: pkg.promoCode
    });
    
    setShowReplaceConfirm(false);
    setPendingPackage(null);
    
    toast({
      title: 'Package Applied',
      description: `${pkg.name} has been added to your quote`,
      variant: 'default',
    });
  };
  
  // Handle user confirming package replacement
  const handleConfirmReplace = () => {
    if (pendingPackage) {
      applyPackage(pendingPackage);
    }
  };
  
  // Handle user declining package replacement
  const handleDeclineReplace = () => {
    setShowReplaceConfirm(false);
    setPendingPackage(null);
    setPromoInput('');
  };
  
  // Add a treatment to the quote
  const addTreatment = (treatment: Treatment) => {
    // Clear any package that might have been applied
    if (currentPackage) {
      updateState({
        currentPackage: null,
        additionalServices: [],
        promoCode: null
      });
    }
    
    updateState({
      treatments: [...selectedTreatments, { ...treatment, quantity: 1 }]
    });
    
    toast({
      description: `${treatment.name} added to your quote`,
    });
  };
  
  // Remove a treatment from the quote
  const removeTreatment = (index: number) => {
    const newTreatments = [...selectedTreatments];
    newTreatments.splice(index, 1);
    
    updateState({
      treatments: newTreatments
    });
    
    // If removing all treatments, also clear package info
    if (newTreatments.length === 0) {
      updateState({
        currentPackage: null,
        additionalServices: []
      });
    }
  };
  
  // Update price calculations when selections change
  useEffect(() => {
    // Calculate subtotal
    const calculatedSubtotal = selectedTreatments.reduce((sum, treatment) => 
      sum + (treatment.price * (treatment.quantity || 1)), 0);
    
    // Add additional services that are included
    const additionalServicesTotal = additionalServices
      .filter(service => service.included)
      .reduce((sum, service) => sum + service.price, 0);
    
    const newSubtotal = calculatedSubtotal + additionalServicesTotal;
    setSubtotal(newSubtotal);
    
    // Calculate discount (if promo code applied)
    let calculatedDiscount = 0;
    
    if (currentPackage) {
      // If we have a package, use its discounted price
      calculatedDiscount = newSubtotal - currentPackage.discountedPrice;
    } else if (promoCode) {
      // For regular promo codes, apply 15% discount (mock)
      calculatedDiscount = newSubtotal * 0.15;
    }
    
    setDiscount(calculatedDiscount);
    setTotal(newSubtotal - calculatedDiscount);
  }, [selectedTreatments, additionalServices, promoCode, currentPackage]);
  
  // Move to next step
  const nextStep = () => {
    // Simple validation for each step
    if (step === 1 && selectedTreatments.length === 0) {
      toast({
        title: 'No treatments selected',
        description: 'Please select at least one treatment to continue',
        variant: 'destructive',
      });
      return;
    }
    
    if (step === 3 && (!patientInfo.name || !patientInfo.email)) {
      toast({
        title: 'Missing information',
        description: 'Please provide your name and email to continue',
        variant: 'destructive',
      });
      return;
    }
    
    updateState({ step: step + 1 });
  };
  
  // Move to previous step
  const prevStep = () => {
    if (step > 1) {
      updateState({ step: step - 1 });
    }
  };
  
  // Update patient info fields
  const updatePatientInfo = (field: string, value: string) => {
    updateState({
      patientInfo: {
        ...patientInfo,
        [field]: value
      }
    });
  };
  
  // Complete the quote process
  const completeQuote = () => {
    // In a real app, we would send the quote data to the backend
    toast({
      title: 'Quote Completed',
      description: 'Your quote has been submitted successfully!',
      variant: 'default',
    });
    
    // Reset the state and go back to homepage
    resetState();
    navigate('/');
  };
  
  // Change currency
  const changeCurrency = (newCurrency: CurrencyCode) => {
    updateState({ currency });
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Build Your Dental Quote</h1>
        <p className="text-muted-foreground">
          Select treatments, apply special offers, and get your personalized quote
        </p>
      </div>
      
      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {['Select Treatments', 'Apply Promotions', 'Your Information', 'Review Quote'].map((label, idx) => (
            <div 
              key={idx} 
              className={`flex-1 text-center py-2 ${step === idx + 1 ? 'border-b-2 border-primary font-medium text-primary' : 'border-b border-border text-muted-foreground'}`}
            >
              <span className="hidden sm:inline">{label}</span>
              <span className="inline sm:hidden">{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Package replacement confirmation dialog */}
      {showReplaceConfirm && pendingPackage && (
        <Alert className="mb-6">
          <Package className="h-4 w-4" />
          <AlertTitle>Replace your selections with a package?</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              The promo code <span className="font-semibold">{pendingPackage.promoCode}</span> will 
              apply the <span className="font-semibold">{pendingPackage.name}</span> package 
              which includes {pendingPackage.treatments.reduce((sum, t) => sum + (t.quantity || 1), 0)} treatments.
              This will replace your current selections.
            </p>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={handleConfirmReplace}>
                Apply Package <Check className="ml-2 h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleDeclineReplace}>
                Keep My Selections
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Step 1: Select Treatments */}
      {step === 1 && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Select Your Treatments</CardTitle>
              <CardDescription>
                Choose the dental treatments you're interested in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="implants">Implants</TabsTrigger>
                  <TabsTrigger value="cosmetic">Cosmetic</TabsTrigger>
                  <TabsTrigger value="crowns">Crowns</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableTreatments.map((treatment) => (
                      <div key={treatment.id} className="flex justify-between border rounded-md p-4">
                        <div>
                          <h3 className="font-medium">{treatment.name}</h3>
                          <p className="text-sm text-muted-foreground">{treatment.description}</p>
                          <p className="text-sm font-semibold mt-1">{formatPriceInCurrency(treatment.price, currency)}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => addTreatment(treatment)}
                          className="self-center"
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="implants" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableTreatments
                      .filter(treatment => treatment.category === 'implants')
                      .map((treatment) => (
                        <div key={treatment.id} className="flex justify-between border rounded-md p-4">
                          <div>
                            <h3 className="font-medium">{treatment.name}</h3>
                            <p className="text-sm text-muted-foreground">{treatment.description}</p>
                            <p className="text-sm font-semibold mt-1">{formatPriceInCurrency(treatment.price, currency)}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => addTreatment(treatment)}
                            className="self-center"
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                  </div>
                </TabsContent>
                
                {/* Similar TabsContent for other categories */}
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Selected Treatments Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Your Selected Treatments</CardTitle>
              <CardDescription>
                {selectedTreatments.length === 0 
                  ? 'No treatments selected yet' 
                  : `${selectedTreatments.length} treatment${selectedTreatments.length !== 1 ? 's' : ''} selected`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTreatments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Please select some treatments to get started</p>
                </div>
              ) : (
                <>
                  {currentPackage && (
                    <div className="mb-4 p-3 bg-primary/5 rounded-md border border-primary/20">
                      <div className="flex items-center mb-2">
                        <Package className="h-4 w-4 text-primary mr-2" />
                        <span className="font-medium">{currentPackage.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{currentPackage.description}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {selectedTreatments.map((treatment, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <span className="font-medium">{treatment.name}</span>
                          {treatment.quantity && treatment.quantity > 1 && (
                            <span className="text-sm ml-2 text-muted-foreground">x{treatment.quantity}</span>
                          )}
                          <p className="text-xs text-muted-foreground">{treatment.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{formatPriceInCurrency(treatment.price * (treatment.quantity || 1), currency)}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeTreatment(index)} 
                            className="h-8 w-8 p-0"
                          >
                            &times;
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {additionalServices.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Additional Services</h4>
                      <div className="space-y-2">
                        {additionalServices.filter(s => s.included).map((service, index) => (
                          <div key={index} className="flex justify-between items-center border-b pb-2">
                            <div>
                              <span className="text-sm">{service.name}</span>
                              <p className="text-xs text-muted-foreground">{service.description}</p>
                            </div>
                            <div>
                              <span className="text-sm">{formatPriceInCurrency(service.price, currency)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between mb-1">
                      <span>Subtotal</span>
                      <span>{formatPriceInCurrency(subtotal, currency)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between mb-1 text-green-600">
                        <span>Discount</span>
                        <span>-{formatPriceInCurrency(discount, currency)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatPriceInCurrency(total, currency)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={nextStep} disabled={selectedTreatments.length === 0}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 2: Apply Promotions */}
      {step === 2 && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Apply Promotions</CardTitle>
              <CardDescription>
                Enter a promo code or select a special offer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 border rounded-md px-3 py-2"
                      disabled={!!promoCode || isApplyingPromo}
                    />
                    
                    {promoCode ? (
                      <Button
                        onClick={() => updateState({ promoCode: null, currentPackage: null })}
                        variant="destructive"
                        disabled={isApplyingPromo}
                      >
                        Clear
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleApplyPromoCode(promoInput)}
                        disabled={!promoInput || isApplyingPromo}
                      >
                        {isApplyingPromo ? 'Applying...' : 'Apply'}
                      </Button>
                    )}
                  </div>
                  
                  {promoCode && (
                    <div className="p-3 rounded-md bg-green-50">
                      <p className="text-sm text-green-800">
                        Promo code {promoCode} applied successfully!
                      </p>
                      {discount > 0 && (
                        <p className="text-sm font-medium mt-1 text-green-800">
                          You save {formatPriceInCurrency(discount, currency)}
                        </p>
                      )}
                      
                      {currentPackage && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Treatment Package Applied</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{currentPackage.description}</p>
                          
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Regular Price:</span>
                              <span className="line-through text-muted-foreground">
                                {formatPriceInCurrency(currentPackage.regularPrice, currency)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Special Price:</span>
                              <span className="font-semibold text-primary">
                                {formatPriceInCurrency(currentPackage.discountedPrice, currency)}
                              </span>
                            </div>
                          </div>
                          
                          {additionalServices.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium mb-1">Includes:</p>
                              <ul className="grid grid-cols-1 gap-1">
                                {additionalServices.filter(s => s.included).map((service, idx) => (
                                  <li key={idx} className="text-xs flex items-center gap-1">
                                    <Check className="h-3 w-3 text-green-500" />
                                    <span>{service.name}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-semibold mb-3">Quote Summary</h3>
                  
                  <div className="space-y-2 mb-4">
                    {selectedTreatments.map((treatment, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{treatment.name} {treatment.quantity && treatment.quantity > 1 && `(x${treatment.quantity})`}</span>
                        <span>{formatPriceInCurrency(treatment.price * (treatment.quantity || 1), currency)}</span>
                      </div>
                    ))}
                    
                    {additionalServices.filter(s => s.included).map((service, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{service.name}</span>
                        <span>{formatPriceInCurrency(service.price, currency)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between mb-1">
                      <span>Subtotal</span>
                      <span>{formatPriceInCurrency(subtotal, currency)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between mb-1 text-green-600">
                        <span>Discount</span>
                        <span>-{formatPriceInCurrency(discount, currency)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatPriceInCurrency(total, currency)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-semibold mb-3">Currency Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['USD', 'EUR', 'GBP', 'TRY'] as CurrencyCode[]).map((curr) => (
                      <Button
                        key={curr}
                        variant={currency === curr ? 'default' : 'outline'}
                        onClick={() => updateState({ currency: curr })}
                      >
                        {curr}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={nextStep}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 3: Patient Information */}
      {step === 3 && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>
                Please provide your details to complete the quote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2"
                    value={patientInfo.name}
                    onChange={(e) => updatePatientInfo('name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full border rounded-md px-3 py-2"
                    value={patientInfo.email}
                    onChange={(e) => updatePatientInfo('email', e.target.value)}
                    placeholder="Your email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input 
                    type="tel" 
                    className="w-full border rounded-md px-3 py-2"
                    value={patientInfo.phone}
                    onChange={(e) => updatePatientInfo('phone', e.target.value)}
                    placeholder="Your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Additional Notes</label>
                  <textarea 
                    className="w-full border rounded-md px-3 py-2 min-h-[100px]"
                    value={patientInfo.notes}
                    onChange={(e) => updatePatientInfo('notes', e.target.value)}
                    placeholder="Any specific concerns or questions"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button 
              onClick={nextStep} 
              disabled={!patientInfo.name || !patientInfo.email}
            >
              Review Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 4: Review Quote */}
      {step === 4 && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Review Your Quote</CardTitle>
              <CardDescription>
                Please review your dental quote before submitting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Selected Treatments</h3>
                  <div className="border rounded-md p-4">
                    {currentPackage && (
                      <div className="mb-3 p-3 bg-primary/5 rounded-md">
                        <h4 className="font-medium flex items-center">
                          <Package className="h-4 w-4 mr-2 text-primary" />
                          {currentPackage.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{currentPackage.description}</p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {selectedTreatments.map((treatment, index) => (
                        <div key={index} className="flex justify-between">
                          <div>
                            <span>{treatment.name}</span>
                            {treatment.quantity && treatment.quantity > 1 && (
                              <span className="text-sm ml-2 text-muted-foreground">x{treatment.quantity}</span>
                            )}
                          </div>
                          <span>{formatPriceInCurrency(treatment.price * (treatment.quantity || 1), currency)}</span>
                        </div>
                      ))}
                    </div>
                    
                    {additionalServices.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Additional Services</h4>
                        <div className="space-y-2">
                          {additionalServices.filter(s => s.included).map((service, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{service.name}</span>
                              <span>{formatPriceInCurrency(service.price, currency)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {promoCode && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Promo Code</span>
                          <span>{promoCode}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between mb-1">
                        <span>Subtotal</span>
                        <span>{formatPriceInCurrency(subtotal, currency)}</span>
                      </div>
                      
                      {discount > 0 && (
                        <div className="flex justify-between mb-1 text-green-600">
                          <span>Discount</span>
                          <span>-{formatPriceInCurrency(discount, currency)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formatPriceInCurrency(total, currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Information</h3>
                  <div className="border rounded-md p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm text-muted-foreground">Name</span>
                        <span className="font-medium">{patientInfo.name}</span>
                      </div>
                      
                      <div>
                        <span className="block text-sm text-muted-foreground">Email</span>
                        <span className="font-medium">{patientInfo.email}</span>
                      </div>
                      
                      <div>
                        <span className="block text-sm text-muted-foreground">Phone</span>
                        <span className="font-medium">{patientInfo.phone || 'Not provided'}</span>
                      </div>
                    </div>
                    
                    {patientInfo.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <span className="block text-sm text-muted-foreground">Additional Notes</span>
                        <p>{patientInfo.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <h3 className="font-medium text-amber-800 mb-2">What happens next?</h3>
                  <p className="text-sm text-amber-700">
                    After submitting your quote, you'll receive a confirmation email with 
                    details of your treatment plan. Our team will contact you within 24 hours 
                    to discuss the next steps and answer any questions you may have.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={completeQuote}>
              Submit Quote
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteBuilderPage;