import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Treatment } from '../../stores/quoteStore';

interface QuoteSummaryProps {
  treatments: Treatment[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
  discountPercentage: number;
  packageName?: string;
  packageSavings?: number;
  offerName?: string;
  offerDiscount?: number;
  className?: string;
}

export function QuoteSummary({
  treatments,
  subtotal,
  discount,
  total,
  promoCode,
  discountPercentage,
  packageName,
  packageSavings = 0,
  offerName,
  offerDiscount = 0,
  className = ''
}: QuoteSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle>Quote Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Treatment items */}
          <div className="space-y-2">
            {treatments.map((treatment) => (
              <div key={treatment.id} className="flex justify-between">
                <div>
                  <span className="font-medium">{treatment.name}</span>
                  {treatment.quantity > 1 && (
                    <span className="text-sm text-muted-foreground ml-1">
                      x{treatment.quantity}
                    </span>
                  )}
                </div>
                <span>£{(treatment.price * treatment.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Subtotal */}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>

          {/* Package discount if applicable */}
          {packageName && packageSavings > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{packageName} Savings</span>
              <span>-£{packageSavings.toFixed(2)}</span>
            </div>
          )}

          {/* Special offer discount if applicable */}
          {offerName && offerDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{offerName} Discount</span>
              <span>-£{offerDiscount.toFixed(2)}</span>
            </div>
          )}

          {/* Promo code discount if applicable */}
          {promoCode && discountPercentage > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Promo Code: {promoCode} ({discountPercentage}%)</span>
              <span>-£{(subtotal * (discountPercentage / 100)).toFixed(2)}</span>
            </div>
          )}

          {/* Total */}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>£{total.toFixed(2)}</span>
          </div>

          {/* Discount summary if any discount applied */}
          {discount > 0 && (
            <div className="text-sm text-green-600 font-medium mt-2">
              You save: £{discount.toFixed(2)} ({((discount / subtotal) * 100).toFixed(0)}%)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}