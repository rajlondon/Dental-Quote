/**
 * Special Offers and Treatment Packages Model
 * 
 * This file defines the data models and types for special offers and treatment packages
 * that can be directly converted into treatment plans.
 */

export enum OfferType {
  SPECIAL_OFFER = 'SPECIAL_OFFER',  // Free item or discount on specific treatments
  TREATMENT_PACKAGE = 'TREATMENT_PACKAGE', // Bundled treatments at package price
  BONUS = 'BONUS' // Additional service like flights, hotel, etc.
}

export enum OfferStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED'
}

export interface Offer {
  id: string;
  clinicId: string;
  clinicName?: string;
  title: string;
  description: string;
  shortDescription: string;
  imageUrl?: string;
  offerType: OfferType;
  status: OfferStatus;
  
  // Treatment requirements
  requiredTreatments?: string[]; // Treatment codes required to qualify
  minTreatmentCount?: number;    // Minimum number of treatments (e.g., 6 veneers)
  
  // Pricing information
  originalPrice?: number;       // Original price before discount
  discountedPrice?: number;     // Discounted price (if applicable)
  discountPercentage?: number;  // Discount percentage (if applicable)
  isFree?: boolean;             // Whether this is completely free
  
  // Bonus item information (e.g., flights, hotel)
  bonusItem?: {
    description: string;
    value: number;
  };

  // Validity period
  validFrom: string;    // ISO date string
  validUntil: string;   // ISO date string
  
  // Treatment lines included in this offer/package
  treatmentLines: OfferTreatmentLine[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface OfferTreatmentLine {
  id: string;
  treatmentCode: string;
  treatmentName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountedUnitPrice?: number;
  isBonus: boolean;        // Whether this is a bonus item (cannot be removed)
  isRequired: boolean;     // Whether this is a required treatment
  imageUrl?: string;
  
  // Educational content for this treatment
  educationalContent?: {
    description: string;
    videoUrl?: string;
    imageUrl?: string;
    ukComparisonPrice?: number;
    benefitsList?: string[];
    procedureSteps?: string[];
  };
}

export interface OfferToTreatmentPlanRequest {
  offerId: string;
  clinicId: string;
  patientId?: string;
  patientEmail?: string;
  additionalNotes?: string;
  
  // Optional overrides
  customQuantities?: {
    [treatmentLineId: string]: number;
  };
}

export interface OfferToTreatmentPlanResponse {
  treatmentPlanId: string;
  offerId: string;
  clinicId: string;
  clinicName?: string;
  treatmentPlanUrl: string;
  message: string;
}