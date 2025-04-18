// Type definitions for the dental treatment mapper functionality

/**
 * A variant of a treatment as offered by a specific clinic
 */
export interface ClinicTreatmentVariant {
  clinic_id: string;
  label: string;
  price: string;
  includes: string[];
  optional_addons?: string[];
  note?: string;
}

/**
 * A treatment definition with category and clinic-specific variants
 */
export interface Treatment {
  category: string;
  clinic_variants: ClinicTreatmentVariant[];
}

/**
 * The complete treatment map indexed by treatment name
 */
export interface TreatmentMap {
  [treatmentName: string]: Treatment;
}

/**
 * Clinic information
 */
export interface Clinic {
  id: string;
  name: string;
  location: string;
  description: string;
  features: {
    [featureName: string]: boolean;
  };
}

/**
 * Clinic feature definition for comparison
 */
export interface ClinicFeature {
  id: string;
  name: string;
  description: string;
}

/**
 * Treatment comparison result
 */
export interface TreatmentComparisonResult {
  treatmentName: string;
  clinicVariants: (ClinicTreatmentVariant | null)[];
}

/**
 * Selected treatments mapped for a specific clinic
 */
export interface MappedTreatment {
  treatmentName: string;
  variant: ClinicTreatmentVariant;
  quantity: number;
}

/**
 * Treatment item for patient treatment plan
 */
export interface TreatmentItem {
  treatmentName: string;
  variantLabel: string;
  price: string;
  quantity: number;
  includedItems: string[];
  addOns?: string[];
  note?: string;
}

/**
 * Price breakdown for treatment quote
 */
export interface PriceBreakdown {
  subtotal: number;
  discounts: number;
  taxAmount: number;
  total: number;
}