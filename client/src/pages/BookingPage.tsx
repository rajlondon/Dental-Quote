import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Check, ArrowLeft, CreditCard, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import PaymentForm from '@/components/PaymentForm';
import { getQuoteData } from '@/services/quoteState';
import { QuoteData, ClinicInfo } from '@/types/quote';

// Import clinic data directly since we're having path issues
const CLINIC_DATA: ClinicInfo[] = [
  {
    id: "istanbul-dental-care",
    name: "Istanbul Dental Care",
    tier: "affordable",
    priceGBP: 1700,
    priceUSD: 2190,
    location: "Şişli, Istanbul",
    rating: 4.7,
    guarantee: "5 years",
    materials: ["Standard implants", "E.max crowns", "Quality materials"],
    conciergeType: "ids",
    features: [
      "Modern equipment",
      "English-speaking staff",
      "City center location",
      "Transparent pricing"
    ],
    description: "A reliable clinic with a focus on affordability without compromising on quality. Their team of skilled dentists provides excellent care in a comfortable environment."
  },
  {
    id: "dentgroup-istanbul",
    name: "DentGroup Istanbul",
    tier: "mid",
    priceGBP: 2100,
    priceUSD: 2700,
    location: "Nişantaşı, Istanbul",
    rating: 4.9,
    guarantee: "7 years",
    materials: ["Premium implants", "Zirconia crowns", "High-grade materials"],
    conciergeType: "ids",
    features: [
      "Award-winning clinic",
      "Multilingual staff",
      "Luxury location",
      "VIP treatment options",
      "Complimentary consultations"
    ],
    description: "A prestigious dental center with an excellent reputation for treating international patients. Their expert team uses cutting-edge technology to deliver exceptional results."
  },
  {
    id: "maltepe-dental-clinic",
    name: "Maltepe Dental Clinic",
    tier: "premium",
    priceGBP: 875,
    priceUSD: 1120,
    location: "Maltepe, Istanbul",
    rating: 5.0,
    guarantee: "10 years",
    materials: ["Premium Swiss implants", "Full-ceramic restorations", "Top-tier materials"],
    conciergeType: "clinic",
    features: [
      "Celebrity-choice clinic",
      "Exclusive private care",
      "Advanced technology",
      "Luxury patient experience",
      "Door-to-door service",
      "Extended warranties"
    ],
    description: "The premium choice for those seeking the absolute best in dental care. This exclusive clinic offers unparalleled service, the most advanced treatments, and a truly luxurious experience."
  }
];

const BookingPage: React.FC = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<ClinicInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState<'info' | 'payment'>('info');

  useEffect(() => {
    // Get quote data from state management
    const data = getQuoteData();
    
    if (data) {
      setQuoteData(data);
      
      // Get selected clinic if available
      if (data.selectedClinicIndex !== undefined && CLINIC_DATA[data.selectedClinicIndex]) {
        setSelectedClinic(CLINIC_DATA[data.selectedClinicIndex]);
      }
      
      setIsLoading(false);
    } else {
      // No data available, try to get from localStorage as fallback
      try {
        const savedData = localStorage.getItem('quoteData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setQuoteData(parsedData);
          
          if (parsedData.selectedClinicIndex !== undefined && CLINIC_DATA[parsedData.selectedClinicIndex]) {
            setSelectedClinic(CLINIC_DATA[parsedData.selectedClinicIndex]);
          }
          
          setIsLoading(false);
        } else {
          // No data in localStorage either
          toast({
            title: t('booking.error', 'Error'),
            description: t('booking.no_quote_data', 'No quote data available. Please create a new quote.'),
            variant: 'destructive',
          });
          setLocation('/'); // Redirect to home to start over
        }
      } catch (error) {
        console.error('Error retrieving quote data:', error);
        toast({
          title: t('booking.error', 'Error'),
          description: t('booking.data_error', 'Error retrieving quote data. Please try again.'),
          variant: 'destructive',
        });
        setLocation('/'); // Redirect to home to start over
      }
    }
  }, [t, setLocation, toast]);

  const handleBackToQuote = () => {
    setLocation('/your-quote');
  };

  const handleProceedToPayment = () => {
    setBookingStep('payment');
  };

  const handlePaymentSuccess = () => {
    toast({
      title: t('booking.payment_success', 'Payment Successful'),
      description: t('booking.booking_confirmed', 'Your booking has been confirmed. We will contact you shortly.'),
    });
    // In a real implementation, we would save the booking in the database, send confirmation emails, etc.
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('booking.loading', 'Loading booking information...')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ScrollToTop />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline"
            className="mb-6"
            onClick={handleBackToQuote}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('booking.back_to_quote', 'Back to Quote')}
          </Button>

          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('booking.title', 'Complete Your Booking')}</h1>
            <p className="text-gray-600">
              {t('booking.subtitle', 'Secure your dental treatment with a £200 deposit')}
            </p>
          </header>

          {bookingStep === 'info' ? (
            <section className="mb-10">
              <Card>
                <CardHeader>
                  <CardTitle>{t('booking.booking_details', 'Booking Details')}</CardTitle>
                  <CardDescription>
                    {t('booking.review_details', 'Please review your booking details before proceeding to payment')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-lg mb-3">{t('booking.your_information', 'Your Information')}</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {quoteData?.patientName}</p>
                        <p><span className="font-medium">Email:</span> {quoteData?.patientEmail}</p>
                        <p><span className="font-medium">Phone:</span> {quoteData?.patientPhone}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-3">{t('booking.selected_clinic', 'Selected Clinic')}</h3>
                      {selectedClinic ? (
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Clinic:</span> {selectedClinic.name}</p>
                          <p><span className="font-medium">Location:</span> {selectedClinic.location}</p>
                          <p><span className="font-medium">Price:</span> £{quoteData?.totalGBP}</p>
                        </div>
                      ) : (
                        <p className="text-yellow-600">
                          {t('booking.no_clinic', 'No clinic selected. Please return to your quote and select a clinic.')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 text-lg mb-3">{t('booking.deposit_info', 'Pay £200 today to reserve your treatment')}</h3>
                    <p className="text-blue-700 mb-4">
                      {t('booking.deposit_explanation', 'This guarantees your journey can begin. The £200 deposit is deducted from your final treatment cost.')}
                    </p>
                    
                    <h4 className="font-medium text-blue-800 mb-2">{t('booking.after_payment', 'After payment, you\'ll have access to your personal client portal to:')}</h4>
                    <ul className="space-y-3 text-blue-700">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-blue-600" />
                        </span>
                        <span>{t('booking.benefit1', 'Chat directly with your clinic')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-blue-600" />
                        </span>
                        <span>{t('booking.benefit2', 'Upload X-rays or Documents')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-blue-600" />
                        </span>
                        <span>{t('booking.benefit3', 'Confirm your Treatment Plan')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-blue-600" />
                        </span>
                        <span>{t('booking.benefit4', 'Arrange Travel & Appointments')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-blue-600" />
                        </span>
                        <span>{t('booking.benefit5', 'Have Aftercare Support')}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium text-lg">{t('booking.what_happens_next', 'What Happens Next?')}</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </span>
                        <span className="text-sm">{t('booking.step1', 'We\'ll review your quote details and X-rays (if provided)')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </span>
                        <span className="text-sm">{t('booking.step2', 'Our team will contact you within 24 hours to discuss your treatment plan')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </span>
                        <span className="text-sm">{t('booking.step3', 'We\'ll help arrange your travel, accommodation, and clinic appointments')}</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between flex-wrap gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBackToQuote}
                  >
                    {t('booking.back_to_quote', 'Back to Quote')}
                  </Button>
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={!selectedClinic}
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-6 py-6 h-auto text-base font-medium"
                  >
                    <CreditCard className="h-5 w-5 mr-1" />
                    {t('booking.proceed_to_payment', 'Proceed to Payment')}
                  </Button>
                </CardFooter>
              </Card>
            </section>
          ) : (
            <section className="mb-10">
              <Card>
                <CardHeader>
                  <CardTitle>{t('booking.payment_title', 'Secure Payment')}</CardTitle>
                  <CardDescription>
                    {t('booking.payment_description', 'Pay your £200 deposit to secure your booking')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                      <h3 className="font-semibold text-blue-800 text-lg mb-3">{t('booking.deposit_info', 'Pay £200 today to reserve your treatment')}</h3>
                      <p className="text-blue-700 mb-4">
                        {t('booking.deposit_explanation', 'This guarantees your journey can begin. The £200 deposit is deducted from your final treatment cost.')}
                      </p>
                      
                      <h4 className="font-medium text-blue-800 mb-2">{t('booking.after_payment', 'After payment, you\'ll have access to your personal client portal to:')}</h4>
                      <ul className="space-y-3 text-blue-700">
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <Check className="h-3.5 w-3.5 text-blue-600" />
                          </span>
                          <span>{t('booking.benefit1', 'Chat directly with your clinic')}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <Check className="h-3.5 w-3.5 text-blue-600" />
                          </span>
                          <span>{t('booking.benefit2', 'Upload X-rays or Documents')}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <Check className="h-3.5 w-3.5 text-blue-600" />
                          </span>
                          <span>{t('booking.benefit3', 'Confirm your Treatment Plan')}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <Check className="h-3.5 w-3.5 text-blue-600" />
                          </span>
                          <span>{t('booking.benefit4', 'Arrange Travel & Appointments')}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <Check className="h-3.5 w-3.5 text-blue-600" />
                          </span>
                          <span>{t('booking.benefit5', 'Have Aftercare Support')}</span>
                        </li>
                      </ul>
                    </div>
                    
                    {quoteData?.patientEmail && (
                      <PaymentForm
                        email={quoteData.patientEmail}
                        onSuccess={handlePaymentSuccess}
                      />
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    onClick={() => setBookingStep('info')}
                    className="w-full sm:w-auto"
                  >
                    {t('booking.back_to_booking_details', 'Back to Booking Details')}
                  </Button>
                </CardFooter>
              </Card>
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default BookingPage;