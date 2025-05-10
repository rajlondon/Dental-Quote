import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Lock, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const ClinicLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { loginMutation } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Flag to prevent duplicate login submissions
  const isSubmitting = React.useRef(false);

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    // Prevent simultaneous logins
    if (isSubmitting.current) {
      console.log("Login already in progress, ignoring duplicate submission");
      return;
    }
    
    // Set flag to indicate form submission in progress
    isSubmitting.current = true;
    
    // Visual feedback
    setIsLoading(true);
    
    try {
      console.log("Clinic login attempt with:", values);
      
      // Store login intent in session storage before login
      sessionStorage.setItem('clinic_login_attempt', 'true');
      sessionStorage.setItem('login_timestamp', Date.now().toString());
      
      // Pre-cache clinic portal data to avoid reload
      sessionStorage.setItem('clinic_portal_timestamp', Date.now().toString());
      
      // Use the loginMutation from useAuth hook
      const userData = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password
      });
      
      // Verify this is a clinic staff account
      if (userData.role !== 'clinic_staff' && userData.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "This account does not have clinic staff permissions.",
          variant: "destructive"
        });
        setIsLoading(false);
        isSubmitting.current = false;
        return;
      }
      
      // Pre-cache the user data to avoid double fetching on redirect
      sessionStorage.setItem('cached_user_data', JSON.stringify(userData));
      sessionStorage.setItem('cached_user_timestamp', Date.now().toString());
      sessionStorage.setItem('clinic_portal_timestamp', Date.now().toString());
      
      // Mark that we're in the middle of a clinic navigation to avoid race conditions
      sessionStorage.setItem('clinic_navigation_in_progress', 'true');
      
      // Force direct navigation to prevent issues with WebSocket connections
      console.log("Using direct window location for clinic portal navigation");
      
      // Add delay to ensure caches are written before redirect
      setTimeout(() => {
        console.log("Redirecting to clinic portal with pre-cached session");
        try {
          // Store indicator for ongoing navigation
          sessionStorage.setItem('clinic_portal_redirect_timestamp', Date.now().toString());
          
          // Direct navigation to the unguarded clinic portal route
          console.log('🔄 Redirecting to direct clinic portal access route');
          window.location.href = '/clinic-direct';
        } catch (navError) {
          console.error("Error during clinic portal navigation:", navError);
          // Fallback to react router
          setLocation('/clinic-portal');
        }
      }, 100);
    } catch (error) {
      console.error("Login error:", error);
      
      toast({
        title: "Login Failed",
        description: "Please check your email and password and try again.",
        variant: "destructive"
      });
      
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="container max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
      {/* Login Form Section */}
      <div className="flex flex-col justify-center">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Clinic Portal</h1>
            <p className="text-muted-foreground mt-2">
              Access your clinic dashboard to manage patient treatments, quotes, and appointments.
            </p>
          </div>
          
          <Card className="border-2 border-primary/10">
            <CardHeader>
              <CardTitle>Clinic Staff Login</CardTitle>
              <CardDescription>
                Enter your credentials to access the clinic management portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.email", "Email Address")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                            <Input 
                              placeholder="clinic@example.com" 
                              className="pl-10" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              className="pl-10" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                      <>Sign In</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Information Section */}
      <div className="bg-gradient-to-br from-primary-foreground to-secondary p-8 rounded-xl shadow-lg flex flex-col justify-center">
        <div className="mb-8">
          <ShieldCheck className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-2">Clinic Staff Portal</h2>
          <p className="text-muted-foreground">
            Access your clinic's dedicated management system for MyDentalFly.
          </p>
        </div>
        
        <div className="space-y-4">
          <FeatureItem 
            title="Patient Management" 
            description="Review and manage your patient records, treatments, and appointments."
          />
          <FeatureItem 
            title="Quote Management" 
            description="Create, track, and update treatment quotes and plans."
          />
          <FeatureItem 
            title="Special Offers" 
            description="Manage promotional offers and treatment packages for your clinic."
          />
          <FeatureItem 
            title="Communications" 
            description="Secure messaging with patients and the MyDentalFly team."
          />
        </div>
      </div>
    </div>
  );
};

// Helper component for feature items
const FeatureItem: React.FC<{ title: string, description: string }> = ({ title, description }) => (
  <div className="border-l-2 border-primary pl-4">
    <h3 className="font-medium">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default ClinicLoginPage;