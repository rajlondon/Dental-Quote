import React, { createContext, useContext, useEffect } from 'react';
import { useToast } from './use-toast';

// Simple context to track if we're in the clinic portal
const ClinicQueryContext = createContext<{
  preventRedirects: boolean;
}>({
  preventRedirects: true
});

/**
 * Provider component that ensures clinic queries never redirect on error
 * Simplified version that only blocks reload attempts
 */
export const ClinicQueryProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { toast } = useToast();
  
  // Log when this provider is mounted to help with debugging
  useEffect(() => {
    console.log('ClinicQueryProvider mounted - redirect prevention active');
    
    // Block reload attempts in the clinic portal
    const preventReload = (e: BeforeUnloadEvent) => {
      if (window.location.pathname.includes('clinic-portal')) {
        console.log('🛡️ Blocked programmatic page reload on clinic portal');
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
      return undefined;
    };
    
    window.addEventListener('beforeunload', preventReload);
    
    return () => {
      window.removeEventListener('beforeunload', preventReload);
      console.log('ClinicQueryProvider unmounted - removed event listeners');
    };
  }, []);
  
  return (
    <ClinicQueryContext.Provider value={{
      preventRedirects: true
    }}>
      {children}
    </ClinicQueryContext.Provider>
  );
};

/**
 * Hook to access clinic query settings
 */
export const useClinicQuerySettings = () => {
  return useContext(ClinicQueryContext);
};