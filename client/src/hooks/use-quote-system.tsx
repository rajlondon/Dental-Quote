import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { QuoteIntegrationService } from '@/services/quote-integration-service';
import { Treatment } from '@/components/quotes/TreatmentList';

export interface QuoteData {
  id: string;
  status: string;
  created_at: string;
  patient_id?: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  clinic_id?: string;
  clinic_name?: string;
  promo_code?: string;
  discount_percent?: number;
  subtotal: number;
  discount_amount: number;
  total: number;
  treatments: Treatment[];
}

type PortalType = 'admin' | 'clinic' | 'patient';

/**
 * Hook for interacting with the quote system
 * This hook provides a consistent interface for quote management across 
 * admin, clinic, and patient portals
 */
export function useQuoteSystem(portalType: PortalType) {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const quoteService = new QuoteIntegrationService(portalType);

  // Load all quotes for the current portal
  const loadQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await quoteService.getQuotes();
      setQuotes(data);
      return data;
    } catch (err: any) {
      setError('Failed to load quotes: ' + (err.message || 'Unknown error'));
      console.error('Error loading quotes:', err);
      toast({
        title: 'Error',
        description: 'Failed to load quotes',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [quoteService, toast]);

  // Load details for a specific quote
  const loadQuoteDetails = useCallback(async (quoteId: string) => {
    if (!quoteId) {
      setError('Quote ID is required');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await quoteService.getQuoteDetails(quoteId);
      setCurrentQuote(data);
      return data;
    } catch (err: any) {
      setError('Failed to load quote details: ' + (err.message || 'Unknown error'));
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
  }, [quoteService, toast]);

  // Apply a promo code to a quote
  const applyPromoCode = useCallback(async (quoteId: string, promoCode: string) => {
    if (!quoteId || !promoCode) {
      throw new Error('Quote ID and promo code are required');
    }

    setLoading(true);
    
    try {
      const updatedQuote = await quoteService.applyPromoCode(quoteId, promoCode);
      setCurrentQuote(updatedQuote);
      return updatedQuote;
    } catch (err: any) {
      console.error('Error applying promo code:', err);
      throw new Error(err.message || 'Failed to apply promo code');
    } finally {
      setLoading(false);
    }
  }, [quoteService]);

  // Remove a promo code from a quote
  const removePromoCode = useCallback(async (quoteId: string) => {
    if (!quoteId) {
      throw new Error('Quote ID is required');
    }

    setLoading(true);
    
    try {
      const updatedQuote = await quoteService.removePromoCode(quoteId);
      setCurrentQuote(updatedQuote);
      return updatedQuote;
    } catch (err: any) {
      console.error('Error removing promo code:', err);
      throw new Error(err.message || 'Failed to remove promo code');
    } finally {
      setLoading(false);
    }
  }, [quoteService]);

  // Update treatment quantity in a quote
  const updateTreatmentQuantity = useCallback(async (quoteId: string, treatmentId: string, quantity: number) => {
    if (!quoteId || !treatmentId || quantity < 1) {
      throw new Error('Quote ID, treatment ID, and valid quantity are required');
    }

    setLoading(true);
    
    try {
      await quoteService.updateTreatmentQuantity(quoteId, treatmentId, quantity);
      
      // Update local state by fetching the updated quote details
      const updatedQuote = await quoteService.getQuoteDetails(quoteId);
      setCurrentQuote(updatedQuote);
      return updatedQuote;
    } catch (err: any) {
      console.error('Error updating treatment quantity:', err);
      throw new Error(err.message || 'Failed to update treatment quantity');
    } finally {
      setLoading(false);
    }
  }, [quoteService]);

  // Remove a treatment from a quote
  const removeTreatment = useCallback(async (quoteId: string, treatmentId: string) => {
    if (!quoteId || !treatmentId) {
      throw new Error('Quote ID and treatment ID are required');
    }

    setLoading(true);
    
    try {
      await quoteService.removeTreatment(quoteId, treatmentId);
      
      // Update local state by fetching the updated quote details
      const updatedQuote = await quoteService.getQuoteDetails(quoteId);
      setCurrentQuote(updatedQuote);
      return updatedQuote;
    } catch (err: any) {
      console.error('Error removing treatment:', err);
      throw new Error(err.message || 'Failed to remove treatment');
    } finally {
      setLoading(false);
    }
  }, [quoteService]);

  // Update quote status
  const updateQuoteStatus = useCallback(async (quoteId: string, status: string) => {
    if (!quoteId || !status) {
      throw new Error('Quote ID and status are required');
    }

    setLoading(true);
    
    try {
      await quoteService.updateQuoteStatus(quoteId, status);
      
      // Update local state
      if (currentQuote && currentQuote.id === quoteId) {
        setCurrentQuote({
          ...currentQuote,
          status
        });
      }
      
      // Also update the quote in the quotes list
      setQuotes(prevQuotes => 
        prevQuotes.map(q => 
          q.id === quoteId ? { ...q, status } : q
        )
      );
      
      return true;
    } catch (err: any) {
      console.error('Error updating quote status:', err);
      throw new Error(err.message || 'Failed to update quote status');
    } finally {
      setLoading(false);
    }
  }, [quoteService, currentQuote]);

  // Download quote PDF
  const downloadQuotePdf = useCallback(async (quoteId: string) => {
    if (!quoteId) {
      throw new Error('Quote ID is required');
    }

    setLoading(true);
    
    try {
      await quoteService.downloadQuotePdf(quoteId);
      return true;
    } catch (err: any) {
      console.error('Error downloading quote PDF:', err);
      throw new Error(err.message || 'Failed to download quote PDF');
    } finally {
      setLoading(false);
    }
  }, [quoteService]);

  // Send quote via email
  const sendQuoteEmail = useCallback(async (quoteId: string, email: string) => {
    if (!quoteId || !email) {
      throw new Error('Quote ID and email address are required');
    }

    setLoading(true);
    
    try {
      await quoteService.sendQuoteEmail(quoteId, email);
      return true;
    } catch (err: any) {
      console.error('Error sending quote email:', err);
      throw new Error(err.message || 'Failed to send quote email');
    } finally {
      setLoading(false);
    }
  }, [quoteService]);

  // Request appointment for a quote
  const requestAppointment = useCallback(async (quoteId: string) => {
    if (!quoteId) {
      throw new Error('Quote ID is required');
    }

    setLoading(true);
    
    try {
      await quoteService.requestAppointment(quoteId);
      
      // Update local state to reflect the appointment request
      if (currentQuote && currentQuote.id === quoteId) {
        setCurrentQuote({
          ...currentQuote,
          status: 'appointment_requested'
        });
      }
      
      // Also update the quote in the quotes list
      setQuotes(prevQuotes => 
        prevQuotes.map(q => 
          q.id === quoteId ? { ...q, status: 'appointment_requested' } : q
        )
      );
      
      return true;
    } catch (err: any) {
      console.error('Error requesting appointment:', err);
      throw new Error(err.message || 'Failed to request appointment');
    } finally {
      setLoading(false);
    }
  }, [quoteService, currentQuote]);

  // Admin-specific: Assign a quote to a clinic
  const assignQuoteToClinic = useCallback(async (quoteId: string, clinicId: string) => {
    if (!quoteId || !clinicId) {
      throw new Error('Quote ID and clinic ID are required');
    }

    if (portalType !== 'admin') {
      throw new Error('Only admin can assign quotes to clinics');
    }

    setLoading(true);
    
    try {
      await quoteService.assignQuoteToClinic(quoteId, clinicId);
      
      // Refresh quotes after assignment
      await loadQuotes();
      
      return true;
    } catch (err: any) {
      console.error('Error assigning quote to clinic:', err);
      throw new Error(err.message || 'Failed to assign quote to clinic');
    } finally {
      setLoading(false);
    }
  }, [quoteService, portalType, loadQuotes]);

  // Admin-specific: Unassign a quote from a clinic
  const unassignQuoteFromClinic = useCallback(async (quoteId: string) => {
    if (!quoteId) {
      throw new Error('Quote ID is required');
    }

    if (portalType !== 'admin') {
      throw new Error('Only admin can unassign quotes from clinics');
    }

    setLoading(true);
    
    try {
      await quoteService.unassignQuoteFromClinic(quoteId);
      
      // Refresh quotes after unassignment
      await loadQuotes();
      
      return true;
    } catch (err: any) {
      console.error('Error unassigning quote from clinic:', err);
      throw new Error(err.message || 'Failed to unassign quote from clinic');
    } finally {
      setLoading(false);
    }
  }, [quoteService, portalType, loadQuotes]);

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
    updateQuoteStatus,
    downloadQuotePdf,
    sendQuoteEmail,
    requestAppointment,
    assignQuoteToClinic,
    unassignQuoteFromClinic
  };
}