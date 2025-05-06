import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageTransitionLoaderProps {
  className?: string;
  fullScreen?: boolean;
  message?: string;
}

/**
 * PageTransitionLoader
 * 
 * A component that displays a loading indicator during page transitions.
 */
const PageTransitionLoader: React.FC<PageTransitionLoaderProps> = ({
  className,
  fullScreen = false,
  message = "Loading page...",
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-background/80 z-50 p-6",
        fullScreen
          ? "fixed inset-0"
          : "absolute top-0 left-0 right-0 h-16 border-b",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

/**
 * RouteErrorMessage
 * 
 * A component that displays an error message when navigation fails.
 */
interface RouteErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const RouteErrorMessage: React.FC<RouteErrorMessageProps> = ({
  message = "Something went wrong while loading this page.",
  onRetry,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <svg
          className="h-8 w-8 text-destructive"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">Navigation Error</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export { PageTransitionLoader, RouteErrorMessage };