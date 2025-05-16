import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Check } from 'lucide-react';
import { Link } from 'wouter';

/**
 * StaticQuoteDemo - An ultra-minimal implementation with no form elements whatsoever
 */
const StaticQuoteDemo: React.FC = () => {
  // Define treatments with prices
  const treatments = [
    { id: '1', name: 'Dental Cleaning', price: 100 },
    { id: '2', name: 'Teeth Whitening', price: 250 },
    { id: '3', name: 'Dental Filling', price: 150 },
  ];
  
  // Define available promo codes
  const promoCodes = [
    { code: 'SUMMER15', discount: 15, label: '15% off Summer Special' },
    { code: 'DENTAL25', discount: 25, label: '25% off Dental Services' },
  ];
  
  // Local state 
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<string | null>(null);
  
  // Toggle treatment selection
  const toggleTreatment = (id: string) => {
    setSelectedTreatments(prev => {
      if (prev.includes(id)) {
        return prev.filter(t => t !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Apply promo code (no form submission)
  const selectPromoCode = (code: string) => {
    setSelectedPromo(code);
  };
  
  // Remove promo code
  const removePromoCode = () => {
    setSelectedPromo(null);
  };
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return treatments
      .filter(t => selectedTreatments.includes(t.id))
      .reduce((sum, t) => sum + t.price, 0);
  };
  
  // Calculate discount
  const calculateDiscount = () => {
    if (!selectedPromo) return 0;
    
    const promoDetails = promoCodes.find(p => p.code === selectedPromo);
    if (!promoDetails) return 0;
    
    return calculateSubtotal() * (promoDetails.discount / 100);
  };
  
  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', 
      currency: 'USD'
    }).format(amount);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">StaticQuoteDemo</h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </header>
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Static Quote Builder</h1>
          <p className="text-muted-foreground mb-8">
            This implementation has no forms or inputs - just buttons to interact with
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Treatments section */}
            <Card>
              <CardHeader>
                <CardTitle>Select Treatments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {treatments.map(treatment => (
                    <div 
                      key={treatment.id}
                      className={`p-4 border rounded-md cursor-pointer flex justify-between items-center ${
                        selectedTreatments.includes(treatment.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => toggleTreatment(treatment.id)}
                    >
                      <div>
                        <h3 className="font-medium">{treatment.name}</h3>
                        <p className="text-muted-foreground">{formatCurrency(treatment.price)}</p>
                      </div>
                      <div className="h-6 w-6 flex items-center justify-center">
                        {selectedTreatments.includes(treatment.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Promo code section */}
            <Card>
              <CardHeader>
                <CardTitle>Apply Promo Code</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPromo ? (
                  <div className="mb-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-md mb-2">
                      <p className="text-green-700 font-medium flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Promo code applied: <Badge>{selectedPromo}</Badge>
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        {promoCodes.find(p => p.code === selectedPromo)?.label}
                      </p>
                      <p className="text-green-600 font-medium mt-2">
                        You save: {formatCurrency(calculateDiscount())}
                      </p>
                    </div>
                    <Button variant="outline" onClick={removePromoCode}>
                      Remove Promo Code
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {promoCodes.map(promo => (
                      <Button 
                        key={promo.code}
                        variant="outline"
                        className="justify-between"
                        onClick={() => selectPromoCode(promo.code)}
                      >
                        <Badge variant="outline" className="mr-2">{promo.code}</Badge>
                        <span className="text-green-600">{promo.discount}% OFF</span>
                      </Button>
                    ))}
                  </div>
                )}
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
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Selected Treatments:</h3>
                      <ul className="space-y-2">
                        {treatments
                          .filter(t => selectedTreatments.includes(t.id))
                          .map(treatment => (
                            <li key={treatment.id} className="flex justify-between p-2 bg-gray-50 rounded">
                              <span>{treatment.name}</span>
                              <span className="font-medium">{formatCurrency(treatment.price)}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      
                      {selectedPromo && (
                        <div className="flex justify-between mb-2 text-green-600">
                          <span>Discount:</span>
                          <span className="font-medium">-{formatCurrency(calculateDiscount())}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No treatments selected</p>
                    <p className="text-sm mt-1">Add treatments to see your quote</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled={selectedTreatments.length === 0}>
                  Complete Quote
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticQuoteDemo;