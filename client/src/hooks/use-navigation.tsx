import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { usePageTransition } from '@/components/ui/page-transition-loader';
// Import the routes object directly
import { ROUTES } from '@/lib/routes';

interface NavigationContextValue {
  navigateTo: (path: string, options?: NavigationOptions) => void;
  goBack: () => void;
  navigateToRoute: (routeKeyOrPath: keyof typeof ROUTES | string, params?: Record<string, string | number>, options?: NavigationOptions) => void;
  currentRoute: string;
  previousRoute: string | null;
  isNavigating: boolean;
}

interface NavigationOptions {
  replace?: boolean;
  skipConfirmation?: boolean;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const [, navigate] = useLocation();
  const { setLoading, setError } = usePageTransition();
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname);
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([window.location.pathname]);

  // Update current route when location changes
  useEffect(() => {
    const handleRouteChange = () => {
      const newPath = window.location.pathname;
      
      // Don't add duplicate entries to history
      if (navigationHistory[navigationHistory.length - 1] !== newPath) {
        setPreviousRoute(navigationHistory[navigationHistory.length - 1]);
        setNavigationHistory(prev => [...prev, newPath]);
      }
      
      setCurrentRoute(newPath);
      setIsNavigating(false);
      setLoading(false);
    };

    // Listen to history changes
    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange(); // Initial call

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [navigationHistory, setLoading]);

  const navigateTo = useCallback((path: string, options: NavigationOptions = {}) => {
    try {
      setIsNavigating(true);
      setLoading(true);
      
      // Save current route as previous before navigation
      setPreviousRoute(currentRoute);
      
      // Use wouter's navigate function which handles client-side routing
      navigate(path, { replace: options.replace });
      
      // Store navigation intent in session storage to handle potential page refresh
      sessionStorage.setItem('lastNavigationIntent', path);
      
    } catch (error) {
      console.error('Navigation error:', error);
      setError(error instanceof Error ? error : new Error('Unknown navigation error'));
      setIsNavigating(false);
      setLoading(false);
    }
  }, [currentRoute, navigate, setLoading, setError]);

  const navigateToRoute = useCallback((
    routeKeyOrPath: keyof typeof ROUTES | string, 
    params: Record<string, string | number> = {}, 
    options: NavigationOptions = {}
  ) => {
    try {
      // Determine if this is a direct path or a route key
      let path: string;
      
      if (typeof routeKeyOrPath === 'string' && routeKeyOrPath.startsWith('/')) {
        // This is a direct path, not a route key
        path = routeKeyOrPath;
      } else {
        // This is a route key, look up the template
        const routeKey = routeKeyOrPath as keyof typeof ROUTES;
        const routeTemplate = ROUTES[routeKey];
        if (!routeTemplate) {
          throw new Error(`Route with key "${String(routeKey)}" not found`);
        }
        path = routeTemplate;
      }
      
      // Replace parameters in the path
      Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, String(value));
      });
      
      // Using "as any" to bypass the TypeScript limitation
      // This is safe because we're building paths from our routes registry
      navigateTo(path, options);
    } catch (error) {
      console.error('Route navigation error:', error);
      setError(error instanceof Error ? error : new Error('Unknown route navigation error'));
    }
  }, [navigateTo, setError]);

  const goBack = useCallback(() => {
    if (previousRoute) {
      navigateTo(previousRoute);
    } else {
      // If no previous route, navigate to a default location like home
      navigateTo('/');
    }
  }, [previousRoute, navigateTo]);

  const value: NavigationContextValue = {
    navigateTo,
    goBack,
    navigateToRoute,
    currentRoute,
    previousRoute,
    isNavigating,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};