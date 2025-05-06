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
  metadata?: Record<string, any>;
  clientNotes?: string;
  clinicNotes?: string;
  adminNotes?: string;
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
  clientNotes?: string;
  clinicNotes?: string;
  adminNotes?: string;
  dueDate?: string;
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