import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";
import { useState, useEffect, useRef } from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  requiredRole?: string;
}

export function ProtectedRoute({ path, component: Component, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Check if user is logged in and has the required role (if specified)
  const hasAccess = user && (!requiredRole || user.role === requiredRole);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Use a ref to track if we're already processing to prevent duplicate state changes
  const isProcessingRef = useRef(false);
  
  // Check if a recent valid session exists (less than 30 seconds old)
  const hasRecentSession = useRef(() => {
    if (requiredRole !== 'clinic_staff') return true;
    
    try {
      const timestamp = sessionStorage.getItem('clinic_portal_timestamp');
      if (!timestamp) return false;
      
      const parsed = parseInt(timestamp, 10);
      const age = Date.now() - parsed;
      
      // Valid session if less than 30 seconds old
      return !isNaN(parsed) && age < 30000;
    } catch (err) {
      return false;
    }
  });
  
  // Use session detection for initial state to avoid unnecessary loading states
  const [readyForClinic, setReadyForClinic] = useState(() => {
    // If not clinic staff, always ready
    if (requiredRole !== 'clinic_staff') return true;
    
    // If we have a recent valid session, start as ready
    return hasRecentSession.current();
  });
  
  // Update session timestamp when we have a user but only do it once per session
  useEffect(() => {
    // Only update for clinic staff with the right role
    if (requiredRole === 'clinic_staff' && user && user.role === 'clinic_staff') {
      // Check if we've recently updated this timestamp
      const currentTimestamp = sessionStorage.getItem('clinic_portal_timestamp');
      const now = Date.now();
      
      // Only update if no timestamp exists or it's older than 5 seconds
      if (!currentTimestamp || (now - parseInt(currentTimestamp, 10)) > 5000) {
        // Save current timestamp to track last successful render
        sessionStorage.setItem('clinic_portal_timestamp', now.toString());
        console.log(`Clinic portal session timestamp updated: ${new Date(now).toLocaleTimeString()}`);
      }
    }
    
    // Cleanup function
    return () => {
      console.log("ProtectedRoute unmounting, setting isMounted to false");
      isMountedRef.current = false;
    };
  }, [user, requiredRole]);
  
  // Make clinic staff ready if not already
  useEffect(() => {
    // Only execute for clinic staff that's not ready yet
    if (requiredRole === 'clinic_staff' && user && user.role === 'clinic_staff' && !readyForClinic && !isProcessingRef.current) {
      console.log("Setting up clinic staff session - marking as ready");
      isProcessingRef.current = true;
      
      // Set ready immediately - no timeout needed
      if (isMountedRef.current) {
        setReadyForClinic(true);
        console.log("Clinic staff session fully established");
      }
      isProcessingRef.current = false;
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