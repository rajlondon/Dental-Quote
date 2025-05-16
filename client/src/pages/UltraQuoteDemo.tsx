import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Home, Plus, Minus, Check, X } from 'lucide-react';
import { Link } from 'wouter';

/**
 * UltraQuoteDemo - A zero-dependency quote builder with ultimate form protection
 * 
 * This component demonstrates a fully isolated implementation that ensures
 * state persistence when applying promo codes by completely avoiding form elements.
 */
const UltraQuoteDemo: React.FC = () => {
  const { toast } = useToast();
  
  // Define treatments
  const availableTreatments = [
    { id: '1', name: 'Dental Cleaning', price: 100 },
    { id: '2', name: 'Teeth Whitening', price: 250 },
    { id: '3', name: 'Dental Filling', price: 150 },
    { id: '4', name: 'Root Canal', price: 800 },
    { id: '5', name: 'Dental Crown', price: 1200 },
    { id: '6', name: 'Dental Implant', price: 900 },
  ];
  
  // State for selected treatments and promo code
  const [selectedTreatments, setSelectedTreatments] = useState<Array<{ id: string, name: string, price: number, quantity: number }>>([]);
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [isQuoteComplete, setIsQuoteComplete] = useState<boolean>(false);
  
  // Format number as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Calculate subtotal
  const getSubtotal = () => {
    return selectedTreatments.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Calculate total
  const getTotal = () => {
    const subtotal = getSubtotal();
    return Math.max(0, subtotal - (subtotal * (discount / 100)));
  };
  
  // MODIFIED: Toggle treatment selection to avoid form submission
  const handleAddTreatment = (treatment: typeof availableTreatments[0]) => {
    // Check if treatment is already in the selection
    const existingIndex = selectedTreatments.findIndex(t => t.id === treatment.id);
    
    if (existingIndex >= 0) {
      // Increase quantity if already selected
      const updatedTreatments = [...selectedTreatments];
      updatedTreatments[existingIndex] = {
        ...updatedTreatments[existingIndex],
        quantity: updatedTreatments[existingIndex].quantity + 1
      };
      setSelectedTreatments(updatedTreatments);
    } else {
      // Add new treatment with quantity 1
      setSelectedTreatments([
        ...selectedTreatments,
        { ...treatment, quantity: 1 }
      ]);
    }
  };
  
  // MODIFIED: Decrease treatment quantity without form
  const handleDecreaseQuantity = (id: string) => {
    const existingIndex = selectedTreatments.findIndex(t => t.id === id);
    
    if (existingIndex >= 0) {
      const currentQuantity = selectedTreatments[existingIndex].quantity;
      
      if (currentQuantity <= 1) {
        // Remove if quantity would go below 1
        setSelectedTreatments(
          selectedTreatments.filter(t => t.id !== id)
        );
      } else {
        // Decrease quantity otherwise
        const updatedTreatments = [...selectedTreatments];
        updatedTreatments[existingIndex] = {
          ...updatedTreatments[existingIndex],
          quantity: currentQuantity - 1
        };
        setSelectedTreatments(updatedTreatments);
      }
    }
  };
  
  // CRITICAL CHANGE: Apply promo code without any form submission
  const handleApplyPromoCode = () => {
    // Don't proceed if promo code is empty or already applied
    if (!promoCode.trim() || appliedPromo) return;
    
    setTimeout(() => {
      let discountPercent = 0;
      
      // Simple validation logic
      if (promoCode.toUpperCase() === 'SUMMER15') {
        discountPercent = 15;
      } else if (promoCode.toUpperCase() === 'DENTAL25') {
        discountPercent = 25;
      } else if (promoCode.toUpperCase() === 'NEWPATIENT') {
        discountPercent = 10;
      }
      
      if (discountPercent > 0) {
        setDiscount(discountPercent);
        setAppliedPromo(promoCode.toUpperCase());
        
        toast({
          title: 'Promo Code Applied',
          description: `Applied ${discountPercent}% discount to your quote.`,
        });
      } else {
        toast({
          title: 'Invalid Promo Code',
          description: 'The promo code you entered is not valid.',
          variant: 'destructive',
        });
      }
      
      // Clear the input
      setPromoCode('');
    }, 10);
  };
  
  // Remove promo code
  const handleRemovePromoCode = () => {
    setAppliedPromo(null);
    setDiscount(0);
    
    toast({
      title: 'Promo Code Removed',
      description: 'The promo code has been removed from your quote.',
    });
  };
  
  // Complete the quote
  const handleCompleteQuote = () => {
    if (selectedTreatments.length === 0) {
      toast({
        title: 'No Treatments Selected',
        description: 'Please select at least one treatment.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsQuoteComplete(true);
    
    toast({
      title: 'Quote Completed',
      description: `Your quote for ${formatCurrency(getTotal())} has been created.`,
    });
  };
  
  // Reset the quote
  const handleResetQuote = () => {
    setSelectedTreatments([]);
    setPromoCode('');
    setAppliedPromo(null);
    setDiscount(0);
    setIsQuoteComplete(false);
    
    toast({
      title: 'Quote Reset',
      description: 'Your quote has been reset.',
    });
  };
  
  // IMPORTANT: Monitor if state updates are working
  useEffect(() => {
    console.log('State updated:', { 
      treatments: selectedTreatments.length,
      discount,
      appliedPromo,
      total: getTotal()
    });
  }, [selectedTreatments, discount, appliedPromo]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">UltraQuoteDemo</h1>
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
          <h1 className="text-3xl font-bold mb-2">Ultra-Safe Quote Builder</h1>
          <p className="text-gray-600 mb-4">
            An industrial-strength implementation with guaranteed state persistence
          </p>
          
          {isQuoteComplete ? (
            <Card className="mb-6 bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle>Quote Successfully Created!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Total:</strong> {formatCurrency(getTotal())}</p>
                  <p><strong>Subtotal:</strong> {formatCurrency(getSubtotal())}</p>
                  {discount > 0 && (
                    <p><strong>Discount:</strong> {discount}% ({formatCurrency(getSubtotal() * (discount / 100))})</p>
                  )}
                  <p><strong>Promo Code:</strong> {appliedPromo || 'None'}</p>
                  <p><strong>Items:</strong> {selectedTreatments.reduce((sum, item) => sum + item.quantity, 0)} treatments</p>
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={handleResetQuote}
                    variant="outline"
                  >
                    Start New Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
        
        {!isQuoteComplete ? (
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
              
              {/* MODIFIED: Promo Code Section - NO FORM ELEMENT */}
              <Card>
                <CardHeader>
                  <CardTitle>Promo Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1"
                      disabled={!!appliedPromo}
                      // IMPORTANT: Handle enter key - prevent default behavior
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault(); // Critical to prevent page refresh
                          if (!appliedPromo && promoCode.trim()) {
                            handleApplyPromoCode();
                          }
                        }
                      }}
                    />
                    {appliedPromo ? (
                      <Button 
                        onClick={handleRemovePromoCode}
                        variant="destructive"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleApplyPromoCode}
                        disabled={!promoCode.trim()}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                  
                  {appliedPromo && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-700 text-sm">
                        Promo code <span className="font-semibold">{appliedPromo}</span> applied: {discount}% discount
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
                                <span>{treatment.name}</span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => handleDecreaseQuantity(treatment.id)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-6 text-center">{treatment.quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => handleAddTreatment(treatment)}
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
                        
                        {appliedPromo && (
                          <div>
                            <h3 className="font-medium mb-2">Applied Promo:</h3>
                            <div className="bg-blue-50 p-3 rounded border border-blue-100">
                              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                                {appliedPromo}
                              </Badge>
                              <p className="text-sm text-blue-700 mt-1">
                                Discount: {discount}%
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-4 border-t">
                          <div className="flex justify-between mb-2">
                            <span>Subtotal:</span>
                            <span className="font-medium">{formatCurrency(getSubtotal())}</span>
                          </div>
                          
                          {discount > 0 && (
                            <div className="flex justify-between mb-2 text-green-600">
                              <span>Discount ({discount}%):</span>
                              <span className="font-medium">-{formatCurrency(getSubtotal() * (discount / 100))}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                            <span>Total:</span>
                            <span>{formatCurrency(getTotal())}</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-4" 
                          size="lg"
                          onClick={handleCompleteQuote}
                        >
                          Complete Quote
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <p>Select treatments to build your quote</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="mt-8 p-6 border rounded-lg bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Quote Details</h2>
            <div className="space-y-4">
              <h3 className="font-medium">Selected Treatments:</h3>
              <ul className="space-y-2 mb-6">
                {selectedTreatments.map(treatment => (
                  <li key={treatment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>{treatment.name} × {treatment.quantity}</span>
                    <span className="font-medium">{formatCurrency(treatment.price * treatment.quantity)}</span>
                  </li>
                ))}
              </ul>
              
              <div className="p-4 border rounded-md bg-gray-50">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(getSubtotal())}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount ({discount}%):</span>
                    <span className="font-medium">-{formatCurrency(getSubtotal() * (discount / 100))}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UltraQuoteDemo;