import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Treatment } from '@/components/quotes/TreatmentList';
import { PortalType } from '@/components/quotes/QuoteIntegrationWidget';

export interface Quote {
  id: string;
  patientId?: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  clinicId?: string;
  clinicName?: string;
  treatments: Treatment[];
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'completed';
  subtotal: number;
  total: number;
  promoCode?: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  discountAmount: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  offerApplied?: boolean;
  offerId?: string;
  currency?: 'USD' | 'GBP' | 'EUR';
}

export const useQuoteSystem = (portalType: PortalType) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get all quotes
  const { 
    data: quotes = [], 
    isLoading: loading, 
    refetch: refetchQuotesData
  } = useQuery({
    queryKey: [`/api/integration/${portalType}/quotes`],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/integration/${portalType}/quotes`);
        if (response.data.success) {
          return response.data.quotes || [];
        } else {
          setError(response.data.message || 'Failed to load quotes');
          return [];
        }
      } catch (err: any) {
        setError(err.message || 'Error loading quotes');
        return [];
      }
    },
  });

  // Fetch a single quote
  const fetchQuote = useCallback(async (quoteId: string) => {
    try {
      setError(null);
      const response = await axios.get(`/api/integration/${portalType}/quotes/${quoteId}`);
      
      if (response.data.success) {
        setQuote(response.data.quote);
        return response.data.quote;
      } else {
        setError(response.data.message || 'Failed to load quote');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Error loading quote');
      return null;
    }
  }, [portalType]);

  // Update treatment quantity
  const updateTreatmentQuantity = useCallback(async (treatmentId: string, newQuantity: number) => {
    if (!quote) return;
    
    try {
      const response = await axios.patch(`/api/integration/${portalType}/quotes/${quote.id}/treatments/${treatmentId}`, {
        quantity: newQuantity
      });
      
      if (response.data.success) {
        setQuote(response.data.quote);
        return response.data.quote;
      } else {
        setError(response.data.message || 'Failed to update treatment quantity');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Error updating treatment quantity');
      return null;
    }
  }, [portalType, quote]);

  // Remove treatment
  const removeTreatment = useCallback(async (treatmentId: string) => {
    if (!quote) return;
    
    try {
      const response = await axios.delete(`/api/integration/${portalType}/quotes/${quote.id}/treatments/${treatmentId}`);
      
      if (response.data.success) {
        setQuote(response.data.quote);
        return response.data.quote;
      } else {
        setError(response.data.message || 'Failed to remove treatment');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Error removing treatment');
      return null;
    }
  }, [portalType, quote]);

  // Apply promo code
  const applyPromoCode = useCallback(async (quoteId: string, promoCode: string) => {
    try {
      setError(null);
      const response = await axios.post(`/api/integration/${portalType}/quotes/${quoteId}/promo`, {
        promoCode
      });
      
      if (response.data.success) {
        setQuote(response.data.quote);
        return response.data.quote;
      } else {
        throw new Error(response.data.message || 'Invalid promo code');
      }
    } catch (err: any) {
      setError(err.message || 'Error applying promo code');
      throw err;
    }
  }, [portalType]);

  // Remove promo code
  const removePromoCode = useCallback(async (quoteId: string) => {
    try {
      setError(null);
      const response = await axios.delete(`/api/integration/${portalType}/quotes/${quoteId}/promo`);
      
      if (response.data.success) {
        setQuote(response.data.quote);
        return response.data.quote;
      } else {
        throw new Error(response.data.message || 'Failed to remove promo code');
      }
    } catch (err: any) {
      setError(err.message || 'Error removing promo code');
      throw err;
    }
  }, [portalType]);

  // Download PDF
  const downloadQuotePdf = useCallback(async (quoteId: string) => {
    try {
      const response = await axios.get(`/api/integration/${portalType}/quotes/${quoteId}/pdf`, {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Quote-${quoteId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error downloading PDF');
      throw err;
    }
  }, [portalType]);

  // Email quote
  const emailQuote = useCallback(async (quoteId: string, email: string) => {
    try {
      const response = await axios.post(`/api/integration/${portalType}/quotes/${quoteId}/email`, {
        email
      });
      
      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to email quote');
      }
    } catch (err: any) {
      setError(err.message || 'Error emailing quote');
      throw err;
    }
  }, [portalType]);

  // Print quote
  const printQuote = useCallback(async (quoteId: string) => {
    try {
      const response = await axios.get(`/api/integration/${portalType}/quotes/${quoteId}/print`);
      
      if (response.data.success) {
        // For local browser printing, we can open a new window with the content
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(response.data.html);
          printWindow.document.close();
          printWindow.print();
        }
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to print quote');
      }
    } catch (err: any) {
      setError(err.message || 'Error printing quote');
      throw err;
    }
  }, [portalType]);

  // Refetch quotes
  const refetchQuotes = useCallback(async () => {
    setError(null);
    return refetchQuotesData();
  }, [refetchQuotesData]);

  // Create a new quote
  const createQuote = useCallback(async (quoteData: Partial<Quote>) => {
    try {
      setError(null);
      const response = await axios.post(`/api/integration/${portalType}/quotes`, quoteData);
      
      if (response.data.success) {
        await refetchQuotes();
        return response.data.quote;
      } else {
        setError(response.data.message || 'Failed to create quote');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Error creating quote');
      return null;
    }
  }, [portalType, refetchQuotes]);

  return {
    quote,
    quotes,
    loading,
    error,
    fetchQuote,
    updateTreatmentQuantity,
    removeTreatment,
    applyPromoCode,
    removePromoCode,
    downloadQuotePdf,
    emailQuote,
    printQuote,
    refetchQuotes,
    createQuote,
  };
};