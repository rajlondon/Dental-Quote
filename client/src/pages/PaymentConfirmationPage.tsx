import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, HomeIcon, CalendarClock, FileText } from 'lucide-react';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

export default function PaymentConfirmationPage() {
  const [location, navigate] = useLocation();
  const [email, setEmail] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  
  useEffect(() => {
    // Parse query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get('email');
    const paymentIdParam = searchParams.get('payment_intent') || searchParams.get('payment_id');
    
    if (emailParam) {
      setEmail(emailParam);
    }
    
    if (paymentIdParam) {
      setPaymentId(paymentIdParam);
    }
  }, []);
  
  return (
    <div className="container max-w-4xl py-8 px-4 md:px-6">
      <Breadcrumbs 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Deposit Payment', href: `/deposit-payment${email ? `?email=${email}` : ''}` },
          { label: 'Payment Confirmation', href: '#', current: true }
        ]}
      />
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Payment Confirmation</h1>
          <p className="text-muted-foreground mt-1">
            Your payment has been successfully processed
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
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <CardTitle>Payment Successful</CardTitle>
              <CardDescription>
                Your deposit payment has been processed successfully
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="p-6 border rounded-lg bg-green-50 border-green-100">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Thank You for Your Payment</h3>
              <p className="text-green-700">
                Your booking is now confirmed and our team will be in touch soon.
              </p>
            </div>
            
            {paymentId && (
              <div className="text-sm text-center text-green-700 mt-2">
                Payment reference: {paymentId}
              </div>
            )}
          </div>
          
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-medium">What Happens Next?</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex p-4 border rounded-lg">
                <div className="mr-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CalendarClock className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Appointment Scheduling</h4>
                  <p className="text-sm text-muted-foreground">
                    Our partner clinic will contact you within 2 business days to schedule your treatment.
                  </p>
                </div>
              </div>
              
              <div className="flex p-4 border rounded-lg">
                <div className="mr-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Booking Confirmation</h4>
                  <p className="text-sm text-muted-foreground">
                    A confirmation email with your booking details has been sent to your email address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <Button 
            onClick={() => navigate('/patient-portal')}
            variant="default"
          >
            Go to Patient Portal
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Have questions about your booking?
        </p>
        <Button 
          variant="link" 
          onClick={() => navigate('/contact')}
          className="text-sm"
        >
          Contact our support team
        </Button>
      </div>
    </div>
  );
}