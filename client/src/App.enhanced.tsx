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
import { ErrorBoundary, NavigationErrorBoundary } from "@/components/error-boundary";
import { NavigationProvider, useNavigation } from "@/hooks/use-navigation";
import { PageTransitionProvider, PageTransitionLoader } from "@/components/ui/page-transition-loader";
import Home from "./pages/Home";
import { initPreventReloads } from "@/utils/prevent-reloads";
import SimpleClinicPage from "@/pages/SimpleClinicPage";
import ClinicGuard from "@/components/ClinicGuard";
import AdminPortalGuard from "@/components/AdminPortalGuard";
import ClinicRouter from "@/pages/ClinicRouter";
import ClinicDebugPage from "@/pages/ClinicDebugPage";
import SpecialOfferTestPage from "@/pages/SpecialOfferTestPage";
import BlogPage from "./pages/BlogPage";
import SimpleBlogPage from "./pages/SimpleBlogPage";
import AboutPage from "./pages/AboutPage";
import TeamPage from "./pages/TeamPage";
import BlogPostPage from "./pages/BlogPostPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import MatchedClinicsPage from "./pages/MatchedClinicsPage";
import YourQuotePage from "./pages/YourQuotePage";
import NewYourQuotePage from "./pages/NewYourQuotePage"; // Import our new page
import ClinicProfilePage from "./pages/ClinicProfilePage";
import TreatmentsPage from "./pages/TreatmentsPage";
import AdminRouter from "./pages/AdminRouter";
import FrequentlyAskedQuestionsPage from "./pages/FrequentlyAskedQuestionsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PortalRouter from "./pages/PortalRouter";
import { QuoteFlowProvider } from "./contexts/QuoteFlowContext";
import FreeConsultationPage from "./pages/FreeConsultationPage";
import SpecialOffersPage from "./pages/SpecialOffersPage";
import TestImageUploadPage from "./pages/TestImageUploadPage";
import PatientPortalRouter from "./pages/PatientPortalRouter";
import StripeSuccessPage from "./pages/StripeSuccessPage";
import StripeCancelPage from "./pages/StripeCancelPage";
import TestStripePaymentPage from "./pages/TestStripePaymentPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AppProviders from "./providers/AppProviders";

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

// Define our MainRouter component that handles all routes
const MainRouter = () => {
  const { isLoading } = useNavigation();
  
  // Add logic to use enhanced version of YourQuotePage based on URL param
  const useEnhancedQuotePage = new URLSearchParams(window.location.search).get('enhanced') === 'true';
  
  return (
    <>
      {isLoading && <PageTransitionLoader />}
      
      <NavigationErrorBoundary>
        <Switch>
          {/* Main public routes */}
          <Route path="/" component={Home} />
          <Route path="/about" component={AboutPage} />
          <Route path="/team" component={TeamPage} />
          <Route path="/blog" component={BlogPage} />
          <Route path="/simple-blog" component={SimpleBlogPage} />
          <Route path="/blog/:slug" component={BlogPostPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/privacy-policy" component={PrivacyPolicyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/cookie-policy" component={CookiePolicyPage} />
          <Route path="/faq" component={FrequentlyAskedQuestionsPage} />
          <Route path="/treatments/:slug?" component={TreatmentsPage} />
          <Route path="/clinics" component={MatchedClinicsPage} />
          
          {/* Use the enhanced quote page if requested */}
          <Route path="/your-quote">
            {useEnhancedQuotePage ? <NewYourQuotePage /> : <YourQuotePage />}
          </Route>
          
          <Route path="/clinic/:id" component={ClinicProfilePage} />
          <Route path="/simple-clinic/:id" component={SimpleClinicPage} />
          <Route path="/free-consultation" component={FreeConsultationPage} />
          <Route path="/special-offers" component={SpecialOffersPage} />
          <Route path="/special-offers-test" component={SpecialOfferTestPage} />
          <Route path="/test-image-upload" component={TestImageUploadPage} />
          
          {/* Authentication */}
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />
          
          {/* Protected portals */}
          <Route path="/portal">
            <PortalRouter />
          </Route>
          
          <Route path="/patient">
            <PatientPortalRouter />
          </Route>
          
          <Route path="/clinic-portal">
            <ClinicGuard>
              <ClinicRouter />
            </ClinicGuard>
          </Route>
          
          <Route path="/admin-portal">
            <AdminPortalGuard>
              <AdminRouter />
            </AdminPortalGuard>
          </Route>
          
          {/* Stripe integration */}
          <Route path="/stripe-success" component={StripeSuccessPage} />
          <Route path="/stripe-cancel" component={StripeCancelPage} />
          <Route path="/test-stripe-payment" component={TestStripePaymentPage} />
          
          {/* Testing and development */}
          <Route path="/error-test" component={ErrorTestPage} />
          <Route path="/portal-communication-test" component={PortalCommunicationTester} />
          <Route path="/clinic-debug" component={ClinicDebugPage} />
          <Route path="/quote-flow-test" component={QuoteFlowTest} />
          
          {/* 404 Page */}
          <Route component={NotFoundPage} />
        </Switch>
      </NavigationErrorBoundary>
    </>
  );
};

export default function App() {
  useEffect(() => {
    // Initialize code to prevent accidental page reloads
    initPreventReloads();
  }, []);
  
  return (
    <AppProviders>
      <QuoteFlowProvider>
        <PageTransitionProvider>
          <NavigationProvider>
            <ErrorBoundary>
              <MainRouter />
            </ErrorBoundary>
          </NavigationProvider>
        </PageTransitionProvider>
      </QuoteFlowProvider>
      
      <Toaster />
      <EnvironmentBadge />
    </AppProviders>
  );
}