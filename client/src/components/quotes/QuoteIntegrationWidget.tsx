import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import TreatmentList, { Treatment } from './TreatmentList';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, CurrencyCode } from '@/utils/format-utils';
import { useAutoApplyCode } from '@/hooks/use-auto-apply-code';

// Quote data interface
interface QuoteData {
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
  promoValid?: boolean;
  promoMessage?: string;
  currency: CurrencyCode;
  treatments: Treatment[];
}

// Initial empty quote data
const emptyQuoteData: QuoteData = {
  subtotal: 0,
  discount: 0,
  total: 0,
  currency: 'USD',
  treatments: []
};

interface QuoteIntegrationWidgetProps {
  initialTreatments?: Treatment[];
  currency?: CurrencyCode;
  onUpdate?: (quoteData: QuoteData) => void;
  readOnly?: boolean;
  allowPromoCode?: boolean;
  autoApplyPromo?: boolean;
}

const QuoteIntegrationWidget: React.FC<QuoteIntegrationWidgetProps> = ({
  initialTreatments = [],
  currency = 'USD',
  onUpdate,
  readOnly = false,
  allowPromoCode = true,
  autoApplyPromo = true
}) => {
  // State for the quote data
  const [quoteData, setQuoteData] = useState<QuoteData>({
    ...emptyQuoteData,
    currency,
    treatments: initialTreatments
  });
  
  // State for promo code input
  const [promoCodeInput, setPromoCodeInput] = useState('');
  
  // State for loading indicators
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  
  // Toast notifications
  const { toast } = useToast();
  
  // Auto-apply promo code from URL if enabled
  const urlPromoCode = useAutoApplyCode(code => {
    if (autoApplyPromo && code) {
      setPromoCodeInput(code);
      handleApplyPromoCode(code);
    }
  });

  // Calculate subtotal from treatments
  const calculateSubtotal = (treatments: Treatment[]): number => {
    return treatments.reduce((sum, treatment) => {
      const quantity = treatment.quantity || 1;
      return sum + (treatment.price * quantity);
    }, 0);
  };

  // Apply promo code
  const handleApplyPromoCode = async (code: string) => {
    if (!code.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a promo code',
        variant: 'destructive'
      });
      return;
    }
    
    setIsApplyingPromo(true);
    
    try {
      // Simulated API call to validate promo code
      // In real implementation, this would be an API call
      const response = await simulatePromoCodeValidation(code, calculateSubtotal(quoteData.treatments));
      
      if (response.valid) {
        setQuoteData(prev => ({
          ...prev,
          promoCode: code,
          promoValid: true,
          promoMessage: response.message,
          discount: response.discount,
          total: prev.subtotal - response.discount
        }));
        
        toast({
          title: 'Promo Code Applied',
          description: response.message || 'Your promo code has been applied successfully!'
        });
      } else {
        setQuoteData(prev => ({
          ...prev,
          promoCode: code,
          promoValid: false,
          promoMessage: response.message,
          discount: 0,
          total: prev.subtotal
        }));
        
        toast({
          title: 'Invalid Promo Code',
          description: response.message || 'This promo code is invalid or expired.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast({
        title: 'Error',
        description: 'There was an error applying your promo code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Remove a treatment from the list
  const handleRemoveTreatment = (id: string) => {
    if (readOnly) return;
    
    setQuoteData(prev => {
      const updatedTreatments = prev.treatments.filter(t => t.id !== id);
      const subtotal = calculateSubtotal(updatedTreatments);
      
      // If there was a promo code, recalculate with existing code
      let discount = 0;
      if (prev.promoValid && prev.promoCode) {
        // This is simplified - in real implementation you might need to revalidate
        // the promo code with the new subtotal
        discount = calculatePromoDiscount(prev.promoCode, subtotal);
      }
      
      return {
        ...prev,
        treatments: updatedTreatments,
        subtotal,
        discount,
        total: subtotal - discount
      };
    });
  };

  // Update treatment quantity
  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (readOnly) return;
    
    setQuoteData(prev => {
      const updatedTreatments = prev.treatments.map(t => 
        t.id === id ? { ...t, quantity: quantity } : t
      );
      
      const subtotal = calculateSubtotal(updatedTreatments);
      
      // If there was a promo code, recalculate with existing code
      let discount = 0;
      if (prev.promoValid && prev.promoCode) {
        discount = calculatePromoDiscount(prev.promoCode, subtotal);
      }
      
      return {
        ...prev,
        treatments: updatedTreatments,
        subtotal,
        discount,
        total: subtotal - discount
      };
    });
  };

  // Clear promo code
  const handleClearPromoCode = () => {
    setPromoCodeInput('');
    setQuoteData(prev => ({
      ...prev,
      promoCode: undefined,
      promoValid: false,
      promoMessage: undefined,
      discount: 0,
      total: prev.subtotal
    }));
    
    toast({
      title: 'Promo Code Removed',
      description: 'The promo code has been removed from your quote.'
    });
  };

  // Simulate promo code validation (in real app, this would be an API call)
  const simulatePromoCodeValidation = async (code: string, subtotal: number): Promise<{
    valid: boolean;
    discount: number;
    message?: string;
  }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock promo codes for testing
    const promoCodes: Record<string, { 
      discount: number, 
      isPercentage: boolean, 
      message: string 
    }> = {
      'SUMMER15': { discount: 15, isPercentage: true, message: '15% Summer discount applied!' },
      'DENTAL25': { discount: 25, isPercentage: true, message: '25% Dental care discount applied!' },
      'NEWPATIENT': { discount: 20, isPercentage: true, message: '20% New patient discount applied!' },
      'TEST10': { discount: 10, isPercentage: true, message: '10% Test discount applied!' },
      'FREECONSULT': { discount: 150, isPercentage: false, message: 'Free consultation (worth $150) applied!' },
      'LUXHOTEL20': { discount: 20, isPercentage: true, message: '20% Luxury hotel package discount!' },
      'IMPLANTCROWN30': { discount: 30, isPercentage: true, message: '30% off Implant + Crown package!' },
      'FREEWHITE': { discount: 200, isPercentage: false, message: 'Free teeth whitening (worth $200) applied!' },
      'LUXTRAVEL': { discount: 300, isPercentage: false, message: 'Luxury travel credit ($300) applied!' }
    };
    
    const promoInfo = promoCodes[code.toUpperCase()];
    
    if (!promoInfo) {
      return {
        valid: false,
        discount: 0,
        message: 'Invalid promo code. Please check and try again.'
      };
    }
    
    // Calculate discount amount
    const discountAmount = promoInfo.isPercentage 
      ? (subtotal * promoInfo.discount / 100) 
      : promoInfo.discount;
    
    return {
      valid: true,
      discount: discountAmount,
      message: promoInfo.message
    };
  };

  // Calculate promo discount based on code and subtotal
  const calculatePromoDiscount = (code: string, subtotal: number): number => {
    // This is simplified - in a real app, this might involve an API call
    // or more complex business logic
    const promoCodes: Record<string, { discount: number, isPercentage: boolean }> = {
      'SUMMER15': { discount: 15, isPercentage: true },
      'DENTAL25': { discount: 25, isPercentage: true },
      'NEWPATIENT': { discount: 20, isPercentage: true },
      'TEST10': { discount: 10, isPercentage: true },
      'FREECONSULT': { discount: 150, isPercentage: false },
      'LUXHOTEL20': { discount: 20, isPercentage: true },
      'IMPLANTCROWN30': { discount: 30, isPercentage: true },
      'FREEWHITE': { discount: 200, isPercentage: false },
      'LUXTRAVEL': { discount: 300, isPercentage: false }
    };
    
    const promoInfo = promoCodes[code.toUpperCase()];
    
    if (!promoInfo) return 0;
    
    return promoInfo.isPercentage 
      ? (subtotal * promoInfo.discount / 100) 
      : promoInfo.discount;
  };

  // Update subtotal and total when treatments change
  useEffect(() => {
    const subtotal = calculateSubtotal(quoteData.treatments);
    let discount = quoteData.discount;
    
    // If there's a valid promo code, recalculate the discount
    if (quoteData.promoValid && quoteData.promoCode) {
      discount = calculatePromoDiscount(quoteData.promoCode, subtotal);
    }
    
    setQuoteData(prev => ({
      ...prev,
      subtotal,
      discount,
      total: subtotal - discount
    }));
    
    // Call onUpdate callback if provided
    if (onUpdate) {
      onUpdate({
        ...quoteData,
        subtotal,
        discount,
        total: subtotal - discount
      });
    }
  }, [quoteData.treatments]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Dental Treatment Quote</CardTitle>
        <CardDescription>
          Create and customize your dental treatment quote
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Treatment List */}
        <TreatmentList
          treatments={quoteData.treatments}
          currency={quoteData.currency}
          onRemove={handleRemoveTreatment}
          onUpdateQuantity={handleUpdateQuantity}
          readonly={readOnly}
        />
        
        {/* Promo Code Section */}
        {allowPromoCode && (
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">Promotional Code</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
                placeholder="Enter promo code"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={readOnly || isApplyingPromo}
              />
              <button
                onClick={() => handleApplyPromoCode(promoCodeInput)}
                disabled={!promoCodeInput || readOnly || isApplyingPromo}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md disabled:opacity-50"
              >
                {isApplyingPromo ? 'Applying...' : 'Apply'}
              </button>
              {quoteData.promoValid && (
                <button
                  onClick={handleClearPromoCode}
                  disabled={readOnly || isApplyingPromo}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md disabled:opacity-50"
                >
                  Clear
                </button>
              )}
            </div>
            
            {/* Promo message display */}
            {quoteData.promoMessage && (
              <div className={`mt-2 text-sm ${quoteData.promoValid ? 'text-green-600' : 'text-red-600'}`}>
                {quoteData.promoMessage}
              </div>
            )}
          </div>
        )}
        
        {/* Quote Summary */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(quoteData.subtotal, quoteData.currency)}</span>
          </div>
          
          {quoteData.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-{formatCurrency(quoteData.discount, quoteData.currency)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
            <span>Total:</span>
            <span>{formatCurrency(quoteData.total, quoteData.currency)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <div className="text-sm text-muted-foreground">
          {quoteData.treatments.length === 0 ? (
            'Add treatments to get a quote'
          ) : (
            `${quoteData.treatments.length} treatment${quoteData.treatments.length !== 1 ? 's' : ''} selected`
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Prices shown in {quoteData.currency}
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuoteIntegrationWidget;