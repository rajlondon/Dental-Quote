import React, { useState, useEffect } from 'react';

// A completely standalone component with no external dependencies
export default function SimpleStandaloneQuote() {
  // Local state for everything - no store dependencies
  const [treatments, setTreatments] = useState(() => {
    // Try to recover from localStorage on initial load
    try {
      const saved = localStorage.getItem('simple-treatments');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load saved treatments', e);
      return [];
    }
  });
  
  const [view, setView] = useState('treatments'); // 'treatments' or 'summary'
  const [promoCode, setPromoCode] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
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
  
  // Valid promo codes
  const PROMO_CODES = {
    'SUMMER15': 15,
    'DENTAL25': 25,
    'NEWPATIENT': 20,
    'TEST10': 10
  };
  
  // Save treatments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('simple-treatments', JSON.stringify(treatments));
  }, [treatments]);
  
  // Calculate totals
  const subtotal = treatments.reduce((sum, t) => sum + t.price, 0);
  const discountAmount = (subtotal * promoDiscount) / 100;
  const total = subtotal - discountAmount;
  
  // Event handlers
  const handleAddTreatment = (treatment) => {
    // Create a clone with unique ID to allow duplicate selections
    const newTreatment = {
      ...treatment,
      id: `${treatment.id}-${Date.now()}`
    };
    setTreatments([...treatments, newTreatment]);
  };
  
  const handleRemoveTreatment = (id) => {
    setTreatments(treatments.filter(t => t.id !== id));
  };
  
  const handleApplyPromoCode = () => {
    const code = promoInput.trim().toUpperCase();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!code) {
      setErrorMessage('Please enter a promo code');
      return;
    }
    
    if (PROMO_CODES[code]) {
      setPromoCode(code);
      setPromoDiscount(PROMO_CODES[code]);
      setPromoInput('');
      setSuccessMessage(`${code} applied for ${PROMO_CODES[code]}% discount`);
      
      // Save to localStorage
      localStorage.setItem('simple-promo', JSON.stringify({
        code,
        discount: PROMO_CODES[code]
      }));
    } else {
      setErrorMessage('Invalid promo code');
    }
  };
  
  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoDiscount(0);
    setSuccessMessage('Promo code removed');
    localStorage.removeItem('simple-promo');
  };
  
  const handleSubmitQuote = () => {
    if (treatments.length === 0) {
      setErrorMessage('Please add at least one treatment');
      return;
    }
    
    alert('Quote submitted successfully!');
    
    // Clear everything
    setTreatments([]);
    setPromoCode('');
    setPromoDiscount(0);
    setPromoInput('');
    setView('treatments');
    
    // Clear localStorage
    localStorage.removeItem('simple-treatments');
    localStorage.removeItem('simple-promo');
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Simple Quote Builder</h1>
      
      {/* Navigation tabs */}
      <div className="flex mb-6">
        <button 
          className={`flex-1 py-2 px-4 ${view === 'treatments' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setView('treatments')}
        >
          Select Treatments
        </button>
        <button 
          className={`flex-1 py-2 px-4 ${view === 'summary' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setView('summary')}
        >
          Quote Summary
        </button>
      </div>
      
      {/* Selected treatments - always visible */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Selected Treatments</h2>
        
        {treatments.length === 0 ? (
          <p className="text-gray-500">No treatments selected yet</p>
        ) : (
          <div>
            <div className="divide-y">
              {treatments.map(treatment => (
                <div key={treatment.id} className="py-2 flex justify-between items-center">
                  <span>{treatment.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">£{treatment.price}</span>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveTreatment(treatment.id)}
                    >
                      Remove
                    </button>
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
              
              <div className="flex justify-between font-bold mt-2">
                <span>Total:</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Conditional content based on selected view */}
      {view === 'treatments' ? (
        // Treatments view
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Available Treatments</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_TREATMENTS.map(treatment => (
              <div
                key={treatment.id}
                className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleAddTreatment(treatment)}
              >
                <div className="font-medium">{treatment.name}</div>
                <div className="text-gray-600">£{treatment.price}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Summary view
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Apply Promo Code</h2>
          
          {promoCode ? (
            // Applied promo code
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4 flex justify-between items-center">
              <div>
                <div className="font-medium text-green-700">
                  {promoCode} - {promoDiscount}% discount
                </div>
                <div className="text-sm text-green-600">
                  Saving £{discountAmount.toFixed(2)}
                </div>
              </div>
              <button
                className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50"
                onClick={handleRemovePromo}
              >
                Remove
              </button>
            </div>
          ) : (
            // Promo code input
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Enter promo code"
                />
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={handleApplyPromoCode}
                >
                  Apply Code
                </button>
              </div>
              
              <div className="text-sm mb-4">
                <p>Available codes for testing: SUMMER15, DENTAL25, TEST10</p>
              </div>
            </div>
          )}
          
          {/* Error/success messages */}
          {errorMessage && (
            <div className="text-red-600 mb-4">{errorMessage}</div>
          )}
          
          {successMessage && (
            <div className="text-green-600 mb-4">{successMessage}</div>
          )}
          
          {/* Submit button */}
          <button
            className={`w-full py-2 rounded-md ${
              treatments.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            disabled={treatments.length === 0}
            onClick={handleSubmitQuote}
          >
            {treatments.length === 0 
              ? 'Please add treatments first' 
              : 'Submit Quote'}
          </button>
        </div>
      )}
    </div>
  );
}