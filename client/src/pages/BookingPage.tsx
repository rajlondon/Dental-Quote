import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useRoute } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState as useHookState } from '@hookstate/core';
import { globalQuoteState } from '@/services/quoteState';
import PaymentForm from '@/components/PaymentForm';
import { Check, Shield, Info, AlertCircle, Clock } from 'lucide-react';

interface BookingStep {
  id: string;
  label: string;
  description: string;
  component: React.ReactNode;
}

const BookingPage: React.FC = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute('/booking/:quoteId?');
  const { toast } = useToast();
  const quoteState = useHookState(globalQuoteState);
  
  const [currentStep, setCurrentStep] = useState('info');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  
  const quoteData = quoteState.value || {};
  const quoteId = params?.quoteId || '';
  
  // If no quote data is available, redirect to home
  useEffect(() => {
    if (!quoteData || !quoteData.items || quoteData.items.length === 0) {
      toast({
        title: t('booking.no_quote_data'),
        description: t('booking.start_new_quote'),
        variant: 'destructive',
      });
      setLocation('/');
    }
  }, [quoteData, setLocation, toast, t]);
  
  // Booking steps
  const steps: BookingStep[] = [
    {
      id: 'info',
      label: t('booking.steps.info'),
      description: t('booking.steps.info_desc'),
      component: (
        <div className="space-y-6 py-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {t('booking.info.payment_details')}
                </p>
              </div>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('booking.deposit_details')}</CardTitle>
              <CardDescription>
                {t('booking.deposit_explanation')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">{t('booking.deposit_amount')}</span>
                  <span className="text-lg font-bold">£200.00</span>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{t('booking.deposit_benefit_1')}</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{t('booking.deposit_benefit_2')}</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{t('booking.deposit_benefit_3')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 w-full">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {t('booking.deposit_timeframe')}
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentStep('payment')} 
                className="w-full"
              >
                {t('booking.proceed_to_payment')}
              </Button>
            </CardFooter>
          </Card>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger>{t('booking.faq.refundable')}</AccordionTrigger>
              <AccordionContent>
                {t('booking.faq.refundable_answer')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger>{t('booking.faq.consultation')}</AccordionTrigger>
              <AccordionContent>
                {t('booking.faq.consultation_answer')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger>{t('booking.faq.included')}</AccordionTrigger>
              <AccordionContent>
                {t('booking.faq.included_answer')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ),
    },
    {
      id: 'payment',
      label: t('booking.steps.payment'),
      description: t('booking.steps.payment_desc'),
      component: (
        <div className="space-y-6 py-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3">
              <Card>
                <CardHeader>
                  <CardTitle>{t('booking.payment_details')}</CardTitle>
                  <CardDescription>
                    {t('booking.payment_card_info')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentForm 
                    amount={200} 
                    currency="gbp"
                    email={quoteData.patientEmail || ''}
                    quoteRequestId={quoteId ? parseInt(quoteId, 10) : undefined}
                    onProcessingChange={setIsPaymentProcessing}
                    onPaymentComplete={(success, bookingID) => {
                      setPaymentComplete(success);
                      if (success && bookingID) {
                        setBookingId(bookingID);
                        setCurrentStep('confirmation');
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>{t('booking.order_summary')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>{t('booking.deposit_amount')}</span>
                      <span className="font-medium">£200.00</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Shield className="h-4 w-4 mr-2" />
                      {t('booking.secure_payment')}
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between font-bold">
                        <span>{t('booking.total')}</span>
                        <span>£200.00</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('info')}
                    disabled={isPaymentProcessing}
                    className="w-full"
                  >
                    {t('booking.back_to_info')}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700 font-medium">
                  {t('booking.payment_security_title')}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {t('booking.payment_security_message')}
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'confirmation',
      label: t('booking.steps.confirmation'),
      description: t('booking.steps.confirmation_desc'),
      component: (
        <div className="space-y-6 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('booking.confirmation.success_title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('booking.confirmation.success_message')}
            </p>
            
            <div className="border border-green-200 rounded p-4 bg-white max-w-md mx-auto mb-6">
              <div className="text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('booking.confirmation.booking_id')}</span>
                  <span className="font-medium">#{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('booking.confirmation.amount_paid')}</span>
                  <span className="font-medium">£200.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('booking.confirmation.payment_status')}</span>
                  <span className="text-green-600 font-medium">{t('booking.confirmation.completed')}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                {t('booking.confirmation.next_steps')}
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={() => window.location.href = 'mailto:info@istanbuldentalsmile.com'}>
                  {t('booking.confirmation.contact_us')}
                </Button>
                <Button onClick={() => setLocation('/')}>
                  {t('booking.confirmation.return_home')}
                </Button>
              </div>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('booking.confirmation.what_happens_next')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-gray-200 ml-3 space-y-6">
                <li className="mb-6 ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -left-4 ring-4 ring-white">
                    1
                  </span>
                  <h3 className="font-bold text-gray-900 mb-1">{t('booking.confirmation.step1_title')}</h3>
                  <p className="text-gray-600 text-sm">{t('booking.confirmation.step1_desc')}</p>
                </li>
                <li className="mb-6 ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -left-4 ring-4 ring-white">
                    2
                  </span>
                  <h3 className="font-bold text-gray-900 mb-1">{t('booking.confirmation.step2_title')}</h3>
                  <p className="text-gray-600 text-sm">{t('booking.confirmation.step2_desc')}</p>
                </li>
                <li className="ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -left-4 ring-4 ring-white">
                    3
                  </span>
                  <h3 className="font-bold text-gray-900 mb-1">{t('booking.confirmation.step3_title')}</h3>
                  <p className="text-gray-600 text-sm">{t('booking.confirmation.step3_desc')}</p>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      ),
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const currentStepData = steps.find(step => step.id === currentStep) || steps[0];
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('booking.title')}
          </h1>
          <p className="text-gray-600">
            {t('booking.subtitle')}
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="w-full flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${
                      index <= currentStepIndex ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                    } ${
                      index < currentStepIndex ? 'bg-green-500' : ''
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm mt-2">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Content for current step */}
        <div>
          <h2 className="text-2xl font-bold mb-2">{currentStepData.label}</h2>
          <p className="text-gray-600 mb-6">{currentStepData.description}</p>
          
          {currentStepData.component}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BookingPage;