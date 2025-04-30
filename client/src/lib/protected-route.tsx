import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";
import { useState, useEffect } from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  requiredRole?: string;
}

export function ProtectedRoute({ path, component: Component, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Check if user is logged in and has the required role (if specified)
  const hasAccess = user && (!requiredRole || user.role === requiredRole);
  
  // Use local sessionStorage to track if this is a fresh login (avoid double refresh)
  const [readyForClinic, setReadyForClinic] = useState(() => {
    // If not clinic staff or we've already done initial render, we're ready
    if (requiredRole !== 'clinic_staff') return true;
    
    // Check if we've already completed an initial render for this session
    const hasRendered = sessionStorage.getItem('clinic_portal_rendered');
    return !!hasRendered;
  });
  
  useEffect(() => {
    // Only for initial clinic staff auth
    if (requiredRole === 'clinic_staff' && user && user.role === 'clinic_staff' && !readyForClinic) {
      console.log("Setting up clinic staff session...");
      
      // Mark as ready immediately, but with requestAnimationFrame to avoid layout thrashing
      requestAnimationFrame(() => {
        // Mark that we've rendered this session
        sessionStorage.setItem('clinic_portal_rendered', 'true');
        setReadyForClinic(true);
        console.log("Clinic staff session fully established");
      });
    }
  }, [user, requiredRole, readyForClinic]);

  return (
    <Route
      path={path}
      component={props => {
        // Show loading while auth is loading or waiting for clinic session to be fully established
        if (isLoading || (requiredRole === 'clinic_staff' && !readyForClinic)) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              {requiredRole === 'clinic_staff' && user && !readyForClinic && (
                <p className="text-sm text-muted-foreground">Preparing clinic portal...</p>
              )}
            </div>
          );
        }

        if (!user) {
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
              <Redirect to="/" />
            </div>
          );
        }

        // User has access
        return <Component {...props} />;
      }}
    />
  );
}