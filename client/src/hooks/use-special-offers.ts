import { useContext } from 'react';
import { SpecialOffersContext } from '@/components/SpecialOffersProvider';

/**
 * Hook to access special offers and treatment packages functionality
 * Use this hook to get applicable offers, calculate discounts, and manage
 * special offer selection in the quote and treatment flow.
 * 
 * @example
 * ```tsx
 * const { 
 *   offers,
 *   getApplicableOffers,
 *   applyOfferToTreatment
 * } = useSpecialOffers();
 * 
 * // Get offers applicable to a specific treatment at a clinic
 * const applicableOffers = getApplicableOffers(treatmentId, clinicId);
 * 
 * // Calculate the discount amount when applying an offer
 * const discountAmount = applyOfferToTreatment(treatmentId, offerId);
 * ```
 */
export const useSpecialOffers = () => {
  const context = useContext(SpecialOffersContext);
  
  if (!context) {
    throw new Error('useSpecialOffers must be used within a SpecialOffersProvider');
  }
  
  return context;
};

export default useSpecialOffers;