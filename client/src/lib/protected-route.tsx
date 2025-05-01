import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  requiredRole?: string;
}

export function ProtectedRoute({ path, component: Component, requiredRole }: ProtectedRouteProps) {
  // Use the original auth hook for authentication checks
  const { user, isLoading } = useAuth();

  // Check if user is logged in and has the required role (if specified)
  const hasAccess = user && (!requiredRole || user.role === requiredRole);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Use a ref to track if we're already processing to prevent duplicate state changes
  const isProcessingRef = useRef(false);
  
  // Check if a recent valid session exists (less than 30 seconds old)
  const hasRecentSession = useRef(() => {
    // Handle both clinic and admin portal sessions
    if (requiredRole === 'clinic_staff') {
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
    } else if (requiredRole === 'admin') {
      try {
        const timestamp = sessionStorage.getItem('admin_portal_timestamp');
        if (!timestamp) return false;
        
        const parsed = parseInt(timestamp, 10);
        const age = Date.now() - parsed;
        
        // Valid session if less than 30 seconds old
        return !isNaN(parsed) && age < 30000;
      } catch (err) {
        return false;
      }
    }
    
    // For other roles, always consider session as valid
    return true;
  });
  
  // Use session detection for initial state to avoid unnecessary loading states
  const [readyForPortal, setReadyForPortal] = useState(() => {
    // If not a portal that needs special handling, always ready
    if (requiredRole !== 'clinic_staff' && requiredRole !== 'admin') return true;
    
    // If we have a recent valid session, start as ready
    return hasRecentSession.current();
  });
  
  // Update session timestamp when we have a user but only do it once per session
  useEffect(() => {
    // Handle both clinic and admin portals
    if (user) {
      const now = Date.now();
      
      // For clinic staff sessions
      if (requiredRole === 'clinic_staff' && user.role === 'clinic_staff') {
        // Check if we've recently updated this timestamp
        const currentTimestamp = sessionStorage.getItem('clinic_portal_timestamp');
        
        // Only update if no timestamp exists or it's older than 5 seconds
        if (!currentTimestamp || (now - parseInt(currentTimestamp, 10)) > 5000) {
          // Save current timestamp to track last successful render
          sessionStorage.setItem('clinic_portal_timestamp', now.toString());
          console.log(`✅ Clinic portal session timestamp updated: ${new Date(now).toLocaleTimeString()}`);
        }
      }
      
      // For admin portal sessions
      if (requiredRole === 'admin' && user.role === 'admin') {
        // Check if we've recently updated this timestamp
        const currentTimestamp = sessionStorage.getItem('admin_portal_timestamp');
        
        // Only update if no timestamp exists or it's older than 5 seconds
        if (!currentTimestamp || (now - parseInt(currentTimestamp, 10)) > 5000) {
          // Save current timestamp to track last successful render
          sessionStorage.setItem('admin_portal_timestamp', now.toString());
          console.log(`✅ Admin portal session timestamp updated: ${new Date(now).toLocaleTimeString()}`);
          
          // Special additional handling for admin portal
          if (path === '/admin-portal' && typeof window !== 'undefined') {
            console.log('🔒 Setting up admin portal refresh prevention signal');
            (window as any).__adminPortalFullyLoaded = true;
            
            // Create global handler for preventing refreshes
            if (!(window as any).__adminRefreshPreventionSet) {
              console.log('🛡️ Installing global admin refresh prevention');
              
              // Track in session to prevent double refreshes
              sessionStorage.setItem('admin_prevent_refresh', 'true');
              
              // Set a global flag to prevent double installation
              (window as any).__adminRefreshPreventionSet = true;
              
              // Set a protection flag on the history object
              try {
                // Apply special protection to history methods
                const originalPushState = window.history.pushState;
                const originalReplaceState = window.history.replaceState;
                
                window.history.pushState = function(...args) {
                  if ((window as any).__adminPortalFullyLoaded) {
                    console.log("🛡️ Blocking history.pushState in admin portal");
                    return undefined;
                  }
                  return originalPushState.apply(this, args);
                };
                
                window.history.replaceState = function(...args) {
                  if ((window as any).__adminPortalFullyLoaded) {
                    console.log("🛡️ Blocking history.replaceState in admin portal");
                    return undefined;
                  }
                  return originalReplaceState.apply(this, args);
                };
                
                // Reset after 10 seconds to avoid permanent breakage
                setTimeout(() => {
                  if (window.history.pushState !== originalPushState) {
                    window.history.pushState = originalPushState;
                  }
                  if (window.history.replaceState !== originalReplaceState) {
                    window.history.replaceState = originalReplaceState;
                  }
                  console.log("🔓 Restored original history methods");
                }, 10000);
              } catch (err) {
                console.error("Could not protect history methods:", err);
              }
            }
          }
        }
      }
    }
    
    // Cleanup function
    return () => {
      console.log("ProtectedRoute unmounting, setting isMounted to false");
      isMountedRef.current = false;
    };
  }, [user, requiredRole, path]);
  
  // Make portal components ready when authentication is complete
  useEffect(() => {
    // Skip if no user or no special handling needed
    if (!user || (requiredRole !== 'clinic_staff' && requiredRole !== 'admin')) {
      return;
    }
    
    // Skip if already processing
    if (isProcessingRef.current) {
      return;
    }
    
    // Must match role requirements
    if (requiredRole !== user.role) {
      return;
    }
    
    // Only execute if not ready yet
    if (!readyForPortal) {
      console.log(`Setting up ${requiredRole} portal session - marking as ready`);
      isProcessingRef.current = true;
      
      // Set ready immediately - no timeout needed
      if (isMountedRef.current) {
        setReadyForPortal(true);
        console.log(`${requiredRole} portal session fully established`);
      }
      isProcessingRef.current = false;
    }
  }, [user, requiredRole, readyForPortal]);

  // Generate a stable key for this route to prevent unnecessary remounts
  const stableRouteKey = `protected-route-${path.replace(/\//g, '-')}`;
  
  return (
    <Route
      path={path}
      key={stableRouteKey}
      component={props => {
        // Show loading while auth is loading or waiting for portal session to be fully established
        if (isLoading || ((requiredRole === 'clinic_staff' || requiredRole === 'admin') && !readyForPortal)) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              {requiredRole === 'clinic_staff' && user && !readyForPortal && (
                <p className="text-sm text-muted-foreground">Preparing clinic portal...</p>
              )}
              {requiredRole === 'admin' && user && !readyForPortal && (
                <p className="text-sm text-muted-foreground">Preparing admin portal...</p>
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

        // Generate a stable component key to prevent recreation of the component
        const componentKey = `${stableRouteKey}-content-${user?.id || 'anonymous'}`;
        
        // User has access - use a stable key to prevent remounting
        return <Component {...props} key={componentKey} />;
      }}
    />
  );
}