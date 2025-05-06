import React, { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Patient Quote Edit Page
 * This is a wrapper that redirects to the patient portal with edit parameters
 */
export default function PatientQuoteEditPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const quoteId = params?.id;

  useEffect(() => {
    if (quoteId) {
      console.log("[DEBUG] Redirecting to quote edit in patient portal for quote:", quoteId);
      
      // Store section info in session to ensure it's picked up by the patient portal
      sessionStorage.setItem('patient_portal_section', 'quotes');
      sessionStorage.setItem('patient_portal_action', 'edit');
      sessionStorage.setItem('patient_portal_quote_id', quoteId.toString());
      
      // Navigate to patient portal with query params
      window.location.href = `/patient-portal?section=quotes&action=edit&id=${quoteId}`;
      
      toast({
        title: "Loading Editor",
        description: "Preparing the quote editor..."
      });
    } else {
      // No quote ID provided
      toast({
        title: "Error",
        description: "No quote ID was provided to edit",
        variant: "destructive"
      });
      
      setLocation('/patient/quotes');
    }
  }, [quoteId, setLocation, toast]);

  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg">Loading quote editor...</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setLocation(`/patient/quotes/${quoteId || ''}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}