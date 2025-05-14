import React, { useState, useEffect, Suspense } from 'react';
import { QuoteBuilder } from './QuoteBuilder';
import { QuoteSummary } from './QuoteSummary';
import { QuoteConfirmation } from './QuoteConfirmation';
import { useQuoteBuilder } from '@/hooks/use-quote-builder';
import { useSpecialOffersInQuote } from '@/hooks/use-special-offers-in-quote';
import { useQuoteFlow } from '@/contexts/QuoteFlowContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { 
  InfoIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon, 
  LoaderIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from '@/lib/analytics';

export function QuoteFlow() {
  const [step, setStep] = useState(1);
  const { quote, saveQuote, addTreatment } = useQuoteBuilder();
  
  // Get context for special offers or other entry points
  const { 
    source, 
    offerId, 
    clinicId, 
    isSpecialOfferFlow, 
    isPackageFlow,
    isPromoTokenFlow
  } = useQuoteFlow();
  
  const { specialOffer, applySpecialOfferToQuote } = useSpecialOffersInQuote(offerId || undefined);
  const [savedQuoteId, setSavedQuoteId] = useState<string | number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Calculate progress percentage
  const progressPercentage = step === 1 ? 33 : step === 2 ? 66 : 100;
  
  // Handle initialization when quote flow has a special context
  useEffect(() => {
    if (isInitialized) return;
    
    if (isSpecialOfferFlow && offerId && specialOffer) {
      console.log('QuoteFlow: Initializing from special offer flow', { offerId });
      
      // If we have a special offer, apply it to the quote
      const updatedQuote = applySpecialOfferToQuote(quote);
      
      if (updatedQuote && updatedQuote.offerDiscount > 0) {
        trackEvent('special_offer_initialized', 'quote_flow', offerId);
        setIsInitialized(true);
        
        // Show toast to notify user
        toast({
          title: "Special Offer Applied",
          description: `${specialOffer.title} has been applied to your quote.`,
          variant: "default",
        });
      } else {
        // Show error toast
        toast({
          title: "Could Not Apply Offer",
          description: "There was an issue applying the special offer. You can continue with a regular quote.",
          variant: "destructive",
        });
        setIsInitialized(true);
      }
    } else {
      // Mark as initialized if it's normal flow (no special context)
      setIsInitialized(true);
    }
  }, [isSpecialOfferFlow, offerId, specialOffer, applySpecialOfferToQuote, quote, isInitialized, toast]);
  
  const handleNext = async () => {
    // Reset any previous errors
    setError(null);
    
    if (step === 1) {
      // Validate at least one treatment is selected
      if (!quote.treatments || quote.treatments.length === 0) {
        setError("Please select at least one treatment before continuing");
        return;
      }
      
      trackEvent('quote_builder_next', 'quote_flow', 'to_review');
      setStep(2);
    } else if (step === 2) {
      try {
        setIsSubmitting(true);
        
        // Save quote before final step
        const savedQuote = await saveQuote({
          // Additional data to track source
          source: source || 'direct',
          flow_type: isSpecialOfferFlow ? 'special_offer' : 
                   isPackageFlow ? 'package' : 
                   isPromoTokenFlow ? 'promo_token' : 'standard'
        } as any);
        
        if (savedQuote && savedQuote.id) {
          setSavedQuoteId(savedQuote.id);
          
          // Track event with context information
          const eventContext = isSpecialOfferFlow ? 'special_offer' : 
                              isPackageFlow ? 'package' : 
                              isPromoTokenFlow ? 'promo_token' : 'normal';
          
          trackEvent('quote_saved', 'quote_flow', `${eventContext}_${savedQuote.id}`);
          
          // Show success toast
          toast({
            title: "Quote Saved Successfully",
            description: "Your dental quote has been saved.",
            variant: "default",
          });
          
          setStep(3);
        }
      } catch (error) {
        console.error('Error saving quote:', error);
        
        // Handle error with toast notification
        setError("There was a problem saving your quote. Please try again.");
        
        toast({
          title: "Error Saving Quote",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleBack = () => {
    // Reset any previous errors when navigating
    setError(null);
    
    if (step === 2) {
      trackEvent('quote_builder_back', 'quote_flow', 'to_builder');
      setStep(1);
    } else if (step === 3) {
      trackEvent('quote_builder_back', 'quote_flow', 'to_review');
      setStep(2);
    }
  };
  
  // Show a special message when user is in a special flow
  const renderSpecialFlowAlert = () => {
    if (!isSpecialOfferFlow || !offerId || !specialOffer) return null;
    
    return (
      <Alert className="mb-6 bg-primary/10 border-primary">
        <InfoIcon className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Special Offer Applied</AlertTitle>
        <AlertDescription className="text-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{specialOffer.title}</span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              {specialOffer.discount_type === 'percentage' ? `${specialOffer.discount_value}% off` : `${specialOffer.discount_value} off`}
            </Badge>
          </div>
          <p className="text-sm">{specialOffer.description}</p>
        </AlertDescription>
      </Alert>
    );
  };
  
  // Show error alert if there's an error
  const renderErrorAlert = () => {
    if (!error) return null;
    
    return (
      <Alert className="mb-6 bg-destructive/10 border-destructive">
        <AlertTriangleIcon className="h-4 w-4 text-destructive" />
        <AlertTitle className="text-destructive">Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  };
  
  return (
    <div className="quote-flow max-w-4xl mx-auto">
      {/* Error alert */}
      {renderErrorAlert()}
      
      {/* Special flow alert */}
      {renderSpecialFlowAlert()}
      
      {/* Mobile-friendly progress bar */}
      <div className="mb-8">
        {/* Visual percentage-based progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Step circles - Hide on smaller screens */}
        <div className="hidden md:flex justify-between items-center px-4">
          <div className="w-full flex items-center">
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${step >= 1 ? 'bg-primary text-white border-primary' : 'bg-muted border-gray-300 text-gray-500'}`}
            >
              1
            </div>
            <div 
              className={`flex-1 h-1 mx-2 
                ${step >= 2 ? 'bg-primary' : 'bg-gray-300'}`}
            ></div>
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${step >= 2 ? 'bg-primary text-white border-primary' : 'bg-muted border-gray-300 text-gray-500'}`}
            >
              2
            </div>
            <div 
              className={`flex-1 h-1 mx-2 
                ${step >= 3 ? 'bg-primary' : 'bg-gray-300'}`}
            ></div>
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${step >= 3 ? 'bg-primary text-white border-primary' : 'bg-muted border-gray-300 text-gray-500'}`}
            >
              3
            </div>
          </div>
        </div>
        
        {/* Mobile-friendly step text */}
        <div className="flex justify-between text-sm text-gray-600 px-2 md:hidden">
          <span className={step >= 1 ? "font-medium text-primary" : ""}>Select</span>
          <span className={step >= 2 ? "font-medium text-primary" : ""}>Review</span>
          <span className={step >= 3 ? "font-medium text-primary" : ""}>Confirm</span>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold">
          {step === 1 && 'Select Treatments'}
          {step === 2 && 'Review Quote'}
          {step === 3 && 'Quote Confirmation'}
        </h2>
        <p className="text-gray-500 mt-1 text-sm md:text-base px-4">
          {step === 1 && 'Add treatments, packages, and add-ons to your quote'}
          {step === 2 && 'Review your selections and apply promo codes'}
          {step === 3 && 'Your quote has been created successfully'}
        </p>
      </div>
      
      {/* Step content */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 md:p-6">
          {step === 1 && (
            <Suspense fallback={
              <div className="flex justify-center items-center py-8">
                <LoaderIcon className="w-8 h-8 animate-spin text-primary" />
              </div>
            }>
              <div className="step-content">
                <QuoteBuilder />
                <div className="mt-8 flex justify-end">
                  <Button 
                    onClick={handleNext}
                    disabled={(!quote.treatments || quote.treatments.length === 0) || isSubmitting}
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    <span>Continue to Review</span>
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Suspense>
          )}
          
          {step === 2 && (
            <Suspense fallback={
              <div className="flex justify-center items-center py-8">
                <LoaderIcon className="w-8 h-8 animate-spin text-primary" />
              </div>
            }>
              <div className="step-content">
                <QuoteSummary quote={quote} />
                <div className="mt-8 flex flex-col md:flex-row justify-between gap-4">
                  <Button 
                    onClick={handleBack} 
                    variant="outline"
                    size="lg"
                    className="order-2 md:order-1"
                    disabled={isSubmitting}
                  >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    <span>Back to Edit</span>
                  </Button>
                  <Button 
                    onClick={handleNext}
                    size="lg"
                    className="order-1 md:order-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Save & Continue</span>
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Suspense>
          )}
          
          {step === 3 && savedQuoteId && (
            <Suspense fallback={
              <div className="flex justify-center items-center py-8">
                <LoaderIcon className="w-8 h-8 animate-spin text-primary" />
              </div>
            }>
              <div className="step-content">
                <QuoteConfirmation quoteId={savedQuoteId} />
                <div className="mt-8 flex justify-start">
                  <Button 
                    onClick={handleBack} 
                    variant="outline"
                    size="lg"
                  >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    <span>Back to Review</span>
                  </Button>
                </div>
              </div>
            </Suspense>
          )}
        </CardContent>
      </Card>
    </div>
  );
}