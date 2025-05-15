import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import axios from 'axios';

const SimpleClinicLoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Use the full URL to ensure consistent domain context
        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        const response = await axios.get(`${baseUrl}/api/clinic-status`, {
          withCredentials: true
        });
        if (response.data.success && response.data.user) {
          console.log('Already authenticated, redirecting to clinic portal');
          toast({
            title: 'Already signed in',
            description: 'Redirecting to clinic portal...',
          });
          setLocation('/simple-clinic');
        }
      } catch (error) {
        // Not authenticated, that's expected
        console.log('Not authenticated, showing login page');
      }
    };

    checkAuthStatus();
  }, [setLocation, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting login with:', email);
      // Use auth/login endpoint - api client will add the /api prefix
      // Construct the full URL using window.location to ensure correct domain
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      console.log(`Using base URL: ${baseUrl} for authentication request`);
      const response = await axios.post(`${baseUrl}/api/auth/login`, {
        email,
        password,
        role: 'clinic_staff' // Make sure to specify the role for session organization
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast({
          title: 'Login successful',
          description: 'Redirecting to clinic portal...',
        });
        
        // Store user data in session storage
        if (response.data.user) {
          sessionStorage.setItem('user_data', JSON.stringify(response.data.user));
          sessionStorage.setItem('user_role', response.data.user.role);
          
          if (response.data.user.role === 'clinic_staff') {
            sessionStorage.setItem('is_clinic_staff', 'true');
          }
        }
        
        // Redirect to simplified clinic portal
        setLocation('/simple-clinic');
      } else {
        setError(response.data.message || 'Login failed. Please check your credentials.');
        toast({
          title: 'Login failed',
          description: response.data.message || 'Please check your credentials and try again.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Enhanced error logging for debugging
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      } else if (err.request) {
        console.error('Error request without response. Request details:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      
      // Check for specific password error
      const errorMsg = err.response?.data?.message || 'An error occurred during login. Please try again.';
      setError(errorMsg);
      
      // Show detailed error message
      toast({
        title: 'Login error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Clinic Portal Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the clinic portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              {error && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-500">
            <p>For clinic staff access only</p>
          </CardFooter>
        </Card>
        
        {/* Test Credentials for Development */}
        <div className="mt-6 p-4 bg-gray-100 rounded-md border border-gray-200">
          <h3 className="text-sm font-medium mb-2">Test Credentials</h3>
          <p className="text-xs text-gray-600 mb-1">Email: clinic@mydentalfly.com</p>
          <p className="text-xs text-gray-600">Password: clinic123</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleClinicLoginPage;