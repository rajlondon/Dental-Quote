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
  patientName: string;
  clinicId: number;
  clinicName?: string;
  status: TreatmentPlanStatus;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDuration?: string; // e.g., "3-5 days"
  treatmentItems: TreatmentItem[];
  totalPrice: number;
  currency: string;
  notes?: string;
  paymentStatus: PaymentStatus;
  appointmentDate?: string;
  completionDate?: string;
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
  title: string;
  description?: string;
  treatmentItems: {
    name: string;
    price: number;
    quantity: number;
    description?: string;
  }[];
  estimatedDuration?: string;
  notes?: string;
  currency: string;
}

export interface UpdateTreatmentPlanDto {
  id: number;
  title?: string;
  description?: string;
  status?: TreatmentPlanStatus;
  treatmentItems?: {
    id?: number;
    name: string;
    price: number;
    quantity: number;
    description?: string;
  }[];
  estimatedDuration?: string;
  notes?: string;
  appointmentDate?: string;
  completionDate?: string;
  paymentStatus?: PaymentStatus;
}