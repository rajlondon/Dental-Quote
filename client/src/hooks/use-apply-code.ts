import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UseApplyCodeOptions {
  quoteId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface ApplyCodeResponse {
  success: boolean;
  message?: string;
  quote?: {
    id: string;
    subtotal: number;
    discount: number;
    total_price: number;
    promo_id?: string;
    [key: string]: any;
  };
  promo?: {
    id: string;
    title: string;
    code: string;
    discount_type: string;
    discount_value: number;
    [key: string]: any;
  }
}

/**
 * Custom hook for applying promo codes to quotes
 */
export function useApplyCode({ quoteId, onSuccess, onError }: UseApplyCodeOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const applyCode = async (code: string): Promise<boolean> => {
    if (!code?.trim()) {
      setError('Please enter a valid code');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest(
        'POST',
        '/api/apply-code',
        { code: code.trim(), quoteId }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply promo code');
      }

      const data: ApplyCodeResponse = await response.json();
      
      if (data.success && data.quote) {
        // Invalidate quote cache to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/quotes', quoteId] });
        
        if (onSuccess) {
          onSuccess(data);
        }
        
        return true;
      } else {
        setError(data.message || 'Invalid or expired coupon code');
        if (onError) {
          onError(new Error(data.message || 'Invalid or expired coupon code'));
        }
        return false;
      }
    } catch (err: any) {
      console.error('Error applying promo code:', err);
      setError(err.message || 'An error occurred while applying the code');
      toast({
        title: "Error",
        description: err.message || 'An error occurred while applying the code',
        variant: "destructive",
      });
      
      if (onError) {
        onError(err);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCode = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest(
        'POST',
        '/api/remove-code',
        { quoteId }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove promo code');
      }

      const data = await response.json();
      
      // Invalidate quote cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/quotes', quoteId] });
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      return true;
    } catch (err: any) {
      console.error('Error removing promo code:', err);
      setError(err.message || 'An error occurred while removing the code');
      
      if (onError) {
        onError(err);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    applyCode,
    removeCode,
    isLoading,
    error
  };
}