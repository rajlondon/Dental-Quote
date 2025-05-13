import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface ApplyCodeParams {
  code: string;
  quoteId: string;
}

export interface RemoveCodeParams {
  quoteId: string;
}

export interface PromoDetails {
  id: string;
  title: string;
  code: string;
  discount_type: 'PERCENT' | 'AMOUNT';
  discount_value: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export interface QuoteDetails {
  id: string;
  subtotal: number;
  discount: number;
  total_price: number;
  promo_id?: string;
  [key: string]: any;
}

export interface ApplyCodeResponse {
  success: boolean;
  message: string;
  quote?: QuoteDetails;
  promo?: PromoDetails;
}

export interface RemoveCodeResponse {
  success: boolean;
  message: string;
  quote?: QuoteDetails;
}

/**
 * Custom hook for applying and removing promotional codes
 */
export function useApplyCode() {
  const { toast } = useToast();

  // Mutation for applying a promo code
  const applyMutation = useMutation({
    mutationFn: async ({ code, quoteId }: ApplyCodeParams): Promise<ApplyCodeResponse> => {
      const response = await apiRequest("POST", `/api/promo/apply/${quoteId}`, { code });
      return await response.json();
    },
    onSuccess: (data: ApplyCodeResponse) => {
      if (data.success) {
        toast({
          title: "Promo code applied",
          description: data.message,
        });
        
        // Invalidate quote cache if a quote was modified
        if (data.quote) {
          queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
        }
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to apply promo code: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for removing a promo code
  const removeMutation = useMutation({
    mutationFn: async ({ quoteId }: RemoveCodeParams): Promise<RemoveCodeResponse> => {
      const response = await apiRequest("POST", `/api/promo/remove/${quoteId}`, {});
      return await response.json();
    },
    onSuccess: (data: RemoveCodeResponse) => {
      if (data.success) {
        toast({
          title: "Promo code removed",
          description: data.message,
        });
        
        // Invalidate quote cache if a quote was modified
        if (data.quote) {
          queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
        }
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to remove promo code: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    applyPromoCode: applyMutation.mutate,
    applyPromoCodeAsync: applyMutation.mutateAsync,
    removePromoCode: removeMutation.mutate,
    removePromoCodeAsync: removeMutation.mutateAsync,
    isApplying: applyMutation.isPending,
    isRemoving: removeMutation.isPending,
    applyError: applyMutation.error,
    removeError: removeMutation.error,
  };
}