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
    queryKey: ["/auth/user"],
    queryFn: async () => {
      try {
        // Check sessionStorage cache first
        const cachedUserData = sessionStorage.getItem('cached_user_data');
        const cachedTimestamp = sessionStorage.getItem('cached_user_timestamp');

        if (cachedUserData && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp, 10);
          const age = Date.now() - timestamp;

          if (age < 10000) { // 10 seconds cache for quick access
            const parsedUser = JSON.parse(cachedUserData);
            userDataRef.current = parsedUser;
            console.log(`Using cached user data (${age}ms old), role: ${parsedUser?.role}`);
            return parsedUser;
          }
        }

        // Fetch fresh data from server
        console.log("Fetching fresh user data from server");
        const apiRes = await api.get("/auth/user");
        const userData = apiRes.data.user || null;

        console.log("Server response user data:", userData ? `ID: ${userData.id}, Role: ${userData.role}` : 'null');

        // Update cache and ref
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
        console.log('Auth query error:', error?.response?.status, error?.message);
        // If we get a 401, it just means user is not authenticated
        if (error.response?.status === 401) {
          return null;
        }
        // For any other error, also return null to prevent crashes
        console.warn('Authentication check failed:', error?.message);
        return null;
      }
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: false // Disable retries to prevent loops
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
      // Update query cache with the new user data
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
      if (user.role === 'clinic') {
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
      const res = await apiRequest("POST", "/api/auth/register", userData);
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
      const res = await apiRequest("POST", "/api/auth/logout");
      if (!res.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      // Clear user data from query cache
      queryClient.setQueryData(["/auth/user"], null);

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