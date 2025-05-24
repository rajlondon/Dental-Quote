// Comprehensive quote data types for patient-clinic communication

export interface PatientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  country: string;
  city: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  previousDentalWork?: string;
  concerns?: string;
  expectations?: string;
}

export interface ToothCondition {
  toothNumber: string;
  condition: string;
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface DentalChartData {
  selectedConditions: ToothCondition[];
  overallOralHealth?: string;
  painLevel?: number;
  lastDentalVisit?: string;
  xrayAvailable?: boolean;
  ctScanAvailable?: boolean;
}

export interface TreatmentItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  priceGBP: number;
  priceUSD: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee?: string;
  ukPriceGBP?: number;
  ukPriceUSD?: number;
  fromPackage?: boolean;
  clinicSpecific?: boolean;
}

export interface PromoCodeData {
  code: string;
  type: 'discount' | 'package' | 'service';
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  title?: string;
  description?: string;
  clinicId?: string;
  benefits?: Array<{
    type: string;
    description: string;
    value: string;
    details: string;
  }>;
  expiryDate?: string;
  isActive?: boolean;
}

export interface ClinicSelection {
  clinicId: string;
  clinicName: string;
  estimatedTotal: number;
  currency: 'GBP' | 'USD';
  priceBreakdown: TreatmentItem[];
  includedServices?: string[];
  accommodationIncluded?: boolean;
  transferIncluded?: boolean;
}

export interface QuoteData {
  id: string;
  patientInfo: PatientInfo;
  dentalChart: DentalChartData;
  treatments: TreatmentItem[];
  promoCode?: PromoCodeData;
  selectedClinic?: ClinicSelection;
  totalEstimate: {
    gbp: number;
    usd: number;
    originalGbp?: number; // UK prices for comparison
    originalUsd?: number;
    savings?: number;
  };
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'quoted' | 'booked';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  clinicReviewedAt?: string;
  finalQuoteProvidedAt?: string;
  notes?: string;
  clinicNotes?: string;
  requiredDocuments?: string[];
  uploadedDocuments?: string[];
}

export interface QuoteSubmission {
  quoteData: QuoteData;
  attachments?: File[];
  urgency?: 'low' | 'medium' | 'high';
  preferredContactMethod?: 'email' | 'phone' | 'whatsapp';
  availableForConsultation?: string[]; // Available dates/times
}