import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  FileText, 
  Heart, 
  Stethoscope, 
  Calculator, 
  MessageSquare, 
  CreditCard, 
  Plane, 
  Hotel, 
  Car, 
  MapPin,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'upcoming';
  estimatedTime?: string;
  actionButton?: {
    text: string;
    action: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
}

interface PatientJourneyTimelineProps {
  onStepAction?: (stepId: string) => void;
}

export default function PatientJourneyTimeline({ 
  onStepAction 
}: PatientJourneyTimelineProps) {
  // Fetch user's quote data to determine real progress
  const { data: quoteData = [] } = useQuery({
    queryKey: ['/api/quote-responses/my-quotes'],
    enabled: true
  });

  // Simple progress tracking based on real user data
  const hasQuoteData = Array.isArray(quoteData) && quoteData.length > 0;
  const hasLocalQuizData = localStorage.getItem('selected_treatments') !== null || 
                          localStorage.getItem('dental_chart_data') !== null;
  
  // Determine current step based on actual user progress
  const getCurrentStep = () => {
    if (hasQuoteData) return 'consultation';
    if (hasLocalQuizData) return 'your_quote';
    return 'dental_quiz';
  };

  const currentStep = getCurrentStep();

  // Simple step status determination
  const getStepStatus = (stepId: string): 'completed' | 'current' | 'upcoming' => {
    const steps = ['dental_quiz', 'dental_chart', 'treatment_selection', 'your_quote', 'consultation', 'deposit', 'travel', 'arrival', 'treatment'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };
  
  // Define all journey steps with ALL buttons visible for testing
  const journeySteps: JourneyStep[] = [
    {
      id: 'dental_quiz',
      title: 'Dental Health Questionnaire',
      description: 'Complete a comprehensive dental health assessment',
      icon: <FileText className="h-5 w-5" />,
      status: getStepStatus('dental_quiz'),
      estimatedTime: '5 minutes',
      actionButton: {
        text: getStepStatus('dental_quiz') === 'completed' ? 'View Quiz' : 'Start Quiz',
        action: () => onStepAction?.('dental_quiz'),
        variant: getStepStatus('dental_quiz') === 'completed' ? 'outline' : 'default'
      }
    },
    {
      id: 'dental_chart',
      title: 'Interactive Dental Chart',
      description: 'Mark specific teeth conditions and concerns',
      icon: <Heart className="h-5 w-5" />,
      status: getStepStatus('dental_chart'),
      estimatedTime: '3 minutes',
      actionButton: {
        text: getStepStatus('dental_chart') === 'completed' ? 'View Chart' : 'Mark Teeth',
        action: () => onStepAction?.('dental_chart'),
        variant: getStepStatus('dental_chart') === 'completed' ? 'outline' : 'default'
      }
    },
    {
      id: 'treatment_selection',
      title: 'Treatment Selection',
      description: 'Choose from recommended dental treatments',
      icon: <Stethoscope className="h-5 w-5" />,
      status: getStepStatus('treatment_selection'),
      estimatedTime: '10 minutes',
      actionButton: {
        text: getStepStatus('treatment_selection') === 'completed' ? 'View Treatments' : 'Select Treatments',
        action: () => onStepAction?.('treatment_selection'),
        variant: getStepStatus('treatment_selection') === 'completed' ? 'outline' : 'default'
      }
    },
    {
      id: 'your_quote',
      title: 'Your Quote',
      description: 'Review pricing and select your preferred clinic',
      icon: <Calculator className="h-5 w-5" />,
      status: getStepStatus('your_quote'),
      estimatedTime: '15 minutes',
      actionButton: {
        text: getStepStatus('your_quote') === 'completed' ? 'View My Quotes' : 'Get Quote',
        action: () => onStepAction?.('your_quote'),
        variant: getStepStatus('your_quote') === 'completed' ? 'outline' : 'default'
      }
    },
    {
      id: 'consultation',
      title: 'Clinic Consultation',
      description: 'Receive personalized treatment plan from your chosen clinic',
      icon: <MessageSquare className="h-5 w-5" />,
      status: getStepStatus('consultation'),
      estimatedTime: '1-2 days',
      actionButton: {
        text: getStepStatus('consultation') === 'completed' ? 'View Messages' : 'Contact Clinic',
        action: () => onStepAction?.('consultation'),
        variant: 'outline'
      }
    },
    {
      id: 'deposit',
      title: 'Pay £200 Deposit',
      description: 'Secure your booking with a refundable deposit',
      icon: <CreditCard className="h-5 w-5" />,
      status: getStepStatus('deposit'),
      estimatedTime: '2 minutes',
      actionButton: {
        text: getStepStatus('deposit') === 'completed' ? 'View Payment' : 'Pay Deposit',
        action: () => onStepAction?.('deposit')
      }
    },
    {
      id: 'travel',
      title: 'Book Flights & Hotel',
      description: 'Arrange your travel and accommodation in Istanbul',
      icon: <Plane className="h-5 w-5" />,
      status: getStepStatus('travel'),
      estimatedTime: '30 minutes',
      actionButton: {
        text: getStepStatus('travel') === 'completed' ? 'Manage Travel' : 'Book Travel',
        action: () => onStepAction?.('travel')
      }
    },
    {
      id: 'arrival',
      title: 'Airport Pickup & Hotel',
      description: 'Get picked up at Istanbul airport and check into your hotel',
      icon: <Car className="h-5 w-5" />,
      status: getStepStatus('arrival'),
      estimatedTime: '1 hour',
      actionButton: {
        text: getStepStatus('arrival') === 'completed' ? 'View Details' : 'Track Pickup',
        action: () => onStepAction?.('arrival'),
        variant: 'outline'
      }
    },
    {
      id: 'treatment',
      title: 'First Consultation & Treatment',
      description: 'X-rays, consultation with dentist, and initial treatment',
      icon: <MapPin className="h-5 w-5" />,
      status: getStepStatus('treatment'),
      estimatedTime: '2-3 hours',
      actionButton: {
        text: getStepStatus('treatment') === 'completed' ? 'View History' : 'View Schedule',
        action: () => onStepAction?.('treatment'),
        variant: 'outline'
      }
    },
    {
      id: 'final_payment',
      title: 'Pay Treatment Balance',
      description: 'Pay remaining balance after consultation and updated treatment plan',
      icon: <CreditCard className="h-5 w-5" />,
      status: getStepStatus('final_payment'),
      estimatedTime: '5 minutes',
      actionButton: {
        text: getStepStatus('final_payment') === 'completed' ? 'View Receipt' : 'Pay Balance',
        action: () => onStepAction?.('final_payment'),
        variant: getStepStatus('final_payment') === 'completed' ? 'outline' : 'default'
      }
    }
  ];

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'current': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  const getStepIcon = (step: JourneyStep) => {
    const iconClasses = cn(
      'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
      step.status === 'completed' ? 'border-green-500 bg-green-500 text-white' :
      step.status === 'current' ? 'border-blue-500 bg-blue-500 text-white' :
      'border-gray-300 bg-white text-gray-400'
    );

    return (
      <div className={iconClasses}>
        {step.status === 'completed' ? (
          <CheckCircle className="h-5 w-5" />
        ) : step.status === 'current' ? (
          <Clock className="h-5 w-5" />
        ) : (
          step.icon
        )}
      </div>
    );
  };

  const completedSteps = journeySteps.filter(step => step.status === 'completed').length;
  const totalSteps = journeySteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Your Dental Journey</CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {completedSteps}/{totalSteps} completed
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {progressPercentage === 100 
            ? 'Congratulations! You\'ve completed your dental journey!' 
            : `${Math.round(progressPercentage)}% complete - You're doing great!`
          }
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {journeySteps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connecting Line */}
            {index < journeySteps.length - 1 && (
              <div 
                className={cn(
                  'absolute left-5 top-12 w-0.5 h-12 transition-colors',
                  step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                )}
              />
            )}
            
            {/* Step Content */}
            <div className="flex items-start space-x-4">
              {/* Step Icon */}
              {getStepIcon(step)}
              
              {/* Step Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    'text-lg font-medium',
                    step.status === 'completed' ? 'text-green-700' :
                    step.status === 'current' ? 'text-blue-700' :
                    'text-gray-500'
                  )}>
                    {step.title}
                  </h3>
                  
                  {step.estimatedTime && (
                    <Badge variant="outline" className="text-xs">
                      {step.estimatedTime}
                    </Badge>
                  )}
                </div>
                
                <p className={cn(
                  'text-sm mt-1',
                  step.status === 'current' ? 'text-gray-700' : 'text-gray-500'
                )}>
                  {step.description}
                </p>
                
                {/* Action Button */}
                {step.actionButton && (
                  <Button 
                    size="sm"
                    variant={step.actionButton.variant || 'default'}
                    className="mt-3"
                    onClick={step.actionButton.action}
                  >
                    {step.actionButton.text}
                    <ChevronRight className="ml-2 h-3 w-3" />
                  </Button>
                )}
                
                {/* Status Badge for Current Step */}
                {step.status === 'current' && (
                  <div className="mt-2">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      Current Step
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Completion Message */}
        {progressPercentage === 100 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800 font-medium">
                Congratulations! Your dental treatment journey is complete.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}