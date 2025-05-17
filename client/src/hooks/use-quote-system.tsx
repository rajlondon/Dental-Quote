import { useState, useCallback } from 'react';
import { quoteIntegrationService, QuoteData, Treatment } from '@/services/quote-integration-service';
import { useToast } from '@/hooks/use-toast';

// Re-export Treatment type for components that use this hook
export type { Treatment };

/**
 * Hook for interacting with the Quote System
 * 
 * Provides a unified interface for working with quotes across all portals
 * (admin, clinic, patient) with proper loading and error states.
 */
export function useQuoteSystem(
  portalType: 'admin' | 'clinic' | 'patient',
  userId?: string
) {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load quotes for the current portal
  const loadQuotes = useCallback(async () => {
    if (!userId && portalType !== 'admin') {
      setError('User ID is required for clinic and patient portals');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let quotesData: QuoteData[] = [];
      
      if (portalType === 'admin') {
        quotesData = await quoteIntegrationService.getAdminQuotes();
      } else if (portalType === 'clinic' && userId) {
        quotesData = await quoteIntegrationService.getClinicQuotes(userId);
      } else if (portalType === 'patient' && userId) {
        quotesData = await quoteIntegrationService.getPatientQuotes(userId);
      }
      
      setQuotes(quotesData);
    } catch (err) {
      setError('Failed to load quotes. Please try again later.');
      console.error('Error loading quotes:', err);
      toast({
        title: 'Error',
        description: 'Failed to load quotes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [portalType, userId, toast]);

  // Load a single quote's details
  const loadQuoteDetails = useCallback(async (quoteId: string) => {
    if (!quoteId) {
      setError('Quote ID is required');
      return;
    }

    if (!userId && portalType !== 'admin') {
      setError('User ID is required for clinic and patient portals');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let quoteData: QuoteData | null = null;
      
      if (portalType === 'admin') {
        quoteData = await quoteIntegrationService.getAdminQuote(quoteId);
      } else if (portalType === 'clinic' && userId) {
        quoteData = await quoteIntegrationService.getClinicQuote(userId, quoteId);
      } else if (portalType === 'patient' && userId) {
        quoteData = await quoteIntegrationService.getPatientQuote(userId, quoteId);
      }
      
      if (quoteData) {
        setCurrentQuote(quoteData);
        return quoteData;
      } else {
        setError('Quote not found');
        return null;
      }
    } catch (err) {
      setError('Failed to load quote details. Please try again later.');
      console.error('Error loading quote details:', err);
      toast({
        title: 'Error',
        description: 'Failed to load quote details',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [portalType, userId, toast]);

  // Update quote status
  const updateQuoteStatus = useCallback(async (quoteId: string, status: string) => {
    setLoading(true);
    
    try {
      await quoteIntegrationService.updateQuoteStatus(quoteId, status);
      
      // Update the quote in state if it's the current quote
      if (currentQuote && currentQuote.id === quoteId) {
        setCurrentQuote({ ...currentQuote, status });
      }
      
      // Update the quote in the list
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status } : q));
      
      toast({
        title: 'Status updated',
        description: `Quote status has been updated to ${status}`,
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Update failed',
        description: 'Failed to update quote status',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentQuote, toast]);

  // Download quote as PDF
  const downloadQuotePdf = useCallback(async (quoteId: string) => {
    setLoading(true);
    
    try {
      const blob = await quoteIntegrationService.downloadQuotePdf(quoteId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-${quoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Download successful',
        description: 'The quote PDF has been downloaded',
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Download failed',
        description: 'Failed to download quote PDF',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Send quote via email
  const sendQuoteEmail = useCallback(async (quoteId: string, email: string) => {
    setLoading(true);
    
    try {
      await quoteIntegrationService.sendQuoteEmail(quoteId, email);
      
      toast({
        title: 'Email sent',
        description: 'The quote has been sent to the provided email',
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Email failed',
        description: 'Failed to send email',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Request appointment for a quote
  const requestAppointment = useCallback(async (quoteId: string) => {
    setLoading(true);
    
    try {
      await quoteIntegrationService.requestAppointment(quoteId);
      
      // Update the quote status in state
      if (currentQuote && currentQuote.id === quoteId) {
        setCurrentQuote({ ...currentQuote, status: 'appointment_requested' });
      }
      
      // Update in the list
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'appointment_requested' } : q));
      
      toast({
        title: 'Appointment requested',
        description: 'Your appointment request has been sent',
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Request failed',
        description: 'Failed to request appointment',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentQuote, toast]);

  // Update treatment quantity
  const updateTreatmentQuantity = useCallback(async (quoteId: string, treatmentId: string, quantity: number) => {
    setLoading(true);
    
    try {
      await quoteIntegrationService.updateTreatmentQuantity(quoteId, treatmentId, quantity);
      
      // Update the quote in state
      if (currentQuote && currentQuote.id === quoteId && currentQuote.treatments) {
        const updatedTreatments = currentQuote.treatments.map(t => 
          t.id === treatmentId ? { ...t, quantity } : t
        );
        
        setCurrentQuote({
          ...currentQuote,
          treatments: updatedTreatments,
        });
      }
      
      toast({
        title: 'Quantity updated',
        description: 'Treatment quantity has been updated',
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Update failed',
        description: 'Failed to update treatment quantity',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentQuote, toast]);

  // Remove treatment from quote
  const removeTreatment = useCallback(async (quoteId: string, treatmentId: string) => {
    setLoading(true);
    
    try {
      await quoteIntegrationService.removeTreatment(quoteId, treatmentId);
      
      // Update the quote in state
      if (currentQuote && currentQuote.id === quoteId && currentQuote.treatments) {
        const updatedTreatments = currentQuote.treatments.filter(t => t.id !== treatmentId);
        
        setCurrentQuote({
          ...currentQuote,
          treatments: updatedTreatments,
        });
      }
      
      toast({
        title: 'Treatment removed',
        description: 'The treatment has been removed from your quote',
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Removal failed',
        description: 'Failed to remove treatment',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentQuote, toast]);

  // Apply promo code
  const applyPromoCode = useCallback(async (quoteId: string, promoCode: string) => {
    setLoading(true);
    
    try {
      const updatedQuote = await quoteIntegrationService.applyPromoCode(quoteId, promoCode);
      
      // Update the quote in state
      if (currentQuote && currentQuote.id === quoteId) {
        setCurrentQuote(updatedQuote);
      }
      
      // Update in the list
      setQuotes(prev => prev.map(q => q.id === quoteId ? updatedQuote : q));
      
      toast({
        title: 'Promo code applied',
        description: `Promo code ${promoCode} has been applied to your quote`,
      });
      
      return updatedQuote;
    } catch (err) {
      toast({
        title: 'Failed to apply promo code',
        description: 'The promo code could not be applied',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentQuote, toast]);

  // Remove promo code
  const removePromoCode = useCallback(async (quoteId: string) => {
    setLoading(true);
    
    try {
      const updatedQuote = await quoteIntegrationService.removePromoCode(quoteId);
      
      // Update the quote in state
      if (currentQuote && currentQuote.id === quoteId) {
        setCurrentQuote(updatedQuote);
      }
      
      // Update in the list
      setQuotes(prev => prev.map(q => q.id === quoteId ? updatedQuote : q));
      
      toast({
        title: 'Promo code removed',
        description: 'The promo code has been removed from your quote',
      });
      
      return updatedQuote;
    } catch (err) {
      toast({
        title: 'Failed to remove promo code',
        description: 'The promo code could not be removed',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentQuote, toast]);

  // Admin-specific: Assign quote to clinic
  const assignQuoteToClinic = useCallback(async (quoteId: string, clinicId: string) => {
    if (portalType !== 'admin') {
      toast({
        title: 'Permission denied',
        description: 'Only administrators can assign quotes to clinics',
        variant: 'destructive',
      });
      return false;
    }
    
    setLoading(true);
    
    try {
      await quoteIntegrationService.assignQuote(quoteId, clinicId);
      
      // Refresh quotes since the assignment might affect filtering
      await loadQuotes();
      
      toast({
        title: 'Quote assigned',
        description: 'The quote has been assigned to the selected clinic',
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Assignment failed',
        description: 'Failed to assign the quote to the clinic',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [portalType, loadQuotes, toast]);

  // Admin-specific: Unassign quote from clinic
  const unassignQuoteFromClinic = useCallback(async (quoteId: string) => {
    if (portalType !== 'admin') {
      toast({
        title: 'Permission denied',
        description: 'Only administrators can unassign quotes from clinics',
        variant: 'destructive',
      });
      return false;
    }
    
    setLoading(true);
    
    try {
      await quoteIntegrationService.unassignQuote(quoteId);
      
      // Refresh quotes since the unassignment might affect filtering
      await loadQuotes();
      
      toast({
        title: 'Quote unassigned',
        description: 'The quote has been unassigned from the clinic',
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Unassignment failed',
        description: 'Failed to unassign the quote from the clinic',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [portalType, loadQuotes, toast]);

  return {
    quotes,
    currentQuote,
    loading,
    error,
    loadQuotes,
    loadQuoteDetails,
    updateQuoteStatus,
    downloadQuotePdf,
    sendQuoteEmail,
    requestAppointment,
    updateTreatmentQuantity,
    removeTreatment,
    applyPromoCode,
    removePromoCode,
    assignQuoteToClinic,
    unassignQuoteFromClinic,
  };
}