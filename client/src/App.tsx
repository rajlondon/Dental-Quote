import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";
import NotFound from "@/pages/not-found";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PricingPage from "./pages/PricingPage";
import TeamPage from "@/pages/TeamPage";
import HowItWorks from "@/pages/HowItWorks";
import FAQPage from "@/pages/FAQPage";
import QuoteResultsPage from "@/pages/QuoteResultsPage";
import YourQuotePage from "@/pages/YourQuotePage2";
import BookingPage from "@/pages/BookingPage";
import PatientPortalPage from "@/pages/PatientPortalPage";
import AdminPortalPage from "@/pages/AdminPortalPage";
import ClinicPortalPage from "@/pages/ClinicPortalPage";
import PortalLoginPage from "@/pages/PortalLoginPage";
import ClinicDetailPage from "@/pages/ClinicDetailPage";
import DepositPaymentPage from "@/pages/DepositPaymentPage";
import PaymentConfirmationPage from "@/pages/PaymentConfirmationPage";
import DentalChartPage from "@/pages/DentalChartPage";
import PatientDentalChart from "@/pages/PatientDentalChart";
import ClinicDentalCharts from "@/pages/ClinicDentalCharts";
import ClinicTreatmentMapperPage from "@/pages/ClinicTreatmentMapperPage";
import AdminTreatmentMapperPage from "@/pages/AdminTreatmentMapperPage";
import TreatmentComparisonPage from "./pages/TreatmentComparisonPage";
import AccountSettingsPage from "@/pages/AccountSettingsPage";
import DataArchitecturePage from "@/pages/DataArchitecturePage";
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
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:id" component={BlogPost} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/team" component={TeamPage} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/your-quote" component={YourQuotePage} />
      <Route path="/quote-results" component={QuoteResultsPage} />
      <Route path="/booking" component={BookingPage} />
      <Route path="/clinic/:id" component={ClinicDetailPage} />
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
      
      {/* Patient Portal Routes - Publicly accessible */}
      <Route path="/client-portal" component={PatientPortalPage} />
      <Route path="/patient-portal" component={PatientPortalPage} />
      <Route path="/dental-chart" component={DentalChartPage} />
      <Route path="/my-dental-chart" component={PatientDentalChart} />
      <Route path="/treatment-comparison" component={TreatmentComparisonPage} />
      <Route path="/account-settings" component={AccountSettingsPage} />
      
      {/* Admin-only Protected Routes */}
      <ProtectedRoute path="/admin-portal" component={AdminPortalPage} requiredRole="admin" />
      <ProtectedRoute path="/admin-treatment-mapper" component={AdminTreatmentMapperPage} requiredRole="admin" />
      <ProtectedRoute path="/data-architecture" component={DataArchitecturePage} requiredRole="admin" />
      
      {/* Clinic Staff Protected Routes */}
      <ProtectedRoute path="/clinic-portal" component={ClinicPortalPage} requiredRole="clinic_staff" />
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
  
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <ScrollToTop />
          <ReloadTranslations />
          <Router />
          <ContactWidget whatsappNumber={whatsappNumber} phoneNumber={phoneNumber} />
          <Toaster />
        </Suspense>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
