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

interface OfferCardProps {
  offer: {
    id: string;
    title: string;
    description?: string;
    image?: string;
    clinicId: string;
    clinicName?: string;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
  }
}

/**
 * OfferCard component that follows MVP spec
 * 
 * If NOT logged-in → modal login/register → resume.
 * Skips Info page if user details exist (name/email/phone).
 * Skips Multi-clinic Results page.
 * Creates Draft Quote bound to clinicId & offerId.
 * Redirect ⇒ /portal/quote/:quoteId/review with bonus/discount lines pre-added.
 */
export function OfferCard({ offer }: OfferCardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the QuoteFlow context
  const { 
    setSource, 
    setOfferId, 
    setClinicId 
  } = useQuoteFlow();
  
  // Background image style with fallback
  const backgroundImage = offer.image 
    ? `url(${offer.image})`
    : 'linear-gradient(to right, #0f172a, #1e293b)';
  
  // Format the discount badge text
  const formatDiscount = () => {
    if (!offer.discountType || !offer.discountValue) return null;
    
    return offer.discountType === 'percentage'
      ? `${offer.discountValue}% OFF`
      : `$${offer.discountValue} OFF`;
  };
  
  const handleOfferClick = async () => {
    try {
      setIsProcessing(true);
      
      // Set context data to track this flow
      setSource('special_offer');
      setOfferId(offer.id);
      setClinicId(offer.clinicId);
      
      // Ensure flow data is also saved to session storage for login recovery
      // This maintains compatibility with existing code
      sessionStorage.setItem('pendingSpecialOffer', JSON.stringify(offer));
      sessionStorage.setItem('processingSpecialOffer', offer.id);
      
      // If user is not logged in, redirect to login page with special offer info
      if (!user) {
        // Redirect to login page
        setLocation('/portal-login');
        return;
      }
      
      // User is logged in, we should redirect to the unified quote flow
      toast({
        title: "Special Offer Selected",
        description: `${offer.title} will be applied to your quote`,
        variant: "default",
      });
      
      // Redirect to quote flow with context already set
      setLocation('/quote-flow');
      
    } catch (error) {
      console.error('Error processing special offer:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process offer",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  // Function to create a quote from an offer via the API
  const createQuoteFromOffer = async (offerId: string, clinicId: string) => {
    try {
      let response;
      
      // Try each endpoint in order until one succeeds
      try {
        // First try our new unified endpoint (implemented in treatment-offer-integration.ts)
        console.log("Attempting to use treatment plans from-offer endpoint");
        response = await apiRequest(
          'POST', 
          `/api/treatment-plans/from-offer`,
          { offerId, clinicId, notes: "Selected from special offers" }
        );
        
        if (response.ok) {
          console.log("Successfully used treatment-plans/from-offer endpoint");
        } else {
          throw new Error("New treatment-plans/from-offer endpoint returned error status");
        }
      } catch (err) {
        console.log("New endpoint failed, trying legacy endpoints:", err);
        
        try {
          // Try the primary legacy endpoint
          console.log("Attempting first legacy endpoint for offer");
          response = await apiRequest(
            'POST', 
            `/api/v1/offers/${offerId}/start`,
            { clinicId }
          );
          
          if (response.ok) {
            console.log("Successfully used primary offer endpoint");
          } else {
            throw new Error("Primary offer endpoint returned error status");
          }
        } catch (secondErr) {
          console.log("Primary legacy endpoint failed, trying last fallback:", secondErr);
          
          // Try the last fallback endpoint if all else fails
          console.log("Attempting final fallback endpoint for offer");
          response = await apiRequest(
            'POST', 
            `/api/offers/${offerId}/start`,
            { clinicId }
          );
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create quote from offer');
      }
      
      const data = await response.json();
      
      // Check if we have a quote ID and URL to redirect to
      if (data.quoteId && data.quoteUrl) {
        // Check if user needs to go through the dental quiz first (new users)
        // Make sure we're using the correct API path
        const userData = await apiRequest('GET', '/api/auth/user');
        const userProfile = await userData.json();
        
        if (userProfile && userProfile.user && !userProfile.user.profileComplete) {
          // Store the pending quote ID for after quiz completion
          localStorage.setItem('pendingQuoteAfterQuiz', JSON.stringify({
            quoteId: data.quoteId,
            quoteUrl: data.quoteUrl,
            clinicId: offer.clinicId,
            offerTitle: offer.title
          }));
          
          toast({
            title: "Let's Complete Your Dental Profile",
            description: "Please answer a few questions about your dental needs first.",
          });
          
          // Redirect to the quiz flow, but skip info page since we have basic info
          window.location.href = '/quote-flow?step=dental-quiz&skipInfo=true&clinicId=' + offer.clinicId;
        } else {
          // If user has already completed profile, proceed to quote directly
          toast({
            title: "Success",
            description: "Special offer applied to your quote"
          });
          
          // Clear processing state from session storage
          sessionStorage.removeItem('processingSpecialOffer');
          
          // Redirect to the quote review page
          window.location.href = data.quoteUrl;
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating quote from offer:', error);
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
        {formatDiscount() && (
          <Badge 
            className="absolute -top-5 right-4 bg-primary text-white font-bold"
            variant="default"
          >
            {formatDiscount()}
          </Badge>
        )}
        <CardTitle className="text-xl">{offer.title}</CardTitle>
        {offer.clinicName && (
          <CardDescription>
            {offer.clinicName}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600">
          {offer.description || "Exclusive special offer for dental treatment. Limited time only."}
        </p>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleOfferClick}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Processing
            </>
          ) : (
            "Get This Offer"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}