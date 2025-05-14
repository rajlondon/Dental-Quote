import React, { Suspense, lazy } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Lazy load components for improved performance
const QuoteBuilder = lazy(() => import('./QuoteBuilder').then(module => ({ default: module.QuoteBuilder })));
const QuoteSummary = lazy(() => import('./QuoteSummaryOptimized').then(module => ({ default: module.QuoteSummaryOptimized })));
const QuoteConfirmation = lazy(() => import('./QuoteConfirmation').then(module => ({ default: module.QuoteConfirmation })));
const QuoteConfirmationEmail = lazy(() => import('./QuoteConfirmationEmail').then(module => ({ default: module.QuoteConfirmationEmail })));

// Loading fallback component
const LoadingFallback = () => (
  <Card className="w-full">
    <CardContent className="flex items-center justify-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-3 text-lg">Loading quote component...</span>
    </CardContent>
  </Card>
);

export interface LazyQuoteFlowProps {
  step: 'builder' | 'summary' | 'confirmation' | 'email';
  quoteId?: string | number;
  onComplete?: () => void;
  recipientEmail?: string;
}

/**
 * LazyQuoteFlow component that lazy loads the appropriate quote step component
 * This improves performance by only loading the components when needed
 */
export const LazyQuoteFlow: React.FC<LazyQuoteFlowProps> = ({ 
  step, 
  quoteId, 
  onComplete,
  recipientEmail 
}) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {step === 'builder' && <QuoteBuilder onComplete={onComplete} />}
      {step === 'summary' && <QuoteSummary quote={{
        id: quoteId,
        treatments: [],
        packages: [],
        addons: [],
        subtotal: 0,
        discount: 0,
        total: 0,
        promoCode: null,
        promoCodeId: null,
        discountType: null,
        discountValue: null
      }} />}
      {step === 'confirmation' && quoteId && <QuoteConfirmation quoteId={quoteId} onComplete={onComplete} />}
      {step === 'email' && quoteId && <QuoteConfirmationEmail quoteId={quoteId} recipientEmail={recipientEmail} onComplete={onComplete} />}
    </Suspense>
  );
};