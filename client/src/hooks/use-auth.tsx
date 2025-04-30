import React, { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// User types
interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  emailVerified?: boolean;
  status?: string;
  profileImage?: string;
  clinicId?: number;
  stripeCustomerId?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  consent?: boolean;
}

// Context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

// Create context
export const AuthContext = createContext<AuthContextType | null>(null);

// Authentication provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Track auth request state to avoid excessive queries
  const authRequestInFlight = React.useRef<Promise<User | null> | null>(null);
  
  // User data query with deduplication and caching
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      // If we already have a request in flight, reuse it to prevent duplicate calls
      if (authRequestInFlight.current) {
        console.log("Auth request already in flight, reusing");
        return authRequestInFlight.current;
      }
      
      // Otherwise, make a new request
      try {
        // Create promise and store it as the in-flight request
        authRequestInFlight.current = (async () => {
          try {
            // Try to read from sessionStorage first for clinic staff
            const cachedUserData = sessionStorage.getItem('cached_user_data');
            const cachedTimestamp = sessionStorage.getItem('cached_user_timestamp');
            
            // Use cache if it's fresh (less than 5 seconds old) to avoid double loads
            if (cachedUserData && cachedTimestamp) {
              const timestamp = parseInt(cachedTimestamp, 10);
              const age = Date.now() - timestamp;
              
              // Fresh cache (< 5 seconds old)
              if (age < 5000) {
                console.log(`Using cached user data (${age}ms old)`);
                const user = JSON.parse(cachedUserData);
                return user;
              }
            }
            
            // Fetch fresh data
            console.log("Fetching fresh user data");
            const res = await fetch("/api/auth/user");
            if (res.status === 401) {
              return null;
            }
            if (!res.ok) {
              throw new Error("Failed to fetch user data");
            }
            
            const data = await res.json();
            const userData = data.user || null;
            
            // Cache the user data for future use
            if (userData) {
              sessionStorage.setItem('cached_user_data', JSON.stringify(userData));
              sessionStorage.setItem('cached_user_timestamp', Date.now().toString());
            } else {
              // Clear cache if user is null
              sessionStorage.removeItem('cached_user_data');
              sessionStorage.removeItem('cached_user_timestamp');
            }
            
            return userData;
          } catch (error) {
            console.error("Error fetching user data:", error);
            return null;
          }
        })();
        
        // Wait for the request to complete
        const result = await authRequestInFlight.current;
        return result;
      } finally {
        // Clear the in-flight request after a short delay
        setTimeout(() => {
          authRequestInFlight.current = null;
        }, 50);
      }
    },
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
  
  // Login mutation with enhanced verification handling
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // Server expects email/password
      const res = await apiRequest("POST", "/api/auth/login", {
        email: credentials.email,
        password: credentials.password
      });
      
      // Handle specific response codes
      if (!res.ok) {
        const errorData = await res.json();
        
        // Special handling for verification errors
        if (res.status === 403 && errorData.code === "EMAIL_NOT_VERIFIED") {
          const verificationError = new Error(errorData.message);
          // @ts-ignore - Add custom properties to the error
          verificationError.code = "EMAIL_NOT_VERIFIED";
          // @ts-ignore
          verificationError.email = errorData.email;
          throw verificationError;
        }
        
        throw new Error(errorData.message || "Login failed");
      }
      
      const data = await res.json();
      
      // Store any warnings for display
      if (data.warnings && data.warnings.length > 0) {
        // Store warnings temporarily
        localStorage.setItem('auth_warnings', JSON.stringify(data.warnings));
      } else {
        localStorage.removeItem('auth_warnings');
      }
      
      // The server returns {success: true, user: {...}}
      return data.user || data;
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      
      // Check for auth warnings from localStorage
      const warningsStr = localStorage.getItem('auth_warnings');
      const warnings = warningsStr ? JSON.parse(warningsStr) : [];
      
      // Show appropriate messages based on verification status
      if (warnings.length > 0) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.firstName || user.email}! ${warnings[0]}`,
          variant: "destructive"
        });
        localStorage.removeItem('auth_warnings');
      } else if (user.role === 'patient' && user.status === 'pending' && !user.emailVerified) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.firstName || user.email}! Please verify your email to access all features.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.firstName || user.email}!`,
        });
      }
    },
    onError: (error: Error) => {
      // @ts-ignore - Check for custom error properties
      if (error.code === "EMAIL_NOT_VERIFIED") {
        toast({
          title: "Email verification required",
          description: "Your email has not been verified yet. Please check your inbox for the verification link.",
          variant: "destructive",
        });
        
        // @ts-ignore - Use the email from the error
        if (error.email) {
          // Redirect to verification sent page to allow resending
          window.location.href = `/verification-sent?email=${encodeURIComponent(error.email)}`;
        }
        return;
      }
      
      // Regular error handling
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }
      const data = await res.json();
      return data.user || data;
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
      if (!res.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      // Clear user data from query cache
      queryClient.setQueryData(["/api/auth/user"], null);
      
      // Clear all session-related caches for a clean logout
      sessionStorage.removeItem('cached_user_data');
      sessionStorage.removeItem('cached_user_timestamp');
      sessionStorage.removeItem('clinic_portal_timestamp');
      
      console.log("Auth cache cleared during logout");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}