import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Printer, Send, Tag, CheckCircle, XCircle } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import { useQuoteStore } from '@/stores/quoteStore';
import { useToast } from '@/hooks/use-toast';

// Define promo code type
type PromoCodeInfo = {
  discountPercentage: number;
  description: string;
};

type PromoCodesType = {
  [code: string]: PromoCodeInfo;
};

// Define available promo codes for demonstration
const PROMO_CODES: PromoCodesType = {
  'SUMMER15': { discountPercentage: 15, description: 'Summer Special' },
  'DENTAL25': { discountPercentage: 25, description: 'Dental Care Package' },
  'NEWPATIENT': { discountPercentage: 20, description: 'New Patient Discount' },
  'TEST10': { discountPercentage: 10, description: 'Test Discount' },
  'LUXHOTEL20': { discountPercentage: 20, description: 'Luxury Hotel Discount' },
  'IMPLANTCROWN30': { discountPercentage: 30, description: 'Implant & Crown Bundle' },
  'FREECONSULT': { discountPercentage: 100, description: 'Free Consultation (for consultation treatments only)' },
  'FREEWHITE': { discountPercentage: 100, description: 'Free Whitening Treatment' }
};

const QuoteSummary: React.FC = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { 
    treatments, 
    patientInfo, 
    subtotal, 
    total,
    promoCode,
    discountPercentage,
    applyPromoCode,
    clearPromoCode,
    resetQuote
  } = useQuoteStore();
  
  const [enteredPromoCode, setEnteredPromoCode] = useState('');
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  
  // Check if all required information is complete
  const isQuoteComplete = treatments.length > 0 && patientInfo;
  
  // Calculate discount amount
  const discountAmount = subtotal * (discountPercentage / 100);
  
  // Handle promo code application
  const handleApplyPromoCode = () => {
    if (!enteredPromoCode.trim()) {
      toast({
        title: 'No promo code entered',
        description: 'Please enter a promo code to apply.',
        variant: 'destructive'
      });
      return;
    }
    
    const code = enteredPromoCode.trim().toUpperCase();
    const promoInfo = PROMO_CODES[code];
    
    if (promoInfo) {
      applyPromoCode(code, promoInfo.discountPercentage);
      toast({
        title: 'Promo code applied',
        description: `${promoInfo.description} - ${promoInfo.discountPercentage}% discount applied to your quote.`,
        variant: 'default'
      });
    } else {
      toast({
        title: 'Invalid promo code',
        description: 'The promo code you entered is not valid. Please try another code.',
        variant: 'destructive'
      });
    }
  };
  
  // Handle removing promo code
  const handleRemovePromoCode = () => {
    clearPromoCode();
    setEnteredPromoCode('');
    toast({
      title: 'Promo code removed',
      description: 'The promo code has been removed from your quote.',
      variant: 'default'
    });
  };
  
  // Go back to patient info step
  const handleGoBack = () => {
    navigate('/quote/patient-info');
  };
  
  // Submit the quote
  const handleSubmitQuote = () => {
    // In a real application, this would make an API call to save the quote
    // For now, we'll just show a success message
    
    setQuoteSubmitted(true);
    
    toast({
      title: 'Quote submitted successfully',
      description: 'We will contact you shortly to discuss your treatment options.',
      variant: 'default'
    });
    
    // Clear the quote after a timeout (in a real app, you might redirect to a success page)
    setTimeout(() => {
      resetQuote();
      navigate('/quote/treatments');
    }, 5000);
  };
  
  // Print the quote
  const handlePrintQuote = () => {
    window.print();
  };
  
  if (quoteSubmitted) {
    return (
      <div className="space-y-6">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Quote Submitted Successfully</AlertTitle>
          <AlertDescription className="text-green-700">
            Thank you for your quote request. We will contact you shortly to discuss your treatment options.
            You will also receive a confirmation email with the details of your quote.
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            You will be redirected to the start shortly...
          </p>
          <Button onClick={() => {
            resetQuote();
            navigate('/quote/treatments');
          }}>
            Create New Quote
          </Button>
        </div>
      </div>
    );
  }
  
  if (!isQuoteComplete) {
    return (
      <div className="space-y-6">
        <Alert className="bg-yellow-50 border-yellow-200">
          <XCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Incomplete Quote</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Please complete all previous steps before reviewing your quote.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/quote/treatments')}>
            Select Treatments
          </Button>
          
          {treatments.length > 0 && (
            <Button variant="outline" onClick={() => navigate('/quote/patient-info')}>
              Enter Patient Information
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Treatment Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Treatment Summary</CardTitle>
            <CardDescription>
              Review the treatments you've selected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatments.map((treatment) => (
                  <TableRow key={treatment.id}>
                    <TableCell className="font-medium">{treatment.name}</TableCell>
                    <TableCell>{treatment.quantity}</TableCell>
                    <TableCell className="text-right">${treatment.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${(treatment.price * treatment.quantity).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>
              Your contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold block">Name:</span>
              <span>{patientInfo?.firstName} {patientInfo?.lastName}</span>
            </div>
            <div>
              <span className="font-semibold block">Email:</span>
              <span>{patientInfo?.email}</span>
            </div>
            <div>
              <span className="font-semibold block">Phone:</span>
              <span>{patientInfo?.phone}</span>
            </div>
            <div>
              <span className="font-semibold block">Preferred Date:</span>
              <span>{new Date(patientInfo?.preferredDate).toLocaleDateString()}</span>
            </div>
            {patientInfo?.notes && (
              <div>
                <span className="font-semibold block">Notes:</span>
                <span className="text-sm text-muted-foreground">{patientInfo.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Promo Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="mr-2 h-5 w-5" />
            Promo Code
          </CardTitle>
          <CardDescription>
            Enter a promo code for additional savings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {promoCode ? (
            <div className="flex items-center justify-between bg-muted p-4 rounded-md">
              <div>
                <p className="font-medium">{promoCode}</p>
                <p className="text-sm text-muted-foreground">
                  {promoCode in PROMO_CODES ? PROMO_CODES[promoCode].description : 'Discount'} ({discountPercentage}% off)
                </p>
              </div>
              <Button variant="outline" onClick={handleRemovePromoCode}>
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="promoCode">Promo Code</Label>
                <Input
                  id="promoCode"
                  placeholder="Enter promo code"
                  value={enteredPromoCode}
                  onChange={(e) => setEnteredPromoCode(e.target.value)}
                />
              </div>
              <div className="mt-6">
                <Button onClick={handleApplyPromoCode}>Apply</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quote Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            {promoCode && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({discountPercentage}%):</span>
                <span>-${discountAmount.toLocaleString()}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 flex flex-col sm:flex-row gap-2">
          <p className="text-sm text-muted-foreground flex-1">
            This is an estimate for the listed treatments. Final costs may vary based on consultation and additional requirements.
          </p>
        </CardFooter>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGoBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <Button
            variant="outline"
            onClick={handlePrintQuote}
          >
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
        
        <Button
          onClick={handleSubmitQuote}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Submit Quote <Send className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          By submitting this quote, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default QuoteSummary;