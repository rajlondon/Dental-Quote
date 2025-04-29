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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored user in localStorage or sessionStorage as fallback
    const checkBackupAuth = () => {
      console.log("Checking for backup auth sources...");
      // Try getting user from sessionStorage first (more secure, cleared on tab close)
      let storedUser = null;
      try {
        const sessionUser = sessionStorage.getItem('clinic_user');
        if (sessionUser) {
          storedUser = JSON.parse(sessionUser);
          console.log("Found user in sessionStorage:", storedUser);
        } else {
          // Fallback to localStorage
          const localUser = localStorage.getItem('clinic_user');
          if (localUser) {
            storedUser = JSON.parse(localUser);
            console.log("Found user in localStorage:", storedUser);
          }
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
      return storedUser;
    };

    // Direct API call to get user info, bypassing React Query
    async function checkAuth() {
      try {
        setIsLoading(true);
        
        // First check if we're on the clinic portal path - this needs special handling
        if (path === '/clinic-portal' || path.startsWith('/clinic-')) {
          console.log("Clinic portal detected, checking for backup auth first");
          const backupUser = checkBackupAuth();
          
          // For clinic routes, try using the backup auth first to avoid session issues
          if (backupUser && backupUser.role === 'clinic_staff') {
            console.log("Using backup auth for clinic user:", backupUser);
            setUser(backupUser);
            setIsLoading(false);
            return;
          }
        }

        // Normal API auth check
        console.log("Performing server auth check");
        const response = await fetch('/api/auth/user', {
          credentials: 'include', // Important: include cookies for session auth
          cache: 'no-store', // Prevent caching
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.status === 401) {
          console.log("Server returned 401 - trying backup auth");
          const backupUser = checkBackupAuth();
          
          if (backupUser) {
            console.log("Using backup user data:", backupUser);
            setUser(backupUser);
            
            // Try to restore session with a direct login if we have clinic staff
            if (backupUser.role === 'clinic_staff' && requiredRole === 'clinic_staff') {
              console.log("Attempting session restoration for clinic staff");
              toast({
                title: "Restoring session...",
                description: "Please wait while we reconnect your session"
              });
              setTimeout(() => {
                window.location.href = '/clinic-login';
              }, 1500);
              return;
            }
          } else {
            setUser(null);
            setError("Not authenticated");
            console.log("No backup auth found, redirecting to login");
            setTimeout(() => {
              window.location.href = '/portal-login';
            }, 100);
          }
          return;
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        const data = await response.json();
        console.log("Auth check - User data:", data.user);
        
        if (data.success && data.user) {
          // Store user in session storage for backup
          sessionStorage.setItem('clinic_user', JSON.stringify(data.user));
          
          setUser(data.user);
          
          // Check role access
          if (requiredRole && data.user.role !== requiredRole) {
            setError(`Access denied. You need ${requiredRole} role.`);
            toast({
              title: "Access Denied",
              description: `This page requires ${requiredRole} permissions.`,
              variant: "destructive"
            });
            
            // Redirect based on actual role
            setTimeout(() => {
              if (data.user.role === 'admin') {
                window.location.href = '/admin-portal';
              } else if (data.user.role === 'clinic_staff') {
                window.location.href = '/clinic-portal';
              } else {
                window.location.href = '/client-portal';
              }
            }, 500);
          }
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error("Error checking authentication:", err);
        setError(err.message);
        
        // Try backup authentication as a last resort
        const backupUser = checkBackupAuth();
        if (backupUser) {
          console.log("Using backup auth after error:", backupUser);
          setUser(backupUser);
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [path, requiredRole, toast]);

  return (
    <Route
      path={path}
      component={(props) => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          console.log("No user found, redirecting to login page");
          return <Redirect to="/portal-login" />;
        }

        if (requiredRole && user.role !== requiredRole) {
          // User is logged in but doesn't have required role
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
              {/* Redirect based on role */}
              {user.role === 'admin' ? (
                <Redirect to="/admin-portal" />
              ) : user.role === 'clinic_staff' ? (
                <Redirect to="/clinic-portal" />
              ) : (
                <Redirect to="/client-portal" />
              )}
            </div>
          );
        }

        // User has access - render the component
        return <Component {...props} user={user} />;
      }}
    />
  );
}