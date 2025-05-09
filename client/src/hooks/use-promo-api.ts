import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface CreateQuoteFromPromoInput {
  token: string;
  visitorEmail?: string;
}

interface CreateQuoteResponse {
  success: boolean;
  quoteId: string;
  message: string;
  clinicId: number;
  promoType: string;
}

export function usePromoApi() {
  // Create a quote from a promotional token
  const createQuoteFromPromoMutation = useMutation({
    mutationFn: async (data: CreateQuoteFromPromoInput): Promise<CreateQuoteResponse> => {
      const response = await apiRequest('POST', '/api/v1/quotes/from-promo', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create quote from promo token');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
    },
  });

  // Get quotes by promo token - admin/clinic only
  const getQuotesByPromoToken = (token: string) => {
    return useQuery({
      queryKey: ['/api/v1/quotes/from-promo/by-token', token],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/v1/quotes/from-promo/by-token/${token}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch quotes by promo token');
        }
        return response.json();
      },
      enabled: !!token, // Only run query if token is provided
    });
  };

  // Get all promo quotes - admin only
  const getAllPromoQuotes = () => {
    return useQuery({
      queryKey: ['/api/v1/quotes/from-promo/all'],
      queryFn: async () => {
        const response = await apiRequest('GET', '/api/v1/quotes/from-promo/all');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch all promo quotes');
        }
        return response.json();
      },
    });
  };

  return {
    createQuoteFromPromoMutation,
    getQuotesByPromoToken,
    getAllPromoQuotes,
  };
}