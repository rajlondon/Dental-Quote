import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CheckCircle, 
  Calendar, 
  User, 
  Mail, 
  FileText, 
  Info,
  ArrowRight,
  MessageCircle,
  HeartHandshake
} from 'lucide-react';

interface PaymentConfirmationPageProps {
  clinicName?: string;
  treatmentTotalGBP?: number;
  depositAmount?: number;
  onPaymentSuccess?: () => void;
  onCancel?: () => void;
}

const PaymentConfirmationPage: React.FC<PaymentConfirmationPageProps> = ({ 
  clinicName,
  treatmentTotalGBP,
  depositAmount = 200,
  onPaymentSuccess,
  onCancel
}) => {
  const [, setLocation] = useLocation();
  
  // Get patient information from localStorage
  const patientInfoStr = localStorage.getItem('patientInfo');
  const patientInfo = patientInfoStr ? JSON.parse(patientInfoStr) : {
    fullName: 'Patient',
    email: 'patient@example.com'
  };
  
  // Generate a reference number
  const referenceNumber = `MDF-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Store the reference number in localStorage
  useEffect(() => {
    localStorage.setItem('paymentReference', referenceNumber);
  }, [referenceNumber]);
  
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Your £200 deposit has been received and your dental treatment plan is now confirmed.
          </p>
        </div>
        
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Booking Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Patient Name</h3>
                  <p className="font-medium">{patientInfo.fullName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                  <p className="font-medium">{patientInfo.email}</p>
                </div>
              </div>
              
              {clinicName && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Selected Clinic</h3>
                    <p className="font-medium">{clinicName}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reference Number</h3>
                  <p className="font-medium">{referenceNumber}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Deposit Amount</h3>
                  <p className="font-medium">£{depositAmount}</p>
                </div>
              </div>
              
              {treatmentTotalGBP && (
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Estimated Treatment Total</h3>
                    <p className="font-medium">£{treatmentTotalGBP}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Booking Date</h3>
                  <p className="font-medium">{new Date().toLocaleDateString('en-GB')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <HeartHandshake className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="text-green-600 font-medium">Confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3">What Happens Next?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-white rounded-full h-8 w-8 flex items-center justify-center font-semibold text-blue-600 border border-blue-200 shrink-0">1</div>
              <div>
                <h3 className="font-medium">Patient Portal Setup</h3>
                <p className="text-sm text-gray-600 mt-1">
                  You'll receive an email within 24 hours with your login details for the MyDentalFly patient portal.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-white rounded-full h-8 w-8 flex items-center justify-center font-semibold text-blue-600 border border-blue-200 shrink-0">2</div>
              <div>
                <h3 className="font-medium">Dental Specialist Consultation</h3>
                <p className="text-sm text-gray-600 mt-1">
                  You'll be able to schedule your complimentary video consultation with your dental specialist 
                  through the patient portal.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-white rounded-full h-8 w-8 flex items-center justify-center font-semibold text-blue-600 border border-blue-200 shrink-0">3</div>
              <div>
                <h3 className="font-medium">Treatment Planning</h3>
                <p className="text-sm text-gray-600 mt-1">
                  After your consultation, you'll receive a detailed treatment timeline and can choose 
                  your preferred dates for your dental trip.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-white rounded-full h-8 w-8 flex items-center justify-center font-semibold text-blue-600 border border-blue-200 shrink-0">4</div>
              <div>
                <h3 className="font-medium">Travel Arrangement Support</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Our concierge team will assist you with flight, accommodation, and local transport arrangements.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-5 border-green-200 bg-green-50">
            <div className="flex items-start gap-3">
              <User className="h-6 w-6 text-green-600 shrink-0" />
              <div>
                <h3 className="font-semibold">Access Your Patient Portal</h3>
                <p className="text-sm text-gray-700 mt-1 mb-3">
                  Manage your dental treatment, access your records, and communicate with your care team.
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => setLocation('/patient-portal')}
                >
                  Go to Patient Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 border-blue-200 bg-blue-50">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-6 w-6 text-blue-600 shrink-0" />
              <div>
                <h3 className="font-semibold">Contact Our Concierge Team</h3>
                <p className="text-sm text-gray-700 mt-1 mb-3">
                  Have questions about your booking? Our team is here to help you every step of the way.
                </p>
                <Button 
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => setLocation('/contact')}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            A confirmation email has been sent to {patientInfo.email} with all these details.
          </p>
          
          <Button 
            onClick={() => setLocation('/')}
            variant="outline"
            className="mx-auto"
          >
            Return to Homepage
          </Button>
        </div>
      </div>
    </main>
  );
};

export default PaymentConfirmationPage;