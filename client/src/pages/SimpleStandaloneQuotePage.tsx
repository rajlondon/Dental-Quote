import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuoteStore } from '@/stores/quoteStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { FileText, CheckCircle, RefreshCw, Tag } from 'lucide-react';

const SimpleStandaloneQuotePage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const quoteStore = useQuoteStore();
  const [step, setStep] = React.useState<'patient-info' | 'treatments' | 'review' | 'complete'>('patient-info');
  const [loading, setLoading] = React.useState(false);
  const [submittingQuote, setSubmittingQuote] = React.useState(false);
  const [promoCodeInput, setPromoCodeInput] = React.useState('');
  const [validatingPromo, setValidatingPromo] = React.useState(false);

  // Clear the store when the component mounts
  React.useEffect(() => {
    // Only reset if the store is empty
    if (!quoteStore.patientInfo || quoteStore.treatments.length === 0) {
      quoteStore.reset();
    }
  }, []);

  // Patient info update handler
  const handlePatientInfoUpdate = (field: string, value: string) => {
    quoteStore.updatePatientInfo({
      ...quoteStore.patientInfo,
      [field]: value
    });
  };

  // Add treatment to quote
  const handleAddTreatment = (treatmentName: string, price: number) => {
    quoteStore.addTreatment({
      id: Date.now().toString(),
      name: treatmentName,
      price: price,
      quantity: 1
    });
  };

  // Remove treatment from quote
  const handleRemoveTreatment = (id: string) => {
    quoteStore.removeTreatment(id);
  };

  // Update treatment quantity
  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity > 0) {
      quoteStore.updateTreatmentQuantity(id, quantity);
    }
  };

  // Apply promo code
  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive"
      });
      return;
    }
    
    setValidatingPromo(true);
    
    try {
      const response = await apiRequest('POST', '/api/promo-codes/validate', {
        code: promoCodeInput.trim()
      });
      
      const data = await response.json();
      
      if (data.valid) {
        toast({
          title: "Success",
          description: `Applied ${data.discount}% discount with code ${promoCodeInput}`,
          variant: "default"
        });
        
        quoteStore.setPromoCode(promoCodeInput);
        quoteStore.setDiscountPercent(data.discount);
      } else {
        toast({
          title: "Invalid Code",
          description: data.message || "The promo code you entered is invalid",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error validating promo code:", error);
      toast({
        title: "Error",
        description: "There was a problem validating your promo code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setValidatingPromo(false);
    }
  };

  // Calculate totals
  const subtotal = quoteStore.treatments.reduce((sum, treatment) => sum + (treatment.price * treatment.quantity), 0);
  const discount = quoteStore.discountPercent > 0 ? (subtotal * (quoteStore.discountPercent / 100)) : 0;
  const total = subtotal - discount;

  // Submit quote
  const handleSubmitQuote = async () => {
    // Validation
    if (!quoteStore.patientInfo?.firstName || !quoteStore.patientInfo?.lastName || !quoteStore.patientInfo?.email) {
      toast({
        title: "Missing Information",
        description: "Please provide all required patient information",
        variant: "destructive"
      });
      setStep('patient-info');
      return;
    }

    if (quoteStore.treatments.length === 0) {
      toast({
        title: "No Treatments Selected",
        description: "Please add at least one treatment to your quote",
        variant: "destructive"
      });
      setStep('treatments');
      return;
    }

    setSubmittingQuote(true);

    try {
      const response = await apiRequest('POST', '/api/quotes', {
        patientInfo: quoteStore.patientInfo,
        treatments: quoteStore.treatments,
        promoCode: quoteStore.promoCode,
        discountPercent: quoteStore.discountPercent,
        subtotal,
        discount,
        total
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Quote Created",
          description: "Your quote has been successfully created!",
          variant: "default"
        });
        
        // Set the quote ID in the store
        quoteStore.setQuoteId(data.id);
        
        // Move to completion step
        setStep('complete');
        
        // Reset store after 2 seconds
        setTimeout(() => {
          quoteStore.reset();
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to create quote");
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your quote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingQuote(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 'patient-info':
        return (
          <div className="space-y-4">
            <p className="text-gray-500 mb-4">Please provide your contact information so we can prepare your quote.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  id="firstName"
                  placeholder="Enter your first name"
                  value={quoteStore.patientInfo?.firstName || ''}
                  onChange={(e) => handlePatientInfoUpdate('firstName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  id="lastName"
                  placeholder="Enter your last name"
                  value={quoteStore.patientInfo?.lastName || ''}
                  onChange={(e) => handlePatientInfoUpdate('lastName', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input 
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={quoteStore.patientInfo?.email || ''}
                onChange={(e) => handlePatientInfoUpdate('email', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                placeholder="Enter your phone number"
                value={quoteStore.patientInfo?.phone || ''}
                onChange={(e) => handlePatientInfoUpdate('phone', e.target.value)}
              />
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button 
                onClick={() => setStep('treatments')}
                disabled={!quoteStore.patientInfo?.firstName || !quoteStore.patientInfo?.lastName || !quoteStore.patientInfo?.email}
              >
                Continue to Treatments
              </Button>
            </div>
          </div>
        );
      
      case 'treatments':
        return (
          <div className="space-y-6">
            <p className="text-gray-500 mb-4">Choose the dental treatments you're interested in.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sample treatments - in a real app, these would come from an API */}
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleAddTreatment('Dental Implant', 599)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Dental Implant</h3>
                      <p className="text-sm text-gray-500">Single tooth replacement</p>
                    </div>
                    <p className="font-bold">£599</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleAddTreatment('Porcelain Crown', 299)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Porcelain Crown</h3>
                      <p className="text-sm text-gray-500">Natural looking restoration</p>
                    </div>
                    <p className="font-bold">£299</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleAddTreatment('Teeth Whitening', 199)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Teeth Whitening</h3>
                      <p className="text-sm text-gray-500">Professional whitening treatment</p>
                    </div>
                    <p className="font-bold">£199</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleAddTreatment('Porcelain Veneer', 349)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Porcelain Veneer</h3>
                      <p className="text-sm text-gray-500">Enhance your smile</p>
                    </div>
                    <p className="font-bold">£349</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleAddTreatment('Root Canal', 399)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Root Canal</h3>
                      <p className="text-sm text-gray-500">Save your natural tooth</p>
                    </div>
                    <p className="font-bold">£399</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleAddTreatment('Dental Cleaning', 89)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Dental Cleaning</h3>
                      <p className="text-sm text-gray-500">Professional cleaning & check-up</p>
                    </div>
                    <p className="font-bold">£89</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {quoteStore.treatments.length > 0 && (
              <div className="mt-6 border rounded-lg p-4">
                <h3 className="font-medium mb-3">Selected Treatments</h3>
                
                <div className="space-y-3">
                  {quoteStore.treatments.map(treatment => (
                    <div key={treatment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <h4 className="font-medium">{treatment.name}</h4>
                        <p className="text-sm text-gray-500">£{treatment.price} each</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateQuantity(treatment.id, treatment.quantity - 1)}
                          disabled={treatment.quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{treatment.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateQuantity(treatment.id, treatment.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveTreatment(treatment.id)}
                          className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <p className="text-lg font-medium">Subtotal: £{subtotal.toFixed(2)}</p>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep('patient-info')}>Back</Button>
                  <Button onClick={() => setStep('review')} disabled={quoteStore.treatments.length === 0}>Continue to Review</Button>
                </div>
              </div>
            )}
            
            {quoteStore.treatments.length === 0 && (
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep('patient-info')}>Back</Button>
                <Button disabled>Continue to Review</Button>
              </div>
            )}
          </div>
        );
      
      case 'review':
        return (
          <div className="space-y-6">
            <p className="text-gray-500 mb-4">Review your quote details before submission.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-3">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p>{quoteStore.patientInfo?.firstName} {quoteStore.patientInfo?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{quoteStore.patientInfo?.email}</p>
                </div>
                {quoteStore.patientInfo?.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{quoteStore.patientInfo.phone}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-3">Selected Treatments</h3>
              
              <div className="space-y-3">
                {quoteStore.treatments.map(treatment => (
                  <div key={treatment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <h4 className="font-medium">{treatment.name}</h4>
                    </div>
                    <div className="text-right">
                      <p>£{treatment.price} × {treatment.quantity}</p>
                      <p className="font-medium">£{(treatment.price * treatment.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-3">Promo Code</h3>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter promo code"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  disabled={quoteStore.promoCode !== ''}
                />
                {quoteStore.promoCode ? (
                  <Button variant="outline" className="shrink-0" onClick={() => {
                    quoteStore.setPromoCode('');
                    quoteStore.setDiscountPercent(0);
                    setPromoCodeInput('');
                  }}>
                    Remove
                  </Button>
                ) : (
                  <Button 
                    className="shrink-0" 
                    onClick={handleApplyPromoCode}
                    disabled={validatingPromo || !promoCodeInput.trim()}
                  >
                    {validatingPromo ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Tag className="h-4 w-4 mr-2" />}
                    Apply
                  </Button>
                )}
              </div>
              
              {quoteStore.promoCode && (
                <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-md flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>
                    <strong>{quoteStore.promoCode}</strong> applied: {quoteStore.discountPercent}% discount
                  </span>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Discount ({quoteStore.discountPercent}%):</span>
                  <span>-£{discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep('treatments')}>Back</Button>
              <Button 
                onClick={handleSubmitQuote}
                disabled={submittingQuote}
              >
                {submittingQuote ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                Submit Quote
              </Button>
            </div>
          </div>
        );
      
      case 'complete':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Quote Created!</h2>
            <p className="text-gray-500 mb-6">Your dental quote has been successfully created.</p>
            <p className="font-medium mb-4">Quote ID: {quoteStore.quoteId}</p>
            <p className="text-sm text-gray-500 mb-6">
              A copy of your quote has been sent to {quoteStore.patientInfo?.email}.<br />
              You'll also be contacted by one of our specialists soon.
            </p>
            <Button onClick={() => {
              quoteStore.reset();
              setStep('patient-info');
            }}>
              Create Another Quote
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Dental Treatment Quote Builder</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between">
                <div className={`text-center flex-1 ${step === 'patient-info' ? 'text-primary font-medium' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step === 'patient-info' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                    1
                  </div>
                  <span className="text-sm">Patient Info</span>
                </div>
                <div className={`text-center flex-1 ${step === 'treatments' ? 'text-primary font-medium' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step === 'treatments' ? 'bg-primary text-white' : step === 'review' || step === 'complete' ? 'bg-gray-300' : 'bg-gray-100'}`}>
                    2
                  </div>
                  <span className="text-sm">Treatments</span>
                </div>
                <div className={`text-center flex-1 ${step === 'review' ? 'text-primary font-medium' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step === 'review' ? 'bg-primary text-white' : step === 'complete' ? 'bg-gray-300' : 'bg-gray-100'}`}>
                    3
                  </div>
                  <span className="text-sm">Review</span>
                </div>
                <div className={`text-center flex-1 ${step === 'complete' ? 'text-primary font-medium' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step === 'complete' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                    4
                  </div>
                  <span className="text-sm">Complete</span>
                </div>
              </div>
              <div className="relative h-1 bg-gray-200 mt-4">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                  style={{ 
                    width: step === 'patient-info' ? '25%' : 
                           step === 'treatments' ? '50%' : 
                           step === 'review' ? '75%' : '100%' 
                  }}
                ></div>
              </div>
            </div>
            
            {/* Step Content */}
            {renderStepContent()}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default SimpleStandaloneQuotePage;