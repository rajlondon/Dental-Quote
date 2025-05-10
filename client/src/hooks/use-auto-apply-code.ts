import { useState, useEffect } from 'react';
import { useApplyCode, ApplyCodeResponse, PromoDetails } from './use-apply-code';
import { useToast } from './use-toast';

interface AutoApplyCodeHookReturn {
  appliedPromo: PromoDetails | null;
  isLoading: boolean;
  error: Error | null;
  clearAppliedPromo: () => void;
}

/**
 * Hook to automatically apply promo codes from URL parameters
 * @param quoteId The ID of the quote to apply the code to
 */
export function useAutoApplyCode(quoteId: string | null): AutoApplyCodeHookReturn {
  const [appliedPromo, setAppliedPromo] = useState<PromoDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { applyPromoCodeAsync, removePromoCodeAsync } = useApplyCode();
  const { toast } = useToast();

  const clearAppliedPromo = async () => {
    if (quoteId && appliedPromo) {
      try {
        await removePromoCodeAsync({ quoteId });
        setAppliedPromo(null);
        // Remove code parameter from URL without page reload
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        window.history.replaceState({}, '', url.toString());
      } catch (err) {
        console.error('Failed to remove promo code:', err);
      }
    } else {
      setAppliedPromo(null);
    }
  };
  
  // Check URL for code parameter and apply if present
  useEffect(() => {
    const autoApplyFromUrl = async () => {
      // Skip if we don't have a quoteId yet or already have an applied promo
      if (!quoteId || appliedPromo || isLoading) return;
      
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      
      if (!code) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await applyPromoCodeAsync({
          code,
          quoteId
        });
        
        if (response.success && response.promo) {
          setAppliedPromo(response.promo);
          toast({
            title: "Promo code applied",
            description: `${response.promo.title} has been automatically applied to your quote.`,
          });
        } else {
          // Remove invalid code from URL
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          window.history.replaceState({}, '', url.toString());
          
          if (!response.success) {
            setError(new Error(response.message));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to apply promo code'));
        toast({
          title: "Promo code error",
          description: err instanceof Error ? err.message : 'Failed to apply promo code',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    autoApplyFromUrl();
  }, [quoteId, appliedPromo, isLoading, applyPromoCodeAsync, toast]);
  
  return {
    appliedPromo,
    isLoading,
    error,
    clearAppliedPromo
  };
}