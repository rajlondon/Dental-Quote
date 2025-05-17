import axios from 'axios';
import { Treatment, QuoteData } from '@/hooks/use-quote-system';

/**
 * Service for interacting with the Quote Integration API
 */
class QuoteIntegrationService {
  /**
   * Get all quotes for the current user based on portal type
   * @param portalType The portal type (patient, admin, or clinic)
   * @returns Array of quotes
   */
  async getQuotes(portalType: 'patient' | 'admin' | 'clinic'): Promise<QuoteData[]> {
    try {
      const response = await axios.get(`/api/integration/${portalType}/quotes`);
      
      if (response.data.success) {
        return this.transformQuotes(response.data.quotes);
      } else {
        throw new Error(response.data.message || 'Failed to load quotes');
      }
    } catch (error: any) {
      throw new Error(`Error loading quotes: ${error.message}`);
    }
  }

  /**
   * Get a specific quote by ID
   * @param portalType The portal type (patient, admin, or clinic)
   * @param quoteId The quote ID
   * @returns Quote data
   */
  async getQuoteById(portalType: 'patient' | 'admin' | 'clinic', quoteId: string): Promise<QuoteData> {
    try {
      const response = await axios.get(`/api/integration/${portalType}/quotes/${quoteId}`);
      
      if (response.data.success) {
        return this.transformQuote(response.data.quote);
      } else {
        throw new Error(response.data.message || 'Failed to load quote details');
      }
    } catch (error: any) {
      throw new Error(`Error loading quote details: ${error.message}`);
    }
  }

  /**
   * Apply a promo code to a quote
   * @param portalType The portal type (patient, admin, or clinic)
   * @param quoteId The quote ID
   * @param promoCode The promo code to apply
   * @returns Updated quote data
   */
  async applyPromoCode(portalType: 'patient' | 'admin' | 'clinic', quoteId: string, promoCode: string): Promise<QuoteData> {
    try {
      const response = await axios.post(`/api/integration/${portalType}/quotes/${quoteId}/apply-promo`, {
        promoCode
      });
      
      if (response.data.success) {
        return this.transformQuote(response.data.quote);
      } else {
        throw new Error(response.data.message || 'Failed to apply promo code');
      }
    } catch (error: any) {
      throw new Error(`Error applying promo code: ${error.message}`);
    }
  }

  /**
   * Remove a promo code from a quote
   * @param portalType The portal type (patient, admin, or clinic)
   * @param quoteId The quote ID
   * @returns Updated quote data
   */
  async removePromoCode(portalType: 'patient' | 'admin' | 'clinic', quoteId: string): Promise<QuoteData> {
    try {
      const response = await axios.post(`/api/integration/${portalType}/quotes/${quoteId}/remove-promo`);
      
      if (response.data.success) {
        return this.transformQuote(response.data.quote);
      } else {
        throw new Error(response.data.message || 'Failed to remove promo code');
      }
    } catch (error: any) {
      throw new Error(`Error removing promo code: ${error.message}`);
    }
  }

  /**
   * Update the quantity of a treatment in a quote
   * @param portalType The portal type (patient, admin, or clinic)
   * @param quoteId The quote ID
   * @param treatmentId The treatment ID
   * @param quantity The new quantity
   * @returns Updated quote data
   */
  async updateTreatmentQuantity(
    portalType: 'patient' | 'admin' | 'clinic',
    quoteId: string,
    treatmentId: string,
    quantity: number
  ): Promise<QuoteData> {
    try {
      const response = await axios.post(`/api/integration/${portalType}/quotes/${quoteId}/update-treatment`, {
        treatmentId,
        quantity
      });
      
      if (response.data.success) {
        return this.transformQuote(response.data.quote);
      } else {
        throw new Error(response.data.message || 'Failed to update treatment quantity');
      }
    } catch (error: any) {
      throw new Error(`Error updating treatment quantity: ${error.message}`);
    }
  }

  /**
   * Remove a treatment from a quote
   * @param portalType The portal type (patient, admin, or clinic)
   * @param quoteId The quote ID
   * @param treatmentId The treatment ID
   * @returns Updated quote data
   */
  async removeTreatment(
    portalType: 'patient' | 'admin' | 'clinic',
    quoteId: string,
    treatmentId: string
  ): Promise<QuoteData> {
    try {
      const response = await axios.post(`/api/integration/${portalType}/quotes/${quoteId}/remove-treatment`, {
        treatmentId
      });
      
      if (response.data.success) {
        return this.transformQuote(response.data.quote);
      } else {
        throw new Error(response.data.message || 'Failed to remove treatment');
      }
    } catch (error: any) {
      throw new Error(`Error removing treatment: ${error.message}`);
    }
  }

  /**
   * Download a quote as a PDF
   * @param portalType The portal type (patient, admin, or clinic)
   * @param quoteId The quote ID
   */
  async downloadQuotePdf(portalType: 'patient' | 'admin' | 'clinic', quoteId: string): Promise<void> {
    try {
      // Using window.open to trigger a download
      window.open(`/api/integration/${portalType}/quotes/${quoteId}/pdf`, '_blank');
    } catch (error: any) {
      throw new Error(`Error downloading PDF: ${error.message}`);
    }
  }

  /**
   * Request an appointment for a quote
   * @param portalType The portal type (patient, admin, or clinic)
   * @param quoteId The quote ID
   * @returns Success message
   */
  async requestAppointment(portalType: 'patient' | 'admin' | 'clinic', quoteId: string): Promise<{ message: string }> {
    try {
      const response = await axios.post(`/api/integration/${portalType}/quotes/${quoteId}/request-appointment`);
      
      if (response.data.success) {
        return { message: response.data.message || 'Appointment request submitted successfully' };
      } else {
        throw new Error(response.data.message || 'Failed to request appointment');
      }
    } catch (error: any) {
      throw new Error(`Error requesting appointment: ${error.message}`);
    }
  }

  /**
   * Send a quote via email
   * @param portalType The portal type (patient, admin, or clinic)
   * @param quoteId The quote ID
   * @returns Success message
   */
  async sendQuoteEmail(portalType: 'patient' | 'admin' | 'clinic', quoteId: string): Promise<{ message: string }> {
    try {
      const response = await axios.post(`/api/integration/${portalType}/quotes/${quoteId}/send-email`);
      
      if (response.data.success) {
        return { message: response.data.message || 'Quote sent via email successfully' };
      } else {
        throw new Error(response.data.message || 'Failed to send quote via email');
      }
    } catch (error: any) {
      throw new Error(`Error sending quote via email: ${error.message}`);
    }
  }

  /**
   * Assign a clinic to a quote (admin portal only)
   * @param quoteId The quote ID
   * @param clinicId The clinic ID
   * @returns Updated quote data
   */
  async assignClinicToQuote(quoteId: string, clinicId: string): Promise<QuoteData> {
    try {
      const response = await axios.post(`/api/integration/admin/quotes/${quoteId}/assign-clinic`, {
        clinicId
      });
      
      if (response.data.success) {
        return this.transformQuote(response.data.quote);
      } else {
        throw new Error(response.data.message || 'Failed to assign clinic to quote');
      }
    } catch (error: any) {
      throw new Error(`Error assigning clinic to quote: ${error.message}`);
    }
  }

  /**
   * Transform an API quote to our frontend format
   * @param apiQuote The quote from the API
   * @returns Formatted quote data
   */
  private transformQuote(apiQuote: any): QuoteData {
    return {
      id: apiQuote.id,
      createdAt: apiQuote.createdAt || apiQuote.created_at,
      patientName: apiQuote.patientName,
      patientEmail: apiQuote.patientEmail,
      treatments: apiQuote.treatments,
      subtotal: apiQuote.subtotal,
      discount: apiQuote.discount,
      total: apiQuote.total,
      promoCode: apiQuote.promoCode,
      currency: apiQuote.currency || 'USD',
      status: apiQuote.status || 'draft',
      clinicId: apiQuote.clinicId,
      clinicName: apiQuote.clinicName
    };
  }

  /**
   * Transform an array of API quotes to our frontend format
   * @param apiQuotes Array of quotes from the API
   * @returns Array of formatted quote data
   */
  private transformQuotes(apiQuotes: any[]): QuoteData[] {
    return apiQuotes.map(quote => this.transformQuote(quote));
  }
}

export default new QuoteIntegrationService();