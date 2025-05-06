import React, { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { ensureUuidFormat } from '@/lib/id-converter';
import PatientQuoteDetail from '@/components/patient/PatientQuoteDetail';

export default function PatientQuoteDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const quoteId = params?.id;

  // Use the original ID format - don't convert to UUID
  const formattedQuoteId = quoteId;

  // Fetch the quote data when the component mounts
  const {
    data: quoteData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/quotes/user', formattedQuoteId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/quotes/${formattedQuoteId || quoteId}`);
        return await response.json();
      } catch (error) {
        console.error('Error fetching quote details:', error);
        throw error;
      }
    },
    enabled: !!quoteId,
  });

  // Handle back navigation
  const handleBack = () => {
    setLocation('/patient/quotes');
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <p className="text-red-500 text-lg mb-4">
                Error loading quote: {(error as Error).message}
              </p>
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Quotes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the quote detail component if data is available
  if (quoteData && quoteId) {
    return (
      <div className="container mx-auto py-6 px-4">
        <PatientQuoteDetail 
          quoteId={quoteId}
          onBack={handleBack}
        />
      </div>
    );
  }

  // Fallback if there's no data but also no error
  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <p className="text-amber-500 text-lg mb-4">
              Quote information not available
            </p>
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quotes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}