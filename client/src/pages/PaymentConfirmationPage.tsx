import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Lock, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PaymentConfirmationPageProps {
  clinicName: string;
  treatmentTotalGBP: number;
  depositAmount?: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const PaymentConfirmationPage: React.FC<PaymentConfirmationPageProps> = ({
  clinicName,
  treatmentTotalGBP,
  depositAmount = 200,
  onPaymentSuccess,
  onCancel
}) => {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Redirect to patient portal after successful payment
      setTimeout(() => {
        onPaymentSuccess();
      }, 3000);
    }, 2000);
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = val.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Handle card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardNumber(formatCardNumber(value));
  };
  
  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (val.length > 2) {
      return `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    return val;
  };
  
  // Handle expiry date input
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExpiryDate(formatExpiryDate(value));
  };
  
  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto my-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for your deposit. You will receive a confirmation email shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>Your account is being set up. You'll be redirected to your patient portal in a moment.</p>
            <div className="animate-pulse text-sm text-blue-600">Redirecting to Patient Portal...</div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto my-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5 text-blue-500" />
                Secure Payment
              </CardTitle>
              <CardDescription>
                Pay your £{depositAmount} refundable deposit to secure your booking with {clinicName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input 
                    id="cardName" 
                    placeholder="Name as it appears on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)} 
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <Input 
                      id="cardNumber" 
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      required
                    />
                    <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input 
                      id="expiryDate" 
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiryDate}
                      onChange={handleExpiryDateChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input 
                      id="cvv" 
                      placeholder="123"
                      maxLength={3}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                      required
                    />
                  </div>
                </div>
                
                <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important Information</AlertTitle>
                  <AlertDescription className="text-sm">
                    Your £{depositAmount} deposit is fully refundable if canceled 14+ days before your appointment. 
                    If you proceed with treatment, this amount will be deducted from your final bill.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[150px]"
                  >
                    {isSubmitting ? 'Processing...' : `Pay £${depositAmount}`}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Selected Clinic</p>
                <p className="font-semibold">{clinicName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Treatment Total</p>
                <p className="font-semibold">£{treatmentTotalGBP.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Final price confirmed after consultation</p>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Refundable Deposit</p>
                  <p className="font-bold">£{depositAmount}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This amount will be deducted from your total treatment cost
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Secure Payment</span>
                </div>
                <div className="flex items-center">
                  <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">100% Refundable (14+ days before appointment)</span>
                </div>
                <div className="flex items-center">
                  <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Instant Patient Portal Access</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>After Payment</AlertTitle>
                  <AlertDescription className="text-sm">
                    You'll get immediate access to your Patient Portal where you can upload dental records, 
                    communicate with your clinic, and arrange your consultation.
                  </AlertDescription>
                </Alert>
              </div>
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;