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
  const [location, setLocation] = useLocation();
  const { loginMutation } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Set up login flags and signals
  React.useEffect(() => {
    // Set flags to indicate we're in the clinic login flow
    if (typeof window !== 'undefined') {
      // Set sessionStorage flags for clinic login
      sessionStorage.setItem('clinic_login_in_progress', 'true');
      sessionStorage.setItem('disable_promo_redirect', 'true');
      
      // Set cookies to ensure the login process can't be hijacked
      document.cookie = "is_clinic_login=true; path=/; max-age=300; SameSite=Lax";
      document.cookie = "no_promo_redirect=true; path=/; max-age=300; SameSite=Lax";
      
      console.log('✅ ClinicLoginPage initialized and redirection protection configured');
      
      // Remove any lingering treatment selection or promo data
      sessionStorage.removeItem('selected_treatments');
      sessionStorage.removeItem('special_offer_id');
      sessionStorage.removeItem('package_id');
      sessionStorage.removeItem('quote_flow_state');
      sessionStorage.removeItem('promo_redirect_pending');
    }
    
    return () => {
      // Only clear login_in_progress, keep no_promo_redirect active
      sessionStorage.removeItem('clinic_login_in_progress');
    };
  }, []);
  
  // Check URL for error parameters
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    
    if (error) {
      let errorMessage = "An error occurred during login. Please try again.";
      
      switch(error) {
        case 'invalid_credentials':
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
          break;
        case 'access_denied':
          errorMessage = "This account doesn't have clinic staff permissions.";
          break;
        case 'server_error':
          errorMessage = "A server error occurred. Please try again later.";
          break;
        case 'session_error':
          errorMessage = "Failed to create login session. Please try again.";
          break;
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Remove the error parameter from URL to prevent showing the error again on refresh
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location, toast]);

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
      
      // Simple approach: use basic form POST to trigger a server-side redirect
      // This creates a regular form submission that bypasses SPA routing issues
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/auth/clinic-login';
      
      // Add email field
      const emailInput = document.createElement('input');
      emailInput.type = 'hidden';
      emailInput.name = 'email';
      emailInput.value = values.email;
      form.appendChild(emailInput);
      
      // Add password field
      const passwordInput = document.createElement('input');
      passwordInput.type = 'hidden';
      passwordInput.name = 'password';
      passwordInput.value = values.password;
      form.appendChild(passwordInput);
      
      // Add return URL
      const returnUrlInput = document.createElement('input');
      returnUrlInput.type = 'hidden';
      returnUrlInput.name = 'returnUrl';
      returnUrlInput.value = '/clinic-portal/dashboard';
      form.appendChild(returnUrlInput);
      
      // Add flag to explicitly indicate this is a clinic login
      const isClinicLoginInput = document.createElement('input');
      isClinicLoginInput.type = 'hidden';
      isClinicLoginInput.name = 'isClinicLogin';
      isClinicLoginInput.value = 'true';
      form.appendChild(isClinicLoginInput);
      
      // Add flag to skip promo redirects
      const skipPromoRedirectInput = document.createElement('input');
      skipPromoRedirectInput.type = 'hidden';
      skipPromoRedirectInput.name = 'skipPromoRedirect';
      skipPromoRedirectInput.value = 'true';
      form.appendChild(skipPromoRedirectInput);
      
      // Add timestamp for debugging
      const timestampInput = document.createElement('input');
      timestampInput.type = 'hidden';
      timestampInput.name = 'timestamp';
      timestampInput.value = Date.now().toString();
      form.appendChild(timestampInput);
      
      // Disable promo redirection specifically for clinic login
      sessionStorage.setItem('disable_promo_redirect', 'true');
      sessionStorage.setItem('clinic_login_in_progress', 'true');
      sessionStorage.setItem('clinic_dashboard_requested', 'true');
      
      // Set cookies to ensure the login process can't be hijacked
      document.cookie = "is_clinic_login=true; path=/; max-age=300; SameSite=Lax";
      document.cookie = "no_promo_redirect=true; path=/; max-age=300; SameSite=Lax";
      
      // Set additional flags to help with redirect logic
      sessionStorage.setItem('clinic_dashboard_target', '/clinic-portal/dashboard');
      
      // Set a flag to prevent redirection to your-quote page
      window.clinicLoginInProgress = true;
      
      // Set a more persistent cookie to prevent promo redirect
      document.cookie = "clinic_login_redirect=true; path=/; max-age=60; SameSite=Lax";
      
      // Submit the form - using a workaround to overcome SPA intercepting the form
      document.body.appendChild(form);
      
      // Logging to debug redirect issue
      console.log('Submitting clinic login form to:', form.action, 'with returnUrl:', returnUrlInput.value);
      
      // Navigate directly to avoid any SPA interception
      setTimeout(() => {
        form.submit();
      }, 10);
      
      // No need for catch block or state resets since we're doing a full page navigation
      
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