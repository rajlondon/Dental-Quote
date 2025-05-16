import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Home, Check, X } from 'lucide-react';
import { Link } from 'wouter';

/**
 * SimplifiedQuoteDemo
 * 
 * An extremely minimal quote builder that has no external dependencies
 * or integrations. This helps isolate the core issue with state persistence.
 */
const SimplifiedQuoteDemo: React.FC = () => {
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
  const [selectedTreatments, setSelectedTreatments] = useState<{ id: string, name: string, price: number }[]>([]);
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
  
  // Toggle treatment selection
  const toggleTreatment = useCallback((treatment: { id: string, name: string, price: number }) => {
    setSelectedTreatments(prev => {
      const existingIndex = prev.findIndex(t => t.id === treatment.id);
      
      if (existingIndex >= 0) {
        // Remove if already selected
        return prev.filter(t => t.id !== treatment.id);
      } else {
        // Add if not selected
        return [...prev, treatment];
      }
    });
  }, []);
  
  // Apply promo code
  const applyPromoCode = useCallback((e?: React.FormEvent) => {
    // Prevent form submission
    if (e) e.preventDefault();
    
    if (!promoCode) return;
    
    // Simple promo code logic
    let discountAmount = 0;
    
    if (promoCode.toUpperCase() === 'SUMMER15') {
      discountAmount = getSubtotal() * 0.15; // 15% off
    } else if (promoCode.toUpperCase() === 'NEWPATIENT') {
      discountAmount = 50; // $50 off
    } else if (promoCode.toUpperCase() === 'DENTAL25') {
      discountAmount = getSubtotal() * 0.25; // 25% off
    }
    
    // Set discount and applied promo
    if (discountAmount > 0) {
      setAppliedPromo(promoCode);
      setDiscount(discountAmount);
      
      // Use setTimeout to ensure state is updated before showing toast
      setTimeout(() => {
        toast({
          title: 'Promo Code Applied',
          description: `Applied "${promoCode}" to your quote.`,
        });
      }, 100);
    } else {
      toast({
        title: 'Invalid Promo Code',
        description: 'The promo code you entered is not valid.',
        variant: 'destructive',
      });
    }
    
    // Clear input field
    setPromoCode('');
  }, [promoCode, toast]);
  
  // Calculate subtotal
  const getSubtotal = useCallback(() => {
    return selectedTreatments.reduce((total, item) => total + item.price, 0);
  }, [selectedTreatments]);
  
  // Calculate total
  const getTotal = useCallback(() => {
    return Math.max(0, getSubtotal() - discount);
  }, [getSubtotal, discount]);
  
  // Complete the quote
  const completeQuote = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (selectedTreatments.length === 0) {
      toast({
        title: 'No Treatments Selected',
        description: 'Please select at least one treatment.',
        variant: 'destructive',
      });
      return;
    }
    
    // Set the quote as complete
    setIsQuoteComplete(true);
    
    // Show success toast after state update
    setTimeout(() => {
      toast({
        title: 'Quote Completed',
        description: `Your quote for ${formatCurrency(getTotal())} has been created.`,
      });
    }, 100);
  }, [selectedTreatments, getTotal, toast]);
  
  // Reset the quote
  const resetQuote = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    setSelectedTreatments([]);
    setPromoCode('');
    setAppliedPromo(null);
    setDiscount(0);
    setIsQuoteComplete(false);
    
    toast({
      title: 'Quote Reset',
      description: 'Your quote has been reset.',
    });
  }, [toast]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">SimplifiedQuoteDemo</h1>
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
          <h1 className="text-3xl font-bold mb-2">Simplified Quote Builder</h1>
          <p className="text-gray-600 mb-4">
            This is a minimal demo that isolates the quote building functionality
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
                    <p><strong>Discount:</strong> {formatCurrency(discount)}</p>
                  )}
                  <p><strong>Promo Code:</strong> {appliedPromo || 'None'}</p>
                  <p><strong>Selected Treatments:</strong> {selectedTreatments.length}</p>
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={resetQuote}
                    variant="outline"
                    type="button"
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
            {/* Left side - Treatments */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Select Treatments</CardTitle>
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
                        onClick={() => toggleTreatment(treatment)}
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
              
              {/* Promo Code section */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Promo Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={applyPromoCode} className="flex gap-2">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1"
                      disabled={!!appliedPromo}
                    />
                    {appliedPromo ? (
                      <Button 
                        onClick={(e) => {
                          e.preventDefault();
                          setAppliedPromo(null);
                          setDiscount(0);
                        }}
                        variant="destructive"
                        type="button"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    ) : (
                      <Button 
                        onClick={(e) => applyPromoCode(e)}
                        disabled={!promoCode.trim()}
                        type="button"
                      >
                        Apply
                      </Button>
                    )}
                  </form>
                  
                  {appliedPromo && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-700 text-sm">
                        Promo code <span className="font-semibold">{appliedPromo}</span> applied: {formatCurrency(discount)} discount
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Try codes like SUMMER15, DENTAL25, or NEWPATIENT for different discounts
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right side - Summary */}
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
                                <span className="font-medium">{formatCurrency(treatment.price)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {appliedPromo && (
                          <div>
                            <h3 className="font-medium mb-2">Applied Promo:</h3>
                            <div className="bg-blue-50 p-3 rounded border border-blue-100">
                              <Badge>{appliedPromo}</Badge>
                              <p className="text-sm text-blue-700 mt-1">
                                Discount: {formatCurrency(discount)}
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
                              <span>Discount:</span>
                              <span className="font-medium">-{formatCurrency(discount)}</span>
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
                          onClick={completeQuote}
                          type="button"
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
                    <span>{treatment.name}</span>
                    <span className="font-medium">{formatCurrency(treatment.price)}</span>
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
                    <span>Discount:</span>
                    <span className="font-medium">-{formatCurrency(discount)}</span>
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

export default SimplifiedQuoteDemo;