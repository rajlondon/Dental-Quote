import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from 'lucide-react';

const ClinicDirectLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      
      // Create a robust session cookie check
      document.cookie = "session_check=1; path=/; max-age=3600";
      
      // Log session information for debugging
      console.log("Session established successfully");
      console.log("User role:", user.role);
      console.log("User ID:", user.id);
      
      // We'll use our routing helper for more consistent navigation
      import("../lib/routing-helper")
        .then(({ navigateToUserPortal }) => {
          // Wait for toast to be visible before redirecting
          setTimeout(() => {
            console.log("Performing enhanced redirect to clinic portal");
            navigateToUserPortal();
          }, 1500);
        })
        .catch(error => {
          console.error("Failed to import routing helper:", error);
          // Fallback to the old redirect method if import fails
          setTimeout(() => {
            try {
              window.location.replace(`${window.location.origin}/clinic-portal?t=${Date.now()}`);
            } catch (e) {
              window.location.href = '/clinic-portal';
            }
          }, 1500);
        });
      
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
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
          <Button variant="link" onClick={() => window.location.href = '/portal-login'} size="sm">
            Return to main login page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClinicDirectLogin;