import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  requiredRole?: string;
}

export function ProtectedRoute({ path, component: Component, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Check if user is logged in and has the required role (if specified)
  const hasAccess = user && (!requiredRole || user.role === requiredRole);
  
  // Add extra delay for clinic_staff to ensure session is fully established
  const [readyForClinic, setReadyForClinic] = React.useState(requiredRole !== 'clinic_staff');
  
  React.useEffect(() => {
    // For clinic staff, add a short delay before showing content to ensure session is set up
    if (requiredRole === 'clinic_staff' && user && user.role === 'clinic_staff' && !readyForClinic) {
      console.log("Adding short delay for clinic staff authentication...");
      const timer = setTimeout(() => {
        console.log("Clinic staff session fully established");
        setReadyForClinic(true);
      }, 500);
      return () => clearTimeout(timer);
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