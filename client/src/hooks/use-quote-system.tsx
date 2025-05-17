/**
 * Hook for accessing the quote system across all portals
 * This hook provides unified access to quote data for the admin, clinic, and patient portals
 */
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import { quoteIntegrationService, QuoteData } from '@/services/quote-integration-service';
import { useToast } from '@/hooks/use-toast';

// Admin Portal Hooks
export function useAdminQuotes() {
  return useQuery({
    queryKey: ['/api/integration/admin/quotes'],
    queryFn: async () => quoteIntegrationService.getAdminQuotes(),
  });
}

export function useAdminQuote(quoteId: string | undefined) {
  return useQuery({
    queryKey: ['/api/integration/admin/quote', quoteId],
    queryFn: async () => {
      if (!quoteId) throw new Error('Quote ID is required');
      return quoteIntegrationService.getAdminQuote(quoteId);
    },
    enabled: !!quoteId,
  });
}

// Clinic Portal Hooks
export function useClinicQuotes(clinicId: string | undefined) {
  return useQuery({
    queryKey: ['/api/integration/clinic/quotes', clinicId],
    queryFn: async () => {
      if (!clinicId) throw new Error('Clinic ID is required');
      return quoteIntegrationService.getClinicQuotes(clinicId);
    },
    enabled: !!clinicId,
  });
}

export function useClinicQuote(clinicId: string | undefined, quoteId: string | undefined) {
  return useQuery({
    queryKey: ['/api/integration/clinic/quote', clinicId, quoteId],
    queryFn: async () => {
      if (!clinicId) throw new Error('Clinic ID is required');
      if (!quoteId) throw new Error('Quote ID is required');
      return quoteIntegrationService.getClinicQuote(clinicId, quoteId);
    },
    enabled: !!clinicId && !!quoteId,
  });
}

// Patient Portal Hooks
export function usePatientQuotes(patientId: string | undefined) {
  return useQuery({
    queryKey: ['/api/integration/patient/quotes', patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      return quoteIntegrationService.getPatientQuotes(patientId);
    },
    enabled: !!patientId,
  });
}

export function usePatientQuote(patientId: string | undefined, quoteId: string | undefined) {
  return useQuery({
    queryKey: ['/api/integration/patient/quote', patientId, quoteId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      if (!quoteId) throw new Error('Quote ID is required');
      return quoteIntegrationService.getPatientQuote(patientId, quoteId);
    },
    enabled: !!patientId && !!quoteId,
  });
}

// Mutation Hooks (Common across portals)
export function useUpdateQuoteStatus() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ quoteId, status }: { quoteId: string; status: string }) => {
      return quoteIntegrationService.updateQuoteStatus(quoteId, status);
    },
    onSuccess: () => {
      toast({
        title: 'Quote Status Updated',
        description: 'The quote status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Quote Status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useAssignQuote() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ quoteId, clinicId }: { quoteId: string; clinicId: string }) => {
      return quoteIntegrationService.assignQuote(quoteId, clinicId);
    },
    onSuccess: () => {
      toast({
        title: 'Quote Assigned',
        description: 'The quote has been assigned to the clinic successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Assign Quote',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUnassignQuote() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ quoteId }: { quoteId: string }) => {
      return quoteIntegrationService.unassignQuote(quoteId);
    },
    onSuccess: () => {
      toast({
        title: 'Quote Unassigned',
        description: 'The quote has been unassigned from the clinic.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Unassign Quote',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTreatmentQuantity() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      quoteId, 
      treatmentId, 
      quantity 
    }: { 
      quoteId: string; 
      treatmentId: string; 
      quantity: number 
    }) => {
      return quoteIntegrationService.updateTreatmentQuantity(quoteId, treatmentId, quantity);
    },
    onSuccess: () => {
      toast({
        title: 'Treatment Updated',
        description: 'The treatment quantity has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Treatment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRemoveTreatment() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ quoteId, treatmentId }: { quoteId: string; treatmentId: string }) => {
      return quoteIntegrationService.removeTreatment(quoteId, treatmentId);
    },
    onSuccess: () => {
      toast({
        title: 'Treatment Removed',
        description: 'The treatment has been removed from the quote.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Remove Treatment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useSendQuoteEmail() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ quoteId, email }: { quoteId: string; email: string }) => {
      return quoteIntegrationService.sendQuoteEmail(quoteId, email);
    },
    onSuccess: () => {
      toast({
        title: 'Email Sent',
        description: 'The quote has been sent to the email successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Send Email',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRequestAppointment() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ quoteId }: { quoteId: string }) => {
      return quoteIntegrationService.requestAppointment(quoteId);
    },
    onSuccess: () => {
      toast({
        title: 'Appointment Requested',
        description: 'Your appointment request has been sent successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Request Appointment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDownloadQuotePdf() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ quoteId }: { quoteId: string }) => {
      return quoteIntegrationService.downloadQuotePdf(quoteId);
    },
    onSuccess: (blob: Blob) => {
      // Create a download link for the PDF
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF Downloaded',
        description: 'The quote PDF has been downloaded successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Download PDF',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}