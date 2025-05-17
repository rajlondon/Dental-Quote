/**
 * Hook for clinic authentication
 * This hook provides authentication functionality for the clinic portal
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface ClinicUser {
  id: string;
  email: string;
  name: string;
  role: string;
  clinic_id: string;
}

export function useClinicAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Get clinic user data
  const {
    data: user,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['/api/clinic/me'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/clinic/me');
        return response.json() as Promise<ClinicUser>;
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const response = await apiRequest('POST', '/api/clinic/login', {
        email,
        password,
      });
      return response.json() as Promise<ClinicUser>;
    },
    onSuccess: () => {
      toast({
        title: 'Login Successful',
        description: 'Welcome to the clinic portal',
      });
      refetchUser();
    },
    onError: (error: Error) => {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials. Please try again.',
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
      toast({
        title: 'Logout Successful',
        description: 'You have been logged out',
      });
      refetchUser();
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update loading state when user query status changes
  useEffect(() => {
    if (!isLoadingUser) {
      setIsLoading(false);
    }
  }, [isLoadingUser]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    loginIsLoading: loginMutation.isPending,
    logoutIsLoading: logoutMutation.isPending,
  };
}