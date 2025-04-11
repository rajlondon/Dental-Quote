import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onProcessingChange: (isProcessing: boolean) => void;
  onPaymentComplete: (success: boolean, bookingId?: number) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  amount,
  currency,
  onProcessingChange,
  onPaymentComplete,
}) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Format amount for display (e.g. 200 becomes £200.00)
  const formattedAmount = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);

  useEffect(() => {
    onProcessingChange(isProcessing);
  }, [isProcessing, onProcessingChange]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Confirm payment
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/booking/confirmation',
        },
        redirect: 'if_required',
      });

      // Handle errors
      if (result.error) {
        setPaymentError(result.error.message || 'Payment failed');
        toast({
          title: t('payment.error'),
          description: result.error.message || t('payment.generic_error'),
          variant: 'destructive',
        });
        setIsProcessing(false);
        onPaymentComplete(false);
      } else if (result.paymentIntent) {
        // Payment succeeded
        if (result.paymentIntent.status === 'succeeded') {
          try {
            // Confirm the payment on the server
            const confirmResponse = await fetch('/api/confirm-deposit-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentIntentId: result.paymentIntent.id,
              }),
            });

            const confirmData = await confirmResponse.json();

            if (confirmData.success) {
              toast({
                title: t('payment.success'),
                description: t('payment.success_message'),
              });
              onPaymentComplete(true, confirmData.bookingId);
            } else {
              throw new Error(confirmData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Error confirming payment:', error);
            toast({
              title: t('payment.verification_error'),
              description: t('payment.contact_support'),
              variant: 'destructive',
            });
            onPaymentComplete(true); // Still consider it success as money was charged
          }
        } else {
          setPaymentError(`Payment status: ${result.paymentIntent.status}`);
          toast({
            title: t('payment.status_error'),
            description: `${t('payment.status')}: ${result.paymentIntent.status}`,
            variant: 'destructive',
          });
          setIsProcessing(false);
          onPaymentComplete(false);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('An unexpected error occurred');
      toast({
        title: t('payment.unexpected_error'),
        description: t('payment.try_again'),
        variant: 'destructive',
      });
      setIsProcessing(false);
      onPaymentComplete(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {paymentError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {paymentError}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-4 border-t">
        <Button 
          type="submit"
          disabled={!stripe || isProcessing} 
          className="w-full"
        >
          {isProcessing ? (
            <span className="flex items-center">
              <Spinner className="mr-2" />
              {t('payment.processing')}
            </span>
          ) : (
            <>
              {t('payment.pay')} {formattedAmount}
            </>
          )}
        </Button>
        <p className="text-xs text-center text-gray-500 mt-2">
          {t('payment.secure_processing')}
        </p>
      </div>
    </form>
  );
};

interface PaymentFormProps {
  amount: number; // in whole currency units (e.g., pounds, not pennies)
  currency: string;
  email: string;
  quoteRequestId?: number;
  clinicId?: number;
  onProcessingChange: (isProcessing: boolean) => void;
  onPaymentComplete: (success: boolean, bookingId?: number) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency,
  email,
  quoteRequestId,
  clinicId,
  onProcessingChange,
  onPaymentComplete,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Stripe configuration
    const loadStripeConfig = async () => {
      try {
        const response = await fetch('/api/config/stripe');
        const data = await response.json();

        if (data.isConfigured && data.publicKey) {
          setStripePromise(loadStripe(data.publicKey));
        } else {
          setError(t('payment.stripe_not_configured'));
        }
      } catch (error) {
        console.error('Error loading Stripe config:', error);
        setError(t('payment.config_error'));
      }
    };

    loadStripeConfig();
  }, [t]);

  useEffect(() => {
    // Create a payment intent when the component mounts
    const createPaymentIntent = async () => {
      if (!email) {
        setError(t('payment.email_required'));
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/create-deposit-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            currency,
            quoteRequestId,
            clinicId,
          }),
        });

        const data = await response.json();

        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.message || t('payment.intent_error'));
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setError(t('payment.server_error'));
      } finally {
        setIsLoading(false);
      }
    };

    if (stripePromise) {
      createPaymentIntent();
    }
  }, [stripePromise, email, currency, quoteRequestId, clinicId, t]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner className="h-8 w-8 text-primary" />
        <p className="mt-4 text-center text-gray-500">
          {t('payment.preparing')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">
          {t('payment.error_title')}
        </h3>
        <p className="text-red-700 mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          {t('payment.try_again')}
        </Button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          {t('payment.not_ready')}
        </h3>
        <p className="text-yellow-700">
          {t('payment.initialization_error')}
        </p>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#007B9E',
      colorBackground: '#ffffff',
      colorText: '#333333',
      colorDanger: '#ef4444',
      fontSizeBase: '16px',
      borderRadius: '4px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="payment-form-container">
      <Elements stripe={stripePromise} options={options}>
        <StripePaymentForm 
          clientSecret={clientSecret}
          amount={amount}
          currency={currency}
          onProcessingChange={onProcessingChange}
          onPaymentComplete={onPaymentComplete}
        />
      </Elements>
    </div>
  );
};

export default PaymentForm;