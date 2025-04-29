import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from 'lucide-react';

// Helper function to check if user is already authenticated as clinic staff
const checkExistingAuthentication = () => {
  try {
    // Check for the new authentication state format
    const authState = localStorage.getItem('clinic_auth_state');
    if (authState) {
      const { user, timestamp } = JSON.parse(authState);
      const now = new Date().getTime();
      // Auth is valid for 24 hours
      const maxAge = 24 * 60 * 60 * 1000;
      
      if (user && user.role === 'clinic_staff' && (now - timestamp < maxAge)) {
        console.log('Found valid clinic auth state');
        return true;
      }
    }
    
    // Check if we should fallback to using basic cookies/localStorage as auth check
    const clinicUser = localStorage.getItem('clinic_user');
    const isClinic = localStorage.getItem('is_clinic') === 'true';
    
    if (clinicUser && isClinic) {
      try {
        const user = JSON.parse(clinicUser);
        if (user && user.role === 'clinic_staff') {
          console.log('Found valid clinic user in localStorage');
          
          // Migrate to new auth state format
          localStorage.setItem('clinic_auth_state', JSON.stringify({
            user,
            timestamp: new Date().getTime()
          }));
          
          return true;
        }
      } catch (e) {
        console.error('Error parsing clinic user:', e);
      }
    }
    
    return false;
  } catch (e) {
    console.error('Error checking authentication:', e);
    return false;
  }
};

const ClinicDirectLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRedirecting, setIsAutoRedirecting] = useState(false);
  const { toast } = useToast();
  
  // Check if already authenticated on component mount
  useEffect(() => {
    const isAuthenticated = checkExistingAuthentication();
    
    if (isAuthenticated) {
      setIsAutoRedirecting(true);
      toast({
        title: 'Using existing session',
        description: 'You are already authenticated as clinic staff.'
      });
      
      console.log('Redirecting directly to standalone clinic portal with existing authentication');
      setTimeout(() => {
        // Always redirect to standalone clinic portal as per user preference
        try {
          window.location.replace('/clinic-standalone.html');
        } catch (error) {
          console.error("Failed to redirect to clinic portal:", error);
          window.location.href = '/clinic-standalone.html';
        }
      }, 1000);
    }
  }, [toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting direct clinic login...");
      
      // Direct API call without React Query
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          email,
          password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      console.log("Login successful, redirecting...");
      
      // Extract user information
      const user = data.user;
      
      // Store CSRF token if available
      if (data.csrfToken) {
        localStorage.setItem('csrf_token', data.csrfToken);
      }
      
      // Show success message
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName || user.email}!`
      });
      
      // Store user data in localStorage and sessionStorage for redundancy
      localStorage.setItem('clinic_user', JSON.stringify(user));
      sessionStorage.setItem('clinic_user', JSON.stringify(user));
      
      // Store in our new auth state format for better persistence
      localStorage.setItem('clinic_auth_state', JSON.stringify({
        user,
        timestamp: new Date().getTime()
      }));
      
      // Set role-specific flag for backward compatibility
      localStorage.setItem('is_clinic', 'true');
      
      // Create a robust session cookie check
      document.cookie = "session_check=1; path=/; max-age=3600";
      
      // Log session information for debugging
      console.log("Session established successfully");
      console.log("User role:", user.role);
      console.log("User ID:", user.id);
      
      // Direct redirect to standalone clinic portal as per user preference
      setTimeout(() => {
        console.log("Redirecting directly to standalone clinic portal after login");
        try {
          window.location.replace(`${window.location.origin}/clinic-standalone.html?t=${Date.now()}`);
        } catch (error) {
          console.error("Failed to redirect to standalone clinic portal:", error);
          window.location.href = '/clinic-standalone.html';
        }
      }, 1500);
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show auto-redirecting UI if we're using existing auth
  if (isAutoRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Clinic Portal</CardTitle>
            <p className="text-sm text-center text-muted-foreground">
              Using existing session
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              Redirecting to clinic portal with your existing session...
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="link" 
              onClick={() => window.location.href = '/portal-login'} 
              size="sm"
            >
              Cancel and return to login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Normal login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Clinic Staff Login</CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            Enter your credentials to access the clinic portal
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isAutoRedirecting}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isAutoRedirecting}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || isAutoRedirecting}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Sign In to Clinic Portal"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="link" 
            onClick={() => window.location.href = '/portal-login'} 
            size="sm"
            disabled={isAutoRedirecting}
          >
            Return to main login page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClinicDirectLogin;