import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';  // Our centralized axios instance with withCredentials:true

// Define the context type with user and loading state
type GlobalAuthContext = { 
  user: any | null; 
  loading: boolean;
  error: Error | null;
};

// Create context with default values
const GlobalAuthContext = createContext<GlobalAuthContext>({ 
  user: null, 
  loading: true,
  error: null
});

// Hook to use this context
export const useGlobalAuth = () => useContext(GlobalAuthContext);

/**
 * Global Authentication Provider
 * This provides a single source of truth for authentication at the app level
 * It manages auth state in one place to prevent race conditions and flash redirects
 */
export function GlobalAuthProvider({ children }: { children: React.ReactNode }) {
  // Use React Query to fetch and cache user data
  // Fixed staleTime to prevent infinite refetching
  const { data, isLoading, error } = useQuery({
    queryKey: ['global-auth-user'], // Remove changing timestamp to prevent infinite loops
    queryFn: async () => {
      console.log('🌐 GLOBAL AUTH QUERY: Starting user data fetch');
      try {
        // Check if we're on pages that should never auto-authenticate
        if (typeof window !== 'undefined') {
          const isOnQuoteFlow = window.location.pathname.includes('/your-quote') ||
                               window.location.pathname.includes('/quote-results') ||
                               window.location.pathname.includes('/matched-clinics') ||
                               window.location.search.includes('promo=') ||
                               window.location.pathname === '/';
          
          const isAccessingPatientPortalDirectly = window.location.pathname === '/patient-portal' ||
                                                   window.location.pathname === '/client-portal';
          
          // Skip auth for quote flows to prevent auto-login
          if (isOnQuoteFlow && !isAccessingPatientPortalDirectly) {
            console.log('🌐 GLOBAL AUTH QUERY: Skipping auth check for quote flow - preventing auto-login');
            return null;
          }
        }
        
        const response = await api.get('/auth/user');
        console.log('🌐 GLOBAL AUTH QUERY: User data fetched successfully');
        return response.data?.user || null;
      } catch (error: any) {
        console.error('🌐 GLOBAL AUTH QUERY: Failed to fetch user data', error);
        // If 401, user is not authenticated
        if (error.response?.status === 401) {
          console.log('🌐 GLOBAL AUTH QUERY: User not authenticated (401)');
          return null;
        }
        return null;
      }
    },
    staleTime: 30000,         // 30 seconds cache to prevent infinite loops
    refetchOnWindowFocus: false,
    retry: 1,
    refetchOnMount: true,
    enabled: true,
    gcTime: 60000,            // 1 minute cache time
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });

  // Log authentication state
  React.useEffect(() => {
    if (isLoading) {
      console.log('🌐 GLOBAL AUTH: Loading user data...');
    } else if (data) {
      console.log(`🌐 GLOBAL AUTH: Authenticated as ${data.email} (${data.role})`);
    } else {
      console.log('🌐 GLOBAL AUTH: Not authenticated');
    }
  }, [isLoading, data]);

  // Provide the auth context to all children
  return (
    <GlobalAuthContext.Provider 
      value={{ 
        user: data, 
        loading: isLoading,
        error: error as Error | null
      }}
    >
      {children}
    </GlobalAuthContext.Provider>
  );
}