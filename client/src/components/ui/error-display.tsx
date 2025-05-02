import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { AlertTriangle, AlertCircle, RefreshCw, HelpCircle, WifiOff, LockKeyhole, AlertOctagon, FileWarning, ServerCrash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ErrorCategory } from '@/lib/error-handler';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  category?: ErrorCategory;
  onRetry?: () => void;
  className?: string;
  showIcon?: boolean;
  variant?: 'full' | 'compact' | 'inline'; // Full card, compact card, or inline display
}

/**
 * A reusable component for displaying error messages consistently
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  title, 
  message, 
  category = ErrorCategory.UNKNOWN, 
  onRetry, 
  className,
  showIcon = true,
  variant = 'full'
}) => {
  // Get the appropriate icon based on error category
  const getErrorIcon = () => {
    switch (category) {
      case ErrorCategory.NETWORK:
        return <WifiOff className="h-5 w-5 text-red-600" />;
      case ErrorCategory.AUTHENTICATION:
        return <LockKeyhole className="h-5 w-5 text-amber-600" />;
      case ErrorCategory.AUTHORIZATION:
        return <AlertOctagon className="h-5 w-5 text-amber-600" />;
      case ErrorCategory.VALIDATION:
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case ErrorCategory.SERVER:
        return <ServerCrash className="h-5 w-5 text-red-600" />;
      case ErrorCategory.UPLOAD:
        return <FileWarning className="h-5 w-5 text-amber-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  // Get default title based on error category if no title was provided
  const getDefaultTitle = () => {
    switch (category) {
      case ErrorCategory.NETWORK:
        return 'Connection Error';
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication Error';
      case ErrorCategory.AUTHORIZATION:
        return 'Access Denied';
      case ErrorCategory.VALIDATION:
        return 'Validation Error';
      case ErrorCategory.SERVER:
        return 'Server Error';
      case ErrorCategory.PAYMENT:
        return 'Payment Error';
      case ErrorCategory.UPLOAD:
        return 'Upload Failed';
      case ErrorCategory.EXTERNAL_SERVICE:
        return 'Service Unavailable';
      default:
        return 'Error';
    }
  };
  
  // Define the background color based on the category
  const getBgColor = () => {
    switch (category) {
      case ErrorCategory.VALIDATION:
      case ErrorCategory.AUTHORIZATION:
      case ErrorCategory.AUTHENTICATION:
        return 'bg-amber-50';
      case ErrorCategory.NETWORK:
      case ErrorCategory.SERVER:
      case ErrorCategory.UNKNOWN:
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };
  
  // Render inline variant (simplest)
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center text-red-600 gap-2 p-2", className)}>
        {showIcon && getErrorIcon()}
        <span>{message}</span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="ml-2 h-7 px-2">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }
  
  // Render compact variant (for smaller UI areas)
  if (variant === 'compact') {
    return (
      <div className={cn("rounded-md border p-3", getBgColor(), className)}>
        <div className="flex gap-2">
          {showIcon && getErrorIcon()}
          <div>
            <h4 className="text-sm font-medium text-gray-900">{title || getDefaultTitle()}</h4>
            <p className="text-sm text-gray-700 mt-1">{message}</p>
            {onRetry && (
              <Button variant="ghost" size="sm" onClick={onRetry} className="mt-2 h-8">
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Render full card variant (default)
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className={getBgColor()}>
        <div className="flex items-center gap-2">
          {showIcon && getErrorIcon()}
          <CardTitle>{title || getDefaultTitle()}</CardTitle>
        </div>
        {category === ErrorCategory.SERVER && (
          <CardDescription>
            Our team has been notified of this issue
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-gray-700">{message}</p>
      </CardContent>
      {onRetry && (
        <CardFooter className="bg-gray-50 border-t">
          <Button 
            variant="outline" 
            onClick={onRetry} 
            className="ml-auto flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ErrorDisplay;