import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, Tag, Loader2, AlertCircle, Gift, CheckCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { apiRequest } from '@/lib/queryClient';

interface PromoCodeValidationResult {
  valid: boolean;
  type: 'special_offer' | 'treatment_package';
  offer?: any;
  package?: any;
  discountType?: string;
  discountValue?: number;
  packagePrice?: number;
  originalPrice?: number;
  savings?: number;
  error?: string;
}

interface PromoCodeInputProps {
  onValidPromoCode: (promoData: PromoCodeValidationResult) => void;
  onInvalidPromoCode: () => void;
  userId?: number;
  disabled?: boolean;
  className?: string;
}

export function PromoCodeInput({ 
  onValidPromoCode, 
  onInvalidPromoCode, 
  userId, 
  disabled = false,
  className = "" 
}: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeValidationResult | null>(null);
  const [error, setError] = useState('');

  const validatePromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/promo-codes/validate', {
        code: code.trim().toUpperCase(),
        userId
      });
      return response.json();
    },
    onSuccess: (result: any) => {
      console.log('Promo validation result:', result);
      if (result.success && result.valid) {
        const promoData = {
          valid: true,
          code: result.code,
          type: result.type || 'special_offer',
          discountType: result.discountType,
          discountValue: result.discountValue
        };
        setAppliedPromo(promoData);
        setError('');
        console.log('Calling onValidPromoCode with:', promoData);
        onValidPromoCode(promoData);
      } else {
        console.log('Promo code invalid, calling onInvalidPromoCode');
        setError(result.message || result.error || 'Invalid promo code');
        setAppliedPromo(null);
        onInvalidPromoCode();
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to validate promo code';
      setError(errorMessage);
      setAppliedPromo(null);
      onInvalidPromoCode();
    },
  });

  // Check for promo code in URL parameters on mount for seamless homepage integration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const promoFromUrl = urlParams.get('promo') || urlParams.get('promoCode');
    if (promoFromUrl) {
      setPromoCode(promoFromUrl);
      // Auto-validate the promo code from URL after a brief delay
      setTimeout(() => {
        validatePromoMutation.mutate(promoFromUrl);
      }, 500);
    }
  }, []);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setError('Please enter a promo code');
      return;
    }
    
    setError('');
    validatePromoMutation.mutate(promoCode);
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setError('');
    onInvalidPromoCode();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled && !validatePromoMutation.isPending) {
      handleApplyPromo();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Applied Promo Code Summary */}
      {appliedPromo && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">
                    {appliedPromo.type === 'special_offer' ? 'Special Offer Applied' : 'Promo Code Applied'}
                  </h4>
                  <p className="text-sm text-green-700">
                    {appliedPromo.discountType === 'fixed_amount' ? 'FREE' : `${appliedPromo.discountValue}% OFF`}
                    {appliedPromo.type === 'special_offer' && (
                      <span className="ml-1">- Luxury Airport Transfer</span>
                    )}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Code: {appliedPromo.code}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRemovePromo}
                variant="ghost"
                size="sm"
                className="text-green-700 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promo Code Input */}
      <Card className="border-dashed border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Have a Promo Code?</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Enter your promo code to unlock special offers and treatment packages
            </p>
            
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter promo code (e.g., SUMMER25)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={disabled || validatePromoMutation.isPending || !!appliedPromo}
                className="flex-1"
              />
              
              {!appliedPromo ? (
                <Button
                  onClick={handleApplyPromo}
                  disabled={disabled || !promoCode.trim() || validatePromoMutation.isPending}
                  variant="outline"
                >
                  {validatePromoMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleRemovePromo}
                  variant="destructive"
                  size="sm"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Applied Promo Code Display */}
      {appliedPromo && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Promo Code Applied!</span>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {promoCode}
                </Badge>
              </div>

              {/* Special Offer Details */}
              {appliedPromo.type === 'special_offer' && appliedPromo.offer && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-800">{appliedPromo.offer.title}</h4>
                  <p className="text-sm text-green-700">{appliedPromo.offer.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="font-medium">
                      Discount: {appliedPromo.discountType === 'PERCENTAGE' 
                        ? `${appliedPromo.discountValue}%` 
                        : `£${appliedPromo.discountValue}`}
                    </span>
                    <span className="text-muted-foreground">
                      Valid until: {new Date(appliedPromo.offer.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Treatment Package Details */}
              {appliedPromo.type === 'treatment_package' && appliedPromo.package && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-800">{appliedPromo.package.title}</h4>
                  <p className="text-sm text-green-700">{appliedPromo.package.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Package Price:</span>
                      <div className="text-lg font-bold text-green-600">
                        £{appliedPromo.packagePrice?.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">You Save:</span>
                      <div className="text-lg font-bold text-green-600">
                        £{appliedPromo.savings?.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {appliedPromo.package.includedTreatments && appliedPromo.package.includedTreatments.length > 0 && (
                    <div>
                      <h5 className="font-medium text-green-800 mb-2">Included Treatments:</h5>
                      <div className="space-y-1">
                        {appliedPromo.package.includedTreatments.map((treatment: any, index: number) => (
                          <div key={index} className="text-xs text-green-700 flex justify-between">
                            <span>{treatment.quantity}x {treatment.treatmentName}</span>
                            <span>£{(treatment.treatmentPrice * treatment.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {appliedPromo.package.includedServices && appliedPromo.package.includedServices.length > 0 && (
                    <div>
                      <h5 className="font-medium text-green-800 mb-2">Included Services:</h5>
                      <div className="space-y-1">
                        {appliedPromo.package.includedServices.map((service: any, index: number) => (
                          <div key={index} className="text-xs text-green-700">
                            <span>{service.quantity}x {service.name}</span>
                            {service.description && (
                              <span className="text-muted-foreground ml-2">- {service.description}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Valid until: {new Date(appliedPromo.package.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Promo Codes Section */}
      {!appliedPromo && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Popular Offers:</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPromoCode('WELCOME20')}
              disabled={disabled}
              className="text-xs"
            >
              WELCOME20
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPromoCode('SUMMER25')}
              disabled={disabled}
              className="text-xs"
            >
              SUMMER25
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromoCodeInput;