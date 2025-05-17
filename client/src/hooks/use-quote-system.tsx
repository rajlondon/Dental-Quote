import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import quoteIntegrationService from '@/services/quote-integration-service';
import { useToast } from '@/hooks/use-toast';

// Define the Treatment interface
export interface Treatment {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
}

// Define the QuoteData interface
export interface QuoteData {
  id: string;
  createdAt: string;
  patientName: string;
  patientEmail: string;
  treatments: Treatment[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'completed';
  clinicId?: string;
  clinicName?: string;
}

/**
 * Hook for interacting with the quote management system
 * @param portalType The portal type (patient, admin, or clinic)
 */
export const useQuoteSystem = (portalType: 'patient' | 'admin' | 'clinic') => {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all quotes
  const { isLoading: loading, refetch: refetchQuotes } = useQuery({
    queryKey: [`/api/integration/${portalType}/quotes`],
    queryFn: async () => {
      try {
        const fetchedQuotes = await quoteIntegrationService.getQuotes(portalType);
        setQuotes(fetchedQuotes);
        setError(null);
        return fetchedQuotes;
      } catch (err: any) {
        setError(err.message);
        return [];
      }
    },
  });

  // Load a specific quote's details
  const loadQuoteDetails = useCallback(async (quoteId: string) => {
    try {
      const quote = await quoteIntegrationService.getQuoteById(portalType, quoteId);
      setCurrentQuote(quote);
      setError(null);
      return quote;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [portalType]);

  // Load all quotes (can be called manually)
  const loadQuotes = useCallback(async () => {
    try {
      const fetchedQuotes = await quoteIntegrationService.getQuotes(portalType);
      setQuotes(fetchedQuotes);
      setError(null);
      return fetchedQuotes;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [portalType]);

  // Apply promo code mutation
  const applyPromoMutation = useMutation({
    mutationFn: async ({ quoteId, promoCode }: { quoteId: string; promoCode: string }) => {
      return await quoteIntegrationService.applyPromoCode(portalType, quoteId, promoCode);
    },
    onSuccess: (updatedQuote) => {
      setCurrentQuote(updatedQuote);
      // Update the quote in the list as well
      setQuotes((prevQuotes) => 
        prevQuotes.map((q) => (q.id === updatedQuote.id ? updatedQuote : q))
      );
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove promo code mutation
  const removePromoMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      return await quoteIntegrationService.removePromoCode(portalType, quoteId);
    },
    onSuccess: (updatedQuote) => {
      setCurrentQuote(updatedQuote);
      // Update the quote in the list as well
      setQuotes((prevQuotes) => 
        prevQuotes.map((q) => (q.id === updatedQuote.id ? updatedQuote : q))
      );
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update treatment quantity mutation
  const updateTreatmentMutation = useMutation({
    mutationFn: async ({ 
      quoteId, 
      treatmentId, 
      quantity 
    }: { 
      quoteId: string; 
      treatmentId: string; 
      quantity: number 
    }) => {
      return await quoteIntegrationService.updateTreatmentQuantity(
        portalType,
        quoteId,
        treatmentId,
        quantity
      );
    },
    onSuccess: (updatedQuote) => {
      setCurrentQuote(updatedQuote);
      // Update the quote in the list as well
      setQuotes((prevQuotes) => 
        prevQuotes.map((q) => (q.id === updatedQuote.id ? updatedQuote : q))
      );
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove treatment mutation
  const removeTreatmentMutation = useMutation({
    mutationFn: async ({ 
      quoteId, 
      treatmentId 
    }: { 
      quoteId: string; 
      treatmentId: string 
    }) => {
      return await quoteIntegrationService.removeTreatment(
        portalType,
        quoteId,
        treatmentId
      );
    },
    onSuccess: (updatedQuote) => {
      setCurrentQuote(updatedQuote);
      // Update the quote in the list as well
      setQuotes((prevQuotes) => 
        prevQuotes.map((q) => (q.id === updatedQuote.id ? updatedQuote : q))
      );
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Request appointment mutation
  const requestAppointmentMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      return await quoteIntegrationService.requestAppointment(portalType, quoteId);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Appointment request submitted successfully',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Send quote email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      return await quoteIntegrationService.sendQuoteEmail(portalType, quoteId);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Quote sent via email successfully',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Assign clinic to quote mutation (admin only)
  const assignClinicMutation = useMutation({
    mutationFn: async ({ quoteId, clinicId }: { quoteId: string; clinicId: string }) => {
      return await quoteIntegrationService.assignClinicToQuote(quoteId, clinicId);
    },
    onSuccess: (updatedQuote) => {
      setCurrentQuote(updatedQuote);
      // Update the quote in the list as well
      setQuotes((prevQuotes) => 
        prevQuotes.map((q) => (q.id === updatedQuote.id ? updatedQuote : q))
      );
      toast({
        title: 'Success',
        description: 'Clinic assigned to quote successfully',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Wrapper functions for the mutations
  const applyPromoCode = async (quoteId: string, promoCode: string) => {
    return applyPromoMutation.mutateAsync({ quoteId, promoCode });
  };

  const removePromoCode = async (quoteId: string) => {
    return removePromoMutation.mutateAsync(quoteId);
  };

  const updateTreatmentQuantity = async (quoteId: string, treatmentId: string, quantity: number) => {
    return updateTreatmentMutation.mutateAsync({ quoteId, treatmentId, quantity });
  };

  const removeTreatment = async (quoteId: string, treatmentId: string) => {
    return removeTreatmentMutation.mutateAsync({ quoteId, treatmentId });
  };

  const requestAppointment = async (quoteId: string) => {
    return requestAppointmentMutation.mutateAsync(quoteId);
  };

  const sendQuoteEmail = async (quoteId: string) => {
    return sendEmailMutation.mutateAsync(quoteId);
  };

  const assignClinicToQuote = async (quoteId: string, clinicId: string) => {
    return assignClinicMutation.mutateAsync({ quoteId, clinicId });
  };

  const downloadQuotePdf = async (quoteId: string) => {
    return quoteIntegrationService.downloadQuotePdf(portalType, quoteId);
  };

  return {
    quotes,
    currentQuote,
    loading,
    error,
    loadQuotes,
    loadQuoteDetails,
    applyPromoCode,
    removePromoCode,
    updateTreatmentQuantity,
    removeTreatment,
    downloadQuotePdf,
    requestAppointment,
    sendQuoteEmail,
    assignClinicToQuote,
    // For direct access to mutation state if needed
    applyPromoMutation,
    removePromoMutation,
    updateTreatmentMutation,
    removeTreatmentMutation,
    requestAppointmentMutation,
    sendEmailMutation,
    assignClinicMutation,
    // For refreshing the quotes list
    refetchQuotes
  };
};