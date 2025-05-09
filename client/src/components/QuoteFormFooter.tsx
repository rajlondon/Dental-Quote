import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface QuoteFormFooterProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  nextDisabled?: boolean;
  submitDisabled?: boolean;
}

const QuoteFormFooter: React.FC<QuoteFormFooterProps> = ({
  currentStep,
  totalSteps,
  isSubmitting = false,
  onNext,
  onBack,
  onSubmit,
  submitLabel = 'Submit',
  nextDisabled = false,
  submitDisabled = false
}) => {
  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <React.Fragment key={index}>
              <div 
                className={`h-3 w-3 rounded-full ${
                  index < currentStep 
                    ? 'bg-primary' 
                    : index === currentStep 
                      ? 'border-2 border-primary bg-background' 
                      : 'bg-gray-200'
                }`}
              />
              {index < totalSteps - 1 && (
                <div className={`h-1 w-5 ${index < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex gap-3">
          {currentStep > 0 && onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}
          
          {currentStep < totalSteps - 1 && onNext ? (
            <Button
              type="button"
              onClick={onNext}
              disabled={nextDisabled || isSubmitting}
            >
              Continue
            </Button>
          ) : (
            onSubmit && (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={submitDisabled || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteFormFooter;