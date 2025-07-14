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
  // We use a generous staleTime to avoid unnecessary refetches
  const { data, isLoading, error } = useQuery({
    queryKey: ['global-auth-user', Date.now()], // Add timestamp to force fresh requests
    queryFn: async () => {
      try {
        // NUCLEAR PROTECTION: Check if logout is in progress
        const logoutInProgress = sessionStorage.getItem('logout_in_progress') === 'true';
        const forcedLogoutTimestamp = sessionStorage.getItem('forced_logout_timestamp');
        const emergencyLogoutTimestamp = sessionStorage.getItem('emergency_logout_timestamp');
        
        if (logoutInProgress || forcedLogoutTimestamp || emergencyLogoutTimestamp) {
          console.log("🛑 GLOBAL AUTH PROTECTION: Blocking auth query during logout process");
          return null;
        }
        
        const response = await api.get('/api/auth/user', {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        console.log('GlobalAuthProvider: User data fetched successfully');
        return response.data?.user || null;
      } catch (error: any) {
        console.error('GlobalAuthProvider: Failed to fetch user data', error);
        // If 401, user is not authenticated
        if (error.response?.status === 401) {
          console.log('GlobalAuthProvider: User not authenticated (401)');
          return null;
        }
        // Don't throw - return null for unauthenticated state
        return null;
      }
    },
    staleTime: 0,             // Never consider data stale
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    retry: false,             // Don't retry failed requests
    refetchOnMount: true,     // Always refetch when component mounts
    enabled: true,            // Always enabled
    gcTime: 0,                // Don't cache queries after component unmount
  });

  // Log authentication state
  React.useEffect(() => {
    if (isLoading) {
      console.log('GlobalAuthProvider: Loading user data...');
    } else if (data) {
      console.log(`GlobalAuthProvider: Authenticated as ${data.email} (${data.role})`);
    } else {
      console.log('GlobalAuthProvider: Not authenticated');
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