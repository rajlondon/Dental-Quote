import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Clock, 
  LifeBuoy, 
  MessageCircle, 
  Calendar, 
  Building, 
  User, 
  FileText,
  CreditCard
} from 'lucide-react';
import { TreatmentItem } from '@/components/TreatmentPlanBuilder';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StripePaymentWrapper from '@/components/payment/StripePaymentWrapper';

interface DepositPaymentPageProps {
  treatmentItems?: TreatmentItem[];
  clinicId?: string;
  patientName?: string;
}

const DepositPaymentPage: React.FC<DepositPaymentPageProps> = ({ 
  treatmentItems = [], 
  clinicId, 
  patientName 
}) => {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const { toast } = useToast();
  
  // Get data from localStorage if not provided via props
  const storedTreatments = localStorage.getItem('treatmentPlan');
  const treatments = treatmentItems.length > 0 
    ? treatmentItems 
    : (storedTreatments ? JSON.parse(storedTreatments) : []);
  
  const storedClinicId = localStorage.getItem('selectedClinic');
  const selectedClinicId = clinicId || storedClinicId;
  
  // Get patient info from localStorage
  const patientInfoStr = localStorage.getItem('patientInfo');
  const patientInfo = patientInfoStr ? JSON.parse(patientInfoStr) : {};
  
  const totalAmount = treatments.reduce((sum: number, item: any) => sum + item.subtotalGBP, 0);
  const depositAmount = 200; // £200 fixed deposit
  
  const handlePayDeposit = () => {
    setShowStripeForm(true);
  };
  
  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful",
      description: "Your deposit has been processed. Redirecting to confirmation...",
      variant: "default",
    });
    
    setTimeout(() => {
      setLocation('/payment-confirmation');
    }, 1500);
  };
  
  const handlePaymentCancel = () => {
    setShowStripeForm(false);
    toast({
      title: "Payment Cancelled",
      description: "You can try again when you're ready.",
      variant: "default",
    });
  };
  
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Secure Your Treatment Plan</h1>
        <p className="text-gray-600 mb-8">
          Pay a fully refundable £200 deposit to confirm your dental treatment plan
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">What You're Getting</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 bg-blue-100 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Personalized Treatment Plan</h3>
                    <p className="text-sm text-gray-600">Your comprehensive dental plan with treatments worth approximately £{totalAmount}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="shrink-0 bg-blue-100 p-2 rounded-full">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Clinic Reservation</h3>
                    <p className="text-sm text-gray-600">Priority booking with your selected clinic and dental team</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="shrink-0 bg-blue-100 p-2 rounded-full">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Free Consultation</h3>
                    <p className="text-sm text-gray-600">Direct video consultation with your dental specialist to discuss your treatment in detail</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="shrink-0 bg-blue-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Patient Portal Access</h3>
                    <p className="text-sm text-gray-600">Secure access to your dedicated patient dashboard where you can manage all aspects of your treatment</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="shrink-0 bg-blue-100 p-2 rounded-full">
                    <LifeBuoy className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Concierge Support</h3>
                    <p className="text-sm text-gray-600">Personal assistance with travel arrangements, accommodation, and all aspects of your dental trip</p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <h2 className="text-lg font-semibold mb-3">About Your Deposit</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Your £200 deposit is fully refundable</span> if you cancel 14+ days before your treatment.
                      It's held securely by MyDentalFly (a British company), not the clinic directly.
                      This deposit will be deducted from your final treatment cost.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-gray-700">Deducted from your final treatment cost</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-gray-700">Fully refundable if cancelled 14+ days before treatment</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-gray-700">Held by a British company, not directly by the clinic</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-gray-700">Secures your treatment plan and appointment slot</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-3">Treatment Summary</h2>
              <div className="space-y-2 mb-4">
                {treatments.map((treatment) => (
                  <div key={treatment.id} className="flex justify-between">
                    <span className="text-gray-700">
                      {treatment.name} {treatment.quantity > 1 && `x${treatment.quantity}`}
                    </span>
                    <span className="font-medium">£{treatment.subtotalGBP}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Total Estimated Cost:</span>
                <span className="font-semibold">£{totalAmount}</span>
              </div>
              <div className="flex justify-between pt-2 border-t mt-3 text-blue-700">
                <span className="font-medium">Deposit Amount:</span>
                <span className="font-semibold">£{depositAmount}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mt-4 text-sm text-gray-600">
                <p>The remaining balance of £{totalAmount - depositAmount} will be paid directly to the clinic on the day of your treatment.</p>
              </div>
            </Card>
          </div>
          
          {/* Payment Summary */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <h2 className="text-xl font-semibold mb-3">Payment Summary</h2>
              
              {!showStripeForm ? (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit amount:</span>
                      <span className="font-semibold">£{depositAmount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
                        <span>Payment method:</span>
                      </div>
                      <span>Credit/Debit Card</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>Processing time:</span>
                      </div>
                      <span>Immediate</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handlePayDeposit}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                  >
                    {isLoading ? 'Processing...' : 'Pay £200 Deposit Securely'}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                  
                  <div className="flex justify-center mt-3">
                    <div className="flex items-center text-xs text-gray-500">
                      <Shield className="h-3 w-3 mr-1" />
                      <span>Secure payment processing</span>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <div className="mb-4">
                    <StripePaymentWrapper 
                      amount={depositAmount}
                      description="MyDentalFly Treatment Deposit"
                      onPaymentSuccess={handlePaymentSuccess}
                      onCancel={handlePaymentCancel}
                      metadata={{
                        patientName: patientInfo.fullName || '',
                        patientEmail: patientInfo.email || '',
                        clinicId: selectedClinicId || '',
                        treatmentCount: treatments.length.toString()
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>
            
            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-medium mb-2">What Happens Next?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="bg-gray-200 rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">1</div>
                  <p>Pay your deposit to secure your treatment plan</p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="bg-gray-200 rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">2</div>
                  <p>Receive access to your dedicated patient portal</p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="bg-gray-200 rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">3</div>
                  <p>Schedule your free video consultation with the dental specialist</p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="bg-gray-200 rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">4</div>
                  <p>Finalize your treatment dates with our concierge team</p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="bg-gray-200 rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">5</div>
                  <p>Receive your comprehensive travel and treatment itinerary</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800">Flexible Scheduling</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your deposit secures your treatment plan but allows flexibility in scheduling your visit at a time that works for you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="mx-auto"
          >
            Return to Previous Page
          </Button>
        </div>
      </div>
    </main>
  );
};

export default DepositPaymentPage;