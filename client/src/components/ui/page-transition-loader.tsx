import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from './button';
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
export function PageTransitionLoader({
  className,
  fullScreen = false,
  message = 'Loading page...'
}: PageTransitionLoaderProps) {
  return (
    <div 
      className={cn(
        'flex items-center justify-center',
        fullScreen ? 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm' : 'h-16',
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}

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

export function RouteErrorMessage({
  message = 'There was a problem loading this page',
  onRetry,
  className
}: RouteErrorMessageProps) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center py-8 px-4 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="mb-2 text-lg font-medium">{message}</h3>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        The page you requested could not be loaded. This could be due to a temporary network issue or the page may no longer exist.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <div className="flex items-center gap-2">
            Try again
          </div>
        </Button>
      )}
    </div>
  );
}