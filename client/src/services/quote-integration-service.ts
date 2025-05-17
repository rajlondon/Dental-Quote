/**
 * Quote Integration Service
 * 
 * This service handles communication between the React components and the 
 * Flask-based Quote System backend. It transforms API responses into
 * strongly-typed objects and provides methods for all quote-related operations.
 */

// Base URL for the Flask API
const FLASK_API_BASE_URL = 'http://localhost:5001/api';

export interface Treatment {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export interface QuoteData {
  id: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  patient_id?: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  patient_notes?: string;
  clinic_id?: string;
  clinic_name?: string;
  promo_code?: string;
  discount_percent?: number;
  subtotal?: number;
  discount_amount?: number;
  total?: number;
  treatments?: Treatment[];
}

// Utility function to fetch data from the API
async function apiRequest(endpoint: string, method = 'GET', data?: any) {
  const url = `${FLASK_API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // This ensures cookies are sent with the request
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }
  
  // Only try to parse JSON if the response has content
  if (response.status !== 204) {
    return response.json();
  }
  
  return null;
}

// Main service object with methods for interacting with the quote system
export const quoteIntegrationService = {
  // Admin Portal Methods
  async getAdminQuotes(): Promise<QuoteData[]> {
    const data = await apiRequest('/integration/admin/quotes');
    return data.quotes || [];
  },
  
  async getAdminQuote(quoteId: string): Promise<QuoteData> {
    const data = await apiRequest(`/integration/admin/quotes/${quoteId}`);
    return data.quote;
  },
  
  async assignQuote(quoteId: string, clinicId: string): Promise<void> {
    await apiRequest(`/integration/admin/quotes/${quoteId}/assign`, 'POST', { clinic_id: clinicId });
  },
  
  async unassignQuote(quoteId: string): Promise<void> {
    await apiRequest(`/integration/admin/quotes/${quoteId}/unassign`, 'POST');
  },
  
  // Clinic Portal Methods
  async getClinicQuotes(clinicId: string): Promise<QuoteData[]> {
    const data = await apiRequest(`/integration/clinic/${clinicId}/quotes`);
    return data.quotes || [];
  },
  
  async getClinicQuote(clinicId: string, quoteId: string): Promise<QuoteData> {
    const data = await apiRequest(`/integration/clinic/${clinicId}/quotes/${quoteId}`);
    return data.quote;
  },
  
  // Patient Portal Methods
  async getPatientQuotes(patientId: string): Promise<QuoteData[]> {
    const data = await apiRequest(`/integration/patient/${patientId}/quotes`);
    return data.quotes || [];
  },
  
  async getPatientQuote(patientId: string, quoteId: string): Promise<QuoteData> {
    const data = await apiRequest(`/integration/patient/${patientId}/quotes/${quoteId}`);
    return data.quote;
  },
  
  // Generic Quote Actions
  async updateQuoteStatus(quoteId: string, status: string): Promise<void> {
    await apiRequest(`/integration/quotes/${quoteId}/status`, 'PUT', { status });
  },
  
  async sendQuoteEmail(quoteId: string, email: string): Promise<void> {
    await apiRequest(`/integration/quotes/${quoteId}/email`, 'POST', { email });
  },
  
  async downloadQuotePdf(quoteId: string): Promise<Blob> {
    const url = `${FLASK_API_BASE_URL}/integration/quotes/${quoteId}/pdf`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  },
  
  async requestAppointment(quoteId: string): Promise<void> {
    await apiRequest(`/integration/quotes/${quoteId}/appointment`, 'POST');
  },
  
  // Treatment Management
  async updateTreatmentQuantity(quoteId: string, treatmentId: string, quantity: number): Promise<void> {
    await apiRequest(`/integration/quotes/${quoteId}/treatments/${treatmentId}`, 'PUT', { quantity });
  },
  
  async removeTreatment(quoteId: string, treatmentId: string): Promise<void> {
    await apiRequest(`/integration/quotes/${quoteId}/treatments/${treatmentId}`, 'DELETE');
  },
  
  // Promo Code Management
  async applyPromoCode(quoteId: string, promoCode: string): Promise<QuoteData> {
    const data = await apiRequest(`/integration/quotes/${quoteId}/promo-code`, 'POST', { promo_code: promoCode });
    return data.quote;
  },
  
  async removePromoCode(quoteId: string): Promise<QuoteData> {
    const data = await apiRequest(`/integration/quotes/${quoteId}/promo-code`, 'DELETE');
    return data.quote;
  },
};