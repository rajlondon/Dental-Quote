import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

// Define the user interface
interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  clinicId?: number;
  status?: string;
}

// Define the auth context interface
interface SimpleAuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Create the context with default values
const SimpleAuthContext = createContext<SimpleAuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => false,
  logout: async () => {},
});

// Provider component
export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch user data on initial load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/auth/user');
        
        if (response.data.success && response.data.user) {
          console.log('User authenticated:', response.data.user);
          setUser(response.data.user);
          
          // Cache user data in session storage
          sessionStorage.setItem('user_data', JSON.stringify(response.data.user));
          sessionStorage.setItem('user_role', response.data.user.role);
          
          if (response.data.user.role === 'clinic_staff') {
            sessionStorage.setItem('is_clinic_staff', 'true');
          }
        } else {
          console.log('No authenticated user found');
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        
        // Cache user data
        sessionStorage.setItem('user_data', JSON.stringify(response.data.user));
        sessionStorage.setItem('user_role', response.data.user.role);
        
        if (response.data.user.role === 'clinic_staff') {
          sessionStorage.setItem('is_clinic_staff', 'true');
        }
        
        toast({
          title: 'Login Successful',
          description: `Welcome, ${response.data.user.firstName || response.data.user.email}!`,
        });
        
        return true;
      } else {
        setError(new Error('Invalid login credentials'));
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err : new Error('Login failed. Please try again.'));
      
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials or server error. Please try again.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await api.post('/auth/logout');
      
      // Clear session storage and state
      sessionStorage.removeItem('user_data');
      sessionStorage.removeItem('user_role');
      sessionStorage.removeItem('is_clinic_staff');
      
      setUser(null);
      
      toast({
        title: 'Logout Successful',
        description: 'You have been logged out successfully.',
      });
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err : new Error('Logout failed. Please try again.'));
      
      toast({
        title: 'Logout Failed',
        description: 'An error occurred during logout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SimpleAuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

// Hook to use the auth context
export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  
  return context;
}