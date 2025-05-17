import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useRobustQuoteStore } from '../stores/robustQuoteStore';
import { Switch, Route } from 'wouter';

export default function RobustQuoteBuilderPage() {
  const { toast } = useToast();
  
  // Get everything we need from the store
  const { 
    currentStep, 
    selectedTreatments,
    promoCode,
    discount,
    patientInfo,
    isLoading,
    error,
    
    setStep,
    addTreatment,
    removeTreatment,
    applyPromoCode,
    updatePatientInfo,
    resetQuote,
    recoverFromBackup
  } = useRobustQuoteStore();
  
  // Local state for form inputs
  const [promoInput, setPromoInput] = useState('');
  const [treatmentName, setTreatmentName] = useState('');
  const [treatmentPrice, setTreatmentPrice] = useState('');
  
  // Try to recover on initial load if needed
  useEffect(() => {
    // If we're on a step other than quiz but have no treatments, try to recover
    if (selectedTreatments.length === 0 && currentStep !== 'quiz') {
      const recovered = recoverFromBackup();
      if (!recovered) {
        // If recovery failed, reset to quiz step
        setStep('quiz');
      }
    }
  }, []);
  
  // Sample treatments for demonstration
  const availableTreatments = [
    { id: 'dental-checkup', name: 'Dental Check-up & Cleaning', price: 42, category: 'general' },
    { id: 'teeth-whitening', name: 'Zoom Whitening Treatment', price: 140, category: 'whitening' },
    { id: 'dental-implant', name: 'Dental Implant (Standard)', price: 306, category: 'implants' },
    { id: 'dental-crown', name: 'Dental Crown (Porcelain)', price: 215, category: 'crowns' },
    { id: 'root-canal', name: 'Root Canal Treatment', price: 185, category: 'endodontics' },
    { id: 'extraction', name: 'Tooth Extraction', price: 75, category: 'extractions' },
    { id: 'veneers', name: 'Porcelain Veneers (per tooth)', price: 190, category: 'cosmetic' },
    { id: 'braces', name: 'Orthodontic Braces (Full)', price: 1950, category: 'orthodontics' }
  ];
  
  // Calculate totals
  const calculateSubtotal = () => {
    return selectedTreatments.reduce((sum, t) => sum + t.price, 0);
  };
  
  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (discount / 100);
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };
  
  // Anti-form-submission handlers
  const handleAddTreatment = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (treatmentName && treatmentPrice) {
      const newTreatment = {
        id: `custom-${Date.now()}`,
        name: treatmentName,
        price: parseFloat(treatmentPrice),
        category: 'custom'
      };
      addTreatment(newTreatment);
      setTreatmentName('');
      setTreatmentPrice('');
    }
  };
  
  const handleSelectTreatment = (treatment, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    addTreatment({
      ...treatment,
      id: `${treatment.id}-${Date.now()}`  // Ensure unique ID
    });
  };
  
  const handleRemoveTreatment = (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    removeTreatment(id);
  };
  
  const handleApplyPromoCode = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!promoInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive"
      });
      return;
    }
    
    const result = await applyPromoCode(promoInput.trim().toUpperCase());
    
    if (result.success) {
      toast({
        title: "Success",
        description: "Promo code applied successfully",
      });
      setPromoInput('');
    } else {
      toast({
        title: "Error",
        description: result.message || "Invalid promo code",
        variant: "destructive"
      });
    }
  };
  
  const handleContinueWithoutPromo = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setStep('patient-info');
  };
  
  const handlePatientInfoChange = (field, value) => {
    updatePatientInfo({ [field]: value });
  };
  
  const handlePatientInfoSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Validate required fields
    if (!patientInfo.firstName || !patientInfo.email || !patientInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setStep('review');
  };
  
  const handleSubmitQuote = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // In a real application, we would send the data to the server
    // For this demo, we'll just show a success message
    toast({
      title: "Quote Submitted",
      description: "Your quote has been submitted successfully!",
    });
    
    // Reset quote for new quote creation
    resetQuote();
    setStep('quiz');
  };
  
  // Step navigation components
  const StepIndicator = () => (
    <div className="flex items-center justify-between max-w-3xl mx-auto mb-8 px-4">
      <div className={`flex flex-col items-center ${currentStep === 'quiz' ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'quiz' ? 'border-primary bg-primary text-white' : 'border-muted'}`}>
          1
        </div>
        <span className="text-sm mt-1">Treatments</span>
      </div>
      
      <div className="flex-1 h-0.5 bg-muted mx-1" />
      
      <div className={`flex flex-col items-center ${currentStep === 'promo' ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'promo' ? 'border-primary bg-primary text-white' : 'border-muted'}`}>
          2
        </div>
        <span className="text-sm mt-1">Promo</span>
      </div>
      
      <div className="flex-1 h-0.5 bg-muted mx-1" />
      
      <div className={`flex flex-col items-center ${currentStep === 'patient-info' ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'patient-info' ? 'border-primary bg-primary text-white' : 'border-muted'}`}>
          3
        </div>
        <span className="text-sm mt-1">Information</span>
      </div>
      
      <div className="flex-1 h-0.5 bg-muted mx-1" />
      
      <div className={`flex flex-col items-center ${currentStep === 'review' ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'review' ? 'border-primary bg-primary text-white' : 'border-muted'}`}>
          4
        </div>
        <span className="text-sm mt-1">Review</span>
      </div>
    </div>
  );
  
  // Content for each step
  const QuizStepContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Your Treatments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Available Treatments</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableTreatments.map(treatment => (
                  <div 
                    key={treatment.id}
                    className="border rounded-md p-3 hover:bg-accent cursor-pointer"
                    onClick={(e) => handleSelectTreatment(treatment, e)}
                  >
                    <div className="font-medium">{treatment.name}</div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">{treatment.category}</span>
                      <span className="font-semibold">£{treatment.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-3">Add Custom Treatment</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Treatment name"
                  value={treatmentName}
                  onChange={(e) => setTreatmentName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Price (£)"
                  value={treatmentPrice}
                  onChange={(e) => setTreatmentPrice(e.target.value)}
                  className="w-full sm:w-32"
                />
                <Button 
                  onClick={handleAddTreatment}
                  disabled={!treatmentName || !treatmentPrice}
                >
                  Add
                </Button>
              </div>
            </div>
            
            {selectedTreatments.length > 0 && (
              <div className="mt-8 flex justify-end">
                <Button 
                  size="lg"
                  onClick={(e) => {
                    e.preventDefault();
                    setStep('promo');
                  }}
                >
                  Continue to Promo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Your Selections</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTreatments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No treatments selected yet</p>
                <p className="text-sm mt-2">Select treatments from the list</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedTreatments.map(treatment => (
                  <div key={treatment.id} className="flex justify-between items-center">
                    <div>
                      <div>{treatment.name}</div>
                      <div className="text-sm text-muted-foreground">£{treatment.price}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => handleRemoveTreatment(treatment.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-medium">
                    <span>Subtotal</span>
                    <span>£{calculateSubtotal()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
  
  const PromoStepContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Apply Promotional Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Enter Promo Code</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="e.g., SUMMER15"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleApplyPromoCode}
                    disabled={isLoading || !promoInput.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      'Apply Code'
                    )}
                  </Button>
                </div>
                
                {error && (
                  <div className="flex items-center mt-3 text-destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    {error}
                  </div>
                )}
                
                {promoCode && (
                  <div className="flex items-center mt-3 text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Promo code <span className="font-medium mx-1">{promoCode}</span> applied for {discount}% discount
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-lg font-medium mb-3">Available Promo Codes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="border rounded-md p-3">
                    <div className="font-medium">SUMMER15</div>
                    <div className="text-muted-foreground">15% off all treatments</div>
                  </div>
                  <div className="border rounded-md p-3">
                    <div className="font-medium">DENTAL25</div>
                    <div className="text-muted-foreground">25% off dental services</div>
                  </div>
                  <div className="border rounded-md p-3">
                    <div className="font-medium">NEWPATIENT</div>
                    <div className="text-muted-foreground">20% off for new patients</div>
                  </div>
                  <div className="border rounded-md p-3">
                    <div className="font-medium">TEST10</div>
                    <div className="text-muted-foreground">10% off for testing</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <Button 
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  setStep('quiz');
                }}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleContinueWithoutPromo}>
                Continue Without Promo <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Quote Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedTreatments.map(treatment => (
                <div key={treatment.id} className="flex justify-between">
                  <span>{treatment.name}</span>
                  <span>£{treatment.price}</span>
                </div>
              ))}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>£{calculateSubtotal()}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>-£{calculateDiscount()}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-medium text-lg pt-2">
                  <span>Total</span>
                  <span>£{calculateTotal()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  
  const PatientInfoStepContent = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name*</label>
              <Input
                id="firstName"
                value={patientInfo.firstName || ''}
                onChange={(e) => handlePatientInfoChange('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
              <Input
                id="lastName"
                value={patientInfo.lastName || ''}
                onChange={(e) => handlePatientInfoChange('lastName', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address*</label>
            <Input
              id="email"
              type="email"
              value={patientInfo.email || ''}
              onChange={(e) => handlePatientInfoChange('email', e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number*</label>
            <Input
              id="phone"
              value={patientInfo.phone || ''}
              onChange={(e) => handlePatientInfoChange('phone', e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="preferredDate" className="block text-sm font-medium mb-1">Preferred Date</label>
            <Input
              id="preferredDate"
              type="date"
              value={patientInfo.preferredDate || ''}
              onChange={(e) => handlePatientInfoChange('preferredDate', e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">Additional Notes</label>
            <textarea
              id="notes"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={patientInfo.notes || ''}
              onChange={(e) => handlePatientInfoChange('notes', e.target.value)}
            />
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                setStep('promo');
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={handlePatientInfoSubmit}>
              Review Quote <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
  
  const ReviewStepContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Treatment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Selected Treatments</h3>
              <div className="space-y-2">
                {selectedTreatments.map(treatment => (
                  <div key={treatment.id} className="flex justify-between">
                    <span>{treatment.name}</span>
                    <span>£{treatment.price}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>£{calculateSubtotal()}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({discount}%)</span>
                  <span>-£{calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-medium text-lg pt-2">
                <span>Total</span>
                <span>£{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            {promoCode && (
              <div className="bg-green-50 border border-green-100 rounded-md p-3 mt-3">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Promo code <span className="font-medium mx-1">{promoCode}</span> applied
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Patient Details</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm text-muted-foreground">First Name</div>
                    <div>{patientInfo.firstName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Last Name</div>
                    <div>{patientInfo.lastName}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div>{patientInfo.email}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div>{patientInfo.phone}</div>
                </div>
                {patientInfo.preferredDate && (
                  <div>
                    <div className="text-sm text-muted-foreground">Preferred Date</div>
                    <div>{patientInfo.preferredDate}</div>
                  </div>
                )}
                {patientInfo.notes && (
                  <div>
                    <div className="text-sm text-muted-foreground">Additional Notes</div>
                    <div className="text-sm">{patientInfo.notes}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-3">Next Steps</h3>
              <p className="text-muted-foreground mb-4">
                After submitting your quote, our team will review your treatment plan and contact you to schedule an appointment.
              </p>
              
              <div className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    setStep('patient-info');
                  }}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleSubmitQuote}>
                  Submit Quote
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  // Render the component
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Dental Treatment Quote</h1>
        
        <StepIndicator />
        
        <div className="mb-8">
          {currentStep === 'quiz' && <QuizStepContent />}
          {currentStep === 'promo' && <PromoStepContent />}
          {currentStep === 'patient-info' && <PatientInfoStepContent />}
          {currentStep === 'review' && <ReviewStepContent />}
        </div>
      </div>
    </Layout>
  );
}