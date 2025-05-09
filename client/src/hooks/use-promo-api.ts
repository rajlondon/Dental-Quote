import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for interacting with the promo API
 */
export const usePromoApi = () => {
  const { toast } = useToast();

  const createQuoteFromPromo = useMutation({
    mutationFn: async (data: { token: string; visitorEmail?: string }) => {
      const response = await apiRequest('POST', '/api/v1/quotes/from-promo', data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create quote from promo token');
      }
      
      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating quote from promo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    createQuoteFromPromo,
  };
};

export default usePromoApi;