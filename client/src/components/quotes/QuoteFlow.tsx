import React, { useState } from 'react';
import { QuoteBuilder } from './QuoteBuilder';
import { QuoteSummary } from './QuoteSummary';
import { QuoteConfirmation } from './QuoteConfirmation';
import { useQuoteBuilder } from '@/hooks/use-quote-builder';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trackEvent } from '@/lib/analytics';

export function QuoteFlow() {
  const [step, setStep] = useState(1);
  const { quote, saveQuote } = useQuoteBuilder();
  const [savedQuoteId, setSavedQuoteId] = useState<string | number | null>(null);
  
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
          trackEvent('quote_saved', 'quote_flow', savedQuote.id.toString());
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
  
  return (
    <div className="quote-flow">
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