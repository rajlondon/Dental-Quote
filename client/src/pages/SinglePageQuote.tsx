import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Home, Check, X, Trash2 } from 'lucide-react';
import { Link } from 'wouter';

/**
 * SinglePageQuote - A single-page implementation with no nested components
 * 
 * This implementation avoids any component nesting that could trigger remounting
 * and keeps all functionality in a single, atomic component with isolated state.
 */
export default function SinglePageQuote() {
  const { toast } = useToast();

  // Define treatments
  const availableTreatments = [
    { id: '1', name: 'Dental Cleaning', price: 100 },
    { id: '2', name: 'Teeth Whitening', price: 250 },
    { id: '3', name: 'Dental Filling', price: 150 },
    { id: '4', name: 'Root Canal', price: 800 },
    { id: '5', name: 'Dental Crown', price: 1200 },
    { id: '6', name: 'Dental Implant', price: 2500 },
  ];

  // State for storing selected treatments
  const [selectedTreatments, setSelectedTreatments] = useState<Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>>([]);

  // State for discount and promo code
  const [promoStatus, setPromoStatus] = useState<{
    code: string | null;
    discountPercent: number;
    isApplying: boolean;
    inputValue: string;
  }>({
    code: null,
    discountPercent: 0,
    isApplying: false,
    inputValue: ''
  });

  // Calculate subtotal
  const calculateSubtotal = useCallback(() => {
    return selectedTreatments.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [selectedTreatments]);

  // Calculate total with discount
  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal();
    return subtotal * (1 - (promoStatus.discountPercent / 100));
  }, [calculateSubtotal, promoStatus.discountPercent]);

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }, []);

  // Add a treatment to the selection
  const handleAddTreatment = useCallback((treatment: typeof availableTreatments[0]) => {
    setSelectedTreatments(prev => {
      // Check if treatment is already in the selection
      const existingIndex = prev.findIndex(t => t.id === treatment.id);
      
      if (existingIndex >= 0) {
        // If found, increase quantity
        return prev.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // If not found, add it with quantity 1
        return [...prev, { ...treatment, quantity: 1 }];
      }
    });
  }, []);

  // Remove a treatment from the selection
  const handleRemoveTreatment = useCallback((id: string) => {
    setSelectedTreatments(prev => prev.filter(t => t.id !== id));
  }, []);

  // Update the quantity of a treatment
  const handleUpdateQuantity = useCallback((id: string, delta: number) => {
    setSelectedTreatments(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  }, []);

  // Handle promo code input change
  const handlePromoInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoStatus(prev => ({
      ...prev,
      inputValue: e.target.value
    }));
  }, []);

  // Mock validation function for promo codes
  const validatePromoCode = useCallback(async (code: string): Promise<{ 
    valid: boolean; 
    discountPercent: number 
  }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const validCodes: Record<string, number> = {
      'SUMMER15': 15,
      'DENTAL25': 25,
      'NEWPATIENT': 10,
      'TEST10': 10,
    };
    
    const upperCode = code.toUpperCase();
    
    if (upperCode in validCodes) {
      return {
        valid: true,
        discountPercent: validCodes[upperCode]
      };
    }
    
    return {
      valid: false,
      discountPercent: 0
    };
  }, []);

  // Apply promo code
  const handleApplyPromoCode = useCallback(async (e?: React.MouseEvent) => {
    // Prevent any form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Ignore if no input or already applying
    if (!promoStatus.inputValue || promoStatus.isApplying) return;
    
    // Set applying state
    setPromoStatus(prev => ({
      ...prev,
      isApplying: true
    }));
    
    try {
      console.log('Validating promo code:', promoStatus.inputValue);
      
      // Validate the promo code
      const result = await validatePromoCode(promoStatus.inputValue);
      
      if (result.valid) {
        // Update state with valid promo code
        setPromoStatus({
          code: promoStatus.inputValue.toUpperCase(),
          discountPercent: result.discountPercent,
          isApplying: false,
          inputValue: ''
        });
        
        toast({
          title: 'Promo Code Applied',
          description: `Successfully applied ${result.discountPercent}% discount.`,
        });
      } else {
        // Reset to invalid state
        setPromoStatus(prev => ({
          ...prev,
          isApplying: false
        }));
        
        toast({
          title: 'Invalid Promo Code',
          description: 'The promo code you entered is not valid.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      
      // Reset to error state
      setPromoStatus(prev => ({
        ...prev,
        isApplying: false
      }));
      
      toast({
        title: 'Error',
        description: 'An error occurred while validating the promo code.',
        variant: 'destructive',
      });
    }
  }, [promoStatus.inputValue, promoStatus.isApplying, toast, validatePromoCode]);

  // Remove applied promo code
  const handleRemovePromoCode = useCallback((e?: React.MouseEvent) => {
    // Prevent any form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setPromoStatus({
      code: null,
      discountPercent: 0,
      isApplying: false,
      inputValue: ''
    });
    
    toast({
      title: 'Promo Code Removed',
      description: 'The promo code has been removed.',
    });
  }, [toast]);

  // Handle Enter key in promo code input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      
      if (promoStatus.inputValue && !promoStatus.isApplying && !promoStatus.code) {
        handleApplyPromoCode();
      }
    }
  }, [promoStatus.inputValue, promoStatus.isApplying, promoStatus.code, handleApplyPromoCode]);

  // Complete the quote
  const handleCompleteQuote = useCallback(() => {
    if (selectedTreatments.length === 0) {
      toast({
        title: 'No Treatments Selected',
        description: 'Please select at least one treatment.',
        variant: 'destructive',
      });
      return;
    }
    
    // Here you would typically send the quote to your backend
    toast({
      title: 'Quote Created',
      description: `Your quote for ${formatCurrency(calculateTotal())} has been created.`,
    });
    
    // For demo purposes, just log the quote data
    console.log('Quote completed:', {
      treatments: selectedTreatments,
      promoCode: promoStatus.code,
      discount: promoStatus.discountPercent,
      subtotal: calculateSubtotal(),
      total: calculateTotal()
    });
  }, [selectedTreatments, promoStatus.code, promoStatus.discountPercent, toast, formatCurrency, calculateTotal, calculateSubtotal]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('SINGLE PAGE QUOTE - STATE UPDATE:', {
      treatments: selectedTreatments.length,
      promoCode: promoStatus.code,
      discount: promoStatus.discountPercent,
      subtotal: calculateSubtotal(),
      total: calculateTotal()
    });
  }, [selectedTreatments, promoStatus, calculateSubtotal, calculateTotal]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Single Page Quote</h1>
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
          <h1 className="text-3xl font-bold mb-2">Single-Page Quote Builder</h1>
          <p className="text-gray-600 mb-4">
            An atomic implementation with no nested components to avoid remounting issues
          </p>
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
                        selectedTreatments.some(t => t.id === treatment.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => handleAddTreatment(treatment)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{treatment.name}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{formatCurrency(treatment.price)}</span>
                          {selectedTreatments.some(t => t.id === treatment.id) ? (
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
            
            {/* CRITICAL: Promo code handling without any forms */}
            <Card>
              <CardHeader>
                <CardTitle>Promo Code</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Custom container instead of form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1`}
                    value={promoStatus.inputValue}
                    onChange={handlePromoInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter promo code"
                    disabled={!!promoStatus.code || promoStatus.isApplying}
                  />
                  
                  {promoStatus.code ? (
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
                      disabled={!promoStatus.inputValue || promoStatus.isApplying}
                    >
                      {promoStatus.isApplying ? 'Applying...' : 'Apply'}
                    </Button>
                  )}
                </div>
                
                {promoStatus.code && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-700 text-sm flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      Promo code <span className="font-semibold">{promoStatus.code}</span> applied: {promoStatus.discountPercent}% discount
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
                {selectedTreatments.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Selected Treatments:</h3>
                        <ul className="space-y-2">
                          {selectedTreatments.map(treatment => (
                            <li key={treatment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-red-500 hover:text-red-700"
                                  onClick={() => handleRemoveTreatment(treatment.id)}
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
                                  onClick={() => handleUpdateQuantity(treatment.id, -1)}
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
                                  onClick={() => handleUpdateQuantity(treatment.id, 1)}
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
                      
                      {promoStatus.code && (
                        <div>
                          <h3 className="font-medium mb-2">Applied Promo:</h3>
                          <div className="bg-blue-50 p-3 rounded border border-blue-100">
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">
                              {promoStatus.code}
                            </Badge>
                            <p className="text-sm text-blue-700 mt-1">
                              Discount: {promoStatus.discountPercent}%
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t">
                        <div className="flex justify-between mb-2">
                          <span>Subtotal:</span>
                          <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                        </div>
                        
                        {promoStatus.discountPercent > 0 && (
                          <div className="flex justify-between mb-2 text-green-600">
                            <span>Discount ({promoStatus.discountPercent}%):</span>
                            <span className="font-medium">-{formatCurrency(calculateSubtotal() * (promoStatus.discountPercent / 100))}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                          <span>Total:</span>
                          <span>{formatCurrency(calculateTotal())}</span>
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
                  disabled={selectedTreatments.length === 0}
                  onClick={handleCompleteQuote}
                >
                  Complete Quote
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}