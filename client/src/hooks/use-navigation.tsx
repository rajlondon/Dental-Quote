import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import ROUTES, { isValidRoute, getSafeRedirect } from '@/lib/routes';
import { useAuth } from '@/hooks/use-auth';

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
  const [location, setLocation] = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  /**
   * Safe navigation function that handles all route changes
   */
  const navigateTo = useCallback((path: string, options?: NavigationOptions) => {
    // Start navigation indicator
    setIsNavigating(true);
    
    // Validate that the route exists
    const validatedPath = getSafeRedirect(path, user?.role);
    
    if (validatedPath !== path) {
      console.warn(`[Navigation] Invalid route attempted: ${path}, redirected to: ${validatedPath}`);
      
      // Show warning toast if not a retry attempt (prevents infinite loop)
      if (!options?.retry) {
        toast({
          title: "Navigation Error",
          description: "The page you attempted to visit doesn't exist. Redirecting you to a valid page.",
          variant: "destructive"
        });
      }
    }
    
    // Save any state in session storage before navigation if requested
    if (options?.saveInSessionStorage) {
      try {
        sessionStorage.setItem(
          options.saveInSessionStorage.key, 
          options.saveInSessionStorage.value
        );
        console.log(`[Navigation] Saved ${options.saveInSessionStorage.key} in session storage`);
      } catch (error) {
        console.error('[Navigation] Failed to save in session storage:', error);
      }
    }
    
    // Use short timeout to ensure loading state is visible
    // This helps users understand navigation is happening
    setTimeout(() => {
      // Use replace or normal navigation
      if (options?.replace) {
        setLocation(validatedPath, { replace: true });
      } else {
        setLocation(validatedPath);
      }
      
      // End navigation indicator
      setIsNavigating(false);
    }, 100);
  }, [setLocation, toast, user]);

  return (
    <NavigationContext.Provider 
      value={{ 
        navigateTo,
        isNavigating,
        currentPath: location 
      }}
    >
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
    navigateTo(ROUTES.PATIENT_TREATMENT_DETAIL(treatmentLineId), {
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
    navigateTo(ROUTES.PATIENT_QUOTE_DETAIL(quoteId));
  }, [navigateTo]);
}

export default useNavigation;