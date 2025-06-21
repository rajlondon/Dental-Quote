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
import { Switch } from '@/components/ui/switch';
import MatchedClinicsPage from '@/pages/MatchedClinicsPage';
import PaymentConfirmationPage from '@/pages/PaymentConfirmationPage';
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
  Pencil,
  User
} from 'lucide-react';
import TreatmentPlanBuilder, { TreatmentItem as PlanTreatmentItem } from '@/components/TreatmentPlanBuilder';
import StepByStepTreatmentBuilder from '@/components/StepByStepTreatmentBuilder';
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
import ConsistentPageHeader from '@/components/ConsistentPageHeader';

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
    <Card className="mb-12">
      <CardHeader className="border-b border-gray-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-50">
            <MessageCircle className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            <CardDescription>Everything you need to know about dental treatment in Istanbul</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border border-gray-100 rounded-lg mb-4 overflow-hidden">
                <AccordionTrigger className="text-base font-medium px-4 py-4 hover:bg-blue-50 hover:no-underline">
                  How does the dental tourism process work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 px-4 pt-2 pb-4 bg-gray-50">
                  <p>
                    After submitting your quote request, you'll receive a detailed treatment plan from our partner clinics. Once you choose a clinic, you'll pay a £200 deposit to secure your booking. Our concierge team will help with travel arrangements, and you'll pay the remaining balance directly to the clinic after your consultation in Istanbul.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-gray-100 rounded-lg mb-4 overflow-hidden">
                <AccordionTrigger className="text-base font-medium px-4 py-4 hover:bg-blue-50 hover:no-underline">
                  How much can I save compared to UK dental prices?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 px-4 pt-2 pb-4 bg-gray-50">
                  <p>
                    Patients typically save 50-70% on dental treatment costs in Turkey compared to the UK. For example, a single dental implant might cost £2,000-£3,000 in the UK but only £600-£850 in Istanbul. The exact savings depend on your specific treatment plan.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-gray-100 rounded-lg overflow-hidden">
                <AccordionTrigger className="text-base font-medium px-4 py-4 hover:bg-blue-50 hover:no-underline">
                  Is the £200 deposit refundable?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 px-4 pt-2 pb-4 bg-gray-50">
                  <p>
                    Yes, the £200 deposit is fully refundable if you cancel more than 7 days before your scheduled consultation. If you proceed with treatment, this deposit is deducted from your final treatment cost.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-4" className="border border-gray-100 rounded-lg mb-4 overflow-hidden">
                <AccordionTrigger className="text-base font-medium px-4 py-4 hover:bg-blue-50 hover:no-underline">
                  How long will I need to stay in Istanbul?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 px-4 pt-2 pb-4 bg-gray-50">
                  <p>
                    The length of stay depends on your treatment plan. For dental implants, you'll typically need two trips: 3-4 days for the initial implant placement, then 5-7 days for the final restoration after healing (3-6 months later). For cosmetic treatments like veneers, a single 5-7 day trip is usually sufficient.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-gray-100 rounded-lg mb-4 overflow-hidden">
                <AccordionTrigger className="text-base font-medium px-4 py-4 hover:bg-blue-50 hover:no-underline">
                  What about aftercare and guarantees?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 px-4 pt-2 pb-4 bg-gray-50">
                  <p>
                    All our partner clinics offer guarantees on their work, ranging from 3 to 10 years depending on the treatment and clinic. For aftercare, you'll receive detailed post-treatment instructions, and the clinics provide remote follow-up support. If you have any issues, our UK-based team can help coordinate with the clinic.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-gray-100 rounded-lg overflow-hidden">
                <AccordionTrigger className="text-base font-medium px-4 py-4 hover:bg-blue-50 hover:no-underline">
                  What if I need follow-up treatment?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 px-4 pt-2 pb-4 bg-gray-50">
                  <p>
                    Most clinics have partnerships with UK dentists who can provide follow-up care if needed. For more significant issues, our clinics will cover your return flights if treatment is required within the guarantee period. MyDentalFly's patient care team is also available to assist with any post-treatment concerns.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>


      </CardContent>
    </Card>
  );
};

const YourQuotePage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  // Parse URL query parameters
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));

  const [quoteParams, setQuoteParams] = useState<QuoteParams>({
    treatment: searchParams.get('treatment') || 'Dental Implants',
    travelMonth: searchParams.get('departureDate') 
      ? new Date(searchParams.get('departureDate') || '').toLocaleString('default', { month: 'long' })
      : searchParams.get('travelMonth') || 'Flexible',
    budget: searchParams.get('budget') || '£1,500 - £2,500'
  });

  // Extract additional parameters passed from the Hero search
  const selectedCity = searchParams.get('city') || 'Istanbul';
  const selectedOrigin = searchParams.get('origin') || 'UK';
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');

  // Treatment Plan Builder State
  const [treatmentItems, setTreatmentItems] = useState<PlanTreatmentItem[]>([]);

  // Patient Info State
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);

  // Edit Quote Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Quote steps tracking
  const [currentStep, setCurrentStep] = useState<'build-plan' | 'patient-info' | 'matched-clinics' | 'payment'>('build-plan');
  const [isQuoteReady, setIsQuoteReady] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);

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

    // Only store the treatments, don't auto-advance to the next step
    // The user will click the "Get My Personalised Quote" button to advance manually
  };

  // Function to handle patient info form submission
  const handlePatientInfoSubmit = (data: PatientInfo) => {
    setPatientInfo(data);
    setCurrentStep('matched-clinics');
    setIsQuoteReady(true);

    toast({
      title: "Information Saved",
      description: "Your personal information has been saved successfully.",
    });

    // Scroll to the top of the matched clinics section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to handle clinic selection
  const handleSelectClinic = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    setCurrentStep('payment');

    toast({
      title: "Clinic Selected",
      description: "You've selected a clinic. Proceed to secure your booking.",
    });

    // Scroll to the top of the payment section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to handle payment completion
  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful",
      description: "Your booking is confirmed! You'll be redirected to your patient portal.",
      duration: 5000,
    });

    // Redirect to patient portal after successful payment
    setTimeout(() => {
      setLocation('/patient-portal');
    }, 3000);
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
    if (searchParams.get('name') || searchParams.get('email') || searchParams.get('phone') || departureDate) {
      setPatientInfo({
        fullName: searchParams.get('name') || '',
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        // Use date parameters from search if available
        travelMonth: departureDate 
          ? new Date(departureDate).toLocaleString('default', { month: 'long' })
          : searchParams.get('travelMonth') || '',
        departureCity: selectedOrigin || '',
        // Add required field hotelAccommodation
        hotelAccommodation: 'clinic_decide',
        hasXrays: false,
        hasCtScan: false,
        hasDentalPhotos: false,
        additionalNotesForClinic: '',
        preferredContactMethod: 'email'
      });
    }
  }, []);

  const [activeTab, setActiveTab] = useState('treatment-plan');

  return (
    <>
      <ScrollToTop />

      {/* Consistent Page Header - Always visible across all steps */}
      <ConsistentPageHeader
        title={currentStep === 'build-plan' ? 'Plan Your Dental Treatment' : 
               currentStep === 'patient-info' ? 'Your Information' :
               currentStep === 'matched-clinics' ? 'Your Matched Clinics' :
               'Secure Your Booking'}
        subtitle={currentStep === 'build-plan' ? 'Get personalized quotes from top-rated Istanbul dental clinics' :
                 currentStep === 'patient-info' ? 'Help us create your personalized treatment plan' :
                 currentStep === 'matched-clinics' ? "We've matched your treatment needs with top-rated Istanbul dental clinics" :
                 'Complete your booking with a refundable deposit'}
        showBackButton={currentStep !== 'build-plan'}
        backButtonText={currentStep === 'patient-info' ? 'Back to Treatment Plan' :
                       currentStep === 'matched-clinics' ? 'Back to Your Info' :
                       'Back to Clinics'}
        onBackClick={() => {
          if (currentStep === 'patient-info') {
            setCurrentStep('build-plan');
          } else if (currentStep === 'matched-clinics') {
            setCurrentStep('patient-info');
          } else if (currentStep === 'payment') {
            setCurrentStep('matched-clinics');
          }
        }}
        showLocationInfo={true}
        location={`${searchParams.get('city') || 'Istanbul'}, Turkey`}
        travelDate={searchParams.get('departureDate') ? new Date(searchParams.get('departureDate')!).toLocaleDateString() : undefined}
        showProgress={true}
        currentStep={currentStep === 'build-plan' ? 1 : currentStep === 'patient-info' ? 2 : currentStep === 'matched-clinics' ? 3 : 4 }
        totalSteps={4}
        stepLabels={['Treatment Plan', 'Your Info', 'Clinics', 'Payment']}
      >
        {/* Right side quick actions */}
        <div className="flex flex-col gap-3">
          <Button 
            variant="secondary" 
            size="sm"
            className="bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => {
              toast({
                title: useTranslation().t('quote.call_scheduled', 'Call Scheduled'),
                description: useTranslation().t('quote.call_desc', 'We will call you within 30 minutes to discuss your treatment options.'),
              });
            }}
          >
            <Plane className="h-4 w-4 mr-2" />
            {useTranslation().t('quote.schedule_call', 'Schedule a Call')}
          </Button>

          <div className="text-xs text-blue-100 text-center">
            {useTranslation().t('quote.quick_help', 'Need quick help? Call us directly')}
          </div>
        </div>
      </ConsistentPageHeader>

      <main className="min-h-screen bg-gray-50 pb-28">
        <div className="container mx-auto px-4 pt-6">

          

          {/* Cost Comparison Summary (Added per new spec) */}
          <div className="mb-8">
            <Card>
              <CardHeader className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-50">
                    <Sparkles className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Cost Comparison Summary</CardTitle>
                    <CardDescription>See how much you could save compared to UK dental treatments</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-white border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium text-gray-600">Estimated UK Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        £{formatCurrency(Math.round(totalGBP / 0.35))}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Estimated UK Cost</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium text-green-700">Estimated Istanbul Price</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-700">
                        £{formatCurrency(Math.round(totalGBP))}
                      </p>
                      <p className="text-sm text-green-600 mt-1 font-medium">Save up to 65% compared to UK</p>
                      <p className="text-xs text-green-600 mt-1">Hotel stays often included in treatment packages depending on the cost of your treatment.</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <p className="text-blue-700 text-sm">
                      Your final treatment quote will be confirmed by your chosen clinic after they've reviewed your dental information — including any X-rays, CT scans, or images you provide.

                      Each clinic has its own pricing based on the materials they use and their treatment approach — these details will be discussed with you directly.

                      Please note: Payment for treatment is only made in-person, after your consultation and examination at the clinic — ensuring the treatment plan is accurate, suitable, and fully agreed by you.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="bg-blue-600 text-white rounded-md p-2 mr-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4m0 12v4M2 12h4m12 0h4m-9-9l-3 3m12 12l-3-3M3 3l3 3m12 12l3 3M3 21l3-3m12-12l3-3" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-800">New: Interactive Dental Chart</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Use our new dental chart tool to visually indicate your dental conditions and desired treatments.
                    </p>
                  </div>
                  <a 
                    href="/dental-chart" 
                    className="ml-3 whitespace-nowrap bg-white hover:bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded border border-blue-200 transition-colors"
                  >
                    Open Dental Chart
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Case Studies section removed as requested */}

          {/* Ready to See Clinics CTA has been removed to streamline mobile experience */}

          {/* Header Section */}
          {/* <div className="mb-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-bold mb-3 text-gray-900">Build Your Dental Treatment Quote</h1>
              <p className="text-lg text-gray-700 mb-4">
                Create a personalized quote for dental treatments in Istanbul. Compare prices and find the perfect clinic for your needs.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Instant price comparison</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Verified clinic partners</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Free consultation included</span>
                </div>
              </div>
            </div>
          </div> */}

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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
                  data-step="patient-info"
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
                    ${currentStep === 'matched-clinics' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${!patientInfo ? 'opacity-50' : ''}
                  `}
                  onClick={() => patientInfo && setCurrentStep('matched-clinics')}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${
                    currentStep === 'matched-clinics' ? 'bg-blue-500' : 
                    isQuoteReady ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {isQuoteReady ? <Check className="h-5 w-5" /> : '3'}
                  </div>
                  <div>
                    <p className="font-medium">Matched Clinics</p>
                    <p className="text-xs text-gray-600">
                      {isQuoteReady ? 'View treatment packages' : 'Complete first two steps'}
                    </p>
                  </div>
                </div>

                <div 
                  className={`p-3 rounded-md border flex items-center gap-3 cursor-pointer
                    ${currentStep === 'payment' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${!selectedClinicId ? 'opacity-50' : ''}
                  `}
                  onClick={() => selectedClinicId && setCurrentStep('payment')}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${
                    currentStep === 'payment' ? 'bg-blue-500' : 
                    selectedClinicId ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {selectedClinicId ? <Check className="h-5 w-5" /> : '4'}
                  </div>
                  <div>
                    <p className="font-medium">Payment</p>
                    <p className="text-xs text-gray-600">
                      {selectedClinicId ? 'Secure your booking' : 'Select a clinic first'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Summary section removed as requested */}

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

              <div className="mb-6 bg-blue-50 border border-blue-100 p-3 rounded-md text-sm flex items-center">
                <Info className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                <p>Don't have X-rays or a CT scan? No problem – these can be taken at your consultation in Turkey at no extra cost.</p>
              </div>

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
                    <StepByStepTreatmentBuilder 
                      initialTreatments={treatmentItems}
                      onTreatmentsChange={handleTreatmentPlanChange}
                      onComplete={(dentalChartData, treatments) => {
                        handleTreatmentPlanChange(treatments);
                        setCurrentStep('patient-info');
                        // Scroll to the patient info section
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />

                    {/* Note: Traditional TreatmentPlanBuilder replaced with StepByStepTreatmentBuilder */}

                    {treatmentItems.length > 0 && (
                      <div>
                        {/* Removed redundant "View Matching Clinics" button to simplify UI */}
                        <div className="mt-2 text-center text-sm text-gray-500">
                          See clinics, packages, and complete your booking with a refundable £200 deposit.
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* How Others Built Their Treatment Plan - moved below button as requested */}
              {treatmentItems.length > 0 && (
                <div className="mt-12 mb-10">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4">How Others Built Their Treatment Plan</h2>
                    <p className="text-gray-600 mb-6">Real examples from our patients who found the right dental solutions in Istanbul</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Patient Example 1 */}
                      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-blue-50 p-4">
                          <div className="flex items-center mb-3">
                            <User className="h-10 w-10 p-2 bg-blue-100 text-blue-600 rounded-full mr-3" />
                            <div>
                              <h3 className="font-semibold">Mr. Roberts</h3>
                              <p className="text-sm text-gray-500">London, UK</p>
                            </div>
                          </div>
                          <p className="text-sm">
                            <span className="font-semibold">Treatment Plan:</span> Needed Dental Implants & Bone Graft due to missing teeth and bone loss after extractions.
                          </p>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">3 Dental Implants</span>
                            </div>
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Bone Graft Procedure</span>
                            </div>
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">CT Scan & X-rays</span>
                            </div>
                          </div>
                          <div className="mt-4 text-sm">
                            <p><span className="font-semibold">Istanbul Cost:</span> <span className="text-green-600">£2,200</span></p>
                            <p><span className="font-semibold">Estimated UK Cost:</span> <span className="text-gray-500 line-through">£7,500</span></p>
                            <p className="text-green-600 font-semibold mt-1">Saved over £5,300</p>
                          </div>
                        </div>
                      </div>

                      {/* Patient Example 2 */}
                      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-blue-50 p-4">
                          <div className="flex items-center mb-3">
                            <User className="h-10 w-10 p-2 bg-blue-100 text-blue-600 rounded-full mr-3" />
                            <div>
                              <h3 className="font-semibold">Sarah</h3>
                              <p className="text-sm text-gray-500">Manchester, UK</p>
                            </div>
                          </div>
                          <p className="text-sm">
                            <span className="font-semibold">Treatment Plan:</span> Chose Veneers & Whitening to improve her smile aesthetics.
                          </p>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">8 Porcelain Veneers</span>
                            </div>
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Professional Teeth Whitening</span>
                            </div>
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Digital Smile Design</span>
                            </div>
                          </div>
                          <div className="mt-4 text-sm">
                            <p><span className="font-semibold">Istanbul Cost:</span> <span className="text-green-600">£1,850</span></p>
                            <p><span className="font-semibold">Estimated UK Cost:</span> <span className="text-gray-500 line-through">£5,200</span></p>
                            <p className="text-green-600 font-semibold mt-1">Saved over £3,350</p>
                          </div>
                        </div>
                      </div>

                      {/* Patient Example 3 */}
                      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-blue-50 p-4">
                          <div className="flex items-center mb-3">
                            <User className="h-10 w-10 p-2 bg-blue-100 text-blue-600 rounded-full mr-3" />
                            <div>
                              <h3 className="font-semibold">James</h3>
                              <p className="text-sm text-gray-500">Edinburgh, UK</p>
                            </div>
                          </div>
                          <p className="text-sm">
                            <span className="font-semibold">Treatment Plan:</span> Required Full Mouth Reconstruction due to years of dental neglect.
                          </p>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Full Mouth Reconstruction</span>
                            </div>
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">8 Dental Implants</span>
                            </div>
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">16 Zirconia Crowns</span>
                            </div>
                          </div>
                          <div className="mt-4 text-sm">
                            <p><span className="font-semibold">Istanbul Cost:</span> <span className="text-green-600">£6,500</span></p>
                            <p><span className="font-semibold">Estimated UK Cost:</span> <span className="text-gray-500 line-through">£19,800</span></p>
                            <p className="text-green-600 font-semibold mt-1">Saved over £13,300</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* X-ray note banner */}
                    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-4 flex items-center">
                      <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      <p className="text-sm text-gray-700">
                        Don't have X-rays or a CT scan? No problem. You can upload them later after booking. Many Istanbul clinics provide free X-rays during your first consultation.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                  travelMonth: quoteParams.travelMonth || searchParams.get('travelMonth') || '',
                  // Include the budget information if available
                  additionalNotesForClinic: `Budget Range: ${quoteParams.budget || 'Not specified'}`
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
                  Back to Quote
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Matched Clinics (conditionally displayed) */}
          {currentStep === 'matched-clinics' && patientInfo && (
            <MatchedClinicsPage
              treatmentItems={treatmentItems}
              patientInfo={patientInfo}
              totalGBP={totalGBP}
              onSelectClinic={handleSelectClinic}
              onBackToInfo={() => setCurrentStep('patient-info')}
              onQuoteDownload={() => {
                try {
                  // Get the selected clinic data from localStorage
                  const selectedClinicId = localStorage.getItem('selectedClinicId');
                  const selectedClinicData = localStorage.getItem('selectedClinicData');
                  const clinicData = selectedClinicData ? JSON.parse(selectedClinicData) : null;

                  // Call PDF generation API with clinic-specific data
                  fetch('/api/jspdf-quote-v2', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      items: treatmentItems,
                      totalGBP: totalGBP,
                      patientName: patientInfo?.fullName,
                      patientEmail: patientInfo?.email,
                      patientPhone: patientInfo?.phone,
                      travelMonth: patientInfo?.travelMonth || 'year-round',
                      departureCity: patientInfo?.departureCity || 'UK',
                      selectedClinic: {
                        id: selectedClinicId,
                        name: clinicData?.name,
                        treatments: clinicData?.treatments,
                        totalPrice: clinicData?.totalPrice
                      }
                    }),
                  })
                  .then(response => response.blob())
                  .then(blob => {
                    // Create a download link for the PDF
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;

                    // Generate a formatted filename with date
                    const dateStr = new Date().toISOString().slice(0, 10);
                    const patientName = patientInfo?.fullName?.replace(/\s+/g, '-') || 'patient';
                    const clinicName = clinicData?.name?.replace(/\s+/g, '-') || 'dental-clinic';

                    link.download = `MyDentalFly-Quote-${clinicName}-${patientName}-${dateStr}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    toast({
                      title: "Download Started",
                      description: "Your quote PDF is being downloaded.",
                    });
                  })
                  .catch(error => {
                    console.error('Error generating PDF:', error);
                    toast({
                      title: "Download Failed",
                      description: "There was an error generating your PDF. Please try again.",
                      variant: "destructive"
                    });
                  });
                } catch (error) {
                  console.error('Error preparing PDF data:', error);
                  toast({
                    title: "Download Failed",
                    description: "There was an error preparing your PDF. Please try again.",
                    variant: "destructive"
                  });
                }
              }}
              onEmailQuote={() => {
                try {
                  // Get the selected clinic data from localStorage
                  const selectedClinicId = localStorage.getItem('selectedClinicId');
                  const selectedClinicData = localStorage.getItem('selectedClinicData');
                  const clinicData = selectedClinicData ? JSON.parse(selectedClinicData) : null;

                  // Call email API with clinic-specific data
                  fetch('/api/email-quote', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      items: treatmentItems,
                      totalGBP: totalGBP,
                      patientName: patientInfo?.fullName,
                      patientEmail: patientInfo?.email,
                      patientPhone: patientInfo?.phone,
                      travelMonth: patientInfo?.travelMonth || 'year-round',
                      departureCity: patientInfo?.departureCity || 'UK',
                      selectedClinic: {
                        id: selectedClinicId,
                        name: clinicData?.name,
                        treatments: clinicData?.treatments,
                        totalPrice: clinicData?.totalPrice
                      }
                    }),
                  })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error('Failed to send email');
                    }
                    return response.json();
                  })
                  .then(data => {
                    toast({
                      title: "Quote Sent",
                      description: `Your quote has been sent to ${patientInfo?.email}`,
                    });
                  })
                  .catch(error => {
                    console.error('Error sending email:', error);
                    toast({
                      title: "Email Failed",
                      description: "There was an error sending your email. Please try again.",
                      variant: "destructive"
                    });
                  });
                } catch (error) {
                  console.error('Error preparing email data:', error);
                  toast({
                    title: "Email Failed",
                    description: "There was an error preparing your email. Please try again.",
                    variant: "destructive"
                  });
                }
              }}
            />
          )}

          {/* Step 4: Payment (conditionally displayed) */}
          {currentStep === 'payment' && selectedClinicId && (
            <PaymentConfirmationPage
              clinicName={selectedClinicId === 'clinic1' ? 'Istanbul Dental Care' : 
                         selectedClinicId === 'clinic2' ? 'DentGroup Istanbul' : 
                         'Maltepe Dental Clinic'}
              treatmentTotalGBP={totalGBP}
              depositAmount={200}
              onPaymentSuccess={handlePaymentSuccess}
              onCancel={() => setCurrentStep('matched-clinics')}
            />
          )}

          {/* FAQ Section */}
          <FAQSection />
        </div>

        {/* Sticky footer removed to eliminate duplicate buttons */}
      </main>

      <Footer />
    </>
  );
};

export default YourQuotePage;