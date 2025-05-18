import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

/**
 * Component to handle special offers from URL parameters
 * This component doesn't render anything visually - it just handles the logic
 */
export function SpecialOfferHandler() {
  const { toast } = useToast();
  const [location] = useLocation();

  useEffect(() => {
    // Extract URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const offerId = urlParams.get('offer');
    const packageId = urlParams.get('packageId');
    const promoCode = urlParams.get('promoCode') || urlParams.get('promo') || urlParams.get('code');
    
    // Handle special offer redirection
    if (offerId && !location.includes('/quote-builder')) {
      console.log(`🔍 Special offer detected: ${offerId}`);
      
      // Fetch special offer details
      fetch(`/api/special-offers/${offerId}`)
        .then(response => response.json())
        .then(data => {
          if (data?.success) {
            const offer = data.offer;
            
            toast({
              title: "Special Offer Selected",
              description: `We'll apply your ${offer.title} package to your quote!`,
            });
            
            // Redirect to quote builder with package and promo information
            window.location.href = `/quote-builder?packageId=${offer.packageId}&packageName=${encodeURIComponent(offer.title)}${offer.promoCode ? `&promoCode=${offer.promoCode}` : ''}`;
          } else {
            // Handle invalid offer ID
            toast({
              title: "Invalid Offer",
              description: "We couldn't find the special offer you requested.",
              variant: "destructive"
            });
          }
        })
        .catch(error => {
          console.error("Error fetching special offer:", error);
          toast({
            title: "Error",
            description: "There was a problem processing your special offer.",
            variant: "destructive"
          });
        });
    }
    
    // If we already have a packageId in the URL but aren't on the quote builder page
    else if (packageId && !location.includes('/quote-builder')) {
      const redirectUrl = `/quote-builder?packageId=${packageId}${promoCode ? `&promoCode=${promoCode}` : ''}`;
      window.location.href = redirectUrl;
    }
  }, [location, toast]);

  // This component doesn't render anything
  return null;
}

export default SpecialOfferHandler;