import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useQuoteFlow, useInitializeQuoteFlow } from '@/contexts/QuoteFlowContext';
import { useSpecialOffers } from '@/hooks/use-special-offers';
import ActiveOfferBadge from '@/components/specialOffers/ActiveOfferBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import QuoteSummaryPanel from '@/components/quote/QuoteSummaryPanel';
import EnhancedTreatmentPlanBuilder from '@/components/EnhancedTreatmentPlanBuilder';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  ChevronRight, 
  MapPin, 
  Star, 
  Clock, 
  Calendar, 
  Download, 
  Mail, 
  CreditCard,
  Hotel,
  Car,
  Shield,
  Plane,
  Sparkles,
  Info,
  ArrowLeft,
  Edit3,
  RefreshCcw,
  MessageCircle,
  CheckCircle,
  HeartHandshake,
  Pencil,
  Gift,
  Package,
  Teeth,
  MoveRight,
  CalendarCheck
} from 'lucide-react';
import TreatmentPlanBuilder, { TreatmentItem } from '@/components/TreatmentPlanBuilder';
import SpecialOfferHandler from '@/components/specialOffers/SpecialOfferHandler';
import { Separator } from '@/components/ui/separator';

const NewYourQuotePage: React.FC = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Extract special offers data 
  const {
    isSpecialOfferFlow,
    isPackageFlow,
    isPromoTokenFlow,
    specialOffer,
    packageData,
    processSpecialOffers
  } = useSpecialOffers();
  
  // Local state
  const [treatments, setTreatments] = useState<TreatmentItem[]>([]);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('treatments');
  
  // Initialize quote flow
  const initializeQuoteFlow = useInitializeQuoteFlow();
  const { 
    currentStep,
    selectedClinic,
    patientData,
    treatmentData,
    setTreatmentData,
    isQuoteInitialized,
    goToNextStep,
    goToPreviousStep
  } = useQuoteFlow();
  
  // Parse URL params
  const urlParams = new URLSearchParams(window.location.search);
  const skipInfo = urlParams.get('skipInfo') === 'true';
  const source = urlParams.get('source');
  const offerId = urlParams.get('offerId') || urlParams.get('specialOffer');
  const offerTitle = urlParams.get('offerTitle');
  const clinicId = urlParams.get('clinicId') || urlParams.get('offerClinic');
  const originPage = urlParams.get('origin');
  
  // Initialize quote flow with URL parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    
    // Update the treatmentData when treatments change
    if (treatments.length > 0) {
      setTreatmentData(treatments);
    }
    
    // Initialize the quote flow with URL parameters
    initializeQuoteFlow({
      queryParams,
      onSuccess: () => {
        // Auto-navigate to next step if skipInfo is true
        if (skipInfo && currentStep === 'info') {
          goToNextStep();
        }
      }
    });
  }, [initializeQuoteFlow, skipInfo, currentStep, goToNextStep, treatments, setTreatmentData]);
  
  // Handle treatments change
  const handleTreatmentsChange = (newTreatments: TreatmentItem[]) => {
    setTreatments(newTreatments);
    setTreatmentData(newTreatments);
  };
  
  // Handle continue button
  const handleContinue = () => {
    if (treatments.length === 0) {
      toast({
        title: "No treatments selected",
        description: "Please add at least one treatment to continue.",
        variant: "destructive"
      });
      return;
    }
    
    goToNextStep();
  };
  
  // Check if we have active special offers
  const hasSpecialOffers = isSpecialOfferFlow && specialOffer;
  const hasPackage = isPackageFlow && packageData;
  
  // Generate PDF
  const handleGeneratePDF = async () => {
    setIsLoadingPDF(true);
    try {
      const response = await fetch('/api/generate-quote-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: patientData?.name || 'Guest',
          email: patientData?.email || 'guest@example.com',
          treatments,
          clinicName: selectedClinic?.name || 'Turkish Dental Clinic',
          specialOfferTitle: hasSpecialOffers ? specialOffer.title : undefined,
          discountValue: hasSpecialOffers ? specialOffer.discountValue : undefined,
          discountType: hasSpecialOffers ? specialOffer.discountType : undefined,
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dental-quote.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Quote PDF Generated",
          description: "Your quote PDF has been generated and downloaded.",
        });
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error Generating PDF",
        description: "There was an error generating your quote PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPDF(false);
    }
  };
  
  // Content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'start':
      case 'info':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {t('yourQuote.title')}
                {(hasSpecialOffers || hasPackage) && (
                  <span className="ml-2">
                    <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-blue-50 text-primary border-green-200">
                      {hasSpecialOffers ? (
                        <><Gift className="h-3 w-3 mr-1 text-green-600" /> Special Offer</>
                      ) : (
                        <><Package className="h-3 w-3 mr-1 text-blue-600" /> Package</>
                      )}
                    </Badge>
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mb-4">
                {t('yourQuote.subtitle')}
              </p>
              
              {/* Progress Steps */}
              <div className="flex items-center mb-8">
                <div className="flex items-center">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center bg-primary text-white font-medium">
                    1
                  </div>
                  <span className="ml-2 font-medium text-primary">Build Quote</span>
                </div>
                <div className="h-px bg-gray-300 flex-grow mx-2"></div>
                <div className="flex items-center">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-200 text-gray-500 font-medium">
                    2
                  </div>
                  <span className="ml-2 text-gray-500">Your Details</span>
                </div>
                <div className="h-px bg-gray-300 flex-grow mx-2"></div>
                <div className="flex items-center">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-200 text-gray-500 font-medium">
                    3
                  </div>
                  <span className="ml-2 text-gray-500">Confirm</span>
                </div>
              </div>
              
              {/* Special Offer Section */}
              {hasSpecialOffers && (
                <Card className="mb-6 border-green-200 shadow-sm overflow-hidden">
                  <div className="absolute -right-10 top-5 bg-gradient-to-r from-green-500 to-blue-500 text-white px-12 py-1 transform rotate-45 shadow-md text-sm font-semibold">
                    Special Offer
                  </div>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardTitle className="flex items-center text-xl">
                      <Gift className="mr-2 h-5 w-5 text-green-600" />
                      {specialOffer.title}
                    </CardTitle>
                    <CardDescription>
                      {specialOffer.discountType === 'percentage' ? (
                        <span className="text-green-700 font-medium">
                          {specialOffer.discountValue}% discount
                        </span>
                      ) : (
                        <span className="text-green-700 font-medium">
                          £{specialOffer.discountValue} off
                        </span>
                      )}
                      {" "}has been applied to your quote
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-4">
                      This special offer from {selectedClinic?.name || 'our partner clinic'} gives you exclusive savings on your dental treatment. The discount has already been applied to your quote.
                    </p>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Exclusive offer for MyDentalFly customers</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Limited time promotion - book soon to secure this price</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Package Section */}
              {hasPackage && (
                <Card className="mb-6 border-blue-200 shadow-sm overflow-hidden">
                  <div className="absolute -right-10 top-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-12 py-1 transform rotate-45 shadow-md text-sm font-semibold">
                    Package Deal
                  </div>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center text-xl">
                      <Package className="mr-2 h-5 w-5 text-blue-600" />
                      {packageData.title}
                    </CardTitle>
                    <CardDescription>
                      Complete treatment package with special pricing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-4">
                      This package from {selectedClinic?.name || 'our partner clinic'} includes multiple treatments at a special package price, saving you money compared to booking treatments separately.
                    </p>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">All-inclusive package with multiple treatments</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Save compared to booking treatments separately</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Tabs 
                defaultValue="treatments" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="treatments" className="text-sm">
                    <Teeth className="h-4 w-4 mr-2" />
                    Treatment Plan
                  </TabsTrigger>
                  <TabsTrigger value="travel" className="text-sm">
                    <Plane className="h-4 w-4 mr-2" />
                    Travel & Stay
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="treatments" className="mt-0">
                  {/* Treatment Plan Builder */}
                  <EnhancedTreatmentPlanBuilder
                    initialTreatments={treatmentData || []}
                    onTreatmentsChange={handleTreatmentsChange}
                  />
                </TabsContent>
                
                <TabsContent value="travel" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Travel & Accommodation Options</CardTitle>
                      <CardDescription>
                        Add travel and accommodation to your dental treatment plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 hover:bg-primary/5 transition cursor-pointer">
                          <div className="flex items-center">
                            <div className="mr-4 bg-blue-100 p-2 rounded-lg">
                              <Plane className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Flight Booking Assistance</h3>
                              <p className="text-sm text-gray-500">Help finding the best flights for your treatment dates</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Add
                          </Button>
                        </div>
                        
                        <div className="border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 hover:bg-primary/5 transition cursor-pointer">
                          <div className="flex items-center">
                            <div className="mr-4 bg-indigo-100 p-2 rounded-lg">
                              <Hotel className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">4-Star Hotel Accommodation</h3>
                              <p className="text-sm text-gray-500">Comfortable stay near your dental clinic</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Add
                          </Button>
                        </div>
                        
                        <div className="border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 hover:bg-primary/5 transition cursor-pointer">
                          <div className="flex items-center">
                            <div className="mr-4 bg-amber-100 p-2 rounded-lg">
                              <Car className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Airport Transfers</h3>
                              <p className="text-sm text-gray-500">Convenient transportation to and from the airport</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Add
                          </Button>
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-start">
                            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-700">
                              Our concierge team can help you with all travel arrangements. You can also add these services later after your quote is confirmed.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between items-center mb-8">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleGeneratePDF}
                  disabled={isLoadingPDF || treatments.length === 0}
                >
                  {isLoadingPDF ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Quote
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleContinue}
                  disabled={treatments.length === 0}
                  className="flex items-center"
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How accurate is this quote?</AccordionTrigger>
                  <AccordionContent>
                    This quote provides an estimate based on average prices at Turkish dental clinics. The final price may vary slightly depending on your specific dental needs, which will be determined after an initial consultation and examination.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>What happens after I submit my quote request?</AccordionTrigger>
                  <AccordionContent>
                    After submitting your quote request, you'll receive a detailed treatment plan via email. A dental tourism consultant will also contact you to discuss your treatment options, answer any questions, and help you plan your dental trip.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How long will I need to stay in Turkey for my treatment?</AccordionTrigger>
                  <AccordionContent>
                    The length of stay depends on your specific treatment plan. Simple procedures like teeth whitening might require just 1-2 days, while more complex treatments like dental implants might require 5-14 days, often split across two visits. Your dental consultant will provide a precise timeline based on your treatment plan.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Are there any hidden costs I should be aware of?</AccordionTrigger>
                  <AccordionContent>
                    The quote includes all dental treatment costs. Additional expenses to consider include flights, accommodation, and personal expenses during your stay. Some clinics offer complimentary services like airport transfers and hotel discounts, which will be detailed in your final quote.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        );
        
      case 'details':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{t('yourQuote.details.title')}</h1>
              <p className="text-gray-600 mb-4">{t('yourQuote.details.subtitle')}</p>
              
              {/* Progress Steps */}
              <div className="flex items-center mb-12">
                <div className="flex items-center">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 font-medium">
                    <Check className="h-5 w-5" />
                  </div>
                  <span className="ml-2 text-green-600">Build Quote</span>
                </div>
                <div className="h-px bg-gray-300 flex-grow mx-2"></div>
                <div className="flex items-center">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center bg-primary text-white font-medium">
                    2
                  </div>
                  <span className="ml-2 font-medium text-primary">Your Details</span>
                </div>
                <div className="h-px bg-gray-300 flex-grow mx-2"></div>
                <div className="flex items-center">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-200 text-gray-500 font-medium">
                    3
                  </div>
                  <span className="ml-2 text-gray-500">Confirm</span>
                </div>
              </div>
              
              {/* Patient Details Form Placeholder */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Your Contact Information</CardTitle>
                  <CardDescription>
                    Please provide your details so we can send you your quote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Your first name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Your email address"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Your phone number"
                      />
                    </div>
                    <div className="flex items-start space-x-2 mt-2">
                      <Checkbox id="consent" className="mt-1" />
                      <label htmlFor="consent" className="text-sm text-gray-600">
                        I agree to receive my quote and related communications via email and phone, including treatment information and special offers.
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quote Summary */}
              <QuoteSummaryPanel
                treatments={treatments}
                onContinue={handleContinue}
                onBack={goToPreviousStep}
                specialOfferTitle={hasSpecialOffers ? specialOffer.title : undefined}
                discountValue={hasSpecialOffers ? specialOffer.discountValue : undefined}
                discountType={hasSpecialOffers ? specialOffer.discountType : undefined}
                clinicName={selectedClinic?.name}
              />
            </div>
          </div>
        );
        
      case 'confirm':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{t('yourQuote.confirm.title')}</h1>
              <p className="text-gray-600 mb-4">{t('yourQuote.confirm.subtitle')}</p>
              
              {/* Progress Steps */}
              <div className="flex items-center mb-12">
                <div className="flex items-center">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 font-medium">
                    <Check className="h-5 w-5" />
                  </div>
                  <span className="ml-2 text-green-600">Build Quote</span>
                </div>
                <div className="h-px bg-gray-300 flex-grow mx-2"></div>
                <div className="flex items-center">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 font-medium">
                    <Check className="h-5 w-5" />
                  </div>
                  <span className="ml-2 text-green-600">Your Details</span>
                </div>
                <div className="h-px bg-gray-300 flex-grow mx-2"></div>
                <div className="flex items-center">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center bg-primary text-white font-medium">
                    3
                  </div>
                  <span className="ml-2 font-medium text-primary">Confirm</span>
                </div>
              </div>
              
              {/* Confirmation Content */}
              <Card className="border-green-200 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-green-800">
                        Your Quote Request Has Been Submitted!
                      </h2>
                      <p className="text-green-700">
                        Thank you for choosing MyDentalFly for your dental treatment
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-3">What Happens Next?</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <div className="rounded-full bg-blue-100 p-2 mr-3 flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Email Confirmation</h4>
                        <p className="text-sm text-gray-600">
                          You'll receive a detailed quote via email within 24 hours with all the information about your selected treatments.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="rounded-full bg-blue-100 p-2 mr-3 flex-shrink-0">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Personal Consultation</h4>
                        <p className="text-sm text-gray-600">
                          A dental tourism consultant will contact you to discuss your treatment options and answer any questions you may have.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="rounded-full bg-blue-100 p-2 mr-3 flex-shrink-0">
                        <CalendarCheck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Treatment Planning</h4>
                        <p className="text-sm text-gray-600">
                          We'll help you schedule your treatment and coordinate all aspects of your dental trip, including accommodation and transfers if needed.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700">
                        Please check your email inbox (and spam folder) for our confirmation email. If you don't receive it within 24 hours, please contact us.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" onClick={handleGeneratePDF} className="flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      Download Quote PDF
                    </Button>
                    <Button onClick={() => setLocation('/')} className="flex items-center">
                      <Home className="mr-2 h-4 w-4" />
                      Return to Homepage
                    </Button>
                  </div>
                </div>
              </Card>
              
              {/* Related Services */}
              <h3 className="font-semibold text-lg mb-4">You Might Also Be Interested In</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="hover:border-primary/50 hover:shadow-sm transition cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <HeartHandshake className="h-4 w-4 mr-2 text-primary" />
                      Free Video Consultation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Book a free video consultation with one of our partner dentists to discuss your treatment needs.
                    </p>
                    <Button variant="link" className="p-0 mt-2 h-auto text-primary">
                      Book Consultation <MoveRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="hover:border-primary/50 hover:shadow-sm transition cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Plane className="h-4 w-4 mr-2 text-primary" />
                      Travel Planning Assistance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Get help with flight bookings, accommodation, and transportation for your dental trip.
                    </p>
                    <Button variant="link" className="p-0 mt-2 h-auto text-primary">
                      Learn More <MoveRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {renderStepContent()}
      </div>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default NewYourQuotePage;