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
    queryKey: ['global-auth-user'], // Remove timestamp to allow caching
    queryFn: async () => {
      console.log('🌐 GLOBAL AUTH QUERY: Starting user data fetch');
      try {
        
        
        const response = await api.get('/auth/user', {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        console.log('🌐 GLOBAL AUTH QUERY: User data fetched successfully');
        return response.data?.user || null;
      } catch (error: any) {
        console.error('🌐 GLOBAL AUTH QUERY: Failed to fetch user data', error);
        // If 401, user is not authenticated
        if (error.response?.status === 401) {
          console.log('🌐 GLOBAL AUTH QUERY: User not authenticated (401)');
          return null;
        }
        // Don't throw - return null for unauthenticated state
        return null;
      }
    },
    staleTime: 30000,         // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    retry: 1,                 // Retry failed requests once
    refetchOnMount: false,    // Don't always refetch on mount
    enabled: true,            // Always enabled
    gcTime: 300000,           // Cache for 5 minutes
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