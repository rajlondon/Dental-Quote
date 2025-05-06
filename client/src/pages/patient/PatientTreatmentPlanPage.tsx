/**
 * Patient Treatment Plan Page
 * 
 * Displays and allows editing of treatment plans for patients
 * Uses the unified treatment plan components
 */
import React from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PatientTreatmentPlan } from '@/components/treatment';
import { ensureUuidFormat } from '@/utils/id-converter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function PatientTreatmentPlanPage() {
  const params = useParams<{id?: string}>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get the plan ID from the URL params
  const planId = params?.id;
  
  // Convert numeric ID to UUID format if needed
  const formattedPlanId = planId ? ensureUuidFormat(planId) : undefined;
  
  // Fetch quote data (if coming from a quote)
  const {
    data: quoteData,
    isLoading: isLoadingQuote,
    error: quoteError
  } = useQuery({
    queryKey: ['/api/quotes/detail', formattedPlanId],
    queryFn: async () => {
      if (!formattedPlanId) return null;
      
      try {
        const response = await apiRequest('GET', `/api/quotes/detail/${formattedPlanId}`);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch quote details');
        }
        
        return result.data;
      } catch (error) {
        console.error('Error fetching quote details:', error);
        return null;
      }
    },
    enabled: !!formattedPlanId && !planId.includes('-'), // Only fetch if it's likely a quote ID (no hyphens)
    retry: false
  });
  
  // Function to handle going back to the quotes list
  const handleBackToQuotes = () => {
    setLocation('/portal/quotes');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBackToQuotes}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quotes
        </Button>
      </div>
      
      {/* Display loading state while fetching data */}
      {isLoadingQuote && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Display quote error */}
      {quoteError && !planId.includes('-') && (
        <div className="text-center py-8">
          <p className="text-destructive mb-2">
            Failed to load quote details. The quote may have been deleted or you don't have permission to view it.
          </p>
          <Button variant="outline" onClick={handleBackToQuotes}>
            Back to Quotes
          </Button>
        </div>
      )}
      
      {/* Display the treatment plan */}
      {/* Since our new component handles loading state internally, we only need to wait for quote data if relevant */}
      {(!isLoadingQuote || planId.includes('-')) && (
        <PatientTreatmentPlan
          planId={planId?.includes('-') ? planId : undefined}
          quoteId={!planId?.includes('-') ? planId : undefined}
          showActions={true}
          showFullDetails={true}
        />
      )}
    </div>
  );
}