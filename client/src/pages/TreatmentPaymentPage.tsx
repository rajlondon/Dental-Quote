import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Helmet } from 'react-helmet';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import TreatmentPaymentForm from '@/components/payment/TreatmentPaymentForm';
import StripePaymentWrapper from '@/components/payment/StripePaymentWrapper';
import PaymentHistory from '@/components/payment/PaymentHistory';

// Initialize Stripe
let stripePromise: Promise<any> | null = null;

export default function TreatmentPaymentPage() {
  const [match, params] = useRoute('/treatment-payment/:bookingId?');
  const bookingId = params?.bookingId ? parseInt(params.bookingId) : undefined;
  
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('payment-form');
  
  // Define type for Stripe configuration
  interface StripeConfig {
    isConfigured: boolean;
    publicKey?: string;
  }
  
  // Define type for booking data
  interface BookingData {
    id: number;
    userId: number;
    clinicId: number;
    treatmentPlanId?: number;
    status: string;
    appointmentDate?: string;
    notes?: string;
    createdAt: string;
  }
  
  // Get Stripe public key
  const { data: stripeConfig, isLoading: isLoadingStripeConfig } = useQuery<StripeConfig>({
    queryKey: ['/api/config/stripe'],
  });
  
  // Get booking details if bookingId is provided
  const { data: booking, isLoading: isLoadingBooking } = useQuery<BookingData>({
    queryKey: [`/api/booking/${bookingId}`],
    enabled: !!bookingId,
  });
  
  // Initialize Stripe with the public key
  useEffect(() => {
    if (stripeConfig?.publicKey && !stripePromise) {
      stripePromise = loadStripe(stripeConfig.publicKey);
    }
  }, [stripeConfig]);
  
  // Handle successful payment intent creation
  const handlePaymentIntentCreated = (data: any) => {
    if (data.clientSecret) {
      setClientSecret(data.clientSecret);
      setActiveTab('payment-process');
    }
  };
  
  // Handle payment errors
  const handlePaymentError = (error: Error) => {
    toast({
      title: 'Payment Error',
      description: error.message,
      variant: 'destructive',
    });
  };
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to make a payment',
        variant: 'destructive',
      });
      navigate('/portal-login');
    }
  }, [user, navigate, toast]);
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const isLoading = isLoadingStripeConfig || (bookingId && isLoadingBooking);
  
  return (
    <>
      <Helmet>
        <title>Treatment Payment | MyDentalFly</title>
      </Helmet>
      
      <div className="container max-w-5xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.history.back()}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Treatment Payment</h1>
            <p className="text-muted-foreground">
              Complete your payment for dental treatments
            </p>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !stripeConfig?.isConfigured ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <h3 className="font-medium mb-2">Payment System Unavailable</h3>
            <p>
              The payment system is currently unavailable. Please try again later or contact customer support.
            </p>
          </div>
        ) : (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="payment-form" disabled={!!clientSecret}>
                  Payment Details
                </TabsTrigger>
                <TabsTrigger value="payment-history">
                  Payment History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="payment-form" className="mt-6">
                <TreatmentPaymentForm
                  userId={user.id}
                  bookingId={bookingId}
                  treatmentPlanId={booking?.treatmentPlanId}
                  onSuccess={handlePaymentIntentCreated}
                  onError={handlePaymentError}
                />
              </TabsContent>
              
              <TabsContent value="payment-process" className="mt-6">
                {clientSecret && stripePromise ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentWrapper 
                      returnUrl={`/payment-confirmation${bookingId ? `/${bookingId}` : ''}`}
                    />
                  </Elements>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="payment-history" className="mt-6">
                <PaymentHistory 
                  userId={user.id}
                  bookingId={bookingId}
                  title="Payment History"
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </>
  );
}