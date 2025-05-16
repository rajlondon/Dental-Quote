import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Home, Check, X, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { useQuoteStore, calculateSubtotal, calculateTotal } from '../stores/useQuoteStore';

/**
 * ZustandQuoteBuilder - A persistent state implementation using a global store
 * 
 * This implementation uses Zustand for global state management and localStorage
 * persistence to ensure state survives across navigation and component remounts.
 */
export default function ZustandQuoteBuilder() {
  const { toast } = useToast();
  
  // Get state and actions from the global store
  const {
    treatments,
    promoCode,
    discountPercent,
    isValidatingPromo,
    isCompleting,
    addTreatment,
    removeTreatment,
    updateQuantity,
    applyPromoCode,
    removePromoCode,
    completeQuote,
    resetQuote
  } = useQuoteStore();
  
  // Local state for promo code input
  const [promoInput, setPromoInput] = useState('');
  
  // Define available treatments
  const availableTreatments = [
    { id: '1', name: 'Dental Cleaning', price: 100, quantity: 1 },
    { id: '2', name: 'Teeth Whitening', price: 250, quantity: 1 },
    { id: '3', name: 'Dental Filling', price: 150, quantity: 1 },
    { id: '4', name: 'Root Canal', price: 800, quantity: 1 },
    { id: '5', name: 'Dental Crown', price: 1200, quantity: 1 },
    { id: '6', name: 'Dental Implant', price: 2500, quantity: 1 },
  ];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Handle applying promo code
  const handleApplyPromoCode = async () => {
    if (!promoInput || isValidatingPromo) return;
    
    const success = await applyPromoCode(promoInput);
    
    if (success) {
      toast({
        title: 'Promo Code Applied',
        description: `Successfully applied ${discountPercent}% discount.`,
      });
      setPromoInput('');
    } else {
      toast({
        title: 'Invalid Promo Code',
        description: 'The promo code you entered is not valid.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle removing promo code
  const handleRemovePromoCode = () => {
    removePromoCode();
    
    toast({
      title: 'Promo Code Removed',
      description: 'The promo code has been removed.',
    });
  };
  
  // Handle key press in promo input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyPromoCode();
    }
  };
  
  // Handle completing the quote
  const handleCompleteQuote = async () => {
    if (treatments.length === 0) {
      toast({
        title: 'No Treatments Selected',
        description: 'Please select at least one treatment.',
        variant: 'destructive',
      });
      return;
    }
    
    const quoteId = await completeQuote();
    
    if (quoteId) {
      toast({
        title: 'Quote Created',
        description: `Your quote has been created. ID: ${quoteId}`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'An error occurred while creating your quote.',
        variant: 'destructive',
      });
    }
  };
  
  // Subtotal and total calculations
  const subtotal = calculateSubtotal(treatments);
  const total = calculateTotal(treatments, discountPercent);
  const discountAmount = subtotal * (discountPercent / 100);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Zustand Quote Builder</h1>
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
          <h1 className="text-3xl font-bold mb-2">Persistent Quote Builder</h1>
          <p className="text-gray-600 mb-4">
            Using global state management and localStorage for guaranteed persistence
          </p>
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Build Your Dental Quote</h2>
            {treatments.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetQuote}
              >
                Reset Quote
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
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
                        treatments.some(t => t.id === treatment.id)
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
                          {treatments.some(t => t.id === treatment.id) ? (
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
            
            {/* Promo code section */}
            <Card>
              <CardHeader>
                <CardTitle>Promo Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1`}
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter promo code"
                    disabled={!!promoCode || isValidatingPromo}
                  />
                  
                  {promoCode ? (
                    <Button 
                      type="button"
                      onClick={handleRemovePromoCode}
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={handleApplyPromoCode}
                      disabled={!promoInput || isValidatingPromo}
                    >
                      {isValidatingPromo ? 'Applying...' : 'Apply'}
                    </Button>
                  )}
                </div>
                
                {promoCode && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-700 text-sm flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      Promo code <span className="font-semibold">{promoCode}</span> applied: {discountPercent}% discount
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
                {treatments.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Selected Treatments:</h3>
                        <ul className="space-y-2">
                          {treatments.map(treatment => (
                            <li key={treatment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-red-500 hover:text-red-700"
                                  onClick={() => removeTreatment(treatment.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                                <span>{treatment.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0"
                                  onClick={() => updateQuantity(treatment.id, Math.max(1, treatment.quantity - 1))}
                                  disabled={treatment.quantity <= 1}
                                >
                                  -
                                </Button>
                                
                                <span className="w-6 text-center">{treatment.quantity}</span>
                                
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0"
                                  onClick={() => updateQuantity(treatment.id, treatment.quantity + 1)}
                                >
                                  +
                                </Button>
                                
                                <span className="w-20 text-right font-medium">
                                  {formatCurrency(treatment.price * treatment.quantity)}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {promoCode && (
                        <div>
                          <h3 className="font-medium mb-2">Applied Promo:</h3>
                          <div className="bg-blue-50 p-3 rounded border border-blue-100">
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">
                              {promoCode}
                            </Badge>
                            <p className="text-sm text-blue-700 mt-1">
                              Discount: {discountPercent}%
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t">
                        <div className="flex justify-between mb-2">
                          <span>Subtotal:</span>
                          <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                        
                        {discountPercent > 0 && (
                          <div className="flex justify-between mb-2 text-green-600">
                            <span>Discount ({discountPercent}%):</span>
                            <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                          <span>Total:</span>
                          <span>{formatCurrency(total)}</span>
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
                  disabled={treatments.length === 0 || isCompleting}
                  onClick={handleCompleteQuote}
                >
                  {isCompleting ? 'Processing...' : 'Complete Quote'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}