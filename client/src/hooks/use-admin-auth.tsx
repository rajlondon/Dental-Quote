import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useLocalStorage } from "@/lib/localstorage-state";
import { apiRequest } from "@/lib/queryClient";

// Admin user type
interface AdminUser {
  id: number;
  email: string;
  username: string;
  role: 'admin';
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

// State interface
interface AdminAuthState {
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: Error | null;
}

// Context interface
interface AdminAuthContextType extends AdminAuthState {
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => Promise<void>;
}

// Create the context
export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

// Provider component
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUserState, setAdminUserState] = useLocalStorage<AdminUser | null>('admin_session', null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [loadAttempted, setLoadAttempted] = useState<boolean>(false);

  // Check admin session on mount
  useEffect(() => {
    async function checkAdminSession() {
      if (loadAttempted) return;
      
      setLoadAttempted(true);
      
      try {
        setIsLoading(true);
        
        // Use the admin auth endpoint to verify the session
        // Fall back to cached session if API fails
        const res = await apiRequest("GET", "/api/auth/user");
        const userData = await res.json();
        
        if (userData && userData.role === 'admin') {
          console.log("Admin session verified from API");
          setAdminUserState(userData as AdminUser);
        } else {
          // if API returns a user but not admin, clear session
          if (userData && userData.id) {
            console.log("User session exists but is not admin role");
            setAdminUserState(null);
          }
        }
      } catch (err) {
        // API failed, use cached admin session if available
        console.log("Admin session check failed, using cached session:", adminUserState);
        // We don't clear the session here - let the cached value persist
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAdminSession();
  }, [adminUserState, loadAttempted, setAdminUserState]);

  // Admin login function
  const adminLogin = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await res.json();
      
      if (!data || !data.user || data.user.role !== 'admin') {
        throw new Error("Admin authentication failed - not an admin account");
      }
      
      // Set the admin user in state
      setAdminUserState(data.user as AdminUser);
      
      // Save client ID for session tracking
      console.log(`New admin client registered with ID: ${data.user.id}`);
      
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin logout function
  const adminLogout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Call the server logout API
      await apiRequest("POST", "/api/auth/logout");
    } catch (err) {
      console.error("Logout API error:", err);
      // Continue with client-side logout even if API fails
    } finally {
      // Clear the admin user from state
      setAdminUserState(null);
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser: adminUserState,
        isLoading,
        error,
        adminLogin,
        adminLogout,
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