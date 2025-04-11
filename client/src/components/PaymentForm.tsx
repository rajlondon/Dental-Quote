import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AlertCircle, CheckCircle, CreditCard, Lock } from 'lucide-react';
import { 
  loadStripe, 
  Stripe, 
  StripeElementsOptions, 
  StripePaymentElementOptions 
} from '@stripe/stripe-js';
import { 
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

// Get the Stripe publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

// Stripe Payment Form Component
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
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState<boolean>(false);
  const { toast } = useToast();

  // Configure the appearance of the payment element
  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    onProcessingChange(true);
    setError(null);

    try {
      // Confirm the payment with Stripe
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        // Show error to your customer
        setError(result.error.message || t('payment.generic_error'));
        toast({
          title: t('payment.error'),
          description: result.error.message || t('payment.generic_error'),
          variant: 'destructive',
        });
      } else {
        // The payment was successful
        if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          setIsPaymentComplete(true);
          toast({
            title: t('payment.success'),
            description: t('payment.payment_succeeded'),
          });
          
          // Extract booking ID from the metadata if available
          const metadata = (result.paymentIntent as any).metadata;
          const bookingId = metadata && metadata.bookingId
            ? parseInt(metadata.bookingId, 10) 
            : undefined;
            
          onPaymentComplete(true, bookingId);
        } else {
          // Payment requires additional action or handling
          onPaymentComplete(false);
          setError(t('payment.additional_action_required'));
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(t('payment.generic_error'));
      onPaymentComplete(false);
    } finally {
      setIsProcessing(false);
      onProcessingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('payment.error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isPaymentComplete ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-800">{t('payment.success')}</AlertTitle>
          <AlertDescription className="text-green-700">
            {t('payment.payment_succeeded')}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-4">
            <PaymentElement options={paymentElementOptions} />
            
            <div className="flex items-center text-sm text-gray-500 mt-4">
              <Lock className="mr-2 h-4 w-4" />
              <span>{t('payment.secure_transaction')}</span>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={!stripe || isProcessing} 
            className="w-full"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <Spinner className="mr-2" />
                {t('payment.processing')}
              </div>
            ) : (
              <>
                {t('payment.pay_now')} {currency.toUpperCase()} {amount.toFixed(2)}
              </>
            )}
          </Button>
        </>
      )}
    </form>
  );
};

// Main Payment Form Component that handles the form and API integration
interface PaymentFormProps {
  amount: number; // in whole currency units (e.g., pounds, not pennies)
  currency: string;
  email: string;
  quoteRequestId?: number;
  clinicId?: number;
  onProcessingChange: (isProcessing: boolean) => void;
  onPaymentComplete: (success: boolean, bookingId?: number) => void;
}

// Define form validation schema
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
});

type FormValues = z.infer<typeof formSchema>;

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
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email || '',
      firstName: '',
      lastName: '',
    },
  });

  // Fetch the payment intent client secret from the server
  useEffect(() => {
    const createPaymentIntent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Convert amount to cents/pennies for Stripe
        const amountInSmallestUnit = Math.round(amount * 100);
        
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInSmallestUnit,
            currency,
            quoteRequestId,
            clinicId,
            metadata: {
              customerEmail: form.getValues('email'),
              customerName: `${form.getValues('firstName')} ${form.getValues('lastName')}`,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast({
          title: t('payment.error'),
          description: err instanceof Error ? err.message : t('payment.generic_error'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (form.formState.isValid) {
      createPaymentIntent();
    }
  }, [amount, currency, quoteRequestId, clinicId, form.formState.isValid, t, toast]);

  const onSubmit = (data: FormValues) => {
    // This function handles the form submission before Stripe payment
    console.log('Form data submitted:', data);
    // The actual payment processing is handled by the Stripe component
  };

  // Configure the appearance for Stripe Elements
  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#007B9E',
      colorBackground: '#ffffff',
      colorText: '#333333',
      colorDanger: '#ef4444',
      fontSizeBase: '16px',
      borderRadius: '4px',
    },
  };

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('payment.error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('payment.first_name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('payment.first_name_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('payment.last_name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('payment.last_name_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.email')}</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder={t('payment.email_placeholder')} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-6">
          <Spinner className="mb-2" />
          <p className="text-gray-500">{t('payment.loading')}</p>
        </div>
      ) : clientSecret ? (
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-medium mb-4 flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            {t('payment.payment_details')}
          </h3>
          
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
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('payment.form_incomplete')}</AlertTitle>
          <AlertDescription>
            {t('payment.complete_form_to_proceed')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PaymentForm;