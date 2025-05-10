import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tag } from "lucide-react";
import { formatCurrency, formatDiscount } from '@/lib/format';

interface PromoCodeSummaryProps {
  promoData: {
    id: string;
    title: string;
    code: string;
    discount_type: string;
    discount_value: number;
  } | null;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  onRemove?: () => void;
}

/**
 * Displays a summary of the applied promo code with discount details
 */
export const PromoCodeSummary: React.FC<PromoCodeSummaryProps> = ({
  promoData,
  originalPrice,
  discountAmount,
  finalPrice,
  onRemove
}) => {
  if (!promoData) return null;

  return (
    <Card className="mb-4 border-primary/10 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-2 text-primary" />
            <CardTitle className="text-sm font-medium">Applied Promotion</CardTitle>
          </div>
          {onRemove && (
            <button 
              onClick={onRemove}
              className="text-sm text-muted-foreground hover:text-destructive"
              aria-label="Remove promo code"
            >
              Remove
            </button>
          )}
        </div>
        <CardDescription className="text-xs">{promoData.title}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <div className="flex items-center space-x-2 bg-primary/10 p-2 rounded-md mb-3">
          <span className="font-mono text-sm text-primary font-semibold">{promoData.code}</span>
          <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-semibold">
            {formatDiscount(promoData.discount_value, promoData.discount_type)} OFF
          </span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Original Price:</span>
            <span>{formatCurrency(originalPrice)}</span>
          </div>
          <div className="flex justify-between text-primary">
            <span>Discount:</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between font-medium">
            <span>Final Price:</span>
            <span>{formatCurrency(finalPrice)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-3">
        <p className="text-xs text-muted-foreground">
          Promotional discount applied to your quote.
        </p>
      </CardFooter>
    </Card>
  );
};

export default PromoCodeSummary;