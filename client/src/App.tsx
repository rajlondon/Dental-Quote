import React, { useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { BookingsProvider } from "@/hooks/use-bookings";
import { NotFoundPage } from "@/pages/ErrorPage";
import ErrorTestPage from "@/pages/ErrorTestPage";
import PortalCommunicationTester from "@/pages/PortalCommunicationTester";
import ErrorBoundary from "@/components/ui/error-boundary";
import Home from "./pages/Home";
import { initPreventReloads } from "@/utils/prevent-reloads";
import SimpleClinicPage from "@/pages/SimpleClinicPage";
import ClinicGuard from "@/components/ClinicGuard";
import AdminPortalGuard from "@/components/AdminPortalGuard";
import ClinicRouter from "@/pages/ClinicRouter";
import ClinicDebugPage from "@/pages/ClinicDebugPage";

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
import NewBlogPage from "./pages/NewBlogPage";
import HowItWorksBlogPost from "./pages/HowItWorksBlogPost";
import DentalImplantsBlogPost from "./pages/DentalImplantsBlogPost";
import VeneersBlogPost from "./pages/VeneersBlogPost";
import HollywoodSmileBlogPost from "./pages/HollywoodSmileBlogPost";
import FullMouthBlogPost from "./pages/FullMouthBlogPost";
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
// Special import with WebSocket disabled for clinic portal to prevent refresh cycles
const ClinicPortalPage = React.lazy(() => import("@/pages/ClinicPortalPage"));
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
import ProfilePage from "@/pages/ProfilePage";
import DataArchitecturePage from "@/pages/DataArchitecturePage";
import DentalAdvicePage from "@/pages/DentalAdvicePage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import VerificationSentPage from "@/pages/VerificationSentPage";
import EmailVerifiedPage from "@/pages/EmailVerifiedPage";
import VerificationFailedPage from "@/pages/VerificationFailedPage";
import PackageDetailPage from "@/pages/PackageDetailPage";
import BookingsPage from "@/pages/bookings-page";
import BookingDetailPage from "@/pages/booking-detail-page";
import CreateBookingPage from "@/pages/create-booking-page";
import AdminBookingsPage from "@/pages/admin/admin-bookings-page";
import AdminBookingDetailPage from "@/pages/admin/admin-booking-detail-page";
import AdminNewQuotePage from "@/pages/admin/AdminNewQuotePage";
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
      <Route path="/blog" component={NewBlogPage} />
      <Route path="/blog-react">
        {() => <Redirect to="/blog" />}
      </Route>
      <Route path="/blog/how-it-works" component={HowItWorksBlogPost} />
      <Route path="/blog/dental-implants" component={DentalImplantsBlogPost} />
      <Route path="/blog/veneers" component={VeneersBlogPost} />
      <Route path="/blog/hollywood-smile" component={HollywoodSmileBlogPost} />
      <Route path="/blog/full-mouth" component={FullMouthBlogPost} />
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
      {/* Create separate routes for clinic testing and clinic detail pages */}
      <Route path="/clinic/:id" component={ClinicDetailPage} />
      <Route path="/clinic-test/:id" component={ClinicRouter} />
      <Route path="/clinic-debug/:id?" component={ClinicDebugPage} />
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
      <Route path="/my-profile" component={ProfilePage} />
      <Route path="/dental-advice" component={DentalAdvicePage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/verification-sent" component={VerificationSentPage} />
      <Route path="/email-verified" component={EmailVerifiedPage} />
      <Route path="/verification-failed" component={VerificationFailedPage} />
      
      {/* Booking Routes */}
      <ProtectedRoute path="/bookings" component={BookingsPage} />
      <ProtectedRoute path="/bookings/:id" component={BookingDetailPage} />
      <ProtectedRoute path="/create-booking" component={CreateBookingPage} />
      <ProtectedRoute path="/create-booking/:clinicId" component={CreateBookingPage} />
      
      {/* Admin login is now handled through the main portal login page */}
      
      {/* Special route for handling admin logout properly */}
      <Route path="/admin-logout">
        {() => {
          // This is a special route that handles logout and redirect without using AdminPortalGuard
          if (typeof window !== 'undefined') {
            // Clear admin-specific storage flags immediately
            localStorage.removeItem('admin_session');
            localStorage.removeItem('auth_guard');
            sessionStorage.removeItem('admin_portal_timestamp');
            sessionStorage.removeItem('admin_protected_navigation');
            sessionStorage.removeItem('admin_role_verified');
            sessionStorage.setItem('admin_logout_redirect', 'true');
            
            // Make a direct server logout call
            fetch('/api/auth/logout', { method: 'POST' })
              .catch(() => console.log('Logout request sent'));
            
            // Immediate redirect to home page
            window.location.href = '/';
          }
          return null; // This component won't render as we redirect immediately
        }}
      </Route>
      
      {/* Admin-only Protected Routes using the same pattern that works for Clinic Portal */}
      <Route path="/admin-portal">
        {() => (
          <AdminPortalGuard>
            <AdminPortalPage disableAutoRefresh={true} />
          </AdminPortalGuard>
        )}
      </Route>
      
      <ProtectedRoute path="/admin-treatment-mapper" component={AdminTreatmentMapperPage} requiredRole="admin" />
      <ProtectedRoute path="/data-architecture" component={DataArchitecturePage} requiredRole="admin" />
      
      {/* Admin Booking Routes */}
      <ProtectedRoute path="/admin/bookings" component={AdminBookingsPage} requiredRole="admin" />
      <ProtectedRoute path="/admin/bookings/:id" component={AdminBookingDetailPage} requiredRole="admin" />
      <ProtectedRoute path="/admin/create-booking" component={CreateBookingPage} requiredRole="admin" />
      
      {/* Admin Quote Routes */}
      <Route path="/admin/new-quote">
        {() => (
          <AdminPortalGuard>
            <AdminNewQuotePage />
          </AdminPortalGuard>
        )}
      </Route>
      
      {/* Clinic Staff Protected Routes */}
      {/* Adding a simple, alternative clinic portal route that should have no refresh issues */}
      <Route path="/simple-clinic">
        {() => <ClinicGuard><SimpleClinicPage /></ClinicGuard>}
      </Route>
      
      {/* Original clinic portal route with special guard to prevent refresh issues */}
      <Route path="/clinic-portal">
        {() => (
          <ClinicGuard>
            <ClinicPortalPage disableAutoRefresh={true} />
          </ClinicGuard>
        )}
      </Route>
      <ProtectedRoute path="/clinic-treatment-mapper" component={ClinicTreatmentMapperPage} requiredRole="clinic_staff" />
      <ProtectedRoute path="/clinic-dental-charts" component={ClinicDentalCharts} requiredRole="clinic_staff" />
      
      {/* Clinic Booking Routes */}
      <ProtectedRoute path="/clinic/bookings" component={BookingsPage} requiredRole="clinic_staff" />
      <ProtectedRoute path="/clinic/bookings/:id" component={BookingDetailPage} requiredRole="clinic_staff" />
      <ProtectedRoute path="/clinic/create-booking" component={CreateBookingPage} requiredRole="clinic_staff" />
      
      {/* Clinic Quote Routes */}
      <ProtectedRoute path="/clinic/quotes/:id" component={() => {
        // This is a wrapper to ensure the quotes section is displayed properly
        return (
          <ClinicGuard>
            <ClinicPortalPage disableAutoRefresh={true} initialSection="quotes" />
          </ClinicGuard>
        );
      }} requiredRole="clinic_staff" />
      
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
      
      {/* Testing and development routes - Portal Communication Tester available in all environments */}
      <Route path="/portal-communication-test" component={PortalCommunicationTester} />
      
      {/* Development-only routes */}
      {process.env.NODE_ENV !== 'production' && (
        <>
          <Route path="/error-test" component={ErrorTestPage} />
          <Route path="/testing/xray-component">
            {() => {
              const TestComponent = React.lazy(() => import("@/pages/testing/XrayComponentTest"));
              return (
                <Suspense fallback={<div className="p-12 text-center">Loading test component...</div>}>
                  <TestComponent />
                </Suspense>
              );
            }}
          </Route>
        </>
      )}
      
      <Route component={NotFoundPage} />
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
      // Only initialize for clinic portal path
      if (window.location.pathname === '/clinic-portal') {
        console.log('Initializing reload prevention for clinic portal');
        try {
          initPreventReloads();
        } catch (error) {
          console.error('Failed to initialize reload prevention:', error);
        }
      } else {
        console.log('Skipping reload prevention for non-clinic portal path:', window.location.pathname);
      }
    }
  }, []);
  
  // Add event listener for testing cross-portal notifications
  useEffect(() => {
    // Listen for a special test message that can be triggered from any portal
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'TEST_CROSS_PORTAL_NOTIFICATION') {
        console.log('Received test notification event:', event.data);
        // We can handle this in each portal's notification system
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  return (
    <ErrorBoundary componentName="RootApplication">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AdminAuthProvider>
            <NotificationsProvider>
              <BookingsProvider>
                <Suspense fallback={<div>Loading...</div>}>
                  <ScrollToTop />
                  {/* Only exclude ReloadTranslations on clinic portal path */}
                  {typeof window !== 'undefined' && window.location.pathname !== '/clinic-portal' && 
                    <ReloadTranslations />
                  }
                  <ErrorBoundary componentName="Router">
                    <Router />
                  </ErrorBoundary>
                  <ContactWidget whatsappNumber={whatsappNumber} phoneNumber={phoneNumber} />
                  <EnvironmentBadge />
                  <Toaster />
                </Suspense>
              </BookingsProvider>
            </NotificationsProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
