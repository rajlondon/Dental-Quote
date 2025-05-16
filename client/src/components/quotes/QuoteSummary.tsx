import React from 'react';
import { useQuoteStore } from '@/stores/quoteStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const QuoteSummary: React.FC = () => {
  const { treatments, patientInfo, subtotal, discountPercent, total, promoCode, resetQuote } = useQuoteStore();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Submit quote to server
  const submitQuote = async () => {
    if (!patientInfo) {
      toast({
        title: 'Missing patient information',
        description: 'Please fill in your information before submitting the quote',
        variant: 'destructive'
      });
      
      // Navigate back to patient info form
      navigate('/quote/patient-info');
      return;
    }

    if (treatments.length === 0) {
      toast({
        title: 'No treatments selected',
        description: 'Please select at least one treatment before submitting',
        variant: 'destructive'
      });
      
      // Navigate back to treatment selection
      navigate('/quote/treatments');
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would submit to an API endpoint
      // For demo purposes, simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success
      toast({
        title: 'Quote submitted successfully',
        description: 'We will contact you shortly with more information.',
        variant: 'default'
      });

      // Reset the quote store and navigate to confirmation
      resetQuote();
      navigate('/quote/confirmation');
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        title: 'Error submitting quote',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Quote Summary</CardTitle>
        <CardDescription>Review your selected treatments and information</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Patient Information */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Patient Information</h3>
          {patientInfo ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Name:</span> {patientInfo.firstName} {patientInfo.lastName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {patientInfo.email}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {patientInfo.phone}
              </div>
              <div>
                <span className="font-medium">Preferred Date:</span> {patientInfo.preferredDate}
              </div>
              {patientInfo.notes && (
                <div className="col-span-2">
                  <span className="font-medium">Notes:</span> {patientInfo.notes}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Please provide your information</p>
          )}
        </div>
        
        {/* Selected Treatments */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Selected Treatments</h3>
          {treatments.length > 0 ? (
            <div>
              <div className="border rounded-md divide-y">
                {treatments.map((treatment) => (
                  <div key={treatment.id} className="px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{treatment.name}</p>
                      <p className="text-sm text-muted-foreground">{treatment.description}</p>
                      <p className="text-xs">Quantity: {treatment.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p>{formatCurrency(treatment.price * treatment.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No treatments selected</p>
          )}
        </div>
        
        {/* Pricing Summary */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between items-center">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          {discountPercent > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Discount {promoCode && `(${promoCode})`}
              </span>
              <span>-{formatCurrency(subtotal * (discountPercent / 100))}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <div className="flex justify-between w-full">
          <Button 
            variant="outline" 
            onClick={() => navigate('/quote/patient-info')}
            disabled={isSubmitting}
          >
            Back
          </Button>
          
          <Button 
            onClick={submitQuote}
            disabled={isSubmitting || !patientInfo || treatments.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Quote'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuoteSummary;