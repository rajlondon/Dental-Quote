import React, { useState } from 'react';
import Layout from '../components/layouts/Layout';
import TreatmentSelector from '@/components/quotes/TreatmentSelector';
import PatientInfoForm from '@/components/quotes/PatientInfoForm';
import QuoteSummary from '@/components/quotes/QuoteSummary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuoteStore } from '@/stores/quoteStore';

enum QuoteStep {
  Treatments = 'treatments',
  PatientInfo = 'patient-info',
  Summary = 'summary'
}

const StandaloneQuotePage: React.FC = () => {
  const { treatments, patientInfo } = useQuoteStore();
  const [currentStep, setCurrentStep] = useState<QuoteStep>(QuoteStep.Treatments);

  // Track step completion status
  const isTreatmentStepComplete = treatments.length > 0;
  const isPatientInfoStepComplete = !!patientInfo;

  // Handle tab change while enforcing the step order
  const handleTabChange = (value: string) => {
    const step = value as QuoteStep;
    
    // Always allow going back to previous steps
    if (step === QuoteStep.Treatments) {
      setCurrentStep(step);
      return;
    }
    
    // Only allow proceeding to patient info if treatments are selected
    if (step === QuoteStep.PatientInfo) {
      if (isTreatmentStepComplete) {
        setCurrentStep(step);
      }
      return;
    }
    
    // Only allow proceeding to summary if both treatments and patient info are complete
    if (step === QuoteStep.Summary) {
      if (isTreatmentStepComplete && isPatientInfoStepComplete) {
        setCurrentStep(step);
      }
      return;
    }
  };

  return (
    <Layout>
      <div className="container py-10">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Create Your Dental Treatment Quote</CardTitle>
            <CardDescription>
              Get an instant quote for your dental treatments in Turkey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={currentStep} 
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger 
                  value={QuoteStep.Treatments}
                  data-state={currentStep === QuoteStep.Treatments ? "active" : "inactive"}
                  className="relative"
                >
                  <span className="flex items-center">
                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full border border-primary bg-background text-center text-sm font-medium">
                      1
                    </span>
                    Select Treatments
                  </span>
                  {isTreatmentStepComplete && currentStep !== QuoteStep.Treatments && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] text-white">
                      ✓
                    </span>
                  )}
                </TabsTrigger>
                
                <TabsTrigger 
                  value={QuoteStep.PatientInfo}
                  data-state={currentStep === QuoteStep.PatientInfo ? "active" : "inactive"}
                  disabled={!isTreatmentStepComplete}
                  className="relative"
                >
                  <span className="flex items-center">
                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full border border-primary bg-background text-center text-sm font-medium">
                      2
                    </span>
                    Your Information
                  </span>
                  {isPatientInfoStepComplete && currentStep !== QuoteStep.PatientInfo && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] text-white">
                      ✓
                    </span>
                  )}
                </TabsTrigger>
                
                <TabsTrigger 
                  value={QuoteStep.Summary}
                  data-state={currentStep === QuoteStep.Summary ? "active" : "inactive"}
                  disabled={!isTreatmentStepComplete || !isPatientInfoStepComplete}
                  className="relative"
                >
                  <span className="flex items-center">
                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full border border-primary bg-background text-center text-sm font-medium">
                      3
                    </span>
                    Review Quote
                  </span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={QuoteStep.Treatments} className="mt-0">
                <TreatmentSelector />
                
                {isTreatmentStepComplete && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setCurrentStep(QuoteStep.PatientInfo)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Continue to Your Information
                    </button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value={QuoteStep.PatientInfo} className="mt-0">
                <PatientInfoForm />
                
                {isPatientInfoStepComplete && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setCurrentStep(QuoteStep.Summary)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Continue to Review
                    </button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value={QuoteStep.Summary} className="mt-0">
                <QuoteSummary />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Testimonials or Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Quality Care</CardTitle>
            </CardHeader>
            <CardContent>
              <p>All our partner clinics are certified and meet our rigorous quality standards. Each clinic is regularly audited for compliance with international healthcare standards.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cost Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Save up to 70% on dental treatments compared to UK and US prices, without compromising on quality. Our transparent pricing ensures no hidden fees.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Full Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Our team handles everything from clinic selection to appointment scheduling, accommodation arrangements, and even airport transfers for a stress-free experience.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StandaloneQuotePage;