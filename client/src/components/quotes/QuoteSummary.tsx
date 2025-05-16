import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useQuoteStore } from '../../stores/quoteStore';
import { Badge } from '../ui/badge';
import { BadgePercentIcon, CalculatorIcon, CreditCardIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface QuoteSummaryProps {
  className?: string;
  showPromoCodeButton?: boolean;
  showRemovePromoButton?: boolean;
}

export function QuoteSummary({ 
  className = '', 
  showPromoCodeButton = false,
  showRemovePromoButton = true
}: QuoteSummaryProps) {
  const {
    subtotal,
    discount,
    total,
    promoCode,
    discountPercentage,
    treatments,
    clearPromoCode,
    selectedOffer,
    selectedPackage
  } = useQuoteStore();

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  // Determine discount source for display
  const getDiscountSource = () => {
    if (selectedPackage) {
      return `Package: ${selectedPackage.name}`;
    }
    
    if (selectedOffer) {
      return `Offer: ${selectedOffer.name}`;
    }
    
    if (promoCode) {
      return `Promo: ${promoCode}`;
    }
    
    return null;
  };

  const discountSource = getDiscountSource();

  return (
    <Card className={`shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <CalculatorIcon className="mr-2 h-5 w-5" />
          Quote Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {treatments.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Add treatments to see your quote summary</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Treatments:</span>
                <span>{treatments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              {discountPercentage > 0 && (
                <div className="flex justify-between text-primary">
                  <div className="flex items-center">
                    <BadgePercentIcon className="h-4 w-4 mr-1" />
                    <span>Discount ({discountPercentage}%):</span>
                  </div>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              
              {discountSource && (
                <div className="my-2">
                  <Badge variant="outline" className="flex items-center gap-1 w-full justify-center py-1">
                    {discountSource}
                  </Badge>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-1" />
                  <span>Total:</span>
                </div>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            
            {/* Show promo code removal button when applicable */}
            {promoCode && showRemovePromoButton && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-sm"
                onClick={() => clearPromoCode()}
              >
                <XIcon className="h-4 w-4 mr-1" /> Remove Promo Code
              </Button>
            )}
            
            {/* Optional promo code application UI */}
            {showPromoCodeButton && !promoCode && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2 text-center">
                  Have a promo code? Add it to get a discount.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default QuoteSummary;