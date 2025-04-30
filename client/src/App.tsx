import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { NotificationsProvider } from "@/hooks/use-notifications";
import NotFound from "@/pages/not-found";
import Home from "./pages/Home";
import { useEffect } from "react";
import { initPreventReloads } from "@/utils/prevent-reloads";

// Environment indicator component for production
const EnvironmentBadge = () => {
  const isProd = import.meta.env.PROD || import.meta.env.NODE_ENV === 'production';
  
  if (!isProd) return null;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      zIndex: 9999,
      background: '#ff5252',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      PRODUCTION
    </div>
  );
};
import BlogPage from "./pages/BlogPage";
import SimpleBlogPage from "./pages/SimpleBlogPage";
import HowItWorksBlogPost from "./pages/HowItWorksBlogPost";
import PricingPage from "./pages/PricingPage";
import TeamPage from "@/pages/TeamPage";
import HowItWorks from "@/pages/HowItWorks";
import FAQPage from "@/pages/FAQPage";
import QuoteResultsPage from "@/pages/QuoteResultsPage";
import YourQuotePage from "@/pages/YourQuotePage2";
import DentalImplantsPage from "@/pages/DentalImplantsPage";
import VeneersPage from "@/pages/VeneersPage";
import HollywoodSmilePage from "@/pages/HollywoodSmilePage";
import FullMouthPage from "@/pages/FullMouthPage";
import BookingPage from "@/pages/BookingPage";
import PatientPortalPage from "@/pages/PatientPortalPage";
import AdminPortalPage from "@/pages/AdminPortalPage";
import ClinicPortalPage from "@/pages/ClinicPortalPage";
import PortalLoginPage from "@/pages/PortalLoginPage";
import PortalTestingHub from "@/pages/PortalTestingHub";
import ClinicDetailPage from "@/pages/ClinicDetailPage";
import DepositPaymentPage from "@/pages/DepositPaymentPage";
import PaymentConfirmationPage from "@/pages/PaymentConfirmationPage";
import TreatmentPaymentPage from "@/pages/TreatmentPaymentPage";
import DentalChartPage from "@/pages/DentalChartPage";
import PatientDentalChart from "@/pages/PatientDentalChart";
import ClinicDentalCharts from "@/pages/ClinicDentalCharts";
import ClinicTreatmentMapperPage from "@/pages/ClinicTreatmentMapperPage";
import AdminTreatmentMapperPage from "@/pages/AdminTreatmentMapperPage";
import TreatmentComparisonPage from "./pages/TreatmentComparisonPage";
import AccountSettingsPage from "@/pages/AccountSettingsPage";
import DataArchitecturePage from "@/pages/DataArchitecturePage";
import DentalAdvicePage from "@/pages/DentalAdvicePage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import VerificationSentPage from "@/pages/VerificationSentPage";
import EmailVerifiedPage from "@/pages/EmailVerifiedPage";
import VerificationFailedPage from "@/pages/VerificationFailedPage";
import PackageDetailPage from "@/pages/PackageDetailPage";
import ContactWidget from "@/components/ContactWidget";
import ReloadTranslations from "@/components/ReloadTranslations";
import ScrollToTop from "@/components/ScrollToTop";
import { ProtectedRoute } from "./lib/protected-route";
import { Suspense } from "react";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/index">
        {() => <Redirect to="/" />}
      </Route>
      <Route path="/blog" component={SimpleBlogPage} />
      <Route path="/blog/how-it-works" component={HowItWorksBlogPost} />
      <Route path="/dental-implants" component={DentalImplantsPage} />
      <Route path="/veneers" component={VeneersPage} />
      <Route path="/hollywood-smile" component={HollywoodSmilePage} />
      <Route path="/full-mouth" component={FullMouthPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/team" component={TeamPage} />
      <Route path="/how-it-works">
        {() => <Redirect to="/blog/how-it-works" />}
      </Route>
      <Route path="/faq" component={FAQPage} />
      <Route path="/your-quote" component={YourQuotePage} />
      <Route path="/quote-results" component={QuoteResultsPage} />
      <Route path="/quote">
        {() => <Redirect to="/your-quote" />}
      </Route>
      <Route path="/booking" component={BookingPage} />
      <Route path="/clinic/:id" component={ClinicDetailPage} />
      <Route path="/package/:id" component={PackageDetailPage} />
      <Route path="/portal-login" component={PortalLoginPage} />
      <Route path="/portal">
        {() => <Redirect to="/portal-login" />}
      </Route>
      <Route path="/deposit-payment">
        {() => <DepositPaymentPage />}
      </Route>
      <Route path="/payment-confirmation">
        {() => <PaymentConfirmationPage />}
      </Route>
      <Route path="/treatment-payment/:bookingId?">
        {(params) => <TreatmentPaymentPage />}
      </Route>
      <Route path="/portal-testing">
        {() => <PortalTestingHub />}
      </Route>
      
      {/* Patient Portal Routes - Publicly accessible */}
      <Route path="/client-portal" component={PatientPortalPage} />
      <Route path="/patient-portal" component={PatientPortalPage} />
      <Route path="/dental-chart" component={DentalChartPage} />
      <Route path="/my-dental-chart" component={PatientDentalChart} />
      <Route path="/treatment-comparison" component={TreatmentComparisonPage} />
      <Route path="/account-settings" component={AccountSettingsPage} />
      <Route path="/dental-advice" component={DentalAdvicePage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/verification-sent" component={VerificationSentPage} />
      <Route path="/email-verified" component={EmailVerifiedPage} />
      <Route path="/verification-failed" component={VerificationFailedPage} />
      
      {/* Admin-only Protected Routes */}
      <ProtectedRoute path="/admin-portal" component={AdminPortalPage} requiredRole="admin" />
      <ProtectedRoute path="/admin-treatment-mapper" component={AdminTreatmentMapperPage} requiredRole="admin" />
      <ProtectedRoute path="/data-architecture" component={DataArchitecturePage} requiredRole="admin" />
      
      {/* Clinic Staff Protected Routes */}
      <ProtectedRoute 
        path="/clinic-portal" 
        component={() => {
          // Complete reimplementation to prevent reload cycles
          const mountKey = `clinic-portal-${Date.now()}`;
          
          // Completely disable reloads for a 30-second window after rendering
          if (typeof window !== 'undefined') {
            // Store the original reload function if we haven't already
            if (!(window as any).__originalReload) {
              console.log("⚠️ Overriding window.location.reload for clinic portal");
              (window as any).__originalReload = window.location.reload;
              
              // Override with a no-op function on clinic portal path
              window.location.reload = function(...args: any[]) {
                const currentPath = window.location.pathname;
                
                // Block refreshes only on clinic portal, not other routes
                if (currentPath.includes('clinic-portal')) {
                  console.log(`🛡️ Blocked automatic page reload on ${currentPath}`);
                  return undefined; // Return undefined instead of reloading
                } else {
                  // Do normal reload on non-clinic portal paths
                  return (window as any).__originalReload.apply(this, args);
                }
              };
            }
          }
          
          // Always return a fresh instance, but with a stable key to prevent
          // React from recreating it unnecessarily on param changes
          console.log("🔄 Rendering clinic portal with stable instance");
          return <ClinicPortalPage key={mountKey} />; 
        }} 
        requiredRole="clinic_staff" 
      />
      <ProtectedRoute path="/clinic-treatment-mapper" component={ClinicTreatmentMapperPage} requiredRole="clinic_staff" />
      <ProtectedRoute path="/clinic-dental-charts" component={ClinicDentalCharts} requiredRole="clinic_staff" />
      <Route path="/clinic">
        {() => <Redirect to="/clinic-portal" />}
      </Route>
      {/* Redirect all test routes to home */}
      <Route path="/test">
        {() => {
          window.location.href = "/";
          return null;
        }}
      </Route>
      <Route path="/test-pdf">
        {() => {
          window.location.href = "/";
          return null;
        }}
      </Route>
      <Route path="/simple-pdf-test">
        {() => {
          window.location.href = "/";
          return null;
        }}
      </Route>
      <Route path="/enhanced-pdf-test">
        {() => {
          window.location.href = "/";
          return null;
        }}
      </Route>
      <Route path="/testpdf">
        {() => {
          window.location.href = "/";
          return null;
        }}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // WhatsApp phone number (without + sign) and formatted display number for direct calls
  const whatsappNumber = "447572445856"; // UK WhatsApp number without + sign
  const phoneNumber = "+44 7572 445856"; // Formatted display number for direct calls
  
  // Initialize reload prevention system
  useEffect(() => {
    // Check if we're in the browser and not in server-side rendering
    if (typeof window !== 'undefined') {
      console.log('Initializing reload prevention for clinic portal');
      try {
        initPreventReloads();
      } catch (error) {
        console.error('Failed to initialize reload prevention:', error);
      }
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <ScrollToTop />
            <ReloadTranslations />
            <Router />
            <ContactWidget whatsappNumber={whatsappNumber} phoneNumber={phoneNumber} />
            <EnvironmentBadge />
            <Toaster />
          </Suspense>
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
