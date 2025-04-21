import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Load Stripe outside of the component to avoid recreating it on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface StripePaymentWrapperProps {
  email: string;
  amount?: number;
  quoteId?: number;
  clinicId?: number;
  onSuccessfulPayment?: () => void;
  paymentType?: 'deposit' | 'treatment' | 'other';
  bookingId?: number;
  metadata?: Record<string, string>;
}

export default function StripePaymentWrapper({
  email,
  amount = 200, // Default deposit amount is £200
  quoteId,
  clinicId,
  onSuccessfulPayment,
  paymentType = 'deposit',
  bookingId,
  metadata = {}
}: StripePaymentWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if the Stripe key is configured
        if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
          throw new Error('Stripe is not configured. Payment processing is unavailable.');
        }

        // Prepare the metadata to include with the payment
        const paymentMetadata = {
          customerEmail: email,
          type: paymentType,
          ...(quoteId ? { quoteId: quoteId.toString() } : {}),
          ...(clinicId ? { clinicId: clinicId.toString() } : {}),
          ...(bookingId ? { bookingId: bookingId.toString() } : {}),
          ...metadata
        };

        // Get a payment intent from the server
        const response = await apiRequest('POST', '/api/create-deposit-payment-intent', {
          email,
          amount,
          metadata: paymentMetadata
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Payment intent error:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        
        toast({
          title: 'Payment Setup Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [email, amount, quoteId, clinicId, paymentType, bookingId, metadata, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg shadow-sm bg-white min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-center text-muted-foreground">
          Setting up secure payment...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border rounded-lg shadow-sm bg-destructive/10 text-center min-h-[200px] flex flex-col items-center justify-center">
        <h3 className="font-semibold text-lg mb-2">Payment Setup Failed</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <p className="text-sm">
          Please try again later or contact support for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg shadow-sm bg-white">
      {clientSecret && (
        <Elements 
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#2563eb', // blue-600
                colorBackground: '#ffffff',
                colorText: '#0f172a', // slate-900
                colorDanger: '#ef4444', // red-500
                fontFamily: 'Inter, system-ui, sans-serif',
                borderRadius: '6px',
              }
            }
          }}
        >
          <StripePaymentForm 
            paymentType={paymentType}
            amount={amount}
            onSuccess={onSuccessfulPayment}
          />
        </Elements>
      )}
    </div>
  );
}