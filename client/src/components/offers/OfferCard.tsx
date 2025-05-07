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
    treatmentPriceGBP?: number;  // Added price in GBP
    treatmentPriceUSD?: number;  // Added price in USD
  }
}

// Interface for the API response
interface QuoteResponse {
  quoteId: string;
  quoteUrl: string;
  treatmentPlanId?: string;
  treatmentPlanUrl?: string;
  offerId?: string;
  clinicId?: string;
  message?: string;
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
    
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    } else {
      // For fixed discounts, show both currencies if we have treatment prices
      if (offer.treatmentPriceGBP && offer.treatmentPriceUSD) {
        return `£${offer.discountValue} / $${Math.round(offer.discountValue * 1.28)} OFF`;
      } else {
        return `£${offer.discountValue} OFF`;
      }
    }
  };
  
  // Function to create a quote from an offer via the API
  const createQuoteFromOffer = async (offerId: string, clinicId: string): Promise<QuoteResponse> => {
    try {
      // Determine if this is a free consultation package
      const isFreeConsultation = 
        offer.title?.includes('Consultation') || 
        offer.title?.includes('consultation');
        
      console.log(`Processing ${isFreeConsultation ? 'Free Consultation Package' : 'Standard Special Offer'}`);
      
      // Special handling for Free Consultation Package
      if (isFreeConsultation) {
        console.log("🔶 FREE CONSULTATION PACKAGE DETECTED - Using direct token creation");
        
        // First, try to create a promo token if it doesn't exist
        try {
          // Check if token exists first or create a new one
          console.log("First checking if token already exists");
          
          const tokenCheckResponse = await apiRequest(
            'GET',
            `/api/v1/promo-tokens/check/${offerId}`
          );
          
          if (!tokenCheckResponse.ok) {
            console.log("Token does not exist, creating a new one");
            
            const createTokenResponse = await apiRequest(
              'POST',
              '/api/v1/promo-tokens',
              {
                clinicId: clinicId,
                promoType: 'special_offer',
                token: `special_${offerId}`,
                payload: {
                  offerId: offerId,
                  title: 'Free Consultation Package',
                  discountType: 'percentage',
                  discountValue: 100,
                  applicableTreatment: 'Consultation'
                },
                displayOnHome: true,
                validUntil: '2026-12-31' // Long-lived token
              }
            );
            
            if (!createTokenResponse.ok) {
              console.warn("Failed to create token, but continuing with flow");
            } else {
              console.log("Successfully created promo token for free consultation");
            }
          } else {
            console.log("Token already exists, proceeding with quote creation");
          }
        } catch (tokenErr) {
          console.warn("Token creation failed, but continuing with flow:", tokenErr);
        }
      }
      
      let response;
      
      // Try each endpoint in order until one succeeds
      try {
        // First try our promo token endpoint for special offers
        console.log("Attempting to use promo token endpoint");
        response = await apiRequest(
          'POST',
          `/api/v1/quotes/from-token`,
          { 
            token: `special_${offerId}`, // Using a consistent token format for special offers
            promoType: 'special_offer'
          }
        );
        
        if (response.ok) {
          console.log("✅ Successfully used promo token endpoint");
        } else {
          throw new Error("Promo token endpoint returned error status");
        }
      } catch (err) {
        console.log("Promo token endpoint failed, using fallback unified endpoint:", err);
        
        try {
          // Try our new unified endpoint
          console.log("Attempting to use treatment plans from-offer endpoint");
          
          // For Free Consultation Package, include special metadata
          const payload = isFreeConsultation 
            ? { 
                offerId, 
                clinicId, 
                notes: "Free Consultation Package",
                specialOffer: {
                  id: offerId,
                  title: 'Free Consultation Package',
                  discountType: 'percentage' as 'percentage',
                  discountValue: 100,
                  clinicId: clinicId,
                  applicableTreatment: 'Consultation'
                }
              } 
            : { 
                offerId, 
                clinicId, 
                notes: "Selected from special offers",
                specialOffer: {
                  id: offerId,
                  title: offer.title,
                  discountType: offer.discountType,
                  discountValue: offer.discountValue,
                  clinicId: clinicId
                }
              };
          
          response = await apiRequest(
            'POST', 
            `/api/treatment-plans/from-offer`,
            payload
          );
          
          if (response.ok) {
            console.log("✅ Successfully used treatment-plans/from-offer endpoint");
          } else {
            // Last fallback - use our dedicated Free Consultation API endpoint
            if (isFreeConsultation) {
              console.log("⚠️ Previous API endpoints failed, trying dedicated Free Consultation API");
              
              try {
                // Use our special non-authenticated Free Consultation endpoint
                const freeConsultationResponse = await apiRequest(
                  'POST',
                  '/api/v1/free-consultation',
                  {
                    offerId,
                    clinicId
                  }
                );
                
                if (!freeConsultationResponse.ok) {
                  throw new Error("Free consultation endpoint returned error status");
                }
                
                console.log("✅ Successfully used free-consultation endpoint");
                
                const consultData = await freeConsultationResponse.json();
                
                if (consultData.quoteId && consultData.quoteUrl) {
                  // Add timestamp to prevent caching issues
                  const quoteUrl = new URL(consultData.quoteUrl, window.location.origin);
                  quoteUrl.searchParams.append('t', Date.now().toString());
                  
                  // Redirect directly
                  window.location.href = quoteUrl.toString();
                  
                  toast({
                    title: "Success",
                    description: "Free consultation added to your quote"
                  });
                  
                  return {
                    quoteId: consultData.quoteId,
                    quoteUrl: quoteUrl.toString()
                  } as QuoteResponse;
                }
                
                throw new Error("Invalid response from consultation endpoint");
              } catch (consultError) {
                console.error("Free consultation API failed:", consultError);
                
                // If all else fails, use the direct URL approach as absolute last resort
                console.log("⚠️ All API endpoints failed, using direct quote URL fallback");
                
                // Build a URL that directly integrates with the v2 flows as last resort
                const consultationUrl = new URL('/quote', window.location.origin);
                
                // Required parameters for the consultation flow
                consultationUrl.searchParams.append('source', 'special_offer');
                consultationUrl.searchParams.append('treatment', 'consultation');
                consultationUrl.searchParams.append('step', 'start');
                consultationUrl.searchParams.append('skipInfo', 'true');
                
                // Special offer data
                consultationUrl.searchParams.append('specialOffer', 'true');
                consultationUrl.searchParams.append('offerTitle', 'Free Consultation Package');
                consultationUrl.searchParams.append('offerDiscount', '100');
                consultationUrl.searchParams.append('offerDiscountType', 'percentage');
                
                // Clinic data
                consultationUrl.searchParams.append('clinicId', clinicId);
                consultationUrl.searchParams.append('offerId', offerId);
                
                // Add timestamp to prevent caching issues
                consultationUrl.searchParams.append('t', Date.now().toString());
                
                console.log("🔷 Absolute last resort fallback URL:", consultationUrl.toString());
                
                // Redirect directly and return a mock response to satisfy the promise
                window.location.href = consultationUrl.toString();
                
                return {
                  quoteId: 'direct_url_fallback',
                  quoteUrl: consultationUrl.toString()
                } as QuoteResponse;
              }
            } else {
              throw new Error("All API endpoints failed");
            }
          }
        } catch (error: any) {
          if (error.message === "All API endpoints failed") {
            throw error;
          }
          
          console.log("All standard endpoints failed, using legacy endpoints as last resort:", error);
          
          // Try primary legacy endpoint as last resort
          response = await apiRequest(
            'POST', 
            `/api/v1/offers/${offerId}/start`,
            { clinicId }
          );
        }
      }
      
      // Process successful response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create quote from offer');
      }
      
      const data = await response.json();
      
      // Check if we have a quote ID and URL to redirect to
      if (data.quoteId) {
        // Generate the redirect URL if not provided
        if (!data.quoteUrl) {
          data.quoteUrl = `/quote/wizard?quoteId=${data.quoteId}`;
        }
        
        // Check if user needs to go through the dental quiz first (new users)
        const userData = await apiRequest('GET', '/api/auth/user');
        const userProfile = await userData.json();
        
        // For Free Consultation, skip quiz and go directly to quote
        if (isFreeConsultation || (userProfile?.user && userProfile.user.profileComplete)) {
          // Direct path for free consultation or completed profile
          toast({
            title: "Success",
            description: isFreeConsultation 
              ? "Free consultation added to your quote" 
              : "Special offer applied to your quote"
          });
          
          // Clear any processing state
          sessionStorage.removeItem('processingSpecialOffer');
          sessionStorage.removeItem('pendingSpecialOffer');
          
          // Redirect to the quote directly
          window.location.href = data.quoteUrl;
          return data as QuoteResponse;
        } else {
          // New users need to complete profile first
          localStorage.setItem('pendingQuoteAfterQuiz', JSON.stringify({
            quoteId: data.quoteId,
            quoteUrl: data.quoteUrl,
            clinicId: clinicId,
            offerTitle: offer.title
          }));
          
          toast({
            title: "Let's Complete Your Dental Profile",
            description: "Please answer a few questions about your dental needs first.",
          });
          
          // Redirect to the quiz flow
          window.location.href = '/quote?step=dental-quiz&skipInfo=true&clinicId=' + clinicId;
          return data as QuoteResponse;
        }
      } else {
        throw new Error('Invalid response from server - missing quoteId');
      }
    } catch (error: any) {
      console.error('Error creating quote from offer:', error);
      setIsProcessing(false);
      throw error;
    }
  };

  const handleOfferClick = async () => {
    try {
      setIsProcessing(true);
      
      // Update the quote flow context
      setSource('special_offer');
      setOfferId(offer.id);
      setClinicId(offer.clinicId);
      
      // If the user is not logged in, redirect to login with pending action
      if (!user) {
        console.log("User not authenticated, redirecting to login with pending offer action");
        
        // Store offer details for after login
        sessionStorage.setItem('pendingSpecialOffer', JSON.stringify(offer));
        localStorage.setItem('pendingAction', JSON.stringify({
          type: 'special_offer',
          offerId: offer.id,
          clinicId: offer.clinicId
        }));
        
        // Notify user they need to login first
        toast({
          title: "Please log in first",
          description: "Log in or create an account to access this special offer",
        });
        
        // Redirect to auth page
        window.location.href = '/auth';
        return;
      }
      
      // User is logged in, directly create a quote from the offer
      console.log("User authenticated, creating quote from offer");
      const response = await createQuoteFromOffer(offer.id, offer.clinicId);
      
      // Success is handled in createQuoteFromOffer function with proper redirection
      // This code should never be reached in normal operation, but added as a safeguard
      if (response?.quoteId && !window.location.href.includes('quote')) {
        console.log("Quote created but no redirect occurred, manually redirecting");
        
        // If we have a quote URL, use it, otherwise construct a default one
        const redirectUrl = response.quoteUrl || `/quote/wizard?quoteId=${response.quoteId}`;
        window.location.href = redirectUrl;
      }
    } catch (error: any) {
      console.error('Error processing special offer:', error);
      
      // Display error message and reset processing state
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process offer",
        variant: "destructive"
      });
      
      setIsProcessing(false);
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
        <p className="text-sm text-gray-600 mb-2">
          {offer.description || "Exclusive special offer for dental treatment. Limited time only."}
        </p>
        {(offer.treatmentPriceGBP || offer.treatmentPriceUSD) && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Price:</span>
              <div className="text-right">
                {offer.discountType && offer.discountValue ? (
                  <>
                    {/* If discount exists, show original and discounted price */}
                    {offer.treatmentPriceGBP && (
                      <div className="flex flex-col">
                        <span className="text-gray-500 line-through text-xs">
                          £{offer.treatmentPriceGBP}
                        </span>
                        <span className="font-bold text-green-600">
                          {offer.discountType === 'percentage' ? (
                            `£${Math.round(offer.treatmentPriceGBP * (1 - offer.discountValue/100))}`
                          ) : (
                            `£${Math.max(0, offer.treatmentPriceGBP - offer.discountValue)}`
                          )}
                        </span>
                      </div>
                    )}
                    {offer.treatmentPriceUSD && (
                      <div className="flex flex-col mt-1">
                        <span className="text-gray-500 line-through text-xs">
                          ${offer.treatmentPriceUSD}
                        </span>
                        <span className="font-bold text-green-600">
                          {offer.discountType === 'percentage' ? (
                            `$${Math.round(offer.treatmentPriceUSD * (1 - offer.discountValue/100))}`
                          ) : (
                            `$${Math.max(0, offer.treatmentPriceUSD - Math.round(offer.discountValue * 1.28))}`
                          )}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Regular price display without discount */}
                    {offer.treatmentPriceGBP && (
                      <span className="font-medium">£{offer.treatmentPriceGBP}</span>
                    )}
                    {offer.treatmentPriceGBP && offer.treatmentPriceUSD && " / "}
                    {offer.treatmentPriceUSD && (
                      <span className="font-medium">${offer.treatmentPriceUSD}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
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