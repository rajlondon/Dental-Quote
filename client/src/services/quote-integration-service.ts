/**
 * Quote Integration Service
 * 
 * This service provides functions to interact with the Flask backend
 * for quote management across all portals (admin, clinic, patient)
 */
import { apiRequest } from '@/lib/queryClient';

// Types
export interface Treatment {
  id: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  clinic_ref_code?: string;
}

export interface PatientInfo {
  name: string;
  email: string;
  phone: string;
  country: string;
}

export class QuoteData {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  patient_info: PatientInfo;
  treatments: Treatment[];
  subtotal: number;
  discount_amount: number;
  total: number;
  currency: string;
  promo_code?: string;
  clinic_id?: string;
  clinic_name?: string;
  clinic_logo?: string;
  clinic_description?: string;
  clinic_location?: string;
  clinic_website?: string;
  special_offer_id?: string;
  special_offer_name?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  notes?: string;
  preferred_dates?: string[];
  preferred_contact_method?: string;
  
  constructor(data: any) {
    this.id = data.id;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.patient_info = data.patient_info;
    this.treatments = data.treatments;
    this.subtotal = data.subtotal;
    this.discount_amount = data.discount_amount;
    this.total = data.total;
    this.currency = data.currency;
    this.promo_code = data.promo_code;
    this.clinic_id = data.clinic_id;
    this.clinic_name = data.clinic_name;
    this.clinic_logo = data.clinic_logo;
    this.clinic_description = data.clinic_description;
    this.clinic_location = data.clinic_location;
    this.clinic_website = data.clinic_website;
    this.special_offer_id = data.special_offer_id;
    this.special_offer_name = data.special_offer_name;
    this.assigned_to = data.assigned_to;
    this.assigned_to_name = data.assigned_to_name;
    this.notes = data.notes;
    this.preferred_dates = data.preferred_dates;
    this.preferred_contact_method = data.preferred_contact_method;
  }
  
  // Convenience properties to access patient_info fields directly
  get patient_name(): string { return this.patient_info?.name || ''; }
  get patient_email(): string { return this.patient_info?.email || ''; }
  get patient_phone(): string { return this.patient_info?.phone || ''; }
  get patient_country(): string { return this.patient_info?.country || ''; }
}

class QuoteIntegrationService {
  // Admin Portal Functions
  async getAdminQuotes(): Promise<QuoteData[]> {
    const response = await apiRequest('GET', '/api/integration/admin/quotes');
    const data = await response.json();
    return data.map((quote: any) => new QuoteData(quote));
  }

  async getAdminQuote(quoteId: string): Promise<QuoteData> {
    const response = await apiRequest('GET', `/api/integration/admin/quote/${quoteId}`);
    const data = await response.json();
    return new QuoteData(data);
  }

  async assignQuote(quoteId: string, clinicId: string): Promise<any> {
    const response = await apiRequest('POST', `/api/integration/admin/quote/${quoteId}/assign`, { clinic_id: clinicId });
    return response.json();
  }

  async unassignQuote(quoteId: string): Promise<any> {
    const response = await apiRequest('POST', `/api/integration/admin/quote/${quoteId}/unassign`);
    return response.json();
  }

  // Clinic Portal Functions
  async getClinicQuotes(clinicId: string): Promise<QuoteData[]> {
    const response = await apiRequest('GET', `/api/integration/clinic/${clinicId}/quotes`);
    return response.json();
  }

  async getClinicQuote(clinicId: string, quoteId: string): Promise<QuoteData> {
    const response = await apiRequest('GET', `/api/integration/clinic/${clinicId}/quote/${quoteId}`);
    return response.json();
  }

  // Patient Portal Functions
  async getPatientQuotes(patientId: string): Promise<QuoteData[]> {
    const response = await apiRequest('GET', `/api/integration/patient/${patientId}/quotes`);
    return response.json();
  }

  async getPatientQuote(patientId: string, quoteId: string): Promise<QuoteData> {
    const response = await apiRequest('GET', `/api/integration/patient/${patientId}/quote/${quoteId}`);
    return response.json();
  }

  // Common Functions
  async updateQuoteStatus(quoteId: string, status: string): Promise<any> {
    const response = await apiRequest('POST', `/api/integration/quote/${quoteId}/status`, { status });
    return response.json();
  }

  async sendQuoteEmail(quoteId: string, email: string): Promise<any> {
    const response = await apiRequest('POST', `/api/integration/quote/${quoteId}/email`, { email });
    return response.json();
  }

  async requestAppointment(quoteId: string): Promise<any> {
    const response = await apiRequest('POST', `/api/integration/quote/${quoteId}/request-appointment`);
    return response.json();
  }

  async downloadQuotePdf(quoteId: string): Promise<Blob> {
    const response = await apiRequest('GET', `/api/integration/quote/${quoteId}/pdf`);
    return response.blob();
  }

  async updateTreatmentQuantity(quoteId: string, treatmentId: string, quantity: number): Promise<any> {
    const response = await apiRequest('POST', `/api/integration/quote/${quoteId}/treatment/${treatmentId}`, { quantity });
    return response.json();
  }

  async removeTreatment(quoteId: string, treatmentId: string): Promise<any> {
    const response = await apiRequest('DELETE', `/api/integration/quote/${quoteId}/treatment/${treatmentId}`);
    return response.json();
  }
}

export const quoteIntegrationService = new QuoteIntegrationService();