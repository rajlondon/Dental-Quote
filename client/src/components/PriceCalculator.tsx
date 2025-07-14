
import React, { useState, useEffect, useRef } from 'react';
import { useOptionalQuote } from '../contexts/QuoteContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, MapPin, Star, Clock, Award, Shield, Plane, Hotel, Car, Users, Calculator, FileText, Download, Send, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { PromoCodeInput } from './PromoCodeInput';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormValues {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: string;
  travelMonth: string;
  specialRequests: string;
  agreeToTerms: boolean;
}

export function PriceCalculator() {
  const quoteContext = useOptionalQuote();
  
  // Extract values from context safely
  const treatments = quoteContext?.treatments || [];
  const promoCode = quoteContext?.promoCode || null;
  const discountAmount = quoteContext?.discountAmount || 0;
  const isPackage = quoteContext?.isPackage || false;
  const packageName = quoteContext?.packageName || null;
  const isApplyingPromo = quoteContext?.isApplyingPromo || false;
  
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<FormValues>({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientAge: '',
    travelMonth: '',
    specialRequests: '',
    agreeToTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Calculate totals
  const treatmentOnlyTotalGBP = treatments.reduce((sum, treatment) => sum + treatment.subtotalGBP, 0);
  const finalTotalGBP = treatmentOnlyTotalGBP - discountAmount;
  const ukTreatmentPrice = treatments.reduce((sum, treatment) => sum + (treatment.ukPriceGBP * treatment.quantity), 0);
  const savingsAmount = ukTreatmentPrice - finalTotalGBP;
  const savingsPercentage = ukTreatmentPrice > 0 ? Math.round((savingsAmount / ukTreatmentPrice) * 100) : 0;

  const handleInputChange = (field: keyof FormValues, value: string | boolean) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitQuote = async () => {
    if (!formValues.patientName || !formValues.patientEmail || !formValues.agreeToTerms) {
      toast({
        title: "Missing Information",
        description: "Please fill in required fields and agree to terms.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare quote data
      const quoteData = {
        ...formValues,
        treatments,
        promoCode,
        discountAmount,
        treatmentOnlyTotalGBP,
        finalTotalGBP,
        ukTreatmentPrice,
        savingsAmount,
        savingsPercentage,
        isPackage,
        packageName,
        timestamp: new Date().toISOString()
      };

      // Store in localStorage for the results page
      localStorage.setItem('quoteData', JSON.stringify(quoteData));
      
      toast({
        title: "Quote Submitted Successfully!",
        description: "Redirecting to your quote results...",
      });

      // Redirect to results page
      setTimeout(() => {
        window.location.href = '/quote-results';
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (treatments.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Price Calculator
          </CardTitle>
          <CardDescription>
            No treatments selected. Please add treatments to calculate your quote.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Treatment Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Treatment Summary
            {isPackage && (
              <Badge variant="secondary" className="ml-2">
                Package: {packageName}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Review your selected treatments and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Treatment List */}
            <div className="space-y-3">
              {treatments.map((treatment) => (
                <div key={treatment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{treatment.name}</div>
                    <div className="text-sm text-gray-600">
                      Quantity: {treatment.quantity} • UK Price: £{treatment.ukPriceGBP}
                    </div>
                    {treatment.guarantee && (
                      <div className="text-xs text-blue-600 flex items-center mt-1">
                        <Shield className="h-3 w-3 mr-1" />
                        {treatment.guarantee} guarantee
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">£{treatment.subtotalGBP}</div>
                    <div className="text-sm text-gray-500">
                      Save £{(treatment.ukPriceGBP * treatment.quantity) - treatment.subtotalGBP}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Promo Code Section */}
            <PromoCodeInput />

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Treatment Subtotal:</span>
                <span>£{treatmentOnlyTotalGBP}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount {promoCode && `(${promoCode})`}:
                  </span>
                  <span>-£{discountAmount}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Cost:</span>
                <span>£{finalTotalGBP}</span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>UK Equivalent:</span>
                <span>£{ukTreatmentPrice}</span>
              </div>
              
              <div className="flex justify-between text-green-600 font-medium">
                <span>Your Savings:</span>
                <span>£{savingsAmount} ({savingsPercentage}% off UK prices)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowForm(true)}
                className="flex-1"
                size="lg"
              >
                <Send className="mr-2 h-4 w-4" />
                Get Your Quote
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/matched-clinics'}
                className="flex-1"
                size="lg"
              >
                <MapPin className="mr-2 h-4 w-4" />
                View Clinics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Information Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Patient Information
            </CardTitle>
            <CardDescription>
              Complete your details to receive your personalized quote
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Full Name *</Label>
                <Input
                  id="patientName"
                  value={formValues.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="patientEmail">Email Address *</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={formValues.patientEmail}
                  onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="patientPhone">Phone Number</Label>
                <Input
                  id="patientPhone"
                  value={formValues.patientPhone}
                  onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <Label htmlFor="patientAge">Age</Label>
                <Input
                  id="patientAge"
                  value={formValues.patientAge}
                  onChange={(e) => handleInputChange('patientAge', e.target.value)}
                  placeholder="Enter your age"
                />
              </div>
              
              <div>
                <Label htmlFor="travelMonth">Preferred Travel Month</Label>
                <Select onValueChange={(value) => handleInputChange('travelMonth', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select travel month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="january">January</SelectItem>
                    <SelectItem value="february">February</SelectItem>
                    <SelectItem value="march">March</SelectItem>
                    <SelectItem value="april">April</SelectItem>
                    <SelectItem value="may">May</SelectItem>
                    <SelectItem value="june">June</SelectItem>
                    <SelectItem value="july">July</SelectItem>
                    <SelectItem value="august">August</SelectItem>
                    <SelectItem value="september">September</SelectItem>
                    <SelectItem value="october">October</SelectItem>
                    <SelectItem value="november">November</SelectItem>
                    <SelectItem value="december">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="specialRequests">Special Requests or Notes</Label>
                <Textarea
                  id="specialRequests"
                  value={formValues.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Any special requirements or questions..."
                  rows={3}
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formValues.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', !!checked)}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    I agree to the terms and conditions and privacy policy *
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-6">
              <Button
                onClick={handleSubmitQuote}
                disabled={isSubmitting || !formValues.agreeToTerms}
                className="flex-1"
                size="lg"
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Quote Request
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-800">Quality Guarantee</h3>
            </div>
            <p className="text-sm text-blue-700">
              All treatments come with comprehensive warranties and follow-up care.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center mb-2">
              <Plane className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-800">Travel Support</h3>
            </div>
            <p className="text-sm text-green-700">
              Complete travel assistance including accommodation and transfers.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="font-semibold text-purple-800">Expert Care</h3>
            </div>
            <p className="text-sm text-purple-700">
              Experienced dental professionals with international credentials.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PriceCalculator;
