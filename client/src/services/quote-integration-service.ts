/**
 * Quote Integration Service
 * 
 * This service provides the interface for communicating with the Flask quote builder API
 * It handles all the data fetching and mutations for quotes across all portals
 */
import { apiRequest } from '@/lib/queryClient';

export interface Treatment {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  clinic_reference_code?: string;
}

export interface QuoteData {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  promo_code?: string;
  notes?: string;
  treatments: Treatment[];
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  assigned_to_name?: string;
  clinic_logo?: string;
  clinic_location?: string;
  clinic_description?: string;
  clinic_website?: string;
  preferred_dates?: string;
  preferred_contact_method?: string;
}

class QuoteIntegrationService {
  // Admin Portal Endpoints
  async getAdminQuotes(): Promise<QuoteData[]> {
    const response = await apiRequest('GET', '/api/integration/admin/quotes');
    return await response.json();
  }

  async getAdminQuote(quoteId: string): Promise<QuoteData> {
    const response = await apiRequest('GET', `/api/integration/admin/quotes/${quoteId}`);
    return await response.json();
  }

  async assignQuote(quoteId: string, clinicId: string): Promise<void> {
    await apiRequest('POST', `/api/integration/admin/quotes/${quoteId}/assign`, {
      clinic_id: clinicId
    });
  }

  async unassignQuote(quoteId: string): Promise<void> {
    await apiRequest('POST', `/api/integration/admin/quotes/${quoteId}/unassign`);
  }

  // Clinic Portal Endpoints
  async getClinicQuotes(clinicId: string): Promise<QuoteData[]> {
    const response = await apiRequest('GET', `/api/integration/clinic/${clinicId}/quotes`);
    return await response.json();
  }

  async getClinicQuote(clinicId: string, quoteId: string): Promise<QuoteData> {
    const response = await apiRequest('GET', `/api/integration/clinic/${clinicId}/quotes/${quoteId}`);
    return await response.json();
  }

  async updateQuoteStatus(quoteId: string, status: string): Promise<void> {
    await apiRequest('POST', `/api/integration/quotes/${quoteId}/status`, {
      status
    });
  }

  async sendQuoteEmail(quoteId: string, email: string): Promise<void> {
    await apiRequest('POST', `/api/integration/quotes/${quoteId}/email`, {
      email
    });
  }

  // Patient Portal Endpoints
  async getPatientQuotes(patientId: string): Promise<QuoteData[]> {
    const response = await apiRequest('GET', `/api/integration/patient/${patientId}/quotes`);
    return await response.json();
  }

  async getPatientQuote(patientId: string, quoteId: string): Promise<QuoteData> {
    const response = await apiRequest('GET', `/api/integration/patient/${patientId}/quotes/${quoteId}`);
    return await response.json();
  }

  async requestAppointment(quoteId: string): Promise<void> {
    await apiRequest('POST', `/api/integration/quotes/${quoteId}/request-appointment`);
  }

  // Common Endpoints
  async downloadQuotePdf(quoteId: string): Promise<void> {
    // This will trigger a file download
    window.open(`/api/integration/quotes/${quoteId}/pdf`, '_blank');
  }

  async updateTreatmentQuantity(quoteId: string, treatmentId: string, quantity: number): Promise<void> {
    await apiRequest('POST', `/api/integration/quotes/${quoteId}/treatments/${treatmentId}`, {
      quantity
    });
  }

  async removeTreatment(quoteId: string, treatmentId: string): Promise<void> {
    await apiRequest('DELETE', `/api/integration/quotes/${quoteId}/treatments/${treatmentId}`);
  }
}

// Create a singleton instance
export const quoteIntegrationService = new QuoteIntegrationService();