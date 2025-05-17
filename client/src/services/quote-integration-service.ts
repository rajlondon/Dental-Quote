/**
 * Quote Integration Service
 * 
 * This service provides methods to interact with the Flask-based dental quote system.
 * It serves as a bridge between the React portals and the Flask backend.
 */
import { apiRequest, queryClient } from "@/lib/queryClient";

// Types for quote data
export interface Treatment {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  quantity: number;
}

export interface PromoDetails {
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  applicable_treatments?: string[];
  description?: string;
}

export interface PatientInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  preferred_dates?: string;
  accommodation_needed?: boolean;
  airport_transfer_needed?: boolean;
  additional_notes?: string;
}

export interface QuoteData {
  quote_id: string;
  created_at: string;
  patient_info: PatientInfo;
  selected_treatments: Treatment[];
  subtotal: number;
  promo_code?: string;
  promo_details?: PromoDetails;
  discount: number;
  total: number;
  status: string;
  clinic_id?: string;
  assigned_to?: string;
}

// Service class
class QuoteIntegrationService {
  /**
   * Fetch all quotes from the system
   * For admin portal use
   */
  async getAllQuotes(): Promise<QuoteData[]> {
    try {
      const response = await apiRequest('GET', '/api/export-quotes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching quotes:', error);
      throw new Error('Failed to fetch quotes');
    }
  }

  /**
   * Fetch quotes for a specific clinic
   * For clinic portal use
   */
  async getClinicQuotes(clinicId: string): Promise<QuoteData[]> {
    try {
      const response = await apiRequest('GET', `/api/clinic-quotes/${clinicId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching clinic quotes:', error);
      throw new Error('Failed to fetch clinic quotes');
    }
  }

  /**
   * Fetch quotes for a specific patient
   * For patient portal use
   */
  async getPatientQuotes(patientId: string): Promise<QuoteData[]> {
    try {
      const response = await apiRequest('GET', `/api/patient-quotes/${patientId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching patient quotes:', error);
      throw new Error('Failed to fetch patient quotes');
    }
  }

  /**
   * Get a specific quote by ID
   * Used by all portals
   */
  async getQuoteById(quoteId: string): Promise<QuoteData> {
    try {
      const response = await apiRequest('GET', `/api/quote/${quoteId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching quote ${quoteId}:`, error);
      throw new Error('Failed to fetch quote details');
    }
  }

  /**
   * Apply a promo code to a quote
   * Used by patient portal and admin portal
   */
  async applyPromoCode(quoteId: string, promoCode: string): Promise<QuoteData> {
    try {
      const response = await apiRequest('POST', '/api/apply-promo-code', {
        quote_id: quoteId,
        promo_code: promoCode
      });
      
      // Invalidate cache for this quote
      queryClient.invalidateQueries({ queryKey: [`/api/quote/${quoteId}`] });
      
      return await response.json();
    } catch (error) {
      console.error('Error applying promo code:', error);
      throw new Error('Failed to apply promo code');
    }
  }

  /**
   * Remove a promo code from a quote
   * Used by patient portal and admin portal
   */
  async removePromoCode(quoteId: string): Promise<QuoteData> {
    try {
      const response = await apiRequest('POST', '/api/remove-promo-code', {
        quote_id: quoteId
      });
      
      // Invalidate cache for this quote
      queryClient.invalidateQueries({ queryKey: [`/api/quote/${quoteId}`] });
      
      return await response.json();
    } catch (error) {
      console.error('Error removing promo code:', error);
      throw new Error('Failed to remove promo code');
    }
  }

  /**
   * Update a treatment quantity
   * Used by patient portal and admin portal
   */
  async updateTreatmentQuantity(
    quoteId: string, 
    treatmentId: string, 
    quantity: number
  ): Promise<QuoteData> {
    try {
      const response = await apiRequest('POST', '/api/update-quantity', {
        quote_id: quoteId,
        treatment_id: treatmentId,
        quantity: quantity
      });
      
      // Invalidate cache for this quote
      queryClient.invalidateQueries({ queryKey: [`/api/quote/${quoteId}`] });
      
      return await response.json();
    } catch (error) {
      console.error('Error updating treatment quantity:', error);
      throw new Error('Failed to update treatment quantity');
    }
  }

  /**
   * Add a treatment to a quote
   * Used by patient portal and admin portal
   */
  async addTreatment(quoteId: string, treatmentId: string): Promise<QuoteData> {
    try {
      const response = await apiRequest('POST', '/api/add-treatment', {
        quote_id: quoteId,
        treatment_id: treatmentId
      });
      
      // Invalidate cache for this quote
      queryClient.invalidateQueries({ queryKey: [`/api/quote/${quoteId}`] });
      
      return await response.json();
    } catch (error) {
      console.error('Error adding treatment:', error);
      throw new Error('Failed to add treatment');
    }
  }

  /**
   * Remove a treatment from a quote
   * Used by patient portal and admin portal
   */
  async removeTreatment(quoteId: string, treatmentId: string): Promise<QuoteData> {
    try {
      const response = await apiRequest('POST', '/api/remove-treatment', {
        quote_id: quoteId,
        treatment_id: treatmentId
      });
      
      // Invalidate cache for this quote
      queryClient.invalidateQueries({ queryKey: [`/api/quote/${quoteId}`] });
      
      return await response.json();
    } catch (error) {
      console.error('Error removing treatment:', error);
      throw new Error('Failed to remove treatment');
    }
  }

  /**
   * Generate a PDF for a quote
   * Used by all portals
   */
  async generatePDF(quoteId: string): Promise<Blob> {
    try {
      const response = await apiRequest('POST', '/api/generate-pdf', {
        quote_id: quoteId
      });
      
      return await response.blob();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Send quote to patient's email
   * Used by all portals
   */
  async sendToEmail(quoteId: string, email: string): Promise<{ success: boolean, message: string }> {
    try {
      const response = await apiRequest('POST', '/api/send-to-email', {
        quote_id: quoteId,
        email: email
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Apply a special offer to create a new quote
   * Used by patient portal
   */
  async applySpecialOffer(offerId: string): Promise<{ success: boolean, quoteId: string }> {
    try {
      const response = await apiRequest('POST', '/api/apply-special-offer', {
        offer_id: offerId
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error applying special offer:', error);
      throw new Error('Failed to apply special offer');
    }
  }

  /**
   * Update quote status
   * Used by admin and clinic portals
   */
  async updateQuoteStatus(
    quoteId: string, 
    status: string
  ): Promise<{ success: boolean, message: string }> {
    try {
      const response = await apiRequest('POST', '/api/update-quote-status', {
        quote_id: quoteId,
        status: status
      });
      
      // Invalidate cache for this quote and all quote lists
      queryClient.invalidateQueries({ queryKey: [`/api/quote/${quoteId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/export-quotes'] });
      
      return await response.json();
    } catch (error) {
      console.error('Error updating quote status:', error);
      throw new Error('Failed to update quote status');
    }
  }

  /**
   * Assign quote to a clinic
   * Used by admin portal
   */
  async assignQuoteToClinic(
    quoteId: string, 
    clinicId: string
  ): Promise<{ success: boolean, message: string }> {
    try {
      const response = await apiRequest('POST', '/api/assign-quote', {
        quote_id: quoteId,
        clinic_id: clinicId
      });
      
      // Invalidate cache for this quote and all quote lists
      queryClient.invalidateQueries({ queryKey: [`/api/quote/${quoteId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/export-quotes'] });
      
      return await response.json();
    } catch (error) {
      console.error('Error assigning quote:', error);
      throw new Error('Failed to assign quote to clinic');
    }
  }
}

// Export as singleton
export const quoteService = new QuoteIntegrationService();