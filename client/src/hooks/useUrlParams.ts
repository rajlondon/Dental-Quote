
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface UrlParamsConfig {
  form: UseFormReturn<any>;
  onParamsLoaded?: (params: URLSearchParams) => void;
}

export const useUrlParams = ({ form, onParamsLoaded }: UrlParamsConfig) => {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    
    const departureCity = searchParams.get('departureCity');
    const travelMonth = searchParams.get('travelMonth'); 
    const promoCode = searchParams.get('promo');
    const highlightTreatment = searchParams.get('highlight');

    // Pre-fill form with URL parameters
    if (departureCity) {
      form.setValue('departureCity', departureCity);
    }
    
    if (travelMonth) {
      form.setValue('travelMonth', travelMonth);
    }
    
    if (promoCode) {
      form.setValue('promoCode', promoCode);
    }

    // Call callback with all params for additional handling
    if (onParamsLoaded) {
      onParamsLoaded(searchParams);
    }

    // Scroll to treatment selection if parameters provided
    if (departureCity || travelMonth || promoCode) {
      setTimeout(() => {
        const treatmentSection = document.getElementById('treatment-selection');
        if (treatmentSection) {
          treatmentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }

  }, [form, onParamsLoaded]);

  // Return utility functions
  const searchParams = new URLSearchParams(window.location.search);
  
  return {
    hasUrlParams: () => {
      return searchParams.has('departureCity') || 
             searchParams.has('travelMonth') || 
             searchParams.has('promo');
    },
    
    getPromoCode: () => searchParams.get('promo'),
    
    getDepartureCity: () => searchParams.get('departureCity'),
    
    getTravelMonth: () => searchParams.get('travelMonth'),
    
    getHighlightTreatment: () => searchParams.get('highlight')
  };
};
