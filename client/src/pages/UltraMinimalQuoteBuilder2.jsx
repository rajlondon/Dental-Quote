import React, { useEffect, useState, useRef } from 'react';
import { useStandaloneQuoteStore } from '../stores/standaloneQuoteStore';

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

export default function UltraMinimalQuoteBuilder2() {
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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Ultra Minimal Quote Builder</h1>
      
      {/* Debug information */}
      <div className="bg-gray-100 p-3 mb-4 text-xs">
        <p>Debug: {treatments.length} treatments, view: {currentView}</p>
        <p>Promo: {promoCode || 'none'} ({promoDiscount}%)</p>
      </div>
      
      {/* Main content area */}
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          className={`px-4 py-2 rounded ${currentView === 'treatments' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleViewChange('treatments')}
        >
          Select Treatments
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded ${currentView === 'summary' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleViewChange('summary')}
        >
          Quote Summary
        </button>
      </div>
      
      {/* Selected treatments (always visible) */}
      <div className="bg-white p-4 border rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Your Selected Treatments</h2>
        {treatments.length > 0 ? (
          <div>
            <ul className="divide-y">
              {treatments.map(treatment => (
                <li key={treatment.id} className="py-2 flex justify-between items-center">
                  <span>{treatment.name}</span>
                  <div className="flex items-center gap-3">
                    <span>£{treatment.price}</span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveTreatment(treatment.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t">
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
              <div className="flex justify-between font-bold mt-1">
                <span>Total:</span>
                <span>£{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No treatments selected yet</p>
        )}
      </div>
      
      {/* Treatments view */}
      {currentView === 'treatments' && (
        <div className="bg-white p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Available Treatments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_TREATMENTS.map(treatment => (
              <div
                key={treatment.id}
                className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => handleAddTreatment(treatment)}
              >
                <div className="font-medium">{treatment.name}</div>
                <div className="text-gray-600">£{treatment.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Summary view */}
      {currentView === 'summary' && (
        <div className="bg-white p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Apply Promo Code</h2>
          {!promoCode ? (
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row gap-3 mb-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Enter promo code"
                  ref={promoInputRef}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleApplyPromo}
                >
                  Apply Promo
                </button>
              </div>
              
              {promoError && (
                <div className="text-red-600 text-sm">{promoError}</div>
              )}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 p-3 rounded-md flex justify-between items-center mb-4">
              <div>
                <div className="text-green-700 font-medium">
                  {promoCode} - {promoDiscount}% discount
                </div>
                <div className="text-green-600 text-sm">
                  Saving £{discountAmount.toFixed(2)}
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                onClick={handleRemovePromo}
              >
                Remove
              </button>
            </div>
          )}
          
          <div className="text-sm text-gray-600 mb-6">
            <p>Available promo codes for testing:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              <div className="border rounded-md p-2 bg-gray-50">SUMMER15 (15%)</div>
              <div className="border rounded-md p-2 bg-gray-50">DENTAL25 (25%)</div>
              <div className="border rounded-md p-2 bg-gray-50">TEST10 (10%)</div>
            </div>
          </div>
          
          <button
            type="button"
            className={`w-full py-2 px-4 rounded ${treatments.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
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
          </button>
        </div>
      )}
    </div>
  );
}