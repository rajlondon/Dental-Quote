import { QuoteFlow } from "@/components/quotes/QuoteFlow";
import { Container } from "@/components/ui/container";
import { useAutoApplyCode } from "@/hooks/use-auto-apply-code";
import { QuoteFlowProvider, useInitializeQuoteFlow } from "@/contexts/QuoteFlowContext";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";

// QuoteBuilder internal component to handle initialization
function QuoteBuilderInternal() {
  const { initializeFromUrlParams } = useInitializeQuoteFlow();
  const { code, isProcessing } = useAutoApplyCode();
  
  // Track page view when component mounts
  useEffect(() => {
    // Initialize context from URL parameters
    initializeFromUrlParams();
    
    // Track page view with additional context if needed
    const pageContext = code ? `promo_${code}` : 'standard';
    trackEvent('page_view', 'quote_builder', `quote_flow_page_${pageContext}`);
  }, [initializeFromUrlParams, code]);
  
  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Build Your Dental Quote</h1>
      <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
        Create a customized dental treatment quote by selecting treatments, packages, and add-ons. 
        Apply special offers or promo codes to get the best value for your dental care.
      </p>
      
      {/* Show loading state if promo code is still being processed */}
      {isProcessing ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
        </div>
      ) : (
        <QuoteFlow />
      )}
    </Container>
  );
}

// Main page component
export default function QuoteBuilderPage() {
  return (
    <QuoteFlowProvider>
      <QuoteBuilderInternal />
    </QuoteFlowProvider>
  );
}