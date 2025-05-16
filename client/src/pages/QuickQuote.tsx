import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { quoteService } from '@/services/quote-service';
import { formatCurrency } from '@/utils/currency-formatter';
import MainLayout from '@/components/layout/MainLayout';

interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

function QuickQuote() {
  const [, navigate] = useLocation();
  
  // Available treatments
  const availableTreatments = [
    { id: '1', name: 'Dental Cleaning', description: 'Professional teeth cleaning', price: 100, quantity: 1 },
    { id: '2', name: 'Teeth Whitening', description: 'Professional whitening treatment', price: 250, quantity: 1 },
    { id: '3', name: 'Dental Filling', description: 'Composite filling for cavities', price: 150, quantity: 1 },
    { id: '4', name: 'Root Canal', description: 'Root canal therapy', price: 800, quantity: 1 },
    { id: '5', name: 'Dental Crown', description: 'Porcelain crown', price: 1200, quantity: 1 },
  ];
  
  // Available promo codes
  const promoCodes = {
    'DENTAL10': 10,
    'SMILE20': 20,
    'DISCOUNT30': 30
  };
  
  // State
  const [selectedTreatments, setSelectedTreatments] = useState<Treatment[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [patientInfoOpen, setPatientInfoOpen] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Calculations
  const subtotal = selectedTreatments.reduce((sum, t) => sum + t.price, 0);
  const discount = subtotal * (discountPercent / 100);
  const total = Math.max(0, subtotal - discount);
  
  // Add treatment
  const addTreatment = (treatment: Treatment) => {
    setSelectedTreatments(prev => [...prev, { ...treatment }]);
  };
  
  // Remove treatment
  const removeTreatment = (index: number) => {
    setSelectedTreatments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Apply promo code
  const applyPromoCode = () => {
    const enteredCode = promoCode.trim().toUpperCase();
    const validCodes = Object.keys(promoCodes);
    
    if (validCodes.includes(enteredCode)) {
      const discountPercent = promoCodes[enteredCode as keyof typeof promoCodes];
      setAppliedPromoCode(enteredCode);
      setDiscountPercent(discountPercent);
      
      toast({
        title: 'Promo Code Applied',
        description: `${enteredCode} has been applied with ${discountPercent}% discount.`,
      });
    } else {
      toast({
        title: 'Invalid Promo Code',
        description: 'Please enter a valid promo code.',
        variant: 'destructive'
      });
    }
  };
  
  // Handle patient info change
  const handlePatientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientInfo({ ...patientInfo, [name]: value });
  };
  
  // Save quote
  const saveQuote = () => {
    if (!patientInfo.name || !patientInfo.email) {
      toast({
        title: 'Information Required',
        description: 'Please provide your name and email.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const quote = quoteService.saveQuote({
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        patientPhone: patientInfo.phone,
        treatments: selectedTreatments,
        promoCode: appliedPromoCode,
        subtotal: subtotal,
        savings: discount,
        total: total
      });
      
      toast({
        title: 'Quote Saved',
        description: `Quote #${quote.id} has been saved successfully.`,
      });
      
      // Navigate to saved quote
      setPatientInfoOpen(false);
      setTimeout(() => {
        navigate(`/quotes/${quote.id}`);
      }, 1000);
    } catch (error) {
      console.error('Failed to save quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to save quote. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Quick Dental Quote</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Treatment selection */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Treatments</CardTitle>
                <CardDescription>Select treatments to add to your quote</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableTreatments.map(treatment => (
                  <div 
                    key={treatment.id} 
                    className="flex justify-between items-center p-4 border rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => addTreatment(treatment)}
                  >
                    <div>
                      <h3 className="font-medium">{treatment.name}</h3>
                      <p className="text-sm text-gray-500">{treatment.description}</p>
                    </div>
                    <div className="font-medium">{formatCurrency(treatment.price)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          {/* Quote summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Quote</CardTitle>
                <CardDescription>Summary of selected treatments</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTreatments.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Your quote is empty. Select treatments from the list.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Selected treatments */}
                    <div className="space-y-3">
                      {selectedTreatments.map((treatment, index) => (
                        <div key={index} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{treatment.name}</p>
                            <p className="text-sm text-gray-500">{formatCurrency(treatment.price)}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeTreatment(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Promo code section */}
                    <div className="mt-4 pt-4 border-t">
                      <Label htmlFor="promo">Promo Code</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          id="promo"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                        />
                        <Button onClick={applyPromoCode}>Apply</Button>
                      </div>
                      {appliedPromoCode && (
                        <p className="text-sm text-green-600 mt-1">
                          Code {appliedPromoCode} applied ({discountPercent}% off)
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Try: DENTAL10, SMILE20, DISCOUNT30
                      </p>
                    </div>
                    
                    {/* Price summary */}
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(discount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button 
                  className="w-full" 
                  disabled={selectedTreatments.length === 0}
                  onClick={() => setPatientInfoOpen(true)}
                >
                  Save Quote
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={selectedTreatments.length === 0}
                >
                  Request Appointment
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* Patient info dialog */}
        <Dialog open={patientInfoOpen} onOpenChange={setPatientInfoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name"
                  name="name"
                  value={patientInfo.name}
                  onChange={handlePatientInfoChange}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={patientInfo.email}
                  onChange={handlePatientInfoChange}
                  placeholder="you@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone"
                  name="phone"
                  value={patientInfo.phone}
                  onChange={handlePatientInfoChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPatientInfoOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveQuote}>
                Save Quote
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

export default QuickQuote;