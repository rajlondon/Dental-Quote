import { 
  TreatmentMap, 
  ClinicTreatmentVariant, 
  TreatmentComparisonResult,
  MappedTreatment,
  TreatmentItem
} from "../types/treatmentMapper";

/**
 * Get all unique treatment categories from the treatment map
 */
export function getUniqueCategories(treatmentMap: TreatmentMap): string[] {
  const categories = new Set<string>();
  
  Object.values(treatmentMap).forEach(treatment => {
    categories.add(treatment.category);
  });
  
  return Array.from(categories).sort();
}

/**
 * Get all treatments in a specific category
 */
export function getTreatmentsByCategory(treatmentMap: TreatmentMap, category: string): [string, string][] {
  return Object.entries(treatmentMap)
    .filter(([_, treatment]) => treatment.category === category)
    .map(([name, _]) => [name, name]);
}

/**
 * Get all clinics that offer a specific treatment
 */
export function getClinicsForTreatment(
  treatmentMap: TreatmentMap, 
  treatmentName: string
): string[] {
  if (!treatmentMap[treatmentName]) return [];
  
  return treatmentMap[treatmentName].clinic_variants.map(variant => variant.clinic_id);
}

/**
 * Get a clinic's variant for a specific treatment
 */
export function getClinicVariantForTreatment(
  treatmentMap: TreatmentMap,
  treatmentName: string,
  clinicId: string
): ClinicTreatmentVariant | null {
  if (!treatmentMap[treatmentName]) return null;
  
  const variant = treatmentMap[treatmentName].clinic_variants.find(
    v => v.clinic_id === clinicId
  );
  
  return variant || null;
}

/**
 * Compare treatment offerings between clinics
 */
export function compareTreatmentsBetweenClinics(
  treatmentMap: TreatmentMap,
  treatmentNames: string[],
  clinicIds: string[]
): TreatmentComparisonResult[] {
  return treatmentNames.map(treatmentName => {
    const clinicVariants = clinicIds.map(clinicId => 
      getClinicVariantForTreatment(treatmentMap, treatmentName, clinicId)
    );
    
    return {
      treatmentName,
      clinicVariants
    };
  });
}

/**
 * Normalize a treatment name to ensure consistent lookup
 * across different variations of capitalization and spacing
 */
export function normalizeTreatmentName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Search for treatments matching a query
 */
export function searchTreatments(
  treatmentMap: TreatmentMap,
  query: string
): string[] {
  const normalizedQuery = normalizeTreatmentName(query);
  
  if (!normalizedQuery) return [];
  
  return Object.keys(treatmentMap).filter(treatmentName => {
    const normalizedName = normalizeTreatmentName(treatmentName);
    return normalizedName.includes(normalizedQuery);
  });
}

/**
 * Format price for consistent display
 */
export function formatPrice(price: string): string {
  // Handle price ranges (e.g., "£400 - £600")
  if (price.includes('-')) {
    const [min, max] = price.split('-').map(p => p.trim());
    return `${min} - ${max}`;
  }
  
  // Handle single prices
  return price;
}

/**
 * Get the minimum price for a treatment across all clinics
 */
export function getMinPriceForTreatment(treatmentMap: TreatmentMap, treatmentName: string): string | null {
  if (!treatmentMap[treatmentName] || !treatmentMap[treatmentName].clinic_variants.length) {
    return null;
  }
  
  const prices = treatmentMap[treatmentName].clinic_variants.map(variant => {
    // Handle price ranges (use the minimum value)
    if (variant.price.includes('-')) {
      return variant.price.split('-')[0].trim();
    }
    return variant.price;
  });
  
  // Sort prices (remove currency symbol for numeric comparison)
  const sortedPrices = prices.sort((a, b) => {
    const aNumeric = parseFloat(a.replace(/[^0-9.]/g, ''));
    const bNumeric = parseFloat(b.replace(/[^0-9.]/g, ''));
    return aNumeric - bNumeric;
  });
  
  return sortedPrices[0];
}

/**
 * Calculate total price for mapped treatments
 */
export function calculateTotalPriceForMappedTreatments(mappedTreatments: MappedTreatment[]): number {
  return mappedTreatments.reduce((total, mapped) => {
    const priceString = mapped.variant.price;
    // Handle price ranges (use the minimum value)
    let price = priceString;
    if (priceString.includes('-')) {
      price = priceString.split('-')[0].trim();
    }
    
    // Convert price to number, removing currency symbol
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    return total + (numericPrice * mapped.quantity);
  }, 0);
}

/**
 * Convert mapped treatments to treatment items for display
 */
export function convertMappedTreatmentsToTreatmentItems(mappedTreatments: MappedTreatment[]): TreatmentItem[] {
  return mappedTreatments.map(mapped => ({
    treatmentName: mapped.treatmentName,
    variantLabel: mapped.variant.label,
    price: mapped.variant.price,
    quantity: mapped.quantity,
    includedItems: mapped.variant.includes,
    addOns: mapped.variant.optional_addons,
    note: mapped.variant.note
  }));
}