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
  const [loading, setLoading] = useState<boolean>(false); // Start with not loading
  const [error, setError] = useState<string | null>(null);
  
  // NOTE: We've removed the automatic auth check on mount
  // This helps prevent excessive API calls when not needed
  
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
  
  // Login function with improved session handling
  const login = async (email: string, password: string, role: string): Promise<AuthResult> => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = getBaseUrl();
      console.log(`Logging in with ${baseUrl}/api/auth/login`);
      
      // Clean the credentials to ensure no whitespace or other issues
      const cleanEmail = email.trim();
      
      // Add delay for better loading experience and to ensure request completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set cookies and use credentials for cross-origin requests
      const response = await authAxios.post(`${baseUrl}/api/auth/login`, {
        email: cleanEmail,
        password: password,
        role: role,
        // Add client timestamp to help debug session issues
        _client_ts: Date.now()
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Login response status:', response.status);
      
      if (response.data.success && response.data.user) {
        console.log('Login successful, setting user data');
        
        // Set user in state
        setUser(response.data.user);
        
        // Also store in sessionStorage as a backup
        sessionStorage.setItem('user_data', JSON.stringify(response.data.user));
        sessionStorage.setItem('user_role', response.data.user.role);
        sessionStorage.setItem('auth_timestamp', Date.now().toString());
        
        if (response.data.user.role === 'clinic_staff') {
          sessionStorage.setItem('is_clinic_staff', 'true');
        }
        
        // Wait a moment to ensure cookies are properly set
        await new Promise(resolve => setTimeout(resolve, 200));
        
        return {
          success: true,
          user: response.data.user
        };
      } else {
        const errorMessage = response.data.message || 'Login failed';
        console.error('Login response indicates failure:', errorMessage);
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage
        };
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Enhanced error handling with better extraction of server message
      let errorMsg = 'An error occurred during login';
      
      if (err.response && err.response.data) {
        errorMsg = err.response.data.message || errorMsg;
        console.error('Server error response:', err.response.data);
      }
      
      // If wrong password error, provide more specific message
      if (errorMsg.includes('password')) {
        errorMsg = 'Incorrect password. Please check your credentials and try again.';
      }
      
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
  
  // Enhanced check for clinic status with detailed diagnostic information
  const checkClinicStatus = async (): Promise<AuthResult> => {
    try {
      setLoading(true);
      
      // First try the diagnostic endpoint to get detailed session information
      const baseUrl = getBaseUrl();
      
      // Check the diagnostic endpoint first
      try {
        const diagnosticResponse = await authAxios.get(`${baseUrl}/api/clinic-status/check`, {
          withCredentials: true
        });
        
        console.log('Auth diagnostic response:', diagnosticResponse.data);
        
        // If we're already authenticated according to diagnostics, use that information
        if (diagnosticResponse.data.authenticated && diagnosticResponse.data.user) {
          setUser(diagnosticResponse.data.user);
          return {
            success: true,
            user: diagnosticResponse.data.user
          };
        }
        
        // If the diagnostic shows session issues, log them
        if (!diagnosticResponse.data.hasCookies) {
          console.warn('No cookies found in diagnostic check - session may be lost');
        }
      } catch (diagErr) {
        console.error('Auth diagnostic check failed:', diagErr);
      }
      
      // Proceed with the normal status check
      const response = await authAxios.get(`${baseUrl}/api/clinic-status`, {
        withCredentials: true
      });
      
      if (response.data.success && response.data.user) {
        console.log('Clinic status check successful, user:', response.data.user);
        setUser(response.data.user);
        
        // Also update the session storage as a backup mechanism
        sessionStorage.setItem('user_data', JSON.stringify(response.data.user));
        sessionStorage.setItem('user_role', response.data.user.role);
        
        if (response.data.user.role === 'clinic_staff') {
          sessionStorage.setItem('is_clinic_staff', 'true');
        }
        
        return {
          success: true,
          user: response.data.user
        };
      } else {
        // Try to use session storage as fallback if API call succeeded but no user in response
        const storedUserData = sessionStorage.getItem('user_data');
        if (storedUserData) {
          try {
            const storedUser = JSON.parse(storedUserData);
            console.log('Using stored user data as fallback:', storedUser);
            setUser(storedUser);
            return {
              success: true,
              user: storedUser
            };
          } catch (parseErr) {
            console.error('Failed to parse stored user data:', parseErr);
          }
        }
        
        return {
          success: false,
          message: 'Not authenticated as clinic staff'
        };
      }
    } catch (err: any) {
      console.error('Clinic status check error:', err);
      
      // Try to use session storage as fallback
      const storedUserData = sessionStorage.getItem('user_data');
      if (storedUserData) {
        try {
          const storedUser = JSON.parse(storedUserData);
          console.log('Using stored user data as fallback after error:', storedUser);
          setUser(storedUser);
          return {
            success: true,
            user: storedUser
          };
        } catch (parseErr) {
          console.error('Failed to parse stored user data:', parseErr);
        }
      }
      
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