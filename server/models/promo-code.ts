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

// Status enum for promo codes in the approval workflow
export type PromoCodeStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'EXPIRED';

export interface PromoCode {
  id: string;
  code: string;
  title?: string;
  description?: string;
  type: 'discount' | 'package';
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  packageData?: PackageData; // Only used for package type codes
  clinicId?: string; // For clinic-specific codes
  isActive: boolean;
  expiresAt?: Date;
  applicable_treatments?: string[];
  start_date?: string;
  end_date?: string;
  max_uses?: number;
}

// Extended interface for clinic-initiated promotions
export interface ExtendedPromoCode extends PromoCode {
  // Basic promotion details
  title: string;
  description: string;
  applicable_treatments: string[];
  start_date: string;
  end_date: string;
  max_uses: number;
  
  // Approval workflow fields
  status: PromoCodeStatus;
  created_by: string; // Clinic user ID
  created_at: string;
  submitted_at?: string;
  reviewed_by?: string; // Admin user ID
  reviewed_at?: string;
  rejection_reason?: string;
  approval_notes?: string;
  version: number;
  
  // Homepage display fields
  display_on_homepage: boolean;
  homepage_priority: number; // For ordering promotions on homepage
  homepage_image_url?: string; // Banner image for homepage
  homepage_short_description?: string; // Short teaser text
  
  // Admin scheduling fields
  admin_modified_dates: boolean; // Indicates if admin changed the dates
  original_start_date?: string; // Original date suggested by clinic
  original_end_date?: string; // Original date suggested by clinic
}

// Interface for promo code analytics
export interface PromoCodeAnalytics {
  promo_id: string;
  views: number;
  applications: number;
  completed_bookings: number;
  revenue: number;
  last_updated: string;
}