import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from './use-toast';
import SpecialOfferService from '@/services/special-offer-service';
import TreatmentPackageService from '@/services/treatment-package-service';

/**
 * Hook to automatically extract and apply promo codes from URL query parameters
 * This enables direct links from homepage special offers to the quote builder
 */
export const useAutoApplyCode = (onApplyPromoCode: (code: string) => Promise<void>) => {
  const [location] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoFromUrl, setPromoFromUrl] = useState<string | null>(null);
  const [offerFromUrl, setOfferFromUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Extract query parameters from URL on mount
  useEffect(() => {
    const extractUrlParams = () => {
      try {
        const url = new URL(window.location.href);
        const promoParam = url.searchParams.get('promo');
        const offerParam = url.searchParams.get('offer');
        
        setPromoFromUrl(promoParam);
        setOfferFromUrl(offerParam);
      } catch (error) {
        console.error('Error parsing URL parameters:', error);
      }
    };

    extractUrlParams();
  }, [location]);

  // Apply promo code from URL if present
  useEffect(() => {
    const applyCodeFromUrl = async () => {
      if (isProcessing) return;
      
      try {
        setIsProcessing(true);
        
        // Case 1: Direct promo code in URL
        if (promoFromUrl) {
          await onApplyPromoCode(promoFromUrl);
          
          toast({
            title: 'Promo Code Applied',
            description: `Promo code ${promoFromUrl} has been automatically applied.`,
            variant: 'default',
          });
          
          // Clear URL param without page refresh
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('promo');
          window.history.replaceState({}, document.title, newUrl.toString());
          setPromoFromUrl(null);
        }
        
        // Case 2: Special offer ID in URL 
        else if (offerFromUrl) {
          const offer = await SpecialOfferService.getOfferById(offerFromUrl);
          
          if (offer && offer.promoCode) {
            await onApplyPromoCode(offer.promoCode);
            
            toast({
              title: 'Special Offer Applied',
              description: `${offer.title} has been automatically applied.`,
              variant: 'default',
            });
          } else {
            toast({
              title: 'Special Offer Not Found',
              description: 'The requested special offer could not be found.',
              variant: 'destructive',
            });
          }
          
          // Clear URL param without page refresh
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('offer');
          window.history.replaceState({}, document.title, newUrl.toString());
          setOfferFromUrl(null);
        }
      } catch (error) {
        console.error('Error auto-applying promo code:', error);
        toast({
          title: 'Error',
          description: 'There was a problem applying the promotion code.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    };

    if ((promoFromUrl || offerFromUrl) && !isProcessing) {
      applyCodeFromUrl();
    }
  }, [promoFromUrl, offerFromUrl, onApplyPromoCode, toast, isProcessing]);

  return {
    promoFromUrl,
    offerFromUrl,
    isProcessing
  };
};

export default useAutoApplyCode;