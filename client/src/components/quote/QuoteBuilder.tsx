import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFlaskIntegration } from '@/hooks/use-flask-integration';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PackagePreselectionHandler from './PackagePreselectionHandler';

interface QuoteBuilderProps {
  defaultStep?: string;
  standalone?: boolean;
  onComplete?: (quoteData: any) => void;
  clinicId?: string;
  promoCode?: string;
}

const STEPS = [
  { id: 'dental-chart', label: 'Dental Chart' },
  { id: 'treatments', label: 'Treatments' },
  { id: 'promo-code', label: 'Promo Code' },
  { id: 'patient-info', label: 'Your Info' },
  { id: 'review', label: 'Review' },
  { id: 'confirmation', label: 'Confirmation' }
];

export function QuoteBuilder({
  defaultStep = 'dental-chart',
  standalone = true,
  onComplete,
  clinicId,
  promoCode
}: QuoteBuilderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<string>(defaultStep);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedTreatments, setSelectedTreatments] = useState<any[]>([]);
  const [activePromoCode, setActivePromoCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [patientInfo, setPatientInfo] = useState<any>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [quoteReference, setQuoteReference] = useState<string>('');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  // Initialize Flask integration
  const {
    isConnected,
    isLoading,
    error,
    quoteData,
    checkConnection,
    getQuoteState,
    syncWithFlask,
    validatePromoCode,
    savePatientInfo,
    submitQuote,
    getTreatments,
    getSpecialOffers,
    clearError
  } = useFlaskIntegration({
    autoSync: true,
    syncInterval: 10000
  });

  // Handle URL parameters on mount
  useEffect(() => {
    const urlPromoCode = searchParams.get('promoCode') || searchParams.get('promo') || searchParams.get('code') || promoCode;
    const urlClinicId = searchParams.get('clinicId') || searchParams.get('clinic') || clinicId;
    const urlPackageId = searchParams.get('packageId');
    const urlPackageName = searchParams.get('packageName');
    const urlOfferId = searchParams.get('offer');

    if (urlPromoCode) {
      setActivePromoCode(urlPromoCode);
      console.log(`📣 Applying promo code from URL: ${urlPromoCode}`);
      toast({
        title: "Promo Code Applied",
        description: `Promotion "${urlPromoCode}" automatically applied!`,
      });
    }
    
    if (urlPackageId) {
      setSelectedPackageId(urlPackageId);
      console.log(`📦 Detected package ID from URL: ${urlPackageId}`);
      toast({
        title: "Package Selected",
        description: `${urlPackageName || 'Treatment package'} will be applied to your quote.`,
      });
    }

    // Check for values from session storage (coming back from dental quiz)
    const pendingPackageId = sessionStorage.getItem('pendingPackageId');
    const pendingPackageName = sessionStorage.getItem('pendingPackageName');
    const pendingPromoCode = sessionStorage.getItem('pendingPromoCode');
    
    if (pendingPackageId && !urlPackageId) {
      setSelectedPackageId(pendingPackageId);
      console.log(`📦 Applying pending package from session: ${pendingPackageId}`);
      toast({
        title: "Package Retrieved",
        description: `${pendingPackageName || 'Treatment package'} has been applied from your selection.`,
      });
      sessionStorage.removeItem('pendingPackageId');
      sessionStorage.removeItem('pendingPackageName');
    }
    
    if (pendingPromoCode && !urlPromoCode) {
      setActivePromoCode(pendingPromoCode);
      console.log(`🏷️ Applying pending promo code from session: ${pendingPromoCode}`);
      toast({
        title: "Promo Code Retrieved",
        description: `Promotion "${pendingPromoCode}" has been applied.`,
      });
      sessionStorage.removeItem('pendingPromoCode');
    }

    // Sync with Flask and pass URL parameters
    const syncInitialState = async () => {
      await checkConnection();
      
      if (isConnected) {
        const initialState = await getQuoteState();
        
        if (initialState) {
          // Update local state from Flask
          if (initialState.treatments) {
            setSelectedTreatments(initialState.treatments);
          }
          
          if (initialState.patient_info) {
            setPatientInfo(initialState.patient_info);
          }
          
          if (initialState.promo_code) {
            setActivePromoCode(initialState.promo_code);
          }
          
          if (initialState.package_id) {
            setSelectedPackageId(initialState.package_id);
          }
          
          if (initialState.discount_amount) {
            setDiscountAmount(initialState.discount_amount);
          }
          
          if (initialState.step) {
            setCurrentStep(initialState.step);
          }
          
          // Calculate total
          calculateTotal(initialState.treatments || []);
        }
        
        // Sync URL parameters with Flask
        await syncWithFlask({
          promo_code: urlPromoCode,
          clinic_id: urlClinicId,
          offer_id: urlOfferId
        });
      }
    };
    
    syncInitialState();
    
    // Load treatments
    loadTreatments();
  }, [
    searchParams, 
    promoCode, 
    clinicId, 
    checkConnection, 
    getQuoteState, 
    syncWithFlask, 
    isConnected
  ]);

  // Load treatments from Flask
  const loadTreatments = async () => {
    if (isConnected) {
      const data = await getTreatments();
      if (data) {
        setTreatments(data.treatments || []);
        setPackages(data.packages || []);
      }
    }
  };

  // Calculate total amount
  const calculateTotal = (items: any[] = selectedTreatments) => {
    const sum = items.reduce((total, item) => total + (item.price || 0), 0);
    setTotalAmount(sum);
    return sum;
  };

  // Handle treatment selection
  const toggleTreatment = async (treatment: any) => {
    let updatedTreatments;
    
    // Check if treatment is already selected
    const isSelected = selectedTreatments.some(t => t.id === treatment.id);
    
    if (isSelected) {
      // Remove treatment
      updatedTreatments = selectedTreatments.filter(t => t.id !== treatment.id);
    } else {
      // Add treatment
      updatedTreatments = [...selectedTreatments, treatment];
    }
    
    setSelectedTreatments(updatedTreatments);
    
    // Calculate new total
    const newTotal = calculateTotal(updatedTreatments);
    
    // Recalculate discount if promo code is applied
    if (activePromoCode) {
      const result = await validatePromoCode(activePromoCode, newTotal);
      if (result.valid) {
        setDiscountAmount(result.discount);
      }
    }
    
    // Sync with Flask
    await syncWithFlask({
      treatments: updatedTreatments,
      total: newTotal,
      discount_amount: discountAmount
    });
  };

  // Handle promo code application
  const applyPromoCode = async (code: string) => {
    if (!code) {
      toast({
        title: 'Error',
        description: 'Please enter a promo code',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate promo code
    const result = await validatePromoCode(code, totalAmount);
    
    if (result.valid) {
      setActivePromoCode(code);
      setDiscountAmount(result.discount);
      
      toast({
        title: 'Promo Code Applied',
        description: `You saved ${result.discount}€ with code ${code}`,
        variant: 'default'
      });
      
      // Update URL to include promo code
      if (standalone) {
        searchParams.set('promo', code);
        setSearchParams(searchParams);
      }
    } else {
      toast({
        title: 'Invalid Promo Code',
        description: result.message || 'The promo code you entered is invalid',
        variant: 'destructive'
      });
    }
  };

  // Handle patient info submission
  const handlePatientInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Extract form data
    const formData = new FormData(e.currentTarget);
    const patientData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      country: formData.get('country'),
      travelDate: formData.get('travelDate'),
      additionalInfo: formData.get('additionalInfo')
    };
    
    // Save patient info
    const success = await savePatientInfo(patientData);
    
    if (success) {
      setPatientInfo(patientData);
      goToStep('review');
      
      toast({
        title: 'Information Saved',
        description: 'Your information has been saved successfully',
        variant: 'default'
      });
    } else {
      toast({
        title: 'Error',
        description: 'There was an error saving your information',
        variant: 'destructive'
      });
    }
  };

  // Handle quote submission
  const handleSubmitQuote = async () => {
    setSubmitting(true);
    
    try {
      const result = await submitQuote();
      
      if (result) {
        setQuoteReference(result.reference);
        goToStep('confirmation');
        
        toast({
          title: 'Quote Submitted',
          description: 'Your quote has been submitted successfully',
          variant: 'default'
        });
        
        // Call onComplete callback if provided
        if (onComplete) {
          onComplete(result.quote);
        }
      } else {
        toast({
          title: 'Error',
          description: 'There was an error submitting your quote',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error submitting your quote',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Navigation between steps
  const goToStep = (step: string) => {
    setCurrentStep(step);
    
    // Update URL if standalone
    if (standalone) {
      searchParams.set('step', step);
      setSearchParams(searchParams);
    }
    
    // Sync with Flask
    syncWithFlask({ step });
  };

  // Handle next step
  const nextStep = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      goToStep(STEPS[currentIndex + 1].id);
    }
  };

  // Handle previous step
  const prevStep = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      goToStep(STEPS[currentIndex - 1].id);
    }
  };

  // Calculate step progress
  const getStepProgress = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    return {
      current: currentIndex + 1,
      total: STEPS.length,
      percentage: Math.round(((currentIndex + 1) / STEPS.length) * 100)
    };
  };

  if (error) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Connection Error
          </CardTitle>
          <CardDescription>
            We're having trouble connecting to our quote builder service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">{error.message}</p>
          <Button 
            variant="secondary" 
            onClick={() => {
              clearError();
              checkConnection();
            }}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Step Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map((step, index) => (
            <div 
              key={step.id}
              className={`flex flex-col items-center relative ${
                index < STEPS.findIndex(s => s.id === currentStep) 
                  ? 'text-green-600' 
                  : index === STEPS.findIndex(s => s.id === currentStep)
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                index < STEPS.findIndex(s => s.id === currentStep) 
                  ? 'bg-green-100 text-green-600' 
                  : index === STEPS.findIndex(s => s.id === currentStep)
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {index < STEPS.findIndex(s => s.id === currentStep) ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs hidden md:block">{step.label}</span>
              
              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                  index < STEPS.findIndex(s => s.id === currentStep) 
                    ? 'bg-green-500' 
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getStepProgress().percentage}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {STEPS.find(step => step.id === currentStep)?.label}
            {isLoading && <Loader2 className="ml-2 h-5 w-5 inline animate-spin" />}
          </CardTitle>
          <CardDescription>
            {currentStep === 'dental-chart' && 'Select the teeth that require treatment'}
            {currentStep === 'treatments' && 'Choose the dental treatments you need'}
            {currentStep === 'promo-code' && 'Apply a promotional code to get a discount'}
            {currentStep === 'patient-info' && 'Provide your information for the quote'}
            {currentStep === 'review' && 'Review your quote before submitting'}
            {currentStep === 'confirmation' && 'Your quote has been submitted successfully'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Dental Chart Step */}
          {currentStep === 'dental-chart' && (
            <div className="text-center py-6">
              <div className="mb-8 border border-gray-200 rounded-lg p-4">
                <img 
                  src="/images/dental-chart.svg"
                  alt="Interactive Dental Chart"
                  className="max-w-full h-auto"
                />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Click on teeth that require treatment. This helps us provide a more accurate quote.
              </p>
            </div>
          )}
          
          {/* Treatments Step */}
          {currentStep === 'treatments' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Select Your Treatments</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {treatments.map(treatment => (
                  <div 
                    key={treatment.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTreatments.some(t => t.id === treatment.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => toggleTreatment(treatment)}
                  >
                    <div className="flex items-start">
                      <input 
                        type="checkbox"
                        checked={selectedTreatments.some(t => t.id === treatment.id)}
                        onChange={() => toggleTreatment(treatment)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <h4 className="font-medium">{treatment.name}</h4>
                        <p className="text-sm text-gray-600">{treatment.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-blue-600">{treatment.price}€</span>
                          {treatment.discount && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              {treatment.discount}% off
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {packages.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mb-4">Special Packages</h3>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {packages.map(pkg => (
                      <div 
                        key={pkg.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedTreatments.some(t => t.id === pkg.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => toggleTreatment(pkg)}
                      >
                        <div className="flex items-start">
                          <input 
                            type="checkbox"
                            checked={selectedTreatments.some(t => t.id === pkg.id)}
                            onChange={() => toggleTreatment(pkg)}
                            className="mt-1 mr-3"
                          />
                          <div className="w-full">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{pkg.name}</h4>
                              {pkg.badge && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  {pkg.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{pkg.description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <div>
                                <span className="font-bold text-blue-600">{pkg.price}€</span>
                                {pkg.original_price && (
                                  <span className="text-sm text-gray-500 line-through ml-2">
                                    {pkg.original_price}€
                                  </span>
                                )}
                              </div>
                              {pkg.savings && (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  Save {pkg.savings}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {selectedTreatments.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Please select at least one treatment to continue
                </div>
              )}
            </div>
          )}
          
          {/* Promo Code Step */}
          {currentStep === 'promo-code' && (
            <div>
              <div className="mb-6">
                <Label htmlFor="promo-code">Promo Code</Label>
                <div className="flex mt-1">
                  <Input 
                    id="promo-code"
                    placeholder="Enter your promo code"
                    defaultValue={activePromoCode || ''}
                    className="rounded-r-none"
                  />
                  <Button 
                    type="button" 
                    className="rounded-l-none"
                    onClick={() => {
                      const input = document.getElementById('promo-code') as HTMLInputElement;
                      applyPromoCode(input.value);
                    }}
                  >
                    Apply
                  </Button>
                </div>
                
                {activePromoCode && discountAmount > 0 && (
                  <div className="flex items-center mt-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      Promo code applied! You're saving {discountAmount}€
                    </span>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Quote Summary</h4>
                {selectedTreatments.length > 0 ? (
                  <>
                    <div className="space-y-2 mb-4">
                      {selectedTreatments.map(treatment => (
                        <div key={treatment.id} className="flex justify-between">
                          <span>{treatment.name}</span>
                          <span>{treatment.price}€</span>
                        </div>
                      ))}
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium border-t border-b border-gray-200 py-2 my-2">
                        <span>Promo Discount</span>
                        <span>-{discountAmount}€</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold text-lg mt-2">
                      <span>Total</span>
                      <span>{totalAmount - discountAmount}€</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2 text-gray-500">
                    No treatments selected
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Patient Info Step */}
          {currentStep === 'patient-info' && (
            <form onSubmit={handlePatientInfoSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName"
                    name="firstName"
                    required
                    defaultValue={patientInfo.firstName || ''}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName"
                    name="lastName"
                    required
                    defaultValue={patientInfo.lastName || ''}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={patientInfo.email || ''}
                  className="mt-1"
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  defaultValue={patientInfo.phone || ''}
                  className="mt-1"
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="country">Country of Residence</Label>
                <select 
                  id="country"
                  name="country"
                  required
                  defaultValue={patientInfo.country || ''}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select your country</option>
                  <option value="UK">United Kingdom</option>
                  <option value="US">United States</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="ES">Spain</option>
                  <option value="NL">Netherlands</option>
                  <option value="IE">Ireland</option>
                  <option value="BE">Belgium</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="travelDate">Preferred Travel Date (approximate)</Label>
                <Input 
                  id="travelDate"
                  name="travelDate"
                  type="date"
                  defaultValue={patientInfo.travelDate || ''}
                  className="mt-1"
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="additionalInfo">Additional Information (optional)</Label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={3}
                  defaultValue={patientInfo.additionalInfo || ''}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Any specific concerns or requirements?"
                />
              </div>
              
              <div className="flex items-start mb-4">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  required
                  className="mt-1 mr-2"
                />
                <Label htmlFor="consent" className="text-sm">
                  I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                </Label>
              </div>
              
              <Button type="submit" className="w-full">
                Save & Continue
              </Button>
            </form>
          )}
          
          {/* Review Step */}
          {currentStep === 'review' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Selected Treatments</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedTreatments.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {selectedTreatments.map(treatment => (
                        <div key={treatment.id} className="py-3 flex justify-between">
                          <div>
                            <p className="font-medium">{treatment.name}</p>
                            {treatment.description && (
                              <p className="text-sm text-gray-600">{treatment.description}</p>
                            )}
                          </div>
                          <p className="font-medium">{treatment.price}€</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-gray-500">
                      No treatments selected
                    </div>
                  )}
                </div>
              </div>
              
              {activePromoCode && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Applied Promo Code</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Badge className="bg-green-600 mr-3">
                          {activePromoCode}
                        </Badge>
                        <span className="text-green-600 font-medium">
                          You save {discountAmount}€
                        </span>
                      </div>
                      <Button 
                        variant="link" 
                        onClick={() => goToStep('promo-code')}
                        className="text-sm"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Your Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {patientInfo && Object.keys(patientInfo).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">
                          {patientInfo.firstName} {patientInfo.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{patientInfo.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{patientInfo.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Country</p>
                        <p className="font-medium">{patientInfo.country}</p>
                      </div>
                      
                      {patientInfo.travelDate && (
                        <div>
                          <p className="text-sm text-gray-600">Travel Date</p>
                          <p className="font-medium">{patientInfo.travelDate}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-gray-500">
                      No patient information provided
                    </div>
                  )}
                  
                  {patientInfo.additionalInfo && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Additional Information</p>
                      <p className="font-medium">{patientInfo.additionalInfo}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 text-right">
                    <Button 
                      variant="link" 
                      onClick={() => goToStep('patient-info')}
                      className="text-sm"
                    >
                      Edit Information
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-3">Quote Summary</h3>
                {selectedTreatments.length > 0 ? (
                  <>
                    <div className="space-y-2 mb-4">
                      {selectedTreatments.map(treatment => (
                        <div key={treatment.id} className="flex justify-between">
                          <span>{treatment.name}</span>
                          <span>{treatment.price}€</span>
                        </div>
                      ))}
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium border-t border-b border-gray-200 py-2 my-2">
                        <span>Promo Discount</span>
                        <span>-{discountAmount}€</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold text-lg mt-2">
                      <span>Total</span>
                      <span>{totalAmount - discountAmount}€</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2 text-gray-500">
                    No treatments selected
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Confirmation Step */}
          {currentStep === 'confirmation' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">Quote Submitted Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your quote request has been received. We'll review it and get back to you shortly.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left max-w-lg mx-auto">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">What happens next?</h4>
                <ol className="space-y-2 text-blue-800 list-decimal list-inside">
                  <li>Our dental experts will review your quote request</li>
                  <li>We'll match you with the best clinics for your needs</li>
                  <li>You'll receive a detailed quote within 24 hours</li>
                  <li>A personal coordinator will contact you to discuss your options</li>
                </ol>
              </div>
              
              {quoteReference && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Quote Reference</h4>
                  <p className="text-xl font-bold text-blue-600">{quoteReference}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Please save this reference for future communications.
                  </p>
                </div>
              )}
              
              {patientInfo && patientInfo.email && (
                <p className="text-gray-800 mb-4">
                  We've also sent a confirmation email to <span className="font-semibold">{patientInfo.email}</span> with all the details.
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                <Button onClick={() => window.location.href = '/'}>
                  Return to Homepage
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Reset and start again
                    setSelectedTreatments([]);
                    setActivePromoCode(null);
                    setDiscountAmount(0);
                    setTotalAmount(0);
                    setPatientInfo({});
                    setQuoteReference('');
                    goToStep('dental-chart');
                    
                    syncWithFlask({
                      treatments: [],
                      promo_code: null,
                      discount_amount: 0,
                      total: 0,
                      patient_info: {},
                      step: 'dental-chart'
                    });
                  }}
                >
                  Create Another Quote
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {/* Navigation Buttons */}
          {currentStep !== 'confirmation' && (
            <>
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 'dental-chart'}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              {currentStep !== 'review' && currentStep !== 'patient-info' ? (
                <Button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 'treatments' && selectedTreatments.length === 0)
                  }
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                currentStep === 'review' && (
                  <Button
                    onClick={handleSubmitQuote}
                    disabled={submitting}
                  >
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Quote
                  </Button>
                )
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}