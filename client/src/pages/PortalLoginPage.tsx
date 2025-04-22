import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Link } from "wouter";
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

// Form schema for test credentials
const testCredentialsSchema = z.object({
  userType: z.enum(["patient", "admin", "clinic"]),
});

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
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSelectedClinic, setHasSelectedClinic] = useState(false);
  const [selectedClinicName, setSelectedClinicName] = useState("");
  
  // Clear any stored clinic data on page load
  useEffect(() => {
    if (localStorage.getItem('selectedClinic')) {
      setHasSelectedClinic(true);
      setSelectedClinicName(localStorage.getItem('selectedClinicName') || "");
    }
    console.log("Cleared stored clinic data to simplify portal login navigation");
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

  // Test credentials form
  const testCredentialsForm = useForm<z.infer<typeof testCredentialsSchema>>({
    resolver: zodResolver(testCredentialsSchema),
    defaultValues: {
      userType: "patient",
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    
    try {
      console.log("Login attempt with:", values);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      // Log the raw response for debugging
      console.log("Login response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      const data = await response.json();
      console.log("Login response data:", data);
      
      if (data.success && data.user) {
        toast({
          title: "Login Successful",
          description: `Welcome back to MyDentalFly, ${data.user.firstName || ''}!`,
        });
        
        console.log("Login successful, redirecting based on role:", data.user.role);
        
        // Force redirect using window.location for more reliable navigation
        if (data.user.role === 'admin') {
          console.log("Admin user detected, redirecting to admin portal");
          // Use a slight delay to ensure the state is updated
          setTimeout(() => {
            window.location.href = '/admin-portal';
          }, 300);
        } else if (data.user.role === 'clinic_staff') {
          console.log("Clinic staff detected, redirecting to clinic portal");
          setTimeout(() => {
            window.location.href = '/clinic-portal';
          }, 300);
        } else {
          // Default to patient portal for any other role
          console.log("Patient user detected, redirecting to patient portal");
          setTimeout(() => {
            window.location.href = '/client-portal';
          }, 300);
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle test account creation
  const createTestAccount = async (email: string, password: string, role: string) => {
    try {
      const response = await fetch('/api/auth/create-test-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });
      
      if (response.ok) {
        toast({
          title: "Test Account Created",
          description: `Created ${role} test account with email: ${email}`,
        });
        return true;
      } else {
        const data = await response.json();
        toast({
          title: "Test Account Creation Failed",
          description: data.message || "Failed to create test account",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Test account creation error:", error);
      toast({
        title: "Test Account Creation Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  // Handle test credentials form submission
  const onTestCredentialsSubmit = async (values: z.infer<typeof testCredentialsSchema>) => {
    setIsLoading(true);
    
    try {
      console.log("Test login with user type:", values.userType);
      
      // Get pre-configured credentials based on selected role
      let credentials = { email: "", password: "", role: "" };
      
      if (values.userType === "admin") {
        credentials = {
          email: "admin@mydentalfly.com",
          password: "Admin123!",
          role: "admin"
        };
      } else if (values.userType === "clinic") {
        credentials = {
          email: "clinic@mydentalfly.com",
          password: "Clinic123!",
          role: "clinic_staff"
        };
      } else {
        // Default patient test user
        credentials = {
          email: "patient@mydentalfly.com",
          password: "Patient123!",
          role: "patient"
        };
      }
      
      // Option to create/reset the test account first
      const resetOption = window.confirm("Do you want to reset/create this test account first?\nClick OK to create/reset, or Cancel to just log in.");
      
      if (resetOption) {
        const created = await createTestAccount(credentials.email, credentials.password, credentials.role);
        if (!created) {
          setIsLoading(false);
          return;
        }
      }
      
      // Call the actual login API with our test credentials
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Test login failed");
      }
      
      const data = await response.json();
      
      if (data.success && data.user) {
        toast({
          title: `${values.userType.charAt(0).toUpperCase() + values.userType.slice(1)} Login Successful`,
          description: `You are now logged in as a test ${values.userType} user.`,
        });
        
        // Redirect based on user role (from actual response)
        console.log("Test login successful, redirecting based on role:", data.user.role);
        
        // Force redirect using window.location for more reliable navigation
        if (data.user.role === 'admin') {
          console.log("Admin user detected in test login, redirecting to admin portal");
          // Use a slight delay to ensure the state is updated
          setTimeout(() => {
            window.location.href = '/admin-portal';
          }, 300);
        } else if (data.user.role === 'clinic_staff') {
          console.log("Clinic staff detected in test login, redirecting to clinic portal");
          setTimeout(() => {
            window.location.href = '/clinic-portal';
          }, 300);
        } else {
          // Default to patient portal for any other role
          console.log("Patient user detected in test login, redirecting to patient portal");
          setTimeout(() => {
            window.location.href = '/client-portal';
          }, 300);
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Test login error:", error);
      toast({
        title: "Test Login Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
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
              <img 
                src="/images/mydentalfly-logo.png" 
                alt="MyDentalFly Logo" 
                className="h-20 w-auto mr-3 shadow-sm border border-gray-100 rounded-md p-2" 
              />
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
              <TabsTrigger value="login">{t("portal.login.signin", "Sign In")}</TabsTrigger>
              <TabsTrigger value="register">{t("portal.login.register", "Register")}</TabsTrigger>
              <TabsTrigger value="test">{t("portal.login.test_access", "Test")}</TabsTrigger>
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

            {/* Test Credentials Tab */}
            <TabsContent value="test">
              <Card>
                <CardHeader>
                  <CardTitle>Test User Access</CardTitle>
                  <CardDescription>
                    Quickly log in with pre-configured test accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...testCredentialsForm}>
                    <form onSubmit={testCredentialsForm.handleSubmit(onTestCredentialsSubmit)} className="space-y-4">
                      <FormField
                        control={testCredentialsForm.control}
                        name="userType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select User Type</FormLabel>
                            <FormControl>
                              <div className="flex flex-col space-y-2">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="userType"
                                    value="patient"
                                    checked={field.value === "patient"}
                                    onChange={() => field.onChange("patient")}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <span>Patient (test@mydentalfly.com)</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="userType"
                                    value="clinic"
                                    checked={field.value === "clinic"}
                                    onChange={() => field.onChange("clinic")}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <span>Clinic (clinic@mydentalfly.com)</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="userType"
                                    value="admin"
                                    checked={field.value === "admin"}
                                    onChange={() => field.onChange("admin")}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <span>Admin (admin@mydentalfly.com)</span>
                                </label>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Select the type of test user to log in as
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Access Test Account"}
                      </Button>
                    </form>
                  </Form>
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
                                  type="email"
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
                                  placeholder="+1 (555) 123-4567" 
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
                      <div className="space-y-3 pt-2">
                        <FormField
                          control={registerForm.control}
                          name="termsConsent"
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
                                  I agree to the <Link href="/terms" className="text-primary underline">Terms of Service</Link>, <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>, and <Link href="/disclaimer" className="text-primary underline">Medical Disclaimer</Link>
                                </FormLabel>
                                <FormMessage />
                              </div>
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
                                  I agree to be contacted by MyDentalFly regarding my treatment plan and bookings
                                </FormLabel>
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
                                  I would like to receive promotional material and special offers by email (optional)
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? t("portal.login.registering", "Creating account...") : t("portal.login.register", "Create Account")}
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
          <div className="bg-primary/5 p-8 rounded-lg border border-primary/10">
            <h2 className="text-2xl font-bold text-primary mb-6">
              {t("portal.login.benefits.title", "Your Dental Journey in One Place")}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full mt-1">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">
                    {t("portal.login.benefits.treatment_plans", "View Your Treatment Plans")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("portal.login.benefits.treatment_plans_desc", "Access detailed treatment plans from your selected clinics")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full mt-1">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">
                    {t("portal.login.benefits.compare", "Compare Clinic Treatments")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("portal.login.benefits.compare_desc", "Side-by-side comparison of treatment options and prices")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full mt-1">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">
                    {t("portal.login.benefits.communicate", "Direct Communication")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("portal.login.benefits.communicate_desc", "Message your dental providers directly within the platform")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full mt-1">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">
                    {t("portal.login.benefits.book", "Book & Manage Appointments")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("portal.login.benefits.book_desc", "Schedule consultations and treatments with ease")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full mt-1">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">
                    {t("portal.login.benefits.secure", "Secure & Confidential")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
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