import { useQuery } from "@tanstack/react-query";

// For backward compatibility with existing usage
interface User {
  id: string | number;
  username?: string;
  name?: string;
  role: string;
  email?: string;
}

// Simple interface for components that just need to check authentication
export interface AdminAuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

// A simple hook for components that need to check admin authentication
export function useAdminAuth(): AdminAuthContextType {
  const { 
    data: user, 
    isLoading, 
    error 
  } = useQuery<User | null>({ 
    queryKey: ['/api/admin/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/admin/auth/user');
      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error('Failed to fetch admin user');
      }
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: user || null,
    isLoading,
    error: error as Error | null,
  };
}