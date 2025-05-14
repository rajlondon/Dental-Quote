import React, { useState, useEffect } from 'react';
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
import { InfoIcon, CheckCircleIcon } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export function QuoteFlow() {
  const [step, setStep] = useState(1);
  const { quote, saveQuote, addTreatment } = useQuoteBuilder();
  const { applicableOffers, applyOffer } = useSpecialOffersInQuote();
  const [savedQuoteId, setSavedQuoteId] = useState<string | number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get context for special offers or other entry points
  const { 
    source, 
    offerId, 
    clinicId, 
    isSpecialOfferFlow, 
    isPackageFlow,
    isPromoTokenFlow
  } = useQuoteFlow();
  
  // Handle initialization when quote flow has a special context
  useEffect(() => {
    if (isInitialized) return;
    
    if (isSpecialOfferFlow && offerId) {
      console.log('QuoteFlow: Initializing from special offer flow', { offerId });
      
      // If we have a special offer, apply it to the quote
      const success = applyOffer(offerId);
      
      if (success) {
        trackEvent('special_offer_initialized', 'quote_flow', offerId);
        setIsInitialized(true);
      }
    } else {
      // Mark as initialized if it's normal flow (no special context)
      setIsInitialized(true);
    }
  }, [isSpecialOfferFlow, offerId, applyOffer, isInitialized]);
  
  const handleNext = async () => {
    if (step === 1) {
      trackEvent('quote_builder_next', 'quote_flow', 'to_review');
      setStep(2);
    } else if (step === 2) {
      try {
        // Save quote before final step
        const savedQuote = await saveQuote();
        if (savedQuote && savedQuote.id) {
          setSavedQuoteId(savedQuote.id);
          
          // Track event with context information
          const eventContext = isSpecialOfferFlow ? 'special_offer' : 
                              isPackageFlow ? 'package' : 
                              isPromoTokenFlow ? 'promo_token' : 'normal';
          
          trackEvent('quote_saved', 'quote_flow', `${eventContext}_${savedQuote.id}`);
          setStep(3);
        }
      } catch (error) {
        console.error('Error saving quote:', error);
        // Handle error
      }
    }
  };
  
  const handleBack = () => {
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
    if (!isSpecialOfferFlow || !offerId) return null;
    
    // Find the offer in the applicable offers
    const offer = applicableOffers.find(o => o.id === offerId);
    
    if (!offer) return null;
    
    return (
      <Alert className="mb-6 bg-primary/10 border-primary">
        <InfoIcon className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Special Offer Applied</AlertTitle>
        <AlertDescription className="text-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{offer.title}</span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              {offer.discount_type === 'percentage' ? `${offer.discount_value}% off` : `${offer.discount_value} off`}
            </Badge>
          </div>
          <p className="text-sm">{offer.description}</p>
        </AlertDescription>
      </Alert>
    );
  };
  
  return (
    <div className="quote-flow">
      {/* Special flow alert */}
      {renderSpecialFlowAlert()}
      
      {/* Progress indicator */}
      <div className="flex justify-between items-center mb-8 px-4">
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
      
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">
          {step === 1 && 'Select Treatments'}
          {step === 2 && 'Review Quote'}
          {step === 3 && 'Quote Confirmation'}
        </h2>
        <p className="text-gray-500 mt-1">
          {step === 1 && 'Add treatments, packages, and add-ons to your quote'}
          {step === 2 && 'Review your selections and apply promo codes'}
          {step === 3 && 'Your quote has been created successfully'}
        </p>
      </div>
      
      {/* Step content */}
      {step === 1 && (
        <div className="step-content">
          <QuoteBuilder />
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={handleNext}
              disabled={!quote.treatments || quote.treatments.length === 0}
              size="lg"
            >
              Continue to Review
            </Button>
          </div>
        </div>
      )}
      
      {step === 2 && (
        <div className="step-content">
          <QuoteSummary quote={quote} />
          <div className="mt-8 flex justify-between">
            <Button 
              onClick={handleBack} 
              variant="outline"
              size="lg"
            >
              Back to Edit
            </Button>
            <Button 
              onClick={handleNext}
              size="lg"
            >
              Save & Continue
            </Button>
          </div>
        </div>
      )}
      
      {step === 3 && savedQuoteId && (
        <div className="step-content">
          <QuoteConfirmation quoteId={savedQuoteId} />
          <div className="mt-8 flex justify-start">
            <Button 
              onClick={handleBack} 
              variant="outline"
              size="lg"
            >
              Back to Review
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}