import { useState, useEffect } from 'react';
import { QuoteIntegrationService } from '@/services/quote-integration-service';

export interface QuoteDetail {
  id: string;
  status: 'draft' | 'submitted' | 'accepted' | 'completed';
  createdAt: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  totalAmount: number;
  discountAmount?: number;
  promoCode?: string;
  promoDescription?: string;
  clinicId?: string;
  clinicName?: string;
  treatments: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    description?: string;
  }[];
  packageDetails?: {
    id: string;
    name: string;
    price: number;
    description?: string;
  };
  additionalServices?: {
    id: string;
    name: string;
    price: number;
    description?: string;
  }[];
  notes?: string;
}

export function useQuoteDetails(quoteId: string | undefined) {
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuoteDetails = async () => {
      if (!quoteId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await QuoteIntegrationService.getQuoteById(quoteId);
        
        if (response.success) {
          setQuote(response.quote);
        } else {
          setError(response.message || 'Failed to load quote details');
        }
      } catch (err) {
        console.error('Error loading quote details:', err);
        setError('Failed to load quote details');
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteDetails();
  }, [quoteId]);

  const refreshQuote = async () => {
    if (!quoteId) return;
    
    setLoading(true);
    try {
      const response = await QuoteIntegrationService.getQuoteById(quoteId);
      
      if (response.success) {
        setQuote(response.quote);
      } else {
        setError(response.message || 'Failed to refresh quote details');
      }
    } catch (err) {
      console.error('Error refreshing quote details:', err);
      setError('Failed to refresh quote details');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!quoteId) return null;
    
    try {
      return await QuoteIntegrationService.downloadQuotePdf(quoteId);
    } catch (err) {
      console.error('Error downloading quote PDF:', err);
      setError('Failed to download quote PDF');
      return null;
    }
  };

  return {
    quote,
    loading,
    error,
    refreshQuote,
    downloadPdf
  };
}