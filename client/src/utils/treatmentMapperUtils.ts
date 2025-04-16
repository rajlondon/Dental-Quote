import { treatmentMapperService } from '@/services/treatmentMapperService';
import { TreatmentItem } from '@/components/TreatmentPlanBuilder';
import { ClinicTreatmentVariant } from '@shared/treatmentMapper';

/**
 * Utility functions to interact with the treatment mapper service
 * and integrate it with the quote generation process
 */

/**
 * Get clinic-specific variants for all selected treatments
 * @param treatments Selected treatments from the treatment builder
 * @param clinicId The clinic ID to get variants for
 */
export function getMappedTreatmentsForClinic(
  treatments: TreatmentItem[],
  clinicId: string
): {
  standardName: string;
  clinicVariant: ClinicTreatmentVariant | undefined;
  quantity: number;
}[] {
  return treatmentMapperService.mapUserTreatmentsToClinicVariants(treatments, clinicId);
}

/**
 * Calculate total price for all selected treatments at a clinic
 * @param mappedTreatments The mapped treatments with clinic variants
 * @returns The total price as a formatted string
 */
export function calculateTotalPriceForMappedTreatments(
  mappedTreatments: {
    standardName: string;
    clinicVariant: ClinicTreatmentVariant | undefined;
    quantity: number;
  }[]
): { totalMinPrice: number; totalMaxPrice: number; formattedPrice: string } {
  // Initialize min and max price counters
  let totalMinPrice = 0;
  let totalMaxPrice = 0;

  mappedTreatments.forEach(({ clinicVariant, quantity }) => {
    if (!clinicVariant) return;

    // Parse the price string into min/max numbers
    const priceStr = clinicVariant.price;
    
    // Handle different price formats: "£200", "£200 - £300", etc.
    if (priceStr.includes('-')) {
      // Price range format: "£200 - £300"
      const [minPriceStr, maxPriceStr] = priceStr.split('-').map(p => p.trim());
      const minPrice = parseFloat(minPriceStr.replace(/[^0-9.]/g, ''));
      const maxPrice = parseFloat(maxPriceStr.replace(/[^0-9.]/g, ''));
      
      if (!isNaN(minPrice)) totalMinPrice += minPrice * quantity;
      if (!isNaN(maxPrice)) totalMaxPrice += maxPrice * quantity;
    } else {
      // Single price format: "£200"
      const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
      if (!isNaN(price)) {
        totalMinPrice += price * quantity;
        totalMaxPrice += price * quantity;
      }
    }
  });

  // Format the result
  let formattedPrice = '';
  
  if (totalMinPrice === totalMaxPrice) {
    formattedPrice = `£${totalMinPrice.toLocaleString('en-GB')}`;
  } else {
    formattedPrice = `£${totalMinPrice.toLocaleString('en-GB')} - £${totalMaxPrice.toLocaleString('en-GB')}`;
  }

  return {
    totalMinPrice,
    totalMaxPrice,
    formattedPrice
  };
}

/**
 * Find the most competitively priced clinic for the selected treatments
 * @param treatments Selected treatments
 * @param clinicIds Array of available clinic IDs
 * @returns The ID of the most price-competitive clinic
 */
export function findMostCompetitivePricedClinic(
  treatments: TreatmentItem[],
  clinicIds: string[]
): { clinicId: string; totalPrice: number } | null {
  if (clinicIds.length === 0 || treatments.length === 0) {
    return null;
  }

  let lowestPriceClinic: string | null = null;
  let lowestPrice = Infinity;

  clinicIds.forEach(clinicId => {
    const mappedTreatments = getMappedTreatmentsForClinic(treatments, clinicId);
    const { totalMinPrice } = calculateTotalPriceForMappedTreatments(mappedTreatments);
    
    if (totalMinPrice < lowestPrice) {
      lowestPrice = totalMinPrice;
      lowestPriceClinic = clinicId;
    }
  });

  if (lowestPriceClinic === null) {
    return null;
  }

  return {
    clinicId: lowestPriceClinic,
    totalPrice: lowestPrice
  };
}