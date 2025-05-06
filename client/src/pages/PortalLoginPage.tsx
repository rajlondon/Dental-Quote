import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';

// Add global window property for error toast tracking
declare global {
  interface Window {
    __offerErrorToastShown?: boolean;
    __directAdminNavigation?: boolean;
  }
}
import { 
  AlertCircle, Check, Lock, Mail, Phone, User, ShieldCheck, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Debug tracking for reload issue - remove after debugging
function setupReloadTracker() {
  if (typeof window !== 'undefined') {
    // Only set up once
    if ((window as any).__reloadTrackerSetup) return;
    (window as any).__reloadTrackerSetup = true;
    
    console.log("🔍 Setting up reload tracker");
    
    // Track events
    ['visibilitychange', 'message', 'beforeunload'].forEach(e =>
      window.addEventListener(e, () => console.log('EVENT', e, performance.now())));

    // We can't override native browser methods directly, so we'll use event listeners instead
    try {
      // Monitor beforeunload which happens before page refresh 
      window.addEventListener('beforeunload', () => {
        console.trace('🔄 Page unloading at', performance.now());
      });
      
      // Monitor navigation events with performance observer
      if (typeof PerformanceObserver !== 'undefined') {
        const navigationObserver = new PerformanceObserver((entries) => {
          entries.getEntries().forEach(entry => {
            console.log('📊 Navigation performance entry:', entry.entryType, entry);
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
      }
      
      // Manually add a small helper to console for testing
      (window as any).traceReloads = true;
      console.log('🔍 Reload tracing enabled - view in console');
    } catch (error) {
      console.error('Error setting up reload tracker:', error);
    }
  }
}

// Login form schema
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

// Admin login schema
const adminLoginSchema = z.object({
  email: z.string().email({ 
    message: "Enter a valid email address" 
  }),
  password: z.string().min(6, { 
    message: "Password must be at least 6 characters" 
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
  const { adminUser, adminLogin, isLoading: adminIsLoading } = useAdminAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSelectedClinic, setHasSelectedClinic] = useState(false);
  const [selectedClinicName, setSelectedClinicName] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  
  // Set up reload tracking for debugging the clinic portal issue
  useEffect(() => {
    setupReloadTracker();
  }, []);
  
  // Extract any query parameters from URL
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  
  // Get and parse URL search params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);
      
      // Debug logging
      if (params.has('booking')) {
        console.log(`[DEBUG] Found booking param for package: ${params.get('booking')}`);
      }
    }
  }, []);
  
  // Check if user is already authenticated
  useEffect(() => {
    // Don't redirect if not logged in
    if (!user) return;
    
    console.log("User already authenticated in PortalLoginPage, checking for special offer data and booking param");
    
    // If the user is already logged in and has a pending offer, we should process it directly
    // instead of clearing it to avoid losing the user selection
    const pendingOfferData = sessionStorage.getItem('pendingSpecialOffer');
    const processingOffer = sessionStorage.getItem('processingSpecialOffer');
    const activeOffer = sessionStorage.getItem('activeSpecialOffer');
    
    // If there's an active/pending offer, process it directly to a treatment plan
    if (pendingOfferData || activeOffer) {
      try {
        console.log("User already logged in with pending offer, creating treatment plan directly");
        
        // Parse the offer data
        const offerData = JSON.parse(pendingOfferData || activeOffer || '{}');
        const offerId = offerData.id;
        
        if (offerId) {
          // Check if user needs to go through the dental quiz first (new users)
          const needsQuiz = !user.profileComplete;
          
          if (needsQuiz) {
            // Store the pending offer for after quiz completion
            localStorage.setItem('pendingOfferAfterQuiz', JSON.stringify({
              offerId: offerId,
              clinicId: offerData.clinicId,
              offerTitle: offerData.title
            }));
            
            toast({
              title: "Let's Complete Your Dental Profile",
              description: "Please answer a few questions about your dental needs first.",
            });
            
            // Redirect to the quiz flow, but skip info page since we have basic info
            setTimeout(() => {
              window.location.href = '/quote-flow?step=dental-quiz&skipInfo=true&clinicId=' + offerData.clinicId;
            }, 100);
            return;
          }
          
          // If user has already completed profile, proceed with creating the treatment plan
          // Try the proper endpoint first with fallback support
          console.log(`Attempting to create treatment plan from offer ${offerId}`);
          
          // Use our reliable treatment plan API with proper error handling
          console.log("Using /api/treatment-plans/from-offer endpoint with offer ID:", offerId);
          
          // Use the apiRequest helper for better error handling
          apiRequest(
            'POST', 
            '/api/treatment-plans/from-offer',
            {
              offerId: offerId,
              clinicId: offerData.clinicId || offerData.clinic_id,
              notes: 'Created from special offer selection'
            }
          )
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to create treatment plan: ${response.status} ${response.statusText}`);
            }
            return response.json();
          })
          .then(data => {
            console.log("Treatment plan created successfully:", data);
            
            // Invalidate treatment plans cache to ensure fresh data
            queryClient.invalidateQueries({ queryKey: ['/api/treatment-plans'] });
            
            return { success: true, data };
          })
          .then(result => {
            if (result.success && result.data) {
              const data = result.data;
              
              if (data.treatmentPlanUrl) {
                toast({
                  title: "Special Offer Processed",
                  description: `Treatment plan created from "${offerData.title}"`,
                });
                
                // Clean up session storage
                sessionStorage.removeItem('pendingSpecialOffer');
                sessionStorage.removeItem('processingSpecialOffer');
                sessionStorage.removeItem('activeSpecialOffer');
                
                // Redirect to the treatment plan
                setTimeout(() => {
                  window.location.href = data.treatmentPlanUrl;
                }, 100);
                return;
              }
            }
          })
          .catch(error => {
            console.error("Error creating treatment plan from offer:", error);
            
            // Use a flag to prevent duplicate toasts
            if (!window.__offerErrorToastShown) {
              window.__offerErrorToastShown = true;
              
              toast({
                title: "Error Processing Offer",
                description: "There was a problem creating your treatment plan. Please try again.",
                variant: "destructive"
              });
              
              // Reset the flag after a delay
              setTimeout(() => {
                window.__offerErrorToastShown = false;
              }, 5000);
            }
          });
        }
      } catch (error) {
        console.error("Error processing offer data:", error);
      }
    } else if (processingOffer) {
      // If just processing, clean up to prevent loops
      console.log("Found processingOffer only, clearing to prevent redirect loops");
      sessionStorage.removeItem('processingSpecialOffer');
    }
    
    // Check if we have a package booking redirect
    if (searchParams && searchParams.has('booking') && user.role === 'patient') {
      const packageId = searchParams.get('booking');
      console.log(`[DEBUG] Redirecting to book package: ${packageId}`);
      
      // If user is a patient, redirect them to book the package through the API
      if (user.emailVerified) {
        toast({
          title: "Ready to Book",
          description: "You'll be redirected to complete your booking",
        });
        
        // Create a form to submit a POST request to the booking endpoint
        // This is necessary because we defined the booking endpoint as POST
        toast({
          title: "Redirecting",
          description: "Processing your booking request..."
        });
        
        // Create a hidden form for POST submission
        // Note the correct API path is /api/treatment-module, not /api/treatment-plans
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/api/treatment-module/book-package/${packageId}`;
        document.body.appendChild(form);
        form.submit();
        return;
      }
    }
    
    // Standard redirect based on user role if no special redirect is needed
    if (user.role === 'admin') {
      setLocation('/admin-portal');
    } else if (user.role === 'clinic_staff') {
      setLocation('/clinic-portal');
    } else if (user.role === 'patient' && user.emailVerified) {
      setLocation('/client-portal');
    }
    
    // Check if user came from clinic selection
    if (localStorage.getItem('selectedClinicId')) {
      setHasSelectedClinic(true);
      setSelectedClinicName(localStorage.getItem('selectedClinicName') || "");
    }
  }, [user, searchParams]);
  
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
      
      // Check if there is a pending special offer to preserve through verification process
      const pendingOfferData = sessionStorage.getItem('pendingSpecialOffer');
      if (pendingOfferData) {
        try {
          // Parse and format the offer data consistently
          const rawOfferData = JSON.parse(pendingOfferData);
          
          // Create a standardized format to ensure field consistency
          const formattedOfferData = {
            id: rawOfferData.id,
            title: rawOfferData.title,
            clinicId: rawOfferData.clinicId || rawOfferData.clinic_id || '',
            discountValue: rawOfferData.discountValue || rawOfferData.discount_value || 0,
            discountType: rawOfferData.discountType || rawOfferData.discount_type || 'percentage',
            applicableTreatment: rawOfferData.applicableTreatment || 
                             (rawOfferData.applicable_treatments && rawOfferData.applicable_treatments.length > 0 
                              ? rawOfferData.applicable_treatments[0] 
                              : 'Dental Implants')
          };
          
          // Store with a different key in localStorage that persists through verification process
          // We use localStorage instead of sessionStorage so it survives between sessions
          localStorage.setItem('pendingSpecialOfferAfterVerification', JSON.stringify(formattedOfferData));
          console.log("Saved formatted special offer for after verification:", formattedOfferData);
          
          // Show enhanced message about offer being preserved
          toast({
            title: "Registration Successful",
            description: `Please check your email for verification. Your ${formattedOfferData.title} quote will be available after verification.`,
          });
        } catch (error) {
          console.error("Error processing pending offer during registration:", error);
          // Show regular success message if there's an error with the offer
          toast({
            title: "Registration Successful",
            description: "Please check your email for verification instructions.",
          });
        }
      } else {
        // Show regular success message if no pending offer
        toast({
          title: "Registration Successful",
          description: "Please check your email for verification instructions.",
        });
      }
      
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



  // Flag to prevent duplicate login submissions
  const loginInProgress = React.useRef(false);

  // Handle login form submission
  // Flag to prevent multiple simultaneous submissions
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
    // Prevent duplicate submissions
    if (loginInProgress.current) {
      console.log("Login already in progress, ignoring duplicate submission");
      return;
    }
    
    // Set loading state for button
    setIsLoading(true);
    
    try {
      // Set flag to prevent duplicate submissions
      loginInProgress.current = true;
      console.log("Login attempt with:", values);
      
      // Store login intent in session storage before login
      // This helps identify the transition is from a fresh login
      sessionStorage.setItem('just_logged_in', 'true');
      sessionStorage.setItem('login_timestamp', Date.now().toString());
      
      // Pre-cache clinic portal data to avoid reload
      sessionStorage.setItem('clinic_portal_timestamp', Date.now().toString());
      
      // Use the loginMutation from useAuth hook
      const userData = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password
      });
      
      // Success toast is handled by the useAuth hook
      
      // Direct redirect based on user role from response
      console.log("Login successful, redirecting based on role:", userData.role);
      
      if (userData.role === 'admin') {
        console.log("Admin user detected, redirecting to admin portal");
        // Pre-cache user data
        sessionStorage.setItem('cached_user_data', JSON.stringify(userData));
        sessionStorage.setItem('cached_user_timestamp', Date.now().toString());
        
        // Special handling for admin to prevent refresh issues
        sessionStorage.setItem('admin_portal_timestamp', Date.now().toString());
        sessionStorage.setItem('admin_role_verified', 'true');
        
        // Set a guard to prevent automatic redirects to login
        localStorage.setItem('auth_guard', Date.now().toString());
        
        // Flag in sessionStorage that we're doing a protected navigation
        sessionStorage.setItem('admin_protected_navigation', 'true');
        
        // Add slight delay to make sure everything is written
        setTimeout(() => {
          console.log("Admin portal redirect with all caches prepared");
          // Set a flag that this is an intentional direct navigation, not a refresh
          (window as any).__directAdminNavigation = true;
          setLocation('/admin-portal');
        }, 100);
        
      } else if (userData.role === 'clinic_staff') {
        console.log("Clinic staff detected, redirecting to clinic portal");
        
        // Pre-cache the user data to avoid double fetching on redirect
        sessionStorage.setItem('cached_user_data', JSON.stringify(userData));
        sessionStorage.setItem('cached_user_timestamp', Date.now().toString());
        sessionStorage.setItem('clinic_portal_timestamp', Date.now().toString());
        
        // Add delay to ensure caches are written before redirect
        setTimeout(() => {
          console.log("Redirecting to clinic portal with pre-cached session");
          setLocation('/clinic-portal');
        }, 100);
      } else {
        // Default to patient portal for any other role
        console.log("Patient user detected, checking for pending actions");
        // Pre-cache user data
        sessionStorage.setItem('cached_user_data', JSON.stringify(userData));
        sessionStorage.setItem('cached_user_timestamp', Date.now().toString());
        
        // Check if there's a pending special offer to process (MVP spec implementation)
        console.log("Checking sessionStorage for pendingSpecialOffer");
        const pendingOfferData = sessionStorage.getItem('pendingSpecialOffer');
        console.log("pendingSpecialOffer data:", pendingOfferData);
        
        if (pendingOfferData) {
          try {
            // Parse the pending offer data
            const offerData = JSON.parse(pendingOfferData);
            console.log("Successfully parsed pending special offer request:", offerData);
            
            // Following MVP spec: Create a quote directly from the offer ID
            const offerId = offerData.id;
            const clinicId = offerData.clinicId || offerData.clinic_id || '';
            
            if (offerId) {
              console.log(`Creating quote from offer ${offerId} for clinic ${clinicId}`);
              toast({
                title: "Processing Special Offer",
                description: "Creating your quote with the selected offer...",
              });
              
              // Call the API endpoint to start a quote from an offer
              apiRequest('POST', `/api/offers/${offerId}/start`, { clinicId })
                .then(response => {
                  if (!response.ok) {
                    throw new Error('Failed to create quote from offer');
                  }
                  return response.json();
                })
                .then(data => {
                  console.log("Quote created successfully:", data);
                  
                  if (data.quoteId && data.quoteUrl) {
                    toast({
                      title: "Special Offer Applied",
                      description: "Your quote has been created with the special offer discount.",
                    });
                    
                    // Clear all special offer storage
                    sessionStorage.removeItem('pendingSpecialOffer');
                    sessionStorage.removeItem('processingSpecialOffer');
                    sessionStorage.removeItem('activeSpecialOffer');
                    
                    // Redirect to the quote review page
                    setTimeout(() => {
                      window.location.href = data.quoteUrl;
                    }, 100);
                  } else {
                    throw new Error('Invalid response from server');
                  }
                })
                .catch(error => {
                  console.error("Error creating quote from offer:", error);
                  toast({
                    title: "Error Processing Offer",
                    description: "We couldn't process your special offer. You'll be redirected to your dashboard.",
                    variant: "destructive",
                  });
                  
                  // Redirect to patient portal on error
                  setTimeout(() => {
                    setLocation('/client-portal');
                  }, 500);
                });
              
              return; // Exit early as we're handling special redirect asynchronously
            }
          } catch (error) {
            console.error("Error processing pending special offer:", error);
            console.error("Error details:", error instanceof Error ? error.message : String(error));
            
            // Show an error toast to inform the user
            toast({
              title: "Error Processing Offer",
              description: "We couldn't process your special offer request. You'll be redirected to your dashboard.",
              variant: "destructive",
            });
            
            // Continue with normal patient portal redirect if there's an error
          }
        }
        
        // Normal patient portal redirect if no pending actions
        setTimeout(() => {
          console.log("Redirecting to patient portal");
          setLocation('/client-portal');
        }, 100);
      }
      
    } catch (error) {
      console.error("Login error:", error);
      // The loginMutation will handle error toasts automatically
    } finally {
      // Reset loading state
      setIsLoading(false);
      
      // Reset flag after a delay to prevent rapid duplicate submissions
      setTimeout(() => {
        loginInProgress.current = false;
      }, 1000);
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
  
  // Admin login form
  const adminLoginForm = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle admin login form submission
  const onAdminLoginSubmit = async (values: z.infer<typeof adminLoginSchema>) => {
    setAdminLoginError(null);
    
    try {
      // Call the admin-specific login function
      await adminLogin(values.email, values.password);
      
      // Show success toast
      toast({
        title: 'Admin login successful',
        description: 'Welcome to the admin portal',
      });
      
      // Prepare the session for admin portal navigation
      sessionStorage.setItem('admin_portal_timestamp', Date.now().toString());
      sessionStorage.setItem('admin_role_verified', 'true');
      sessionStorage.setItem('admin_protected_navigation', 'true');
      
      // Redirect to admin portal with intentional navigation flag
      setTimeout(() => {
        console.log("Admin portal redirect with specialized auth");
        (window as any).__directAdminNavigation = true;
        setLocation('/admin-portal');
      }, 100);
      
    } catch (error) {
      console.error('Admin login error:', error);
      
      // Handle login error
      setAdminLoginError('Invalid admin credentials. Please try again.');
      
      toast({
        title: 'Admin login failed',
        description: 'Please check your credentials and try again',
        variant: 'destructive',
      });
    }
  };

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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger id="login-tab" value="login">{t("portal.login.signin", "Sign In")}</TabsTrigger>
              <TabsTrigger id="clinic-tab" value="clinic">Clinic Login</TabsTrigger>
              <TabsTrigger id="admin-tab" value="admin">Admin</TabsTrigger>
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
            
            {/* Admin Login Tab */}
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Portal Login</CardTitle>
                  <CardDescription>
                    Secure access to the admin management system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {adminLoginError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{adminLoginError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Form {...adminLoginForm}>
                    <form onSubmit={adminLoginForm.handleSubmit(onAdminLoginSubmit)} className="space-y-4">
                      <FormField
                        control={adminLoginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                                <Input 
                                  placeholder="admin@mydentalfly.com" 
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
                        control={adminLoginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Password</FormLabel>
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
                        disabled={adminIsLoading}
                        variant="default"
                      >
                        {adminIsLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in to Admin...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Access Admin Portal
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                  <div className="mt-4 text-sm text-center">
                    <p className="text-neutral-500">
                      This area is restricted to authorized platform administrators.
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