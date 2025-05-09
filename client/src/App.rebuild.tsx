import React from "react";
import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ErrorBoundary } from "@/components/error-boundary";
import { QuoteFlowProvider } from "./contexts/QuoteFlowContext";
import { EnhancedQuoteFlowProvider } from "./contexts/EnhancedQuoteFlowContext";
import Home from "./pages/Home";
import YourQuotePage from "./pages/YourQuotePage";
import NewYourQuotePage from "./pages/NewYourQuotePage";
import MatchedClinicsPage from "./pages/MatchedClinicsPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/ErrorPage";
import QuoteFlowRebuildPage from "./pages/QuoteFlowRebuildPage";
import QuoteFlowTest from "./pages/QuoteFlowTest";

// Environment indicator component for development
const EnvironmentIndicator = () => {
  const isDev = import.meta.env.DEV || !import.meta.env.PROD;
  
  if (!isDev) return null;
  
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
      DEVELOPMENT
    </div>
  );
};

// A simple gateway page to choose between old and new implementations
const RebuildGateway = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">MyDentalFly Special Offers Rebuild</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition">
            <h2 className="font-medium">Current Implementation</h2>
            <p className="text-sm text-gray-600 mb-3">
              The existing special offers implementation with persistent issues.
            </p>
            <Link href="/your-quote">
              <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded">
                Use Existing Flow
              </button>
            </Link>
          </div>
          
          <div className="p-4 border rounded-lg border-primary/50 bg-primary/5">
            <h2 className="font-medium text-primary">New Implementation</h2>
            <p className="text-sm text-gray-600 mb-3">
              The rebuilt special offers implementation with proper architecture.
            </p>
            <Link href="/special-offers-rebuild">
              <button className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded">
                Use New Flow
              </button>
            </Link>
          </div>
          
          <div className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h2 className="font-medium text-blue-700">Test Both Implementations</h2>
            <p className="text-sm text-gray-600 mb-3">
              Compare both implementations with different scenarios.
            </p>
            <Link href="/quote-flow-test">
              <button className="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded">
                Run Test Scenarios
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// This is our new App component that includes both old and new implementations
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <QuoteFlowProvider>
          <EnhancedQuoteFlowProvider>
            <ErrorBoundary>
              <Switch>
                {/* Gateway page */}
                <Route path="/rebuild" component={RebuildGateway} />
                
                {/* Original pages */}
                <Route path="/" component={Home} />
                <Route path="/clinics" component={MatchedClinicsPage} />
                <Route path="/your-quote" component={YourQuotePage} />
                <Route path="/login" component={LoginPage} />
                
                {/* New implementations */}
                <Route path="/special-offers-rebuild" component={QuoteFlowRebuildPage} />
                <Route path="/quote-flow-test" component={QuoteFlowTest} />
                <Route path="/your-quote-new" component={NewYourQuotePage} />
                
                {/* 404 for all other routes */}
                <Route component={NotFoundPage} />
              </Switch>
            </ErrorBoundary>
          </EnhancedQuoteFlowProvider>
        </QuoteFlowProvider>
      </AuthProvider>
      
      <Toaster />
      <EnvironmentIndicator />
    </QueryClientProvider>
  );
};

export default App;