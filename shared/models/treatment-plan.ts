/**
 * Treatment Plan Data Models
 * These are the models for treatment plans in the MyDentalFly platform
 */

export interface TreatmentItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  clinicPrice?: number; // The price for the clinic (may be different from patient price)
}

export interface TreatmentPlan {
  id: number;
  patientId: number;
  patientName?: string; // Derived from patient relationship
  clinicId?: number;
  clinicName?: string; // Derived from clinic relationship
  createdById?: number;
  creatorName?: string; // Derived from createdBy relationship
  status: string;  // draft, finalized, in_treatment, completed
  portalStatus?: string; // active, in_progress, completed
  treatmentDetails: any; // JSON array of selected treatments
  estimatedTotalCost?: string;
  currency: string;
  includesHotel?: boolean;
  hotelDetails?: any; // JSON object with hotel info
  notes?: string;
  quoteRequestId?: number;
  createdAt: string;
  updatedAt: string;
}

export enum TreatmentPlanStatus {
  DRAFT = "Draft",
  SENT = "Sent",
  ACCEPTED = "Accepted",
  REJECTED = "Rejected",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled"
}

export enum PaymentStatus {
  PENDING = "Pending",
  PARTIAL = "Partial",
  PAID = "Paid",
  REFUNDED = "Refunded"
}

export interface CreateTreatmentPlanDto {
  patientId: number;
  clinicId?: number;
  createdById?: number;
  status?: string;
  treatmentDetails: any; // JSON array of selected treatments
  estimatedTotalCost?: string;
  currency?: string;
  includesHotel?: boolean;
  hotelDetails?: any; // JSON object with hotel info
  notes?: string;
  quoteRequestId?: number;
  portalStatus?: string;
}

export interface UpdateTreatmentPlanDto {
  id?: number;
  patientId?: number;
  clinicId?: number;
  status?: string;
  treatmentDetails?: any; // JSON array of selected treatments
  estimatedTotalCost?: string;
  currency?: string;
  includesHotel?: boolean;
  hotelDetails?: any; // JSON object with hotel info
  notes?: string;
  quoteRequestId?: number;
  portalStatus?: string;
}