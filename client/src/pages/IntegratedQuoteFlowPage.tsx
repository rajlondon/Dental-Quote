import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { usePersistentQuote } from '@/hooks/use-persistent-quote';
import { useClinic } from '@/hooks/use-clinic';
import { useQuoteIntegration } from '@/hooks/use-quote-integration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, CheckCircle, Smile, Clipboard, User, Building2 } from 'lucide-react';
import ClinicModeIndicator from '@/components/clinic/ClinicModeIndicator';

// Define the steps in our integrated quote flow
const FLOW_STEPS = [
  { id: 'quiz', label: 'Treatment Quiz', icon: <Clipboard className="h-5 w-5 mr-2" /> },
  { id: 'dental-chart', label: 'Dental Chart', icon: <Smile className="h-5 w-5 mr-2" /> },
  { id: 'treatments', label: 'Treatment Selection', icon: <CheckCircle className="h-5 w-5 mr-2" /> },
  { id: 'patient-info', label: 'Your Information', icon: <User className="h-5 w-5 mr-2" /> },
  { id: 'clinics', label: 'Select Clinic', icon: <Building2 className="h-5 w-5 mr-2" /> }
];

const IntegratedQuoteFlowPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { updateState, resetState } = usePersistentQuote();
  const { clinics } = useClinic();
  const { 
    quoteData, 
    quoteId, 
    isSyncing, 
    error, 
    total,
    hasClinic, 
    hasPromo, 
    saveQuote, 
    submitQuote 
  } = useQuoteIntegration();
  
  // Determine current step from URL
  useEffect(() => {
    const stepFromUrl = location.split('/').pop();
    const stepIndex = FLOW_STEPS.findIndex(step => step.id === stepFromUrl);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  }, [location]);
  
  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / FLOW_STEPS.length) * 100;
  
  // Navigate to the specified step
  const navigateToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < FLOW_STEPS.length) {
      const step = FLOW_STEPS[stepIndex];
      setLocation(`/quote-flow/${step.id}`);
    }
  };
  
  // Navigate to next step
  const handleNext = () => {
    if (currentStep < FLOW_STEPS.length - 1) {
      navigateToStep(currentStep + 1);
    } else {
      // If we're on the last step, finalize the quote
      finalizeQuote();
    }
  };
  
  // Navigate to previous step
  const handleBack = () => {
    if (currentStep > 0) {
      navigateToStep(currentStep - 1);
    }
  };
  
  // Reset the quote flow
  const handleReset = () => {
    resetState();
    navigateToStep(0);
    toast({
      title: "Quote cleared",
      description: "Your quote has been reset to start over.",
    });
  };
  
  // Finalize the quote and send to patient portal
  const finalizeQuote = async () => {
    if (isSyncing) {
      toast({
        title: "Please wait",
        description: "Your quote is still being processed.",
      });
      return;
    }
    
    // First, save the quote to get a quote ID
    const savedQuoteId = await saveQuote();
    
    if (!savedQuoteId) {
      toast({
        title: "Error",
        description: "Unable to save quote. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Then submit it to the patient portal
    const submittedQuoteId = await submitQuote();
    
    if (submittedQuoteId) {
      toast({
        title: "Quote finalized",
        description: "Your quote has been sent to the patient portal.",
        variant: "success",
      });
      
      // Redirect to patient portal with the quote ID
      setTimeout(() => {
        setLocation(`/patient-portal/quotes/${submittedQuoteId}`);
      }, 1500);
    } else {
      toast({
        title: "Error",
        description: "Unable to submit quote. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Navigate to the appropriate component based on the current step
  const navigateToComponent = () => {
    const step = FLOW_STEPS[currentStep];
    switch (step.id) {
      case 'quiz':
        setLocation("/dental-treatment-quiz");
        break;
      case 'dental-chart':
        setLocation("/dental-chart");
        break;
      case 'treatments':
        setLocation("/quote-builder");
        break;
      case 'patient-info':
        setLocation("/quote/patient-info");
        break;
      case 'clinics':
        setLocation("/clinic-selection");
        break;
    }
  };
  
  // State for tracking if in clinic mode
  const [isClinicMode, setIsClinicMode] = useState<boolean>(false);
  const [clinicIdFromUrl, setClinicIdFromUrl] = useState<string | null>(null);
  
  // Check for clinic mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const clinicId = params.get('clinic');
      
      if (clinicId) {
        setIsClinicMode(true);
        setClinicIdFromUrl(clinicId);
      } else {
        // Check session storage as well
        const storedClinicId = sessionStorage.getItem('selected_clinic_id') || 
                              sessionStorage.getItem('clinic_id');
        if (storedClinicId) {
          setIsClinicMode(true);
          setClinicIdFromUrl(storedClinicId);
        }
      }
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {isClinicMode && <ClinicModeIndicator clinicId={clinicIdFromUrl} />}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Build Your Dental Treatment Quote</CardTitle>
          <CardDescription>
            Complete each step to create your personalized treatment plan and receive quotes from our partner clinics.
          </CardDescription>
          <Progress value={progressPercentage} className="h-2 mt-4" />
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-6">
          <Tabs defaultValue={FLOW_STEPS[currentStep].id} onValueChange={(value) => {
            const newStepIndex = FLOW_STEPS.findIndex(step => step.id === value);
            if (newStepIndex !== -1) {
              setCurrentStep(newStepIndex);
            }
          }}>
            <TabsList className="grid grid-cols-5 mb-8">
              {FLOW_STEPS.map((step, index) => (
                <TabsTrigger 
                  key={step.id} 
                  value={step.id}
                  disabled={index > currentStep}
                  className="flex items-center"
                >
                  {index < currentStep ? (
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center mr-2">
                      {index + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {FLOW_STEPS.map((step) => (
              <TabsContent key={step.id} value={step.id} className="mt-0">
                <Card className="border-none shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      {step.icon}
                      {step.label}
                    </CardTitle>
                    <CardDescription>
                      {step.id === 'quiz' && "Answer a few questions about the treatments you're interested in."}
                      {step.id === 'dental-chart' && "Use our interactive dental chart to mark areas requiring treatment."}
                      {step.id === 'treatments' && "Select the specific treatments you need and apply any promo codes."}
                      {step.id === 'patient-info' && "Provide your contact information to receive your personalized quote."}
                      {step.id === 'clinics' && "Choose from our partner clinics based on your treatment needs."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-4">
                    <div className="flex justify-center">
                      <Button 
                        onClick={navigateToComponent}
                        className="mt-4"
                        variant="default"
                      >
                        Go to {step.label}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        
        <Separator />
        
        <CardFooter className="flex justify-between pt-6">
          <Button 
            onClick={handleBack} 
            variant="outline" 
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <Button 
            onClick={handleReset} 
            variant="ghost"
          >
            Reset
          </Button>
          
          <Button 
            onClick={handleNext}
          >
            {currentStep === FLOW_STEPS.length - 1 ? 'Finalize Quote' : 'Next'} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IntegratedQuoteFlowPage;