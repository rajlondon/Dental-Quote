import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { SimpleDentalChart, DentalChartData } from '../components/dental/SimpleDentalChart';
import StepByStepTreatmentBuilder from '../components/StepByStepTreatmentBuilder';
import { TreatmentItem } from '../components/TreatmentPlanBuilder';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import QuoteSummary from '../components/quotes/QuoteSummary';
import { useTreatmentPackages, TreatmentPackage } from '../hooks/use-treatment-packages';
import { useSpecialOffers } from '../hooks/use-special-offers';
import type { SpecialOffer } from '../hooks/use-special-offers';
import { Input } from '@/components/ui/input';
import { useQuoteStore } from '../stores/quoteStore';

// Define flow steps
type FlowStep = 'dental-chart' | 'quiz' | 'offers-packages' | 'patient-info' | 'review';

export default function EnhancedQuotePage() {
  const { toast } = useToast();
  
  // Flow state management
  const [currentStep, setCurrentStep] = useState<FlowStep>('dental-chart');
  const [isLoading, setIsLoading] = useState(false);
  const [dentalChartData, setDentalChartData] = useState<DentalChartData | null>(null);
  const [treatments, setTreatments] = useState<TreatmentItem[]>([]);
  const [activeTab, setActiveTab] = useState('packages');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isSubmittingPromo, setIsSubmittingPromo] = useState(false);
  
  // Special offers and packages
  const { 
    packages, 
    isLoading: isLoadingPackages, 
    selectedPackage, 
    selectPackage 
  } = useTreatmentPackages();
  
  const { 
    offers, 
    isLoading: isLoadingOffers, 
    selectedOffer, 
    selectOffer 
  } = useSpecialOffers();
  
  // Use quote store for state management
  const {
    addTreatment,
    removeTreatment,
    updateQuantity,
    promoCode,
    applyPromoCode,
    clearPromoCode,
    patientInfo,
    updatePatientInfo,
    clearPatientInfo,
    resetQuote,
    saveQuote,
    loading
  } = useQuoteStore();
  
  // Handle completion of dental chart
  const handleDentalChartComplete = (data: DentalChartData) => {
    setIsLoading(true);
    
    // Process dental chart data
    setTimeout(() => {
      setDentalChartData(data);
      setCurrentStep('quiz');
      setIsLoading(false);
      
      toast({
        title: "Dental Chart Saved",
        description: "Your dental chart information has been processed. Now let's continue with your quote.",
      });
    }, 1000);
  };
  
  // Handle completion of treatment quiz
  const handleQuizComplete = (dentalChartData: any, quizTreatments: TreatmentItem[]) => {
    setIsLoading(true);
    
    // Process treatment data
    setTimeout(() => {
      setTreatments(quizTreatments);
      
      // Add all treatments to the quote store
      resetQuote(); // Clear any previous treatments
      quizTreatments.forEach(treatment => {
        addTreatment({
          id: treatment.id,
          name: treatment.name,
          description: treatment.description || '',
          price: treatment.priceGBP || 0,
          quantity: treatment.quantity || 1
        });
      });
      
      setCurrentStep('offers-packages');
      setIsLoading(false);
      
      toast({
        title: "Treatment Plan Created",
        description: "Your treatment plan has been created. Now check out our special offers and packages!",
      });
    }, 1000);
  };
  
  // Handle package selection
  const handlePackageSelect = (packageData: TreatmentPackage | null) => {
    // If a package was previously selected, deselect it
    if (selectedPackage) {
      selectPackage(null);
    }
    
    // If an offer was previously selected, deselect it
    if (selectedOffer) {
      selectOffer(null);
    }
    
    // If a promo code was applied, clear it
    if (promoCode) {
      clearPromoCode();
    }
    
    // Select the new package
    if (packageData) {
      selectPackage(packageData);
      
      // Remove existing treatments and add package treatments
      resetQuote();
      packageData.treatments.forEach(treatment => {
        addTreatment({
          id: treatment.id,
          name: treatment.name,
          description: treatment.description || '',
          price: treatment.price,
          quantity: treatment.quantity || 1
        });
      });
      
      toast({
        title: "Package Selected",
        description: `You've selected the ${packageData.name} package with a ${packageData.discount}${packageData.discountType === 'percentage' ? '%' : '£'} discount.`,
      });
    }
  };
  
  // Handle offer selection
  const handleOfferSelect = (offer: SpecialOffer | null) => {
    // If a package was previously selected, deselect it
    if (selectedPackage) {
      selectPackage(null);
    }
    
    // If an offer was previously selected, deselect it
    if (selectedOffer) {
      selectOffer(null);
    }
    
    // If a promo code was applied, clear it
    if (promoCode) {
      clearPromoCode();
    }
    
    // Select the new offer
    if (offer) {
      selectOffer(offer);
      
      // Apply the offer's promo code
      applyPromoCode(offer.promoCode);
      
      toast({
        title: "Special Offer Selected",
        description: `You've selected the ${offer.name} offer with a ${offer.discountValue}${offer.discountType === 'percentage' ? '%' : '£'} discount.`,
      });
    }
  };
  
  // Handle promo code submission
  const handlePromoCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCodeInput.trim()) return;
    
    setIsSubmittingPromo(true);
    
    // If a package was previously selected, deselect it
    if (selectedPackage) {
      selectPackage(null);
    }
    
    // If an offer was previously selected, deselect it
    if (selectedOffer) {
      selectOffer(null);
    }
    
    // Simulate API call to validate promo code
    setTimeout(() => {
      const validPromoCodes = ["SUMMER15", "DENTAL25", "NEWPATIENT", "TEST10", "FREECONSULT", "LUXHOTEL20", "IMPLANTCROWN30", "FREEWHITE"];
      
      if (validPromoCodes.includes(promoCodeInput.toUpperCase())) {
        applyPromoCode(promoCodeInput.toUpperCase());
        
        toast({
          title: "Promo Code Applied",
          description: `Successfully applied promo code: ${promoCodeInput.toUpperCase()}`,
        });
      } else {
        toast({
          title: "Invalid Promo Code",
          description: "The promo code you entered is invalid or expired.",
          variant: "destructive",
        });
      }
      
      setIsSubmittingPromo(false);
      setPromoCodeInput('');
    }, 1000);
  };
  
  // Handle patient info changes
  const handlePatientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updatePatientInfo({
      ...patientInfo,
      [name]: value
    });
  };
  
  // Handle navigation to patient info step
  const handleContinueToPatientInfo = () => {
    setCurrentStep('patient-info');
  };
  
  // Handle review quote
  const handleReviewQuote = () => {
    if (!patientInfo?.email || !patientInfo?.firstName) {
      toast({
        title: "Please fill in required fields",
        description: "First name and email are required.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep('review');
  };
  
  // Handle final quote submission
  const handleSubmitQuote = async () => {
    // Save the quote
    await saveQuote();
    
    toast({
      title: "Quote Submitted",
      description: "Your quote has been submitted. We'll be in touch shortly!",
    });
  };
  
  // Render appropriate step content
  const renderStepContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Processing your information...</p>
        </div>
      );
    }
    
    switch (currentStep) {
      case 'dental-chart':
        return <SimpleDentalChart onComplete={handleDentalChartComplete} />;
        
      case 'quiz':
        return (
          <StepByStepTreatmentBuilder 
            onComplete={handleQuizComplete}
            initialTreatments={treatments}
          />
        );
        
      case 'offers-packages':
        return (
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full mb-6">
                      <TabsTrigger value="packages" className="flex-1">Treatment Packages</TabsTrigger>
                      <TabsTrigger value="offers" className="flex-1">Special Offers</TabsTrigger>
                      <TabsTrigger value="promo" className="flex-1">Promo Code</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="packages">
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Select a Treatment Package</h3>
                        <p className="text-muted-foreground">
                          Our carefully designed packages provide the best value for your dental needs.
                        </p>
                        
                        {isLoadingPackages ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {packages.map(pkg => (
                              <div 
                                key={pkg.id}
                                className={`border rounded-lg p-4 cursor-pointer transition-all
                                  ${selectedPackage?.id === pkg.id 
                                    ? 'border-primary bg-primary/5' 
                                    : 'hover:border-primary/50'
                                  }`}
                                onClick={() => handlePackageSelect(selectedPackage?.id === pkg.id ? null : pkg)}
                              >
                                <div className="flex flex-col md:flex-row gap-4">
                                  {pkg.imageUrl && (
                                    <div className="md:w-1/4">
                                      <div className="aspect-video rounded-md overflow-hidden">
                                        <img 
                                          src={pkg.imageUrl} 
                                          alt={pkg.name} 
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className={`${pkg.imageUrl ? 'md:w-3/4' : 'w-full'} flex flex-col justify-between`}>
                                    <div>
                                      <div className="flex justify-between items-start">
                                        <h4 className="text-lg font-medium">{pkg.name}</h4>
                                        <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                                          {pkg.discountType === 'percentage' 
                                            ? `${pkg.discount}% off` 
                                            : `£${pkg.discount} off`}
                                        </div>
                                      </div>
                                      <p className="text-muted-foreground mt-1">{pkg.description}</p>
                                    </div>
                                    
                                    <div className="mt-3">
                                      <div className="text-sm text-muted-foreground">Includes:</div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-1">
                                        {pkg.treatments.map(treatment => (
                                          <div key={treatment.id} className="flex items-center">
                                            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                                            <span className="text-sm">
                                              {treatment.name} {treatment.quantity > 1 ? `(x${treatment.quantity})` : ''}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="offers">
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Special Offers</h3>
                        <p className="text-muted-foreground">
                          Take advantage of our limited-time special offers and discounts.
                        </p>
                        
                        {isLoadingOffers ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {offers.map(offer => (
                              <div 
                                key={offer.id}
                                className={`border rounded-lg p-4 cursor-pointer transition-all
                                  ${selectedOffer?.id === offer.id 
                                    ? 'border-primary bg-primary/5' 
                                    : 'hover:border-primary/50'
                                  }`}
                                onClick={() => handleOfferSelect(selectedOffer?.id === offer.id ? null : offer)}
                              >
                                <div className="flex flex-col md:flex-row gap-4">
                                  {offer.imageUrl && (
                                    <div className="md:w-1/4">
                                      <div className="aspect-video rounded-md overflow-hidden">
                                        <img 
                                          src={offer.imageUrl} 
                                          alt={offer.name} 
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className={`${offer.imageUrl ? 'md:w-3/4' : 'w-full'}`}>
                                    <div className="flex justify-between items-start">
                                      <h4 className="text-lg font-medium">{offer.name}</h4>
                                      <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                                        {offer.discountType === 'percentage' 
                                          ? `${offer.discountValue}% off` 
                                          : `£${offer.discountValue} off`}
                                      </div>
                                    </div>
                                    <p className="text-muted-foreground mt-1">{offer.description}</p>
                                    
                                    {offer.expiryDate && (
                                      <div className="mt-2 text-sm">
                                        <span className="text-muted-foreground">Valid until: </span>
                                        <span className="font-medium">{new Date(offer.expiryDate).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                    
                                    <div className="mt-2 text-sm">
                                      <span className="text-muted-foreground">Code: </span>
                                      <span className="font-medium">{offer.promoCode}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="promo">
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Apply a Promo Code</h3>
                        <p className="text-muted-foreground">
                          Enter your promo code to get an instant discount.
                        </p>
                        
                        <form className="flex gap-2" onSubmit={handlePromoCodeSubmit}>
                          <Input
                            className="max-w-xs"
                            placeholder="Enter promo code"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value)}
                          />
                          <Button 
                            type="submit"
                            disabled={isSubmittingPromo || !promoCodeInput.trim()}
                          >
                            {isSubmittingPromo ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Apply'
                            )}
                          </Button>
                        </form>
                        
                        {promoCode && (
                          <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-md">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium text-green-800">Promo Code Applied</h4>
                                <p className="text-sm text-green-700">Your discount has been applied to the quote.</p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => clearPromoCode()}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-4">
                          <p className="text-sm text-muted-foreground mb-4">Available promo codes for testing:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="border rounded p-2 bg-muted/20">
                              <div className="font-medium">SUMMER15</div>
                              <div>15% off all treatments</div>
                            </div>
                            <div className="border rounded p-2 bg-muted/20">
                              <div className="font-medium">DENTAL25</div>
                              <div>25% off dental services</div>
                            </div>
                            <div className="border rounded p-2 bg-muted/20">
                              <div className="font-medium">NEWPATIENT</div>
                              <div>20% off for new patients</div>
                            </div>
                            <div className="border rounded p-2 bg-muted/20">
                              <div className="font-medium">FREEWHITE</div>
                              <div>Free whitening with crown/veneer</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-6 flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep('quiz')}
                    >
                      Back to Quiz
                    </Button>
                    <Button onClick={handleContinueToPatientInfo}>
                      Continue to Patient Info
                    </Button>
                  </div>
                </div>
                
                <div>
                  <QuoteSummary className="sticky top-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'patient-info':
        return (
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Your Information</h3>
                      <p className="text-muted-foreground mb-4">
                        Please provide your contact information so we can send you the quote
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium">
                          First Name*
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={patientInfo?.firstName || ''}
                          onChange={handlePatientInfoChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium">
                          Last Name
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={patientInfo?.lastName || ''}
                          onChange={handlePatientInfoChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email*
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={patientInfo?.email || ''}
                          onChange={handlePatientInfoChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={patientInfo?.phone || ''}
                          onChange={handlePatientInfoChange}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="preferredDate" className="text-sm font-medium">
                          Preferred Date
                        </label>
                        <Input
                          id="preferredDate"
                          name="preferredDate"
                          type="date"
                          value={patientInfo?.preferredDate || ''}
                          onChange={handlePatientInfoChange}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="notes" className="text-sm font-medium">
                          Additional Notes
                        </label>
                        <Input
                          id="notes"
                          name="notes"
                          value={patientInfo?.notes || ''}
                          onChange={handlePatientInfoChange}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => clearPatientInfo()}
                      >
                        Clear Info
                      </Button>
                      
                      <div className="space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep('offers-packages')}
                        >
                          Back
                        </Button>
                        
                        <Button
                          type="button"
                          onClick={handleReviewQuote}
                          disabled={!patientInfo?.email || !patientInfo?.firstName}
                        >
                          Review Quote
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <QuoteSummary className="sticky top-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'review':
        return (
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-medium mb-4">Review Your Quote</h3>
                      <p className="text-muted-foreground mb-4">
                        Please review your treatment plan and personal information before submitting.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 border rounded-md">
                        <h4 className="font-medium mb-3">Treatment Plan</h4>
                        <table className="w-full text-sm">
                          <thead className="border-b">
                            <tr>
                              <th className="text-left py-2">Treatment</th>
                              <th className="text-center py-2">Quantity</th>
                              <th className="text-right py-2">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {treatments.map((treatment, index) => (
                              <tr key={index} className="border-b">
                                <td className="py-2">{treatment.name}</td>
                                <td className="text-center py-2">{treatment.quantity || 1}</td>
                                <td className="text-right py-2">£{treatment.priceGBP?.toFixed(2) || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <h4 className="font-medium mb-3">Your Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Name:</div>
                            <div>{patientInfo?.firstName} {patientInfo?.lastName}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Email:</div>
                            <div>{patientInfo?.email}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Phone:</div>
                            <div>{patientInfo?.phone || 'Not provided'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Preferred Date:</div>
                            <div>{patientInfo?.preferredDate || 'Not specified'}</div>
                          </div>
                          {patientInfo?.notes && (
                            <div className="col-span-2">
                              <div className="text-sm text-muted-foreground">Additional Notes:</div>
                              <div>{patientInfo.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {(selectedPackage || selectedOffer || promoCode) && (
                        <div className="p-4 border rounded-md">
                          <h4 className="font-medium mb-3">Discount Applied</h4>
                          {selectedPackage && (
                            <div className="mb-2">
                              <span className="text-sm text-muted-foreground">Package: </span>
                              <span>{selectedPackage.name} ({selectedPackage.discountType === 'percentage' ? `${selectedPackage.discount}%` : `£${selectedPackage.discount}`} discount)</span>
                            </div>
                          )}
                          {selectedOffer && (
                            <div className="mb-2">
                              <span className="text-sm text-muted-foreground">Special Offer: </span>
                              <span>{selectedOffer.name} ({selectedOffer.discountType === 'percentage' ? `${selectedOffer.discountValue}%` : `£${selectedOffer.discountValue}`} discount)</span>
                            </div>
                          )}
                          {promoCode && !selectedOffer && (
                            <div>
                              <span className="text-sm text-muted-foreground">Promo Code: </span>
                              <span>{promoCode}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep('patient-info')}
                      >
                        Back to Edit
                      </Button>
                      <Button
                        onClick={handleSubmitQuote}
                        disabled={loading.saveQuote}
                      >
                        {loading.saveQuote ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          'Submit Quote'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <QuoteSummary className="sticky top-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };
  
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Build Your Dental Treatment Quote</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentStep === 'dental-chart' 
                ? "Start by marking your teeth on our interactive dental chart."
                : currentStep === 'quiz'
                  ? "Tell us about your dental needs through our detailed questionnaire."
                  : currentStep === 'offers-packages'
                    ? "Explore our special offers and treatment packages."
                    : currentStep === 'patient-info' 
                      ? "Provide your contact information to receive your quote."
                      : "Review your quote before final submission."
              }
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="max-w-3xl mx-auto mb-8 px-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-500">Your progress</span>
              <span className="text-xs font-medium text-primary">
                {currentStep === 'dental-chart' ? '20%' : 
                 currentStep === 'quiz' ? '40%' : 
                 currentStep === 'offers-packages' ? '60%' : 
                 currentStep === 'patient-info' ? '80%' : '100%'}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ 
                  width: currentStep === 'dental-chart' ? '20%' : 
                         currentStep === 'quiz' ? '40%' : 
                         currentStep === 'offers-packages' ? '60%' : 
                         currentStep === 'patient-info' ? '80%' : '100%' 
                }}
              ></div>
            </div>
          </div>
          
          {renderStepContent()}
        </div>
      </div>
    </Layout>
  );
}