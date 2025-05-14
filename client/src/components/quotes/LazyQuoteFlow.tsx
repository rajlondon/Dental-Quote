import React, { lazy, Suspense, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';

// Import types to use for proper type safety
import type { ComponentProps } from 'react';
import type { QuoteBuilder } from '@/components/quotes/QuoteBuilder';
import type { QuoteSummaryOptimized } from '@/components/quotes/QuoteSummaryOptimized';
import type { QuoteConfirmation } from '@/components/quotes/QuoteConfirmation';

// Create dynamic imports for lazy loading with proper typing
const LazyQuoteBuilder = lazy(() => 
  import('@/components/quotes/QuoteBuilder')
    .then(module => ({ 
      default: (props: ComponentProps<typeof QuoteBuilder>) => <module.QuoteBuilder {...props} /> 
    }))
);

const LazyQuoteSummaryOptimized = lazy(() => 
  import('@/components/quotes/QuoteSummaryOptimized')
    .then(module => ({ 
      default: (props: ComponentProps<typeof QuoteSummaryOptimized>) => <module.QuoteSummaryOptimized {...props} /> 
    }))
);

const LazyQuoteConfirmation = lazy(() => 
  import('@/components/quotes/QuoteConfirmation')
    .then(module => ({ 
      default: (props: ComponentProps<typeof QuoteConfirmation>) => <module.QuoteConfirmation {...props} /> 
    }))
);

// Fallback loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2 text-muted-foreground">Loading quote components...</span>
  </div>
);

type Step = 'builder' | 'summary' | 'confirmation';

interface LazyQuoteFlowProps {
  initialStep?: Step;
  quoteId?: string | number;
  specialOfferId?: string;
  promoCode?: string;
  onComplete?: (quoteData: any) => void;
  onCancel?: () => void;
}

/**
 * A performance-optimized quote flow component that uses React.lazy for code splitting
 * and only loads components when they're needed
 */
const LazyQuoteFlow: React.FC<LazyQuoteFlowProps> = ({
  initialStep = 'builder',
  quoteId,
  specialOfferId,
  promoCode,
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(initialStep);
  const [quote, setQuote] = useState<any>(null);
  const { toast } = useToast();

  // Track step changes for analytics
  const goToStep = (step: Step, data?: any) => {
    trackEvent('quote_flow_step', 'navigation', step);
    setCurrentStep(step);
    if (data) {
      setQuote(data);
    }
  };

  // Handle completion of the quote builder step
  const handleBuilderComplete = (quoteData: any) => {
    trackEvent('quote_builder_complete', 'quotes', `total_${quoteData.total}`);
    setQuote(quoteData);
    goToStep('summary');
  };

  // Handle going back from summary to builder
  const handleBackToBuilder = () => {
    trackEvent('quote_summary_back', 'navigation');
    goToStep('builder');
  };

  // Handle confirmation of the quote summary
  const handleSummaryConfirm = (quoteData: any) => {
    trackEvent('quote_summary_confirm', 'quotes', `quote_id_${quoteData.id}`);
    setQuote(quoteData);
    goToStep('confirmation');
  };

  // Handle final confirmation and completion
  const handleConfirmationComplete = (quoteData: any) => {
    trackEvent('quote_flow_complete', 'quotes', `quote_id_${quoteData.id}`);
    
    // Show success toast
    toast({
      title: 'Quote Completed',
      description: 'Your quote has been successfully created and saved.',
    });
    
    // Call the onComplete callback with the final quote data
    if (onComplete) {
      onComplete(quoteData);
    }
  };

  // Handle cancellation of the flow
  const handleCancel = () => {
    trackEvent('quote_flow_cancel', 'navigation', currentStep);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {currentStep === 'builder' && (
        <LazyQuoteBuilder
          quoteId={quoteId}
          specialOfferId={specialOfferId}
          promoCode={promoCode}
          onComplete={handleBuilderComplete}
          onCancel={handleCancel}
        />
      )}
      
      {currentStep === 'summary' && quote && (
        <div className="space-y-6">
          <LazyQuoteSummaryOptimized 
            quote={quote}
            showPromoDetails={true}
          />
          <div className="flex justify-between mt-6">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              onClick={handleBackToBuilder}
            >
              Back to Builder
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary/90"
              onClick={() => handleSummaryConfirm(quote)}
            >
              Confirm Quote
            </button>
          </div>
        </div>
      )}
      
      {currentStep === 'confirmation' && quote && (
        <LazyQuoteConfirmation 
          quote={quote}
          onComplete={handleConfirmationComplete}
          onCancel={handleCancel}
        />
      )}
    </Suspense>
  );
};

export default LazyQuoteFlow;