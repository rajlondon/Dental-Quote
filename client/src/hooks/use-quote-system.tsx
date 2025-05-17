import { useState, useCallback } from 'react';
import { quoteIntegrationService, QuoteData } from '@/services/quote-integration-service';
import { toast } from '@/hooks/use-toast';

export interface QuoteSystemOptions {
  portalType: 'admin' | 'clinic' | 'patient';
  patientId?: string;
  clinicId?: string;
}

export const useQuoteSystem = ({ portalType, patientId, clinicId }: QuoteSystemOptions) => {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all quotes for the current portal
  const loadQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedQuotes: QuoteData[] = [];
      
      if (portalType === 'admin') {
        fetchedQuotes = await quoteIntegrationService.getAdminQuotes();
      } else if (portalType === 'clinic' && clinicId) {
        fetchedQuotes = await quoteIntegrationService.getClinicQuotes(clinicId);
      } else if (portalType === 'patient' && patientId) {
        fetchedQuotes = await quoteIntegrationService.getPatientQuotes(patientId);
      } else {
        throw new Error('Invalid portal configuration');
      }
      
      setQuotes(fetchedQuotes);
    } catch (err: any) {
      console.error('Error loading quotes:', err);
      setError(err.message || 'Failed to load quotes');
      toast({
        title: 'Error',
        description: 'Failed to load quotes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [portalType, patientId, clinicId]);

  // Load details for a specific quote
  const loadQuoteDetails = useCallback(async (quoteId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedQuote: QuoteData;
      
      if (portalType === 'admin') {
        fetchedQuote = await quoteIntegrationService.getAdminQuote(quoteId);
      } else if (portalType === 'clinic' && clinicId) {
        fetchedQuote = await quoteIntegrationService.getClinicQuote(clinicId, quoteId);
      } else if (portalType === 'patient' && patientId) {
        fetchedQuote = await quoteIntegrationService.getPatientQuote(patientId, quoteId);
      } else {
        throw new Error('Invalid portal configuration');
      }
      
      setCurrentQuote(fetchedQuote);
    } catch (err: any) {
      console.error('Error loading quote details:', err);
      setError(err.message || 'Failed to load quote details');
      toast({
        title: 'Error',
        description: 'Failed to load quote details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [portalType, patientId, clinicId]);

  // Update treatment quantity
  const updateTreatmentQuantity = useCallback(async (quoteId: string, treatmentId: string, quantity: number) => {
    try {
      setLoading(true);
      await quoteIntegrationService.updateTreatmentQuantity(quoteId, treatmentId, quantity);
      
      // Refresh quote details
      await loadQuoteDetails(quoteId);
      
      toast({
        title: 'Success',
        description: 'Treatment quantity updated successfully',
      });
    } catch (err: any) {
      console.error('Error updating treatment quantity:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update treatment quantity',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadQuoteDetails]);

  // Remove treatment from quote
  const removeTreatment = useCallback(async (quoteId: string, treatmentId: string) => {
    try {
      setLoading(true);
      await quoteIntegrationService.removeTreatment(quoteId, treatmentId);
      
      // Refresh quote details
      await loadQuoteDetails(quoteId);
      
      toast({
        title: 'Success',
        description: 'Treatment removed successfully',
      });
    } catch (err: any) {
      console.error('Error removing treatment:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to remove treatment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadQuoteDetails]);

  // Update quote status
  const updateQuoteStatus = useCallback(async (quoteId: string, status: string) => {
    try {
      setLoading(true);
      await quoteIntegrationService.updateQuoteStatus(quoteId, status);
      
      // Refresh quote details
      await loadQuoteDetails(quoteId);
      
      toast({
        title: 'Success',
        description: `Quote status updated to ${status}`,
      });
      
      // Also refresh the quotes list if needed
      await loadQuotes();
    } catch (err: any) {
      console.error('Error updating quote status:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update quote status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadQuoteDetails, loadQuotes]);

  // Send quote via email
  const sendQuoteEmail = useCallback(async (quoteId: string, email: string) => {
    try {
      setLoading(true);
      await quoteIntegrationService.sendQuoteEmail(quoteId, email);
      
      toast({
        title: 'Success',
        description: `Quote sent to ${email}`,
      });
    } catch (err: any) {
      console.error('Error sending quote email:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to send quote email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Download quote as PDF
  const downloadQuotePdf = useCallback(async (quoteId: string) => {
    try {
      setLoading(true);
      const pdfBlob = await quoteIntegrationService.downloadQuotePdf(quoteId);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-${quoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'Quote PDF downloaded successfully',
      });
    } catch (err: any) {
      console.error('Error downloading PDF:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to download quote PDF',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Request appointment for quote
  const requestAppointment = useCallback(async (quoteId: string) => {
    try {
      setLoading(true);
      await quoteIntegrationService.requestAppointment(quoteId);
      
      toast({
        title: 'Success',
        description: 'Appointment request submitted successfully',
      });
      
      // Refresh quote details to get updated status
      await loadQuoteDetails(quoteId);
    } catch (err: any) {
      console.error('Error requesting appointment:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to request appointment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadQuoteDetails]);

  // Admin-specific: Assign quote to clinic
  const assignQuoteToClinic = useCallback(async (quoteId: string, clinicId: string) => {
    if (portalType !== 'admin') {
      throw new Error('Only admin can assign quotes to clinics');
    }
    
    try {
      setLoading(true);
      await quoteIntegrationService.assignQuote(quoteId, clinicId);
      
      toast({
        title: 'Success',
        description: 'Quote assigned to clinic successfully',
      });
      
      // Refresh both the quote details and the quotes list
      await loadQuoteDetails(quoteId);
      await loadQuotes();
    } catch (err: any) {
      console.error('Error assigning quote to clinic:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to assign quote to clinic',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [portalType, loadQuoteDetails, loadQuotes]);

  // Admin-specific: Unassign quote from clinic
  const unassignQuoteFromClinic = useCallback(async (quoteId: string) => {
    if (portalType !== 'admin') {
      throw new Error('Only admin can unassign quotes from clinics');
    }
    
    try {
      setLoading(true);
      await quoteIntegrationService.unassignQuote(quoteId);
      
      toast({
        title: 'Success',
        description: 'Quote unassigned from clinic successfully',
      });
      
      // Refresh both the quote details and the quotes list
      await loadQuoteDetails(quoteId);
      await loadQuotes();
    } catch (err: any) {
      console.error('Error unassigning quote from clinic:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to unassign quote from clinic',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [portalType, loadQuoteDetails, loadQuotes]);

  return {
    quotes,
    currentQuote,
    loading,
    error,
    loadQuotes,
    loadQuoteDetails,
    updateTreatmentQuantity,
    removeTreatment,
    updateQuoteStatus,
    sendQuoteEmail,
    downloadQuotePdf,
    requestAppointment,
    assignQuoteToClinic,
    unassignQuoteFromClinic,
  };
};

// Export types for use in components
export type { QuoteData } from '@/services/quote-integration-service';
export type { Treatment } from '@/services/quote-integration-service';