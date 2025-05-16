import React, { useState, useEffect } from 'react';
import { useQuoteStore } from '@/stores/quoteStore';
import { PatientInfoForm } from './PatientInfoForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Trash2, Minus, Plus, ArrowRight, FileText } from 'lucide-react';

// Formatting helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Treatment categories
const CATEGORIES = {
  'preventive': 'Preventive Care',
  'cosmetic': 'Cosmetic Dentistry',
  'restorative': 'Restorative Treatments',
  'surgical': 'Surgical Procedures',
  'emergency': 'Emergency Services'
};

export function EnhancedQuoteBuilder() {
  // Connect to global store
  const {
    treatments,
    promoCode,
    discountPercent,
    subtotal,
    total,
    currentStep,
    patientInfo,
    loading,
    addTreatment,
    removeTreatment,
    updateQuantity,
    applyPromoCode,
    removePromoCode,
    setCurrentStep,
    saveQuote,
    resetQuote
  } = useQuoteStore();
  
  // Local state
  const [promoInput, setPromoInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [availableTreatments, setAvailableTreatments] = useState<Array<{
    id: string;
    name: string;
    price: number;
    quantity?: number;
    category: string;
    description: string;
    imageUrl?: string;
  }>>([]);
  
  // Fetch available treatments on mount
  useEffect(() => {
    // In a production environment, we would fetch from an API
    // For demo purposes, we'll use static data
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setAvailableTreatments([
        { 
          id: 'clean-01', 
          name: 'Standard Dental Cleaning', 
          price: 100, 
          category: 'preventive',
          description: 'Regular dental cleaning and oral examination'
        },
        { 
          id: 'clean-02', 
          name: 'Deep Cleaning', 
          price: 250, 
          category: 'preventive',
          description: 'Scaling and root planing for patients with signs of gum disease'
        },
        { 
          id: 'xray-01', 
          name: 'Digital X-rays (Full Set)', 
          price: 150, 
          category: 'preventive',
          description: 'Complete series of digital x-rays for comprehensive diagnosis'
        },
        { 
          id: 'white-01', 
          name: 'Professional Teeth Whitening', 
          price: 350, 
          category: 'cosmetic',
          description: 'Professional-grade whitening treatment for brighter smile'
        },
        { 
          id: 'veneer-01', 
          name: 'Porcelain Veneers (per tooth)', 
          price: 900, 
          category: 'cosmetic',
          description: 'Custom-made shells to cover front surface of teeth'
        },
        { 
          id: 'fill-01', 
          name: 'Tooth-Colored Filling', 
          price: 150, 
          category: 'restorative',
          description: 'Composite restoration for damaged or decayed teeth'
        },
        { 
          id: 'crown-01', 
          name: 'Porcelain Crown', 
          price: 1200, 
          category: 'restorative',
          description: 'Full coverage restoration for severely damaged teeth'
        },
        { 
          id: 'root-01', 
          name: 'Root Canal Therapy', 
          price: 800, 
          category: 'restorative',
          description: 'Treatment for infected or inflamed tooth pulp'
        },
        { 
          id: 'implant-01', 
          name: 'Dental Implant', 
          price: 3000, 
          category: 'surgical',
          description: 'Titanium post and crown for tooth replacement'
        },
        { 
          id: 'extract-01', 
          name: 'Simple Tooth Extraction', 
          price: 200, 
          category: 'surgical',
          description: 'Removal of visible tooth'
        },
        { 
          id: 'extract-02', 
          name: 'Surgical Tooth Extraction', 
          price: 350, 
          category: 'surgical',
          description: 'Removal of impacted or broken tooth requiring surgical approach'
        },
        { 
          id: 'emergency-01', 
          name: 'Emergency Examination', 
          price: 100, 
          category: 'emergency',
          description: 'Urgent care assessment for dental pain or trauma'
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);
  
  // Helper function to set loading state
  const setLoading = (isLoading: boolean) => {
    const state = useQuoteStore.getState();
    useQuoteStore.setState({
      loading: {
        ...state.loading,
        treatments: isLoading
      }
    });
  };
  
  // Filter treatments by category
  const filteredTreatments = selectedCategory 
    ? availableTreatments.filter(t => t.category === selectedCategory)
    : availableTreatments;
  
  // Handler for promo code application
  const handleApplyPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('APPLY PROMO CLICK DETECTED - PREVENTING DEFAULT');
    e.stopPropagation();
    
    if (!promoInput || loading.promoCode) return;
    
    console.log('APPLYING PROMO CODE:', promoInput);
    setStatusMessage('Applying promo code...');
    
    const success = await applyPromoCode(promoInput);
    
    if (success) {
      setStatusMessage(`Successfully applied ${discountPercent}% discount.`);
      setPromoInput('');
      
      // Clear status after delay
      setTimeout(() => {
        setStatusMessage('');
      }, 3000);
    } else {
      setStatusMessage('Invalid promo code. Please try again.');
      
      // Clear status after delay
      setTimeout(() => {
        setStatusMessage('');
      }, 3000);
    }
  };
  
  // Handler for saving quote
  const handleSaveQuote = async () => {
    if (treatments.length === 0) {
      setStatusMessage('Please add at least one treatment.');
      
      // Clear status after delay
      setTimeout(() => {
        setStatusMessage('');
      }, 3000);
      return;
    }
    
    if (!patientInfo) {
      setStatusMessage('Please complete patient information.');
      
      // Clear status after delay
      setTimeout(() => {
        setStatusMessage('');
      }, 3000);
      return;
    }
    
    setStatusMessage('Saving your quote...');
    
    const quoteId = await saveQuote();
    
    if (quoteId) {
      setStatusMessage(`Quote created successfully! ID: ${quoteId}`);
      
      // Clear status after delay
      setTimeout(() => {
        setStatusMessage('');
        // Optional: redirect or show success screen
      }, 3000);
    } else {
      setStatusMessage('Error creating quote. Please try again.');
      
      // Clear status after delay
      setTimeout(() => {
        setStatusMessage('');
      }, 3000);
    }
  };
  
  // Render progress steps
  const renderProgressSteps = () => {
    return (
      <div className="flex mb-6">
        <div 
          className={`flex-1 pb-4 relative text-center border-b-2 ${
            currentStep === 'treatments' ? 'border-primary text-primary font-medium' : 'border-gray-200'
          }`}
        >
          <div className="absolute -bottom-2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 border-2 bg-white border-gray-200"></div>
          <span>1. Select Treatments</span>
        </div>
        <div 
          className={`flex-1 pb-4 relative text-center border-b-2 ${
            currentStep === 'patient-info' ? 'border-primary text-primary font-medium' : 'border-gray-200'
          }`}
        >
          <div className="absolute -bottom-2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 border-2 bg-white border-gray-200"></div>
          <span>2. Patient Information</span>
        </div>
        <div 
          className={`flex-1 pb-4 relative text-center border-b-2 ${
            currentStep === 'summary' ? 'border-primary text-primary font-medium' : 'border-gray-200'
          }`}
        >
          <div className="absolute -bottom-2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 border-2 bg-white border-gray-200"></div>
          <span>3. Review & Finalize</span>
        </div>
      </div>
    );
  };
  
  // Render treatments selection step
  const renderTreatmentsStep = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Treatments</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Category Filters */}
          <div className="flex overflow-x-auto pb-2 mb-4 gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            
            {Object.entries(CATEGORIES).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
              >
                {label}
              </Button>
            ))}
          </div>
          
          {loading.treatments ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Treatments Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTreatments.map(treatment => (
                  <div 
                    key={treatment.id}
                    className={`p-4 border rounded-md cursor-pointer transition-colors hover:border-primary ${
                      treatments.some(t => t.id === treatment.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => addTreatment({
                      ...treatment,
                      quantity: treatment.quantity || 1
                    })}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{treatment.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">{formatCurrency(treatment.price)}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {CATEGORIES[treatment.category as keyof typeof CATEGORIES]}
                        </p>
                        <p className="text-sm mt-2">{treatment.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {treatments.some(t => t.id === treatment.id) ? (
                          <div className="bg-primary/20 rounded-full p-1">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 border rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Selected Treatments Summary */}
              {treatments.length > 0 && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-2">Selected Treatments: {treatments.length}</h3>
                  <ul className="mb-4">
                    {treatments.map(t => (
                      <li key={t.id} className="flex justify-between py-1">
                        <span>{t.name} {t.quantity > 1 ? `(Qty: ${t.quantity})` : ''}</span>
                        <span className="font-medium">{formatCurrency(t.price * t.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                </div>
              )}
              
              {/* Next Step Button */}
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => setCurrentStep('patient-info')}
                  disabled={treatments.length === 0}
                  className="flex items-center"
                >
                  Continue to Patient Information
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // Render quote summary step
  const renderSummaryStep = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Patient Information Summary */}
          {patientInfo && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-2">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {patientInfo.firstName} {patientInfo.lastName}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {patientInfo.email}
                </div>
                {patientInfo.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {patientInfo.phone}
                  </div>
                )}
                {patientInfo.preferredDate && (
                  <div>
                    <span className="font-medium">Preferred Date:</span> {new Date(patientInfo.preferredDate).toLocaleDateString()}
                  </div>
                )}
                {patientInfo.notes && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Notes:</span> {patientInfo.notes}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Selected Treatments */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Selected Treatments:</h3>
            <div className="space-y-2">
              {treatments.map(treatment => (
                <div 
                  key={treatment.id} 
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      onClick={() => {
                        removeTreatment(treatment.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div>
                      <span className="ml-2">{treatment.name}</span>
                      {treatment.category && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({CATEGORIES[treatment.category as keyof typeof CATEGORIES]})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => {
                          updateQuantity(treatment.id, Math.max(1, treatment.quantity - 1));
                        }}
                        disabled={treatment.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center">{treatment.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => {
                          updateQuantity(treatment.id, treatment.quantity + 1);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-medium min-w-[80px] text-right">
                      {formatCurrency(treatment.price * treatment.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Promo Code Section */}
          <div className="pt-4 border-t mb-6">
            <h3 className="font-medium mb-3">Promo Code</h3>
            
            {promoCode ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    <div className="text-green-700 flex items-center">
                      <Badge variant="outline" className="bg-green-100 text-green-800 font-medium mr-2">
                        {promoCode}
                      </Badge>
                      <span>{discountPercent}% discount applied</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removePromoCode()}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <form className="flex gap-2" onSubmit={handleApplyPromoCode}>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value)}
                  placeholder="Enter promo code"
                  disabled={loading.promoCode}
                />
                <Button 
                  type="submit"
                  disabled={!promoInput || loading.promoCode}
                >
                  {loading.promoCode ? 'Applying...' : 'Apply'}
                </Button>
              </form>
            )}
          </div>
          
          {/* Price Summary */}
          <div className="pt-4 border-t mb-6">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            
            {discountPercent > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>Discount ({discountPercent}%):</span>
                <span className="font-medium">-{formatCurrency(subtotal * (discountPercent / 100))}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          
          {/* Status Message */}
          {statusMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
              {statusMessage}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('patient-info')}
              className="flex-1"
            >
              Edit Patient Info
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentStep('treatments')}
              className="flex-1"
            >
              Edit Treatments
            </Button>
            <Button
              onClick={handleSaveQuote}
              disabled={loading.saving}
              className="flex-1 flex items-center justify-center"
            >
              {loading.saving ? (
                <span className="flex items-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Complete Quote
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Dental Treatment Quote</h1>
        <p className="text-center text-gray-600 mb-8">Create your personalized dental treatment plan and quote</p>
        
        {/* Progress Steps */}
        {renderProgressSteps()}
        
        {/* Reset Button (if quote has items) */}
        {(treatments.length > 0 || patientInfo) && (
          <div className="flex justify-end mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => resetQuote()}
            >
              Reset Quote
            </Button>
          </div>
        )}
        
        {/* Current Step Content */}
        {currentStep === 'treatments' && renderTreatmentsStep()}
        {currentStep === 'patient-info' && <PatientInfoForm />}
        {currentStep === 'summary' && renderSummaryStep()}
      </div>
    </div>
  );
}