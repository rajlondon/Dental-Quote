import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileCheck, HelpCircle, HomeIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StripePaymentWrapper from '@/components/payment/StripePaymentWrapper';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

export default function DepositPaymentPage() {
  const [location, navigate] = useLocation();
  const [email, setEmail] = useState<string>('');
  const [quoteId, setQuoteId] = useState<number | undefined>(undefined);
  const [clinicId, setClinicId] = useState<number | undefined>(undefined);
  const [isPaymentComplete, setIsPaymentComplete] = useState<boolean>(false);
  const { toast } = useToast();

  // Parse query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get('email');
    const quoteIdParam = searchParams.get('quoteId');
    const clinicIdParam = searchParams.get('clinicId');

    if (emailParam) {
      setEmail(emailParam);
    } else {
      toast({
        title: 'Missing information',
        description: 'Email address is required to process your payment.',
        variant: 'destructive'
      });
    }

    if (quoteIdParam) {
      setQuoteId(parseInt(quoteIdParam));
    }

    if (clinicIdParam) {
      setClinicId(parseInt(clinicIdParam));
    }
  }, [toast]);

  const handlePaymentSuccess = () => {
    setIsPaymentComplete(true);
    toast({
      title: 'Payment Successful',
      description: 'Your deposit has been processed successfully.',
      variant: 'default'
    });
  };

  const renderPaymentInfo = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 mb-6">
      <div className="flex items-start">
        <HelpCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium mb-1">About Your Deposit</h4>
          <p className="mb-2">
            Your £200 deposit helps secure your booking and demonstrates your commitment to the treatment plan.
          </p>
          <p>
            This deposit will be deducted from your total treatment cost and is refundable in case of cancellation
            with at least 30 days' notice before your scheduled appointment.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container max-w-4xl py-8 px-4 md:px-6">
      <Breadcrumbs 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Your Quote', href: `/your-quote${email ? `?email=${email}` : ''}` },
          { label: 'Deposit Payment', href: '#', current: true }
        ]}
      />
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Deposit Payment</h1>
          <p className="text-muted-foreground mt-1">
            Secure your dental treatment with a deposit payment
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Secure Payment</CardTitle>
              <CardDescription>
                Pay your deposit to confirm your dental treatment booking
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {renderPaymentInfo()}
              
              {email ? (
                <StripePaymentWrapper 
                  email={email}
                  amount={200}
                  quoteId={quoteId}
                  clinicId={clinicId}
                  paymentType="deposit"
                  onSuccessfulPayment={handlePaymentSuccess}
                />
              ) : (
                <div className="border rounded-lg p-6 text-center bg-muted/20">
                  <p className="mb-4 text-muted-foreground">
                    Missing required information to process payment.
                  </p>
                  <Button 
                    variant="default" 
                    onClick={() => navigate('/')}
                  >
                    Return to Home
                  </Button>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col items-start border-t pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about your payment, please contact our support team.
              </p>
              <Button variant="link" className="px-0" onClick={() => navigate('/contact')}>
                Contact Support
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full p-2 mr-3 flex-shrink-0">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Booking Confirmation</h4>
                  <p className="text-sm text-muted-foreground">
                    After your deposit payment, you'll receive a booking confirmation email.
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full p-2 mr-3 flex-shrink-0">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Treatment Schedule</h4>
                  <p className="text-sm text-muted-foreground">
                    Our partner clinic will contact you to schedule your treatment dates.
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full p-2 mr-3 flex-shrink-0">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Travel Arrangements</h4>
                  <p className="text-sm text-muted-foreground">
                    Access your patient portal for assistance with travel arrangements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}