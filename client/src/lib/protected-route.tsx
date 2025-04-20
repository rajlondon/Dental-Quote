import { ReactNode, useEffect, useState } from "react";
import { Redirect, Route, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  path: string;
  component: React.FC;
  requiredRole?: string | string[];
}

// Protected route component that checks if user is authenticated and has required role
export function ProtectedRoute({ path, component: Component, requiredRole }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/user');
        
        if (!response.ok) {
          if (isMounted) {
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
            
            // Force navigation to login with a message
            toast({
              title: "Authentication Required",
              description: "Please log in to access this area",
              variant: "destructive",
            });
            
            // Using navigate for a smoother user experience
            navigate("/portal-login");
          }
          return;
        }
        
        const data = await response.json();
        
        if (isMounted) {
          if (data.success && data.user) {
            setIsAuthenticated(true);
            setUser(data.user);
          } else {
            setIsAuthenticated(false);
            setUser(null);
            
            // Force navigation to login
            toast({
              title: "Authentication Required",
              description: "Please log in to access this area",
              variant: "destructive",
            });
            
            navigate("/portal-login");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
          
          toast({
            title: "Authentication Error",
            description: "There was a problem verifying your account",
            variant: "destructive",
          });
          
          navigate("/portal-login");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [path, toast]);

  // Check if user has required role
  const hasRequiredRole = () => {
    if (!requiredRole || !user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  };

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-neutral-600">Verifying your credentials...</p>
        </div>
      </Route>
    );
  }

  if (!isAuthenticated) {
    return (
      <Route path={path}>
        <Redirect to="/portal-login" />
      </Route>
    );
  }

  if (requiredRole && !hasRequiredRole()) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-center mb-6">
            You don't have permission to access this page. This area requires {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole} access.
          </p>
          <a 
            href="/" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}