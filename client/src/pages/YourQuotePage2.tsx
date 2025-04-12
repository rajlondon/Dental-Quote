import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Pencil
} from 'lucide-react';
import TreatmentPlanBuilder, { TreatmentItem as PlanTreatmentItem } from '@/components/TreatmentPlanBuilder';
import EditQuoteModal from '@/components/EditQuoteModal';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

// Import the new components
import PatientInfoForm, { PatientInfo } from '@/components/PatientInfoForm';
import TreatmentGuide from '@/components/TreatmentGuide';

// Types
interface QuoteParams {
  treatment: string;
  travelMonth: string;
  budget: string;
}

import WhatsAppButton from '@/components/WhatsAppButton';

// FAQ Section
const FAQSection: React.FC = () => {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg">
            How does the dental tourism process work?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600">
            <p>
              After submitting your quote request, you'll receive a detailed treatment plan from our partner clinics. Once you choose a clinic, you'll pay a £200 deposit to secure your booking. Our concierge team will help with travel arrangements, and you'll pay the remaining balance directly to the clinic after your consultation in Istanbul.
            </p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg">
            How much can I save compared to UK dental prices?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600">
            <p>
              Patients typically save 50-70% on dental treatment costs in Turkey compared to the UK. For example, a single dental implant might cost £2,000-£3,000 in the UK but only £600-£850 in Istanbul. The exact savings depend on your specific treatment plan.
            </p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-lg">
            How long will I need to stay in Istanbul?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600">
            <p>
              The length of stay depends on your treatment plan. For dental implants, you'll typically need two trips: 3-4 days for the initial implant placement, then 5-7 days for the final restoration after healing (3-6 months later). For cosmetic treatments like veneers, a single 5-7 day trip is usually sufficient.
            </p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-4">
          <AccordionTrigger className="text-lg">
            What about aftercare and guarantees?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600">
            <p>
              All our partner clinics offer guarantees on their work, ranging from 3 to 10 years depending on the treatment and clinic. For aftercare, you'll receive detailed post-treatment instructions, and the clinics provide remote follow-up support. If you have any issues, our UK-based team can help coordinate with the clinic.
            </p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-5">
          <AccordionTrigger className="text-lg">
            Is the £200 deposit refundable?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600">
            <p>
              Yes, the £200 deposit is fully refundable if you cancel more than 7 days before your scheduled consultation. If you proceed with treatment, this deposit is deducted from your final treatment cost.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const YourQuotePage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  // Parse URL query parameters
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  
  const [quoteParams, setQuoteParams] = useState<QuoteParams>({
    treatment: searchParams.get('treatment') || 'Dental Implants',
    travelMonth: searchParams.get('travelMonth') || 'Flexible',
    budget: searchParams.get('budget') || '£1,500 - £2,500'
  });
  
  // Treatment Plan Builder State
  const [treatmentItems, setTreatmentItems] = useState<PlanTreatmentItem[]>([]);
  
  // Patient Info State
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  
  // Edit Quote Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Quote steps tracking
  const [currentStep, setCurrentStep] = useState<'build-plan' | 'patient-info' | 'review'>('build-plan');
  const [isQuoteReady, setIsQuoteReady] = useState(false);
  
  // Function to open edit quote modal
  const handleEditQuote = () => {
    setIsEditModalOpen(true);
  };
  
  // Function to save updated quote parameters
  const handleSaveQuoteParams = (params: QuoteParams) => {
    setQuoteParams(params);
    toast({
      title: "Quote Updated",
      description: "Your quote preferences have been updated.",
    });
  };
  
  // Function to handle treatment plan changes
  const handleTreatmentPlanChange = (items: PlanTreatmentItem[]) => {
    setTreatmentItems(items);
    
    if (items.length > 0) {
      toast({
        title: "Treatment Plan Updated",
        description: "Your treatment plan has been updated.",
      });
    }
  };
  
  // Function to handle patient info form submission
  const handlePatientInfoSubmit = (data: PatientInfo) => {
    setPatientInfo(data);
    setCurrentStep('review');
    setIsQuoteReady(true);
    
    toast({
      title: "Information Saved",
      description: "Your personal information has been saved successfully.",
    });
    
    // Scroll to the top of the review section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Calculate totals
  const totalGBP = treatmentItems.reduce((sum, item) => sum + item.subtotalGBP, 0);
  const totalUSD = treatmentItems.reduce((sum, item) => sum + item.subtotalUSD, 0);
  
  // Format currency with commas
  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  useEffect(() => {
    // In a real implementation, we would parse query parameters here
    // and fetch real data from an API
    document.title = "Build Your Dental Treatment Quote | MyDentalFly";
    
    // Show welcome toast when the page loads
    toast({
      title: "Let's Build Your Quote",
      description: "Start by creating your custom treatment plan below.",
    });
    
    // Initialize with a default treatment if the user came from selecting a specific treatment
    if (quoteParams.treatment && quoteParams.treatment !== 'Flexible') {
      const initialTreatment: PlanTreatmentItem = {
        id: `default_${Date.now()}`,
        category: 'implants', // Default category, would be determined by mapping in real app
        name: quoteParams.treatment,
        quantity: 1,
        priceGBP: 450, // Default price, would be determined by API in real app
        priceUSD: 580, // Default price, would be determined by API in real app
        subtotalGBP: 450,
        subtotalUSD: 580,
        guarantee: '5-year'
      };
      
      setTreatmentItems([initialTreatment]);
    }
    
    // Initialize patient info from URL parameters if available
    if (searchParams.get('name') || searchParams.get('email') || searchParams.get('phone')) {
      setPatientInfo({
        fullName: searchParams.get('name') || '',
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        travelMonth: searchParams.get('travelMonth') || '',
        departureCity: '',
        hasXrays: false,
        hasCtScan: false,
        additionalNotes: '',
        preferredContactMethod: 'email'
      });
    }
  }, []);
  
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <WhatsAppButton 
        phoneNumber="447572445856" 
        message="Hello! I'm interested in dental treatments with MyDentalFly and would like some information about my quote. Can you help me?"
      />
      
      <main className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center text-gray-600"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
          
          {/* Page header */}
          {searchParams.get('name') ? (
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Hello, {searchParams.get('name')?.split(' ')[0]}!
            </h1>
          ) : (
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Building Your Treatment Plan</h1>
              <p className="text-gray-600 mb-6">Choose your treatments below to get the most accurate price estimate. Your final treatment plan will be confirmed after consultation and X-rays with your chosen clinic.</p>
            </div>
          )}
          
          {searchParams.get('name') && (
            <p className="text-gray-600 mb-6 text-lg">Let's create your personalized dental treatment quote</p>
          )}
          
          {/* Progress tracker */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Your Quote Progress</h2>
                  <p className="text-gray-600 text-sm">Follow these steps to get your personalized quote</p>
                </div>
                
                {isQuoteReady && (
                  <div className="mt-4 sm:mt-0">
                    <Button 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Quote PDF
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div 
                  className={`p-3 rounded-md border flex items-center gap-3 cursor-pointer
                    ${currentStep === 'build-plan' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                  `}
                  onClick={() => setCurrentStep('build-plan')}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${
                    currentStep === 'build-plan' ? 'bg-blue-500' : 
                    treatmentItems.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {treatmentItems.length > 0 ? <Check className="h-5 w-5" /> : '1'}
                  </div>
                  <div>
                    <p className="font-medium">Build Treatment Plan</p>
                    <p className="text-xs text-gray-600">{treatmentItems.length} treatments added</p>
                  </div>
                </div>
                
                <div 
                  className={`p-3 rounded-md border flex items-center gap-3 cursor-pointer
                    ${currentStep === 'patient-info' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${treatmentItems.length === 0 ? 'opacity-50' : ''}
                  `}
                  onClick={() => treatmentItems.length > 0 && setCurrentStep('patient-info')}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${
                    currentStep === 'patient-info' ? 'bg-blue-500' : 
                    patientInfo ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {patientInfo ? <Check className="h-5 w-5" /> : '2'}
                  </div>
                  <div>
                    <p className="font-medium">Your Information</p>
                    <p className="text-xs text-gray-600">
                      {patientInfo ? 'Information saved' : 'Add your details'}
                    </p>
                  </div>
                </div>
                
                <div 
                  className={`p-3 rounded-md border flex items-center gap-3 cursor-pointer
                    ${currentStep === 'review' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${!patientInfo ? 'opacity-50' : ''}
                  `}
                  onClick={() => patientInfo && setCurrentStep('review')}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${
                    currentStep === 'review' ? 'bg-blue-500' : 
                    isQuoteReady ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {isQuoteReady ? <Check className="h-5 w-5" /> : '3'}
                  </div>
                  <div>
                    <p className="font-medium">Review & Submit</p>
                    <p className="text-xs text-gray-600">
                      {isQuoteReady ? 'Quote ready' : 'Complete first two steps'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quote Parameters Summary (always visible) */}
          <div className="mb-8">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Quote Preferences</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditQuote}
                    className="flex items-center gap-2 text-xs h-8"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Treatment</p>
                    <p className="font-medium">{quoteParams.treatment}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Travel Month</p>
                    <p className="font-medium">{quoteParams.travelMonth}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Budget Range</p>
                    <p className="font-medium">{quoteParams.budget}</p>
                  </div>
                </div>
                
                {treatmentItems.length > 0 && (
                  <div className="flex justify-end mt-4">
                    <div className="bg-blue-50 py-2 px-4 rounded-md">
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-gray-700">Total:</span>
                        <span className="font-bold">£{formatCurrency(totalGBP)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-xs text-gray-500">
                        <span>USD:</span>
                        <span>${formatCurrency(totalUSD)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Edit Quote Modal */}
          <EditQuoteModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            initialParams={quoteParams}
            onSave={handleSaveQuoteParams}
          />
          
          {/* Step 1: Build Treatment Plan (conditionally displayed) */}
          {currentStep === 'build-plan' && (
            <>
              {/* Educational Info Boxes */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-blue-500" />
                      Implants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Clinic Preferred Brands – All Lifetime Guarantee</p>
                  </CardContent>
                </Card>
                
                <Card className="border border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                      Veneers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Cosmetic Options vs. Functional Strength</p>
                  </CardContent>
                </Card>
                
                <Card className="border border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Star className="w-4 h-4 mr-2 text-blue-500" />
                      Crowns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Durability vs. Aesthetics Guidance</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mb-6 bg-blue-50 border border-blue-100 p-3 rounded-md text-sm flex items-center">
                <Info className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                <p>Don't have X-rays or a CT scan? No problem – these can be taken at your consultation in Turkey at no extra cost.</p>
              </div>
              
              {/* Treatment Guide - Educational Component */}
              <TreatmentGuide />
              
              {/* Treatment Plan Builder */}
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl font-bold">
                      <Pencil className="mr-2 h-5 w-5 text-blue-500" />
                      Build Your Treatment Plan
                    </CardTitle>
                    <CardDescription>
                      Add all the treatments you're interested in to get a comprehensive quote
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TreatmentPlanBuilder 
                      initialTreatments={treatmentItems}
                      onTreatmentsChange={handleTreatmentPlanChange}
                    />
                    
                    {treatmentItems.length > 0 && (
                      <div className="mt-6 flex justify-end">
                        <Button 
                          onClick={() => setCurrentStep('patient-info')}
                          className="flex items-center gap-2"
                        >
                          Continue to Next Step
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
          
          {/* Step 2: Patient Information (conditionally displayed) */}
          {currentStep === 'patient-info' && (
            <>
              <PatientInfoForm
                initialData={patientInfo || {
                  fullName: searchParams.get('name') || '',
                  email: searchParams.get('email') || '',
                  phone: searchParams.get('phone') || '',
                  travelMonth: searchParams.get('travelMonth') || '',
                }}
                onSubmit={handlePatientInfoSubmit}
              />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep('build-plan')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Treatment Plan
                </Button>
              </div>
            </>
          )}
          
          {/* Step 3: Review and Submit (conditionally displayed) */}
          {currentStep === 'review' && (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    Your Quote is Ready
                  </CardTitle>
                  <CardDescription>
                    Review your treatment plan and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Treatment Summary */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">Treatment Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        {treatmentItems.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Treatment</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {treatmentItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">{item.name}</TableCell>
                                  <TableCell className="text-center">{item.quantity}</TableCell>
                                  <TableCell className="text-right">£{item.priceGBP}</TableCell>
                                  <TableCell className="text-right">£{item.subtotalGBP}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                            <TableFooter>
                              <TableRow>
                                <TableCell colSpan={3}>Total</TableCell>
                                <TableCell className="text-right">£{formatCurrency(totalGBP)}</TableCell>
                              </TableRow>
                            </TableFooter>
                          </Table>
                        ) : (
                          <p>No treatments added yet.</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Patient Information */}
                    {patientInfo && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-3">Your Information</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Name</p>
                              <p>{patientInfo.fullName}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Email</p>
                              <p>{patientInfo.email}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Phone</p>
                              <p>{patientInfo.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Travel Month</p>
                              <p>{patientInfo.travelMonth || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Departure City</p>
                              <p>{patientInfo.departureCity || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Contact Preference</p>
                              <p className="capitalize">{patientInfo.preferredContactMethod}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500">Dental Records</p>
                            <div className="flex flex-wrap gap-3 mt-1">
                              <Badge variant={patientInfo.hasXrays ? "default" : "outline"}>
                                {patientInfo.hasXrays ? 'Has X-Rays' : 'No X-Rays'}
                              </Badge>
                              <Badge variant={patientInfo.hasCtScan ? "default" : "outline"}>
                                {patientInfo.hasCtScan ? 'Has CT Scan' : 'No CT Scan'}
                              </Badge>
                            </div>
                          </div>
                          
                          {patientInfo.additionalNotes && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-500">Additional Notes</p>
                              <p className="text-sm mt-1">{patientInfo.additionalNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Next Steps */}
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h3 className="font-semibold text-blue-800 mb-2">Next Steps</h3>
                      <ol className="space-y-2">
                        <li className="flex items-start">
                          <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                            <span className="text-xs">1</span>
                          </div>
                          <p className="text-blue-700">Our dental experts will review your treatment plan within 24 hours</p>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                            <span className="text-xs">2</span>
                          </div>
                          <p className="text-blue-700">You will receive a detailed quote from our partner clinics via email</p>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                            <span className="text-xs">3</span>
                          </div>
                          <p className="text-blue-700">A dental advisor will contact you to discuss the options and answer questions</p>
                        </li>
                      </ol>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          variant="outline"
                          onClick={() => setCurrentStep('build-plan')}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Treatment Plan
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={() => setCurrentStep('patient-info')}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Information
                        </Button>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          variant="default"
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Email Quote
                        </Button>
                        
                        <Button 
                          variant="default"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Call to Action */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mb-10">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Ready to Get Started?
                  </h2>
                  
                  <p className="text-blue-100 mb-6">
                    Pay a £200 refundable deposit to secure your consultation and have our concierge team handle all your travel arrangements.
                  </p>
                  
                  {totalGBP > 0 && (
                    <div className="bg-white/10 rounded-lg p-4 mb-6 inline-block">
                      <h3 className="text-lg font-semibold mb-1">Your Treatment Plan Total</h3>
                      <p className="text-2xl font-bold">£{formatCurrency(totalGBP)}</p>
                      <p className="text-sm text-blue-200">Final price confirmed after consultation</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button 
                      className="bg-white text-blue-700 hover:bg-blue-50"
                      size="lg"
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pay £200 Deposit & Book Now
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="border-white text-white hover:bg-blue-700"
                      size="lg"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Speak to a Dental Advisor
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* FAQ Section */}
          <FAQSection />
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default YourQuotePage;