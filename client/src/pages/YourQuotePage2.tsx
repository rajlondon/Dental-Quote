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
import EditQuoteModal from '@/components/EditQuoteModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import MatchedClinicsPage from '@/pages/MatchedClinicsPage';
import PaymentConfirmationPage from '@/pages/PaymentConfirmationPage';
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
  };

  // Function to proceed to clinic matching
  const handleProceedToClinicMatching = () => {
    if (treatmentItems.length === 0) {
      toast({
        title: "No Treatments Selected",
        description: "Please select at least one treatment to continue.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to matched clinics page with treatment data
    const treatmentData = encodeURIComponent(JSON.stringify(treatmentItems));
    setLocation(`/matched-clinics?treatments=${treatmentData}&city=${selectedCity}&origin=${selectedOrigin}`);
  };

  // Calculate totals
  const totalGBP = treatmentItems.reduce((sum, item) => sum + item.subtotalGBP, 0);
  const totalUSD = treatmentItems.reduce((sum, item) => sum + item.subtotalUSD, 0);

  // Format currency with commas
  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
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
  }, []);

  return (
    <>
      <Navbar />
      <ScrollToTop />

      <main className="min-h-screen bg-gray-50 pt-24 pb-28">
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
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Build Your Treatment Plan</h1>
            <p className="text-gray-600 mb-6">Choose your treatments below to get a clear quote estimate and find matching clinics in Istanbul.</p>
          </div>

          {/* Cost Comparison Summary */}
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
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <p className="text-blue-700 text-sm">
                      Your final treatment quote will be confirmed by your chosen clinic after they've reviewed your dental information.
                      Payment for treatment is only made in-person, after your consultation and examination at the clinic.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Treatment Guide */}
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
                  <div className="mt-6 text-center">
                    <Button 
                      size="lg"
                      onClick={handleProceedToClinicMatching}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                    >
                      Find Matching Clinics
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                    <div className="mt-2 text-center text-sm text-gray-500">
                      See clinics, packages, and complete your booking.
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

          {/* FAQ Section */}
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
                          After building your treatment plan, you'll see matched clinics with detailed quotes. Choose a clinic and pay a £200 deposit to secure your booking. Our team will help with travel arrangements, and you'll pay the remaining balance directly to the clinic after your consultation in Istanbul.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border border-gray-100 rounded-lg mb-4 overflow-hidden">
                      <AccordionTrigger className="text-base font-medium px-4 py-4 hover:bg-blue-50 hover:no-underline">
                        How much can I save compared to UK dental prices?
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 px-4 pt-2 pb-4 bg-gray-50">
                        <p>
                          Patients typically save 50-70% on dental treatment costs in Turkey compared to the UK. For example, a single dental implant might cost £2,000-£3,000 in the UK but only £600-£850 in Istanbul.
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
                          The length of stay depends on your treatment plan. For dental implants, you'll typically need two trips: 3-4 days for the initial implant placement, then 5-7 days for the final restoration after healing (3-6 months later).
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5" className="border border-gray-100 rounded-lg mb-4 overflow-hidden">
                      <AccordionTrigger className="text-base font-medium px-4 py-4 hover:bg-blue-50 hover:no-underline">
                        What about aftercare and guarantees?
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 px-4 pt-2 pb-4 bg-gray-50">
                        <p>
                          All our partner clinics offer guarantees on their work, ranging from 3 to 10 years depending on the treatment and clinic. For aftercare, you'll receive detailed post-treatment instructions, and the clinics provide remote follow-up support.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-6" className="border border-gray-100 rounded-lg overflow-hidden">
                      <AccordionTrigger className="text-base font-medium px-4 py-4 hover:bg-blue-50 hover:no-underline">
                        What if I need follow-up treatment?
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 px-4 pt-2 pb-4 bg-gray-50">
                        <p>
                          Most clinics have partnerships with UK dentists who can provide follow-up care if needed. For more significant issues, our clinics will cover your return flights if treatment is required within the guarantee period.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default YourQuotePage;