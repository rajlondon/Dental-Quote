import { User } from "./user";
import { Clinic } from "./clinic";

export type QuoteStatus = 
  | "pending" 
  | "assigned" 
  | "in_progress" 
  | "sent" 
  | "accepted" 
  | "rejected" 
  | "completed" 
  | "cancelled"
  | "expired";

export interface CreateQuoteRequest {
  name: string;
  email: string;
  phone?: string;
  treatment: string;
  specificTreatment?: string;
  consent: boolean;
  notes?: string;
  adminNotes?: string;
  budget?: number;
  travelDateRange?: string;
  patientCountry?: string;
  patientCity?: string;
  patientLanguage?: string;
}

export interface QuoteRequest {
  id: number;
  userId?: number;
  name: string;
  email: string;
  phone?: string;
  treatment: string;
  specificTreatment?: string;
  consent: boolean;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  selectedClinicId?: number;
  notes?: string;
  adminNotes?: string;
  clinicNotes?: string;
  budget?: number;
  travelDateRange?: string;
  hasXrays: boolean;
  xrayCount?: number;
  viewedByAdmin: boolean;
  viewedByClinic: boolean;
  assignedAt?: string;
  completedAt?: string;
  patientCountry?: string;
  patientCity?: string;
  patientLanguage?: string;

  // Special offer information
  specialOffer?: {
    id: string;
    title: string;
    clinicId: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    applicableTreatment: string;
    expiryDate?: string;
    terms?: string;
  };

  // Relations (populated on demand)
  user?: User;
  selectedClinic?: Clinic;
}

export interface QuoteVersion {
  id: number;
  quoteRequestId: number;
  versionNumber: number;
  createdById: number;
  createdAt: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  quoteData: QuoteData;

  // Relations (populated on demand)
  createdBy?: User;
}

export interface QuoteData {
  treatments: QuoteTreatment[];
  subtotal: number;
  discount?: number;
  discountReason?: string;
  total: number;
  currency: string;
  validUntil?: string;
  notes?: string;
  paymentTerms?: string;
  accommodationIncluded?: boolean;
  transportIncluded?: boolean;
  additionalOffers?: {
    id: number;
    name: string;
    description: string;
    price: number;
    selected?: boolean;
  }[];
  specialOffer?: {
    id: string;
    title: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    applicableTreatment: string;
    expiryDate?: string;
    terms?: string;
  };
}

export interface QuoteTreatment {
  id: number;
  treatmentName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  teethNumbers?: number[]; // For dental treatments
  category?: string;
}

export interface ClinicInfo {
  id: string;
  name: string;
  tier: "affordable" | "mid" | "premium";
  priceGBP: number;
  priceUSD: number;
  location: string;
  rating: number;
  guarantee: string;
  materials: string[];
  conciergeType: "ids" | "clinic";
  specialties?: string[];
  features: string[];
  description: string;
}