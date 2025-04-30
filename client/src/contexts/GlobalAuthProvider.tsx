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
    queryKey: ['global-auth-user'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/auth/user');
        console.log('GlobalAuthProvider: User data fetched successfully');
        return response.data?.user || null;
      } catch (error) {
        console.error('GlobalAuthProvider: Failed to fetch user data', error);
        // Don't throw - return null for unauthenticated state
        return null;
      }
    },
    staleTime: 60000,         // Consider data fresh for 60 seconds
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    retry: 1,                 // Only retry once if the request fails
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