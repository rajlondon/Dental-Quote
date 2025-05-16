import React, { useEffect } from 'react';
import { Layout } from '../components/layouts/Layout';
import { useQuoteStore } from '../stores/quoteStore';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Import components with default exports
import TreatmentSelector from '@/components/quotes/TreatmentSelector';
import PatientInfoForm from '@/components/quotes/PatientInfoForm';
import QuoteSummary from '@/components/quotes/QuoteSummary';

const StandaloneQuotePage: React.FC = () => {
  const [location] = useLocation();
  const [, params] = useRoute('/standalone-quote/:step');
  const { toast } = useToast();
  
  // Access the quote store
  const quoteStore = useQuoteStore();
  const { 
    currentStep, 
    setCurrentStep, 
    treatments, 
    patientInfo, 
    promoCode, 
    discountPercent,
    total,
    applyPromoCode,
    resetQuote
  } = quoteStore;

  // Parse URL parameters for promo code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPromoCode = params.get('promo');
    
    // If promo code is in URL and not already applied, apply it
    if (urlPromoCode && !promoCode) {
      console.log('Applying promo code from URL:', urlPromoCode);
      applyPromoCode(urlPromoCode)
        .then(success => {
          if (success) {
            toast({
              title: 'Promo Code Applied',
              description: `Discount of ${discountPercent}% applied to your quote.`,
            });
          } else {
            toast({
              title: 'Invalid Promo Code',
              description: 'The promo code could not be applied.',
              variant: 'destructive',
            });
          }
        })
        .catch(error => {
          console.error('Error applying promo code:', error);
          toast({
            title: 'Error',
            description: 'Failed to apply promo code.',
            variant: 'destructive',
          });
        });
    }
  }, [location, promoCode, applyPromoCode, toast, discountPercent]);

  // Determine which step to render
  let currentStepParam = params?.step;
  
  // Synchronize URL step with store step if needed
  useEffect(() => {
    if (currentStepParam) {
      if (currentStepParam === 'treatments' || 
          currentStepParam === 'patient-info' || 
          currentStepParam === 'summary') {
        setCurrentStep(currentStepParam);
      }
    }
  }, [currentStepParam, setCurrentStep]);

  // Reset quote on component unmount for safety
  useEffect(() => {
    return () => {
      // Optional cleanup - consider if this is desired behavior
      // resetQuote();
    };
  }, []);

  // Render progress indicator
  const renderProgressIndicator = () => {
    const steps = [
      { id: 'treatments', label: 'Select Treatments' },
      { id: 'patient-info', label: 'Patient Information' },
      { id: 'summary', label: 'Quote Summary' }
    ];

    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center w-full max-w-3xl">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div 
                className={`flex-1 text-center py-2 px-4 rounded-md ${
                  currentStep === step.id 
                    ? 'bg-primary text-white font-bold' 
                    : 'bg-gray-100'
                }`}
              >
                <span className="hidden md:inline">{step.label}</span>
                <span className="md:hidden">{index + 1}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-10 h-1 bg-gray-200 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Render navigation buttons
  const renderNavigation = () => {
    const canGoNext = currentStep === 'treatments' 
      ? treatments.length > 0 
      : currentStep === 'patient-info' 
        ? !!patientInfo?.firstName && !!patientInfo?.lastName && !!patientInfo?.email
        : true;

    const handleNext = () => {
      if (currentStep === 'treatments') {
        setCurrentStep('patient-info');
      } else if (currentStep === 'patient-info') {
        setCurrentStep('summary');
      }
    };

    const handleBack = () => {
      if (currentStep === 'patient-info') {
        setCurrentStep('treatments');
      } else if (currentStep === 'summary') {
        setCurrentStep('patient-info');
      }
    };

    return (
      <div className="flex justify-between mt-8">
        {currentStep !== 'treatments' && (
          <Button 
            variant="outline" 
            onClick={handleBack}
          >
            Back
          </Button>
        )}
        
        <div className="flex-1" />
        
        {currentStep !== 'summary' && (
          <Button 
            onClick={handleNext}
            disabled={!canGoNext}
          >
            {currentStep === 'treatments' ? 'Continue to Patient Info' : 'Review Quote'}
          </Button>
        )}
        
        {currentStep === 'summary' && (
          <Button 
            onClick={() => {
              // Handle quote completion
              quoteStore.saveQuote()
                .then(quoteId => {
                  if (quoteId) {
                    toast({
                      title: 'Quote Saved',
                      description: 'Your quote has been saved successfully!',
                    });
                    // Optionally redirect to quote results
                    // window.location.href = `/matched-clinics?quoteId=${quoteId}`;
                  }
                })
                .catch(error => {
                  console.error('Error saving quote:', error);
                  toast({
                    title: 'Error',
                    description: 'Failed to save your quote.',
                    variant: 'destructive', 
                  });
                });
            }}
          >
            Complete Quote
          </Button>
        )}
      </div>
    );
  };

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'treatments':
        return <TreatmentSelector />;
      case 'patient-info':
        return <PatientInfoForm />;
      case 'summary':
        return <QuoteSummary />;
      default:
        return <div>Error: Unknown step</div>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6">Dental Treatment Quote</h1>
        
        {renderProgressIndicator()}
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {renderStepContent()}
        </div>
        
        {renderNavigation()}
        
        {/* Debugging info - remove in production */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md text-xs">
            <h4 className="font-bold">Debug Info:</h4>
            <p>Current Step: {currentStep}</p>
            <p>URL Step Param: {currentStepParam || 'none'}</p>
            <p>Treatments Count: {treatments.length}</p>
            <p>Patient Info: {patientInfo ? 'Set' : 'Not Set'}</p>
            <p>Promo Code: {promoCode || 'None'}</p>
            <p>Discount: {discountPercent}%</p>
            <p>Total: ${total.toFixed(2)}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StandaloneQuotePage;