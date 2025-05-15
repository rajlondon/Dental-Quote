import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useCookieAuth } from '@/hooks/use-cookie-auth';

const SimpleClinicLoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, checkClinicStatus, loading: authLoading } = useCookieAuth();

  // We've removed the automatic check on mount
  // This prevents the infinite auth check loop
  useEffect(() => {
    // Set loading to false initially
    setIsLoading(false);
    
    // Manual check is done only when user clicks Login button
    console.log('Login page ready');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting login with:', email);
      
      // Clear any previous login data
      sessionStorage.removeItem('user_data');
      sessionStorage.removeItem('user_role');
      sessionStorage.removeItem('is_clinic_staff');
      
      // Add some validation before sending request
      if (!email.trim() || !password) {
        setError('Please provide both email and password');
        toast({
          title: 'Login failed',
          description: 'Please provide both email and password',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      // Always use clinic@mydentalfly.com for testing (if test credentials are shown)
      const loginEmail = (document.querySelector('.test-credentials') && email === '') ? 
        'clinic@mydentalfly.com' : email;
      const loginPassword = (document.querySelector('.test-credentials') && password === '') ? 
        'clinic123' : password;
      
      // Use the cookie-aware login function with enhanced session handling
      const result = await login(loginEmail, loginPassword, 'clinic_staff');

      if (result.success) {
        // Display success message to user
        toast({
          title: 'Login successful',
          description: 'Welcome to the clinic portal!',
        });
        
        console.log('Login successful, user data:', result.user);
        
        // Add a short delay before redirect for better UX
        setTimeout(() => {
          // Redirect to simplified clinic portal
          setLocation('/simple-clinic');
        }, 1000);
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
        toast({
          title: 'Login failed',
          description: result.message || 'Please check your credentials and try again.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle error with message from error object
      const errorMsg = err.message || 'An error occurred during login. Please try again.';
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
        <div className="mt-6 p-4 bg-gray-100 rounded-md border border-gray-200 test-credentials">
          <h3 className="text-sm font-medium mb-2">Test Credentials</h3>
          <p className="text-xs text-gray-600 mb-1">Email: clinic@mydentalfly.com</p>
          <p className="text-xs text-gray-600">Password: clinic123</p>
          <button 
            onClick={(e) => {
              e.preventDefault();
              setEmail('clinic@mydentalfly.com');
              setPassword('clinic123');
            }}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            Auto-fill
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleClinicLoginPage;