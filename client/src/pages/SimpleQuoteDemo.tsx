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

// Simple type definitions
interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

function SimpleQuoteDemo() {
  const [, navigate] = useLocation();
  
  // State for treatments and quote
  const [treatments, setTreatments] = useState<Treatment[]>([
    { id: '1', name: 'Dental Cleaning', description: 'Professional teeth cleaning', price: 100, quantity: 1 },
    { id: '2', name: 'Teeth Whitening', description: 'Professional whitening treatment', price: 250, quantity: 1 },
    { id: '3', name: 'Dental Filling', description: 'Composite filling for cavities', price: 150, quantity: 1 },
    { id: '4', name: 'Root Canal', description: 'Root canal therapy', price: 800, quantity: 1 },
    { id: '5', name: 'Dental Crown', description: 'Porcelain crown', price: 1200, quantity: 1 },
  ]);
  
  const [selectedTreatments, setSelectedTreatments] = useState<Treatment[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  
  // Patient info
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Calculate total
  const total = Math.max(0, subtotal - discount);
  
  // Add treatment to quote
  const addTreatment = (treatment: Treatment) => {
    setSelectedTreatments([...selectedTreatments, { ...treatment }]);
    setSubtotal(prev => prev + treatment.price);
  };
  
  // Remove treatment from quote
  const removeTreatment = (index: number) => {
    const treatment = selectedTreatments[index];
    const newSelectedTreatments = [...selectedTreatments];
    newSelectedTreatments.splice(index, 1);
    
    setSelectedTreatments(newSelectedTreatments);
    setSubtotal(prev => prev - treatment.price);
  };
  
  // Apply promo code
  const applyPromoCode = () => {
    // Demo promo codes
    const promoCodes: Record<string, number> = {
      'DENTAL10': 10,
      'SMILE20': 20,
      'DISCOUNT30': 30
    };
    
    if (promoCodes[promoCode]) {
      const discountAmount = subtotal * (promoCodes[promoCode] / 100);
      setDiscount(discountAmount);
      
      toast({
        title: 'Promo Code Applied',
        description: `${promoCode} has been applied to your quote. You saved ${formatCurrency(discountAmount)}!`,
      });
    } else {
      toast({
        title: 'Invalid Promo Code',
        description: 'The entered promo code is not valid.',
        variant: 'destructive'
      });
    }
  };
  
  // Handle patient info change
  const handlePatientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };
  
  // Save quote
  const saveQuote = () => {
    if (!patientInfo.name || !patientInfo.email) {
      toast({
        title: 'Missing Information',
        description: 'Please provide your name and email to save this quote.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const quoteData = {
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        patientPhone: patientInfo.phone,
        treatments: selectedTreatments,
        subtotal,
        savings: discount,
        total,
        promoCode: promoCode || null
      };
      
      const savedQuote = quoteService.saveQuote(quoteData);
      
      toast({
        title: 'Quote Saved Successfully',
        description: `Your quote #${savedQuote.id} has been saved.`,
      });
      
      // Close dialog and navigate to quotes page
      setPatientDialogOpen(false);
      setTimeout(() => {
        navigate(`/quotes/${savedQuote.id}`);
      }, 1000);
    } catch (error) {
      console.error('Failed to save quote:', error);
      toast({
        title: 'Error Saving Quote',
        description: 'There was a problem saving your quote. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dental Treatment Quote</h1>
          <p className="text-gray-500 mt-2">
            Select treatments to build your dental treatment quote.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Available treatments */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Treatments</CardTitle>
                <CardDescription>
                  Click on a treatment to add it to your quote
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treatments.map(treatment => (
                    <div 
                      key={treatment.id} 
                      className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addTreatment(treatment)}
                    >
                      <div>
                        <h3 className="font-medium">{treatment.name}</h3>
                        <p className="text-sm text-gray-500">{treatment.description}</p>
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(treatment.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Quote summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Quote</CardTitle>
                <CardDescription>
                  Summary of selected treatments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTreatments.length === 0 ? (
                  <div className="text-center p-4 text-gray-500">
                    Your quote is empty. Select treatments from the list.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedTreatments.map((treatment, index) => (
                      <div key={`${treatment.id}-${index}`} className="flex justify-between items-center pb-2 border-b">
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
                    
                    {/* Promo code */}
                    <div className="mt-4 border-t pt-4">
                      <Label htmlFor="promo-code">Promo Code</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          id="promo-code" 
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="flex-1"
                        />
                        <Button onClick={applyPromoCode}>Apply</Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Try: DENTAL10, SMILE20, DISCOUNT30
                      </p>
                    </div>
                    
                    {/* Price summary */}
                    <div className="space-y-2 mt-6">
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
                  onClick={() => setPatientDialogOpen(true)}
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
        
        {/* Patient information dialog */}
        <Dialog open={patientDialogOpen} onOpenChange={setPatientDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
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
                  placeholder="your.email@example.com"
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
              <Button variant="outline" onClick={() => setPatientDialogOpen(false)}>
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

export default SimpleQuoteDemo;