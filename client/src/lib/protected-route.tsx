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
    // Direct API call to get user info, bypassing React Query
    async function checkAuth() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/user', {
          credentials: 'include' // Important: include cookies for session auth
        });
        
        if (response.status === 401) {
          setUser(null);
          setError("Not authenticated");
          console.log("User not authenticated, redirecting to login");
          setTimeout(() => {
            window.location.href = '/portal-login';
          }, 100);
          return;
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        const data = await response.json();
        console.log("Auth check - User data:", data.user);
        
        if (data.success && data.user) {
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