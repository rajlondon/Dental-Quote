import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  price: number;
  description?: string;
  quantity: number;
}

// Mock data for immediate testing
const MOCK_TREATMENTS: Treatment[] = [
  { id: 'clean', name: 'Dental Cleaning', description: 'Professional teeth cleaning', price: 100, quantity: 1 },
  { id: 'whitening', name: 'Teeth Whitening', description: 'Professional whitening treatment', price: 250, quantity: 1 },
  { id: 'filling', name: 'Dental Filling', description: 'Composite filling for cavities', price: 150, quantity: 1 },
  { id: 'root', name: 'Root Canal', description: 'Root canal therapy', price: 800, quantity: 1 },
  { id: 'crown', name: 'Dental Crown', description: 'Porcelain crown restoration', price: 950, quantity: 1 },
  { id: 'bridge', name: 'Dental Bridge', description: 'Fixed bridge for missing teeth', price: 1800, quantity: 1 },
  { id: 'implant', name: 'Dental Implant', description: 'Single tooth implant', price: 2500, quantity: 1 },
  { id: 'extraction', name: 'Tooth Extraction', description: 'Simple tooth extraction', price: 200, quantity: 1 },
];

// Mock promo codes for testing
const MOCK_PROMO_CODES: Record<string, { type: 'percentage' | 'fixed', value: number }> = {
  'DENTAL10': { type: 'percentage', value: 10 },
  'SMILE20': { type: 'percentage', value: 20 },
  'DISCOUNT30': { type: 'percentage', value: 30 },
  'NEWSMILE': { type: 'fixed', value: 100 },
};

/**
 * A completely isolated implementation with separate state variables
 * Follows the approach recommended in the document to fix promo code issues
 */
const QuickQuoteIsolated = () => {
  const [, navigate] = useLocation();
  
  // Completely separate state variables with no dependencies between them
  const [availableTreatments, setAvailableTreatments] = useState<Treatment[]>([]);
  const [selectedTreatments, setSelectedTreatments] = useState<Treatment[]>([]);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApplyingPromo, setIsApplyingPromo] = useState<boolean>(false);
  
  // 1. Add console logs for component lifecycle
  useEffect(() => {
    console.log('[MOUNT] QuickQuoteIsolated component mounted');
    
    return () => {
      console.log('[UNMOUNT] QuickQuoteIsolated component unmounted');
    };
  }, []);

  // 2. Add a ref to track treatments through renders
  const treatmentsRef = useRef(selectedTreatments);
  useEffect(() => {
    console.log('[STATE CHANGE] Treatments changed:', {
      previous: treatmentsRef.current,
      current: selectedTreatments,
      same: treatmentsRef.current === selectedTreatments
    });
    treatmentsRef.current = selectedTreatments;
  }, [selectedTreatments]);

  // 3. Monitor all state changes
  useEffect(() => {
    console.log('[STATE SNAPSHOT]', {
      selectedTreatments: selectedTreatments.map(t => t.id),
      promoCode: appliedPromoCode,
      discount,
      timestamp: new Date().toISOString()
    });
  }, [selectedTreatments, appliedPromoCode, discount]);
  
  // Force preservation of treatments
  const preservedTreatmentsRef = useRef<Treatment[]>([]);
  useEffect(() => {
    if (selectedTreatments.length > 0) {
      preservedTreatmentsRef.current = [...selectedTreatments];
    }
  }, [selectedTreatments]);

  useEffect(() => {
    // Check if treatments were lost after any state change
    const timeoutId = setTimeout(() => {
      if (selectedTreatments.length === 0 && preservedTreatmentsRef.current.length > 0) {
        console.log('[RECOVERY] Treatments were lost! Restoring from preserved ref');
        setSelectedTreatments([...preservedTreatmentsRef.current]);
      }
    }, 50);
    
    return () => clearTimeout(timeoutId);
  });
  
  // UI state
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [patientInfo, setPatientInfo] = useState({ name: '', email: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Load available treatments
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call with mock data for testing
    setTimeout(() => {
      setAvailableTreatments(MOCK_TREATMENTS);
      setIsLoading(false);
    }, 500);
  }, []);
  
  // Calculate totals without affecting state
  const calculateTotals = useCallback(() => {
    const subtotal = selectedTreatments.reduce((sum, t) => sum + t.price, 0);
    const total = subtotal - discount;
    return { subtotal, total };
  }, [selectedTreatments, discount]);
  
  // Toggle treatment selection - completely separate from promo code state
  const toggleTreatment = (treatment: Treatment) => {
    console.log('[QuickQuoteIsolated] Toggling treatment:', treatment.id);
    
    setSelectedTreatments(prev => {
      const exists = prev.some(t => t.id === treatment.id);
      
      if (exists) {
        // Remove treatment
        const newTreatments = prev.filter(t => t.id !== treatment.id);
        console.log('[QuickQuoteIsolated] Removed treatment. New count:', newTreatments.length);
        return newTreatments;
      } else {
        // Add treatment
        const newTreatments = [...prev, treatment];
        console.log('[QuickQuoteIsolated] Added treatment. New count:', newTreatments.length);
        return newTreatments;
      }
    });
  };
  
  // Apply promo code - completely separate from treatment state
  const applyPromoCode = async () => {
    const code = promoCodeInput.trim().toUpperCase();
    
    if (!code) {
      toast({
        title: 'Error',
        description: 'Please enter a promo code',
        variant: 'destructive',
      });
      return;
    }
    
    // Log before any state changes
    console.log('[PROMO START] Before applying promo:', {
      selectedTreatments: selectedTreatments.map(t => ({id: t.id, name: t.name})),
      treatmentCount: selectedTreatments.length,
      promoCode: code
    });
    
    // Store treatments in multiple ways to track potential issues
    const treatmentsCopy = [...selectedTreatments];
    const treatmentIds = selectedTreatments.map(t => t.id);
    
    // Store in ref for recovery
    preservedTreatmentsRef.current = treatmentsCopy;
    
    if (!MOCK_PROMO_CODES[code]) {
      toast({
        title: 'Invalid Code',
        description: 'The promo code you entered is not valid',
        variant: 'destructive',
      });
      return;
    }
    
    setIsApplyingPromo(true);
    console.log('[PROMO APPLYING] Applying code:', code);
    
    try {
      // IMPORTANT FIX: Store treatments explicitly before any async operations
      // This creates a stable reference that won't be affected by React's batched updates
      const stableTreatments = [...selectedTreatments];

      // Simulate API call with detailed logging
      console.log('[PROMO API] Making API call...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check treatments still exist before calculation
      console.log('[PROMO API] Treatments check:', {
        originalCount: treatmentsCopy.length,
        currentCount: selectedTreatments.length,
        treatmentIds,
        currentIds: selectedTreatments.map(t => t.id)
      });
      
      // IMPORTANT FIX: Calculate the discount based on the stable treatment copy
      // This ensures correct calculation even if state updates have issues
      const subtotal = stableTreatments.reduce((sum, treatment) => 
        sum + (treatment.price * (treatment.quantity || 1)), 0);
        
      let calculatedDiscount = 0;
      
      if (MOCK_PROMO_CODES[code].type === 'percentage') {
        calculatedDiscount = (subtotal * MOCK_PROMO_CODES[code].value / 100);
        console.log(`[PROMO DISCOUNT] Applying ${MOCK_PROMO_CODES[code].value}% discount on ${subtotal} = ${calculatedDiscount}`);
      } else if (MOCK_PROMO_CODES[code].type === 'fixed') {
        calculatedDiscount = MOCK_PROMO_CODES[code].value;
        console.log(`[PROMO DISCOUNT] Applying fixed discount of ${MOCK_PROMO_CODES[code].value}`);
      }
      
      // Ensure discount doesn't exceed subtotal
      calculatedDiscount = Math.min(calculatedDiscount, subtotal);
      
      console.log('[PROMO SUCCESS] About to update state:', {
        newDiscount: calculatedDiscount,
        newPromoCode: code,
        currentTreatments: selectedTreatments.length,
        originalTreatments: treatmentsCopy.length
      });
      
      // IMPORTANT FIX: First make sure treatments are preserved by setting them explicitly
      // This critical fix ensures treatments don't disappear when promo code is applied
      setSelectedTreatments(stableTreatments);
      
      // CRITICAL: Update the promo code and discount state separately
      // This avoids any potential race conditions or dependencies
      setAppliedPromoCode(code);
      setDiscount(calculatedDiscount);
      
      // Clear the input
      setPromoCodeInput('');
      
      // Force preservation of treatments if they were somehow lost
      if (selectedTreatments.length === 0 && stableTreatments.length > 0) {
        console.log('[PROMO RECOVERY] Treatments were lost! Restoring from backup');
        setSelectedTreatments(stableTreatments);
      }
      
      // Show success message with delay to allow state updates to complete
      setTimeout(() => {
        console.log('[PROMO TOAST] Showing success toast, treatments:', selectedTreatments.length);
        toast({
          title: 'Promo Code Applied',
          description: `${code} has been applied successfully! Discount: ${formatCurrency(calculatedDiscount)}`,
        });
      }, 300);
    } catch (error) {
      console.error('[PROMO ERROR]', error);
      toast({
        title: 'Error',
        description: 'Failed to apply promo code',
        variant: 'destructive',
      });
    } finally {
      console.log('[PROMO FINALLY] Resetting loading state, treatments:', selectedTreatments.length);
      setIsApplyingPromo(false);
    }
  };
  
  // Remove promo code - doesn't touch the treatments state
  const removePromoCode = () => {
    console.log('[QuickQuoteIsolated] Removing promo code. Current treatments:', selectedTreatments.length);
    setAppliedPromoCode(null);
    setDiscount(0);
    toast({
      title: 'Promo Code Removed',
      description: 'The promo code has been removed from your quote',
    });
  };
  
  // Reset quote
  const resetQuote = () => {
    setSelectedTreatments([]);
    setAppliedPromoCode(null);
    setDiscount(0);
    setPromoCodeInput('');
    toast({
      title: 'Quote Reset',
      description: 'Your quote has been reset',
    });
  };
  
  // Handle saving quote
  const handleSaveQuote = async () => {
    if (selectedTreatments.length === 0) {
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
        treatments: selectedTreatments,
        promoCode: appliedPromoCode,
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
        treatments: selectedTreatments,
        promoCode: appliedPromoCode,
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
  
  // Debug component to visualize state
  const DebugInfo = () => {
    if (process.env.NODE_ENV === 'production') return null;
    
    return (
      <div className="mt-4 p-3 border border-gray-200 rounded bg-gray-50 text-xs">
        <h4 className="font-medium">Debug Info:</h4>
        <div className="mt-1 space-y-1">
          <div>Selected Treatments: {selectedTreatments.length}</div>
          <div>Treatment IDs: {selectedTreatments.map(t => t.id).join(', ')}</div>
          <div>Applied Promo Code: {appliedPromoCode || 'None'}</div>
          <div>Discount: ${discount.toFixed(2)}</div>
          <div>Subtotal: ${calculateTotals().subtotal.toFixed(2)}</div>
          <div>Total: ${calculateTotals().total.toFixed(2)}</div>
        </div>
      </div>
    );
  };
  
  const { subtotal, total } = calculateTotals();
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Quick Dental Quote <span className="text-sm font-medium text-green-600">(Isolated Implementation)</span></h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Treatments */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Treatments</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {availableTreatments.map(treatment => (
                  <Card key={treatment.id} className={`cursor-pointer transition-colors ${
                    selectedTreatments.some(t => t.id === treatment.id) 
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
            )}
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold mb-2">Promo Code</h2>
              <div className="flex gap-2">
                <Input 
                  value={promoCodeInput} 
                  onChange={e => setPromoCodeInput(e.target.value)} 
                  placeholder="Enter promo code"
                  disabled={isApplyingPromo}
                />
                <Button 
                  onClick={applyPromoCode} 
                  disabled={isApplyingPromo || !promoCodeInput.trim()}
                >
                  {isApplyingPromo ? 'Applying...' : 'Apply'}
                </Button>
              </div>
              {appliedPromoCode && (
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">{appliedPromoCode}</span> applied: 
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
                {selectedTreatments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Select treatments to see your quote</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {selectedTreatments.map(treatment => (
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
            
            {/* Debug section */}
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
};

export default QuickQuoteIsolated;