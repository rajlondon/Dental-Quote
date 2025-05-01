import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Simplified admin user type
interface AdminUser {
  id: number;
  email: string;
  role: string;
}

// Context type
type AdminAuthContextType = {
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: Error | null;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => Promise<void>;
};

// Create context
export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

/**
 * Admin-specific authentication provider that bypasses React Query
 * to prevent infinite update loops
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isInitialized = React.useRef(false);

  // On mount, check for cached admin user data first
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const checkAdminAuth = async () => {
      try {
        // First check for cached admin session
        const cachedAdminData = sessionStorage.getItem('admin_user_data');
        if (cachedAdminData) {
          try {
            const parsedUser = JSON.parse(cachedAdminData);
            if (parsedUser && parsedUser.role === 'admin') {
              console.log('Using cached admin data to prevent refresh loops');
              setAdminUser(parsedUser);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Failed to parse cached admin data', e);
          }
        }

        // Fallback to a fetch request if needed
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.user || null;
          
          if (userData && userData.role === 'admin') {
            setAdminUser(userData);
            // Cache for future use
            sessionStorage.setItem('admin_user_data', JSON.stringify(userData));
          }
        } else if (response.status !== 401) {
          // Only treat non-401 responses as errors
          throw new Error(`Failed to fetch admin user: ${response.statusText}`);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error('Unknown error checking admin authentication'));
        }
        console.error('Admin auth check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  // Simple admin login function that doesn't use React Query
  const adminLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      const userData = data.user || data;
      
      if (userData.role !== 'admin') {
        throw new Error('Not authorized as admin');
      }
      
      // Update state and cache
      setAdminUser(userData);
      sessionStorage.setItem('admin_user_data', JSON.stringify(userData));
      sessionStorage.setItem('admin_login_time', Date.now().toString());
      
      toast({
        title: "Admin Login Successful",
        description: `Welcome back, ${userData.firstName || userData.email}!`,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
        toast({
          title: "Admin Login Failed",
          description: err.message,
          variant: "destructive"
        });
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Simple admin logout function
  const adminLogout = async () => {
    try {
      setIsLoading(true);
      
      // Call the logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear state and cache regardless of response
      setAdminUser(null);
      sessionStorage.removeItem('admin_user_data');
      sessionStorage.removeItem('admin_login_time');
      
      toast({
        title: "Logged Out",
        description: "You have been logged out of the admin portal",
      });
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear the user data even if the request fails
      setAdminUser(null);
      sessionStorage.removeItem('admin_user_data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isLoading,
        error,
        adminLogin,
        adminLogout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

// Hook to use admin auth context
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}