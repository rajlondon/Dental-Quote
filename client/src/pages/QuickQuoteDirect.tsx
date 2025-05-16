import React, { useState, useEffect, useCallback } from 'react';
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

// Implementation based on the direct approach document
export default function QuickQuoteDirect() {
  const [, navigate] = useLocation();
  
  // Available treatments
  const availableTreatments: Treatment[] = [
    { id: 'clean', name: 'Dental Cleaning', description: 'Professional teeth cleaning', price: 100, quantity: 1 },
    { id: 'whitening', name: 'Teeth Whitening', description: 'Professional whitening treatment', price: 250, quantity: 1 },
    { id: 'filling', name: 'Dental Filling', description: 'Composite filling for cavities', price: 150, quantity: 1 },
    { id: 'root', name: 'Root Canal', description: 'Root canal therapy', price: 800, quantity: 1 },
    { id: 'crown', name: 'Dental Crown', description: 'Porcelain crown restoration', price: 950, quantity: 1 },
    { id: 'bridge', name: 'Dental Bridge', description: 'Fixed bridge for missing teeth', price: 1800, quantity: 1 },
    { id: 'implant', name: 'Dental Implant', description: 'Single tooth implant', price: 2500, quantity: 1 },
    { id: 'extraction', name: 'Tooth Extraction', description: 'Simple tooth extraction', price: 200, quantity: 1 },
  ];
  
  // Promo codes
  const promoCodes: Record<string, { type: 'percentage' | 'fixed', value: number }> = {
    'DENTAL10': { type: 'percentage', value: 10 },
    'SMILE20': { type: 'percentage', value: 20 },
    'DISCOUNT30': { type: 'percentage', value: 30 },
    'NEWSMILE': { type: 'fixed', value: 100 },
  };
  
  // 1. First, ensure we have separate state variables - directly from the document
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState<boolean>(false);
  
  // UI state
  const [promoInput, setPromoInput] = useState('');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [patientInfo, setPatientInfo] = useState({ name: '', email: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // 2. Create a function to calculate totals based on current state
  const calculateTotals = useCallback(() => {
    const subtotal = treatments.reduce((sum, t) => sum + t.price, 0);
    const total = subtotal - discount;
    return { subtotal, total };
  }, [treatments, discount]);
  
  // Toggle treatment selection
  const toggleTreatment = (treatment: Treatment) => {
    // Important: Store treatments in a local variable first
    const currentTreatments = [...treatments];
    
    // Check if treatment is already selected
    const isSelected = currentTreatments.some(t => t.id === treatment.id);
    
    let newTreatments;
    if (isSelected) {
      // Remove treatment if already selected
      newTreatments = currentTreatments.filter(t => t.id !== treatment.id);
    } else {
      // Add treatment if not already selected
      newTreatments = [...currentTreatments, treatment];
    }
    
    console.log("[QuoteBuilder] Toggling treatment:", treatment.id, "Selected:", !isSelected);
    console.log("[QuoteBuilder] Treatments before update:", currentTreatments.length);
    console.log("[QuoteBuilder] Treatments after update:", newTreatments.length);
    
    // Update the treatments state directly
    setTreatments(newTreatments);
    
    // If we have a promo code, recalculate the discount
    if (promoCode && promoCodes[promoCode]) {
      recalculateDiscount(newTreatments, promoCode);
    }
  };
  
  // Helper function to recalculate discount when treatments change
  const recalculateDiscount = (currentTreatments: Treatment[], code: string) => {
    const subtotal = currentTreatments.reduce((sum, t) => sum + t.price, 0);
    let calculatedDiscount = 0;
    
    if (promoCodes[code].type === 'percentage') {
      calculatedDiscount = (subtotal * promoCodes[code].value / 100);
      console.log(`[QuoteBuilder] Recalculating ${promoCodes[code].value}% discount on ${subtotal} = ${calculatedDiscount}`);
    } else if (promoCodes[code].type === 'fixed') {
      calculatedDiscount = promoCodes[code].value;
      console.log(`[QuoteBuilder] Recalculating fixed discount of ${promoCodes[code].value}`);
    }
    
    // Ensure discount doesn't exceed subtotal
    calculatedDiscount = Math.min(calculatedDiscount, subtotal);
    
    setDiscount(calculatedDiscount);
  };
  
  // 3. Implement a completely separate promo code function - directly from the document
  const applyPromoCode = async () => {
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
    
    // Important: Store treatments in a local variable first
    const currentTreatments = [...treatments];
    
    setIsApplyingPromo(true);
    try {
      console.log("[QuoteBuilder] Applying promo code. Current treatments:", currentTreatments.length);
      
      // Calculate the discount
      const subtotal = currentTreatments.reduce((sum, t) => sum + t.price, 0);
      let calculatedDiscount = 0;
      
      if (promoCodes[code].type === 'percentage') {
        calculatedDiscount = (subtotal * promoCodes[code].value / 100);
        console.log(`[QuoteBuilder] Applying ${promoCodes[code].value}% discount on ${subtotal} = ${calculatedDiscount}`);
      } else if (promoCodes[code].type === 'fixed') {
        calculatedDiscount = promoCodes[code].value;
        console.log(`[QuoteBuilder] Applying fixed discount of ${promoCodes[code].value}`);
      }
      
      // Ensure discount doesn't exceed subtotal
      calculatedDiscount = Math.min(calculatedDiscount, subtotal);
      
      // CRITICAL: Update the state variables separately to avoid race conditions
      setPromoCode(code);
      setDiscount(calculatedDiscount);
      
      // Log the updated state for debugging
      console.log("[QuoteBuilder] Promo applied successfully. Discount:", calculatedDiscount);
      console.log("[QuoteBuilder] Treatments after promo:", currentTreatments.length);
      
      // Clear the input
      setPromoInput('');
      
      // Show success message after a small delay to ensure state updates
      setTimeout(() => {
        toast({
          title: 'Promo Code Applied',
          description: `${code} has been applied successfully! Discount: ${formatCurrency(calculatedDiscount)}`,
        });
      }, 100);
      
    } catch (error) {
      console.error("[QuoteBuilder] Error applying promo code:", error);
      toast({
        title: "Error",
        description: "Failed to apply promo code",
        variant: "destructive",
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };
  
  // 4. Implement a function to remove the promo code - directly from the document
  const removePromoCode = () => {
    console.log("[QuoteBuilder] Removing promo code. Current treatments:", treatments.length);
    setPromoCode(null);
    setDiscount(0);
    toast({
      title: "Promo Code Removed",
      description: "The promo code has been removed from your quote",
    });
  };
  
  // Reset quote
  const resetQuote = () => {
    setTreatments([]);
    setPromoCode(null);
    setDiscount(0);
    setPromoInput('');
    toast({
      title: 'Quote Reset',
      description: 'Your quote has been reset',
    });
  };
  
  // Handle saving quote
  const handleSaveQuote = async () => {
    if (treatments.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one treatment',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { subtotal, total } = calculateTotals();
      
      const quote = await quoteService.saveQuote({
        treatments,
        promoCode,
        discount,
        subtotal,
        total,
        patientName: '',
        patientEmail: '',
      });
      
      toast({
        title: 'Quote Saved',
        description: 'Your quote has been saved successfully',
      });
      
      navigate(`/quotes/${quote.id}`);
    } catch (error) {
      console.error('Error saving quote:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving your quote',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle patient info changes
  const handlePatientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle sending email
  const handleSendEmail = async () => {
    if (!patientInfo.name || !patientInfo.email) {
      toast({
        title: 'Error',
        description: 'Please provide name and email',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSendingEmail(true);
    
    try {
      const { subtotal, total } = calculateTotals();
      
      await emailService.sendQuoteEmail({
        treatments,
        promoCode,
        discount,
        subtotal,
        total,
        recipientName: patientInfo.name,
        recipientEmail: patientInfo.email,
      });
      
      setShowPatientForm(false);
      
      toast({
        title: 'Email Sent',
        description: `Quote has been sent to ${patientInfo.email}`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: 'There was an error sending the email',
        variant: 'destructive',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  // Debug component to visualize state - directly from the document
  const DebugInfo = () => {
    if (process.env.NODE_ENV === 'production') return null;
    
    return (
      <div className="mt-4 p-3 border border-gray-200 rounded bg-gray-50 text-xs">
        <h4 className="font-medium">Debug Info:</h4>
        <div className="mt-1 space-y-1">
          <div>Treatments: {treatments.length}</div>
          <div>Treatment IDs: {treatments.map(t => t.id).join(', ')}</div>
          <div>Promo Code: {promoCode || 'None'}</div>
          <div>Discount: ${discount.toFixed(2)}</div>
          <div>Subtotal: ${calculateTotals().subtotal.toFixed(2)}</div>
          <div>Total: ${calculateTotals().total.toFixed(2)}</div>
        </div>
      </div>
    );
  };
  
  // Calculate current totals
  const { subtotal, total } = calculateTotals();
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Quick Dental Quote <span className="text-sm font-medium text-green-600">(Direct Implementation)</span></h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Treatments */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Treatments</h2>
            <div className="space-y-4 mb-6">
              {availableTreatments.map(treatment => (
                <Card key={treatment.id} className={`cursor-pointer transition-colors ${
                  treatments.some(t => t.id === treatment.id) 
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
                  disabled={isApplyingPromo}
                />
                <Button 
                  onClick={applyPromoCode} 
                  disabled={isApplyingPromo || !promoInput.trim()}
                >
                  {isApplyingPromo ? 'Applying...' : 'Apply'}
                </Button>
              </div>
              {promoCode && (
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">{promoCode}</span> applied: 
                    <span className="text-green-600 ml-1">{formatCurrency(discount)} discount</span>
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
            <Card className="mb-6">
              <CardContent className="p-4">
                {treatments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Select treatments to see your quote</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {treatments.map(treatment => (
                        <div key={treatment.id} className="flex justify-between">
                          <span>{treatment.name}</span>
                          <span>{formatCurrency(treatment.price)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t mt-4 pt-4">
                      <div className="flex justify-between font-medium">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(discount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-2">
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
                        onClick={() => setShowPatientForm(true)}
                        disabled={isSendingEmail}
                      >
                        Email Quote
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Debug section - only shown in development */}
            <DebugInfo />
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
              <Button variant="outline" onClick={() => setShowPatientForm(false)}>Cancel</Button>
              <Button onClick={handleSendEmail} disabled={isSendingEmail}>
                {isSendingEmail ? 'Sending...' : 'Send Quote'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}