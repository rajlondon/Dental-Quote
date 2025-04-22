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
  const [selectedClinicName, setSelectedClinicName] = useState<string | null>(null);
  
  // Simplify portal login by removing clinic selection for now
  useEffect(() => {
    // Clear any stored clinic data to avoid routing issues
    localStorage.removeItem('selectedClinicId');
    localStorage.removeItem('selectedClinicData');
    
    // Reset states
    setHasSelectedClinic(false);
    setSelectedClinicName(null);
    
    console.log("Cleared stored clinic data to simplify portal login navigation");
  }, []);
  
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
  
  // Handle registration form submission
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    
    try {
      console.log("Registration attempt with:", values);
      
      // Split the full name into first and last name
      let firstName = values.fullName;
      let lastName = "";
      
      if (values.fullName.includes(" ")) {
        const nameParts = values.fullName.split(" ");
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(" ");
      }
      
      // Development mode - Use the test account creation API instead of regular registration
      // This will allow us to bypass email verification for testing
      const isDevelopment = process.env.NODE_ENV !== 'production' || window.location.hostname.includes('replit');
      
      if (isDevelopment) {
        const useTestRegistration = window.confirm(
          "Would you like to use the simplified development registration?\n\n" +
          "This will create a pre-verified account that doesn't require email verification.\n\n" +
          "Click OK for simplified registration (recommended for testing), or Cancel for normal registration with email verification."
        );
        
        if (useTestRegistration) {
          // Use test account creation that bypasses email verification
          const testResponse = await fetch('/api/auth/create-test-account', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: values.email,
              password: values.password,
              role: "patient"
            }),
          });
          
          const testData = await testResponse.json();
          
          if (!testResponse.ok) {
            throw new Error(testData.message || "Test registration failed");
          }
          
          // Automatically log in with the new account
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: values.email,
              password: values.password,
            }),
          });
          
          const loginData = await loginResponse.json();
          
          if (!loginResponse.ok) {
            throw new Error(loginData.message || "Login after registration failed");
          }
          
          toast({
            title: "Development Registration Successful",
            description: "Your account was created with pre-verified status. You're now logged in.",
          });
          
          // Navigate to patient portal
          localStorage.removeItem('selectedClinicId');
          navigate("/client-portal");
          return;
        }
      }
      
      // Regular registration process with email verification
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          firstName,
          lastName,
          phone: values.phone,
          consent: values.termsConsent,
          contactConsent: values.contactConsent,
          promotionalConsent: values.promotionalConsent
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      
      // Show verification required message
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account before logging in.",
      });
      
      // Reset the form
      registerForm.reset();
      
      // Switch to login tab
      const loginTab = document.querySelector('[data-state="inactive"][value="login"]') as HTMLElement;
      if (loginTab) {
        loginTab.click();
      }
    } catch (error) {
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
      // Make API call to the new authentication endpoint
      console.log("Login attempt with:", values);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      const data = await response.json();
      
      // Check user role to determine where to redirect
      if (data.success && data.user) {
        toast({
          title: "Login Successful",
          description: `Welcome back to MyDentalFly, ${data.user.firstName || ''}!`,
        });
        
        // Redirect based on user role
        console.log("Login successful, redirecting based on role:", data.user.role);
        
        if (data.user.role === 'admin') {
          console.log("Admin user detected, redirecting to admin portal");
          // Use navigate instead of direct location change
          navigate("/admin-portal");
        } else if (data.user.role === 'clinic_staff') {
          console.log("Clinic staff detected, redirecting to clinic portal");
          navigate("/clinic-portal");
        } else {
          // Default to patient portal for any other role
          console.log("Patient user detected, redirecting to patient portal");
          navigate("/client-portal");
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
        
        if (data.user.role === 'admin') {
          console.log("Admin user detected in test login, redirecting to admin portal");
          navigate("/admin-portal");
        } else if (data.user.role === 'clinic_staff') {
          console.log("Clinic staff detected in test login, redirecting to clinic portal");
          navigate("/clinic-portal");
        } else {
          // Default to patient portal for any other role
          console.log("Patient user detected in test login, redirecting to patient portal");
          navigate("/client-portal");
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
            
            {/* Registration Tab */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>{t("portal.login.register", "Create an Account")}</CardTitle>
                  <CardDescription>
                    {t("portal.login.register_desc", "Register to access your dental treatment plan")}
                    {hasSelectedClinic && (
                      <span className="block mt-1 text-primary font-medium">
                        You've selected {selectedClinicName} for your treatment
                      </span>
                    )}
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
                                  placeholder="+44 123 456 7890" 
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
                            <FormLabel>{t("portal.login.confirm_password", "Confirm Password")}</FormLabel>
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

                      <div className="space-y-4 pt-4 border-t mt-2">
                        <h3 className="text-sm font-medium">Consent Options</h3>
                        
                        {/* Required Terms Consent */}
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
                                  I agree to the <a href="/terms" className="text-primary hover:underline">Terms of Use</a>,{" "}
                                  <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, and acknowledge the{" "}
                                  <a href="/medical-disclaimer" className="text-primary hover:underline">Medical Disclaimer</a>.
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  I understand MyDentalFly is a facilitator, not a provider of direct dental care. I consent to uploading my dental information, scans, and documents for clinic review.
                                </FormDescription>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        {/* Optional Contact Consent */}
                        <FormField
                          control={registerForm.control}
                          name="contactConsent"
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
                                  I consent to being contacted via email, SMS, or WhatsApp about my enquiry and treatment planning.
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  This includes booking support communication and travel or appointment updates.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        {/* Optional Promotional Consent */}
                        <FormField
                          control={registerForm.control}
                          name="promotionalConsent"
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
                                  I'd like to receive tips, offers, and promotions from MyDentalFly and its partner clinics.
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  This includes newsletters and special offers from our partner clinics.
                                </FormDescription>
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
            
            {/* Test Credentials Tab */}
            <TabsContent value="test">
              <Card>
                <CardHeader>
                  <CardTitle>Test Access</CardTitle>
                  <CardDescription>
                    For demonstration purposes only. Choose a user type to test the portal.
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
                            <FormLabel>User Type</FormLabel>
                            <div className="grid grid-cols-3 gap-2">
                              <Button 
                                type="button" 
                                variant={field.value === "patient" ? "default" : "outline"} 
                                className="flex flex-col items-center justify-center py-6"
                                onClick={() => field.onChange("patient")}
                              >
                                <User className="h-8 w-8 mb-2" />
                                <span>Patient</span>
                              </Button>
                              <Button 
                                type="button" 
                                variant={field.value === "admin" ? "default" : "outline"} 
                                className="flex flex-col items-center justify-center py-6"
                                onClick={() => field.onChange("admin")}
                              >
                                <Lock className="h-8 w-8 mb-2" />
                                <span>Admin</span>
                              </Button>
                              <Button 
                                type="button" 
                                variant={field.value === "clinic" ? "default" : "outline"} 
                                className="flex flex-col items-center justify-center py-6"
                                onClick={() => field.onChange("clinic")}
                              >
                                <Hospital className="h-8 w-8 mb-2" />
                                <span>Clinic</span>
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Continue with Test Account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Column - Features */}
        <div className="hidden md:flex flex-col justify-center">
          <div className="bg-gradient-to-br from-primary/5 to-primary/20 p-6 rounded-xl border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/20 transform translate-x-1/3 skew-x-12" />
            
            <h2 className="text-2xl font-bold text-primary mb-6">
              {t("portal.login.benefits.title", "Your Dental Journey in One Place")}
            </h2>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-start space-x-3">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {t("portal.login.benefits.treatment_plans", "View Your Treatment Plans")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("portal.login.benefits.treatment_plans_desc", "Access detailed treatment plans from your selected clinics")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {t("portal.login.benefits.compare", "Compare Clinic Treatments")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("portal.login.benefits.compare_desc", "Side-by-side comparison of treatment options and prices")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {t("portal.login.benefits.communicate", "Direct Communication")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("portal.login.benefits.communicate_desc", "Message your dental providers directly within the platform")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {t("portal.login.benefits.book", "Book & Manage Appointments")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("portal.login.benefits.book_desc", "Schedule consultations and treatments with ease")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {t("portal.login.benefits.secure", "Secure & Confidential")}
                  </h3>
                  <p className="text-sm text-gray-600">
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