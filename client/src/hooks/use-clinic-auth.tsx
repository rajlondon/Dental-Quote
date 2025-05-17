/**
 * Hook for clinic authentication
 * This hook provides authentication state and functions for clinic users
 */
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Clinic user type
export interface ClinicUser {
  id: number;
  name: string;
  email: string;
  role: string;
  clinic_id: number;
}

// Context type
interface ClinicAuthContextType {
  user: ClinicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context
const ClinicAuthContext = createContext<ClinicAuthContextType | null>(null);

// Provider component
export function ClinicAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Get the current clinic user
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['/api/clinic/user'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/clinic/user');
        const data = await response.json();
        return data as ClinicUser;
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  // Update authentication state when user data changes
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/clinic/login', { email, password });
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: 'Login Successful',
        description: 'Welcome to your clinic dashboard',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/clinic/logout');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/user'] });
      queryClient.clear();
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Login function
  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <ClinicAuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </ClinicAuthContext.Provider>
  );
}

// Hook to use clinic authentication
export function useClinicAuth() {
  const context = useContext(ClinicAuthContext);
  if (!context) {
    throw new Error('useClinicAuth must be used within a ClinicAuthProvider');
  }
  return context;
}