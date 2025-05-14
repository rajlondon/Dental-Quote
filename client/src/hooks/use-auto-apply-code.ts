import { useState, useEffect } from 'react';
import { useApplyCode, ApplyCodeResponse, PromoDetails } from './use-apply-code';
import { useToast } from './use-toast';
import { useQuoteBuilder } from './use-quote-builder';

interface AutoApplyCodeHookReturn {
  code: string | null;
  appliedPromo: PromoDetails | null;
  isProcessing: boolean;
  error: Error | null;
  clearAppliedPromo: () => void;
}

/**
 * Hook to automatically apply promo codes from URL parameters
 * 
 * This hook handles two scenarios:
 * 1. When there's a saved quote (with quoteId) - applies the code via API
 * 2. When building a new quote - provides the code for use in the quote builder
 */
export function useAutoApplyCode(): AutoApplyCodeHookReturn {
  const [appliedPromo, setAppliedPromo] = useState<PromoDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const { applyPromoCodeAsync, removePromoCodeAsync } = useApplyCode();
  const { quote, applyPromoCode } = useQuoteBuilder();
  const { toast } = useToast();

  // Get code from URL
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const urlCode = url.searchParams.get('code');
      if (urlCode) {
        setCode(urlCode);
        // If we have a quoteId in the quotBuilder state
        if (quote.id) {
          // We'll handle this below in the API flow
        } else {
          // Apply directly to quote builder state
          console.log('Auto applying promo code to quote builder state:', urlCode);
          // This will happen in a separate effect to avoid dependency cycles
        }
      }
    } catch (err) {
      console.error('Error parsing URL for promo code:', err);
    }
  }, []);

  // Apply code to quote builder state when building a new quote
  useEffect(() => {
    if (!code || isProcessing || appliedPromo || !applyPromoCode) return;
    
    // If we don't have a quoteId, apply directly to the quote builder state
    if (!quote.id) {
      const applyCodeToBuilder = async () => {
        setIsProcessing(true);
        try {
          const result = await applyPromoCode(code);
          
          if (result.success) {
            setAppliedPromo({
              id: result.promoCodeId || '',
              title: 'Promo Code',
              description: result.message,
              code: code,
              discountType: result.discountType || 'percentage',
              discountValue: result.discountValue || 0,
              created_at: new Date().toISOString()
            });
            
            toast({
              title: "Promo code applied",
              description: result.message,
            });
          } else {
            // Invalid code
            setError(new Error(result.message));
            
            toast({
              title: "Promo code error",
              description: result.message,
              variant: "destructive",
            });
            
            // Clean up URL
            const url = new URL(window.location.href);
            url.searchParams.delete('code');
            window.history.replaceState({}, '', url.toString());
          }
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to apply promo code'));
          
          toast({
            title: "Promo code error",
            description: err instanceof Error ? err.message : 'Failed to apply promo code',
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      applyCodeToBuilder();
    }
  }, [code, quote.id, applyPromoCode, isProcessing, appliedPromo, toast]);

  // Apply code via API when we have a saved quote
  useEffect(() => {
    if (!code || !quote.id || isProcessing || appliedPromo) return;
    
    const applyCodeToSavedQuote = async () => {
      setIsProcessing(true);
      try {
        const response = await applyPromoCodeAsync({
          code,
          quoteId: quote.id.toString()
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
            toast({
              title: "Invalid promo code",
              description: response.message,
              variant: "destructive",
            });
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
        setIsProcessing(false);
      }
    };
    
    applyCodeToSavedQuote();
  }, [code, quote.id, appliedPromo, isProcessing, applyPromoCodeAsync, toast]);
  
  const clearAppliedPromo = async () => {
    if (quote.id && appliedPromo) {
      try {
        await removePromoCodeAsync({ quoteId: quote.id.toString() });
        setAppliedPromo(null);
        setCode(null);
        // Remove code parameter from URL without page reload
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        window.history.replaceState({}, '', url.toString());
      } catch (err) {
        console.error('Failed to remove promo code:', err);
      }
    } else {
      setAppliedPromo(null);
      setCode(null);
    }
  };
  
  return {
    code,
    appliedPromo,
    isProcessing,
    error,
    clearAppliedPromo
  };
}