import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, CreditCard, Info } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import PaymentForm from '@/components/PaymentForm';
import { getQuoteData } from '@/services/quoteState';
import { QuoteData, ClinicInfo } from '@/types/quote';
import { CLINIC_DATA } from '@/data/clinicData';

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
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">{t('booking.deposit_info', 'Deposit Information')}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {t('booking.deposit_explanation', 'A £200 deposit is required to secure your booking. This amount will be deducted from your final treatment cost.')}
                        </p>
                      </div>
                    </div>
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
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
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
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Info className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700">
                            {t('booking.payment_info', 'Your card will be charged £200 as a deposit. This amount will be deducted from your final treatment cost.')}
                          </p>
                        </div>
                      </div>
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