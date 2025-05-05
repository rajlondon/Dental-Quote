import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const EmailVerifiedPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [hasPendingOffer, setHasPendingOffer] = useState(false);
  const [offerTitle, setOfferTitle] = useState("");
  const [offerParams, setOfferParams] = useState<URLSearchParams | null>(null);
  
  // Check for pending special offers on mount
  useEffect(() => {
    const pendingOfferData = localStorage.getItem('pendingSpecialOfferAfterVerification');
    if (pendingOfferData) {
      try {
        const offerData = JSON.parse(pendingOfferData);
        setHasPendingOffer(true);
        setOfferTitle(offerData.title || "dental treatment");
        
        // Create URL parameters for quote page
        const params = new URLSearchParams({
          specialOffer: offerData.id,
          offerTitle: offerData.title,
          offerClinic: offerData.clinicId || offerData.clinic_id || '',
          offerDiscount: offerData.discountValue?.toString() || offerData.discount_value?.toString() || '0',
          offerDiscountType: offerData.discountType || offerData.discount_type || 'percentage',
          treatment: offerData.applicableTreatment || offerData.applicable_treatments?.[0] || 'Dental Implants'
        });
        
        setOfferParams(params);
        
        console.log("Found pending special offer after verification:", offerData);
        
        // Clear the offer data since we've handled it
        localStorage.removeItem('pendingSpecialOfferAfterVerification');
      } catch (error) {
        console.error("Error processing pending offer after verification:", error);
      }
    }
  }, []);
  
  // Auto-redirect to login page after delay
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      if (hasPendingOffer && offerParams) {
        // If there's a pending offer, redirect to login with a flag to process the offer
        localStorage.setItem('redirectToOfferAfterLogin', 'true');
        
        // Store the pending offer data in sessionStorage for the login page to process
        // We need to make sure we're using the data we've already parsed and validated
        const pendingOfferData = localStorage.getItem('pendingSpecialOfferAfterVerification');
        if (pendingOfferData) {
          try {
            const offerData = JSON.parse(pendingOfferData);
            // Format the offer data consistently before storing
            const formattedOffer = {
              id: offerData.id,
              title: offerData.title,
              clinicId: offerData.clinicId || offerData.clinic_id || '',
              discountValue: offerData.discountValue || offerData.discount_value || 0,
              discountType: offerData.discountType || offerData.discount_type || 'percentage',
              applicableTreatment: offerData.applicableTreatment || 
                               (offerData.applicable_treatments && offerData.applicable_treatments.length > 0 
                                ? offerData.applicable_treatments[0] 
                                : 'Dental Implants')
            };
            
            // Save to sessionStorage for the login page to find
            sessionStorage.setItem('pendingSpecialOffer', JSON.stringify(formattedOffer));
            console.log("Saved formatted special offer to pendingSpecialOffer:", formattedOffer);
          } catch (error) {
            console.error("Error processing offer data for login:", error);
          }
        }
        
        toast({
          title: "Email Verified Successfully",
          description: `Please log in to continue with your ${offerTitle} request.`,
        });
        
        navigate('/portal-login');
      } else {
        // Standard redirect to login
        navigate('/portal-login');
      }
    }, 5000);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate, hasPendingOffer, offerParams, offerTitle, toast]);
  
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <Link href="/">
            <img 
              src="/images/mydentalfly-logo.png" 
              alt="MyDentalFly Logo" 
              className="h-20 w-auto mx-auto mb-6 shadow-sm border border-gray-100 rounded-md p-2 cursor-pointer" 
            />
          </Link>
        </div>
        
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Thank you for verifying your email address. Your account is now fully activated and you can access all features of MyDentalFly.
            </p>
            
            {hasPendingOffer && (
              <Alert className="bg-primary/10 border-primary/20 text-left">
                <div className="flex items-start">
                  <Sparkles className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <AlertTitle className="text-primary font-medium">Special Offer Ready</AlertTitle>
                    <AlertDescription className="mt-1">
                      Your <span className="font-semibold">{offerTitle}</span> request is ready to process. 
                      Please log in to continue with your quote.
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
            
            <p className="text-sm text-muted-foreground">
              You will be redirected to the login page in a few seconds...
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => navigate('/portal-login')}
            >
              Continue to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerifiedPage;