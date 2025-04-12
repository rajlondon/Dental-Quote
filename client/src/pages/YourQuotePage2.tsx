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

// WhatsApp floating button component
const WhatsAppButton: React.FC = () => {
  return (
    <a
      href="https://wa.me/447572445856?text=Hello%20MyDentalFly,%20I%20need%20assistance%20with%20my%20dental%20treatment%20quote."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white rounded-full p-3 shadow-lg hover:bg-green-600 transition-colors z-50 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="mr-0"
      >
        <path d="M17.6 6.32C16.27 4.985 14.448 4.24 12.525 4.24C8.59 4.24 5.395 7.435 5.395 11.37C5.395 12.619 5.74 13.839 6.395 14.895L5.34 18.84L9.37 17.805C10.388 18.405 11.443 18.72 12.525 18.72C16.46 18.72 19.655 15.525 19.655 11.59C19.655 9.667 18.91 7.845 17.6 6.535V6.32ZM12.525 17.56C11.555 17.56 10.598 17.245 9.765 16.735L9.535 16.6L7.121 17.215L7.75 14.85L7.6 14.62C6.98 13.731 6.642 12.625 6.642 11.59C6.642 8.115 9.265 5.28 12.525 5.28C14.133 5.28 15.635 5.91 16.752 7.025C17.87 8.14 18.5 9.645 18.5 11.37C18.5 14.845 15.877 17.56 12.525 17.56ZM15.407 13.075C15.2 12.985 14.122 12.46 13.942 12.39C13.765 12.32 13.63 12.285 13.5 12.495C13.368 12.705 12.965 13.185 12.84 13.32C12.7 13.455 12.602 13.502 12.395 13.365C12.188 13.275 11.495 13.02 10.68 12.305C10.047 11.755 9.627 11.065 9.485 10.855C9.35 10.645 9.467 10.525 9.582 10.41C9.685 10.305 9.8 10.15 9.917 10.015C10.035 9.88 10.068 9.79 10.137 9.655C10.205 9.52 10.175 9.385 10.123 9.295C10.07 9.205 9.645 8.127 9.477 7.707C9.35 7.27 9.142 7.35 9.01 7.35C8.875 7.35 8.742 7.325 8.61 7.325C8.478 7.325 8.267 7.376 8.09 7.586C7.915 7.796 7.354 8.322 7.354 9.399C7.354 10.477 8.142 11.5 8.26 11.67C8.377 11.805 9.627 13.705 11.5 14.63C11.94 14.827 12.282 14.942 12.547 15.027C12.993 15.172 13.395 15.152 13.725 15.099C14.09 15.039 14.96 14.572 15.143 14.072C15.323 13.572 15.323 13.152 15.257 13.057C15.19 12.962 15.077 12.937 14.87 12.827L15.407 13.075Z"/>
      </svg>
    </a>
  );
};

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
      <WhatsAppButton />
      
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
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Build Your Treatment Plan</h1>
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