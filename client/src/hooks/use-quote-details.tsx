import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Treatment {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

interface PackageDetails {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface QuoteDetails {
  id: string;
  status: string;
  createdAt: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  clinicId: string;
  clinicName: string;
  totalAmount: number;
  discountAmount: number;
  promoCode?: string;
  promoDescription?: string;
  treatments: Treatment[];
  packageDetails?: PackageDetails;
  additionalServices?: any[];
  notes?: string;
}

/**
 * Custom hook for fetching quote details with promo code information
 */
export function useQuoteDetails(quoteId: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['/api/patient/quotes', quoteId],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/patient/quotes/${quoteId}`);
        
        if (response.data.success) {
          return response.data.quote as QuoteDetails;
        } else {
          throw new Error(response.data.message || 'Failed to fetch quote details');
        }
      } catch (err) {
        console.error('Error fetching quote details:', err);
        // If the enhanced endpoint fails, try the standard endpoint
        try {
          const response = await axios.get(`/api/quotes/${quoteId}`);
          
          // Convert standard quote format to our enhanced format
          const standardQuote = response.data.quote || response.data;
          return {
            ...standardQuote,
            discountAmount: standardQuote.discountAmount || 0,
            promoCode: standardQuote.promoCode || null
          } as QuoteDetails;
        } catch (fallbackErr) {
          console.error('Fallback fetch also failed:', fallbackErr);
          throw fallbackErr;
        }
      }
    },
    enabled: !!quoteId
  });

  /**
   * Helper function to download the quote as PDF
   */
  const downloadPdf = async (): Promise<Blob | null> => {
    try {
      const response = await axios.get(`/api/quotes/${quoteId}/pdf`, {
        responseType: 'blob'
      });
      
      return new Blob([response.data], { type: 'application/pdf' });
    } catch (err) {
      console.error('Error downloading PDF:', err);
      return null;
    }
  };

  return {
    quote: data,
    loading: isLoading,
    error: isError ? error : null,
    refetch,
    downloadPdf
  };
}