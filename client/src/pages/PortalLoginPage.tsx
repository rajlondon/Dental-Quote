import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Lock, Mail, Phone, User, Hospital } from "lucide-react";

// Form schema for login
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Form schemas for login and registration

// Form schema for registration
const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(5, { message: "Please enter a valid phone number" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  termsConsent: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms, Privacy Policy, and Medical Disclaimer to continue."
  }),
  contactConsent: z.boolean().optional(),
  promotionalConsent: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const PortalLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loginMutation } = useAuth();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSelectedClinic, setHasSelectedClinic] = useState(false);
  const [selectedClinicName, setSelectedClinicName] = useState("");
  
  // Check if user is already logged in and redirect if needed
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting:", user.role);
      if (user.role === 'admin') {
        navigate('/admin-portal');
      } else if (user.role === 'clinic_staff') {
        navigate('/clinic-portal');
      } else {
        navigate('/client-portal');
      }
    }
  }, [user, navigate]);

  // Check for query parameters and set selected clinic data
  useEffect(() => {
    // Check for clinic type in URL
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type === 'clinic') {
      document.getElementById('clinic-tab')?.click();
    }
    
    // Check for selected clinic data
    if (localStorage.getItem('selectedClinic')) {
      setHasSelectedClinic(true);
      setSelectedClinicName(localStorage.getItem('selectedClinicName') || "");
    }
  }, []);
  
  // Handle registration form submission
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    
    try {
      // Make API call to register endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: values.fullName.split(' ')[0],
          lastName: values.fullName.split(' ').slice(1).join(' '),
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: 'patient', // Default role for new registrations
          consentGDPR: values.termsConsent,
          consentContact: values.contactConsent || false,
          consentMarketing: values.promotionalConsent || false,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      
      const data = await response.json();
      
      // Show success message based on response
      toast({
        title: "Registration Successful",
        description: "Please check your email for verification instructions.",
      });
      
      // Switch to the login tab or redirect to email verification page
      // For now, just set focus to login tab
      const loginTab = document.querySelector('[data-value="login"]');
      if (loginTab && loginTab instanceof HTMLElement) {
        loginTab.click();
      }
      
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "There was a problem with your registration. Please try again.",
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
      console.log("Login attempt with:", values);
      
      // Use the loginMutation from useAuth hook
      const userData = await loginMutation.mutateAsync({
        username: values.email,
        password: values.password
      });
      
      // Show success message
      toast({
        title: "Login Successful",
        description: `Welcome back to MyDentalFly, ${userData.firstName || ''}!`,
      });
      
      // Direct redirect based on user role from response
      console.log("Login successful, redirecting based on role:", userData.role);
      
      if (userData.role === 'admin') {
        console.log("Admin user detected, redirecting to admin portal");
        navigate('/admin-portal');
      } else if (userData.role === 'clinic_staff') {
        console.log("Clinic staff detected, redirecting to clinic portal");
        navigate('/clinic-portal');
      } else {
        // Default to patient portal for any other role
        console.log("Patient user detected, redirecting to patient portal");
        navigate('/client-portal');
      }
      
    } catch (error) {
      console.error("Login error:", error);
      // The loginMutation will handle error toasts automatically
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
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
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