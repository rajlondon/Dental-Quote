import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Lock, Mail, Phone, User, Hospital } from "lucide-react";
import { navigateToClientPortal, navigateToAdminPortal, navigateToClinicPortal } from "@/utils/portalNavigation";

// Form schema for login
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Form schema for test credentials
const testCredentialsSchema = z.object({
  userType: z.enum(["client", "admin", "clinic"]),
});

// Form schema for registration
const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(5, { message: "Please enter a valid phone number" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
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
  
  // Check if user has selected a clinic (coming from the matched clinics page)
  useEffect(() => {
    const clinicId = localStorage.getItem('selectedClinicId');
    if (clinicId) {
      try {
        const clinicData = JSON.parse(localStorage.getItem('selectedClinicData') || '{}');
        if (clinicData.name) {
          setHasSelectedClinic(true);
          setSelectedClinicName(clinicData.name);
          
          // Show notification about selected clinic
          toast({
            title: "Clinic Selected",
            description: `You've selected ${clinicData.name}. Please login or register to continue.`,
          });
          
          console.log("Found selected clinic:", clinicId, clinicData.name);
        }
      } catch (error) {
        console.error('Error parsing clinic data:', error);
      }
    }
  }, [toast]);
  
  // Registration form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // Handle registration form submission
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    
    try {
      // Here we would typically make an API call to register the user
      console.log("Registration attempt with:", values);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, show toast and redirect to client portal
      toast({
        title: "Registration Successful",
        description: "Welcome to MyDentalFly! You're now logged in.",
      });
      
      // If we have a selected clinic, route to messages section with that clinic
      const clinicId = localStorage.getItem('selectedClinicId');
      if (clinicId) {
        console.log("Redirecting to messages with clinic ID:", clinicId);
        navigateToClientPortal("messages", clinicId);
      } else {
        navigateToClientPortal();
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
      userType: "client",
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    
    try {
      // Here we would typically make an API call to authenticate the user
      console.log("Login attempt with:", values);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, show toast and redirect to client portal
      toast({
        title: "Login Successful",
        description: "Welcome back to MyDentalFly!",
      });
      
      // If we have a selected clinic, route to messages section with that clinic
      const clinicId = localStorage.getItem('selectedClinicId');
      if (clinicId) {
        console.log("Redirecting to messages with clinic ID:", clinicId);
        navigateToClientPortal("messages", clinicId);
      } else {
        navigateToClientPortal();
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle test credentials form submission
  const onTestCredentialsSubmit = async (values: z.infer<typeof testCredentialsSchema>) => {
    setIsLoading(true);
    
    try {
      console.log("Test login with user type:", values.userType);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (values.userType === "client") {
        toast({
          title: "Client Test Login Successful",
          description: "You are now logged in as a test client user.",
        });
        // If we have a selected clinic, route to messages section with that clinic
        const clinicId = localStorage.getItem('selectedClinicId');
        if (clinicId) {
          console.log("Redirecting to messages with clinic ID:", clinicId);
          navigateToClientPortal("messages", clinicId);
        } else {
          navigateToClientPortal();
        }
      } else if (values.userType === "admin") {
        toast({
          title: "Admin Test Login Successful",
          description: "You are now logged in as a test admin user.",
        });
        navigateToAdminPortal();
      } else if (values.userType === "clinic") {
        toast({
          title: "Clinic Test Login Successful",
          description: "You are now logged in as a test clinic user.",
        });
        navigateToClinicPortal();
      }
    } catch (error) {
      toast({
        title: "Test Login Failed",
        description: "Something went wrong. Please try again.",
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
                  <Button variant="link" className="px-0">
                    {t("portal.login.forgot_password", "Forgot password?")}
                  </Button>
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
                                variant={field.value === "client" ? "default" : "outline"} 
                                className="flex flex-col items-center justify-center py-6"
                                onClick={() => field.onChange("client")}
                              >
                                <User className="h-8 w-8 mb-2" />
                                <span>Client</span>
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
                        {isLoading ? "Logging in..." : "Login as Test User"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    Automatically logs in with pre-defined test credentials. This option is only available in the development environment.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Column - Hero Image/Content */}
        <div className="hidden md:flex flex-col justify-center">
          <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg overflow-hidden h-[600px]">
            <div className="absolute inset-0 flex flex-col justify-center p-12">
              <h2 className="text-4xl font-bold mb-6">Welcome to MyDentalFly Portal</h2>
              <div className="space-y-6 max-w-md">
                <div className="bg-white/90 p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg text-primary mb-2">Manage Your Dental Journey</h3>
                  <p className="text-neutral-700">
                    Access your personalized treatment plans, communicate directly with your chosen clinic, and manage your appointments.
                  </p>
                </div>
                
                <div className="bg-white/90 p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg text-primary mb-2">Secure Communication</h3>
                  <p className="text-neutral-700">
                    Connect securely with your dental clinic through our encrypted messaging system for consultations and follow-ups.
                  </p>
                </div>
                
                <div className="bg-white/90 p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg text-primary mb-2">Treatment Tracking</h3>
                  <p className="text-neutral-700">
                    Track the progress of your dental procedures, view detailed treatment plans, and access post-care instructions.
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