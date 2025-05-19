import React from 'react';
import { useQuote } from '../contexts/QuoteContext';
import { PromoCodeInput } from './PromoCodeInput';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

export function QuoteSummary() {
  const quoteContext = useQuote();
  
  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP' 
    }).format(value);
  };
  
  // Extract values from context if available
  const treatments = quoteContext?.treatments || [];
  const subtotal = quoteContext?.subtotal || 0;
  const total = quoteContext?.total || 0;
  const discountAmount = quoteContext?.discountAmount || 0;
  const promoCode = quoteContext?.promoCode || null;
  const isPackage = quoteContext?.isPackage || false;
  const packageName = quoteContext?.packageName || null;
  const packageDescription = quoteContext?.packageDescription || null;
  const saveQuote = quoteContext?.saveQuote;
  
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Quote Summary</h3>
      
      {/* Package information */}
      {isPackage && packageName && (
        <div className="bg-blue-50 p-3 rounded-md mb-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-blue-800">{packageName}</h4>
          </div>
          {packageDescription && (
            <p className="text-sm text-blue-700 mb-2">{packageDescription}</p>
          )}
          <p className="text-sm text-blue-900">
            <strong>Package savings:</strong> {formatCurrency(discountAmount)}
          </p>
        </div>
      )}
      
      {/* Treatment list */}
      <div className="space-y-2 mb-6">
        <h4 className="font-medium text-sm text-gray-700 mb-1">Treatments</h4>
        
        {treatments.length === 0 ? (
          <p className="text-muted-foreground">No treatments selected</p>
        ) : (
          treatments.map((treatment) => (
            <div key={treatment.id} className="flex justify-between" data-treatment-id={treatment.id}>
              <span>
                {treatment.name}
                {treatment.quantity && treatment.quantity > 1 && ` (x${treatment.quantity})`}
              </span>
              <span className="font-medium">
                {formatCurrency(treatment.price * (treatment.quantity || 1))}
              </span>
            </div>
          ))
        )}
      </div>
      
      {/* Subtotal */}
      <div className="flex justify-between py-2 border-t">
        <span>Subtotal</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>
      
      {/* Discount (if applied) */}
      {discountAmount > 0 && (
        <div className="flex justify-between py-2 text-green-600">
          <span>
            {isPackage ? 'Package Discount' : `Discount ${promoCode && `(${promoCode})`}`}
          </span>
          <span className="font-medium">-{formatCurrency(discountAmount)}</span>
        </div>
      )}
      
      {/* Total */}
      <div className="flex justify-between py-2 border-t border-b mb-6">
        <span className="font-semibold">Total</span>
        <span className="font-bold text-lg">
          {formatCurrency(total)}
        </span>
      </div>
      
      {/* Promo code input */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Promo Code</h4>
        <PromoCodeInput />
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-col space-y-2">
        <Button 
          onClick={() => saveQuote && saveQuote()}
          disabled={treatments.length === 0}
        >
          Continue to Booking
        </Button>
        <Button variant="outline">Save Quote for Later</Button>
      </div>
    </div>
  );
}