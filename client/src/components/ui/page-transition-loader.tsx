import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Loader2, AlertOctagon, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PageTransitionContextValue {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: Error | null;
  setError: (error: Error | null) => void;
}

const PageTransitionContext = createContext<PageTransitionContextValue | undefined>(undefined);

export const usePageTransition = () => {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within a PageTransitionProvider');
  }
  return context;
};

interface PageTransitionLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function PageTransitionLoader({ children, fallback }: PageTransitionLoaderProps) {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [location] = useLocation();

  // Reset loading state on location change
  useEffect(() => {
    setLoading(false);
    setError(null);
  }, [location]);

  const contextValue: PageTransitionContextValue = {
    isLoading,
    setLoading,
    error,
    setError,
  };

  return (
    <PageTransitionContext.Provider value={contextValue}>
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading...</p>
          </div>
        </div>
      )}
      {error ? (
        <RouteErrorMessage message={error.message} />
      ) : (
        children
      )}
    </PageTransitionContext.Provider>
  );
}

export function RouteErrorMessage({ 
  message, 
  onRetry
}: { 
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mx-auto max-w-md p-6">
      <Card className="border-destructive">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertOctagon className="h-5 w-5" />
            Navigation Error
          </CardTitle>
          <CardDescription>
            There was a problem loading this page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{message}</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </Button>
          {onRetry && (
            <Button
              variant="default"
              size="sm"
              onClick={onRetry}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export function NavigationStatusBar() {
  const { isLoading } = usePageTransition();
  const [location] = useLocation();
  
  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 h-1 bg-primary/60 z-50 transition-opacity",
        isLoading ? "opacity-100" : "opacity-0"
      )}
    >
      <div 
        className={cn(
          "h-full bg-primary animate-pulse"
        )}
        style={{
          width: isLoading ? '90%' : '0%',
          transition: 'width 0.3s ease-in-out'
        }}
      />
    </div>
  );
}