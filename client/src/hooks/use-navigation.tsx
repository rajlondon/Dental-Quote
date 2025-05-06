import React, { createContext, useState, useCallback, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import ROUTES from '@/lib/routes';

type NavigationContextType = {
  navigateTo: (path: string, options?: NavigationOptions) => void;
  isNavigating: boolean;
  currentPath: string;
};

type NavigationOptions = {
  saveInSessionStorage?: { key: string; value: string };
  replace?: boolean;
  retry?: boolean;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [, setLocation] = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPath, setCurrentPath] = useState(() => {
    // Use the current path or default to home
    return typeof window !== 'undefined' ? window.location.pathname : ROUTES.HOME;
  });

  // Monitor navigation state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Update current path when location changes
    setCurrentPath(window.location.pathname);
    
    // Create a handler to track navigation state
    const handleNavStart = () => setIsNavigating(true);
    const handleNavEnd = () => {
      setIsNavigating(false);
      setCurrentPath(window.location.pathname);
    };
    
    // Add event listeners for navigation
    window.addEventListener('beforeunload', handleNavStart);
    window.addEventListener('load', handleNavEnd);
    
    // Intercept click events on links to monitor navigation
    const linkClickHandler = (e: MouseEvent) => {
      // Check if it's an anchor element or has an anchor parent
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.href && !anchor.target && 
          anchor.href.startsWith(window.location.origin) && 
          !anchor.classList.contains('no-navigation-indicator') &&
          !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        setIsNavigating(true);
        // Navigation indicator will be cleared after page loads
        setTimeout(() => setIsNavigating(false), 5000); // Safeguard in case page load event doesn't fire
      }
    };
    
    document.addEventListener('click', linkClickHandler);
    
    return () => {
      window.removeEventListener('beforeunload', handleNavStart);
      window.removeEventListener('load', handleNavEnd);
      document.removeEventListener('click', linkClickHandler);
    };
  }, []);

  /**
   * Safe navigation function that handles all route changes
   */
  const navigateTo = useCallback((path: string, options?: NavigationOptions) => {
    if (typeof window === 'undefined') return;
    
    // Start navigation state
    setIsNavigating(true);
    
    // Save any state in session storage if needed
    if (options?.saveInSessionStorage) {
      const { key, value } = options.saveInSessionStorage;
      sessionStorage.setItem(key, value);
    }
    
    // Execute navigation
    if (options?.replace) {
      // Use replace to avoid adding to history
      setLocation(path, { replace: true });
    } else {
      // Default navigation
      setLocation(path);
    }
    
    // Safety timeout to clear navigation state if the load event doesn't fire
    setTimeout(() => {
      setIsNavigating(false);
      setCurrentPath(window.location.pathname);
    }, 1000);
  }, [setLocation]);
  
  return (
    <NavigationContext.Provider value={{ navigateTo, isNavigating, currentPath }}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * Custom hook for consistent navigation throughout the app
 */
export function useNavigation() {
  const context = useContext(NavigationContext);
  
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  
  return context;
}

/**
 * Utility to navigate to a treatment line detail
 */
export function useNavigateToTreatmentDetail() {
  const { navigateTo } = useNavigation();
  
  return useCallback((treatmentLineId: string) => {
    navigateTo(`/portal/treatment/${treatmentLineId}`, {
      saveInSessionStorage: {
        key: 'selected_treatment_line_id',
        value: treatmentLineId
      }
    });
  }, [navigateTo]);
}

/**
 * Utility to navigate to a quote detail
 */
export function useNavigateToQuoteDetail() {
  const { navigateTo } = useNavigation();
  
  return useCallback((quoteId: string) => {
    navigateTo(`/portal/quotes/${quoteId}`, {
      saveInSessionStorage: {
        key: 'selected_quote_id',
        value: quoteId
      }
    });
  }, [navigateTo]);
}