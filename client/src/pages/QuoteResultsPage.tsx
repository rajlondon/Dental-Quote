import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ClinicImageCarousel from '@/components/ClinicImageCarousel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, ChevronRight, MapPin, Star, Clock, Calendar, Download, Mail, CheckCircle, Pencil } from 'lucide-react';
import { getUKPriceForIstanbulTreatment } from '@/services/ukDentalPriceService';

// Types
interface ClinicInfo {
  id: string;
  name: string;
  tier: 'affordable' | 'mid' | 'premium';
  priceGBP: number;
  priceUSD: number;
  location: string;
  rating: number;
  guarantee: string;
  materials: string[];
  conciergeType: 'ids' | 'clinic';
  features: string[];
  description: string;
}

interface QuoteData {
  items: Array<{
    treatment: string;
    priceGBP: number;
    priceUSD: number;
    quantity: number;
    subtotalGBP: number;
    subtotalUSD: number;
    guarantee: string;
  }>;
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  travelMonth?: string;
  departureCity?: string;
  flightCostGBP?: number;
  flightCostUSD?: number;
  hasLondonConsult?: boolean;
  londonConsultCostGBP?: number;
  londonConsultCostUSD?: number;
  selectedClinicIndex?: number;
}

const CLINIC_DATA: ClinicInfo[] = [
  {
    id: 'istanbul-dental-care',
    name: 'Istanbul Dental Care',
    tier: 'affordable',
    priceGBP: 1550,
    priceUSD: 1999,
    location: 'Şişli, Istanbul',
    rating: 4,
    guarantee: '3-year',
    materials: ['Generic Implants', 'Standard Materials'],
    conciergeType: 'ids',

    features: ['Modern facility', 'English-speaking staff', 'Affordable prices'],
    description: 'A cost-effective option with quality care and modern facilities. Perfect for simple procedures and budget-focused travel with qualified professionals.'
  },
  {
    id: 'dentgroup-istanbul',
    name: 'DentGroup Istanbul',
    tier: 'mid',
    priceGBP: 1950,
    priceUSD: 2499,
    location: 'Kadıköy, Istanbul',
    rating: 4.5,
    guarantee: '5-year',
    materials: ['Straumann Implants', 'Premium Materials'],
    conciergeType: 'ids',

    features: ['Advanced technology', 'Multilingual staff', 'Luxury waiting area'],
    description: 'A balanced option for quality and price with excellent aftercare support. Features newer technology and enhanced patient comfort.'
  },
  {
    id: 'maltepe-dental-clinic',
    name: 'Maltepe Dental Clinic',
    tier: 'premium',
    priceGBP: 2250,
    priceUSD: 2899,
    location: 'Maltepe, Istanbul',
    rating: 5,
    guarantee: '10-year',
    materials: ['Nobel Biocare Implants', 'Premium Zirconia'],
    conciergeType: 'ids',

    features: ['State-of-the-art technology', 'VIP service', 'Luxury facility'],
    description: 'For VIP clients seeking the finest care in a luxury environment. Features the latest technology, premium materials, and fastest results.'
  }
];

// Helper components
const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-600">{rating}</span>
    </div>
  );
};

const TierBadge: React.FC<{ tier: 'affordable' | 'mid' | 'premium' }> = ({ tier }) => {
  const colors = {
    affordable: 'bg-blue-100 text-blue-800',
    mid: 'bg-purple-100 text-purple-800',
    premium: 'bg-gold-100 text-gold-800'
  };

  const labels = {
    affordable: 'Affordable',
    mid: 'Mid-Tier',
    premium: 'Premium'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[tier]}`}>
      {labels[tier]}
    </span>
  );
};

const ClinicCard: React.FC<{ 
  clinic: ClinicInfo, 
  quoteData: QuoteData, 
  isSelected: boolean,
  onSelect: () => void 
}> = ({ clinic, quoteData, isSelected, onSelect }) => {
  const { t } = useTranslation();

  // We show ONLY the treatment price in the clinic card
  // Both flights and consultation costs are shown separately in the quote summary
  const finalPriceGBP = clinic.priceGBP;
  const finalPriceUSD = clinic.priceUSD;

  return (
    <Card className={`relative overflow-hidden mb-6 border-2 ${isSelected ? 'border-primary' : 'border-gray-200'}`}>
      {isSelected && (
        <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-semibold">
          Selected Option
        </div>
      )}
      <div className="flex flex-col md:flex-row">
        {/* Left column - Clinic Image Carousel */}
        <div className="md:w-1/4 h-48 md:h-auto relative overflow-hidden">
          <ClinicImageCarousel clinicId={clinic.id} />
          <div className="absolute top-2 left-2">
            <TierBadge tier={clinic.tier} />
          </div>
        </div>

        {/* Middle column - Clinic details */}
        <div className="md:w-2/4 p-4">
          <div className="flex items-center mb-2">
            <h3 className="text-xl font-bold mr-2">{clinic.name}</h3>
            <RatingStars rating={clinic.rating} />
          </div>

          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{clinic.location}</span>
          </div>

          <p className="text-gray-700 mb-3">{clinic.description}</p>

          <div className="mb-3">
            <h4 className="font-medium text-sm text-gray-700 mb-1">Materials Used:</h4>
            <div className="flex flex-wrap gap-1">
              {clinic.materials.map((material, index) => (
                <Badge key={index} variant="outline" className="text-xs">{material}</Badge>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <h4 className="font-medium text-sm text-gray-700 mb-1">Clinic Features:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
              {clinic.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center text-sm font-medium text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>Guarantee: {clinic.guarantee}</span>
          </div>
        </div>

        {/* Right column - Price and action */}
        <div className="md:w-1/4 p-4 bg-gray-50 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-primary">£{finalPriceGBP}</p>
              <p className="text-sm text-gray-500">${finalPriceUSD}</p>
              <p className="text-xs text-gray-500 mt-1">Treatment price only</p>
            </div>

            <div className="mb-4">
              <div className="flex items-start mb-1">
                <Check className="h-4 w-4 text-green-500 mr-1 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-green-700 font-medium">Small £200 deposit required</span>
              </div>
              <div className="flex items-start mb-1">
                <Check className="h-4 w-4 text-green-500 mr-1 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-green-700 font-medium">No payment until consultation</span>
              </div>
              <div className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-1 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-green-700 font-medium">
                  Concierge by {clinic.conciergeType === 'ids' ? 'Istanbul Dental Smile' : 'clinic'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Button 
              className="w-full mb-2" 
              onClick={onSelect}
              variant={isSelected ? "secondary" : "default"}
            >
              {isSelected ? 'Selected' : 'Select This Clinic'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => window.open('/clinic/' + clinic.id, '_blank')}
            >
              <span>View Details</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const QuoteSummary: React.FC<{ quoteData: QuoteData }> = ({ quoteData }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  // Handle downloading the quote
  const handleDownloadQuote = async () => {
    if (!quoteData) {
      toast({
        title: t('quote_results.error', 'Error'),
        description: t('quote_results.no_quote_data', 'No quote data available. Please create a new quote.'),
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);

    try {
      // Use the server-side API endpoint to generate the PDF
      const response = await fetch('/api/jspdf-quote-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        throw new Error(`Error generating PDF: ${response.statusText}`);
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();

      // Generate a download link for the PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;

      // Generate formatted filename with date
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `MyDentalFly_Quote_${formattedDate}.pdf`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast({
        title: t('quote_results.download_success', 'Download Complete'),
        description: t('quote_results.download_success_message', 'Your quote has been downloaded successfully.'),
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: t('quote_results.download_error', 'Download Failed'),
        description: t('quote_results.download_error_message', 'Failed to generate and download your quote. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle emailing the quote
  const handleEmailQuote = async () => {
    if (!quoteData || !quoteData.patientEmail) {
      toast({
        title: t('quote_results.error', 'Error'),
        description: t('quote_results.no_email', 'No email address available. Please create a new quote with your email.'),
        variant: 'destructive',
      });
      return;
    }

    setIsEmailing(true);

    try {
      // Use the server-side API endpoint to email the quote
      const response = await fetch('/api/email-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: t('quote_results.email_success', 'Email Sent'),
          description: t('quote_results.email_success_message', `Your quote has been sent to ${quoteData.patientEmail}`),
        });
      } else {
        throw new Error(data.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error emailing quote:', error);
      toast({
        title: t('quote_results.email_error', 'Email Failed'),
        description: t('quote_results.email_error_message', 'Failed to email your quote. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsEmailing(false);
    }
  };

  // Calculate the actual total including treatments, flights, and london consult
  // First check if flights are already included in the items array to avoid double-counting
  const hasFlightItem = quoteData.items.some(item => 
    item.treatment.toLowerCase().includes('flight') || 
    item.treatment.toLowerCase().includes('return')
  );

  const treatmentOnlyTotalGBP = quoteData.totalGBP;
  const treatmentOnlyTotalUSD = quoteData.totalUSD;
  // Only add flight costs if they're not already in the items
  const flightCostGBP = hasFlightItem ? 0 : (quoteData.flightCostGBP || 0);
  const flightCostUSD = hasFlightItem ? 0 : (quoteData.flightCostUSD || 0);
  const consultCostGBP = quoteData.hasLondonConsult ? (quoteData.londonConsultCostGBP || 150) : 0;
  const consultCostUSD = quoteData.hasLondonConsult ? (quoteData.londonConsultCostUSD || 193) : 0;
  const actualTotalGBP = treatmentOnlyTotalGBP + flightCostGBP + consultCostGBP;
  const actualTotalUSD = treatmentOnlyTotalUSD + flightCostUSD + consultCostUSD;

  // Calculate UK price comparison using data from our research on UK private dental prices
  // Calculate UK price based on actual UK dental price data for the same treatments
  const calculateUKPrice = () => {
    let ukTotal = 0;

    // Only count actual dental treatments (not flights or consultation)
    for (const item of quoteData.items) {
      // Skip if the item is about flights or consultation
      if (!item.treatment.toLowerCase().includes('flight') && 
          !item.treatment.toLowerCase().includes('consultation')) {
        // Get the UK price for this treatment
        const ukPrice = getUKPriceForIstanbulTreatment(item.treatment);
        if (ukPrice > 0) {
          // Multiply by quantity
          ukTotal += ukPrice * item.quantity;
        } else {
          // If no exact match found, use the 2.8x multiplier as fallback
          ukTotal += item.priceGBP * 2.8 * item.quantity;
        }
      }
    }

    return Math.round(ukTotal);
  };

  const ukTreatmentPrice = calculateUKPrice();
  const savingsAmount = ukTreatmentPrice - treatmentOnlyTotalGBP;
  const savingsPercentage = Math.round((savingsAmount / ukTreatmentPrice) * 100);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">Your Quote Summary</h3>

      <div className="mb-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Patient Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{quoteData.patientName || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{quoteData.patientEmail || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{quoteData.patientPhone || 'Not provided'}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Treatment Details</h4>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Treatment</th>
              <th className="text-right p-2">Qty</th>
              <th className="text-right p-2">Price (£)</th>
              <th className="text-right p-2">Subtotal (£)</th>
            </tr>
          </thead>
          <tbody>
            {quoteData.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">
                  {item.treatment}
                  {item.treatment.toLowerCase().includes('flight') && (
                    <span className="block text-xs text-gray-500 italic">
                      *Average estimate for {quoteData.travelMonth}
                    </span>
                  )}
                </td>
                <td className="text-right p-2">{item.quantity}</td>
                <td className="text-right p-2">£{item.priceGBP}</td>
                <td className="text-right p-2">£{item.subtotalGBP}</td>
              </tr>
            ))}
            {/* Flight cost is already included in items array, no need to show it separately */}
            {quoteData.hasLondonConsult && (
              <tr className="border-b bg-gray-50">
                <td className="p-2">London Consultation</td>
                <td className="text-right p-2">1</td>
                <td className="text-right p-2">£{quoteData.londonConsultCostGBP || 150}</td>
                <td className="text-right p-2">£{quoteData.londonConsultCostGBP || 150}</td>
              </tr>
            )}
          </tbody>
          <tfoot className="font-medium">
            <tr className="bg-gray-100">
              <td colSpan={3} className="p-2 text-right">Total (GBP)</td>
              <td className="p-2 text-right">£{actualTotalGBP}</td>
            </tr>
            <tr>
              <td colSpan={3} className="p-2 text-right">Total (USD)</td>
              <td className="p-2 text-right">${actualTotalUSD}</td>
            </tr>
            {(flightCostGBP > 0 || consultCostGBP > 0) && (
              <tr>
                <td colSpan={4} className="p-2 text-xs text-center text-gray-500 italic">
                  *Total includes treatment costs {flightCostGBP > 0 ? ', estimated flights' : ''} 
                  {consultCostGBP > 0 ? ' and London consultation' : ''}
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      {/* UK Price Comparison */}
      <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-lg">
        <h4 className="font-medium text-sm text-gray-700 mb-3">UK Price Comparison</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">UK Average Cost:</span>
            <span className="font-medium">£{ukTreatmentPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Your Istanbul Price:</span>
            <span className="font-medium">£{treatmentOnlyTotalGBP}</span>
          </div>
          <div className="h-px bg-green-200 my-2"></div>
          <div className="flex justify-between text-green-700 font-bold">
            <span>Your Savings:</span>
            <span>£{savingsAmount} ({savingsPercentage}%)</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          *UK costs based on average private clinic rates in London and Manchester
        </p>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Travel Information</h4>
        <div className="flex flex-wrap">
          {quoteData.travelMonth && (
            <div className="mr-6 mb-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">Preferred Month</span>
              </div>
              <p className="font-medium">{quoteData.travelMonth}</p>
            </div>
          )}
          {quoteData.departureCity && (
            <div className="mr-6 mb-2">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">Departure City</span>
              </div>
              <p className="font-medium">{quoteData.departureCity}</p>
            </div>
          )}
        </div>
        <div className="mt-2 p-3 bg-blue-50 rounded-md text-xs text-blue-700">
          <p className="flex items-start">
            <svg className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="8" />
            </svg>
            <span>
              Flight costs are estimated averages based on your selected travel month. 
              Actual prices will vary based on booking time, airline, and availability. 
              Our concierge team can help you find the best available flights for your travel dates.
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button 
          className="flex items-center bg-blue-600 text-white hover:bg-blue-700 px-6 py-5 h-auto text-base font-medium rounded-md"
          onClick={handleDownloadQuote}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <div className="h-5 w-5 mr-2 animate-spin rounded-full border-b-2 border-white" />
              {t('quote_results.downloading', 'Downloading...')}
            </>
          ) : (
            <>
              <Download className="h-5 w-5 mr-2" />
              {t('quote_results.download_quote', 'Download Your Custom PDF Quote')}
            </>
          )}
        </Button>
        <Button 
          className="flex items-center bg-blue-600 text-white hover:bg-blue-700 px-6 py-5 h-auto text-base font-medium rounded-md"
          onClick={handleEmailQuote}
          disabled={isEmailing}
        >
          {isEmailing ? (
            <>
              <div className="h-5 w-5 mr-2 animate-spin rounded-full border-b-2 border-white" />
              {t('quote_results.emailing', 'Sending Email...')}
            </>
          ) : (
            <>
              <Mail className="h-5 w-5 mr-2" />
              {t('quote_results.email_quote', 'Email Your Custom PDF Quote')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Add this helper function for clinic mapping
const getClinicByPromoCode = (clinicId: number) => {
  const clinics = {
    1: {
      name: "Istanbul Dental Care",
      location: "Maltepe District, Istanbul", 
      rating: "⭐⭐⭐⭐",
      guarantee: "3 Years",
      type: "Affordable"
    },
    2: {
      name: "DentGroup Istanbul", 
      location: "Şişli District, Istanbul",
      rating: "⭐⭐⭐⭐½", 
      guarantee: "5 Years",
      type: "Mid-Tier"
    },
    3: {
      name: "Vera Smile",
      location: "Levent District, Istanbul",
      rating: "⭐⭐⭐⭐⭐",
      guarantee: "10 Years", 
      type: "Premium"
    }
  };

  return clinics[clinicId as keyof typeof clinics];
};

const QuoteResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedClinicIndex, setSelectedClinicIndex] = useState<number | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  
  // Add these state variables for promo code support
  const [hasPromoCode, setHasPromoCode] = useState(false);
  const [promoCodeInfo, setPromoCodeInfo] = useState<{
    code: string;
    discount: number;
    originalTotal: number;
    clinicId?: number;
  } | null>(null);
  
  // Simplified step management
  const [showClinics, setShowClinics] = useState(false);
  const [treatmentItems, setTreatmentItems] = useState<any[]>([]);
  const [totalGBP, setTotalGBP] = useState(0);

  // Load quote data from localStorage in useEffect
  useEffect(() => {
    // Load quote data from localStorage (from PriceCalculator)
    const savedQuoteData = localStorage.getItem("quoteData");
    if (savedQuoteData) {
      try {
        const parsedData = JSON.parse(savedQuoteData);
        setQuoteData(parsedData);
        setSelectedClinicIndex(parsedData.selectedClinicIndex || 0);
        
        // Set treatment items and show clinics
        if (parsedData.items) {
          setTreatmentItems(parsedData.items);
          setTotalGBP(parsedData.totalGBP || 0);
          setShowClinics(true);
        }
        
        // Check for promo code information
        if (parsedData.promoCode) {
          setHasPromoCode(true);
          setPromoCodeInfo({
            code: parsedData.promoCode,
            discount: parsedData.promoDiscount || 0,
            originalTotal: parsedData.originalTotal || parsedData.totalGBP,
            clinicId: parsedData.clinicId
          });
          
          console.log("Loaded promo code from quote data:", parsedData.promoCode);
        }
      } catch (error) {
        console.error("Error loading quote data:", error);
        // Fallback to dummy data
        setDummyData();
      }
    } else {
      // Set dummy data for development
      setDummyData();
    }
  }, []);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString();
  };

  const setDummyData = () => {
    // This is just for development - in production, this data would come from the form
    const dummyData: QuoteData = {
      items: [
        {
          treatment: 'Dental Implant',
          priceGBP: 550,
          priceUSD: 707,
          quantity: 2,
          subtotalGBP: 1100,
          subtotalUSD: 1414,
          guarantee: '5-year'
        },
        {
          treatment: 'Dental Crown',
          priceGBP: 175,
          priceUSD: 225,
          quantity: 4,
          subtotalGBP: 700,
          subtotalUSD: 900,
          guarantee: '3-year'
        },
        {
          treatment: 'Return Flights (London to Istanbul)',
          priceGBP: 220,
          priceUSD: 283,
          quantity: 1,
          subtotalGBP: 220,
          subtotalUSD: 283,
          guarantee: 'N/A'
        },
      ],
      // totalGBP should only include the cost of treatments (not flights or consultation)
      totalGBP: 1800,
      totalUSD: 2314,
      patientName: 'John Doe',
      patientEmail: 'john.doe@example.com',
      patientPhone: '+44 7123 456789',
      travelMonth: 'July',
      departureCity: 'London',
      flightCostGBP: 220,
      flightCostUSD: 283,
      hasLondonConsult: true,
      londonConsultCostGBP: 150,
      londonConsultCostUSD: 193,
    };

    setQuoteData(dummyData);
    setSelectedClinicIndex(0);
  };

  // Function to handle treatment plan changes
  const handleTreatmentPlanChange = (items: any[]) => {
    setTreatmentItems(items);
    
    // Automatically show clinics when treatments are added
    if (items.length > 0) {
      setShowClinics(true);
      toast({
        title: "Treatments Added!",
        description: "Scroll down to see available clinics for your treatments.",
      });
      
      // Smooth scroll to clinics section after a brief delay
      setTimeout(() => {
        const clinicsSection = document.getElementById('clinics-section');
        if (clinicsSection) {
          clinicsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500);
    } else {
      setShowClinics(false);
    }
  };

  // Simplified clinic selection
  const handleSelectClinic = (index: number) => {
    setSelectedClinicIndex(index);

    // In a real implementation, we would update the quote data with the selected clinic
    if (quoteData) {
      const updatedQuoteData = {
        ...quoteData,
        selectedClinicIndex: index
      };

      // Save to localStorage for development purposes
      localStorage.setItem('quoteData', JSON.stringify(updatedQuoteData));

      toast({
        title: "Clinic Selected",
        description: `You've selected ${CLINIC_DATA[index].name}. Scroll down to complete your booking.`,
      });
      
      // Scroll to final booking section
      setTimeout(() => {
        const bookingSection = document.getElementById('booking-section');
        if (bookingSection) {
          bookingSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500);
    }
  };

  const handleProceedBooking = () => {
    // Save the current quote data to global state
    if (quoteData) {
      import('@/services/quoteState').then(({ setQuoteData }) => {
        setQuoteData(quoteData);

        // Redirect to the booking page - for now without specific quote ID
        setLocation(`/booking`);

        toast({
          title: t('quote_results.proceeding_to_booking', 'Proceeding to booking'),
          description: t('quote_results.deposit_info', 'You will be required to pay a £200 deposit to secure your booking.'),
        });
      });
    } else {
      toast({
        title: t('quote_results.error', 'Error'),
        description: t('quote_results.no_quote_data', 'No quote data available. Please create a new quote.'),
        variant: 'destructive',
      });
    }
  };

  if (!quoteData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your quote...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ScrollToTop />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Simplified Progress tracker */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {/* Promo Code Success Banner */}
              {hasPromoCode && promoCodeInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-2 mr-4">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">
                          🎉 Promo Code Applied Successfully!
                        </h3>
                        <p className="text-green-700">
                          Code "{promoCodeInfo.code}" - You saved £{promoCodeInfo.discount?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600">Original Price</div>
                      <div className="text-lg line-through text-gray-500">
                        £{promoCodeInfo.originalTotal?.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">Your Price</div>
                      <div className="text-2xl font-bold text-green-700">
                        £{quoteData?.totalGBP?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {hasPromoCode ? "Your Special Offer Quote" : "Your Dental Treatment Quote"}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {hasPromoCode 
                      ? "Review your discounted quote and select your preferred clinic" 
                      : "Compare clinics and select your preferred option"
                    }
                  </p>
                </div>
                
                {treatmentItems.length > 0 && (
                  <div className="mt-4 sm:mt-0">
                    <div className="bg-blue-50 py-2 px-4 rounded-md">
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-gray-700">Current Total:</span>
                        <span className="font-bold">£{formatCurrency(Math.round(totalGBP))}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Final quote includes clinic selection
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Simple progress indicator */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: treatmentItems.length > 0 ? '100%' : '20%' }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Start</span>
                <span>{treatmentItems.length > 0 ? 'Ready for booking!' : 'Loading treatments...'}</span>
              </div>
            </div>
          </div>

          {/* Show clinic selection when treatments are available */}
          {showClinics && treatmentItems.length > 0 && (
            <div id="clinics-section" className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                    {hasPromoCode && promoCodeInfo?.clinicId 
                      ? "Your Selected Clinic (Promo Code Applied)" 
                      : "Choose Your Clinic"
                    }
                  </CardTitle>
                  <CardDescription>
                    {hasPromoCode && promoCodeInfo?.clinicId
                      ? "This promo code locks you to this specific clinic for the discount."
                      : `Select a clinic for your ${treatmentItems.length} treatment${treatmentItems.length > 1 ? 's' : ''}`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {CLINIC_DATA.map((clinic, index) => (
                      <ClinicCard 
                        key={clinic.id}
                        clinic={clinic}
                        quoteData={quoteData}
                        isSelected={selectedClinicIndex === index}
                        onSelect={() => handleSelectClinic(index)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Show final booking section when clinic is selected */}
          {selectedClinicIndex !== null && treatmentItems.length > 0 && (
            <div id="booking-section" className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    Complete Your Booking
                  </CardTitle>
                  <CardDescription>
                    Review your selections and proceed with your booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <QuoteSummary quoteData={quoteData} />
                    </div>
                    <div className="lg:col-span-1">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-bold text-green-800 mb-2">Ready to proceed?</h3>
                        <p className="text-green-700 text-sm mb-4">
                          You've selected {CLINIC_DATA[selectedClinicIndex].name}. Click below to start the booking process.
                        </p>
                        <Button 
                          className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium"
                          onClick={handleProceedBooking}
                        >
                          <ChevronRight className="ml-2 h-4 w-4" />
                          {t('quote_results.proceed_booking', 'Proceed to Booking')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <section className="my-12">
            <h2 className="text-2xl font-bold mb-4">{t('quote_results.why_choose_us', 'Why Choose Istanbul Dental Smile?')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('quote_results.benefits.quality', 'Quality Assurance')}</h3>
                <p className="text-gray-600">{t('quote_results.benefits.quality_desc', 'All our partner clinics are vetted for excellence, modern equipment, and strict hygiene protocols.')}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('quote_results.benefits.savings', 'Significant Savings')}</h3>
                <p className="text-gray-600">{t('quote_results.benefits.savings_desc', 'Save up to 70% compared to UK costs without compromising on quality or safety.')}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('quote_results.benefits.support', 'Full Concierge Support')}</h3>
                <p className="text-gray-600">{t('quote_results.benefits.support_desc', 'From airport pickup to hotel arrangements and translations, we handle everything for a stress-free experience.')}</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t('quote_results.frequently_asked', 'Frequently Asked Questions')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-2">{t('quote_results.faq.payment', 'How do I pay for my treatment?')}</h3>
                <p className="text-gray-600">{t('quote_results.faq.payment_answer', 'We require a £200 deposit to secure your appointment, which is deducted from your final treatment cost. The remaining balance is paid directly to the clinic on the day of your treatment, after your consultation confirms the treatment plan.')}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-2">{t('quote_results.faq.travel', 'What about travel arrangements?')}</h3>
                <p className="text-gray-600">{t('quote_results.faq.travel_answer', 'We can help arrange your entire trip, including flights, accommodation, and transfers. Our concierge service ensures you have a seamless experience from start to finish.')}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-2">{t('quote_results.faq.guarantee', 'Are treatments guaranteed?')}</h3>
                <p className="text-gray-600">{t('quote_results.faq.guarantee_answer', 'Yes, all treatments come with guarantees as indicated in your quote. These guarantees are honored internationally, and we work only with clinics that stand behind their work.')}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-2">{t('quote_results.faq.xrays', 'What if my treatment needs change after X-rays?')}</h3>
                <p className="text-gray-600">{t('quote_results.faq.xrays_answer', 'After reviewing your X-rays, the dentist might recommend adjustments to your treatment plan. Any changes will be discussed with you before proceeding, and you will receive an updated quote reflecting these adjustments.')}</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default QuoteResultsPage;