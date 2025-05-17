import axios from 'axios';
import { Treatment } from '@/components/quotes/TreatmentList';
import { Quote } from '@/hooks/use-quote-system';

/**
 * Service for integrating with the Flask quote system
 * This service handles API communication between React frontend and Flask backend
 */
export class QuoteIntegrationService {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api/integration') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all quotes for a specific portal
   * @param portalType The type of portal (patient, clinic, admin)
   * @returns Array of quotes
   */
  async getQuotes(portalType: string): Promise<Quote[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/${portalType}/quotes`);
      
      if (response.data.success) {
        return response.data.quotes || [];
      } else {
        throw new Error(response.data.message || 'Failed to load quotes');
      }
    } catch (error: any) {
      console.error('Error loading quotes:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error loading quotes');
    }
  }

  /**
   * Get a specific quote by ID
   * @param portalType The type of portal (patient, clinic, admin)
   * @param quoteId The ID of the quote
   * @returns Quote data
   */
  async getQuote(portalType: string, quoteId: string): Promise<Quote> {
    try {
      const response = await axios.get(`${this.baseUrl}/${portalType}/quotes/${quoteId}`);
      
      if (response.data.success) {
        return response.data.quote;
      } else {
        throw new Error(response.data.message || 'Failed to load quote');
      }
    } catch (error: any) {
      console.error('Error loading quote:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error loading quote');
    }
  }

  /**
   * Update treatment quantity in a quote
   * @param portalType The type of portal (patient, clinic, admin)
   * @param quoteId The ID of the quote
   * @param treatmentId The ID of the treatment
   * @param quantity The new quantity
   * @returns Updated quote
   */
  async updateTreatmentQuantity(
    portalType: string, 
    quoteId: string, 
    treatmentId: string, 
    quantity: number
  ): Promise<Quote> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/${portalType}/quotes/${quoteId}/treatments/${treatmentId}`,
        { quantity }
      );
      
      if (response.data.success) {
        return response.data.quote;
      } else {
        throw new Error(response.data.message || 'Failed to update treatment quantity');
      }
    } catch (error: any) {
      console.error('Error updating treatment quantity:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error updating treatment quantity');
    }
  }

  /**
   * Remove a treatment from a quote
   * @param portalType The type of portal (patient, clinic, admin)
   * @param quoteId The ID of the quote
   * @param treatmentId The ID of the treatment
   * @returns Updated quote
   */
  async removeTreatment(
    portalType: string, 
    quoteId: string, 
    treatmentId: string
  ): Promise<Quote> {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/${portalType}/quotes/${quoteId}/treatments/${treatmentId}`
      );
      
      if (response.data.success) {
        return response.data.quote;
      } else {
        throw new Error(response.data.message || 'Failed to remove treatment');
      }
    } catch (error: any) {
      console.error('Error removing treatment:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error removing treatment');
    }
  }

  /**
   * Apply a promo code to a quote
   * @param portalType The type of portal (patient, clinic, admin)
   * @param quoteId The ID of the quote
   * @param promoCode The promo code to apply
   * @returns Updated quote
   */
  async applyPromoCode(
    portalType: string, 
    quoteId: string, 
    promoCode: string
  ): Promise<Quote> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${portalType}/quotes/${quoteId}/promo`,
        { promoCode }
      );
      
      if (response.data.success) {
        return response.data.quote;
      } else {
        throw new Error(response.data.message || 'Invalid promo code');
      }
    } catch (error: any) {
      console.error('Error applying promo code:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error applying promo code');
    }
  }

  /**
   * Remove a promo code from a quote
   * @param portalType The type of portal (patient, clinic, admin)
   * @param quoteId The ID of the quote
   * @returns Updated quote
   */
  async removePromoCode(
    portalType: string, 
    quoteId: string
  ): Promise<Quote> {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/${portalType}/quotes/${quoteId}/promo`
      );
      
      if (response.data.success) {
        return response.data.quote;
      } else {
        throw new Error(response.data.message || 'Failed to remove promo code');
      }
    } catch (error: any) {
      console.error('Error removing promo code:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error removing promo code');
    }
  }

  /**
   * Get available treatment categories
   * @returns Array of treatment categories
   */
  async getTreatmentCategories(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/treatments/categories`);
      
      if (response.data.success) {
        return response.data.categories || [];
      } else {
        throw new Error(response.data.message || 'Failed to load treatment categories');
      }
    } catch (error: any) {
      console.error('Error loading treatment categories:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error loading treatment categories');
    }
  }

  /**
   * Get treatments by category
   * @param category The treatment category
   * @returns Array of treatments
   */
  async getTreatmentsByCategory(category: string): Promise<Treatment[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/treatments/category/${category}`);
      
      if (response.data.success) {
        return response.data.treatments || [];
      } else {
        throw new Error(response.data.message || 'Failed to load treatments');
      }
    } catch (error: any) {
      console.error('Error loading treatments:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error loading treatments');
    }
  }

  /**
   * Download a quote as PDF
   * @param portalType The type of portal (patient, clinic, admin)
   * @param quoteId The ID of the quote
   * @returns Blob containing the PDF data
   */
  async downloadQuotePdf(portalType: string, quoteId: string): Promise<Blob> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${portalType}/quotes/${quoteId}/pdf`,
        { responseType: 'blob' }
      );
      
      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error downloading PDF');
    }
  }

  /**
   * Email a quote to a recipient
   * @param portalType The type of portal (patient, clinic, admin)
   * @param quoteId The ID of the quote
   * @param email The email address to send the quote to
   * @returns Success status
   */
  async emailQuote(portalType: string, quoteId: string, email: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${portalType}/quotes/${quoteId}/email`,
        { email }
      );
      
      return response.data.success || false;
    } catch (error: any) {
      console.error('Error emailing quote:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error emailing quote');
    }
  }

  /**
   * Get quote print HTML
   * @param portalType The type of portal (patient, clinic, admin)
   * @param quoteId The ID of the quote
   * @returns HTML string for printing
   */
  async getQuotePrintHtml(portalType: string, quoteId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/${portalType}/quotes/${quoteId}/print`);
      
      if (response.data.success) {
        return response.data.html || '';
      } else {
        throw new Error(response.data.message || 'Failed to get print HTML');
      }
    } catch (error: any) {
      console.error('Error getting print HTML:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error getting print HTML');
    }
  }

  /**
   * Create a new quote
   * @param portalType The type of portal (patient, clinic, admin)
   * @param quoteData The quote data
   * @returns Created quote
   */
  async createQuote(portalType: string, quoteData: Partial<Quote>): Promise<Quote> {
    try {
      const response = await axios.post(`${this.baseUrl}/${portalType}/quotes`, quoteData);
      
      if (response.data.success) {
        return response.data.quote;
      } else {
        throw new Error(response.data.message || 'Failed to create quote');
      }
    } catch (error: any) {
      console.error('Error creating quote:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error creating quote');
    }
  }

  /**
   * Get available promo codes (for testing)
   * @returns Array of promo codes
   */
  async getAvailablePromoCodes(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/promo-codes`);
      
      if (response.data.success) {
        return response.data.promoCodes || [];
      } else {
        throw new Error(response.data.message || 'Failed to load promo codes');
      }
    } catch (error: any) {
      console.error('Error loading promo codes:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error loading promo codes');
    }
  }

  /**
   * Verify a promo code is valid without applying it
   * @param promoCode The promo code to verify
   * @returns Validation result with discount information
   */
  async verifyPromoCode(promoCode: string): Promise<{
    valid: boolean;
    discountType?: 'percentage' | 'fixed_amount';
    discountValue?: number;
    message?: string;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/promo-codes/verify/${promoCode}`);
      
      if (response.data.success) {
        return {
          valid: true,
          discountType: response.data.discountType,
          discountValue: response.data.discountValue
        };
      } else {
        return {
          valid: false,
          message: response.data.message || 'Invalid promo code'
        };
      }
    } catch (error: any) {
      console.error('Error verifying promo code:', error);
      return {
        valid: false,
        message: error.response?.data?.message || error.message || 'Error verifying promo code'
      };
    }
  }
}

// Export a singleton instance
export const quoteService = new QuoteIntegrationService();

// Also export the class for testing or custom instantiation
export default QuoteIntegrationService;