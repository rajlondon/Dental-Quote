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
import BookingPage from "@/pages/BookingPage";
import ClientPortalPage from "@/pages/ClientPortalPage";
import AdminPortalPage from "@/pages/AdminPortalPage";
import PortalLoginPage from "@/pages/PortalLoginPage";
import ContactWidget from "@/components/ContactWidget";
import ReloadTranslations from "@/components/ReloadTranslations";
import ScrollToTop from "@/components/ScrollToTop";
import { Suspense } from "react";

function Router() {
  return (
    <Switch>
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
      <Route path="/your-quote" component={QuoteResultsPage} />
      <Route path="/booking" component={BookingPage} />
      <Route path="/portal" component={PortalLoginPage} />
      <Route path="/portal-login" component={PortalLoginPage} />
      <Route path="/client-portal" component={ClientPortalPage} />
      <Route path="/admin-portal" component={AdminPortalPage} />
      {/* Redirect test pages to the home page */}
      <Route path="/test">
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
      <Route path="/test-pdf">
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
