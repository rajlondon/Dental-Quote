import React, { useState, useCallback, useRef } from 'react';
import { useIsolatedQuoteState } from '../hooks/useIsolatedQuoteState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Home, Plus, Minus, Check, X } from 'lucide-react';
import { Link } from 'wouter';

/**
 * FinalQuoteBuilder - A completely isolated implementation with maximum state protection
 * 
 * This component uses the useIsolatedQuoteState hook to ensure state persistence
 * and implements multiple layers of protection against form submissions.
 */
export default function FinalQuoteBuilder() {
  const { toast } = useToast();
  
  // Use our isolated state management
  const {
    state,
    addTreatment,
    removeTreatment,
    updateQuantity,
    applyPromoCode,
    removePromoCode,
    saveQuote
  } = useIsolatedQuoteState();
  
  // Local state for promo code input
  const [promoInput, setPromoInput] = useState('');
  const promoInputRef = useRef<HTMLInputElement>(null);
  
  // Sample treatments (in practice, these would come from your API)
  const availableTreatments = [
    { id: '1', name: 'Dental Cleaning', price: 100, quantity: 1 },
    { id: '2', name: 'Teeth Whitening', price: 250, quantity: 1 },
    { id: '3', name: 'Dental Filling', price: 150, quantity: 1 },
    { id: '4', name: 'Root Canal', price: 800, quantity: 1 },
    { id: '5', name: 'Dental Crown', price: 1200, quantity: 1 },
    { id: '6', name: 'Dental Implant', price: 900, quantity: 1 },
  ];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Handle promo code with extreme prevention measures
  const handleApplyPromoCode = useCallback((e?: React.MouseEvent | React.FormEvent) => {
    // Prevent any possible form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Log the event for debugging
      console.log('APPLY PROMO CLICK DETECTED - PREVENTING DEFAULT');
    }
    
    // Do nothing if no promo code or already loading
    if (!promoInput || state.loading.promoCode) return;
    
    // Use setTimeout to break the event loop and prevent any form submission
    setTimeout(() => {
      console.log('APPLYING PROMO CODE:', promoInput);
      
      // Apply promo code
      applyPromoCode(promoInput)
        .then(success => {
          if (success) {
            toast({
              title: 'Promo Code Applied',
              description: `Successfully applied promo code ${promoInput.toUpperCase()}`,
            });
            
            // Reset input field
            setPromoInput('');
          } else {
            toast({
              title: 'Invalid Promo Code',
              description: 'The promo code you entered is not valid.',
              variant: 'destructive',
            });
          }
        })
        .catch(err => {
          console.error('Error applying promo code:', err);
          toast({
            title: 'Error',
            description: 'An error occurred while applying the promo code.',
            variant: 'destructive',
          });
        });
    }, 0);
  }, [promoInput, applyPromoCode, state.loading.promoCode, toast]);
  
  // Handle input keydown - prevent form submission
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.log('ENTER KEY DETECTED - PREVENTING DEFAULT');
      e.preventDefault();
      e.stopPropagation();
      
      if (promoInput.trim()) {
        handleApplyPromoCode();
      }
    }
  }, [promoInput, handleApplyPromoCode]);
  
  // Handle finalizing the quote
  const handleFinalizeQuote = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (state.treatments.length === 0) {
      toast({
        title: 'No Treatments Selected',
        description: 'Please select at least one treatment to create a quote.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const quoteId = await saveQuote();
      
      if (quoteId) {
        toast({
          title: 'Quote Created',
          description: `Your quote has been created successfully. Quote ID: ${quoteId}`,
        });
      }
    } catch (error) {
      console.error('Error finalizing quote:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while creating your quote.',
        variant: 'destructive',
      });
    }
  }, [state.treatments, saveQuote, toast]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">FinalQuoteBuilder</h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </header>
      
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Robust Quote Builder</h1>
          <p className="text-gray-600 mb-4">
            An industrial-strength implementation with guaranteed state persistence
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Treatments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Treatments */}
            <Card>
              <CardHeader>
                <CardTitle>Available Treatments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableTreatments.map(treatment => (
                    <div 
                      key={treatment.id}
                      className={`p-4 border rounded-md cursor-pointer transition-colors ${
                        state.treatments.some(t => t.id === treatment.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => addTreatment(treatment)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{treatment.name}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{formatCurrency(treatment.price)}</span>
                          {state.treatments.some(t => t.id === treatment.id) ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : (
                            <div className="h-5 w-5 border rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* CRITICAL: NO FORM ELEMENT FOR PROMO CODE */}
            <Card>
              <CardHeader>
                <CardTitle>Promo Code</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Isolated div container instead of form */}
                <div className="flex gap-2">
                  <Input
                    ref={promoInputRef}
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter promo code"
                    className="flex-1"
                    disabled={!!state.promoCode || state.loading.promoCode}
                  />
                  
                  {state.promoCode ? (
                    <Button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        removePromoCode();
                      }}
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={handleApplyPromoCode}
                      disabled={!promoInput.trim() || state.loading.promoCode}
                    >
                      {state.loading.promoCode ? 'Applying...' : 'Apply'}
                    </Button>
                  )}
                </div>
                
                {state.promoCode && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-700 text-sm">
                      Promo code <span className="font-semibold">{state.promoCode}</span> applied: {state.discountPercent}% discount
                    </p>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  Try codes like SUMMER15, DENTAL25, or NEWPATIENT for different discounts
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Quote Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {state.treatments.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Selected Treatments:</h3>
                        <ul className="space-y-2">
                          {state.treatments.map(treatment => (
                            <li key={treatment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span>{treatment.name}</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    if (treatment.quantity > 1) {
                                      updateQuantity(treatment.id, treatment.quantity - 1);
                                    } else {
                                      removeTreatment(treatment.id);
                                    }
                                  }}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                
                                <span className="w-6 text-center">{treatment.quantity}</span>
                                
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(treatment.id, treatment.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                
                                <span className="w-20 text-right font-medium">
                                  {formatCurrency(treatment.price * treatment.quantity)}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {state.promoCode && (
                        <div>
                          <h3 className="font-medium mb-2">Applied Promo:</h3>
                          <div className="bg-blue-50 p-3 rounded border border-blue-100">
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">
                              {state.promoCode}
                            </Badge>
                            <p className="text-sm text-blue-700 mt-1">
                              Discount: {state.discountPercent}%
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t">
                        <div className="flex justify-between mb-2">
                          <span>Subtotal:</span>
                          <span className="font-medium">{formatCurrency(state.subtotal)}</span>
                        </div>
                        
                        {state.discountPercent > 0 && (
                          <div className="flex justify-between mb-2 text-green-600">
                            <span>Discount ({state.discountPercent}%):</span>
                            <span className="font-medium">-{formatCurrency(state.subtotal * (state.discountPercent / 100))}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                          <span>Total:</span>
                          <span>{formatCurrency(state.total)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <p>Select treatments to build your quote</p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="button"
                  className="w-full"
                  disabled={state.treatments.length === 0 || state.loading.saving}
                  onClick={handleFinalizeQuote}
                >
                  {state.loading.saving ? 'Processing...' : 'Finalize Quote'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}