import { useQuery } from '@tanstack/react-query';

interface User {
  id: string | number;
  username?: string;
  name?: string;
  role: string;
  email?: string;
}

export interface AdminAuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

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