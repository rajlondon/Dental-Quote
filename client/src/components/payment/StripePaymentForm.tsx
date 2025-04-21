import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Check, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StripePaymentFormProps {
  paymentType: 'deposit' | 'treatment' | 'other';
  amount: number;
  onSuccess?: () => void;
}

export default function StripePaymentForm({ 
  paymentType, 
  amount,
  onSuccess 
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the payment intent client secret from the URL query params
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    // If we have a client secret in the URL, it means we were redirected after a payment
    if (!clientSecret) {
      return;
    }

    // Check the status of the payment intent
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment successful!');
          setIsComplete(true);
          onSuccess?.();
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe, onSuccess]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded
      return;
    }

    setIsLoading(true);

    // Confirm the payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: window.location.href,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An unexpected error occurred.");
      toast({
        title: "Payment failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } else {
      setMessage("An unexpected error occurred.");
      toast({
        title: "Payment failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const getPaymentTypeText = () => {
    switch (paymentType) {
      case 'deposit':
        return 'deposit payment';
      case 'treatment':
        return 'treatment payment';
      default:
        return 'payment';
    }
  };

  if (isComplete) {
    return (
      <div className="text-center p-6">
        <div className="mx-auto bg-green-100 text-green-700 rounded-full w-12 h-12 flex items-center justify-center mb-4">
          <Check className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-medium mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-6">
          Thank you for your {getPaymentTypeText()}. We've received your payment.
        </p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Continue
        </Button>
      </div>
    );
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">Secure Payment</h3>
        <p className="text-muted-foreground mb-4">
          {paymentType === 'deposit' 
            ? `Pay your £${amount.toFixed(2)} deposit to secure your booking.` 
            : `Make a payment of £${amount.toFixed(2)}.`}
        </p>
        
        <PaymentElement id="payment-element" />
      </div>

      {message && (
        <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md">
          {message}
        </div>
      )}

      <Button
        disabled={isLoading || !stripe || !elements}
        type="submit"
        className="w-full"
      >
        {isLoading ? (
          <span className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
          </span>
        ) : (
          <span className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" /> Pay £{amount.toFixed(2)}
          </span>
        )}
      </Button>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>Secure payment processed by Stripe</p>
        <p>Your payment information is encrypted and secure.</p>
      </div>
    </form>
  );
}