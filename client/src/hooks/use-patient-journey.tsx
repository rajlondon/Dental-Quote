import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface JourneyProgress {
  currentStep: string;
  completedSteps: string[];
  hasQuoteData: boolean;
  hasSubmittedQuote: boolean;
  hasDepositPaid: boolean;
  hasTravelBooked: boolean;
  hasAppointmentScheduled: boolean;
}

// Define the journey step order
const JOURNEY_STEPS = [
  'dental_quiz',
  'dental_chart', 
  'treatment_selection',
  'your_quote',
  'consultation',
  'deposit',
  'travel',
  'arrival',
  'treatment'
];

export function usePatientJourney() {
  const [journeyProgress, setJourneyProgress] = useState<JourneyProgress>({
    currentStep: 'dental_quiz',
    completedSteps: [],
    hasQuoteData: false,
    hasSubmittedQuote: false,
    hasDepositPaid: false,
    hasTravelBooked: false,
    hasAppointmentScheduled: false
  });

  // Fetch user's quote data to determine progress
  const { data: quoteData = [] } = useQuery({
    queryKey: ['/api/quote-responses/my-quotes'],
    enabled: true
  });

  // Check local storage for quiz completion
  const checkQuizCompletion = () => {
    return localStorage.getItem('quote_flow_completed') === 'true' ||
           localStorage.getItem('dental_chart_data') !== null ||
           localStorage.getItem('selected_treatments') !== null;
  };

  // Determine current step and completed steps based on user data
  useEffect(() => {
    const completedSteps: string[] = [];
    let currentStep = 'dental_quiz';

    // Check if quiz is completed (based on local storage or quote data)
    const hasQuizData = checkQuizCompletion() || (quoteData && quoteData.length > 0);
    if (hasQuizData) {
      completedSteps.push('dental_quiz');
      currentStep = 'dental_chart';
    }

    // Check if dental chart is completed
    const hasDentalChart = localStorage.getItem('dental_chart_data') !== null ||
                          (quoteData && quoteData.some((q: any) => q.dental_chart));
    if (hasDentalChart) {
      completedSteps.push('dental_chart');
      currentStep = 'treatment_selection';
    }

    // Check if treatments are selected
    const hasTreatments = localStorage.getItem('selected_treatments') !== null ||
                         (quoteData && quoteData.some((q: any) => q.treatments));
    if (hasTreatments) {
      completedSteps.push('treatment_selection');
      currentStep = 'your_quote';
    }

    // Check if quote is submitted
    const hasSubmittedQuote = quoteData && quoteData.length > 0;
    if (hasSubmittedQuote) {
      completedSteps.push('your_quote');
      currentStep = 'consultation';
    }

    // Check if clinic has reviewed (mock data for now)
    const hasClinicReview = hasSubmittedQuote && 
                           quoteData.some((q: any) => q.clinic_reviewed_at);
    if (hasClinicReview) {
      completedSteps.push('consultation');
      currentStep = 'deposit';
    }

    // Check if deposit is paid (this would come from payment system)
    const hasDepositPaid = localStorage.getItem('deposit_paid') === 'true';
    if (hasDepositPaid) {
      completedSteps.push('deposit');
      currentStep = 'travel';
    }

    // Check if travel is booked
    const hasTravelBooked = localStorage.getItem('travel_booked') === 'true';
    if (hasTravelBooked) {
      completedSteps.push('travel');
      currentStep = 'arrival';
    }

    // Check if arrival is confirmed
    const hasArrivalConfirmed = localStorage.getItem('arrival_confirmed') === 'true';
    if (hasArrivalConfirmed) {
      completedSteps.push('arrival');
      currentStep = 'treatment';
    }

    // Check if treatment is completed
    const hasTreatmentCompleted = localStorage.getItem('treatment_completed') === 'true';
    if (hasTreatmentCompleted) {
      completedSteps.push('treatment');
    }

    setJourneyProgress({
      currentStep,
      completedSteps,
      hasQuoteData: hasQuizData,
      hasSubmittedQuote,
      hasDepositPaid,
      hasTravelBooked,
      hasAppointmentScheduled: hasTreatmentCompleted
    });
  }, [quoteData]);

  // Function to advance to next step
  const advanceToStep = (stepId: string) => {
    const stepIndex = JOURNEY_STEPS.indexOf(stepId);
    const currentIndex = JOURNEY_STEPS.indexOf(journeyProgress.currentStep);
    
    if (stepIndex > currentIndex) {
      setJourneyProgress(prev => ({
        ...prev,
        currentStep: stepId
      }));
    }
  };

  // Function to mark step as completed
  const markStepCompleted = (stepId: string) => {
    setJourneyProgress(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, stepId].filter((step, index, arr) => 
        arr.indexOf(step) === index // Remove duplicates
      )
    }));
  };

  return {
    journeyProgress,
    advanceToStep,
    markStepCompleted,
    isStepCompleted: (stepId: string) => journeyProgress.completedSteps.includes(stepId),
    isCurrentStep: (stepId: string) => journeyProgress.currentStep === stepId,
    getStepStatus: (stepId: string) => {
      if (journeyProgress.completedSteps.includes(stepId)) return 'completed';
      if (journeyProgress.currentStep === stepId) return 'current';
      return 'upcoming';
    }
  };
}