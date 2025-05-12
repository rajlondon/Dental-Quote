/**
 * Treatment Plan Model
 * 
 * This model defines the data structure for treatment plans,
 * which are a consolidated version of quotes, packages, and special offers
 * with additional metadata and planning information.
 */

export interface TreatmentItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  categoryId?: string;
  categoryName?: string;
  notes?: string;
  customTreatment?: boolean;
  
  // Special offer related fields
  isBonus?: boolean;           // Indicates if this is a bonus/free item tied to an offer
  isRequired?: boolean;        // Indicates if this item is required for special offer validity
  originalPrice?: number;      // Original price before discount (if this is a discounted item)
  canEdit?: boolean;           // Whether quantities can be changed
  canRemove?: boolean;         // Whether this treatment can be removed
  
  // Educational content
  educationalContent?: {
    description?: string;      // Detailed treatment description
    ukComparisonPrice?: number; // Price comparison with UK
    benefitsList?: string[];   // List of benefits
    procedureSteps?: string[]; // Step-by-step procedure description
    videoUrl?: string;         // URL to educational video
    imageUrl?: string;         // URL to educational image/diagram
    learnMoreUrl?: string;     // URL to a detailed educational page
  };
}

export interface TreatmentPlan {
  id: string;
  patientId?: string | null;
  clinicId?: string | null;
  createdBy?: string | null;
  title: string;
  description?: string;
  status: TreatmentPlanStatus;
  createdAt: string;
  updatedAt: string;
  dueDate?: string | null;
  treatments: TreatmentItem[];
  totalPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  finalPrice: number;
  paymentStatus: PaymentStatus;
  attachments?: Attachment[];
  sourceType: 'QUOTE' | 'PACKAGE' | 'SPECIAL_OFFER' | 'CUSTOM';
  sourceId?: string | null;
  
  // Special offer related fields
  offerId?: string;               // ID of the special offer if this plan was created from an offer
  offerType?: string;             // Type of offer (SPECIAL_OFFER, TREATMENT_PACKAGE, BONUS)
  offerTitle?: string;            // Title of the original offer
  offerImageUrl?: string;         // Image URL of the original offer
  offerValidUntil?: string;       // Expiration date of the offer
  
  metadata?: Record<string, any>;
  clientNotes?: string;
  clinicNotes?: string;
  adminNotes?: string;
  patientName?: string;           // Added for convenience in displays
  clinicName?: string;            // Added for convenience in displays
}

export enum TreatmentPlanStatus {
  DRAFT = 'DRAFT',
  PROPOSED = 'PROPOSED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  DEPOSIT_PAID = 'DEPOSIT_PAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED'
}

export interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy?: string;
  url: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

export interface TreatmentPlanFilters {
  patientId?: string;
  clinicId?: string;
  status?: TreatmentPlanStatus | TreatmentPlanStatus[];
  dateFrom?: string;
  dateTo?: string;
  paymentStatus?: PaymentStatus | PaymentStatus[];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PlanConversionOptions {
  includeAttachments?: boolean;
  preserveNotes?: boolean;
  preserveMetadata?: boolean;
  autoAssignClinic?: boolean;
}

export interface CreateTreatmentPlanRequest {
  patientId?: string;
  clinicId?: string;
  title: string;
  description?: string;
  treatments: Omit<TreatmentItem, 'id'>[];
  discountPercentage?: number;
  sourceType?: 'QUOTE' | 'PACKAGE' | 'SPECIAL_OFFER' | 'CUSTOM';
  sourceId?: string;
  
  // Special offer related fields
  offerId?: string;
  offerType?: string;
  offerTitle?: string;
  offerImageUrl?: string;
  offerValidUntil?: string;
  
  clientNotes?: string;
  clinicNotes?: string;
  adminNotes?: string;
  dueDate?: string;
  patientName?: string;
  clinicName?: string;
}

export interface UpdateTreatmentPlanRequest {
  id: string;
  title?: string;
  description?: string;
  status?: TreatmentPlanStatus;
  treatments?: Partial<TreatmentItem>[];
  discountPercentage?: number;
  clientNotes?: string;
  clinicNotes?: string;
  adminNotes?: string;
  dueDate?: string;
}

export interface TreatmentPlanResponse {
  success: boolean;
  message?: string;
  data?: TreatmentPlan;
}

export interface TreatmentPlansListResponse {
  success: boolean;
  message?: string;
  data?: {
    plans: TreatmentPlan[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}