import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useQuoteFlow } from "@/contexts/QuoteFlowContext";

interface PackageCardProps {
  package: {
    id: string;
    title: string;
    description?: string;
    image?: string;
    clinicId: string;
    clinicName?: string;
    basePrice?: number;
    currency?: string;
    category?: string;
  }
}

/**
 * PackageCard component that follows MVP spec
 * 
 * Same as OfferCard but payload packageId not offerId.
 * Draft Quote contains packageLine (non-removable) + required base treatments.
 * Redirect ⇒ /portal/quote/:quoteId/review.
 */
export function PackageCard({ package: pkg }: PackageCardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the QuoteFlow context
  const { 
    setSource, 
    setPackageId, 
    setClinicId 
  } = useQuoteFlow();
  
  // Background image style with fallback
  const backgroundImage = pkg.image 
    ? `url(${pkg.image})`
    : 'linear-gradient(to right, #0f172a, #1e293b)';
  
  // Format the price
  const formatPrice = () => {
    if (!pkg.basePrice) return null;
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pkg.currency || 'USD',
    });
    
    return formatter.format(pkg.basePrice);
  };
  
  const handlePackageClick = async () => {
    try {
      setIsProcessing(true);
      
      // Set context data to track this flow
      setSource('package');
      setPackageId(pkg.id);
      setClinicId(pkg.clinicId);
      
      // Ensure flow data is also saved to session storage for login recovery
      // This maintains compatibility with existing code
      sessionStorage.setItem('pendingPackage', JSON.stringify(pkg));
      sessionStorage.setItem('processingPackage', pkg.id);
      
      // If user is not logged in, redirect to login page with package info
      if (!user) {
        // Redirect to login page
        setLocation('/portal-login');
        return;
      }
      
      // User is logged in, we should redirect to the offer confirmation page
      toast({
        title: "Treatment Package Selected",
        description: `Please confirm ${pkg.title}`,
        variant: "default",
      });
      
      // Redirect to confirmation page with context already set
      setLocation('/offer-confirmation');
      
    } catch (error) {
      console.error('Error processing treatment package:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process package",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  // Function to create a quote from a package via the API
  const createQuoteFromPackage = async (packageId: string, clinicId: string) => {
    try {
      // Try each endpoint in order until one succeeds
      let response;
      try {
        // First try our new unified endpoint (implemented in treatment-offer-integration.ts)
        console.log("Attempting to use treatment plans from-package endpoint");
        response = await apiRequest(
          'POST', 
          `/api/treatment-plans/from-package`,
          { packageId, clinicId, notes: "Selected from packages showcase" }
        );
        
        if (response.ok) {
          console.log("Successfully used treatment-plans/from-package endpoint");
        } else {
          throw new Error("New treatment-plans/from-package endpoint returned error status");
        }
      } catch (err) {
        console.log("New endpoint failed, trying legacy endpoints:", err);
        
        try {
          // Try the primary legacy endpoint
          console.log("Attempting first legacy endpoint");
          response = await apiRequest(
            'POST', 
            `/api/v1/packages/${packageId}/start`,
            { clinicId }
          );
          
          if (response.ok) {
            console.log("Successfully used primary package endpoint");
          } else {
            throw new Error("Primary package endpoint returned error status");
          }
        } catch (secondErr) {
          console.log("Primary legacy endpoint failed, trying last fallback:", secondErr);
          
          // Try the last fallback endpoint if all else fails
          console.log("Attempting final fallback endpoint for package");
          response = await apiRequest(
            'POST', 
            `/api/packages/${packageId}/start`,
            { clinicId }
          );
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create quote from package');
      }
      
      const data = await response.json();
      
      // Check if we have a quote ID and URL to redirect to
      if (data.quoteId && data.quoteUrl) {
        // Check if user needs to go through the dental quiz first (new users)
        const userData = await apiRequest('GET', '/api/auth/user');
        const userProfile = await userData.json();
        
        if (userProfile && userProfile.user && !userProfile.user.profileComplete) {
          // Store the pending quote ID for after quiz completion
          localStorage.setItem('pendingQuoteAfterQuiz', JSON.stringify({
            quoteId: data.quoteId,
            quoteUrl: data.quoteUrl,
            clinicId: pkg.clinicId,
            packageTitle: pkg.title
          }));
          
          toast({
            title: "Let's Complete Your Dental Profile",
            description: "Please answer a few questions about your dental needs first.",
          });
          
          // Redirect to the quiz flow, but skip info page since we have basic info
          window.location.href = '/quote-flow?step=dental-quiz&skipInfo=true&clinicId=' + pkg.clinicId;
        } else {
          // If user has already completed profile, proceed to quote directly
          toast({
            title: "Success",
            description: "Treatment package applied to your quote"
          });
          
          // Clear processing state from session storage
          sessionStorage.removeItem('processingPackage');
          
          // Redirect to the quote review page
          window.location.href = data.quoteUrl;
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating quote from package:', error);
      setIsProcessing(false);
      throw error;
    }
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
      <div 
        className="h-40 bg-cover bg-center" 
        style={{ backgroundImage }}
        aria-hidden="true"
      />
      
      <CardHeader className="relative pb-2">
        {formatPrice() && (
          <Badge 
            className="absolute -top-5 right-4 bg-primary text-white font-bold"
            variant="default"
          >
            {formatPrice()}
          </Badge>
        )}
        <CardTitle className="text-xl">{pkg.title}</CardTitle>
        {pkg.clinicName && (
          <CardDescription>
            {pkg.clinicName}
          </CardDescription>
        )}
        {pkg.category && (
          <Badge variant="outline" className="mt-1">
            {pkg.category}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600">
          {pkg.description || "Complete treatment package that includes all necessary procedures."}
        </p>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handlePackageClick}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Processing
            </>
          ) : (
            "Get This Package"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}