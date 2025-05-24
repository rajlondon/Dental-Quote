import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, Building2, Banknote, FileCheck, HelpCircle, HomeIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StripePaymentWrapper from '@/components/payment/StripePaymentWrapper';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_TEST_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function FinalPaymentPage() {
  const [location, navigate] = useLocation();
  const [email, setEmail] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [treatmentTotal, setTreatmentTotal] = useState<number>(2500); // Example total
  const [depositPaid, setDepositPaid] = useState<number>(200);
  const [remainingBalance, setRemainingBalance] = useState<number>(2300);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isPaymentComplete, setIsPaymentComplete] = useState<boolean>(false);
  const { toast } = useToast();

  // Parse query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get('email');
    const totalParam = searchParams.get('total');
    const depositParam = searchParams.get('deposit');
    
    if (emailParam) setEmail(emailParam);
    if (totalParam) {
      const total = parseFloat(totalParam);
      setTreatmentTotal(total);
      setRemainingBalance(total - depositPaid);
    }
    if (depositParam) {
      const deposit = parseFloat(depositParam);
      setDepositPaid(deposit);
      setRemainingBalance(treatmentTotal - deposit);
    }
  }, [location, treatmentTotal, depositPaid]);

  // Create payment intent when card payment is selected
  useEffect(() => {
    if (paymentMethod === 'card' && customAmount) {
      const amountToPay = parseFloat(customAmount) * 100; // Convert to pence
      
      fetch('/api/create-treatment-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || 'patient@example.com',
          amount: amountToPay,
          currency: 'gbp',
          description: 'Final treatment balance payment'
        }),
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((error) => {
        console.error('Error creating payment intent:', error);
      });
    }
  }, [paymentMethod, customAmount, email]);

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    setClientSecret(''); // Reset client secret when changing payment method
  };

  const handleAmountChange = (amount: string) => {
    setCustomAmount(amount);
  };

  const handleBankTransferSubmit = () => {
    toast({
      title: "Bank Transfer Instructions Sent",
      description: "You'll receive an email with bank transfer details shortly.",
    });
    // Navigate back to portal with bank transfer status
    navigate('/client-portal?payment=bank-transfer');
  };

  const handleCashPaymentSubmit = () => {
    toast({
      title: "Cash Payment Recorded",
      description: "Your cash payment preference has been noted for clinic visit.",
    });
    // Navigate back to portal with cash payment status  
    navigate('/client-portal?payment=cash-at-clinic');
  };

  const renderPaymentInfo = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 mb-6">
      <div className="flex items-start">
        <HelpCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium mb-1">About Your Final Payment</h4>
          <p className="mb-2">
            After your consultation and X-rays, pay the remaining balance for your updated treatment plan.
          </p>
          <p>
            You can pay the full remaining balance or make a partial payment. Multiple payment methods are available.
          </p>
        </div>
      </div>
    </div>
  );

  const renderPaymentSummary = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Total Treatment Cost:</span>
            <span className="font-medium">£{treatmentTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Deposit Paid:</span>
            <span className="font-medium">-£{depositPaid}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Remaining Balance:</span>
            <span>£{remainingBalance.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container max-w-4xl py-8 px-4 md:px-6">
      <Breadcrumbs 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Patient Portal', href: '/client-portal' },
          { label: 'Final Payment', href: '#', current: true }
        ]}
      />
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pay Treatment Balance</h1>
          <p className="text-muted-foreground mt-1">
            Complete your payment after consultation and treatment plan review
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/client-portal">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Portal
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <HomeIcon className="h-4 w-4 mr-1" />
              Home
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Choose Payment Method</CardTitle>
              <CardDescription>
                Select how you'd like to pay your remaining treatment balance
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {renderPaymentInfo()}
              
              {/* Payment Method Selection */}
              <div className="mb-6">
                <Label className="text-base font-medium mb-3 block">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <Label htmlFor="card">Credit/Debit Card</Label>
                      <Badge variant="secondary">Instant</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="bank" id="bank" />
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <Label htmlFor="bank">Bank Transfer</Label>
                      <Badge variant="outline">1-3 days</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="cash" id="cash" />
                    <div className="flex items-center space-x-2">
                      <Banknote className="h-4 w-4" />
                      <Label htmlFor="cash">Cash at Clinic</Label>
                      <Badge variant="outline">During visit</Badge>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Amount Selection */}
              <div className="mb-6">
                <Label htmlFor="amount" className="text-base font-medium mb-3 block">
                  Payment Amount
                </Label>
                <div className="space-y-3">
                  <Button 
                    variant={customAmount === remainingBalance.toString() ? "default" : "outline"}
                    onClick={() => handleAmountChange(remainingBalance.toString())}
                    className="w-full justify-start"
                  >
                    Pay Full Balance: £{remainingBalance.toLocaleString()}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="custom-amount">Custom Amount: £</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="flex-1"
                      min="1"
                      max={remainingBalance}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Forms */}
              {paymentMethod === 'card' && customAmount && clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentWrapper 
                    returnUrl={`${window.location.origin}/client-portal?payment=success`}
                  />
                </Elements>
              )}

              {paymentMethod === 'bank' && customAmount && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Bank Transfer Details</h4>
                    <p className="text-sm text-muted-foreground">
                      You'll receive detailed bank transfer instructions via email including:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Bank account details</li>
                      <li>• Payment reference number</li>
                      <li>• Transfer instructions</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={handleBankTransferSubmit}
                    className="w-full"
                    disabled={!customAmount}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Get Bank Transfer Instructions
                  </Button>
                </div>
              )}

              {paymentMethod === 'cash' && customAmount && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium mb-2">Cash Payment at Clinic</h4>
                    <p className="text-sm text-muted-foreground">
                      You can pay £{parseFloat(customAmount).toLocaleString()} in cash during your clinic visit.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      The clinic accepts GBP, EUR, USD, and Turkish Lira.
                    </p>
                  </div>
                  <Button 
                    onClick={handleCashPaymentSubmit}
                    className="w-full"
                    disabled={!customAmount}
                  >
                    <Banknote className="h-4 w-4 mr-2" />
                    Confirm Cash Payment at Clinic
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Payment Summary Sidebar */}
        <div className="space-y-4">
          {renderPaymentSummary()}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you have any questions about your payment or treatment plan, please contact our support team.
              </p>
              <Button variant="outline" className="w-full">
                <FileCheck className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}