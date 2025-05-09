import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

interface QuoteFormFooterProps {
  onContinue?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  showContinue?: boolean;
  continueText?: string;
  backText?: string;
  showHelp?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * A consistent footer component for quote forms with back/continue buttons
 */
const QuoteFormFooter: React.FC<QuoteFormFooterProps> = ({
  onContinue,
  onBack,
  showBack = true,
  showContinue = true,
  continueText = 'Continue',
  backText = 'Back',
  showHelp = true,
  disabled = false,
  isLoading = false,
  className = '',
}) => {
  return (
    <div className={`flex justify-between items-center mt-6 w-full ${className}`}>
      <div className="flex items-center">
        {showBack && (
          <Button 
            variant="outline" 
            onClick={onBack} 
            disabled={disabled || isLoading}
            className="mr-3"
          >
            {backText}
          </Button>
        )}
        
        {showHelp && (
          <Link 
            to="/help/quote" 
            className="text-sm text-muted-foreground ml-2 hover:underline"
          >
            Need help?
          </Link>
        )}
      </div>
      
      {showContinue && (
        <Button 
          onClick={onContinue} 
          disabled={disabled || isLoading}
          className="flex items-center"
        >
          {continueText}
          {isLoading ? (
            <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
          ) : (
            <CheckCircle2 className="ml-2 h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};

export default QuoteFormFooter;