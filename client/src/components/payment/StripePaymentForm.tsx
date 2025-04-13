import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StripePaymentFormProps {
  amount: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ 
  amount, 
  onPaymentSuccess,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast({
        title: "Payment Error",
        description: "Stripe has not loaded yet. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirmation`,
        },
      });
      
      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An unknown error occurred.",
          variant: "destructive",
        });
        setIsLoading(false);
      } else {
        // Payment succeeded, but we'll be redirected
        onPaymentSuccess();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred during payment processing.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="flex flex-col gap-3">
        <Button 
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
        >
          {isLoading ? 'Processing...' : `Pay £${amount} Deposit Securely`}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
        
        <div className="flex justify-center">
          <div className="flex items-center text-xs text-gray-500">
            <Shield className="h-3 w-3 mr-1" />
            <span>Secure payment processing</span>
          </div>
        </div>
        
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          disabled={isLoading}
          className="text-sm"
        >
          Cancel payment
        </Button>
      </div>
    </form>
  );
};

export default StripePaymentForm;