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
  
  // Check if this is the clinic staff portal and determine ready state
  const [readyForClinic, setReadyForClinic] = useState(() => {
    // If not clinic staff, always ready
    if (requiredRole !== 'clinic_staff') return true;
    
    // Check if we have a valid user and role match
    if (!user || user.role !== 'clinic_staff') return false;
    
    // Get current timestamp to detect session validity
    const currentTime = Date.now();
    const lastRenderTime = parseInt(sessionStorage.getItem('clinic_portal_timestamp') || '0', 10);
    
    // If we rendered recently (within 5 minutes), assume session is valid
    const isRecentRender = (currentTime - lastRenderTime) < 300000; // 5 minutes
    
    // Return true if we've rendered recently, preventing reload
    return isRecentRender;
  });
  
  // Update session timestamp when component successfully renders with valid user
  useEffect(() => {
    // Only apply for clinic staff users with matching role
    if (requiredRole === 'clinic_staff' && user && user.role === 'clinic_staff') {
      // Save current timestamp to track last successful render
      const timestamp = Date.now().toString();
      sessionStorage.setItem('clinic_portal_timestamp', timestamp);
      
      console.log(`Clinic portal session timestamp updated: ${new Date(parseInt(timestamp)).toLocaleTimeString()}`);
    }
    
    // Cleanup function
    return () => {
      console.log("ProtectedRoute unmounting, setting isMounted to false");
      isMountedRef.current = false;
    };
  }, [user, requiredRole]);
  
  // Handle clinic staff session establishment
  useEffect(() => {
    // Only execute for clinic staff that's not ready yet
    if (requiredRole === 'clinic_staff' && user && user.role === 'clinic_staff' && !readyForClinic && !isProcessingRef.current) {
      console.log("Setting up clinic staff session...");
      isProcessingRef.current = true;
      
      // Use a minimal delay to ensure session is established properly
      setTimeout(() => {
        // Only update if component is still mounted
        if (isMountedRef.current) {
          setReadyForClinic(true);
          console.log("Clinic staff session fully established");
        }
        isProcessingRef.current = false;
      }, 100);
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