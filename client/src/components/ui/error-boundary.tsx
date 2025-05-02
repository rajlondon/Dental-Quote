import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { logErrorToService } from '@/lib/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component for catching and displaying React component errors
 * 
 * Usage:
 * <ErrorBoundary componentName="MyComponent">
 *   <MyComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  // Update state when component fails
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  // Log the error when it occurs
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to service with component context
    logErrorToService(error, {
      componentStack: errorInfo.componentStack,
      componentName: this.props.componentName || 'Unknown'
    });
  }

  // Reset the error state
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    // If no error, render children normally
    if (!this.state.hasError) {
      return this.props.children;
    }
    
    // If custom fallback is provided, use it
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // Default error UI
    return (
      <Card className="w-full">
        <CardHeader className="bg-red-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-600">Component Error</CardTitle>
          </div>
          <CardDescription>
            {this.props.componentName 
              ? `An error occurred in the ${this.props.componentName} component` 
              : 'An error occurred while rendering this component'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-700 mb-4">
            {this.state.error?.message || 'Unknown error'}
          </div>
          {process.env.NODE_ENV !== 'production' && this.state.errorInfo && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Component Stack:</p>
              <pre className="text-xs overflow-auto bg-gray-100 p-3 rounded max-h-40">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 border-t flex justify-end">
          <Button 
            variant="outline" 
            onClick={this.handleReset} 
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }
}

export default ErrorBoundary;