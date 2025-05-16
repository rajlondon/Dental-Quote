import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { quoteService } from '../services/quote-service';
import { emailService } from '../services/email-service';
import MainLayout from '@/components/layout/MainLayout';
import { formatCurrency } from '@/utils/currency-formatter';

// Define types
interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

interface QuoteState {
  treatments: Treatment[];
  promoCode: string | null;
  promoType?: 'percentage' | 'fixed';
  promoValue?: number;
  discount: number;
  subtotal: number;
  total: number;
}

export default function QuickQuote() {
  const [, navigate] = useLocation();
  
  // Available treatments
  const availableTreatments: Treatment[] = [
    { id: 'clean', name: 'Dental Cleaning', description: 'Professional teeth cleaning', price: 100, quantity: 1 },
    { id: 'whitening', name: 'Teeth Whitening', description: 'Professional whitening treatment', price: 250, quantity: 1 },
    { id: 'filling', name: 'Dental Filling', description: 'Composite filling for cavities', price: 150, quantity: 1 },
    { id: 'root', name: 'Root Canal', description: 'Root canal therapy', price: 800, quantity: 1 },
    { id: 'crown', name: 'Dental Crown', description: 'Porcelain crown', price: 1200, quantity: 1 },
    { id: 'implant', name: 'Dental Implant', description: 'Titanium implant with crown', price: 2500, quantity: 1 },
  ];
  
  // Promo codes
  const promoCodes: Record<string, { type: 'percentage' | 'fixed', value: number }> = {
    'DENTAL10': { type: 'percentage', value: 10 },
    'SMILE20': { type: 'percentage', value: 20 },
    'DISCOUNT30': { type: 'percentage', value: 30 },
    'NEWSMILE': { type: 'fixed', value: 100 },
  };
  
  // State
  const [quote, setQuote] = useState<QuoteState>({
    treatments: [],
    promoCode: null,
    discount: 0,
    subtotal: 0,
    total: 0
  });
  
  const [promoInput, setPromoInput] = useState('');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [patientInfo, setPatientInfo] = useState({ name: '', email: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Calculate totals whenever treatments or promo code changes
  useEffect(() => {
    const subtotal = quote.treatments.reduce((sum, t) => sum + t.price, 0);
    let discount = 0;
    
    if (quote.promoCode && promoCodes[quote.promoCode]) {
      const promoDetails = promoCodes[quote.promoCode];
      if (promoDetails.type === 'percentage') {
        discount = subtotal * (promoDetails.value / 100);
      } else {
        discount = promoDetails.value;
      }
    }
    
    const total = Math.max(0, subtotal - discount);
    
    setQuote(prev => ({
      ...prev,
      subtotal,
      discount,
      total
    }));
  }, [quote.treatments, quote.promoCode]);
  
  // Toggle treatment selection
  const toggleTreatment = (treatment: Treatment) => {
    setQuote(prev => {
      const exists = prev.treatments.find(t => t.id === treatment.id);
      
      if (exists) {
        // Remove treatment
        return {
          ...prev,
          treatments: prev.treatments.filter(t => t.id !== treatment.id)
        };
      } else {
        // Add treatment
        return {
          ...prev,
          treatments: [...prev.treatments, {...treatment, quantity: 1}]
        };
      }
    });
  };
  
  // Apply promo code
  const applyPromoCode = () => {
    const code = promoInput.trim().toUpperCase();
    
    if (!code) {
      toast({
        title: 'Error',
        description: 'Please enter a promo code',
        variant: 'destructive',
      });
      return;
    }
    
    if (!promoCodes[code]) {
      toast({
        title: 'Invalid Code',
        description: 'The promo code you entered is not valid',
        variant: 'destructive',
      });
      return;
    }
    
    // Use functional update to ensure we have the latest state
    setQuote(prevQuote => {
      console.log("[QuoteBuilder] Applying promo to quote:", prevQuote);
      
      const subtotal = prevQuote.subtotal || 0;
      const discountType = promoCodes[code].type;
      const discountValue = promoCodes[code].value;
      
      let calculatedDiscount = 0;
      
      if (discountType === 'percentage') {
        calculatedDiscount = (subtotal * discountValue / 100);
        console.log(`[QuoteBuilder] Applying ${discountValue}% discount on ${subtotal} = ${calculatedDiscount}`);
      } else if (discountType === 'fixed') {
        calculatedDiscount = discountValue;
        console.log(`[QuoteBuilder] Applying fixed discount of ${discountValue}`);
      }
      
      // Ensure discount doesn't exceed subtotal
      calculatedDiscount = Math.min(calculatedDiscount, subtotal);
      
      // Return a new object that preserves ALL previous state
      return {
        ...prevQuote,
        promoCode: code,
        promoType: discountType,
        promoValue: discountValue,
        discount: calculatedDiscount,
        total: subtotal - calculatedDiscount
      };
    });
    
    setPromoInput('');
    
    // Delay the success message to ensure state is updated
    setTimeout(() => {
      toast({
        title: 'Promo Code Applied',
        description: `${code} has been applied successfully! Your discount: ${formatCurrency(quote.discount)}`,
      });
    }, 100);
  };
  
  // Remove promo code
  const removePromoCode = () => {
    setQuote(prevQuote => {
      console.log("[QuoteBuilder] Removing promo code from quote:", prevQuote);
      
      // Return a new object that preserves ALL previous state
      return {
        ...prevQuote,
        promoCode: null,
        promoType: undefined,
        promoValue: undefined,
        discount: 0,
        total: prevQuote.subtotal
      };
    });
    
    // Delay the success message to ensure state is updated
    setTimeout(() => {
      toast({
        title: 'Promo Code Removed',
        description: 'The promo code has been removed from your quote',
      });
    }, 100);
  };
  
  // Reset quote
  const resetQuote = () => {
    setQuote({
      treatments: [],
      promoCode: null,
      discount: 0,
      subtotal: 0,
      total: 0
    });
    
    setPromoInput('');
    
    toast({
      title: 'Quote Reset',
      description: 'Your quote has been reset',
    });
  };
  
  // Handle patient info change
  const handlePatientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save quote
  const handleSaveQuote = async () => {
    if (quote.treatments.length === 0) {
      toast({
        title: 'No Treatments Selected',
        description: 'Please select at least one treatment',
        variant: 'destructive',
      });
      return;
    }
    
    if (!patientInfo.name || !patientInfo.email) {
      setShowPatientForm(true);
      return;
    }
    
    setIsSaving(true);
    
    try {
      const savedQuote = quoteService.saveQuote({
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        patientPhone: patientInfo.phone,
        treatments: quote.treatments,
        selectedPackage: null,
        appliedOffer: null,
        promoCode: quote.promoCode,
        subtotal: quote.subtotal,
        savings: quote.discount,
        total: quote.total
      });
      
      toast({
        title: 'Quote Saved',
        description: 'Your quote has been saved successfully',
      });
      
      // Navigate to quote detail
      navigate(`/quotes/${savedQuote.id}`);
    } catch (error) {
      console.error('Error saving quote:', error);
      toast({
        title: 'Save Failed',
        description: 'There was an error saving your quote',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Send quote via email
  const handleSendEmail = async () => {
    if (quote.treatments.length === 0) {
      toast({
        title: 'No Treatments Selected',
        description: 'Please select at least one treatment',
        variant: 'destructive',
      });
      return;
    }
    
    if (!patientInfo.name || !patientInfo.email) {
      setShowPatientForm(true);
      return;
    }
    
    setIsSendingEmail(true);
    
    try {
      // First save the quote if not already saved
      const savedQuote = quoteService.saveQuote({
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        patientPhone: patientInfo.phone,
        treatments: quote.treatments,
        selectedPackage: null,
        appliedOffer: null,
        promoCode: quote.promoCode,
        subtotal: quote.subtotal,
        savings: quote.discount,
        total: quote.total
      });
      
      // Send the email
      await emailService.sendQuoteEmail(savedQuote);
      
      // Start email sequence
      await emailService.startEmailSequence(savedQuote);
      
      toast({
        title: 'Email Sent',
        description: `Quote has been emailed to ${patientInfo.email}`,
      });
      
      // Navigate to quote detail
      navigate(`/quotes/${savedQuote.id}`);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Email Failed',
        description: 'There was an error sending the email',
        variant: 'destructive',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Quick Dental Quote</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Treatments */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Treatments</h2>
            <div className="space-y-4 mb-6">
              {availableTreatments.map(treatment => (
                <Card key={treatment.id} className={`cursor-pointer transition-colors ${
                  quote.treatments.some(t => t.id === treatment.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-300'
                }`} onClick={() => toggleTreatment(treatment)}>
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
                />
                <Button onClick={applyPromoCode}>Apply</Button>
              </div>
              {quote.promoCode && (
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">{quote.promoCode}</span> applied: 
                    <span className="text-green-600 ml-1">{formatCurrency(quote.discount)} discount</span>
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
            <Card>
              <CardContent className="p-6">
                {quote.treatments.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <p>Your quote is empty.</p>
                    <p>Select treatments to get started.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-medium mb-4">Selected Treatments</h3>
                    <div className="space-y-2 mb-6">
                      {quote.treatments.map((treatment, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{treatment.name}</span>
                          <span>{formatCurrency(treatment.price)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4 mb-4">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal</span>
                        <span>{formatCurrency(quote.subtotal)}</span>
                      </div>
                      
                      {quote.discount > 0 && (
                        <div className="flex justify-between mb-2 text-green-600">
                          <span>Discount</span>
                          <span>-{formatCurrency(quote.discount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(quote.total)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={handleSaveQuote}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Quote'}
                      </Button>
                      
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={handleSendEmail}
                        disabled={isSendingEmail}
                      >
                        {isSendingEmail ? 'Sending...' : 'Email Quote'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Patient information dialog */}
        <Dialog open={showPatientForm} onOpenChange={setShowPatientForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Patient Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  name="name"
                  value={patientInfo.name}
                  onChange={handlePatientInfoChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={patientInfo.email}
                  onChange={handlePatientInfoChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">Phone (optional)</label>
                <Input
                  id="phone"
                  name="phone"
                  value={patientInfo.phone}
                  onChange={handlePatientInfoChange}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowPatientForm(false)}>Cancel</Button>
              <Button onClick={isSendingEmail ? handleSendEmail : handleSaveQuote}>
                {isSendingEmail ? 'Send Email' : 'Save Quote'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}