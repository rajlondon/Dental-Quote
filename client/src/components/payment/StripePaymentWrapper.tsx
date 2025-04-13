import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface StripePaymentWrapperProps {
  amount: number;
  description: string;
  onPaymentSuccess: () => void;
  onCancel: () => void;
  metadata?: Record<string, string>;
}

const StripePaymentWrapper: React.FC<StripePaymentWrapperProps> = ({
  amount,
  description,
  onPaymentSuccess,
  onCancel,
  metadata = {}
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('POST', '/api/create-payment-intent', {
          amount: amount,
          description: description,
          metadata: metadata
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error('Payment setup error:', err);
        setError(err.message || 'Failed to set up payment. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [amount, description, metadata]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Setting up payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <h3 className="text-lg font-medium text-red-800 mb-2">Payment Setup Error</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Try Again Later
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#3b82f6',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            borderRadius: '8px'
          }
        }
      }}
    >
      <StripePaymentForm
        amount={amount}
        onPaymentSuccess={onPaymentSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default StripePaymentWrapper;