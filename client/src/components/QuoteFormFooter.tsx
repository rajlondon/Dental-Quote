import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface QuoteFormFooterProps {
  onNext?: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  isLastStep?: boolean;
  isFirstStep?: boolean;
  nextLabel?: string;
  backLabel?: string;
  submitLabel?: string;
  className?: string;
}

const QuoteFormFooter: React.FC<QuoteFormFooterProps> = ({
  onNext,
  onBack,
  onSubmit,
  isLoading = false,
  isLastStep = false,
  isFirstStep = false,
  nextLabel = 'Next',
  backLabel = 'Back',
  submitLabel = 'Submit Quote',
  className = ''
}) => {
  return (
    <div className={`flex justify-between mt-6 pt-4 border-t ${className}`}>
      <div>
        {!isFirstStep && onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            {backLabel}
          </Button>
        )}
      </div>
      
      <div>
        {isLastStep ? (
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={isLoading}
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuoteFormFooter;