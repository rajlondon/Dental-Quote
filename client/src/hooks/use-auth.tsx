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

  // Read from cache initially to avoid flickering and clean up old debugging flags
  React.useEffect(() => {
    // Clean up old debugging flags from previous versions
    const oldFlags = [
      'logout_in_progress',
      'forced_logout_timestamp', 
      'emergency_logout_timestamp',
      'auth_disabled',
      'ultimate_logout_flag',
      'immediate_logout_timestamp',
      'auth_completely_disabled',
      'client_side_logout_complete'
    ];

    oldFlags.forEach(flag => {
      sessionStorage.removeItem(flag);
      localStorage.removeItem(flag);
    });

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
      console.log("🔍 AUTH QUERY: Starting user authentication check");
      try {

        // Check if we're on pages that should never use auth cache
        const isOnPublicPage = window.location.pathname.includes('/portal-login') ||
                              window.location.pathname.includes('/login') ||
                              window.location.pathname.includes('/your-quote') ||
                              window.location.pathname.includes('/matched-clinics') ||
                              window.location.pathname === '/' ||
                              window.location.search.includes('promo=');

        // NEVER use cache on public pages - always check with server
        if (!isOnPublicPage) {
          const cachedUserData = sessionStorage.getItem('cached_user_data');
          const cachedTimestamp = sessionStorage.getItem('cached_user_timestamp');

          if (cachedUserData && cachedTimestamp) {
            const timestamp = parseInt(cachedTimestamp, 10);
            const age = Date.now() - timestamp;

            if (age < 10000) { // 10 seconds cache for quick access
              const parsedUser = JSON.parse(cachedUserData);
              userDataRef.current = parsedUser;
              console.log(`🔍 AUTH QUERY: Using cached user data (${age}ms old), role: ${parsedUser?.role}`);
              return parsedUser;
            }
          }
        }

        // Fetch fresh data from server
        console.log("🔍 AUTH QUERY: Fetching fresh user data from server");
        const apiRes = await api.get("/auth/user");
        const userData = apiRes.data.user || null;

        console.log("🔍 AUTH QUERY: Server response user data:", userData ? `ID: ${userData.id}, Role: ${userData.role}` : 'null');

        // Update cache and ref
        if (userData) {
          console.log("🔍 AUTH QUERY: User authenticated, updating cache");
          userDataRef.current = userData;
          sessionStorage.setItem('cached_user_data', JSON.stringify(userData));
          sessionStorage.setItem('cached_user_timestamp', Date.now().toString());
        } else {
          console.log("🔍 AUTH QUERY: No user data, clearing cache");
          userDataRef.current = null;
          sessionStorage.removeItem('cached_user_data');
          sessionStorage.removeItem('cached_user_timestamp');
        }

        return userData;
      } catch (error: any) {
        console.log('🔍 AUTH QUERY: Auth query error:', error?.response?.status, error?.message);
        // If we get a 401, it just means user is not authenticated
        if (error.response?.status === 401) {
          console.log('🔍 AUTH QUERY: 401 - User not authenticated');
          return null;
        }
        // For any other error, also return null to prevent crashes
        console.warn('🔍 AUTH QUERY: Authentication check failed:', error?.message);
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
      console.log('🚪 LOGOUT: Starting logout process');

      // Clear any cached user data immediately
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('cached_user_data');
        localStorage.removeItem('authToken');
      }

      try {
        // Call logout endpoint with credentials
        const response = await api.post('/auth/logout', { 
          ultimateLogout: true,
          forceDestroy: true 
        }, {
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });

        console.log('🚪 LOGOUT: Server logout response:', response.data);
        return response.data;
      } catch (error) {
        console.warn('🚪 LOGOUT: Server logout failed, continuing with client cleanup:', error);
        // Continue with client-side cleanup even if server logout fails
        return { success: true, clientOnly: true };
      }
    },
    onSuccess: () => {
      console.log('🚪 LOGOUT SUCCESS: User logged out successfully');

      // Clear React Query cache completely
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.setQueryData(['auth-user'], null);
      queryClient.setQueryData(['global-auth-user'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      queryClient.invalidateQueries({ queryKey: ['global-auth-user'] });
      queryClient.clear();

      // Clear all cached data
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.clear();

        // Clear any cookies by setting them to expire
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        });

        // Redirect to home page instead of just reloading
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
    },
    onError: (error) => {
      console.error('🚪 LOGOUT ERROR:', error);

      // Force clear everything on error too
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.setQueryData(['auth-user'], null);
      queryClient.setQueryData(['global-auth-user'], null);
      queryClient.clear();

      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.clear();

        // Clear cookies even on error
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        });
      }
    }
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