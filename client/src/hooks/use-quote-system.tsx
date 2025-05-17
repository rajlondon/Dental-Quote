/**
 * Hook for accessing the quote system across all portals
 * This hook provides unified access to quote data for the admin, clinic, and patient portals
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QuoteData, Treatment, quoteIntegrationService } from '@/services/quote-integration-service';
import { useToast } from '@/hooks/use-toast';

// Admin Portal hooks
export function useAdminQuotes() {
  return useQuery({
    queryKey: ['/api/admin/quotes'],
    queryFn: async () => {
      return await quoteIntegrationService.getAdminQuotes();
    }
  });
}

export function useAdminQuote(quoteId: string | undefined) {
  return useQuery({
    queryKey: ['/api/admin/quotes', quoteId],
    queryFn: async () => {
      if (!quoteId) return null;
      return await quoteIntegrationService.getAdminQuote(quoteId);
    },
    enabled: !!quoteId
  });
}

// Clinic Portal hooks
export function useClinicQuotes(clinicId: string | undefined) {
  return useQuery({
    queryKey: ['/api/clinic/quotes', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      return await quoteIntegrationService.getClinicQuotes(clinicId);
    },
    enabled: !!clinicId
  });
}

export function useClinicQuote(clinicId: string | undefined, quoteId: string | undefined) {
  return useQuery({
    queryKey: ['/api/clinic/quotes', clinicId, quoteId],
    queryFn: async () => {
      if (!clinicId || !quoteId) return null;
      return await quoteIntegrationService.getClinicQuote(clinicId, quoteId);
    },
    enabled: !!clinicId && !!quoteId
  });
}

// Patient Portal hooks
export function usePatientQuotes(patientId: string | undefined) {
  return useQuery({
    queryKey: ['/api/patient/quotes', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      return await quoteIntegrationService.getPatientQuotes(patientId);
    },
    enabled: !!patientId
  });
}

export function usePatientQuote(patientId: string | undefined, quoteId: string | undefined) {
  return useQuery({
    queryKey: ['/api/patient/quotes', patientId, quoteId],
    queryFn: async () => {
      if (!patientId || !quoteId) return null;
      return await quoteIntegrationService.getPatientQuote(patientId, quoteId);
    },
    enabled: !!patientId && !!quoteId
  });
}

// Shared hooks for all portals
export function useUpdateQuoteStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      quoteId, 
      status 
    }: { 
      quoteId: string; 
      status: string;
    }) => {
      return await quoteIntegrationService.updateQuoteStatus(quoteId, status);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quote status updated successfully",
      });
      
      // Invalidate all quote queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quotes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/quotes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patient/quotes'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update quote status: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}

export function useAssignQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      quoteId, 
      clinicId 
    }: { 
      quoteId: string; 
      clinicId: string;
    }) => {
      return await quoteIntegrationService.assignQuote(quoteId, clinicId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quote assigned to clinic successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quotes'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to assign quote: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}

export function useUnassignQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      quoteId 
    }: { 
      quoteId: string; 
    }) => {
      return await quoteIntegrationService.unassignQuote(quoteId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quote unassigned successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quotes'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to unassign quote: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}

export function useUpdateTreatmentQuantity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      quoteId, 
      treatmentId, 
      quantity 
    }: { 
      quoteId: string; 
      treatmentId: string; 
      quantity: number;
    }) => {
      return await quoteIntegrationService.updateTreatmentQuantity(quoteId, treatmentId, quantity);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Treatment quantity updated",
      });
      
      // Invalidate specific quote
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quotes', variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/quotes', , variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: ['/api/patient/quotes', , variables.quoteId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update treatment: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}

export function useRemoveTreatment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      quoteId, 
      treatmentId 
    }: { 
      quoteId: string; 
      treatmentId: string;
    }) => {
      return await quoteIntegrationService.removeTreatment(quoteId, treatmentId);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Treatment removed from quote",
      });
      
      // Invalidate specific quote
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quotes', variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/quotes', , variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: ['/api/patient/quotes', , variables.quoteId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to remove treatment: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}

export function useSendQuoteEmail() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      quoteId, 
      email 
    }: { 
      quoteId: string; 
      email: string;
    }) => {
      return await quoteIntegrationService.sendQuoteEmail(quoteId, email);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quote sent by email successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to send email: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}

export function useRequestAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      quoteId 
    }: { 
      quoteId: string;
    }) => {
      return await quoteIntegrationService.requestAppointment(quoteId);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Appointment request submitted successfully",
      });
      
      // Invalidate all related quotes
      queryClient.invalidateQueries({ queryKey: ['/api/patient/quotes', , variables.quoteId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to request appointment: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}

export function useDownloadQuotePdf() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      quoteId 
    }: { 
      quoteId: string;
    }) => {
      return await quoteIntegrationService.downloadQuotePdf(quoteId);
    },
    onSuccess: (data, variables) => {
      // Create a download link for the PDF
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-${variables.quoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Quote PDF downloaded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to download PDF: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}