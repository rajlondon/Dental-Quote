import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { 
  AlertCircle, Check, Lock, Mail, Phone, User 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

// Registration form schema
const registerSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(6, {
    message: "Please enter a valid phone number.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
  }),
  confirmPassword: z.string(),
  termsConsent: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions.",
  }),
  contactConsent: z.boolean(),
  promotionalConsent: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const PortalLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSelectedClinic, setHasSelectedClinic] = useState(false);
  const [selectedClinicName, setSelectedClinicName] = useState("");
  
  // Check if user is already authenticated
  useEffect(() => {
    if (user && user.role === 'admin') {
      setLocation('/admin-portal');
    } else if (user && user.role === 'clinic_staff') {
      setLocation('/clinic-portal');
    } else if (user && user.role === 'patient' && user.emailVerified) {
      setLocation('/client-portal');
    }
    
    // Check if user came from clinic selection
    if (localStorage.getItem('selectedClinicId')) {
      setHasSelectedClinic(true);
      setSelectedClinicName(localStorage.getItem('selectedClinicName') || "");
    }
  }, []);
  
  // Handle registration form submission
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    
    try {
      console.log("Starting registration with values:", {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        termsConsent: values.termsConsent,
        contactConsent: values.contactConsent,
        promotionalConsent: values.promotionalConsent
      });
      
      const firstName = values.fullName.split(' ')[0] || '';
      const lastName = values.fullName.split(' ').slice(1).join(' ') || '';
      
      const requestBody = {
        firstName,
        lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: 'patient', // Default role for new registrations
        consent: values.termsConsent, // Match the backend field name
        consentContact: values.contactConsent || false,
        consentMarketing: values.promotionalConsent || false,
      };
      
      console.log("Sending registration request with body:", requestBody);
      
      // Make direct API call to debug
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include' // Important to include cookies
      });
      
      console.log("Registration response status:", response.status);
      
      const respText = await response.text();
      console.log("Response text:", respText);
      
      if (!response.ok) {
        try {
          const errorData = JSON.parse(respText);
          console.error("Registration error data:", errorData);
          throw new Error(errorData.message || "Registration failed");
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          throw new Error("Registration failed with status: " + response.status);
        }
      }
      
      // Parse the response text as JSON since we already consumed the response body
      const data = respText ? JSON.parse(respText) : {};
      
      // Show success message based on response
      toast({
        title: "Registration Successful",
        description: "Please check your email for verification instructions.",
      });
      
      // Redirect to verification notice page
      setLocation('/verification-sent?email=' + encodeURIComponent(values.email));
      
    } catch (error) {
      console.error("Registration error:", error);
      // Extract specific error message if available
      const errorMessage = (error instanceof Error) ? error.message : "There was a problem with your registration. Please try again.";
      
      toast({
        title: "Registration Failed",
        description: errorMessage.includes("User with this email already exists") 
          ? "This email is already registered. Please use a different email or try logging in." 
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });



  // Handle login form submission
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      console.log("Login attempt with:", values);
      
      // Make direct API call rather than using loginMutation
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        credentials: 'include', // Important! This ensures cookies are sent with the request
        body: JSON.stringify({
          email: values.email,
          password: values.password
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      console.log("Login successful, redirecting based on role:", data.user.role);
      
      // Extract user information
      const user = data.user;
      
      // Store user data in localStorage and sessionStorage for redundancy
      try {
        const userKey = user.role === 'clinic_staff' ? 'clinic_user' : 
                        user.role === 'admin' ? 'admin_user' : 'patient_user';
        
        localStorage.setItem(userKey, JSON.stringify(user));
        sessionStorage.setItem(userKey, JSON.stringify(user));
        
        // Create a robust session cookie check
        document.cookie = "session_check=1; path=/; max-age=3600";
        
        // Store CSRF token if available
        if (data.csrfToken) {
          localStorage.setItem('csrf_token', data.csrfToken);
        }
        
        console.log("Authentication data stored locally for", user.role);
      } catch (e) {
        console.warn("Could not store authentication data locally:", e);
      }
      
      // Show a custom toast message
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName || user.email}!`,
      });
      
      // We'll use our routing helper for more consistent navigation
      import("../lib/routing-helper")
        .then(({ navigateToUserPortal }) => {
          // Add some local persistence to reinforce the server-side cookies
          try {
            // Store user data redundantly
            localStorage.setItem('user_data', JSON.stringify(user));
            sessionStorage.setItem('user_data', JSON.stringify(user));
            
            // Set manual role cookies in case HTTP-only cookies aren't working properly
            const cookieMaxAge = 7 * 24 * 60 * 60; // 7 days in seconds
            document.cookie = `user_role=${user.role}; path=/; max-age=${cookieMaxAge}`;
            document.cookie = `user_id=${user.id}; path=/; max-age=${cookieMaxAge}`;
            document.cookie = `is_authenticated=true; path=/; max-age=${cookieMaxAge}`;
            
            // Set role-specific flags
            if (user.role === 'admin') {
              localStorage.setItem('is_admin', 'true');
              sessionStorage.setItem('is_admin', 'true');
            } else if (user.role === 'clinic_staff' || user.role === 'clinic') {
              localStorage.setItem('is_clinic', 'true');
              sessionStorage.setItem('is_clinic', 'true');
            } else {
              localStorage.setItem('is_patient', 'true');
              sessionStorage.setItem('is_patient', 'true');
            }
            
            console.log("User data stored in local storage:", user.role);
          } catch (e) {
            console.warn("Failed to store user data locally:", e);
          }
          
          // Wait before redirecting to ensure all data is saved
          setTimeout(() => {
            console.log("Performing enhanced redirect based on role:", user.role);
            
            // We'll use our own custom redirect rule rather than navigateToUserPortal
            // This is more specific since we know exactly which role the user has
            const baseUrl = window.location.origin;
            const timestamp = Date.now();
            
            try {
              if (user.role === 'admin') {
                console.log("Admin user detected, redirecting to admin portal");
                window.location.replace(`${baseUrl}/admin-portal?uid=${user.id}&t=${timestamp}`);
              } else if (user.role === 'clinic_staff' || user.role === 'clinic') {
                console.log("Clinic staff detected, redirecting to clinic portal");
                window.location.replace(`${baseUrl}/clinic-portal?uid=${user.id}&t=${timestamp}`);
              } else {
                console.log("Patient user detected, redirecting to patient portal");
                window.location.replace(`${baseUrl}/client-portal?uid=${user.id}&t=${timestamp}`);
              }
            } catch (e) {
              console.error("Direct redirect failed, trying navigateToUserPortal:", e);
              navigateToUserPortal();
            }
          }, 1500);
        })
        .catch(error => {
          console.error("Failed to import routing helper:", error);
          // Fallback with basic redirect
          setTimeout(() => {
            const baseUrl = window.location.origin;
            const portal = user.role === 'admin' ? 'admin-portal' : 
                          (user.role === 'clinic_staff' || user.role === 'clinic') ? 'clinic-portal' : 
                          'client-portal';
            window.location.href = `${baseUrl}/${portal}`;
          }, 1500);
        });
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  // Registration form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      termsConsent: false,
      contactConsent: false,
      promotionalConsent: false,
    },
  });

  return (
    <div className="bg-neutral-50 min-h-screen flex items-center justify-center p-4">
      <div className="container max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Left Column - Login Forms */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Link href="/">
                <img 
                  src="/images/mydentalfly-logo.png" 
                  alt="MyDentalFly Logo" 
                  className="h-20 w-auto mr-3 shadow-sm border border-gray-100 rounded-md p-2 cursor-pointer" 
                />
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {t("portal.login.title", "Patient & Admin Portal")}
            </h1>
            <p className="text-neutral-600">
              {t("portal.login.subtitle", "Access your dental treatment information and communicate with our team.")}
            </p>
          </div>

          {/* Display clinic notification if selected */}
          {hasSelectedClinic && (
            <Alert className="mb-6 bg-primary/10 border-primary/20">
              <Check className="h-4 w-4 text-primary" />
              <AlertTitle>You selected {selectedClinicName}</AlertTitle>
              <AlertDescription>
                Please log in or create an account to continue with your booking.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Display verification reminder for unverified users */}
          {user && user.role === 'patient' && !user.emailVerified && user.status === 'pending' && (
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertTitle>Email Verification Required</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>Please check your email inbox and click the verification link to activate your account.</p>
                <Button 
                  variant="outline"
                  size="sm"
                  className="self-start text-xs"
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      const response = await fetch('/api/auth/resend-verification', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        }
                      });
                      
                      const data = await response.json();
                      
                      if (response.ok) {
                        toast({
                          title: "Verification Email Sent",
                          description: "Please check your inbox for the verification link.",
                        });
                      } else {
                        toast({
                          title: "Failed to Send Verification",
                          description: data.message || "Please try again later.",
                          variant: "destructive"
                        });
                      }
                    } catch (error) {
                      console.error("Error resending verification:", error);
                      toast({
                        title: "Error",
                        description: "Failed to request verification email. Please try again.",
                        variant: "destructive"
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  Resend Verification Email
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="login" className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger id="login-tab" value="login">{t("portal.login.signin", "Sign In")}</TabsTrigger>
              <TabsTrigger id="clinic-tab" value="clinic">Clinic Login</TabsTrigger>
              <TabsTrigger id="register-tab" value="register">{t("portal.login.register", "Register")}</TabsTrigger>
            </TabsList>
            
            {/* Regular Login Tab */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>{t("portal.login.signin", "Sign In")}</CardTitle>
                  <CardDescription>
                    {t("portal.login.signin_desc", "Enter your credentials to access your account")}
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
                                  placeholder="you@example.com" 
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
                            <FormLabel>{t("portal.login.password", "Password")}</FormLabel>
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
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? t("portal.login.signing_in", "Signing in...") : t("portal.login.signin", "Sign In")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href="/forgot-password">
                    <Button variant="link" className="px-0">
                      {t("portal.login.forgot_password", "Forgot password?")}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>


            {/* Clinic Login Tab */}
            <TabsContent value="clinic">
              <Card>
                <CardHeader>
                  <CardTitle>Clinic Staff Login</CardTitle>
                  <CardDescription>
                    Access your clinic dashboard and patient management
                  </CardDescription>
                  <div className="mt-3 text-center">
                    <Button 
                      variant="secondary"
                      className="w-full"
                      onClick={() => window.location.href = '/clinic-login'}
                    >
                      Use Direct Clinic Login Instead (Recommended)
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Direct login provides a more stable connection to the clinic portal
                    </p>
                  </div>
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
                            <FormLabel>{t("portal.login.password", "Password")}</FormLabel>
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
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In as Clinic Staff"}
                      </Button>
                    </form>
                  </Form>
                  <div className="mt-4 text-sm text-center">
                    <p className="text-neutral-500">
                      To register as a new clinic partner, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Registration Tab */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>{t("portal.login.register", "Create an Account")}</CardTitle>
                  <CardDescription>
                    {t("portal.login.register_desc", "Register to access your dental treatment plan")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      console.log("Form submitted with values:", registerForm.getValues());
                      registerForm.handleSubmit(onRegisterSubmit)(e);
                    }} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.name", "Full Name")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                                <Input 
                                  placeholder="John Smith" 
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
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.email", "Email Address")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                                <Input 
                                  placeholder="you@example.com" 
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
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.phone", "Phone Number")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                                <Input 
                                  placeholder="+44 7700 900123" 
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
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("portal.login.password", "Password")}</FormLabel>
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
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
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
                      <FormField
                        control={registerForm.control}
                        name="termsConsent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to the Terms and Conditions, Privacy Policy, and Medical Disclaimer
                              </FormLabel>
                              <FormDescription>
                                By checking this box, you agree to our terms of service, privacy policy, and consent to dental information sharing for treatment purposes.
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="contactConsent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I consent to being contacted about my dental treatment
                              </FormLabel>
                              <FormDescription>
                                We'll use your email and phone to communicate about your treatments, appointments, and quotes.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="promotionalConsent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I want to receive promotional offers and newsletters
                              </FormLabel>
                              <FormDescription>
                                Receive updates on dental care tips, special offers, and new treatments (optional).
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : t("portal.login.register", "Create Account")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Benefits */}
        <div className="hidden md:flex flex-col justify-center">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">
              {t("portal.login.benefits.title", "Your Dental Journey in One Place")}
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 bg-white/20 p-3 rounded-full">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {t("portal.login.benefits.treatment_plans", "View Your Treatment Plans")}
                  </h3>
                  <p className="text-white/90">
                    {t("portal.login.benefits.treatment_plans_desc", "Access detailed treatment plans from your selected clinics")}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="shrink-0 bg-white/20 p-3 rounded-full">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {t("portal.login.benefits.compare", "Compare Clinic Treatments")}
                  </h3>
                  <p className="text-white/90">
                    {t("portal.login.benefits.compare_desc", "Side-by-side comparison of treatment options and prices")}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="shrink-0 bg-white/20 p-3 rounded-full">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {t("portal.login.benefits.communicate", "Direct Communication")}
                  </h3>
                  <p className="text-white/90">
                    {t("portal.login.benefits.communicate_desc", "Message your dental providers directly within the platform")}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="shrink-0 bg-white/20 p-3 rounded-full">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {t("portal.login.benefits.book", "Book & Manage Appointments")}
                  </h3>
                  <p className="text-white/90">
                    {t("portal.login.benefits.book_desc", "Schedule consultations and treatments with ease")}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="shrink-0 bg-white/20 p-3 rounded-full">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {t("portal.login.benefits.secure", "Secure & Confidential")}
                  </h3>
                  <p className="text-white/90">
                    {t("portal.login.benefits.secure_desc", "All your dental records and communications are encrypted and secure")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalLoginPage;