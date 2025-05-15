import React, { useState, useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminAuthProvider } from "@/hooks/use-admin-auth.tsx";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { BookingsProvider } from "@/hooks/use-bookings";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { NotFoundPage } from "@/pages/ErrorPage";
import ErrorTestPage from "@/pages/ErrorTestPage";
import PortalCommunicationTester from "@/pages/PortalCommunicationTester";
import { ErrorBoundary, NavigationErrorBoundary } from "@/components/error-boundary";
import { NavigationProvider, useNavigation } from "@/hooks/use-navigation";
import { PageTransitionProvider, PageTransitionLoader } from "@/components/ui/page-transition-loader";
import PromoDetector from "@/components/PromoDetector";
import Home from "./pages/Home";
import { initPreventReloads } from "@/utils/prevent-reloads";
import SimpleClinicPage from "@/pages/SimpleClinicPage";
import { SpecialOffersProvider } from "@/components/SpecialOffersProvider";
import ClinicGuard from "@/components/ClinicGuard";
import AdminPortalGuard from "@/components/AdminPortalGuard";
import ClinicRouter from "@/pages/ClinicRouter";
import ClinicDebugPage from "@/pages/ClinicDebugPage";
import SpecialOfferTestPage from "@/pages/SpecialOfferTestPage";
import SpecialOffersFixedPage from "@/pages/SpecialOffersFixedPage";
import PromoTestPage from "@/pages/PromoTestPage";
import WebSocketTestPage from "@/pages/WebSocketTestPage";
import ResilientWebSocketTest2 from "@/pages/ResilientWebSocketTest2";
import ResilientWebSocketTest from "@/pages/ResilientWebSocketTest";
import ResilientWebSocketTest3 from "@/pages/ResilientWebSocketTest3";
import ClinicAccessDeniedPage from "@/components/ClinicAccessDeniedPage";

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
import YourQuotePage from "@/pages/YourQuotePage";
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
import PatientTreatmentPlanPage from "@/pages/patient/PatientTreatmentPlanPage";
import ClinicTreatmentPlanPage from "@/pages/clinic/ClinicTreatmentPlanPage";
import AdminTreatmentPlansPage from "@/pages/admin/AdminTreatmentPlansPage";
import { UnifiedTreatmentPlansProvider } from "@/hooks/use-unified-treatment-plans";
import { QuoteFlowProvider } from "@/contexts/QuoteFlowContext";
import ReloadTranslations from "@/components/ReloadTranslations";
import ScrollToTop from "@/components/ScrollToTop";
import { ProtectedRoute } from "./lib/protected-route";
import { Suspense } from "react";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <>
      {/* Add PromoDetector to handle URL parameters */}
      <PromoDetector />
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
      <Route path="/your-quote">
        {() => {
          // Skip redirect for clinic staff - check both session storage and cookies
          const isClinicStaff = typeof window !== 'undefined' && (
            sessionStorage.getItem('user_role') === 'clinic_staff' ||
            sessionStorage.getItem('is_clinic_staff') === 'true' ||
            sessionStorage.getItem('clinic_session_active') === 'true' ||
            document.cookie.split(';').some(c => 
              c.trim().startsWith('is_clinic_staff=true') ||
              c.trim().startsWith('user_role=clinic_staff')
            )
          );
          
          // If clinic staff, show message and return to portal
          if (isClinicStaff) {
            console.log("Clinic staff detected, blocking access to /your-quote");
            return (
              <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Clinic Staff Access</h1>
                <p className="mb-4">This page is not available for clinic staff.</p>
                <a 
                  href="/clinic-portal" 
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                >
                  Return to Clinic Portal
                </a>
              </div>
            );
          }
          
          // Otherwise, show the quote page for patients and visitors
          return <YourQuotePage />;
        }}
      </Route>
      <Route path="/quote-results">
        {() => {
          // Skip access for clinic staff - check both session storage and cookies
          const isClinicStaff = typeof window !== 'undefined' && (
            sessionStorage.getItem('user_role') === 'clinic_staff' ||
            sessionStorage.getItem('is_clinic_staff') === 'true' ||
            sessionStorage.getItem('clinic_session_active') === 'true' ||
            document.cookie.split(';').some(c => 
              c.trim().startsWith('is_clinic_staff=true') ||
              c.trim().startsWith('user_role=clinic_staff')
            )
          );
          
          // If clinic staff, show message and return to portal
          if (isClinicStaff) {
            console.log("Clinic staff detected, blocking access to /quote-results");
            return (
              <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Clinic Staff Access</h1>
                <p className="mb-4">This page is not available for clinic staff.</p>
                <a 
                  href="/clinic-portal" 
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                >
                  Return to Clinic Portal
                </a>
              </div>
            );
          }
          
          // Otherwise, show the results page for patients and visitors
          return <QuoteResultsPage />;
        }}
      </Route>
      <Route path="/websocket-test" component={WebSocketTestPage} />
      <Route path="/resilient-websocket-test" component={ResilientWebSocketTest2} />
      <Route path="/resilient-websocket" component={ResilientWebSocketTest} />
      <Route path="/resilient-websocket-test3" component={ResilientWebSocketTest3} />
      
      {/* Clinic-accessible test page - does not require being a patient */}
      <Route path="/clinic-quote-test" component={() => {
        const ClinicQuoteTest = React.lazy(() => import("./pages/ClinicQuoteTest"));
        return (
          <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading clinic test page...</div>}>
            <ClinicQuoteTest />
          </React.Suspense>
        );
      }} />
      
      {/* Quote System Testing Routes */}
      <Route path="/quote-test" component={() => {
        // Import QuoteTestPage directly
        const QuoteTestPage = React.lazy(() => import("./pages/QuoteTestPage"));
        return (
          <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading quote testing page...</div>}>
            <QuoteTestPage />
          </React.Suspense>
        );
      }} />
      <Route path="/test-dashboard" component={() => {
        const TestDashboard = React.lazy(() => import("./pages/TestDashboard"));
        return (
          <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading testing dashboard...</div>}>
            <TestDashboard />
          </React.Suspense>
        );
      }} />
      <Route path="/simple-quote-test" component={() => {
        const SimpleQuoteTest = React.lazy(() => import("./pages/SimpleQuoteTest"));
        return (
          <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading simple quote test page...</div>}>
            <SimpleQuoteTest />
          </React.Suspense>
        );
      }} />
      <Route path="/quote-summary" component={() => {
        const QuoteSummaryPage = React.lazy(() => import("@/pages/QuoteSummaryPage"));
        return (
          <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading quote summary...</div>}>
            <QuoteSummaryPage />
          </React.Suspense>
        );
      }} />
      <Route path="/quote">
        {() => {
          // Skip redirect for clinic staff - check both session storage and cookies
          const isClinicStaff = typeof window !== 'undefined' && (
            sessionStorage.getItem('user_role') === 'clinic_staff' ||
            sessionStorage.getItem('is_clinic_staff') === 'true' ||
            sessionStorage.getItem('clinic_session_active') === 'true' ||
            document.cookie.split(';').some(c => 
              c.trim().startsWith('is_clinic_staff=true') ||
              c.trim().startsWith('user_role=clinic_staff')
            )
          );
          
          // If clinic staff, don't redirect, just show a message
          if (isClinicStaff) {
            console.log("Clinic staff detected, skipping /quote redirect");
            return (
              <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Clinic Staff Access</h1>
                <p className="mb-4">This page is not available for clinic staff.</p>
                <a 
                  href="/clinic-portal" 
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                >
                  Return to Clinic Portal
                </a>
              </div>
            );
          }
          
          // Otherwise, proceed with normal redirect for patients and visitors
          return <Redirect to="/your-quote" />;
        }}
      </Route>
      
      {/* We no longer need a separate route for the dental quiz workflow as it's handled by YourQuotePage */}
      {/* Keeping this for backward compatibility but redirecting to the main quote path */}
      {/* Add safety check for clinic staff */}
      <Route path="/quote-flow">
        {() => {
          // Skip redirect for clinic staff - check both session storage and cookies
          const isClinicStaff = typeof window !== 'undefined' && (
            sessionStorage.getItem('user_role') === 'clinic_staff' ||
            sessionStorage.getItem('is_clinic_staff') === 'true' ||
            sessionStorage.getItem('clinic_session_active') === 'true' ||
            document.cookie.split(';').some(c => 
              c.trim().startsWith('is_clinic_staff=true') ||
              c.trim().startsWith('user_role=clinic_staff')
            )
          );
          
          // If clinic staff, don't redirect, just show a message
          if (isClinicStaff) {
            console.log("Clinic staff detected, skipping /quote-flow redirect");
            return (
              <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Clinic Staff Access</h1>
                <p className="mb-4">This page is not available for clinic staff.</p>
                <a 
                  href="/clinic-portal" 
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                >
                  Return to Clinic Portal
                </a>
              </div>
            );
          }
          
          // Otherwise, proceed with normal redirect
          return <Redirect to="/quote" />;
        }}
      </Route>
      
      {/* Route for special offer confirmation */}
      <Route path="/offer-confirmation">
        {() => {
          const OfferConfirmPage = React.lazy(() => import("@/components/offers/OfferConfirmationPage"));
          return (
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
              <OfferConfirmPage />
            </React.Suspense>
          );
        }}
      </Route>
      
      {/* Test route for quote flow enhancements */}
      <Route path="/quote-flow-test">
        {() => {
          const QuoteFlowTest = React.lazy(() => import("@/pages/QuoteFlowTest"));
          return (
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading test environment...</div>}>
              <QuoteFlowTest />
            </React.Suspense>
          );
        }}
      </Route>
      
      {/* Test route for promo token API */}
      <Route path="/promo-token-test">
        {() => {
          const PromoTokenTestPage = React.lazy(() => import("@/pages/PromoTokenTestPage"));
          return (
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading test environment...</div>}>
              <PromoTokenTestPage />
            </React.Suspense>
          );
        }}
      </Route>
      
      {/* Route for testing promo clinic auto-selection */}
      <Route path="/promo-test">
        {() => {
          return (
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading promo test page...</div>}>
              <PromoTestPage />
            </React.Suspense>
          );
        }}
      </Route>
      <Route path="/booking" component={BookingPage} />
      {/* Create separate routes for clinic pages with enhanced routing and diagnostics */}
      <Route path="/clinic/:id" component={ClinicRouter} />
      <Route path="/clinic-detail/:id" component={ClinicDetailPage} /> {/* Direct access to detail component */}
      <Route path="/clinic-debug/:id?" component={ClinicDebugPage} />
      <Route path="/package/:id" component={PackageDetailPage} />
      <Route path="/portal-login">
        {() => {
          // Skip redirect for clinic staff - check both session storage and cookies
          const isClinicStaff = typeof window !== 'undefined' && (
            sessionStorage.getItem('user_role') === 'clinic_staff' ||
            sessionStorage.getItem('is_clinic_staff') === 'true' ||
            sessionStorage.getItem('clinic_session_active') === 'true' ||
            document.cookie.split(';').some(c => 
              c.trim().startsWith('is_clinic_staff=true') ||
              c.trim().startsWith('user_role=clinic_staff')
            )
          );
          
          // If clinic staff, redirect to clinic portal directly
          if (isClinicStaff) {
            console.log("Clinic staff detected, redirecting to clinic portal");
            return <Redirect to="/clinic-portal" />;
          }
          
          return <PortalLoginPage />;
        }}
      </Route>
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
      <Route path="/client-portal">
        {() => <PatientPortalPage />}
      </Route>
      <Route path="/patient-portal">
        {() => <PatientPortalPage />}
      </Route>
      
      {/* Special Offers Rebuild Testing Routes */}
      <Route path="/special-offers-rebuild">
        {() => {
          const QuoteFlowRebuildPage = React.lazy(() => import("@/pages/QuoteFlowRebuildPage"));
          return (
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
              <QuoteFlowRebuildPage />
            </React.Suspense>
          );
        }}
      </Route>
      
      {/* Promo Code Testing Route */}
      <Route path="/promocode-test">
        {() => {
          const PromocodeTestPage = React.lazy(() => import("@/pages/PromocodeTestPage"));
          return (
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
              <PromocodeTestPage />
            </React.Suspense>
          );
        }}
      </Route>
      
      {/* Special Offers & Treatment Packages Testing Route */}
      <Route path="/special-offers-test">
        {() => {
          const SpecialOffersTestPage = React.lazy(() => import("@/pages/SpecialOffersTestPage"));
          return (
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
              <SpecialOffersTestPage />
            </React.Suspense>
          );
        }}
      </Route>
      
      {/* Quote Integration Testing Route */}
      <Route path="/quote-integration-test">
        {() => {
          const QuoteIntegrationTestPage = React.lazy(() => import("@/pages/QuoteIntegrationTestPage"));
          return (
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
              <QuoteIntegrationTestPage />
            </React.Suspense>
          );
        }}
      </Route>
      {/* Route moved to avoid duplication */}
      <Route path="/rebuild">
        {() => {
          const RebuildGateway = React.lazy(() => {
            return import("./App.rebuild").then(module => ({ default: module.default }));
          });
          return (
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading rebuild gateway...</div>}>
              <RebuildGateway />
            </React.Suspense>
          );
        }}
      </Route>
      <Route path="/dental-chart" component={DentalChartPage} />
      <Route path="/my-dental-chart" component={PatientDentalChart} />
      <Route path="/treatment-comparison" component={TreatmentComparisonPage} />
      <Route path="/account-settings" component={AccountSettingsPage} />
      <Route path="/my-profile" component={ProfilePage} />
      <Route path="/dental-advice" component={DentalAdvicePage} />
      
      {/* Test route for matched clinics page with sample data */}
      <Route path="/test-clinics">
        {() => {
          const MatchedClinicsPage = React.lazy(() => import("@/pages/MatchedClinicsPage"));
          // Sample treatment items
          const sampleTreatments = [
            {
              id: "treatment1",
              category: "implants",
              name: "Dental Implant",
              quantity: 2,
              priceGBP: 1200,
              priceUSD: 1560,
              subtotalGBP: 2400,
              subtotalUSD: 3120,
              guarantee: "5-year"
            },
            {
              id: "treatment2",
              category: "cosmetic",
              name: "Porcelain Veneers",
              quantity: 4,
              priceGBP: 350,
              priceUSD: 455,
              subtotalGBP: 1400,
              subtotalUSD: 1820,
              guarantee: "3-year"
            }
          ];
          
          // Sample patient info
          const samplePatient = {
            fullName: "John Doe",
            email: "john.doe@example.com",
            phone: "+44 7700 900123",
            hasXrays: true,
            hasCtScan: false,
            hasDentalPhotos: true,
            preferredContactMethod: "email" as "email" | "phone" | "whatsapp", // Type cast to match the PatientInfo type
            travelMonth: "August",
            departureCity: "London",
            additionalNotesForClinic: "Looking for a comfortable experience with minimal pain."
          };
          
          return (
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading clinics...</div>}>
              <MatchedClinicsPage treatmentItems={sampleTreatments} patientInfo={samplePatient} totalGBP={3800} />
            </React.Suspense>
          );
        }}
      </Route>
      
      {/* Main route for matched clinics page including promotional code handling */}
      <Route path="/matched-clinics">
        {() => {
          const MatchedClinicsPage = React.lazy(() => import("@/pages/MatchedClinicsPage"));
          
          return (
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading clinics...</div>}>
              {/* The component will handle parsing URL parameters */}
              <MatchedClinicsPage />
            </React.Suspense>
          );
        }}
      </Route>
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/verification-sent" component={VerificationSentPage} />
      <Route path="/email-verified" component={EmailVerifiedPage} />
      <Route path="/verification-failed" component={VerificationFailedPage} />
      
      {/* Canonical route for patient quote details - redirect from /patient/quotes/:id */}
      <Route path="/portal/quotes/:id">
        {(params) => <PatientPortalPage initialSection="quotes" quoteId={params.id} />}
      </Route>
      
      {/* Route for individual treatment line details */}
      <Route path="/portal/treatment/:id">
        {(params) => <PatientPortalPage initialSection="treatments" treatmentLineId={params.id} />}
      </Route>
      
      {/* Patient Treatment Plan Routes */}
      <Route path="/portal/treatment-plan/:id">
        {(params) => <PatientTreatmentPlanPage />}
      </Route>
      
      {/* Patient quotes section */}
      <Route path="/patient/quotes" component={() => {
        // Use dynamic import to avoid circular dependency issues
        const PatientQuotesWrapper = React.lazy(() => import("@/components/patient/PatientQuotesWrapper"));
        return (
          <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]">Loading...</div>}>
            <PatientQuotesWrapper />
          </Suspense>
        );
      }} />

      {/* Patient Quote Edit Page - MUST come before the detail route */}
      <Route path="/patient/quotes/:id/edit">
        {(params) => {
          const PatientQuoteEditPage = React.lazy(() => import("@/pages/patient/PatientQuoteEditPage"));
          return (
            <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]">Loading editor...</div>}>
              <PatientQuoteEditPage />
            </Suspense>
          );
        }}
      </Route>
      
      {/* Patient Quote Detail Page */}
      <Route path="/patient/quotes/:id">
        {(params) => {
          const PatientQuoteDetailPage = React.lazy(() => import("@/pages/patient/PatientQuoteDetailPage"));
          return (
            <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]">Loading details...</div>}>
              <PatientQuoteDetailPage />
            </Suspense>
          );
        }}
      </Route>
      
      {/* Legacy route - redirect to canonical route */}
      <Route path="/portal/quotes/:id">
        {(params) => <PatientPortalPage initialSection="quotes" quoteId={params.id} />}
      </Route>
      
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
      
      {/* Special Offers Testing Route */}
      <Route path="/special-offers-test" component={SpecialOfferTestPage} />
      <Route path="/special-offers-fixed" component={SpecialOffersFixedPage} />
      
      {/* Debug Render Test Page - completely new route to verify build pipeline */}
      <Route path="/debug-render-test" component={() => {
        console.log('DEBUG RENDER TEST ROUTE ACCESSED at', new Date().toISOString());
        const DebugRenderTestPage = React.lazy(() => import("@/pages/DebugRenderTestPage"));
        return (
          <React.Suspense fallback={
            <div style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'black',
              color: 'red',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              Loading Debug Test Page...
            </div>
          }>
            <DebugRenderTestPage />
          </React.Suspense>
        );
      }} />
      
      {/* Admin Treatment Plan Routes */}
      <ProtectedRoute path="/admin-portal/treatment-plan/:id" component={AdminTreatmentPlansPage} requiredRole="admin" />
      <ProtectedRoute path="/admin-portal/treatment-plans" component={AdminTreatmentPlansPage} requiredRole="admin" />
      <ProtectedRoute path="/admin-portal/treatment-plans/analytics" component={AdminTreatmentPlansPage} requiredRole="admin" />
      
      {/* Admin Promotions Routes */}
      <ProtectedRoute path="/admin-portal/promotions" component={() => {
        const PromotionsPage = React.lazy(() => import("@/pages/admin/PromotionsPage"));
        return (
          <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading promotions management...</div>}>
            <PromotionsPage />
          </React.Suspense>
        );
      }} requiredRole="admin" />
      
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
      
      <Route path="/admin/quote-builder">
        {() => (
          <AdminPortalGuard>
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading Quote Builder...</div>}>
              {/* Use dynamic import to reduce initial bundle size */}
              {React.createElement(React.lazy(() => import("@/pages/QuoteBuilderPage")))}
            </React.Suspense>
          </AdminPortalGuard>
        )}
      </Route>
      
      {/* Clinic Staff Protected Routes */}
      {/* Adding a simple, alternative clinic portal route that should have no refresh issues */}
      <Route path="/simple-clinic">
        {() => <ClinicGuard><SimpleClinicPage /></ClinicGuard>}
      </Route>
      
      {/* Dedicated clinic login page */}
      <Route path="/clinic-login">
        {() => {
          const ClinicLoginPage = React.lazy(() => import("@/pages/ClinicLoginPage"));
          return (
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>}>
              <ClinicLoginPage />
            </React.Suspense>
          );
        }}
      </Route>

      {/* Standard clinic portal route with ClinicGuard */}
      {/* Standard clinic portal route with dashboard redirect */}
      <Route path="/clinic-portal">
        {() => <Redirect to="/clinic-portal/dashboard" />}
      </Route>
      
      {/* Specific clinic portal section route with parameter guard */}
      <Route path="/clinic-portal/:section">
        {(params: any) => {
          // Extract the section from the URL with additional error checking
          // This prevents the "Cannot read properties of undefined (reading 'section')" error
          const section = params && params.section ? params.section : 'dashboard';
          
          // Add safe section verification
          console.log(`Clinic portal loading section: ${section}`);
          
          return (
            <React.Suspense fallback={
              <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
                <p className="text-lg">Loading {section} section...</p>
              </div>
            }>
              <ClinicGuard>
                <ClinicPortalPage disableAutoRefresh={true} initialSection={section} />
              </ClinicGuard>
            </React.Suspense>
          );
        }}
      </Route>
      
      {/* Route for direct clinic access with authentication check */}
      <Route path="/clinic-direct">
        {() => {
          // Local authentication check to ensure clinic access
          const [isLoading, setIsLoading] = useState(true);
          const [isAuthenticated, setIsAuthenticated] = useState(false);
          const { toast } = useToast();
          
          // Use an effect to detect WebSocket issues
          useEffect(() => {
            const checkWebSocketConnection = () => {
              const wsConnected = sessionStorage.getItem('clinic_websocket_connected');
              
              if (wsConnected === 'false') {
                console.log('WebSocket connection failed - showing notification');
                toast({
                  title: 'Connection Status',
                  description: 'Limited connection to real-time updates. Refresh if you need immediate data updates.',
                  variant: 'default',
                  duration: 5000
                });
              }
            };
            
            // Check after 5 seconds to see if WebSocket connected
            const timer = setTimeout(checkWebSocketConnection, 5000);
            return () => clearTimeout(timer);
          }, [toast]);
          
          // Check authentication status
          useEffect(() => {
            fetch('/api/auth/user')
              .then(res => res.json())
              .then(data => {
                if (data.success && data.user && (data.user.role === 'clinic_staff' || data.user.role === 'admin')) {
                  console.log('User authenticated as clinic staff:', data.user);
                  // Cache the user data in sessionStorage
                  sessionStorage.setItem('clinic_user_data', JSON.stringify(data.user));
                  sessionStorage.setItem('clinic_direct_access', 'true');
                  setIsAuthenticated(true);
                } else {
                  console.error('Not authenticated as clinic staff');
                  toast({
                    title: 'Authentication Required',
                    description: 'Please log in with your clinic credentials',
                    variant: 'destructive',
                  });
                }
                setIsLoading(false);
              })
              .catch(err => {
                console.error('Auth check failed:', err);
                setIsLoading(false);
                toast({
                  title: 'Authentication Error',
                  description: 'Could not verify your credentials',
                  variant: 'destructive',
                });
              });
          }, [toast]);

          if (isLoading) {
            return (
              <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  <p className="text-sm text-muted-foreground">Verifying clinic credentials...</p>
                </div>
              </div>
            );
          }

          if (!isAuthenticated) {
            return <Redirect to="/clinic-login" />;
          }
          
          return (
            <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <p className="text-sm">Loading clinic portal...</p>
              </div>
            </div>}>
              <ClinicPortalPage disableAutoRefresh={true} initialSection="dashboard" />
            </React.Suspense>
          );
        }}
      </Route>
      <ProtectedRoute path="/clinic-treatment-mapper" component={ClinicTreatmentMapperPage} requiredRole="clinic_staff" />
      <ProtectedRoute path="/clinic-dental-charts" component={ClinicDentalCharts} requiredRole="clinic_staff" />
      
      {/* Clinic Treatment Plan Routes */}
      <ProtectedRoute path="/clinic-portal/treatment-plan/:id" component={ClinicTreatmentPlanPage} requiredRole="clinic_staff" />
      <ProtectedRoute path="/clinic-portal/treatment-plans" component={ClinicTreatmentPlanPage} requiredRole="clinic_staff" />
      
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
          <Route path="/test-special-offers" component={() => {
            const TestSpecialOffersPage = React.lazy(() => import("@/pages/TestSpecialOffersPage"));
            return (
              <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]">Loading test page...</div>}>
                <TestSpecialOffersPage />
              </Suspense>
            );
          }} />
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
    </>
  );
}

function App() {
  // WhatsApp phone number (without + sign) and formatted display number for direct calls
  const whatsappNumber = "447572445856"; // UK WhatsApp number without + sign
  const phoneNumber = "+44 7572 445856"; // Formatted display number for direct calls
  const { toast } = useToast();
  
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);
  
  // App initialization logging
  useEffect(() => {
    console.log('APP ENTRY POINT EXECUTED AT:', new Date().toISOString());
  }, []);
  
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AdminAuthProvider>
            <NotificationsProvider>
              <BookingsProvider>
                <UnifiedTreatmentPlansProvider>
                  <QuoteFlowProvider>
                    <SpecialOffersProvider>
                      <PageTransitionProvider>
                        <NavigationProvider>
                          <Suspense fallback={<div>Loading...</div>}>
                            <ScrollToTop />
                            {/* Only exclude ReloadTranslations on clinic portal path */}
                            {typeof window !== 'undefined' && window.location.pathname !== '/clinic-portal' && 
                              <ReloadTranslations />
                            }
                            {/* Navigation status indicator */}
                            <NavigationStatusBar />
                            {/* Use PageTransitionLoader to show loading states */}
                            <PageTransitionLoader>
                              <ErrorBoundary>
                                <Router />
                              </ErrorBoundary>
                            </PageTransitionLoader>
                            <ContactWidget whatsappNumber={whatsappNumber} phoneNumber={phoneNumber} />
                            <EnvironmentBadge />
                            <Toaster />
                          </Suspense>
                        </NavigationProvider>
                      </PageTransitionProvider>
                    </SpecialOffersProvider>
                  </QuoteFlowProvider>
                </UnifiedTreatmentPlansProvider>
              </BookingsProvider>
            </NotificationsProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Status bar that shows navigation state
function NavigationStatusBar() {
  const { isNavigating, currentRoute } = useNavigation();
  
  // Don't render anything if not navigating
  if (!isNavigating) return null;
  
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-primary animate-pulse z-50" />
  );
}

export default App;
