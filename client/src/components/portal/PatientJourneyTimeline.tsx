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
  currentStep?: string;
  onStepAction?: (stepId: string) => void;
}

export default function PatientJourneyTimeline({ 
  currentStep = 'dental_quiz',
  onStepAction 
}: PatientJourneyTimelineProps) {
  
  const journeySteps: JourneyStep[] = [
    {
      id: 'dental_quiz',
      title: 'Dental Health Quiz',
      description: 'Complete a comprehensive dental health assessment',
      icon: <FileText className="h-5 w-5" />,
      status: currentStep === 'dental_quiz' ? 'current' : 
              ['dental_chart', 'treatment_selection', 'your_quote', 'consultation', 'deposit', 'travel', 'arrival', 'treatment'].includes(currentStep) ? 'completed' : 'upcoming',
      estimatedTime: '5 minutes',
      actionButton: currentStep === 'dental_quiz' ? {
        text: 'Start Quiz',
        action: () => onStepAction?.('dental_quiz')
      } : undefined
    },
    {
      id: 'dental_chart',
      title: 'Interactive Dental Chart',
      description: 'Mark specific teeth conditions and concerns',
      icon: <Heart className="h-5 w-5" />,
      status: currentStep === 'dental_chart' ? 'current' : 
              ['treatment_selection', 'your_quote', 'consultation', 'deposit', 'travel', 'arrival', 'treatment'].includes(currentStep) ? 'completed' : 'upcoming',
      estimatedTime: '3 minutes',
      actionButton: currentStep === 'dental_chart' ? {
        text: 'Mark Teeth',
        action: () => onStepAction?.('dental_chart')
      } : undefined
    },
    {
      id: 'treatment_selection',
      title: 'Treatment Selection',
      description: 'Choose from recommended dental treatments',
      icon: <Stethoscope className="h-5 w-5" />,
      status: currentStep === 'treatment_selection' ? 'current' : 
              ['your_quote', 'consultation', 'deposit', 'travel', 'arrival', 'treatment'].includes(currentStep) ? 'completed' : 'upcoming',
      estimatedTime: '10 minutes',
      actionButton: currentStep === 'treatment_selection' ? {
        text: 'Select Treatments',
        action: () => onStepAction?.('treatment_selection')
      } : undefined
    },
    {
      id: 'your_quote',
      title: 'Your Quote',
      description: 'Review pricing and select your preferred clinic',
      icon: <Calculator className="h-5 w-5" />,
      status: currentStep === 'your_quote' ? 'current' : 
              ['consultation', 'deposit', 'travel', 'arrival', 'treatment'].includes(currentStep) ? 'completed' : 'upcoming',
      estimatedTime: '15 minutes',
      actionButton: currentStep === 'your_quote' ? {
        text: 'Get Quote',
        action: () => onStepAction?.('your_quote')
      } : undefined
    },
    {
      id: 'consultation',
      title: 'Clinic Consultation',
      description: 'Receive personalized treatment plan from your chosen clinic',
      icon: <MessageSquare className="h-5 w-5" />,
      status: currentStep === 'consultation' ? 'current' : 
              ['deposit', 'travel', 'arrival', 'treatment'].includes(currentStep) ? 'completed' : 'upcoming',
      estimatedTime: '1-2 days',
      actionButton: currentStep === 'consultation' ? {
        text: 'Contact Clinic',
        action: () => onStepAction?.('consultation'),
        variant: 'outline'
      } : undefined
    },
    {
      id: 'deposit',
      title: 'Pay £200 Deposit',
      description: 'Secure your booking with a refundable deposit',
      icon: <CreditCard className="h-5 w-5" />,
      status: currentStep === 'deposit' ? 'current' : 
              ['travel', 'arrival', 'treatment'].includes(currentStep) ? 'completed' : 'upcoming',
      estimatedTime: '2 minutes',
      actionButton: currentStep === 'deposit' ? {
        text: 'Pay Deposit',
        action: () => onStepAction?.('deposit')
      } : undefined
    },
    {
      id: 'travel',
      title: 'Book Flights & Hotel',
      description: 'Arrange your travel and accommodation in Istanbul',
      icon: <Plane className="h-5 w-5" />,
      status: currentStep === 'travel' ? 'current' : 
              ['arrival', 'treatment'].includes(currentStep) ? 'completed' : 'upcoming',
      estimatedTime: '30 minutes',
      actionButton: currentStep === 'travel' ? {
        text: 'Book Travel',
        action: () => onStepAction?.('travel')
      } : undefined
    },
    {
      id: 'arrival',
      title: 'Airport Pickup & Hotel',
      description: 'Get picked up at Istanbul airport and check into your hotel',
      icon: <Car className="h-5 w-5" />,
      status: currentStep === 'arrival' ? 'current' : 
              ['treatment'].includes(currentStep) ? 'completed' : 'upcoming',
      estimatedTime: '1 hour',
      actionButton: currentStep === 'arrival' ? {
        text: 'Track Pickup',
        action: () => onStepAction?.('arrival'),
        variant: 'outline'
      } : undefined
    },
    {
      id: 'treatment',
      title: 'First Consultation & Treatment',
      description: 'Begin your dental treatment journey at the clinic',
      icon: <MapPin className="h-5 w-5" />,
      status: currentStep === 'treatment' ? 'current' : 'upcoming',
      estimatedTime: '2-3 hours',
      actionButton: currentStep === 'treatment' ? {
        text: 'View Schedule',
        action: () => onStepAction?.('treatment'),
        variant: 'outline'
      } : undefined
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