import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface StripePaymentWrapperProps {
  returnUrl: string;
}

export default function StripePaymentWrapper({ returnUrl }: StripePaymentWrapperProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'error'>('idle');
  
  useEffect(() => {
    if (!stripe) {
      return;
    }
    
    // Check for errors when the component mounts
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );
    
    if (!clientSecret) {
      return;
    }
    
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          setPaymentStatus('succeeded');
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          setPaymentStatus('processing');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          setPaymentStatus('error');
          break;
        default:
          setMessage('Something went wrong.');
          setPaymentStatus('error');
          break;
      }
    });
  }, [stripe]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded
      return;
    }
    
    setIsLoading(true);
    setPaymentStatus('processing');
    
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}${returnUrl}`,
        },
      });
      
      if (error) {
        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, customers will be redirected to
        // the `return_url` with the payment processing status.
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message || 'An error occurred with your payment');
        } else {
          setMessage('An unexpected error occurred');
        }
        
        setPaymentStatus('error');
        toast({
          title: 'Payment Failed',
          description: error.message || 'There was a problem with your payment',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error in payment submission:', err);
      setMessage('An unexpected error occurred during payment processing');
      setPaymentStatus('error');
      toast({
        title: 'Payment System Error',
        description: 'There was a technical problem with the payment system',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Your Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paymentStatus === 'succeeded' ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-medium text-center">Payment Successful!</h3>
            <p className="text-center text-muted-foreground mt-2">
              Your payment has been processed successfully.
            </p>
            <Button
              onClick={() => window.location.href = returnUrl}
              className="mt-6"
            >
              Continue
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <Alert variant={paymentStatus === 'error' ? 'destructive' : 'default'}>
                <AlertTitle>
                  {paymentStatus === 'error' ? 'Payment Error' : 'Payment Status'}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            <PaymentElement id="payment-element" options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              }
            }} />
            
            <Button
              type="submit"
              disabled={isLoading || !stripe || !elements || paymentStatus === 'processing'}
              className="w-full"
            >
              {isLoading || paymentStatus === 'processing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-muted-foreground text-center">
          Secure payment powered by Stripe. Your card details are encrypted and never stored on our servers.
        </p>
      </CardFooter>
    </Card>
  );
}