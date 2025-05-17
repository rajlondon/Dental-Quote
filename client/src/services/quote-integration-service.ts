/**
 * Quote Integration Service
 * 
 * This service provides functions to interact with the Flask backend
 * for quote management across all portals (admin, clinic, patient)
 */

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
    this.id = data.id || '';
    this.status = data.status || 'draft';
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.patient_info = data.patient_info || { name: '', email: '', phone: '', country: '' };
    this.treatments = data.treatments || [];
    this.subtotal = data.subtotal || 0;
    this.discount_amount = data.discount_amount || 0;
    this.total = data.total || 0;
    this.currency = data.currency || 'USD';
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

  // Helper getter methods for easier access to nested properties
  get patient_name(): string { return this.patient_info?.name || ''; }
  get patient_email(): string { return this.patient_info?.email || ''; }
  get patient_phone(): string { return this.patient_info?.phone || ''; }
  get patient_country(): string { return this.patient_info?.country || ''; }

  // Method to calculate the discount percentage if applicable
  getDiscountPercentage(): number {
    if (this.subtotal === 0) return 0;
    return Math.round((this.discount_amount / this.subtotal) * 100);
  }
}

class QuoteIntegrationService {
  // Base API URL for Flask integration
  private baseUrl = '/api/integration';

  // General method to handle API requests
  private async fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      if (response.headers.get('Content-Type')?.includes('application/json')) {
        return await response.json();
      }

      return response;
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ADMIN PORTAL METHODS
  
  async getAdminQuotes(): Promise<QuoteData[]> {
    const data = await this.fetchApi('/admin/quotes');
    return data.quotes.map((quote: any) => new QuoteData(quote));
  }

  async getAdminQuote(quoteId: string): Promise<QuoteData> {
    const data = await this.fetchApi(`/admin/quotes/${quoteId}`);
    return new QuoteData(data.quote);
  }

  async assignQuote(quoteId: string, clinicId: string): Promise<any> {
    return this.fetchApi(`/admin/quotes/${quoteId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ clinic_id: clinicId }),
    });
  }

  async unassignQuote(quoteId: string): Promise<any> {
    return this.fetchApi(`/admin/quotes/${quoteId}/unassign`, {
      method: 'POST',
    });
  }

  // CLINIC PORTAL METHODS
  
  async getClinicQuotes(clinicId: string): Promise<QuoteData[]> {
    const data = await this.fetchApi(`/clinic/${clinicId}/quotes`);
    return data.quotes.map((quote: any) => new QuoteData(quote));
  }

  async getClinicQuote(clinicId: string, quoteId: string): Promise<QuoteData> {
    const data = await this.fetchApi(`/clinic/${clinicId}/quotes/${quoteId}`);
    return new QuoteData(data.quote);
  }

  // PATIENT PORTAL METHODS
  
  async getPatientQuotes(patientId: string): Promise<QuoteData[]> {
    const data = await this.fetchApi(`/patient/${patientId}/quotes`);
    return data.quotes.map((quote: any) => new QuoteData(quote));
  }

  async getPatientQuote(patientId: string, quoteId: string): Promise<QuoteData> {
    const data = await this.fetchApi(`/patient/${patientId}/quotes/${quoteId}`);
    return new QuoteData(data.quote);
  }

  // SHARED METHODS
  
  async updateQuoteStatus(quoteId: string, status: string): Promise<any> {
    return this.fetchApi(`/quotes/${quoteId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  async sendQuoteEmail(quoteId: string, email: string): Promise<any> {
    return this.fetchApi(`/quotes/${quoteId}/send-email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async requestAppointment(quoteId: string): Promise<any> {
    return this.fetchApi(`/quotes/${quoteId}/request-appointment`, {
      method: 'POST',
    });
  }

  async downloadQuotePdf(quoteId: string): Promise<Blob> {
    const response = await this.fetchApi(`/quotes/${quoteId}/pdf`, {
      method: 'GET',
    });
    return await response.blob();
  }

  async updateTreatmentQuantity(quoteId: string, treatmentId: string, quantity: number): Promise<any> {
    return this.fetchApi(`/quotes/${quoteId}/treatments/${treatmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeTreatment(quoteId: string, treatmentId: string): Promise<any> {
    return this.fetchApi(`/quotes/${quoteId}/treatments/${treatmentId}`, {
      method: 'DELETE',
    });
  }
}

export const quoteIntegrationService = new QuoteIntegrationService();