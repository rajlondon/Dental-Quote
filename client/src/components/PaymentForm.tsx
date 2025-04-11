import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Define the prop types for the component
export interface PaymentFormProps {
  email: string;
  onSuccess?: () => void;
}

// Styling for the Stripe card element
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: 'Arial, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
};

// The actual payment form component wrapped with Stripe context
const PaymentFormContent: React.FC<PaymentFormProps> = ({ email, onSuccess }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get a payment intent from the server when the component mounts
  useEffect(() => {
    const getPaymentIntent = async () => {
      try {
        setIsProcessing(true);
        const response = await fetch('/api/create-deposit-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        const data = await response.json();

        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.message || 'Failed to create payment intent');
          toast({
            title: t('payment.error', 'Error'),
            description: data.message || t('payment.failed_intent', 'Failed to create payment intent'),
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('Payment intent error:', err);
        setError(t('payment.failed_intent', 'Failed to create payment intent'));
        toast({
          title: t('payment.error', 'Error'),
          description: t('payment.failed_intent', 'Failed to create payment intent'),
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    };

    getPaymentIntent();
  }, [email, t, toast]);

  // Handle form submission and payment confirmation
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm the payment with Stripe
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email,
          },
        },
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
        toast({
          title: t('payment.failed', 'Payment Failed'),
          description: paymentError.message || t('payment.generic_error', 'An error occurred during payment processing'),
          variant: 'destructive',
        });
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Payment successful
        toast({
          title: t('payment.success', 'Payment Successful'),
          description: t('payment.deposit_confirmed', 'Your £200 deposit has been confirmed'),
        });

        // Call the success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(t('payment.processing_error', 'Error processing payment'));
      toast({
        title: t('payment.error', 'Error'),
        description: t('payment.processing_error', 'Error processing payment'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p>{t('payment.loading', 'Preparing payment form...')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="card-element" className="block text-sm font-medium">
            {t('payment.card_details', 'Card Details')}
          </label>
          <div className="border rounded-md p-3">
            <CardElement id="card-element" options={cardElementOptions} />
          </div>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-500">
              {t('payment.secure_transaction', 'Secure transaction')}
            </span>
          </div>
          <div>
            <span className="font-medium mr-2">
              {t('payment.amount', 'Amount:')}
            </span>
            <span className="font-bold">£200.00</span>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isProcessing || !stripe} 
          className="w-full"
        >
          {isProcessing ? (
            <>
              <span className="mr-2">{t('payment.processing', 'Processing...')}</span>
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
            </>
          ) : (
            t('payment.pay_deposit', 'Pay £200 Deposit')
          )}
        </Button>
      </div>
    </form>
  );
};

// Get Stripe public key from environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

// Main component that wraps the payment form with Stripe Elements
const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

export default PaymentForm;