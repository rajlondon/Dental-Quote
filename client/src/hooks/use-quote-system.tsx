import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Treatment } from '@/components/quotes/TreatmentList';
import { QuoteDetails } from '@/components/quotes/QuoteIntegrationWidget';

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

export function useQuoteSystem(portalType: 'patient' | 'admin' | 'clinic') {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Base API endpoint based on portal type
  const getBaseEndpoint = useCallback(() => {
    switch (portalType) {
      case 'patient':
        return '/api/integration/patient/quotes';
      case 'admin':
        return '/api/integration/admin/quotes';
      case 'clinic':
        return '/api/integration/clinic/quotes';
      default:
        return '/api/integration/patient/quotes';
    }
  }, [portalType]);

  // Load all quotes for the current portal
  const loadQuotes = useCallback(async (): Promise<QuoteData[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(getBaseEndpoint());
      
      if (response.data.success) {
        const fetchedQuotes = response.data.quotes || [];
        setQuotes(fetchedQuotes);
        return fetchedQuotes;
      } else {
        throw new Error(response.data.message || 'Failed to load quotes');
      }
    } catch (err: any) {
      const errorMessage = 'Failed to load quotes: ' + (err.message || 'Unknown error');
      setError(errorMessage);
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
  }, [getBaseEndpoint, toast]);

  // Load a specific quote by ID
  const loadQuoteDetails = useCallback(async (quoteId: string): Promise<QuoteData> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${getBaseEndpoint()}/${quoteId}`);
      
      if (response.data.success) {
        const quoteData = response.data.quote;
        setCurrentQuote(quoteData);
        return quoteData;
      } else {
        throw new Error(response.data.message || 'Failed to load quote details');
      }
    } catch (err: any) {
      const errorMessage = 'Failed to load quote details: ' + (err.message || 'Unknown error');
      setError(errorMessage);
      console.error('Error loading quote details:', err);
      toast({
        title: 'Error',
        description: 'Failed to load quote details',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getBaseEndpoint, toast]);

  // Apply a promo code to a quote
  const applyPromoCode = useCallback(async (quoteId: string, promoCode: string): Promise<QuoteData> => {
    try {
      const response = await axios.post(`${getBaseEndpoint()}/${quoteId}/apply-promo`, { 
        promoCode 
      });
      
      if (response.data.success) {
        const updatedQuote = response.data.quote;
        setCurrentQuote(updatedQuote);
        
        // Update in quotes list if it exists there
        setQuotes(prevQuotes => 
          prevQuotes.map(q => q.id === quoteId ? updatedQuote : q)
        );
        
        return updatedQuote;
      } else {
        throw new Error(response.data.message || 'Failed to apply promo code');
      }
    } catch (err: any) {
      console.error('Error applying promo code:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to apply promo code');
    }
  }, [getBaseEndpoint]);

  // Remove a promo code from a quote
  const removePromoCode = useCallback(async (quoteId: string): Promise<QuoteData> => {
    try {
      const response = await axios.post(`${getBaseEndpoint()}/${quoteId}/remove-promo`);
      
      if (response.data.success) {
        const updatedQuote = response.data.quote;
        setCurrentQuote(updatedQuote);
        
        // Update in quotes list if it exists there
        setQuotes(prevQuotes => 
          prevQuotes.map(q => q.id === quoteId ? updatedQuote : q)
        );
        
        return updatedQuote;
      } else {
        throw new Error(response.data.message || 'Failed to remove promo code');
      }
    } catch (err: any) {
      console.error('Error removing promo code:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to remove promo code');
    }
  }, [getBaseEndpoint]);

  // Update treatment quantity
  const updateTreatmentQuantity = useCallback(async (
    quoteId: string, 
    treatmentId: string, 
    quantity: number
  ): Promise<QuoteData> => {
    try {
      const response = await axios.post(`${getBaseEndpoint()}/${quoteId}/update-treatment`, {
        treatmentId,
        quantity
      });
      
      if (response.data.success) {
        const updatedQuote = response.data.quote;
        setCurrentQuote(updatedQuote);
        
        // Update in quotes list if it exists there
        setQuotes(prevQuotes => 
          prevQuotes.map(q => q.id === quoteId ? updatedQuote : q)
        );
        
        return updatedQuote;
      } else {
        throw new Error(response.data.message || 'Failed to update treatment quantity');
      }
    } catch (err: any) {
      console.error('Error updating treatment quantity:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to update treatment quantity');
    }
  }, [getBaseEndpoint]);

  // Remove treatment from quote
  const removeTreatment = useCallback(async (
    quoteId: string, 
    treatmentId: string
  ): Promise<QuoteData> => {
    try {
      const response = await axios.post(`${getBaseEndpoint()}/${quoteId}/remove-treatment`, {
        treatmentId
      });
      
      if (response.data.success) {
        const updatedQuote = response.data.quote;
        setCurrentQuote(updatedQuote);
        
        // Update in quotes list if it exists there
        setQuotes(prevQuotes => 
          prevQuotes.map(q => q.id === quoteId ? updatedQuote : q)
        );
        
        return updatedQuote;
      } else {
        throw new Error(response.data.message || 'Failed to remove treatment');
      }
    } catch (err: any) {
      console.error('Error removing treatment:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to remove treatment');
    }
  }, [getBaseEndpoint]);

  // Download quote PDF
  const downloadQuotePdf = useCallback(async (quoteId: string): Promise<void> => {
    try {
      const response = await axios.get(`${getBaseEndpoint()}/${quoteId}/pdf`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quote-${quoteId}.pdf`);
      
      // Append to html
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      console.error('Error downloading PDF:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to download PDF');
    }
  }, [getBaseEndpoint]);

  // Send quote by email
  const sendQuoteByEmail = useCallback(async (quoteId: string): Promise<void> => {
    try {
      const response = await axios.post(`${getBaseEndpoint()}/${quoteId}/send-email`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send email');
      }
    } catch (err: any) {
      console.error('Error sending email:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to send email');
    }
  }, [getBaseEndpoint]);

  // Request appointment (patient portal only)
  const requestAppointment = useCallback(async (quoteId: string): Promise<void> => {
    if (portalType !== 'patient') {
      throw new Error('Appointment requests are only available in the patient portal');
    }
    
    try {
      const response = await axios.post(`${getBaseEndpoint()}/${quoteId}/request-appointment`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to request appointment');
      }
    } catch (err: any) {
      console.error('Error requesting appointment:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to request appointment');
    }
  }, [getBaseEndpoint, portalType]);

  // Assign quote to clinic (admin portal only)
  const assignQuoteToClinic = useCallback(async (
    quoteId: string, 
    clinicId: string
  ): Promise<QuoteData> => {
    if (portalType !== 'admin') {
      throw new Error('Assigning quotes to clinics is only available in the admin portal');
    }
    
    try {
      const response = await axios.post(`${getBaseEndpoint()}/${quoteId}/assign-clinic`, {
        clinicId
      });
      
      if (response.data.success) {
        const updatedQuote = response.data.quote;
        setCurrentQuote(updatedQuote);
        
        // Update in quotes list if it exists there
        setQuotes(prevQuotes => 
          prevQuotes.map(q => q.id === quoteId ? updatedQuote : q)
        );
        
        return updatedQuote;
      } else {
        throw new Error(response.data.message || 'Failed to assign quote to clinic');
      }
    } catch (err: any) {
      console.error('Error assigning quote to clinic:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to assign quote to clinic');
    }
  }, [getBaseEndpoint, portalType]);

  // Unassign quote from clinic (admin portal only)
  const unassignQuoteFromClinic = useCallback(async (quoteId: string): Promise<QuoteData> => {
    if (portalType !== 'admin') {
      throw new Error('Unassigning quotes from clinics is only available in the admin portal');
    }
    
    try {
      const response = await axios.post(`${getBaseEndpoint()}/${quoteId}/unassign-clinic`);
      
      if (response.data.success) {
        const updatedQuote = response.data.quote;
        setCurrentQuote(updatedQuote);
        
        // Update in quotes list if it exists there
        setQuotes(prevQuotes => 
          prevQuotes.map(q => q.id === quoteId ? updatedQuote : q)
        );
        
        return updatedQuote;
      } else {
        throw new Error(response.data.message || 'Failed to unassign quote from clinic');
      }
    } catch (err: any) {
      console.error('Error unassigning quote from clinic:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to unassign quote from clinic');
    }
  }, [getBaseEndpoint, portalType]);

  // Functions specific to QuoteIntegrationWidget
  const getQuote = loadQuoteDetails;
  const updateQuote = updateTreatmentQuantity; // Alias for updateTreatmentQuantity to match expected interface

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
    sendQuoteByEmail,
    requestAppointment,
    assignQuoteToClinic,
    unassignQuoteFromClinic,
    // Functions for QuoteIntegrationWidget
    getQuote,
    updateQuote
  };
}

export default useQuoteSystem;