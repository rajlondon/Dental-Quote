import React, { useState } from 'react';
import { useQuoteStore } from '@/stores/quoteStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Trash2, Minus, Plus, ArrowRight, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Simple version of the enhanced quote builder for direct integration
export const SimplePatientQuoteBuilder: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const quoteStore = useQuoteStore();
  
  // Format currency amount consistently
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Add a treatment to the quote
  const handleAddTreatment = (treatment: string, price: number) => {
    const newTreatment = {
      id: Date.now().toString(),
      name: treatment,
      price: price,
      quantity: 1
    };
    quoteStore.addTreatment(newTreatment);
  };

  // Remove a treatment from the quote
  const handleRemoveTreatment = (id: string) => {
    quoteStore.removeTreatment(id);
  };

  // Change quantity of a treatment
  const handleUpdateQuantity = (id: string, quantity: number) => {
    // Find the treatment
    const treatment = quoteStore.treatments.find(t => t.id === id);
    if (treatment) {
      // Create an updated treatment with new quantity
      const updatedTreatment = {...treatment, quantity};
      // Remove old treatment and add updated one
      quoteStore.removeTreatment(id);
      quoteStore.addTreatment(updatedTreatment);
    }
  };

  // Apply a promo code to the quote
  const handleApplyPromoCode = (code: string) => {
    quoteStore.applyPromoCode(code);
  };

  // Get the subtotal of all treatments
  const getSubtotal = () => {
    return quoteStore.treatments.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  };

  // Get the discount amount based on applied promo code
  const getDiscountAmount = () => {
    const subtotal = getSubtotal();
    if (quoteStore.promoCode && quoteStore.discountPercent > 0) {
      return subtotal * (quoteStore.discountPercent / 100);
    }
    return 0;
  };

  // Get the total after discount
  const getTotal = () => {
    return getSubtotal() - getDiscountAmount();
  };

  // Sample treatments for demonstration
  const sampleTreatments = [
    { name: 'Dental Implant', price: 650 },
    { name: 'Porcelain Crown', price: 190 },
    { name: 'Root Canal', price: 110 },
    { name: 'Professional Cleaning', price: 45 },
    { name: 'Teeth Whitening', price: 220 }
  ];

  // Render the treatment selection step
  const renderTreatmentSelection = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Select Your Treatments</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleTreatments.map((treatment, index) => (
            <Card key={index} className="shadow-sm">
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <p className="font-medium">{treatment.name}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(treatment.price)}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddTreatment(treatment.name, treatment.price)}
                >
                  Add
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {quoteStore.treatments.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-medium mb-4">Your Selected Treatments</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              {quoteStore.treatments.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      disabled={item.quantity <= 1}
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveTreatment(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Promo code section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                  <input 
                    type="text" 
                    className="px-3 py-1.5 border border-gray-300 rounded-md"
                    placeholder="Enter promo code"
                    value={quoteStore.promoCode || ''}
                    onChange={(e) => quoteStore.setPromoCode(e.target.value)}
                  />
                  <Button 
                    variant="secondary"
                    size="sm" 
                    onClick={() => handleApplyPromoCode(quoteStore.promoCode || '')}
                  >
                    Apply
                  </Button>
                  
                  {quoteStore.promoCodeStatus === 'valid' && (
                    <Badge className="bg-green-100 text-green-800 ml-2">
                      <Check className="h-3 w-3 mr-1" /> {quoteStore.discountPercentage}% discount applied
                    </Badge>
                  )}
                  
                  {quoteStore.promoCodeStatus === 'invalid' && (
                    <Badge className="bg-red-100 text-red-800 ml-2">
                      Invalid promo code
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Summary section */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                </div>
                
                {getDiscountAmount() > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({quoteStore.discountPercentage}%):</span>
                    <span>-{formatCurrency(getDiscountAmount())}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
              </div>
              
              {/* Next step button */}
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setCurrentStep(2)}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the patient information step
  const renderPatientInformation = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentStep(1)}
            className="mr-2"
          >
            Back
          </Button>
          <h3 className="text-lg font-medium">Enter Your Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              value={quoteStore.patientInfo.firstName || ''}
              onChange={(e) => quoteStore.updatePatientInfo({ firstName: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={quoteStore.patientInfo.lastName || ''}
              onChange={(e) => quoteStore.updatePatientInfo({ lastName: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={quoteStore.patientInfo.email || ''}
              onChange={(e) => quoteStore.updatePatientInfo({ email: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input 
              type="tel" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={quoteStore.patientInfo.phoneNumber || ''}
              onChange={(e) => quoteStore.updatePatientInfo({ phoneNumber: e.target.value })}
            />
          </div>
        </div>
        
        <div className="mt-8 flex space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(1)}
          >
            Back
          </Button>
          
          <Button 
            onClick={() => setCurrentStep(3)}
            disabled={!quoteStore.patientInfo.firstName || !quoteStore.patientInfo.email}
          >
            View Quote Summary <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Render the quote summary step
  const renderQuoteSummary = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentStep(2)}
            className="mr-2"
          >
            Back
          </Button>
          <h3 className="text-lg font-medium">Your Quote Summary</h3>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between mb-4">
            <div>
              <h4 className="font-bold text-lg">Patient Information</h4>
              <p>{quoteStore.patientInfo.firstName} {quoteStore.patientInfo.lastName}</p>
              <p>{quoteStore.patientInfo.email}</p>
              <p>{quoteStore.patientInfo.phoneNumber}</p>
            </div>
            <div className="text-right">
              <h4 className="font-bold text-lg">Quote Details</h4>
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Quote ID: QT-{Math.floor(Math.random() * 10000)}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-bold mb-3">Selected Treatments</h4>
            <div className="border-t border-b border-gray-200">
              {quoteStore.treatments.map((item, index) => (
                <div key={index} className="flex justify-between py-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p>{formatCurrency(item.price * item.quantity)}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(getSubtotal())}</span>
              </div>
              
              {getDiscountAmount() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({quoteStore.discountPercentage}%):</span>
                  <span>-{formatCurrency(getDiscountAmount())}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Edit Treatments
            </Button>
            
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              Edit Information
            </Button>
            
            <Button className="ml-auto">
              <FileText className="mr-2 h-4 w-4" /> Save Quote
            </Button>
            
            <Button variant="secondary">
              Print Quote
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          <div className={`flex-1 text-center ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center mx-auto mb-2 ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm">Select Treatments</span>
          </div>
          
          <div className={`flex-1 text-center ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center mx-auto mb-2 ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm">Patient Information</span>
          </div>
          
          <div className={`flex-1 text-center ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center mx-auto mb-2 ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="text-sm">Quote Summary</span>
          </div>
        </div>
        
        <div className="relative mt-2">
          <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full"></div>
          <div className={`absolute top-0 left-0 h-1 bg-primary transition-all`} style={{ width: `${(currentStep - 1) * 50}%` }}></div>
        </div>
      </div>
      
      {/* Step content */}
      {currentStep === 1 && renderTreatmentSelection()}
      {currentStep === 2 && renderPatientInformation()}
      {currentStep === 3 && renderQuoteSummary()}
    </div>
  );
};