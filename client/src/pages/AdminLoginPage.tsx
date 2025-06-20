import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
// Removed react-i18next
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/use-admin-auth';

// Admin Login Form Schema
const adminLoginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const AdminLoginPage: React.FC = () => {
  // Translation removed
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { adminUser, adminLogin, isLoading } = useAdminAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Define a secure form with validation
  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Redirect if already logged in
  useEffect(() => {
    if (adminUser) {
      console.log('Already logged in as admin, redirecting to admin portal');
      navigate('/admin-portal');
    }
  }, [adminUser, navigate]);
  
  // Handle form submission
  const onSubmit = async (values: AdminLoginFormValues) => {
    setLoginError(null);
    
    try {
      // Call the admin-specific login function
      await adminLogin(values.email, values.password);
      
      // Show success toast
      toast({
        title: 'Login successful',
        description: 'Welcome to the admin portal',
      });
      
      // Redirect to admin portal
      navigate('/admin-portal');
    } catch (error) {
      console.error('Admin login error:', error);
      
      // Handle login error
      setLoginError('Invalid email or password. Please try again.');
      
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/images/mydentalfly-logo.png" 
              alt="MyDentalFly Logo" 
              className="h-12 w-auto" 
            />
          </div>
          <CardTitle className="text-2xl text-center">{t('admin.login.title', 'Admin Portal Login')}</CardTitle>
          <CardDescription className="text-center">
            {t('admin.login.subtitle', 'Enter your credentials to access the admin portal')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.login.email', 'Email')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="admin@mydentalfly.com" 
                        type="email" 
                        autoComplete="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.login.password', 'Password')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        autoComplete="current-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('admin.login.logging_in', 'Logging in...')}
                  </>
                ) : (
                  t('admin.login.submit', 'Login to Admin Portal')
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-500">
            {t('admin.login.security_notice', 'This is a secure portal for authorized personnel only.')}
          </div>
        </CardFooter>
      </Card>
      
      {/* Legal footer */}
      <div className="absolute bottom-4 text-center w-full text-xs text-gray-400">
        <p>
          {t('admin.login.copyright', '© 2025 MyDentalFly. All rights reserved.')}
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;