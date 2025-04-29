import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  requiredRole?: string;
}

export function ProtectedRoute({ path, component: Component, requiredRole }: ProtectedRouteProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const { toast } = useToast();

  // Unified function to get authentication state from local storage
  const getStoredAuth = () => {
    // First try getting the auth from localStorage
    try {
      // Create a "clinic_auth_state" key for storing authentication state
      const authState = localStorage.getItem('clinic_auth_state');
      if (authState) {
        // Parse stored state which should have user and role
        const { user: storedUser, timestamp } = JSON.parse(authState);
        
        // Check if auth state isn't too old (24 hours)
        const now = new Date().getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (storedUser && (now - timestamp < maxAge)) {
          console.log("Found valid auth state in localStorage");
          return storedUser;
        } else {
          console.log("Stored auth state expired or invalid");
          // Clear the expired state
          localStorage.removeItem('clinic_auth_state');
        }
      }
    } catch (e) {
      console.error("Error parsing stored auth state:", e);
      localStorage.removeItem('clinic_auth_state');
    }
    
    return null;
  };
  
  // Function to save authentication state to localStorage
  const saveAuthState = (userData: any) => {
    if (!userData) return;
    
    try {
      const authState = {
        user: userData,
        timestamp: new Date().getTime()
      };
      localStorage.setItem('clinic_auth_state', JSON.stringify(authState));
      console.log("Auth state saved to localStorage");
    } catch (e) {
      console.error("Error saving auth state:", e);
    }
  };

  // Effect for checking authentication - runs once on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true);
        
        // Try to get stored auth first to avoid flicker
        const storedUser = getStoredAuth();
        if (storedUser) {
          console.log("Using stored auth state:", storedUser.role);
          
          // Check if the stored user has the required role
          const hasRequiredRole = !requiredRole || storedUser.role === requiredRole;
          
          setUser(storedUser);
          setIsAuthorized(hasRequiredRole);
          // Don't complete auth check yet - still verify with server
        }
        
        // Always perform the server check, even if we have stored auth
        console.log("Verifying authentication with server");
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }
        });
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
          console.log("Server returned 401 - user not authenticated");
          setUser(null);
          setIsAuthorized(false);
          setAuthCheckComplete(true);
          setIsLoading(false);
          return;
        }
        
        // Handle other errors
        if (!response.ok) {
          console.error("Server error during auth check:", response.status);
          
          // If we have stored auth, continue with that
          if (storedUser) {
            console.log("Using stored auth due to server error");
            setAuthCheckComplete(true);
            setIsLoading(false);
            return;
          }
          
          throw new Error(`Server error: ${response.status}`);
        }
        
        // Process successful response
        const data = await response.json();
        
        if (data.success && data.user) {
          console.log("Server auth successful:", data.user.role);
          
          // Save the authenticated user data
          saveAuthState(data.user);
          
          // Check if user has the required role
          const hasRequiredRole = !requiredRole || data.user.role === requiredRole;
          
          setUser(data.user);
          setIsAuthorized(hasRequiredRole);
        } else {
          console.log("Server returned no user data");
          setUser(null);
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error("Error during auth check:", err);
        
        // If we have stored auth, use it as fallback
        const storedUser = getStoredAuth();
        if (storedUser) {
          console.log("Using stored auth after error");
          const hasRequiredRole = !requiredRole || storedUser.role === requiredRole;
          setUser(storedUser);
          setIsAuthorized(hasRequiredRole);
        } else {
          setUser(null);
          setIsAuthorized(false);
        }
      } finally {
        setAuthCheckComplete(true);
        setIsLoading(false);
      }
    }

    checkAuth();
    // Don't add path, requiredRole, or toast to the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wait until the authentication check is complete
  if (!authCheckComplete) {
    return (
      <Route
        path={path}
        component={() => (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      />
    );
  }

  return (
    <Route
      path={path}
      component={(props) => {
        // Still loading
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        // Not authenticated
        if (!user) {
          console.log("No user found, redirecting to login page");
          return <Redirect to="/portal-login" />;
        }

        // Not authorized (wrong role)
        if (isAuthorized === false) {
          console.log(`User role (${user.role}) doesn't match required role (${requiredRole})`);
          return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
              <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
              <p className="max-w-md text-muted-foreground">
                You don't have the required permissions to access this page.
                {user.role && (
                  <span>
                    Your role is <span className="font-medium">{user.role}</span>, but this page
                    requires <span className="font-medium">{requiredRole}</span> access.
                  </span>
                )}
              </p>
              <div className="mt-4">
                <Redirect to="/portal-login" />
              </div>
            </div>
          );
        }

        // User has access - render the component
        return <Component {...props} user={user} />;
      }}
    />
  );
}