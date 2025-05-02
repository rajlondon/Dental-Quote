import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, ArrowLeft, RefreshCw, Coffee } from 'lucide-react';
import ErrorDisplay from '@/components/ui/error-display';
import { ErrorCategory } from '@/lib/error-handler';

interface ErrorPageProps {
  title?: string;
  message?: string;
  statusCode?: number;
  errorCategory?: ErrorCategory;
}

/**
 * Generic error page component that can be used for various error scenarios
 */
const ErrorPage: React.FC<ErrorPageProps> = ({
  title = 'An Error Occurred',
  message = 'Something went wrong. Please try again or contact support if the problem persists.',
  statusCode = 500,
  errorCategory = ErrorCategory.UNKNOWN
}) => {
  const [, setLocation] = useLocation();
  const isNotFound = statusCode === 404;
  
  // Determine specific messages for common HTTP status codes
  const getStatusSpecificMessage = () => {
    switch (statusCode) {
      case 404:
        return "The page you're looking for doesn't exist or has been moved.";
      case 403:
        return "You don't have permission to access this page.";
      case 401:
        return "You need to be logged in to access this page.";
      case 500:
        return "Our servers are experiencing issues right now. Please try again later.";
      case 503:
        return "The service is temporarily unavailable. Please try again later.";
      default:
        return message;
    }
  };
  
  // Map HTTP status code to error category if not explicitly provided
  const getErrorCategory = () => {
    if (errorCategory !== ErrorCategory.UNKNOWN) return errorCategory;
    
    switch (statusCode) {
      case 404:
        return ErrorCategory.CLIENT;
      case 403:
        return ErrorCategory.AUTHORIZATION;
      case 401:
        return ErrorCategory.AUTHENTICATION;
      case 500:
      case 503:
        return ErrorCategory.SERVER;
      default:
        return ErrorCategory.UNKNOWN;
    }
  };
  
  const handleRetry = () => {
    window.location.reload();
  };
  
  const handleGoBack = () => {
    window.history.back();
  };
  
  const handleGoHome = () => {
    setLocation('/');
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className={statusCode >= 500 ? 'bg-red-50' : 'bg-amber-50'}>
          <div className="flex items-center gap-3">
            {statusCode === 404 ? (
              <Coffee className="h-6 w-6 text-amber-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            )}
            <CardTitle>{isNotFound ? 'Page Not Found' : title}</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="py-6">
          <div className="mb-4">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-gray-100 p-4">
                <span className="text-3xl font-bold text-gray-700">{statusCode}</span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 text-center">{getStatusSpecificMessage()}</p>
            
            {/* For 5xx errors, show a more detailed error display */}
            {statusCode >= 500 && (
              <div className="mt-6">
                <ErrorDisplay 
                  message="Our team has been notified of this issue. Please try again later."
                  category={getErrorCategory()}
                  variant="compact"
                  onRetry={handleRetry}
                />
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 border-t flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGoBack} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            
            <Button variant="default" onClick={handleGoHome} className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
          
          {/* Show retry button for server errors */}
          {statusCode >= 500 && (
            <Button variant="outline" onClick={handleRetry} className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

// Export a pre-configured NotFound page
export const NotFoundPage: React.FC = () => (
  <ErrorPage 
    title="Page Not Found" 
    statusCode={404} 
    message="The page you're looking for doesn't exist or has been moved."
    errorCategory={ErrorCategory.CLIENT}
  />
);

// Export a pre-configured Forbidden page
export const ForbiddenPage: React.FC = () => (
  <ErrorPage 
    title="Access Denied" 
    statusCode={403} 
    message="You don't have permission to access this page."
    errorCategory={ErrorCategory.AUTHORIZATION}
  />
);

// Export a pre-configured Server Error page
export const ServerErrorPage: React.FC = () => (
  <ErrorPage 
    title="Server Error" 
    statusCode={500} 
    message="Our servers are experiencing issues right now. Please try again later."
    errorCategory={ErrorCategory.SERVER}
  />
);

export default ErrorPage;