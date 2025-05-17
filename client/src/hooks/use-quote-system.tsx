/**
 * Hook for interacting with the integrated quote system
 * 
 * This hook provides access to quote functionality across all portals
 */
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { quoteService, QuoteData, PatientInfo, Treatment } from '@/services/quote-integration-service';
import { useToast } from '@/hooks/use-toast';

export function useQuoteSystem(portalType: 'admin' | 'clinic' | 'patient', id?: string) {
  const { toast } = useToast();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  // =========== Queries =============

  // Get all quotes (for admin portal)
  const allQuotesQuery = useQuery({
    queryKey: ['/api/export-quotes'],
    queryFn: async () => quoteService.getAllQuotes(),
    enabled: portalType === 'admin'
  });

  // Get clinic quotes (for clinic portal)
  const clinicQuotesQuery = useQuery({
    queryKey: [`/api/clinic-quotes/${id}`],
    queryFn: async () => id ? quoteService.getClinicQuotes(id) : [],
    enabled: portalType === 'clinic' && !!id
  });

  // Get patient quotes (for patient portal)
  const patientQuotesQuery = useQuery({
    queryKey: [`/api/patient-quotes/${id}`],
    queryFn: async () => id ? quoteService.getPatientQuotes(id) : [],
    enabled: portalType === 'patient' && !!id
  });

  // Get a specific quote by ID
  const quoteDetailQuery = useQuery({
    queryKey: [`/api/quote/${selectedQuoteId}`],
    queryFn: async () => selectedQuoteId ? quoteService.getQuoteById(selectedQuoteId) : null,
    enabled: !!selectedQuoteId
  });

  // =========== Mutations ===========

  // Apply promo code
  const applyPromoCodeMutation = useMutation({
    mutationFn: async ({ quoteId, promoCode }: { quoteId: string, promoCode: string }) => {
      return quoteService.applyPromoCode(quoteId, promoCode);
    },
    onSuccess: (data) => {
      toast({
        title: 'Promo code applied',
        description: `You saved ${data.discount.toLocaleString('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        })}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to apply promo code',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Remove promo code
  const removePromoCodeMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      return quoteService.removePromoCode(quoteId);
    },
    onSuccess: () => {
      toast({
        title: 'Promo code removed',
        description: 'The promo code has been removed from your quote',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove promo code',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update treatment quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ 
      quoteId, 
      treatmentId, 
      quantity 
    }: { 
      quoteId: string, 
      treatmentId: string, 
      quantity: number 
    }) => {
      return quoteService.updateTreatmentQuantity(quoteId, treatmentId, quantity);
    },
    onSuccess: () => {
      toast({
        title: 'Treatment updated',
        description: 'Treatment quantity has been updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update treatment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Add treatment
  const addTreatmentMutation = useMutation({
    mutationFn: async ({ 
      quoteId, 
      treatmentId 
    }: { 
      quoteId: string, 
      treatmentId: string 
    }) => {
      return quoteService.addTreatment(quoteId, treatmentId);
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Treatment added',
        description: 'Treatment has been added to your quote',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add treatment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Remove treatment
  const removeTreatmentMutation = useMutation({
    mutationFn: async ({ 
      quoteId, 
      treatmentId 
    }: { 
      quoteId: string, 
      treatmentId: string 
    }) => {
      return quoteService.removeTreatment(quoteId, treatmentId);
    },
    onSuccess: () => {
      toast({
        title: 'Treatment removed',
        description: 'Treatment has been removed from your quote',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove treatment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Generate PDF
  const generatePdfMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      return quoteService.generatePDF(quoteId);
    },
    onSuccess: (pdfBlob) => {
      // Create a download link for the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-${selectedQuoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'PDF Generated',
        description: 'Your quote PDF has been generated and downloaded',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to generate PDF',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Send to email
  const sendEmailMutation = useMutation({
    mutationFn: async ({ quoteId, email }: { quoteId: string, email: string }) => {
      return quoteService.sendToEmail(quoteId, email);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Email Sent',
          description: response.message,
        });
      } else {
        toast({
          title: 'Email Not Sent',
          description: response.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send email',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Apply special offer (patient portal)
  const applySpecialOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      return quoteService.applySpecialOffer(offerId);
    },
    onSuccess: (response) => {
      if (response.success) {
        // Set the new quote as selected
        setSelectedQuoteId(response.quoteId);
        
        toast({
          title: 'Special Offer Applied',
          description: 'The special offer has been applied to your quote',
        });
        
        return response.quoteId;
      } else {
        toast({
          title: 'Failed to Apply Offer',
          description: 'Unable to apply the special offer',
          variant: 'destructive',
        });
        return null;
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Applying Offer',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  });

  // Update quote status (admin/clinic portals)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ quoteId, status }: { quoteId: string, status: string }) => {
      return quoteService.updateQuoteStatus(quoteId, status);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Status Updated',
          description: response.message,
        });
      } else {
        toast({
          title: 'Status Not Updated',
          description: response.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update status',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Assign quote to clinic (admin portal)
  const assignQuoteMutation = useMutation({
    mutationFn: async ({ quoteId, clinicId }: { quoteId: string, clinicId: string }) => {
      return quoteService.assignQuoteToClinic(quoteId, clinicId);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Quote Assigned',
          description: response.message,
        });
      } else {
        toast({
          title: 'Quote Not Assigned',
          description: response.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to assign quote',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    // State
    selectedQuoteId,
    setSelectedQuoteId,
    
    // Queries
    allQuotesQuery,
    clinicQuotesQuery,
    patientQuotesQuery,
    quoteDetailQuery,
    
    // Current quote data based on portalType
    quotes: portalType === 'admin' 
      ? allQuotesQuery.data 
      : portalType === 'clinic' 
        ? clinicQuotesQuery.data 
        : patientQuotesQuery.data,
    currentQuote: quoteDetailQuery.data as QuoteData | null,
    
    // Mutations
    applyPromoCodeMutation,
    removePromoCodeMutation,
    updateQuantityMutation,
    addTreatmentMutation,
    removeTreatmentMutation,
    generatePdfMutation,
    sendEmailMutation,
    applySpecialOfferMutation,
    updateStatusMutation,
    assignQuoteMutation,
  };
}