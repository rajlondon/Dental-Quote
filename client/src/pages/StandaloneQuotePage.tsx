import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/layouts/Layout';
import TreatmentSelector from '@/components/quotes/TreatmentSelector';
import PatientInfoForm from '@/components/quotes/PatientInfoForm';
import QuoteSummary from '@/components/quotes/QuoteSummary';
import { Steps, Step } from '@/components/ui/steps';
import { PencilRuler, UserRound, FileCheck } from 'lucide-react';

const StandaloneQuotePage: React.FC = () => {
  const [location, navigate] = useLocation();
  
  // Define the steps in the quote process
  const steps = [
    { 
      id: 'treatments', 
      title: 'Select Treatments', 
      path: '/quote/treatments', 
      icon: <PencilRuler className="h-5 w-5" />,
      component: TreatmentSelector 
    },
    { 
      id: 'patient-info', 
      title: 'Your Information', 
      path: '/quote/patient-info', 
      icon: <UserRound className="h-5 w-5" />,
      component: PatientInfoForm 
    },
    { 
      id: 'summary', 
      title: 'Review & Submit', 
      path: '/quote/summary', 
      icon: <FileCheck className="h-5 w-5" />,
      component: QuoteSummary 
    },
  ];

  // Determine current step based on the URL
  const currentStep = steps.findIndex(step => location === step.path) + 1;
  
  // If the URL doesn't match any step, redirect to the first step
  useEffect(() => {
    if (!steps.some(step => step.path === location)) {
      navigate(steps[0].path);
    }
  }, [location, navigate]);
  
  // Current step component
  const CurrentStepComponent = steps.find(step => step.path === location)?.component;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Build Your Dental Quote</h1>
        
        {/* Step indicator */}
        <div className="mb-8">
          <Steps currentStep={currentStep} className="justify-center">
            {steps.map((step, index) => (
              <Step 
                key={step.id} 
                title={step.title} 
                description={`Step ${index + 1}`}
                icon={step.icon}
                onClick={() => {
                  // Only allow navigating to previous steps
                  if (index + 1 < currentStep) {
                    navigate(step.path);
                  }
                }}
                status={
                  index + 1 < currentStep ? 'complete' :
                  index + 1 === currentStep ? 'current' :
                  'incomplete'
                }
              />
            ))}
          </Steps>
        </div>
        
        {/* Current step content */}
        <div className="mt-8">
          {CurrentStepComponent && <CurrentStepComponent />}
        </div>
      </div>
    </Layout>
  );
};

export default StandaloneQuotePage;