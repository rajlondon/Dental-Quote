import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useQuoteBuilder } from '@/hooks/use-quote-builder';
import { formatCurrency } from '@/hooks/use-promo-code';
import { Loader2, CheckCircle } from 'lucide-react';

interface PromoCodeInputProps {
  quote: any;
  setQuote: (quote: any) => void;
  initialPromoCode?: string;
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  quote,
  setQuote,
  initialPromoCode = ''
}) => {
  const [promoCode, setPromoCode] = useState(initialPromoCode);
  const { applyPromoCode, removePromoCode, isApplyingPromo } = useQuoteBuilder();
  
  const handleApplyPromoCode = async () => {
    try {
      const result = await applyPromoCode(promoCode);
      
      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message
        });
      }
    } catch (error) {
      console.error('[PromoCodeInput] Error applying promo code:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to apply promo code'
      });
    }
  };
  
  // If promo code is already applied, show applied state
  if (quote.promoCode) {
    // Calculate the discount amount for display
    const discountValue = quote.promoDiscount || 0;
    const discountText = quote.discountType === 'percentage' 
      ? `${quote.discountValue}% (${formatCurrency(discountValue)})` 
      : formatCurrency(discountValue);
    
    return (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
          <CheckCircle className="h-4 w-4" />
          <span>
            Promo code <strong>{quote.promoCode}</strong> applied
            <span className="ml-1 font-medium">(-{discountText})</span>
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={async () => {
            // Use the hook's removePromoCode function
            const result = await removePromoCode();
            // Clear input if successful
            if (result) {
              setPromoCode('');
            }
          }}
        >
          Remove Promo Code
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <Input
          placeholder="Enter promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleApplyPromoCode();
            }
          }}
          disabled={isApplyingPromo}
        />
        <Button
          onClick={handleApplyPromoCode}
          disabled={!promoCode.trim() || isApplyingPromo}
        >
          {isApplyingPromo ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Applying...
            </>
          ) : (
            'Apply'
          )}
        </Button>
      </div>
    </div>
  );
};

export default PromoCodeInput;