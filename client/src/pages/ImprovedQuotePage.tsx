import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useToast } from '@/hooks/use-toast';
import { Loader2, SendIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import QuoteSummary from '../components/quotes/QuoteSummary';
import { useQuoteStore } from '../stores/quoteStore';

// Import the original StepByStepTreatmentBuilder
import StepByStepTreatmentBuilder from '../components/StepByStepTreatmentBuilder';

export default function ImprovedQuotePage() {
  const { toast } = useToast();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  
  // Use Zustand store for state management
  const {
    flowStep,
    setFlowStep,
    treatments,
    subtotal,
    discount,
    total,
    promoCode,
    promoError,
    isApplyingPromo,
    patientInfo,
    isSaving,
    
    // Actions
    addTreatment,
    removeTreatment,
    updateQuantity,
    applyPromoCode,
    clearPromoCode,
    updatePatientInfo,
    saveQuote,
    resetQuote,
    
    // Calculations
    calculateSubtotal,
    calculateDiscount,
    calculateTotal
  } = useQuoteStore();
  
  // Initialize or restore from previous session
  useEffect(() => {
    // If we have treatments but are on quiz step, move to promo step
    if (treatments.length > 0 && flowStep === 'quiz') {
      setFlowStep('promo');
    }
  }, [treatments, flowStep, setFlowStep]);
  
  // Handle completing the dental quiz/chart
  const handleQuizComplete = (selectedTreatments: any[]) => {
    // Reset any previous quote data
    resetQuote();
    
    // Add selected treatments to the quote
    selectedTreatments.forEach(treatment => {
      addTreatment({
        id: treatment.id || `treatment-${Math.random().toString(36).substring(2, 9)}`,
        name: treatment.name,
        description: treatment.description || '',
        price: treatment.priceGBP || treatment.price || 0,
        quantity: treatment.quantity || 1,
        category: treatment.category || 'general'
      });
    });
    
    // Move to next step
    setFlowStep('promo');
  };
  
  // Handle for "Get My Personalized Quote" button
  const handleGetQuote = () => {
    // If they haven't selected treatments yet, add some defaults
    if (treatments.length === 0) {
      // Add default treatments for demonstration
      addTreatment({
        id: `default-${Math.random().toString(36).substring(2, 9)}`,
        name: 'Dental Check-up & Cleaning',
        description: 'Professional dental cleaning and examination',
        price: 42,
        quantity: 1,
        category: 'general'
      });
      
      addTreatment({
        id: `default-${Math.random().toString(36).substring(2, 9)}`,
        name: 'Zoom Whitening Treatment',
        description: 'Professional whitening treatment',
        price: 140,
        quantity: 1,
        category: 'whitening'
      });
    }
    
    // Move to promo code step
    setFlowStep('promo');
  };
  
  // Handle submission of promo code
  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive"
      });
      return;
    }
    
    // Apply promo code using the store
    const result = await applyPromoCode(promoCodeInput);
    
    if (result.success) {
      // Success! Move to next step
      setFlowStep('patient-info');
      setPromoCodeInput(''); // Clear input
    }
    // Error is shown via promoError in the UI
  };
  
  // Handle skipping promo code
  const handleSkipPromoCode = () => {
    clearPromoCode();
    setFlowStep('patient-info');
  };
  
  // Handle patient info submission
  const handlePatientInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Create patient info object from form data
    const patientData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      preferredDate: formData.get('date') as string,
      notes: formData.get('notes') as string
    };
    
    // Update patient info in store
    updatePatientInfo(patientData);
    
    // Move to review step
    setFlowStep('review');
  };
  
  // Handle final quote submission
  const handleSubmitQuote = async () => {
    // Prepare quote data from current store state
    const quoteData = {
      treatments,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      total: calculateTotal(),
      promoCode,
      patientInfo
    };
    
    // Submit the quote
    const success = await saveQuote(quoteData);
    
    if (success) {
      toast({
        title: "Quote Submitted",
        description: "Your quote has been submitted. We'll be in touch shortly!",
      });
    } else {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
    }
  };
  
  // Render current flow step content
  const renderContent = () => {
    switch (flowStep) {
      case 'quiz':
        return (
          <div className="mb-6">
            <div className="mb-6">
              <StepByStepTreatmentBuilder 
                onComplete={handleQuizComplete}
                initialTreatments={[]}
              />
            </div>
            
            <Card className="shadow-sm mt-12">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Ready for Your Personalized Quote?</h3>
                  <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                    Our system has analyzed your dental needs based on your answers. 
                    Click below to see your personalized treatment plan with available discounts.
                  </p>
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                    <Button 
                      size="lg" 
                      className="px-8 font-medium"
                      onClick={handleGetQuote}
                    >
                      Get My Personalized Quote
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'promo':
        return (
          <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Apply Promotional Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter promo code (e.g., SUMMER15)"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="text-center"
                  />
                  {promoError && (
                    <p className="text-sm text-red-500 mt-1 text-center">{promoError}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleApplyPromoCode}
                    disabled={isApplyingPromo}
                    className="sm:flex-1"
                  >
                    {isApplyingPromo ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      'Apply Code'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSkipPromoCode}
                    className="sm:flex-1"
                  >
                    Continue Without Promo
                  </Button>
                </div>
                
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
            </CardContent>
          </Card>
        );
        
      case 'patient-info':
        return (
          <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form 
                className="space-y-4"
                onSubmit={handlePatientInfoSubmit}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm mb-1">First Name</label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      required 
                      defaultValue={patientInfo?.firstName || ''}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm mb-1">Last Name</label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      required 
                      defaultValue={patientInfo?.lastName || ''}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm mb-1">Email</label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    defaultValue={patientInfo?.email || ''}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm mb-1">Phone</label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    required 
                    defaultValue={patientInfo?.phone || ''}
                  />
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm mb-1">Preferred Date</label>
                  <Input 
                    id="date" 
                    name="date" 
                    type="date" 
                    required 
                    defaultValue={patientInfo?.preferredDate || ''}
                  />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm mb-1">Additional Notes</label>
                  <textarea 
                    id="notes" 
                    name="notes" 
                    className="resize-none w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                    rows={3}
                    defaultValue={patientInfo?.notes || ''}
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full">Continue to Review</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );
        
      case 'review':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-center">Review Your Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <QuoteSummary />
                
                <div className="mt-8 flex justify-center">
                  <Button 
                    onClick={handleSubmitQuote}
                    disabled={isSaving}
                    size="lg"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Quote
                        <SendIcon className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center w-full h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Personalized Treatment Quote</h1>
        
        <div className="mb-8">
          <Tabs value={flowStep}>
            <TabsList className="grid grid-cols-4 mb-8 max-w-3xl mx-auto">
              <TabsTrigger 
                value="quiz" 
                disabled={true}
                className={flowStep === 'quiz' ? 'bg-primary text-primary-foreground' : ''}
              >
                Treatment Quiz
              </TabsTrigger>
              <TabsTrigger 
                value="promo" 
                disabled={true}
                className={flowStep === 'promo' ? 'bg-primary text-primary-foreground' : ''}
              >
                Promo Code
              </TabsTrigger>
              <TabsTrigger 
                value="patient-info" 
                disabled={true}
                className={flowStep === 'patient-info' ? 'bg-primary text-primary-foreground' : ''}
              >
                Your Info
              </TabsTrigger>
              <TabsTrigger 
                value="review" 
                disabled={true}
                className={flowStep === 'review' ? 'bg-primary text-primary-foreground' : ''}
              >
                Review
              </TabsTrigger>
            </TabsList>
            
            {renderContent()}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}