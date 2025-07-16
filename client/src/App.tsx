import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { GlobalAuthProvider } from '@/contexts/GlobalAuthProvider';
import ErrorBoundary from '@/components/ui/error-boundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import ScrollToTop from '@/components/ScrollToTop';

// Import components directly (non-lazy) to avoid loading issues
import Home from '@/pages/Home';
import YourQuotePage from '@/pages/YourQuotePage';
import QuoteResultsPage from '@/pages/QuoteResultsPage';
import MatchedClinicsPage from '@/pages/MatchedClinicsPage';
import PortalLoginPage from '@/pages/PortalLoginPage';
import PatientPortalPage from '@/pages/PatientPortalPage';
import ClinicPortalPage from '@/pages/ClinicPortalPage';
import AdminPortalPage from '@/pages/AdminPortalPage';
import BlogPage from '@/pages/BlogPage';
import DentalImplantsPage from '@/pages/DentalImplantsPage';
import VeneersPage from '@/pages/VeneersPage';
import HollywoodSmilePage from '@/pages/HollywoodSmilePage';
import FullMouthPage from '@/pages/FullMouthPage';
import TeamPage from '@/pages/TeamPage';
import FAQPage from '@/pages/FAQPage';
import HowItWorks from '@/pages/HowItWorks';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import VerificationSentPage from '@/pages/VerificationSentPage';
import EmailVerifiedPage from '@/pages/EmailVerifiedPage';
import VerificationFailedPage from '@/pages/VerificationFailedPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ErrorPage from '@/pages/ErrorPage';
import PackageDetailPage from '@/pages/PackageDetailPage';
import PackageResultsPage from '@/pages/PackageResultsPage';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry auth errors (401) as they're expected
        if (error?.status === 401 || error?.response?.status === 401) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      throwOnError: false, // Prevent queries from throwing
      useErrorBoundary: false, // Don't use error boundary for queries
    },
    mutations: {
      retry: 1,
      throwOnError: false, // Prevent mutations from throwing
      useErrorBoundary: false, // Don't use error boundary for mutations
    },
  },
});

// Route change tracker component
function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    console.log('🧭 Frontend route changed to:', location.pathname);
  }, [location]);

  return null;
}

function App() {
  const whatsappNumber = "447572445856"; // UK WhatsApp number without + sign
  const phoneNumber = "+44 7572 445856"; // Formatted display number for direct calls

  // Add global error handling to catch unhandled rejections
  useEffect(() => {
    console.log('🚀 App mounted successfully');
    
    // Handle unhandled promise rejections more aggressively
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled promise rejection caught:', {
        reason: event.reason,
        type: typeof event.reason,
        message: event.reason?.message,
        stack: event.reason?.stack,
        status: event.reason?.status,
        response: event.reason?.response,
        timestamp: new Date().toISOString()
      });
      
      // Always prevent the rejection from bubbling up to avoid white screen
      event.preventDefault();
      
      // Check if it's an auth-related rejection
      if (event.reason?.message?.includes('401') || 
          event.reason?.message?.includes('auth') ||
          event.reason?.status === 401) {
        console.log('🔐 Auth-related rejection handled gracefully');
        return;
      }

      // Check if it's a network error
      if (event.reason?.message?.includes('Failed to fetch') ||
          event.reason?.message?.includes('NetworkError') ||
          event.reason?.code === 'NETWORK_ERROR') {
        console.log('🌐 Network-related rejection handled gracefully');
        return;
      }

      // Check if it's a React Query error
      if (event.reason?.message?.includes('query') ||
          event.reason?.name === 'QueryError') {
        console.log('🔍 Query-related rejection handled gracefully');
        return;
      }
    };

    // Handle general errors
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Global error caught:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
      
      // Prevent error from breaking the app
      event.preventDefault();
    };

    // Add error handlers immediately when the component mounts
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Also handle React errors at the window level
    const handleReactError = (event: any) => {
      console.error('🚨 React error caught at window level:', event);
      event.preventDefault();
    };

    window.addEventListener('react-error', handleReactError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('react-error', handleReactError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GlobalAuthProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-white">
                <RouteChangeTracker />
                <ScrollToTop />

                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/your-quote" element={<YourQuotePage />} />
                  <Route path="/quote-results" element={<QuoteResultsPage />} />
                  <Route path="/matched-clinics" element={<MatchedClinicsPage />} />
                  <Route path="/portal-login" element={<PortalLoginPage />} />
                  <Route path="/patient-portal" element={<PatientPortalPage />} />
                  <Route path="/clinic-portal" element={<ClinicPortalPage />} />
                  <Route path="/admin-portal" element={<AdminPortalPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/dental-implants" element={<DentalImplantsPage />} />
                  <Route path="/veneers" element={<VeneersPage />} />
                  <Route path="/hollywood-smile" element={<HollywoodSmilePage />} />
                  <Route path="/full-mouth-reconstruction" element={<FullMouthPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/verification-sent" element={<VerificationSentPage />} />
                  <Route path="/email-verified" element={<EmailVerifiedPage />} />
                  <Route path="/verification-failed" element={<VerificationFailedPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/error" element={<ErrorPage />} />
                  <Route path="/package/:id" element={<PackageDetailPage />} />
                  <Route path="/package-results" element={<PackageResultsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>

                <Toaster />
              </div>
            </Router>
          </AuthProvider>
        </GlobalAuthProvider>

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;