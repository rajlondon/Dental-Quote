/**
 * Hook for accessing the quote management system
 * This hook provides a unified interface for all portals (admin, clinic, patient)
 * to interact with quotes
 */
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quoteIntegrationService, QuoteData } from '@/services/quote-integration-service';
import { useToast } from '@/hooks/use-toast';

export function useQuoteSystem(
  portalType: 'admin' | 'clinic' | 'patient',
  userId?: string // clinicId or patientId depending on portalType
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  // Admin Portal Queries
  const allQuotesQuery = useQuery({
    queryKey: ['/api/integration/admin/quotes'],
    queryFn: () => quoteIntegrationService.getAdminQuotes(),
    enabled: portalType === 'admin',
  });

  // Clinic Portal Queries
  const clinicQuotesQuery = useQuery({
    queryKey: [`/api/integration/clinic/${userId}/quotes`],
    queryFn: () => quoteIntegrationService.getClinicQuotes(userId!),
    enabled: portalType === 'clinic' && !!userId,
  });

  // Patient Portal Queries
  const patientQuotesQuery = useQuery({
    queryKey: [`/api/integration/patient/${userId}/quotes`],
    queryFn: () => quoteIntegrationService.getPatientQuotes(userId!),
    enabled: portalType === 'patient' && !!userId,
  });

  // Selected Quote Query
  const selectedQuoteQuery = useQuery({
    queryKey: [
      `/api/integration/${portalType}/${portalType === 'admin' ? '' : userId + '/'}quote/${selectedQuoteId}`,
    ],
    queryFn: async () => {
      if (!selectedQuoteId) return null;
      
      if (portalType === 'admin') {
        return quoteIntegrationService.getAdminQuote(selectedQuoteId);
      } else if (portalType === 'clinic' && userId) {
        return quoteIntegrationService.getClinicQuote(userId, selectedQuoteId);
      } else if (portalType === 'patient' && userId) {
        return quoteIntegrationService.getPatientQuote(userId, selectedQuoteId);
      }
      
      return null;
    },
    enabled: !!selectedQuoteId,
  });

  // Mutations
  const assignQuoteMutation = useMutation({
    mutationFn: ({ quoteId, clinicId }: { quoteId: string; clinicId: string }) => 
      quoteIntegrationService.assignQuote(quoteId, clinicId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/integration/admin/quotes'] });
      if (selectedQuoteId) {
        queryClient.invalidateQueries({ queryKey: [`/api/integration/admin/quote/${selectedQuoteId}`] });
      }
      
      toast({
        title: 'Quote Assigned',
        description: 'The quote has been successfully assigned to the clinic',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Assignment Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const unassignQuoteMutation = useMutation({
    mutationFn: ({ quoteId }: { quoteId: string }) => 
      quoteIntegrationService.unassignQuote(quoteId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/integration/admin/quotes'] });
      if (selectedQuoteId) {
        queryClient.invalidateQueries({ queryKey: [`/api/integration/admin/quote/${selectedQuoteId}`] });
      }
      
      toast({
        title: 'Quote Unassigned',
        description: 'The quote has been unassigned from the clinic',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Unassignment Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ quoteId, status }: { quoteId: string; status: string }) => 
      quoteIntegrationService.updateQuoteStatus(quoteId, status),
    onSuccess: () => {
      // Invalidate relevant queries
      if (portalType === 'admin') {
        queryClient.invalidateQueries({ queryKey: ['/api/integration/admin/quotes'] });
      } else if (portalType === 'clinic' && userId) {
        queryClient.invalidateQueries({ queryKey: [`/api/integration/clinic/${userId}/quotes`] });
      }
      
      if (selectedQuoteId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/integration/${portalType}/${portalType === 'admin' ? '' : userId + '/'}quote/${selectedQuoteId}`] 
        });
      }
      
      toast({
        title: 'Status Updated',
        description: 'The quote status has been updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Status Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: ({ quoteId, email }: { quoteId: string; email: string }) => 
      quoteIntegrationService.sendQuoteEmail(quoteId, email),
    onSuccess: () => {
      toast({
        title: 'Email Sent',
        description: 'The quote has been sent via email successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Email Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const requestAppointmentMutation = useMutation({
    mutationFn: ({ quoteId }: { quoteId: string }) => 
      quoteIntegrationService.requestAppointment(quoteId),
    onSuccess: () => {
      toast({
        title: 'Appointment Requested',
        description: 'Your appointment request has been sent to the clinic',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Request Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const downloadPdfMutation = useMutation({
    mutationFn: ({ quoteId }: { quoteId: string }) => 
      quoteIntegrationService.downloadQuotePdf(quoteId),
    onError: (error: Error) => {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateTreatmentQuantityMutation = useMutation({
    mutationFn: ({ quoteId, treatmentId, quantity }: { quoteId: string; treatmentId: string; quantity: number }) => 
      quoteIntegrationService.updateTreatmentQuantity(quoteId, treatmentId, quantity),
    onSuccess: () => {
      if (selectedQuoteId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/integration/${portalType}/${portalType === 'admin' ? '' : userId + '/'}quote/${selectedQuoteId}`] 
        });
      }
      
      toast({
        title: 'Treatment Updated',
        description: 'The treatment quantity has been updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeTreatmentMutation = useMutation({
    mutationFn: ({ quoteId, treatmentId }: { quoteId: string; treatmentId: string }) => 
      quoteIntegrationService.removeTreatment(quoteId, treatmentId),
    onSuccess: () => {
      if (selectedQuoteId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/integration/${portalType}/${portalType === 'admin' ? '' : userId + '/'}quote/${selectedQuoteId}`] 
        });
      }
      
      toast({
        title: 'Treatment Removed',
        description: 'The treatment has been removed from the quote',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Removal Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get the quotes based on portal type
  const quotes = portalType === 'admin' 
    ? allQuotesQuery.data 
    : portalType === 'clinic' 
      ? clinicQuotesQuery.data 
      : patientQuotesQuery.data;

  // Get the selected quote
  const selectedQuote = selectedQuoteQuery.data;

  // Loading/refetching states
  const isLoading = portalType === 'admin' 
    ? allQuotesQuery.isLoading 
    : portalType === 'clinic' 
      ? clinicQuotesQuery.isLoading 
      : patientQuotesQuery.isLoading;

  const isRefetching = portalType === 'admin' 
    ? allQuotesQuery.isRefetching 
    : portalType === 'clinic' 
      ? clinicQuotesQuery.isRefetching 
      : patientQuotesQuery.isRefetching;

  // Refetch function
  const refetchQuotes = () => {
    if (portalType === 'admin') {
      allQuotesQuery.refetch();
    } else if (portalType === 'clinic') {
      clinicQuotesQuery.refetch();
    } else if (portalType === 'patient') {
      patientQuotesQuery.refetch();
    }
  };

  return {
    selectedQuoteId,
    setSelectedQuoteId,
    allQuotesQuery,
    clinicQuotesQuery,
    patientQuotesQuery,
    selectedQuoteQuery,
    assignQuoteMutation,
    unassignQuoteMutation,
    updateStatusMutation, // This is used as "updateQuoteStatusMutation" in components
    sendEmailMutation,
    requestAppointmentMutation,
    downloadPdfMutation,
    updateTreatmentQuantityMutation,
    removeTreatmentMutation,
    quotes,
    selectedQuote,
    isLoading,
    isRefetching,
    refetchQuotes
  };
}