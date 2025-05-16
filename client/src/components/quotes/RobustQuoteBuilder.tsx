import React, { useState, useCallback } from 'react';
import { useQuoteReducer } from '../../hooks/useQuoteReducer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Minus, X, Tag, Check } from 'lucide-react';

// Define our available treatments
const AVAILABLE_TREATMENTS = [
  { id: '1', name: 'Dental Cleaning', price: 100 },
  { id: '2', name: 'Teeth Whitening', price: 250 },
  { id: '3', name: 'Dental Filling', price: 150 },
  { id: '4', name: 'Root Canal', price: 800 },
  { id: '5', name: 'Dental Crown', price: 1200 },
  { id: '6', name: 'Dental Implant', price: 900 },
];

// Available promo codes for testing
const PROMO_CODES = {
  'SUMMER15': { discountPercentage: 15, description: '15% off your quote' },
  'DENTAL25': { discountPercentage: 25, description: '25% off your quote' },
  'NEWPATIENT': { discountPercentage: 10, description: '10% off for new patients' }
};

export function RobustQuoteBuilder() {
  // Initialize our reducer hook
  const {
    state,
    addTreatment,
    removeTreatment,
    updateQuantity,
    applyPromoCode,
    resetPromoCode
  } = useQuoteReducer();
  
  // Local component state
  const [promoInput, setPromoInput] = useState('');
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [quoteComplete, setQuoteComplete] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  
  const { toast } = useToast();
  
  // Format currency helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Calculate subtotal without discount
  const getSubtotal = useCallback(() => {
    return state.treatments.reduce((sum, t) => sum + (t.price * (t.quantity || 1)), 0);
  }, [state.treatments]);
  
  // Calculate discount amount
  const getDiscountAmount = useCallback(() => {
    const subtotal = getSubtotal();
    return subtotal * (state.discount / 100);
  }, [getSubtotal, state.discount]);
  
  // Handle adding treatment
  const handleAddTreatment = useCallback((treatment) => {
    // Check if treatment already exists in state
    const existingTreatment = state.treatments.find(t => t.id === treatment.id);
    
    if (existingTreatment) {
      // If it exists, increment quantity
      updateQuantity(
        treatment.id, 
        (existingTreatment.quantity || 1) + 1
      );
    } else {
      // Otherwise add it with quantity 1
      addTreatment({
        ...treatment,
        quantity: 1
      });
    }
  }, [state.treatments, addTreatment, updateQuantity]);
  
  // Handle applying promo code
  const handleApplyPromoCode = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    
    if (!promoInput.trim()) return;
    
    setIsPromoLoading(true);
    
    try {
      // For demo purposes, we'll use local validation
      // In production, you would call your API
      setTimeout(() => {
        const promoCode = promoInput.toUpperCase();
        const validPromo = PROMO_CODES[promoCode];
        
        if (validPromo) {
          applyPromoCode(promoCode, validPromo.discountPercentage);
          
          toast({
            title: 'Promo Code Applied',
            description: `${validPromo.description}`,
            variant: 'default'
          });
        } else {
          toast({
            title: 'Invalid Promo Code',
            description: 'The promo code you entered is not valid.',
            variant: 'destructive'
          });
        }
        
        setIsPromoLoading(false);
      }, 500); // Simulate API delay
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply promo code. Please try again.',
        variant: 'destructive'
      });
      setIsPromoLoading(false);
    }
    
    // Reset the input field
    setPromoInput('');
  }, [promoInput, toast, applyPromoCode]);
  
  // Handle removing promo code
  const handleRemovePromoCode = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default behavior
    
    resetPromoCode();
    
    toast({
      title: 'Promo Code Removed',
      description: 'The promo code has been removed from your quote.',
      variant: 'default'
    });
  }, [resetPromoCode, toast]);
  
  // Handle decreasing treatment quantity
  const handleDecreaseQuantity = useCallback((treatmentId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      // Remove treatment if quantity would go below 1
      removeTreatment(treatmentId);
    } else {
      // Otherwise decrease quantity
      updateQuantity(treatmentId, currentQuantity - 1);
    }
  }, [removeTreatment, updateQuantity]);
  
  // Handle saving quote
  const handleSaveQuote = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (state.treatments.length === 0) {
      toast({
        title: 'No Treatments Selected',
        description: 'Please select at least one treatment for your quote.',
        variant: 'destructive'
      });
      return;
    }
    
    setSaveLoading(true);
    
    try {
      // Prepare quote data
      const quoteData = {
        treatments: state.treatments,
        promoCode: state.promoCode,
        discount: state.discount,
        subtotal: getSubtotal(),
        total: state.total
      };
      
      // In production, this would be an API call
      setTimeout(() => {
        // Generate a mock quote ID
        const mockQuoteId = 'Q-' + Date.now().toString().slice(-6);
        setQuoteId(mockQuoteId);
        setQuoteComplete(true);
        
        toast({
          title: 'Quote Created',
          description: `Your quote #${mockQuoteId} has been created successfully.`,
          variant: 'default'
        });
        
        setSaveLoading(false);
      }, 1000); // Simulate API delay
    } catch (error) {
      console.error('Error saving quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your quote. Please try again.',
        variant: 'destructive'
      });
      setSaveLoading(false);
    }
  }, [state.treatments, state.promoCode, state.discount, state.total, getSubtotal, toast]);
  
  // Handle sending email
  const handleSendEmail = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address to send the quote.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!quoteId) {
      toast({
        title: 'No Quote Available',
        description: 'Please complete your quote first.',
        variant: 'destructive'
      });
      return;
    }
    
    setEmailSending(true);
    
    try {
      // In production, this would be an API call
      setTimeout(() => {
        toast({
          title: 'Email Sent',
          description: `Your quote has been sent to ${email}.`,
          variant: 'default'
        });
        
        setEmailSending(false);
        setEmail('');
      }, 1000); // Simulate API delay
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send the email. Please try again.',
        variant: 'destructive'
      });
      setEmailSending(false);
    }
  }, [email, quoteId, toast]);
  
  // Handle resetting the quote
  const handleResetQuote = useCallback(() => {
    // Reset all state
    state.treatments.forEach(t => removeTreatment(t.id));
    resetPromoCode();
    setQuoteId(null);
    setQuoteComplete(false);
    setEmail('');
    
    toast({
      title: 'Quote Reset',
      description: 'Your quote has been reset.',
      variant: 'default'
    });
  }, [state.treatments, removeTreatment, resetPromoCode, toast]);
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Robust Quote Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            This robust implementation uses a reducer pattern for reliable state management.
            All interactions, form submissions, and button clicks are handled carefully to prevent loss of state.
          </p>
          
          {/* Success message when quote is complete */}
          {quoteComplete && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <h3 className="text-green-800 font-medium flex items-center gap-2">
                <Check className="h-5 w-5" />
                Quote #{quoteId} Created Successfully
              </h3>
              <p className="text-green-700 mt-1">
                Your quote has been created and is ready for email delivery.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Treatment selection and promo codes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Available Treatments */}
          <Card>
            <CardHeader>
              <CardTitle>Available Treatments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AVAILABLE_TREATMENTS.map(treatment => (
                  <div 
                    key={treatment.id}
                    className="p-4 border rounded-md flex justify-between items-center hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium">{treatment.name}</h3>
                      <p className="text-gray-500">{formatCurrency(treatment.price)}</p>
                    </div>
                    <Button 
                      onClick={() => handleAddTreatment(treatment)}
                      type="button"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Promo Code Section */}
          <Card>
            <CardHeader>
              <CardTitle>Promo Code</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleApplyPromoCode} className="flex gap-2">
                <Input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1"
                  disabled={!!state.promoCode || isPromoLoading}
                />
                {!state.promoCode ? (
                  <Button 
                    type="submit"
                    disabled={!promoInput.trim() || isPromoLoading}
                  >
                    {isPromoLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      'Apply'
                    )}
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    variant="destructive"
                    onClick={handleRemovePromoCode}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </form>
              
              {state.promoCode && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">
                      {state.promoCode}
                    </Badge>
                    <span className="text-blue-700">
                      {state.discount}% discount applied
                    </span>
                  </div>
                </div>
              )}
              
              <div className="mt-2 text-xs text-gray-500">
                Try codes like SUMMER15, DENTAL25, or NEWPATIENT for different discounts
              </div>
            </CardContent>
          </Card>
          
          {/* Email Quote Section - Only shown when quote is complete */}
          {quoteComplete && (
            <Card>
              <CardHeader>
                <CardTitle>Email Your Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1"
                    disabled={emailSending}
                    required
                  />
                  <Button 
                    type="submit"
                    disabled={!email.trim() || emailSending}
                  >
                    {emailSending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Quote'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right column - Quote summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {state.treatments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No treatments selected yet</p>
                  <p className="text-sm mt-1">Add treatments to build your quote</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected Treatments */}
                  <div>
                    <h3 className="font-medium mb-2 text-gray-700">Selected Treatments</h3>
                    <ul className="space-y-2">
                      {state.treatments.map(treatment => (
                        <li key={treatment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <span>{treatment.name}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => handleDecreaseQuantity(treatment.id, treatment.quantity || 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{treatment.quantity || 1}</span>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(treatment.id, (treatment.quantity || 1) + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <span className="w-20 text-right font-medium">
                              {formatCurrency(treatment.price * (treatment.quantity || 1))}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Calculation Summary */}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(getSubtotal())}</span>
                    </div>
                    
                    {state.discount > 0 && (
                      <div className="flex justify-between mb-2 text-green-600">
                        <span>Discount ({state.discount}%):</span>
                        <span className="font-medium">-{formatCurrency(getDiscountAmount())}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatCurrency(state.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              {!quoteComplete ? (
                <Button 
                  type="button"
                  className="w-full"
                  size="lg"
                  disabled={state.treatments.length === 0 || saveLoading}
                  onClick={handleSaveQuote}
                >
                  {saveLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving Quote...
                    </>
                  ) : (
                    'Complete Quote'
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResetQuote}
                >
                  Start New Quote
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}