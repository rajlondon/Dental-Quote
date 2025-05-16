import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Simple local state - completely independent
type Treatment = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export function EmergencyQuoteBuilder() {
  // EVERYTHING is in local state - no external store
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoInput, setPromoInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [availableTreatments, setAvailableTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calculate totals locally
  const subtotal = treatments.reduce((sum, t) => sum + (t.price * t.quantity), 0);
  const discount = subtotal * (discountPercent / 100);
  const total = subtotal - discount;

  // Initialize with static data
  useEffect(() => {
    setAvailableTreatments([
      { id: '1', name: 'Dental Cleaning', price: 100, quantity: 1 },
      { id: '2', name: 'Teeth Whitening', price: 250, quantity: 1 },
      { id: '3', name: 'Dental Filling', price: 150, quantity: 1 },
      { id: '4', name: 'Root Canal', price: 800, quantity: 1 },
      { id: '5', name: 'Dental Crown', price: 1200, quantity: 1 },
      { id: '6', name: 'Dental Implant', price: 2500, quantity: 1 },
    ]);
    setLoading(false);
  }, []);
  
  // Add treatment
  const addTreatment = (treatment: Treatment) => {
    const exists = treatments.find(t => t.id === treatment.id);
    if (exists) {
      setTreatments(treatments.map(t => 
        t.id === treatment.id 
          ? { ...t, quantity: t.quantity + 1 } 
          : t
      ));
    } else {
      setTreatments([...treatments, { ...treatment }]);
    }
  };
  
  // Remove treatment
  const removeTreatment = (id: string) => {
    setTreatments(treatments.filter(t => t.id !== id));
  };
  
  // Update quantity
  const updateQuantity = (id: string, quantity: number) => {
    setTreatments(treatments.map(t => 
      t.id === id ? { ...t, quantity } : t
    ));
  };
  
  // Handle promo code - simplified static implementation
  const applyPromoCode = (code: string) => {
    // Simulate API call with hardcoded values
    setTimeout(() => {
      const validCodes: Record<string, number> = {
        'SUMMER15': 15,
        'DENTAL25': 25,
        'NEWPATIENT': 20,
        'TEST10': 10
      };
      
      if (validCodes[code]) {
        setPromoCode(code);
        setDiscountPercent(validCodes[code]);
        setStatusMessage(`Successfully applied ${validCodes[code]}% discount!`);
        setPromoInput('');
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setStatusMessage('');
        }, 3000);
        
        return true;
      } else {
        setStatusMessage('Invalid promo code. Please try again.');
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setStatusMessage('');
        }, 3000);
        
        return false;
      }
    }, 500); // Simulate API delay
  };
  
  // Handle removing promo code
  const removePromoCode = () => {
    setPromoCode(null);
    setDiscountPercent(0);
    setStatusMessage('Promo code removed');
    
    // Clear status after 3 seconds
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };
  
  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput) return;
    
    applyPromoCode(promoInput);
  };
  
  // Reset everything
  const resetQuote = () => {
    setTreatments([]);
    setPromoCode(null);
    setDiscountPercent(0);
    setPromoInput('');
    setStatusMessage('Quote has been reset');
    
    // Clear status after 3 seconds
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };
  
  // Save quote (simulated)
  const saveQuote = () => {
    if (treatments.length === 0) {
      setStatusMessage('Please add at least one treatment');
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setStatusMessage('');
      }, 3000);
      
      return;
    }
    
    setStatusMessage('Quote saved successfully!');
    
    // Clear status after 3 seconds
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };
  
  // Simple currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Status Message Bar */}
      {statusMessage && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
          {statusMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Treatments */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Available Treatments</h2>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {availableTreatments.map(treatment => (
                  <div 
                    key={treatment.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors hover:border-primary ${
                      treatments.some(t => t.id === treatment.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => addTreatment(treatment)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{treatment.name}</h3>
                        <p className="text-gray-500 text-sm">{formatCurrency(treatment.price)}</p>
                      </div>
                      {treatments.some(t => t.id === treatment.id) && (
                        <Badge variant="outline" className="bg-primary/10">
                          Added
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quote Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Quote Summary</h2>
              {treatments.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  type="button"
                  onClick={() => resetQuote()}
                >
                  Reset Quote
                </Button>
              )}
            </div>
            
            {treatments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No treatments added yet
              </div>
            ) : (
              <div className="space-y-6">
                {/* Selected Treatments */}
                <div className="space-y-2">
                  {treatments.map(treatment => (
                    <div 
                      key={treatment.id} 
                      className="flex justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <span>{treatment.name}</span>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(treatment.price)} x {treatment.quantity}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (treatment.quantity > 1) {
                                updateQuantity(treatment.id, treatment.quantity - 1);
                              } else {
                                removeTreatment(treatment.id);
                              }
                            }}
                          >
                            -
                          </Button>
                          <span className="w-6 text-center">{treatment.quantity}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(treatment.id, treatment.quantity + 1);
                            }}
                          >
                            +
                          </Button>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(treatment.price * treatment.quantity)}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 p-0 h-8 w-8"
                          onClick={() => removeTreatment(treatment.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Promo Code Section */}
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-3">Promo Code</h3>
                  
                  {promoCode ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="text-green-700 flex items-center">
                            <Badge variant="outline" className="bg-green-100 text-green-800 font-medium mr-2">
                              {promoCode}
                            </Badge>
                            <span>{discountPercent}% discount applied</span>
                          </div>
                        </div>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removePromoCode()}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form className="flex gap-2 mb-4" onSubmit={handleFormSubmit}>
                      <input
                        type="text"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value)}
                        placeholder="Enter promo code"
                      />
                      <Button 
                        type="submit"
                        disabled={!promoInput}
                      >
                        Apply
                      </Button>
                    </form>
                  )}
                  <p className="text-xs text-gray-500">
                    Try promo codes: SUMMER15, DENTAL25, NEWPATIENT, TEST10
                  </p>
                </div>
                
                {/* Price Summary */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {discountPercent > 0 && (
                    <div className="flex justify-between mb-2 text-green-600">
                      <span>Discount ({discountPercent}%):</span>
                      <span className="font-medium">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
                
                {/* Action Button */}
                <Button 
                  type="button"
                  onClick={() => saveQuote()}
                  className="w-full"
                >
                  Complete Quote
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}