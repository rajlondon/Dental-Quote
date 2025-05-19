import React from 'react';
import { useQuote } from '../contexts/QuoteContext';
import { PromoCodeInput } from './PromoCodeInput';
import { Button } from '@/components/ui/button';
import { Package, MapPin, Gift, Briefcase, CalendarCheck, CheckCircle2 } from 'lucide-react';

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
  const attractions = quoteContext?.attractions || [];
  const additionalServices = quoteContext?.additionalServices || [];
  const saveQuote = quoteContext?.saveQuote;
  
  // Calculate total value of included attractions
  const attractionsValue = attractions && attractions.length > 0
    ? attractions
        .filter((attraction: any) => attraction.included)
        .reduce((sum: number, attraction: any) => sum + attraction.value, 0)
    : 0;
  
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Quote Summary</h3>
      
      {/* Package information */}
      {isPackage && packageName && (
        <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-blue-800 text-lg">{packageName}</h4>
          </div>
          {packageDescription && (
            <p className="text-sm text-blue-700 mb-3">{packageDescription}</p>
          )}
          
          {/* Package savings */}
          <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
            <CheckCircle2 className="h-4 w-4" />
            <p><strong>Total savings:</strong> {formatCurrency(discountAmount)}</p>
          </div>
          
          {/* Tourist attractions if any */}
          {attractions.length > 0 && (
            <div className="mt-3 border-t border-blue-200 pt-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <h5 className="font-medium text-blue-800">Included Tourist Attractions</h5>
              </div>
              <ul className="text-xs space-y-1.5 ml-6 mb-2">
                {attractions.map((attraction, index) => (
                  <li key={index} className="flex justify-between">
                    <div>
                      <span className="font-medium">{attraction.name}</span>
                      {attraction.description && <p className="text-blue-600">{attraction.description}</p>}
                    </div>
                    <span className="text-green-700">{formatCurrency(attraction.value)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-right text-blue-800 font-medium">
                Attractions Value: {formatCurrency(attractionsValue)}
              </p>
            </div>
          )}
          
          {/* Additional services if any */}
          {additionalServices.length > 0 && (
            <div className="mt-3 border-t border-blue-200 pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <h5 className="font-medium text-blue-800">Package Includes</h5>
              </div>
              <ul className="text-xs space-y-1 ml-6">
                {additionalServices.map((service, index) => (
                  <li key={index} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Treatment list */}
      <div className="space-y-2 mb-6">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Treatments</h4>
        
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
          disabled={isPackage ? false : treatments.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continue to Booking
        </Button>
        <Button variant="outline">Save Quote for Later</Button>
      </div>
    </div>
  );
}