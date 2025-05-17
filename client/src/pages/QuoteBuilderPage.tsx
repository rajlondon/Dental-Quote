import React, { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePersistentQuote } from '@/hooks/use-persistent-quote';
import { useAutoApplyCode } from '@/hooks/use-auto-apply-code';
import { Treatment, TreatmentPackage, AdditionalService } from '@/types/treatment-types';
import { CurrencyCode } from '@/types/general-types';
import { ChevronRight, ChevronLeft, Package, Tag, Clipboard, User, Check, Send } from 'lucide-react';
import ClinicModeIndicator from '@/components/clinic/ClinicModeIndicator';

// Mock data for treatments - would be fetched from API in a real implementation
const TREATMENTS: Treatment[] = [
  { id: '1', name: 'Dental Implant', price: 500, description: 'Titanium dental implant only (excludes abutment and crown)' },
  { id: '2', name: 'Implant Abutment', price: 150, description: 'Connector between implant and crown' },
  { id: '3', name: 'Porcelain Crown', price: 200, description: 'Tooth-colored crown for front teeth' },
  { id: '4', name: 'Zirconia Crown', price: 300, description: 'Premium metal-free crown with exceptional durability' },
  { id: '5', name: 'Root Canal Treatment', price: 250, description: 'Complete endodontic therapy including filling' },
  { id: '6', name: 'Professional Teeth Whitening', price: 200, description: 'In-office laser whitening procedure' },
  { id: '7', name: 'Composite Filling', price: 80, description: 'Tooth-colored filling for cavities' },
  { id: '8', name: 'Teeth Cleaning', price: 70, description: 'Professional scaling and polishing' },
];

// Mock data for treatment packages - would be fetched from API in a real implementation
const PACKAGES: TreatmentPackage[] = [
  {
    id: 'pkg1',
    name: 'Premium Implant Package',
    description: 'Complete dental implant treatment with premium materials',
    price: 750,
    originalPrice: 850,
    items: [
      { treatmentId: '1', quantity: 1 },
      { treatmentId: '2', quantity: 1 },
      { treatmentId: '4', quantity: 1 },
    ],
    promoCode: 'IMPLANTCROWN30'
  },
  {
    id: 'pkg2',
    name: 'Luxury Smile Makeover',
    description: 'Complete smile transformation with zirconia crowns and hotel stay',
    price: 2999,
    originalPrice: 5999,
    items: [
      { treatmentId: '4', quantity: 8 },
      { treatmentId: '6', quantity: 1 },
      { treatmentId: '8', quantity: 1 },
    ],
    promoCode: 'LUXHOTEL20'
  },
  {
    id: 'pkg3',
    name: 'Travel & Treatment Bundle',
    description: 'All-inclusive package with flights, hotel, and dental treatment',
    price: 1999,
    originalPrice: 3499,
    items: [
      { treatmentId: '4', quantity: 4 },
      { treatmentId: '6', quantity: 1 },
      { treatmentId: '8', quantity: 1 },
    ],
    promoCode: 'LUXTRAVEL'
  }
];

// Mock data for additional services
const ADDITIONAL_SERVICES: AdditionalService[] = [
  { id: 'as1', name: 'Airport Transfer', price: 50, description: 'Return airport pickup and drop-off' },
  { id: 'as2', name: 'Hotel Booking (4-star)', price: 300, description: '3 nights accommodation' },
  { id: 'as3', name: 'Hotel Booking (5-star)', price: 500, description: '3 nights accommodation' },
  { id: 'as4', name: 'Translation Service', price: 100, description: 'Personal translator during treatment' },
];

const CURRENCY_EXCHANGE_RATES = {
  USD: 1,
  GBP: 0.78,
  EUR: 0.91
};

// Format currency based on the selected currency
const formatCurrency = (amount: number, currency: CurrencyCode): string => {
  const value = amount * CURRENCY_EXCHANGE_RATES[currency];
  
  switch (currency) {
    case 'USD':
      return `$${value.toFixed(2)}`;
    case 'GBP':
      return `£${value.toFixed(2)}`;
    case 'EUR':
      return `€${value.toFixed(2)}`;
    default:
      return `$${value.toFixed(2)}`;
  }
};

interface TreatmentItemProps {
  treatment: Treatment;
  onAdd: () => void;
  currency: CurrencyCode;
  quantity?: number;
}

const TreatmentItem: React.FC<TreatmentItemProps> = ({ treatment, onAdd, currency, quantity = 0 }) => (
  <Card className="mb-4">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg flex justify-between">
        <span>{treatment.name}</span>
        <span className="text-primary">{formatCurrency(treatment.price, currency)}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="pb-2">
      <p className="text-sm text-gray-600">{treatment.description}</p>
    </CardContent>
    <CardFooter className="flex justify-between items-center">
      {quantity > 0 && (
        <div className="text-sm text-gray-700 flex items-center">
          <Check className="h-4 w-4 text-green-500 mr-1" /> 
          {quantity > 1 ? `${quantity} × Added` : 'Added'}
        </div>
      )}
      <Button variant={quantity > 0 ? "outline" : "default"} size="sm" onClick={onAdd}>
        {quantity > 0 ? 'Add Another' : 'Add to Quote'}
      </Button>
    </CardFooter>
  </Card>
);

const QuoteBuilderPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { 
    treatments, 
    updateState, 
    promoCode, 
    currentPackage, 
    additionalServices, 
    patientInfo, 
    step, 
    currency,
    resetState,
    clinicPreference
  } = usePersistentQuote();
  
  const [promoInput, setPromoInput] = useState('');
  const [isPromoValid, setIsPromoValid] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClinicPortal, setIsClinicPortal] = useState(false);
  
  // Function to handle clinic ID from URL
  const handleClinicId = (clinicId: string) => {
    console.log(`Setting clinic preference to ${clinicId}`);
    updateState({ clinicPreference: clinicId });
    setIsClinicPortal(true);
  };

  // Handle both promo codes and clinic IDs from URL
  useAutoApplyCode(
    // Promo code handler
    (code) => {
      // Check if the code is valid against our mock packages
      const validPackage = PACKAGES.find(pkg => pkg.promoCode === code);
      
      if (validPackage) {
        // If valid, apply the package and promo code
        applyPackage(validPackage);
        toast({
          title: 'Special offer applied!',
          description: `The ${validPackage.name} package has been added to your quote.`,
          variant: 'default',
        });
      } else {
        // If not a package, just set the promo code and validate
        setPromoInput(code);
        validatePromoCode(code);
      }
    },
    // Clinic ID handler
    handleClinicId
  );
  
  // Function to validate a promo code
  const validatePromoCode = (code: string) => {
    // Check if code exists in our mock packages
    const validPackage = PACKAGES.find(pkg => pkg.promoCode === code);
    
    if (validPackage) {
      setIsPromoValid(true);
      updateState({ promoCode: code });
      
      // If valid, automatically apply the package since it's coming from a special offer
      applyPackage(validPackage);
      
      toast({
        title: 'Special offer applied!',
        description: `${validPackage.name} has been added to your quote.`,
      });
      return;
    }
    
    // Add the special offer codes we're using from SpecialOffersSection.tsx
    const validCodes = [
      'WELCOME10', 'DENTAL20', 'SMILE15', 
      'IMPLANTCROWN30', 'LUXHOTEL20', 'LUXTRAVEL'
    ];
    
    const isValid = validCodes.includes(code);
    
    setIsPromoValid(isValid);
    if (isValid) {
      updateState({ promoCode: code });
      toast({
        title: 'Promo code applied',
        description: 'Your discount has been applied to the quote.',
      });
    } else {
      toast({
        title: 'Invalid promo code',
        description: 'Please check the code and try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Function to apply a treatment package
  const applyPackage = (pkg: TreatmentPackage) => {
    // First, reset any existing treatments
    updateState({ 
      treatments: [],
      promoCode: pkg.promoCode,
      currentPackage: pkg
    });
    
    // Then add all treatments from the package
    const packageTreatments: Treatment[] = [];
    
    pkg.items.forEach(item => {
      const treatment = TREATMENTS.find(t => t.id === item.treatmentId);
      if (treatment) {
        for (let i = 0; i < item.quantity; i++) {
          packageTreatments.push({ ...treatment });
        }
      }
    });
    
    updateState({ treatments: packageTreatments });
    
    // Advance to the patient info step
    updateState({ step: 3 });
  };
  
  // Function to add a treatment to the quote
  const addTreatment = (treatment: Treatment) => {
    updateState({ 
      treatments: [...treatments, { ...treatment }],
      // If we're adding treatments manually, clear any package
      currentPackage: null
    });
    
    toast({
      title: 'Treatment added',
      description: `${treatment.name} has been added to your quote.`,
    });
  };
  
  // Function to remove a treatment from the quote
  const removeTreatment = (index: number) => {
    const updatedTreatments = [...treatments];
    updatedTreatments.splice(index, 1);
    
    updateState({ 
      treatments: updatedTreatments,
      // If we're modifying treatments manually, clear any package
      currentPackage: null
    });
  };
  
  // Function to add an additional service
  const toggleAdditionalService = (service: AdditionalService) => {
    const isServiceAdded = additionalServices.some(s => s.id === service.id);
    
    if (isServiceAdded) {
      // Remove service
      updateState({
        additionalServices: additionalServices.filter(s => s.id !== service.id)
      });
    } else {
      // Add service
      updateState({
        additionalServices: [...additionalServices, service]
      });
    }
  };
  
  // Function to change currency
  const changeCurrency = (newCurrency: CurrencyCode) => {
    updateState({ currency: newCurrency });
  };
  
  // Calculate the total price of all treatments
  const calculateTreatmentsTotal = (): number => {
    return treatments.reduce((sum, item) => sum + item.price, 0);
  };
  
  // Calculate the total price of all additional services
  const calculateServicesTotal = (): number => {
    return additionalServices.reduce((sum, item) => sum + item.price, 0);
  };
  
  // Calculate any discounts based on promo code
  const calculateDiscount = (): number => {
    if (!promoCode) return 0;
    
    const treatmentsTotal = calculateTreatmentsTotal();
    
    // If it's a package promo code, calculate the package discount
    if (currentPackage && currentPackage.promoCode === promoCode) {
      const regularPrice = currentPackage.originalPrice;
      const discountedPrice = currentPackage.price;
      return regularPrice - discountedPrice;
    }
    
    // Generic discount logic for other promo codes
    if (promoCode === 'WELCOME10') return treatmentsTotal * 0.1;
    if (promoCode === 'DENTAL20') return treatmentsTotal * 0.2;
    if (promoCode === 'SMILE15') return treatmentsTotal * 0.15;
    
    return 0;
  };
  
  // Calculate the grand total
  const calculateTotal = (): number => {
    return calculateTreatmentsTotal() + calculateServicesTotal() - calculateDiscount();
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Validate required fields
    if (!patientInfo.name || !patientInfo.email || !patientInfo.phone) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }
    
    // Mock API submission
    try {
      // In a real app, you would send this data to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success message
      toast({
        title: 'Quote submitted successfully!',
        description: 'A confirmation has been sent to your email.',
      });
      
      // Reset the form and navigate to confirmation page
      resetState();
      navigate('/quote-confirmation');
    } catch (error) {
      toast({
        title: 'Error submitting quote',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to navigate between steps
  const goToStep = (newStep: number) => {
    // Validate current step before proceeding
    if (step === 1 && treatments.length === 0) {
      toast({
        title: 'No treatments selected',
        description: 'Please select at least one treatment.',
        variant: 'destructive',
      });
      return;
    }
    
    updateState({ step: newStep });
  };
  
  // Calculate the counts of each treatment
  const treatmentCounts: Record<string, number> = {};
  treatments.forEach(treatment => {
    treatmentCounts[treatment.id] = (treatmentCounts[treatment.id] || 0) + 1;
  });
  
  // Group treatments by ID for display in summary
  const groupedTreatments = treatments.reduce<Record<string, { treatment: Treatment, count: number }>>(
    (acc, treatment) => {
      if (!acc[treatment.id]) {
        acc[treatment.id] = { treatment, count: 0 };
      }
      acc[treatment.id].count++;
      return acc;
    }, 
    {}
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Display clinic mode indicator if accessed from clinic portal */}
      {clinicPreference && <ClinicModeIndicator clinicId={clinicPreference} />}
      
      <h1 className="text-3xl font-bold mb-8 text-center">Build Your Dental Treatment Quote</h1>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {['Select Treatments', 'Review & Customize', 'Your Details', 'Confirm Quote'].map((label, index) => (
            <div 
              key={index} 
              className={`flex-1 text-center ${index + 1 === step ? 'text-primary font-semibold' : 'text-gray-500'}`}
            >
              <div 
                className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center 
                  ${index + 1 === step 
                    ? 'bg-primary text-white' 
                    : index + 1 < step 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-gray-200 text-gray-400'
                  }`}
              >
                {index + 1 < step ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full mt-4">
          <div 
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(step - 1) * 33.33}%` }}
          ></div>
        </div>
      </div>
      
      {/* Step 1: Treatment Selection */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Your Treatments</CardTitle>
                <CardDescription>Choose dental treatments to include in your quote</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="treatments">
                  <TabsList className="mb-4">
                    <TabsTrigger value="treatments">Individual Treatments</TabsTrigger>
                    <TabsTrigger value="packages">Treatment Packages</TabsTrigger>
                  </TabsList>
                  <TabsContent value="treatments">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {TREATMENTS.map(treatment => (
                        <TreatmentItem 
                          key={treatment.id} 
                          treatment={treatment} 
                          onAdd={() => addTreatment(treatment)}
                          currency={currency}
                          quantity={treatmentCounts[treatment.id] || 0}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="packages">
                    <div className="space-y-6">
                      {PACKAGES.map(pkg => (
                        <Card key={pkg.id} className="overflow-hidden">
                          <CardHeader className="bg-primary/5 pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{pkg.name}</CardTitle>
                                <CardDescription className="mt-1">{pkg.description}</CardDescription>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary">
                                  {formatCurrency(pkg.price, currency)}
                                </div>
                                <div className="text-sm text-gray-500 line-through">
                                  {formatCurrency(pkg.originalPrice, currency)}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                              <Package className="h-4 w-4 mr-2" /> Package Includes:
                            </h4>
                            <ul className="space-y-2 mb-4">
                              {pkg.items.map(item => {
                                const treatment = TREATMENTS.find(t => t.id === item.treatmentId);
                                return treatment ? (
                                  <li key={item.treatmentId} className="text-sm flex justify-between">
                                    <span>{treatment.name} {item.quantity > 1 ? `× ${item.quantity}` : ''}</span>
                                    <span className="text-gray-500">
                                      {formatCurrency(treatment.price * item.quantity, currency)}
                                    </span>
                                  </li>
                                ) : null;
                              })}
                            </ul>
                            <div className="text-sm flex items-center text-primary">
                              <Tag className="h-4 w-4 mr-2" /> Promo code: <span className="font-mono ml-2">{pkg.promoCode}</span>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-gray-50">
                            <Button 
                              className="w-full" 
                              onClick={() => applyPackage(pkg)}
                              variant={currentPackage?.id === pkg.id ? "outline" : "default"}
                            >
                              {currentPackage?.id === pkg.id ? 'Package Applied' : 'Choose This Package'}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Your Quote Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Selected Treatments</h3>
                    {treatments.length === 0 ? (
                      <p className="text-sm text-gray-500">No treatments selected yet</p>
                    ) : (
                      <ul className="divide-y">
                        {Object.values(groupedTreatments).map(({ treatment, count }) => (
                          <li key={treatment.id} className="py-2 flex justify-between text-sm">
                            <span>{treatment.name} {count > 1 ? `× ${count}` : ''}</span>
                            <span>{formatCurrency(treatment.price * count, currency)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {/* Currency selector */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Currency</h3>
                    <div className="flex space-x-2">
                      {(['USD', 'GBP', 'EUR'] as CurrencyCode[]).map((curr) => (
                        <Button 
                          key={curr} 
                          variant={currency === curr ? "default" : "outline"} 
                          size="sm"
                          onClick={() => changeCurrency(curr)}
                        >
                          {curr}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-medium">
                      <span>Treatments Total</span>
                      <span>{formatCurrency(calculateTreatmentsTotal(), currency)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" disabled>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => goToStep(2)} disabled={treatments.length === 0}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
      
      {/* Step 2: Review & Customize */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Review & Customize Your Quote</CardTitle>
                <CardDescription>Adjust treatments and add optional services</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="treatments">
                  <TabsList className="mb-4">
                    <TabsTrigger value="treatments">Selected Treatments</TabsTrigger>
                    <TabsTrigger value="additional">Additional Services</TabsTrigger>
                    <TabsTrigger value="promo">Promo Code</TabsTrigger>
                  </TabsList>
                  <TabsContent value="treatments">
                    <div className="space-y-4">
                      {treatments.length === 0 ? (
                        <p className="text-gray-500">No treatments selected yet</p>
                      ) : (
                        treatments.map((treatment, index) => (
                          <Card key={`${treatment.id}-${index}`}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between">
                                <CardTitle className="text-base">{treatment.name}</CardTitle>
                                <span className="font-medium text-primary">{formatCurrency(treatment.price, currency)}</span>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-sm text-gray-600">{treatment.description}</p>
                            </CardContent>
                            <CardFooter>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => removeTreatment(index)}
                              >
                                Remove
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                      )}
                      <Button onClick={() => goToStep(1)} variant="outline" className="w-full">
                        Add More Treatments
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="additional">
                    <div className="space-y-4">
                      {ADDITIONAL_SERVICES.map(service => {
                        const isAdded = additionalServices.some(s => s.id === service.id);
                        return (
                          <Card key={service.id} className={isAdded ? 'border-primary' : ''}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between">
                                <CardTitle className="text-base">{service.name}</CardTitle>
                                <span className="font-medium text-primary">{formatCurrency(service.price, currency)}</span>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-sm text-gray-600">{service.description}</p>
                            </CardContent>
                            <CardFooter>
                              <Button 
                                variant={isAdded ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleAdditionalService(service)}
                              >
                                {isAdded ? 'Remove' : 'Add to Quote'}
                              </Button>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>
                  <TabsContent value="promo">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Apply Promo Code</CardTitle>
                        <CardDescription>
                          Enter a valid promo code to get a discount on your quote
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex space-x-2">
                          <Input 
                            placeholder="Enter promo code" 
                            value={promoInput} 
                            onChange={e => setPromoInput(e.target.value.toUpperCase())}
                            className="font-mono"
                          />
                          <Button onClick={() => validatePromoCode(promoInput)}>Apply</Button>
                        </div>
                        {isPromoValid === true && (
                          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md flex items-center">
                            <Check className="h-5 w-5 mr-2" />
                            <span>Promo code applied successfully!</span>
                          </div>
                        )}
                        {isPromoValid === false && (
                          <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
                            Invalid promo code. Please try again.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Quote Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Package info if applicable */}
                  {currentPackage && (
                    <div className="bg-primary/5 p-3 rounded-md">
                      <h3 className="font-medium flex items-center text-primary">
                        <Package className="h-4 w-4 mr-2" /> {currentPackage.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{currentPackage.description}</p>
                    </div>
                  )}
                  
                  {/* Treatments */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Selected Treatments</h3>
                    {treatments.length === 0 ? (
                      <p className="text-sm text-gray-500">No treatments selected yet</p>
                    ) : (
                      <ul className="divide-y">
                        {Object.values(groupedTreatments).map(({ treatment, count }) => (
                          <li key={treatment.id} className="py-2 flex justify-between text-sm">
                            <span>{treatment.name} {count > 1 ? `× ${count}` : ''}</span>
                            <span>{formatCurrency(treatment.price * count, currency)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {/* Additional Services */}
                  {additionalServices.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Additional Services</h3>
                      <ul className="divide-y">
                        {additionalServices.map((service) => (
                          <li key={service.id} className="py-2 flex justify-between text-sm">
                            <span>{service.name}</span>
                            <span>{formatCurrency(service.price, currency)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Promo code */}
                  {promoCode && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium flex items-center">
                        <Tag className="h-4 w-4 mr-1" /> Promo Code: <span className="ml-1 font-mono">{promoCode}</span>
                      </span>
                      <span className="text-red-600">-{formatCurrency(calculateDiscount(), currency)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-medium">
                      <span>Treatments Total</span>
                      <span>{formatCurrency(calculateTreatmentsTotal(), currency)}</span>
                    </div>
                    {additionalServices.length > 0 && (
                      <div className="flex justify-between font-medium mt-1">
                        <span>Additional Services</span>
                        <span>{formatCurrency(calculateServicesTotal(), currency)}</span>
                      </div>
                    )}
                    {promoCode && (
                      <div className="flex justify-between font-medium mt-1 text-red-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(calculateDiscount(), currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold mt-3 text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal(), currency)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => goToStep(1)}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => goToStep(3)}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
      
      {/* Step 3: Patient Information */}
      {step === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Contact Information</CardTitle>
                <CardDescription>Enter your details to complete your quote request</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Full Name *</label>
                      <Input 
                        value={patientInfo.name} 
                        onChange={e => updateState({ patientInfo: { ...patientInfo, name: e.target.value } })}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email Address *</label>
                      <Input 
                        type="email"
                        value={patientInfo.email} 
                        onChange={e => updateState({ patientInfo: { ...patientInfo, email: e.target.value } })}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone Number *</label>
                      <Input 
                        value={patientInfo.phone} 
                        onChange={e => updateState({ patientInfo: { ...patientInfo, phone: e.target.value } })}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Additional Notes</label>
                      <Textarea 
                        value={patientInfo.notes} 
                        onChange={e => updateState({ patientInfo: { ...patientInfo, notes: e.target.value } })}
                        placeholder="Any specific questions or concerns? Let us know here."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Quote Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentPackage && (
                    <div className="bg-primary/5 p-3 rounded-md">
                      <h3 className="font-medium flex items-center text-primary">
                        <Package className="h-4 w-4 mr-2" /> {currentPackage.name}
                      </h3>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Selected Treatments</h3>
                    {treatments.length === 0 ? (
                      <p className="text-sm text-gray-500">No treatments selected yet</p>
                    ) : (
                      <ul className="divide-y">
                        {Object.values(groupedTreatments).map(({ treatment, count }) => (
                          <li key={treatment.id} className="py-2 flex justify-between text-sm">
                            <span>{treatment.name} {count > 1 ? `× ${count}` : ''}</span>
                            <span>{formatCurrency(treatment.price * count, currency)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {additionalServices.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Additional Services</h3>
                      <ul className="divide-y">
                        {additionalServices.map((service) => (
                          <li key={service.id} className="py-2 flex justify-between text-sm">
                            <span>{service.name}</span>
                            <span>{formatCurrency(service.price, currency)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {promoCode && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium flex items-center">
                        <Tag className="h-4 w-4 mr-1" /> Promo: <span className="ml-1 font-mono">{promoCode}</span>
                      </span>
                      <span className="text-red-600">-{formatCurrency(calculateDiscount(), currency)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal(), currency)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => goToStep(2)}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => goToStep(4)}>
                  Review Quote <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
      
      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Review Your Quote</CardTitle>
              <CardDescription>Please review all details before submitting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Clipboard className="h-5 w-5 mr-2 text-primary" /> Quote Summary
                  </h3>
                  
                  {currentPackage && (
                    <div className="mb-4">
                      <div className="font-medium">Selected Package:</div>
                      <div className="p-3 bg-white rounded shadow-sm mt-2">
                        <div className="font-medium text-primary">{currentPackage.name}</div>
                        <div className="text-sm text-gray-600">{currentPackage.description}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <div className="font-medium">Selected Treatments:</div>
                    <div className="p-3 bg-white rounded shadow-sm mt-2">
                      {Object.values(groupedTreatments).map(({ treatment, count }) => (
                        <div key={treatment.id} className="flex justify-between py-2 border-b last:border-0">
                          <span>{treatment.name} {count > 1 ? `× ${count}` : ''}</span>
                          <span className="font-medium">{formatCurrency(treatment.price * count, currency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {additionalServices.length > 0 && (
                    <div className="mb-4">
                      <div className="font-medium">Additional Services:</div>
                      <div className="p-3 bg-white rounded shadow-sm mt-2">
                        {additionalServices.map((service) => (
                          <div key={service.id} className="flex justify-between py-2 border-b last:border-0">
                            <span>{service.name}</span>
                            <span className="font-medium">{formatCurrency(service.price, currency)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {promoCode && (
                    <div className="mb-4">
                      <div className="font-medium">Applied Promo Code:</div>
                      <div className="p-3 bg-white rounded shadow-sm mt-2 flex justify-between">
                        <span className="font-mono">{promoCode}</span>
                        <span className="text-red-600 font-medium">-{formatCurrency(calculateDiscount(), currency)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-3 bg-white rounded shadow-sm mt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-primary">{formatCurrency(calculateTotal(), currency)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" /> Your Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Full Name</span>
                      <div className="font-medium">{patientInfo.name || '(Not provided)'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email Address</span>
                      <div className="font-medium">{patientInfo.email || '(Not provided)'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Phone Number</span>
                      <div className="font-medium">{patientInfo.phone || '(Not provided)'}</div>
                    </div>
                  </div>
                  
                  {patientInfo.notes && (
                    <div className="mt-4">
                      <span className="text-sm text-gray-500">Additional Notes</span>
                      <div className="p-3 bg-white rounded shadow-sm mt-1">
                        {patientInfo.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <Button variant="outline" onClick={() => goToStep(3)} className="w-full sm:w-auto">
                <ChevronLeft className="mr-2 h-4 w-4" /> Edit Details
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>Submit Quote Request <Send className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QuoteBuilderPage;