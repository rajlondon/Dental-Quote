// server/models/promo-code.ts

export interface PackageTreatment {
  id: string;
  name: string;
  quantity: number;
}

export interface TouristAttraction {
  name: string;
  description: string;
  value: number;
  included: boolean;
}

export interface PackageData {
  name: string;
  description: string;
  treatments: PackageTreatment[];
  originalPrice: number;
  packagePrice: number;
  attractions?: TouristAttraction[];
  additionalServices?: string[];
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'discount' | 'package'; // New field to differentiate between discount and package codes
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  packageData?: PackageData; // Only used for package type codes
  clinicId?: string; // For clinic-specific codes
  isActive: boolean;
  expiresAt?: Date;
}