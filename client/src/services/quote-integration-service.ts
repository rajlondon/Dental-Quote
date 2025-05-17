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

export interface QuoteData {
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
  special_offer_id?: string;
  special_offer_name?: string;
}

class QuoteIntegrationService {
  // Admin Portal Functions
  async getAdminQuotes(): Promise<QuoteData[]> {
    const response = await apiRequest('GET', '/api/integration/admin/quotes');
    return response.json();
  }

  async getAdminQuote(quoteId: string): Promise<QuoteData> {
    const response = await apiRequest('GET', `/api/integration/admin/quote/${quoteId}`);
    return response.json();
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