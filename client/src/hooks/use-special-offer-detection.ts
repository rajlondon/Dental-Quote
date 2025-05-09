import { useState, useEffect } from 'react';

// Custom hook to parse search params from the URL
const useSearchParams = () => {
  const getParams = () => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  };
  
  const [searchParams] = useState(getParams());
  
  return [searchParams];
};

// Define special offer data interface for better type safety
interface SpecialOfferData {
  id: string;
  clinicId: string;
  title: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed_amount';
  description?: string;
}

interface UseSpecialOfferDetectionProps {
  source?: string;
  setSource?: (source: string) => void;
  promoId?: string;
  setPromoId?: (id: string) => void;
  clinicId?: string;
  setClinicId?: (id: string) => void;
  isPromoFlow?: boolean;
}

export function useSpecialOfferDetection({
  source,
  setSource,
  promoId,
  setPromoId,
  clinicId,
  setClinicId,
  isPromoFlow
}: UseSpecialOfferDetectionProps = {}) {
  const [searchParams] = useSearchParams();
  const [offerData, setOfferData] = useState<SpecialOfferData | null>(null);

  // Run this effect once on component mount
  useEffect(() => {
    console.log("Initializing special offer data from all possible sources");
    
    // First check URL parameters for promoId and offer JSON params
    const promoIdFromUrl = searchParams.get('promoId');
    const offerJsonFromUrl = searchParams.get('offer');
    
    console.log("Special offer info from URL:", {
      promoId: promoIdFromUrl,
      offerJsonExists: !!offerJsonFromUrl,
      clinicId: searchParams.get('clinicId'),
      source: searchParams.get('source')
    });
    
    // Try to read offer from special "offer" JSON parameter first
    if (offerJsonFromUrl) {
      try {
        // The 'offer' parameter contains a JSON string with complete offer details
        const offerInfo = JSON.parse(decodeURIComponent(offerJsonFromUrl));
        console.log("Successfully parsed offer JSON from URL param:", offerInfo);
        
        // Save it to multiple storages for maximum availability
        sessionStorage.setItem('activeSpecialOffer', JSON.stringify(offerInfo));
        sessionStorage.setItem('pendingSpecialOffer', JSON.stringify(offerInfo));
        localStorage.setItem('selectedSpecialOffer', JSON.stringify(offerInfo));
        
        setOfferData(offerInfo);
        return;
      } catch (error) {
        console.error("Error parsing offer JSON from URL:", error);
      }
    }
    
    // If there's a promo ID in the URL parameters, create an offer object
    if (promoIdFromUrl) {
      console.log("Promo parameters found in URL parameters:");
      console.log("- Promo ID:", promoIdFromUrl);
      console.log("- Clinic ID:", searchParams.get('clinicId'));
      console.log("- Promo Title:", searchParams.get('promoTitle'));
      
      const offerInfo = {
        id: promoIdFromUrl,
        clinicId: searchParams.get('clinicId') || '',
        title: searchParams.get('promoTitle') || 'Special Offer',
        discountValue: parseFloat(searchParams.get('discountValue') || '0'),
        discountType: (searchParams.get('discountType') as 'percentage' | 'fixed_amount') || 'percentage'
      };
      
      console.log("Created offer data from URL params:", offerInfo);
      
      // Save to multiple storage locations for redundancy
      sessionStorage.setItem('activeSpecialOffer', JSON.stringify(offerInfo));
      localStorage.setItem('selectedSpecialOffer', JSON.stringify(offerInfo));
      
      setOfferData(offerInfo);
      return;
    }
    
    // If not in URL, check localStorage first (most recent)
    const storedOfferLS = localStorage.getItem('selectedSpecialOffer');
    if (storedOfferLS) {
      try {
        const offerInfo = JSON.parse(storedOfferLS);
        console.log("Retrieved offer from localStorage:", offerInfo);
        
        // Sync it to sessionStorage as well
        sessionStorage.setItem('activeSpecialOffer', JSON.stringify(offerInfo));
        
        setOfferData(offerInfo);
        return;
      } catch (error) {
        console.error("Error parsing offer from localStorage:", error);
      }
    }
    
    // Then check sessionStorage
    const storedOffer = sessionStorage.getItem('activeSpecialOffer');
    if (storedOffer) {
      try {
        const offerInfo = JSON.parse(storedOffer);
        console.log("Retrieved offer from sessionStorage:", offerInfo);
        setOfferData(offerInfo);
        return;
      } catch (error) {
        console.error("Error parsing offer from sessionStorage:", error);
      }
    }
    
    // Also check for pendingOffer which may happen when redirected after login
    const pendingOfferData = sessionStorage.getItem('pendingSpecialOffer');
    if (pendingOfferData) {
      try {
        const offerInfo = JSON.parse(pendingOfferData);
        console.log("Found pendingSpecialOffer in sessionStorage:", offerInfo);
        
        // Convert to the right format
        const formattedOffer = {
          id: offerInfo.id,
          title: offerInfo.title || offerInfo.name || 'Special Offer',
          clinicId: offerInfo.clinicId || '',
          discountValue: offerInfo.discountValue || 0,
          discountType: offerInfo.discountType || 'percentage'
        };
        
        // Store it to other locations but don't remove yet
        sessionStorage.setItem('activeSpecialOffer', JSON.stringify(formattedOffer));
        localStorage.setItem('selectedSpecialOffer', JSON.stringify(formattedOffer));
        
        console.log("Converted pendingSpecialOffer to activeSpecialOffer:", formattedOffer);
        setOfferData(formattedOffer);
        return;
      } catch (error) {
        console.error("Error parsing pendingSpecialOffer from sessionStorage:", error);
      }
    }
    
    // If we've reached here, we don't have offer data
    console.log("No special offer data found in any source");
    
  }, [
    searchParams, 
    source, 
    promoId, 
    clinicId, 
    isPromoFlow,
    setSource,
    setPromoId,
    setClinicId
  ]);

  return { offerData, setOfferData };
}