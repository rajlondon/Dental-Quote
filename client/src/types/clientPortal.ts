export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Booking {
  id: number;
  userId: number;
  clinicId: string;
  treatmentPlan: TreatmentPlan;
  status: BookingStatus;
  depositPaid: boolean;
  depositAmount: number;
  depositPaidAt?: string;
  travelInfo?: TravelInfo;
  createdAt: string;
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'in_consultation' 
  | 'treatment_scheduled' 
  | 'treatment_in_progress' 
  | 'treatment_completed' 
  | 'aftercare' 
  | 'cancelled';

export interface TreatmentPlanVersion {
  versionNumber: number;
  timestamp: string;
  editedBy: string;
  editedById: number;
  editedByRole: 'patient' | 'clinic' | 'admin';
  changes: string; // Description of changes made
  previousTreatmentPlan?: Partial<TreatmentPlan>; // Reference to previous version for comparison
}

export interface TreatmentPlan {
  items: TreatmentItem[];
  totalGBP: number;
  totalUSD: number;
  totalHomeCountryGBP?: number; // Total price in home country
  homeCountry?: 'UK' | 'Germany' | 'France' | 'Netherlands' | 'Italy' | 'Spain'; // Patient's home country
  totalSavingsGBP?: number; // Total savings compared to home country
  totalSavingsPercentage?: number; // Percentage saved
  notes?: string;
  guaranteeDetails?: string;
  version: number;
  versionHistory?: TreatmentPlanVersion[];
  lastUpdated: string;
  lastEditedBy?: string;
  lastEditedById?: number;
  lastEditedByRole?: 'patient' | 'clinic' | 'admin';
  approvedByPatient: boolean;
  approvedByClinic: boolean;
}

export interface TreatmentItem {
  id: string;
  treatment: string;
  priceGBP: number;
  priceUSD: number;
  homeCountryPriceGBP?: number; // Price in home country for comparison
  quantity: number;
  subtotalGBP: number;
  subtotalUSD: number;
  homeCountrySubtotalGBP?: number; // Subtotal in home country currency
  savingsGBP?: number; // Amount saved per item
  savingsPercentage?: number; // Percentage saved per item
  guarantee: string;
}

export interface TravelInfo {
  departureCity: string;
  arrivalCity: string;
  travelMonth?: string;
  outboundDate?: string;
  returnDate?: string;
  flightDetails?: string;
  hotelName?: string;
  hotelAddress?: string;
  transfersArranged: boolean;
}

export interface Message {
  id: number;
  bookingId: number;
  senderId: number;
  senderType: 'patient' | 'clinic' | 'admin';
  content: string;
  attachments?: Attachment[];
  readAt?: string;
  createdAt: string;
}

export interface Attachment {
  id: number;
  messageId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  createdAt: string;
}

export interface Appointment {
  id: number;
  bookingId: number;
  appointmentType: 'consultation' | 'treatment' | 'follow_up';
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number; // In minutes
  location: string;
  status: 'proposed' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Document {
  id: number;
  bookingId: number;
  uploaderId: number;
  uploaderType: 'patient' | 'clinic' | 'admin';
  documentType: 'x_ray' | 'ct_scan' | 'treatment_plan' | 'medical_history' | 'other';
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  notes?: string;
  createdAt: string;
}

export interface SupportRequest {
  id: number;
  userId: number;
  bookingId?: number;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: number;
  createdAt: string;
  resolvedAt?: string;
}