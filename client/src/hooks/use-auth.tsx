import React, { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api"; // Import our configured axios instance

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
  phone?: string;
  // New profile fields added for type safety
  profileComplete?: boolean;
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
  
  // Use simpler tracking for component lifecycle
  const componentInitTime = React.useRef<number>(Date.now());
  
  // Use flags to prevent multiple state updates
  const isComponentMounted = React.useRef(true);
  const userDataRef = React.useRef<User | null>(null);
  
  React.useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
    };
  }, []);
  
  // Read from cache initially to avoid flickering
  React.useEffect(() => {
    const cachedUserData = sessionStorage.getItem('cached_user_data');
    if (cachedUserData) {
      try {
        const parsedUser = JSON.parse(cachedUserData);
        userDataRef.current = parsedUser;
      } catch (e) {
        console.error("Failed to parse cached user data", e);
      }
    }
  }, []);
  
  // Simplified query that uses our stable userDataRef
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/auth/user"], // Updated to use consistent path without /api prefix
    queryFn: async () => {
      // If we're in admin mode and already have cached data, return it directly to prevent loops
      if (window.location.pathname === '/admin-portal' && userDataRef.current) {
        console.log("Returning cached user data for admin portal to prevent refresh loops");
        return userDataRef.current;
      }
      
      // Fix for the duplicate API paths issue - ensure we're only calling /api/auth/user
      // and not accidentally duplicating the /api prefix

      // Check sessionStorage cache
      const cachedUserData = sessionStorage.getItem('cached_user_data');
      const cachedTimestamp = sessionStorage.getItem('cached_user_timestamp');
            
      if (cachedUserData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const age = Date.now() - timestamp;
        
        if (age < 30000) { // 30 seconds cache for stability
          const parsedUser = JSON.parse(cachedUserData);
          userDataRef.current = parsedUser;
          console.log(`Using cached user data (${age}ms old)`);
          return parsedUser;
        }
      }
      
      // Fetch fresh data
      try {
        console.log("Fetching fresh user data");
        // IMPORTANT: The api.get call automatically adds "/api" prefix (see client/src/lib/api.ts)
        // So we must NOT include /api here to avoid making a call to /api/api/auth/user
        console.log("Fetching user data with axios configured client");
        const apiRes = await api.get("/auth/user");
        const userData = apiRes.data.user || null;
        
        // Update cache
        if (userData) {
          userDataRef.current = userData;
          sessionStorage.setItem('cached_user_data', JSON.stringify(userData));
          sessionStorage.setItem('cached_user_timestamp', Date.now().toString());
        } else {
          userDataRef.current = null;
          sessionStorage.removeItem('cached_user_data');
          sessionStorage.removeItem('cached_user_timestamp');
        }
        
        return userData;
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.warn("Authentication failed - session may have expired");
          userDataRef.current = null;
          sessionStorage.removeItem('cached_user_data');
          sessionStorage.removeItem('cached_user_timestamp');
          return null;
        }
        throw new Error(`Failed to fetch user data: ${error.message || 'Unknown error'}`);
      }
    },
    staleTime: 30000, // Increase stale time to 30 seconds for more stability
    refetchOnWindowFocus: false // Disable refetching on window focus to prevent loops
  });
  
  // Login mutation with enhanced verification handling
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // Server expects email/password
      // We've updated apiRequest to add the /api prefix if it's not already there
      // So this should now be consistent across both axios and fetch clients
      console.log("Executing login with enhanced apiRequest");
      const res = await apiRequest("POST", "/auth/login", {
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
      // Update query cache with the new user data - use consistent path without /api prefix
      queryClient.setQueryData(["/auth/user"], user);
      
      // Set session flag for WebSocket initialization
      sessionStorage.setItem('just_logged_in', 'true');
      sessionStorage.setItem('login_timestamp', Date.now().toString());
      
      // Cache user data for faster access
      sessionStorage.setItem('cached_user_data', JSON.stringify(user));
      sessionStorage.setItem('cached_user_timestamp', Date.now().toString());

      // FIXED: Don't force reload for clinic staff by removing timestamp
      // Commenting out this part as it's causing the refresh cycles
      /*
      if (user.role === 'clinic_staff') {
        sessionStorage.removeItem('clinic_portal_timestamp');
      }
      */
      
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
      // Define a custom error type with the properties we need
      interface VerificationError extends Error {
        code?: string;
        email?: string;
      }
      
      // Cast the error to our custom type
      const verificationError = error as VerificationError;
      
      // Check for specific verification error
      if (verificationError.code === "EMAIL_NOT_VERIFIED") {
        toast({
          title: "Email verification required",
          description: "Your email has not been verified yet. Please check your inbox for the verification link.",
          variant: "destructive",
        });
        
        // Use the email from the custom error property
        if (verificationError.email) {
          // Redirect to verification sent page to allow resending
          window.location.href = `/verification-sent?email=${encodeURIComponent(verificationError.email)}`;
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
      // We've updated apiRequest to add the /api prefix if it's not already there
      // So this should now be consistent across both axios and fetch clients
      console.log("Executing registration with enhanced apiRequest");
      const res = await apiRequest("POST", "/auth/register", userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }
      const data = await res.json();
      return data.user || data;
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/auth/user"], user);
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
      // We've updated apiRequest to add the /api prefix if it's not already there
      // So this should now be consistent across both axios and fetch clients
      console.log("Executing logout with enhanced apiRequest");
      const res = await apiRequest("POST", "/auth/logout");
      if (!res.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      // Clear user data from query cache - use consistent path without /api prefix
      queryClient.setQueryData(["/auth/user"], null);
      
      // Clear all session-related caches for a clean logout
      sessionStorage.removeItem('cached_user_data');
      sessionStorage.removeItem('cached_user_timestamp');
      sessionStorage.removeItem('clinic_portal_timestamp');
      
      // Clear all clinic-related flags
      sessionStorage.removeItem('clinic_portal_access_successful');
      sessionStorage.removeItem('is_clinic_staff');
      sessionStorage.removeItem('disable_promo_redirect');
      sessionStorage.removeItem('no_special_offer_redirect');
      sessionStorage.removeItem('disable_quote_redirect');
      sessionStorage.removeItem('clinic_session_active');
      sessionStorage.removeItem('clinic_user_id');
      sessionStorage.removeItem('clinic_id');
      sessionStorage.removeItem('clinic_dashboard_requested');
      sessionStorage.removeItem('clinic_login_in_progress');
      
      // Clear clinic cookies by setting them to expire immediately
      document.cookie = "is_clinic_staff=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "is_clinic_login=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "no_promo_redirect=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "disable_quote_redirect=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "clinic_session_active=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "no_special_offer_redirect=; path=/; max-age=0; SameSite=Lax";
      
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