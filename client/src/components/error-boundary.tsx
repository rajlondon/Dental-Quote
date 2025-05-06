import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RouteErrorMessage } from '@/components/ui/page-transition-loader';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors in its child component tree
 * and displays a fallback UI instead of crashing the whole application.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 flex justify-center items-center min-h-[300px]">
          <RouteErrorMessage
            message={this.state.error?.message || "Something went wrong"}
            onRetry={this.resetErrorBoundary}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * NavigationErrorBoundary specifically for catching errors during route changes
 */
export function NavigationErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onReset={() => {
        // Attempt to navigate to a safe route
        window.history.pushState({}, '', '/');
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}