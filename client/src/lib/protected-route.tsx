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
  
  // Check for cached user data to prevent refresh loops
  useEffect(() => {
    // Special handling for admin portal
    if (path === '/admin-portal' && user) {
      // Set session flag to indicate a protected navigation
      sessionStorage.setItem('admin_protected_navigation', 'true');
      
      // Cache user data to prevent refresh loops
      sessionStorage.setItem('admin_user_data', JSON.stringify(user));
    }
  }, [path, user]);

  // Check if user is logged in and has the required role (if specified)
  // For clinic staff role, also allow admin role (admins should be able to access everything)
  const hasAccess = user && (
    !requiredRole || 
    user.role === requiredRole || 
    (requiredRole === 'clinic_staff' && user.role === 'admin')
  );
  
  // Just a ref to track mount state
  const isMountedRef = useRef(true);
  
  // MUCH simpler approach - immediately mark all portals as ready
  const [readyForPortal, setReadyForPortal] = useState(true);
  
  // Check for specific role-based handling
  useEffect(() => {
    if (user && requiredRole === 'clinic_staff') {
      console.log('ProtectedRoute for clinic staff, setting up session markers');
      
      // Set session markers for clinic staff portal
      sessionStorage.setItem('clinic_portal_access_successful', 'true');
      sessionStorage.setItem('is_clinic_staff', 'true');
      sessionStorage.setItem('disable_promo_redirect', 'true');
      sessionStorage.setItem('no_special_offer_redirect', 'true');
      sessionStorage.setItem('disable_quote_redirect', 'true');
      sessionStorage.setItem('clinic_session_active', 'true');
      
      // Set cookies to mark that this is a clinic staff session
      document.cookie = "is_clinic_staff=true; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "clinic_session_active=true; path=/; max-age=86400; SameSite=Lax";
    }
  }, [user, requiredRole]);
  
  useEffect(() => {
    // Cleanup function
    return () => {
      console.log("ProtectedRoute unmounting, setting isMounted to false");
      isMountedRef.current = false;
    };
  }, []);

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

        if (!hasAccess) {
          // User is logged in but doesn't have required role
          console.log(`Access denied: User role ${user.role}, required role ${requiredRole}`);
          
          // For clinic staff access, redirect to the clinic login page
          if (requiredRole === 'clinic_staff') {
            return <Redirect to="/clinic-login" />;
          }
          
          // For admin access, redirect to admin login
          if (requiredRole === 'admin') {
            return <Redirect to="/admin-login" />;
          }
          
          // Default access denied page with redirect
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