import { QuoteFlow } from "@/components/quotes/QuoteFlow";
import { Container } from "@/components/ui/container";
import { QuoteFlowProvider } from "@/contexts/QuoteFlowContext";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";

export default function QuoteBuilderPage() {
  // Track page view when component mounts
  useEffect(() => {
    trackEvent('page_view', 'quote_builder', 'quote_flow_page');
  }, []);

  return (
    <QuoteFlowProvider>
      <Container className="py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Build Your Dental Quote</h1>
        <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Create a customized dental treatment quote by selecting treatments, packages, and add-ons. 
          Apply special offers or promo codes to get the best value for your dental care.
        </p>
        <QuoteFlow />
      </Container>
    </QuoteFlowProvider>
  );
}