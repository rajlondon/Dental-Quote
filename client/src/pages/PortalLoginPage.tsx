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
        }
      } catch (error) {
        console.error('Error parsing clinic data:', error);
      }
    }
  }, []);
  
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
        description: "Welcome back to Istanbul Dental Smile!",
      });
      
      navigate("/client-portal");
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
        navigate("/client-portal");
      } else if (values.userType === "admin") {
        toast({
          title: "Admin Test Login Successful",
          description: "You are now logged in as a test admin user.",
        });
        navigate("/admin-portal");
      } else if (values.userType === "clinic") {
        toast({
          title: "Clinic Test Login Successful",
          description: "You are now logged in as a test clinic user.",
        });
        navigate("/clinic-portal");
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

          <Tabs defaultValue="login" className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("portal.login.signin", "Sign In")}</TabsTrigger>
              <TabsTrigger value="test">{t("portal.login.test_access", "Test Access")}</TabsTrigger>
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
            
            {/* Test Access Tab */}
            <TabsContent value="test">
              <Card>
                <CardHeader>
                  <CardTitle>{t("portal.login.test_access", "Test Access")}</CardTitle>
                  <CardDescription>
                    {t("portal.login.test_desc", "Use test credentials to explore the portal")}
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
                            <FormLabel>{t("portal.login.user_type", "Select User Type")}</FormLabel>
                            <div className="grid grid-cols-2 gap-4">
                              <Button
                                type="button"
                                variant={field.value === "client" ? "default" : "outline"}
                                className={`flex items-center justify-center gap-2 h-20 ${
                                  field.value === "client" ? "ring-2 ring-primary" : ""
                                }`}
                                onClick={() => field.onChange("client")}
                              >
                                <User className="h-5 w-5" />
                                <div className="text-left">
                                  <div className="font-medium">{t("portal.login.client", "Client")}</div>
                                  <div className="text-xs text-neutral-500">{t("portal.login.client_desc", "Patient Portal")}</div>
                                </div>
                              </Button>
                              <Button
                                type="button"
                                variant={field.value === "admin" ? "default" : "outline"}
                                className={`flex items-center justify-center gap-2 h-20 ${
                                  field.value === "admin" ? "ring-2 ring-primary" : ""
                                }`}
                                onClick={() => field.onChange("admin")}
                              >
                                <Lock className="h-5 w-5" />
                                <div className="text-left">
                                  <div className="font-medium">{t("portal.login.admin", "Admin")}</div>
                                  <div className="text-xs text-neutral-500">{t("portal.login.admin_desc", "Staff Portal")}</div>
                                </div>
                              </Button>
                            </div>
                            <div className="mt-4">
                              <Button
                                type="button"
                                variant={field.value === "clinic" ? "default" : "outline"}
                                className={`flex items-center justify-center gap-2 h-20 w-full ${
                                  field.value === "clinic" ? "ring-2 ring-primary" : ""
                                }`}
                                onClick={() => field.onChange("clinic")}
                              >
                                <Hospital className="h-5 w-5" />
                                <div className="text-left">
                                  <div className="font-medium">{t("portal.login.clinic", "Clinic")}</div>
                                  <div className="text-xs text-neutral-500">{t("portal.login.clinic_desc", "Clinic Management Portal")}</div>
                                </div>
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? t("portal.login.accessing", "Accessing...") : t("portal.login.access_portal", "Access Portal")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Column - Hero/Explainer */}
        <div className="hidden md:flex flex-col justify-center">
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20 z-0" />
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-primary mb-4">
                {t("portal.login.welcome", "Welcome to Istanbul Dental Smile Portal")}
              </h2>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium text-primary mb-2">
                    {t("portal.login.client_features", "Patient Portal Features")}
                  </h3>
                  <ul className="text-sm text-neutral-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded mt-0.5">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {t("portal.login.feature_treatment_plan", "View and approve your treatment plan")}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded mt-0.5">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {t("portal.login.feature_chat", "Chat with your dental team")}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded mt-0.5">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {t("portal.login.feature_docs", "Upload and manage your documents")}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded mt-0.5">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {t("portal.login.feature_appts", "Schedule and manage appointments")}
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium text-primary mb-2">
                    {t("portal.login.admin_features", "Admin Portal Features")}
                  </h3>
                  <ul className="text-sm text-neutral-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded mt-0.5">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {t("portal.login.feature_patients", "Manage patient accounts and inquiries")}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded mt-0.5">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {t("portal.login.feature_quotes", "Create and send treatment quotes")}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded mt-0.5">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {t("portal.login.feature_bookings", "Track bookings and appointments")}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded mt-0.5">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {t("portal.login.feature_analytics", "View analytics and performance metrics")}
                    </li>
                  </ul>
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