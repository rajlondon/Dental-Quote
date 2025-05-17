import React, { useEffect, useState, useRef } from 'react';
import { useStandaloneQuoteStore } from '../stores/standaloneQuoteStore';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Sample treatment data
const AVAILABLE_TREATMENTS = [
  { id: 'clean-basic', name: "Basic Cleaning", price: 120 },
  { id: 'clean-deep', name: "Deep Cleaning", price: 200 },
  { id: 'fill-cavity', name: "Cavity Filling", price: 150 },
  { id: 'root-canal', name: "Root Canal", price: 800 },
  { id: 'crown', name: "Crown", price: 1200 },
  { id: 'extraction', name: "Extraction", price: 180 },
  { id: 'whitening', name: "Whitening", price: 350 },
  { id: 'implant', name: "Dental Implant", price: 1500 },
  { id: 'braces', name: "Braces", price: 2500 }
];

export default function UltraMinimalQuoteBuilder() {
  // Get state and actions from our store
  const { 
    treatments, 
    promoCode, 
    promoDiscount, 
    currentView,
    addTreatment, 
    removeTreatment, 
    applyPromoCode, 
    removePromoCode, 
    setView,
    recoverFromBackup
  } = useStandaloneQuoteStore();
  
  // Local state for inputs
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  
  // Refs for direct DOM manipulation if needed
  const promoInputRef = useRef(null);
  
  // Try to recover on initial load
  useEffect(() => {
    // Wait for component to mount fully
    const timer = setTimeout(() => {
      if (treatments.length === 0) {
        recoverFromBackup();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate totals
  const subtotal = treatments.reduce((total, t) => total + t.price, 0);
  const discountAmount = (subtotal * promoDiscount) / 100;
  const finalTotal = subtotal - discountAmount;
  
  // Handlers with extra safeguards
  const handleAddTreatment = (treatment) => {
    console.log('Adding treatment:', treatment);
    
    // Add with delay to break event loop
    setTimeout(() => {
      addTreatment(treatment);
    }, 10);
  };
  
  const handleRemoveTreatment = (id) => {
    console.log('Removing treatment:', id);
    
    // Remove with delay to break event loop
    setTimeout(() => {
      removeTreatment(id);
    }, 10);
  };
  
  const handleApplyPromo = () => {
    console.log('Applying promo code:', promoInput);
    setPromoError('');
    setPromoSuccess('');
    
    if (!promoInput) {
      setPromoError('Please enter a promo code');
      return;
    }
    
    // First backup current state
    localStorage.setItem('before-promo-apply', JSON.stringify({
      treatments,
      view: currentView
    }));
    
    // Apply with delay to break event loop
    setTimeout(() => {
      const success = applyPromoCode(promoInput.toUpperCase());
      
      if (success) {
        setPromoSuccess(`Promo code ${promoInput.toUpperCase()} applied for ${promoDiscount}% discount`);
        setPromoInput('');
        
        // Create another backup after successful application
        setTimeout(() => {
          localStorage.setItem('after-promo-apply', JSON.stringify({
            treatments,
            promoCode: promoInput.toUpperCase(),
            promoDiscount,
            view: currentView
          }));
        }, 50);
      } else {
        setPromoError('Invalid promo code');
      }
    }, 50);
  };
  
  const handleRemovePromo = () => {
    console.log('Removing promo code');
    
    // Backup current state
    localStorage.setItem('before-promo-remove', JSON.stringify({
      treatments,
      promoCode,
      promoDiscount,
      view: currentView
    }));
    
    // Remove with delay to break event loop
    setTimeout(() => {
      removePromoCode();
      setPromoSuccess('');
      setPromoError('');
      
      // Create backup after removal
      setTimeout(() => {
        localStorage.setItem('after-promo-remove', JSON.stringify({
          treatments,
          promoCode: null,
          promoDiscount: 0,
          view: currentView
        }));
      }, 50);
    }, 50);
  };
  
  const handleViewChange = (view) => {
    console.log('Changing view to:', view);
    
    // Change view with delay to break event loop
    setTimeout(() => {
      setView(view);
    }, 10);
  };
  
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Ultra Minimal Quote Builder</h1>
        
        {/* Debug information */}
        <div className="bg-muted p-3 mb-6 text-xs rounded-md">
          <p>Debug: {treatments.length} treatments, view: {currentView}</p>
          <p>Promo: {promoCode || 'none'} ({promoDiscount}%)</p>
        </div>
        
        {/* Main content area */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => handleViewChange('treatments')}
            variant={currentView === 'treatments' ? 'default' : 'outline'}
            className="flex-1"
          >
            Select Treatments
          </Button>
          <Button
            onClick={() => handleViewChange('summary')}
            variant={currentView === 'summary' ? 'default' : 'outline'}
            className="flex-1"
          >
            Quote Summary
          </Button>
        </div>
        
        {/* Selected treatments (always visible) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Selected Treatments</CardTitle>
          </CardHeader>
          <CardContent>
            {treatments.length > 0 ? (
              <div>
                <div className="divide-y">
                  {treatments.map(treatment => (
                    <div key={treatment.id} className="py-2 flex justify-between items-center">
                      <span>{treatment.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">£{treatment.price}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveTreatment(treatment.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({promoDiscount}%):</span>
                      <span>-£{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold mt-2 text-lg">
                    <span>Total:</span>
                    <span>£{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No treatments selected yet</p>
            )}
          </CardContent>
        </Card>
        
        {/* Treatments view */}
        {currentView === 'treatments' && (
          <Card>
            <CardHeader>
              <CardTitle>Available Treatments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {AVAILABLE_TREATMENTS.map(treatment => (
                  <div
                    key={treatment.id}
                    className="p-3 border rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => handleAddTreatment(treatment)}
                  >
                    <div className="font-medium">{treatment.name}</div>
                    <div className="text-muted-foreground">£{treatment.price}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Summary view */}
        {currentView === 'summary' && (
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Promo code section */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Promo Code</h3>
                  
                  {!promoCode ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md"
                        placeholder="Enter promo code"
                        ref={promoInputRef}
                      />
                      <Button 
                        onClick={handleApplyPromo}
                        className="sm:whitespace-nowrap"
                      >
                        Apply Promo
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-md flex justify-between items-center">
                      <div>
                        <div className="text-green-700 font-medium">
                          {promoCode} - {promoDiscount}% discount
                        </div>
                        <div className="text-green-600 text-sm">
                          Saving £{discountAmount.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemovePromo}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  
                  {promoError && (
                    <div className="mt-2 text-red-600 text-sm">{promoError}</div>
                  )}
                  
                  {promoSuccess && (
                    <div className="mt-2 text-green-600 text-sm">{promoSuccess}</div>
                  )}
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Available promo codes for testing:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                      <div className="border rounded-md p-2 bg-accent/20">SUMMER15 (15%)</div>
                      <div className="border rounded-md p-2 bg-accent/20">DENTAL25 (25%)</div>
                      <div className="border rounded-md p-2 bg-accent/20">TEST10 (10%)</div>
                    </div>
                  </div>
                </div>
                
                {/* Checkout button */}
                <div className="border-t pt-4 mt-6">
                  <Button 
                    size="lg"
                    className="w-full"
                    disabled={treatments.length === 0}
                    onClick={() => {
                      alert("Quote submitted successfully!");
                      // Reset everything after submission
                      setTimeout(() => {
                        localStorage.clear();
                        window.location.reload();
                      }, 500);
                    }}
                  >
                    {treatments.length === 0 ? 'Please add treatments first' : 'Submit Quote'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}