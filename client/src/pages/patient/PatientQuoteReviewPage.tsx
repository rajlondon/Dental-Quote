import React, { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuotes } from "@/hooks/use-quotes";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import QuoteComparison from "@/components/quotes/quote-comparison";

export default function PatientQuoteReviewPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const quoteId = params?.id ? parseInt(params.id) : undefined;
  
  const { getQuoteQuery } = useQuotes();
  
  // Load specific quote if ID is provided
  const quoteQuery = quoteId ? getQuoteQuery(quoteId) : null;

  useEffect(() => {
    if (quoteId) {
      // Ensure query is refetched when component mounts
      quoteQuery?.refetch();
    }
  }, [quoteId]);

  if (!quoteId) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Quote ID is required</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation("/patient/quotes")}
          >
            Back to Quotes
          </Button>
        </div>
      </div>
    );
  }

  // Handle loading states
  if (quoteQuery?.isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Handle error states
  if (quoteQuery?.error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Error loading quote: {quoteQuery?.error.message}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation("/patient/quotes")}
          >
            Back to Quotes
          </Button>
        </div>
      </div>
    );
  }

  const quoteRequest = quoteQuery?.data?.quoteRequest;
  const versions = quoteQuery?.data?.versions || [];

  if (!quoteRequest) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Quote not found</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation("/patient/quotes")}
          >
            Back to Quotes
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    setLocation(`/patient/quotes/${quoteId}`);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="Review Quote"
        description={`For ${quoteRequest.treatment}`}
        actions={
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quote
          </Button>
        }
      />

      <div className="mt-6">
        <QuoteComparison
          versions={versions}
          quoteId={quoteId}
          onClose={handleBack}
        />
      </div>
    </div>
  );
}