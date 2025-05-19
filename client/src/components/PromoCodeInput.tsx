import React, { useState } from 'react';
import { useQuote } from '../contexts/QuoteContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Package } from 'lucide-react';

export function PromoCodeInput() {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const quoteContext = useQuote();
  
  // Extract values from context
  const promoCode = quoteContext?.promoCode || null;
  const discountAmount = quoteContext?.discountAmount || 0;
  const isApplyingPromo = quoteContext?.isApplyingPromo || false;
  const isPackage = quoteContext?.isPackage || false;
  const packageName = quoteContext?.packageName || null;
  const applyPromoCode = quoteContext?.applyPromoCode;
  const clearPromoCode = quoteContext?.clearPromoCode;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputCode.trim()) {
      setError('Please enter a promo code');
      return;
    }
    
    if (applyPromoCode) {
      try {
        setError('');
        applyPromoCode(inputCode.trim());
        setInputCode(''); // Clear input after applying
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to apply promo code');
      }
    }
  };
  
  // If promo code is already applied, show active state
  if (promoCode) {
    return (
      <div className={`rounded-md p-4 mb-4 border ${isPackage ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center">
          {isPackage ? (
            <Package className="h-5 w-5 text-blue-600 mr-2" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          )}
          
          <div className="flex-1">
            <p className={`text-sm font-medium ${isPackage ? 'text-blue-800' : 'text-green-800'}`}>
              {isPackage ? (
                <>Package Applied: <strong>{packageName}</strong></>
              ) : (
                <>Promo code <strong>{promoCode}</strong> applied!</>
              )}
            </p>
            <p className={`text-sm mt-1 ${isPackage ? 'text-blue-700' : 'text-green-700'}`}>
              You saved {new Intl.NumberFormat('en-GB', { 
                style: 'currency', 
                currency: 'GBP' 
              }).format(discountAmount)}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => clearPromoCode && clearPromoCode()}
            className="ml-4"
          >
            Remove
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          type="text"
          value={inputCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputCode(e.target.value)}
          placeholder="Enter promo or package code"
          className="flex-1"
          disabled={isApplyingPromo}
        />
        <Button 
          type="submit" 
          disabled={isApplyingPromo || !inputCode.trim()}
          className="whitespace-nowrap"
        >
          {isApplyingPromo ? 'Applying...' : 'Apply Code'}
        </Button>
      </form>
      
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="text-xs text-gray-500">
        <p>Try our sample codes:</p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          <li><strong>TEST50</strong> - 50% off any treatment</li>
          <li><strong>SAVE100</strong> - £100 off your total</li>
          <li><strong>IMPLANT2023</strong> - Dental implant package with savings</li>
          <li><strong>SMILE2023</strong> - Smile makeover package</li>
        </ul>
      </div>
    </div>
  );
}