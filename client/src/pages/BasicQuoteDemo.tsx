import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';

// Define types for the component
interface Treatment {
  id: string;
  name: string;
  price: number;
  description?: string;
  quantity: number;
}

// Mock promo codes for testing
const PROMO_CODES: Record<string, { type: 'percentage' | 'fixed', value: number }> = {
  'DENTAL10': { type: 'percentage', value: 10 },
  'SMILE20': { type: 'percentage', value: 20 },
  'DISCOUNT30': { type: 'percentage', value: 30 },
  'NEWSMILE': { type: 'fixed', value: 100 },
};

// Mock treatments
const TREATMENTS: Treatment[] = [
  { id: 'clean', name: 'Dental Cleaning', description: 'Professional teeth cleaning', price: 100, quantity: 1 },
  { id: 'whitening', name: 'Teeth Whitening', description: 'Professional whitening treatment', price: 250, quantity: 1 },
  { id: 'filling', name: 'Dental Filling', description: 'Composite filling for cavities', price: 150, quantity: 1 },
  { id: 'root', name: 'Root Canal', description: 'Root canal therapy', price: 800, quantity: 1 },
  { id: 'crown', name: 'Dental Crown', description: 'Porcelain crown', price: 1200, quantity: 1 },
];

/**
 * A completely isolated implementation with separate state variables for 
 * treatments and promo code information.
 */
const BasicQuoteDemo = () => {
  // Core state - completely separate variables
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  
  // Debug references
  const treatmentsRef = useRef<Treatment[]>([]);
  
  // Component mount logging
  useEffect(() => {
    console.log('[BASIC_DEMO] Component mounted');
    
    return () => {
      console.log('[BASIC_DEMO] Component unmounted');
    };
  }, []);
  
  // Track treatment changes
  useEffect(() => {
    console.log('[BASIC_DEMO] Treatments changed:', {
      previous: treatmentsRef.current.map(t => t.id),
      current: treatments.map(t => t.id),
      treatmentCount: treatments.length
    });
    treatmentsRef.current = [...treatments];
  }, [treatments]);
  
  // Calculate totals
  const calculateTotals = () => {
    const subtotal = treatments.reduce((sum, t) => sum + t.price, 0);
    const total = Math.max(0, subtotal - discount);
    return { subtotal, total };
  };
  
  // Toggle treatment selection
  const toggleTreatment = (treatment: Treatment) => {
    console.log('[BASIC_DEMO] Toggling treatment:', treatment.id);
    
    setTreatments(prev => {
      const exists = prev.some(t => t.id === treatment.id);
      
      if (exists) {
        // Remove treatment
        const newTreatments = prev.filter(t => t.id !== treatment.id);
        console.log('[BASIC_DEMO] Removed treatment. New count:', newTreatments.length);
        return newTreatments;
      } else {
        // Add treatment
        const newTreatments = [...prev, treatment];
        console.log('[BASIC_DEMO] Added treatment. New count:', newTreatments.length);
        return newTreatments;
      }
    });
  };
  
  // Apply promo code - completely isolated from treatment state
  const applyPromoCode = () => {
    const code = promoInput.trim().toUpperCase();
    
    if (!code) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }
    
    // Log state before changes
    console.log('[BASIC_DEMO] Before applying promo:', {
      treatments: treatments.map(t => t.id),
      treatmentCount: treatments.length,
      code
    });
    
    // Create a backup copy of treatments
    const treatmentsCopy = [...treatments];
    
    if (!PROMO_CODES[code]) {
      toast({
        title: "Invalid Code",
        description: "The promo code you entered is not valid",
        variant: "destructive",
      });
      return;
    }
    
    setIsApplyingPromo(true);
    
    // Simulate a small delay for API call
    setTimeout(() => {
      try {
        // Calculate discount
        const { subtotal } = calculateTotals();
        let calculatedDiscount = 0;
        
        if (PROMO_CODES[code].type === 'percentage') {
          calculatedDiscount = (subtotal * PROMO_CODES[code].value / 100);
          console.log(`[BASIC_DEMO] Applying ${PROMO_CODES[code].value}% discount on ${subtotal} = ${calculatedDiscount}`);
        } else {
          calculatedDiscount = PROMO_CODES[code].value;
          console.log(`[BASIC_DEMO] Applying fixed discount of ${calculatedDiscount}`);
        }
        
        // Ensure discount doesn't exceed subtotal
        calculatedDiscount = Math.min(calculatedDiscount, subtotal);
        
        // Update state in a specific order
        setAppliedPromo(code);
        setDiscount(calculatedDiscount);
        setPromoInput('');
        
        // Verify treatments still exist
        console.log('[BASIC_DEMO] After applying promo:', {
          treatments: treatments.map(t => t.id),
          treatmentCount: treatments.length
        });
        
        // Safety check - restore treatments if they were lost
        if (treatments.length === 0 && treatmentsCopy.length > 0) {
          console.log('[BASIC_DEMO] Treatments were lost! Restoring...');
          setTreatments(treatmentsCopy);
        }
        
        toast({
          title: "Promo Applied",
          description: `Discount: £${calculatedDiscount.toFixed(2)}`,
        });
      } catch (error) {
        console.error('[BASIC_DEMO] Error:', error);
        toast({
          title: "Error",
          description: "Failed to apply promo code",
          variant: "destructive",
        });
      } finally {
        setIsApplyingPromo(false);
      }
    }, 300);
  };
  
  // Remove promo code
  const removePromoCode = () => {
    setAppliedPromo(null);
    setDiscount(0);
    
    toast({
      title: "Promo Removed",
      description: "Promo code has been removed"
    });
  };
  
  // Reset quote
  const resetQuote = () => {
    setTreatments([]);
    setAppliedPromo(null);
    setDiscount(0);
    setPromoInput('');
    
    toast({
      title: "Quote Reset",
      description: "Your quote has been reset"
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };
  
  const { subtotal, total } = calculateTotals();
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Basic Quote Demo <span className="text-sm font-medium text-green-600">(Completely Isolated)</span></h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Treatments */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Treatments</h2>
            <div className="space-y-4 mb-6">
              {TREATMENTS.map(treatment => (
                <Card 
                  key={treatment.id} 
                  className={`cursor-pointer transition-colors ${
                    treatments.some(t => t.id === treatment.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`} 
                  onClick={() => toggleTreatment(treatment)}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{treatment.name}</h3>
                      <p className="text-sm text-gray-500">{treatment.description}</p>
                    </div>
                    <div className="text-lg font-semibold">{formatCurrency(treatment.price)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold mb-2">Promo Code</h2>
              <div className="flex gap-2">
                <Input 
                  value={promoInput} 
                  onChange={e => setPromoInput(e.target.value)} 
                  placeholder="Enter promo code"
                  disabled={isApplyingPromo}
                />
                <Button 
                  onClick={applyPromoCode} 
                  disabled={isApplyingPromo || !promoInput.trim()}
                >
                  {isApplyingPromo ? 'Applying...' : 'Apply'}
                </Button>
              </div>
              {appliedPromo && (
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">{appliedPromo}</span> applied: 
                    <span className="text-green-600 ml-1">{formatCurrency(discount)} discount</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={removePromoCode}>Remove</Button>
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500">
                Try: DENTAL10 (10% off), SMILE20 (20% off), DISCOUNT30 (30% off), NEWSMILE (£100 off)
              </div>
            </div>
            
            <Button variant="outline" onClick={resetQuote}>Reset Quote</Button>
          </div>
          
          {/* Right column - Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quote Summary</h2>
            <Card className="mb-6">
              <CardContent className="p-4">
                {treatments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Select treatments to see your quote</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {treatments.map(treatment => (
                        <div key={treatment.id} className="flex justify-between">
                          <span>{treatment.name}</span>
                          <span>{formatCurrency(treatment.price)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t mt-4 pt-4">
                      <div className="flex justify-between font-medium">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(discount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Debug information */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded text-xs">
              <h3 className="font-medium mb-2">Debug Info:</h3>
              <div className="space-y-1">
                <div>Selected treatments: {treatments.length}</div>
                <div>Treatment IDs: {treatments.map(t => t.id).join(', ')}</div>
                <div>Applied promo: {appliedPromo || 'None'}</div>
                <div>Discount: {formatCurrency(discount)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BasicQuoteDemo;