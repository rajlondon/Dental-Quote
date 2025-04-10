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
import { Check, ChevronRight, MapPin, Star, Clock, Calendar, Download, Mail, Info as InfoIcon } from 'lucide-react';

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
  
  // Calculate UK price comparison (2.8x higher than Istanbul) but only based on treatment cost
  const calculateUKPrice = (istanbulPrice: number) => Math.round(istanbulPrice * 2.8);
  const ukTreatmentPrice = calculateUKPrice(treatmentOnlyTotalGBP);
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
          *UK prices based on average private clinic rates in London and Manchester
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
      
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Download Quote
        </Button>
        <Button variant="outline" className="flex items-center">
          <Mail className="h-4 w-4 mr-2" />
          Email Quote
        </Button>
      </div>
    </div>
  );
};

const QuoteResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedClinicIndex, setSelectedClinicIndex] = useState<number | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  
  // Simulated quote data (in real implementation, this would come from the form submission)
  useEffect(() => {
    // Try to get data from localStorage (for development purposes)
    const savedQuoteData = localStorage.getItem('quoteData');
    
    if (savedQuoteData) {
      try {
        const parsedData = JSON.parse(savedQuoteData);
        setQuoteData(parsedData);
        setSelectedClinicIndex(parsedData.selectedClinicIndex || 0);
      } catch (error) {
        console.error('Error parsing saved quote data:', error);
        // Fallback to dummy data
        setDummyData();
      }
    } else {
      // Set dummy data for development
      setDummyData();
    }
  }, []);
  
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
        description: `You've selected ${CLINIC_DATA[index].name} as your preferred clinic.`,
      });
    }
  };
  
  const handleProceedBooking = () => {
    // Here we would implement the booking flow
    toast({
      title: "Proceeding to Booking",
      description: "This would take you to the booking/deposit page in a real implementation.",
    });
    
    // In a real implementation, we would redirect to a booking page
    // setLocation('/booking');
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
          <header className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('quote_results.title', 'Your Dental Treatment Quote')}</h1>
                <p className="text-gray-600">
                  {t('quote_results.subtitle', 'Compare clinics and select your preferred option')}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                {selectedClinicIndex !== null && (
                  <Button 
                    size="lg" 
                    className="flex items-center"
                    onClick={handleProceedBooking}
                  >
                    {t('quote_results.proceed_booking', 'Proceed to Booking')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    {t('quote_results.disclaimer', 'This quote is based on the information you provided. After an X-ray (which we can arrange), your final treatment plan and price will be confirmed — usually within ±10% of this quote.')}
                  </p>
                </div>
              </div>
            </div>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{t('quote_results.clinic_comparison', 'Clinic Comparison')}</h2>
                
                {CLINIC_DATA.map((clinic, index) => (
                  <ClinicCard 
                    key={clinic.id}
                    clinic={clinic}
                    quoteData={quoteData}
                    isSelected={selectedClinicIndex === index}
                    onSelect={() => handleSelectClinic(index)}
                  />
                ))}
              </section>
            </div>
            
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <QuoteSummary quoteData={quoteData} />
                
                {selectedClinicIndex !== null && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-bold text-green-800 mb-2">Ready to proceed?</h3>
                    <p className="text-green-700 text-sm mb-4">You've selected {CLINIC_DATA[selectedClinicIndex].name}. Click below to start the booking process.</p>
                    <Button 
                      className="w-full"
                      onClick={handleProceedBooking}
                    >
                      {t('quote_results.proceed_booking', 'Proceed to Booking')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
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
                <p className="text-gray-600">{t('quote_results.benefits.savings_desc', 'Save up to 70% compared to UK prices without compromising on quality or safety.')}</p>
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