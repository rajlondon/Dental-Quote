import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ROUTES } from "@/lib/routes";
import { PageHeader } from "@/components/page-header";
import { Plus, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * This is a completely simplified version of PatientQuotesPage that doesn't try
 * to do any complex rendering of quote details or lists. Instead, it acts as
 * a redirect component that sends users to the patient portal's quotes section.
 * 
 * This avoids the React hooks errors we were encountering.
 */
export default function PatientQuotesPage() {
  const [, setLocation] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // On mount, redirect to the patient portal with the quotes section selected
  useEffect(() => {
    if (!isRedirecting && typeof window !== 'undefined') {
      setIsRedirecting(true);
      // Store the current section in session storage so the portal knows which section to display
      try {
        sessionStorage.setItem('patient_portal_section', 'quotes');
        // Redirect to the patient portal page
        setLocation(ROUTES.PATIENT_PORTAL);
      } catch (error) {
        console.error("Failed to set session storage or navigate:", error);
        setIsRedirecting(false);
      }
    }
  }, [setLocation, isRedirecting]);

  // While redirecting, show a simple loading message
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to quotes...</p>
      </div>
    );
  }

  // This part should only show briefly before the redirect happens
  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="My Quotes"
        description="View and manage your quote requests"
        actions={
          <Button asChild>
            <a href="/quote-request" className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Quote Request
            </a>
          </Button>
        }
      />
      
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center text-center space-y-4 py-6">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
          <div className="max-w-md">
            <h3 className="text-xl font-semibold mb-2">Loading Your Quotes</h3>
            <p className="text-muted-foreground mb-6">
              Please wait while we retrieve your dental treatment quotes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}