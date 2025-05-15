/**
 * A specialized authentication hook that ensures proper cookie handling
 * across all API requests for improved session persistence.
 */
import { useState, useEffect } from 'react';
import axios from 'axios';

// Create a dedicated axios instance for authentication with cookie support
const authAxios = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Define auth result interface
interface AuthResult {
  success: boolean;
  user?: any;
  message?: string;
}

export function useCookieAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Function to get base URL with correct protocol and host
  const getBaseUrl = () => {
    return `${window.location.protocol}//${window.location.host}`;
  };
  
  // Check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = getBaseUrl();
      const response = await authAxios.get(`${baseUrl}/api/auth/user`);
      
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Login function
  const login = async (email: string, password: string, role: string): Promise<AuthResult> => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = getBaseUrl();
      console.log(`Logging in with ${baseUrl}/api/auth/login`);
      
      const response = await authAxios.post(`${baseUrl}/api/auth/login`, {
        email,
        password,
        role
      });
      
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        return {
          success: true,
          user: response.data.user
        };
      } else {
        setError(response.data.message || 'Login failed');
        return {
          success: false,
          message: response.data.message || 'Login failed'
        };
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || 'An error occurred during login';
      setError(errorMsg);
      return {
        success: false,
        message: errorMsg
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      const baseUrl = getBaseUrl();
      await authAxios.post(`${baseUrl}/api/auth/logout`);
      
      setUser(null);
      return true;
    } catch (err) {
      console.error('Logout error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Check clinic status for clinic portal
  const checkClinicStatus = async (): Promise<AuthResult> => {
    try {
      setLoading(true);
      
      const baseUrl = getBaseUrl();
      const response = await authAxios.get(`${baseUrl}/api/clinic-status`);
      
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        return {
          success: true,
          user: response.data.user
        };
      } else {
        return {
          success: false,
          message: 'Not authenticated as clinic staff'
        };
      }
    } catch (err: any) {
      console.error('Clinic status check error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to verify clinic status'
      };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    user,
    loading,
    error,
    login,
    logout,
    checkAuthStatus,
    checkClinicStatus
  };
}