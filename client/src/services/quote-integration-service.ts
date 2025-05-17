import axios from 'axios';
import { QuoteData } from '@/hooks/use-quote-system';
import { Treatment } from '@/components/quotes/TreatmentList';

/**
 * Service class for interacting with the Flask quote integration API
 * This class provides methods for all quote-related operations
 */
export class QuoteIntegrationService {
  private portalType: 'admin' | 'clinic' | 'patient';
  private baseUrl: string;

  constructor(portalType: 'admin' | 'clinic' | 'patient') {
    this.portalType = portalType;
    this.baseUrl = '/api/integration';
  }

  /**
   * Helper method to transform API response to QuoteData
   */
  private transformQuoteData(apiQuote: any): QuoteData {
    // Map treatments from API format to our format
    const treatments: Treatment[] = (apiQuote.treatments || []).map((t: any) => ({
      id: t.id || t.treatment_id,
      name: t.name,
      description: t.description,
      category: t.category,
      price: Number(t.price) || 0,
      quantity: Number(t.quantity) || 1
    }));

    // Return transformed quote
    return {
      id: apiQuote.id || apiQuote.quote_id,
      status: apiQuote.status || 'pending',
      created_at: apiQuote.created_at || new Date().toISOString(),
      patient_id: apiQuote.patient_id,
      patient_name: apiQuote.patient_name || apiQuote.patient?.name,
      patient_email: apiQuote.patient_email || apiQuote.patient?.email,
      patient_phone: apiQuote.patient_phone || apiQuote.patient?.phone,
      clinic_id: apiQuote.clinic_id,
      clinic_name: apiQuote.clinic_name || apiQuote.clinic?.name,
      promo_code: apiQuote.promo_code,
      discount_percent: apiQuote.discount_percent ? Number(apiQuote.discount_percent) : 0,
      subtotal: Number(apiQuote.subtotal) || 0,
      discount_amount: Number(apiQuote.discount_amount) || 0,
      total: Number(apiQuote.total) || 0,
      treatments
    };
  }

  /**
   * Get all quotes for the current portal type
   */
  async getQuotes(): Promise<QuoteData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.portalType}/quotes`);
      
      if (response.data.success) {
        return (response.data.quotes || []).map((q: any) => this.transformQuoteData(q));
      } else {
        throw new Error(response.data.message || 'Failed to fetch quotes');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Server error');
      }
      throw error;
    }
  }

  /**
   * Get details for a specific quote
   */
  async getQuoteDetails(quoteId: string): Promise<QuoteData> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.portalType}/quotes/${quoteId}`);
      
      if (response.data.success) {
        return this.transformQuoteData(response.data.quote);
      } else {
        throw new Error(response.data.message || 'Failed to fetch quote details');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Server error');
      }
      throw error;
    }
  }

  /**
   * Apply a promo code to a quote
   */
  async applyPromoCode(quoteId: string, promoCode: string): Promise<QuoteData> {
    try {
      const response = await axios.post(`${this.baseUrl}/${this.portalType}/quotes/${quoteId}/apply-promo`, {
        promo_code: promoCode
      });
      
      if (response.data.success) {
        return this.transformQuoteData(response.data.quote);
      } else {
        throw new Error(response.data.message || 'Failed to apply promo code');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Server error');
      }
      throw error;
    }
  }

  /**
   * Remove a promo code from a quote
   */
  async removePromoCode(quoteId: string): Promise<QuoteData> {
    try {
      const response = await axios.post(`${this.baseUrl}/${this.portalType}/quotes/${quoteId}/remove-promo`);
      
      if (response.data.success) {
        return this.transformQuoteData(response.data.quote);
      } else {
        throw new Error(response.data.message || 'Failed to remove promo code');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Server error');
      }
      throw error;
    }
  }

  /**
   * Update treatment quantity in a quote
   */
  async updateTreatmentQuantity(quoteId: string, treatmentId: string, quantity: number): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/${this.portalType}/quotes/${quoteId}/update-quantity`, {
        treatment_id: treatmentId,
        quantity
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update treatment quantity');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Server error');
      }
      throw error;
    }
  }

  /**
   * Remove a treatment from a quote
   */
  async removeTreatment(quoteId: string, treatmentId: string): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/${this.portalType}/quotes/${quoteId}/remove-treatment`, {
        treatment_id: treatmentId
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove treatment');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Server error');
      }
      throw error;
    }
  }

  /**
   * Update quote status
   */
  async updateQuoteStatus(quoteId: string, status: string): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/${this.portalType}/quotes/${quoteId}/update-status`, {
        status
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update quote status');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Server error');
      }
      throw error;
    }
  }

  /**
   * Download quote PDF
   */
  async downloadQuotePdf(quoteId: string): Promise<void> {
    try {
      // Use window.open for direct download
      window.open(`${this.baseUrl}/${this.portalType}/quotes/${quoteId}/pdf`, '_blank');
    } catch (error: any) {
      throw new Error('Failed to download PDF: ' + error.message);
    }
  }

  /**
   * Send quote via email
   */
  async sendQuoteEmail(quoteId: string, email: string): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/${this.portalType}/quotes/${quoteId}/send-email`, {
        email
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send email');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Server error');
      }
      throw error;
    }
  }

  /**
   * Request appointment for a quote
   */
  async requestAppointment(quoteId: string): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/${this.portalType}/quotes/${quoteId}/request-appointment`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to request appointment');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Server error');
      }
      throw error;
    }
  }

  /**
   * Admin-specific: Assign a quote to a clinic
   */
  async assignQuoteToClinic(quoteId: string, clinicId: string): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/admin/quotes/${quoteId}/assign`, {
        clinic_id: clinicId
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to assign quote to clinic');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Server error');
      }
      throw error;
    }
  }

  /**
   * Admin-specific: Unassign a quote from a clinic
   */
  async unassignQuoteFromClinic(quoteId: string): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/admin/quotes/${quoteId}/unassign`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to unassign quote from clinic');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Server error');
      }
      throw error;
    }
  }
}