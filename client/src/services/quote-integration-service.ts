/**
 * Quote Integration Service
 * 
 * This service handles communication between the React frontend and Flask backend
 * for the quote system, including promo code application and treatment management.
 */

import { Treatment } from '@/components/quotes/TreatmentList';

// Define the shape of the API responses for better type checking
interface QuoteResponse {
  success: boolean;
  treatments: Treatment[];
  subtotal: number;
  discountAmount: number;
  total: number;
  message?: string;
  promoCode?: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
}

interface ErrorResponse {
  success: boolean;
  message: string;
}

class QuoteIntegrationService {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api/quote/integration') {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Generic method for making API requests
   */
  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' = 'GET', 
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    
    return data as T;
  }
  
  /**
   * Initialize a new quote session
   */
  async initializeQuote(): Promise<QuoteResponse> {
    return this.makeRequest<QuoteResponse>('/initialize', 'POST');
  }
  
  /**
   * Get the current quote state
   */
  async getQuoteState(): Promise<QuoteResponse> {
    return this.makeRequest<QuoteResponse>('/state');
  }
  
  /**
   * Add a treatment to the quote
   */
  async addTreatment(treatmentId: string, quantity: number = 1): Promise<QuoteResponse> {
    return this.makeRequest<QuoteResponse>('/add-treatment', 'POST', {
      treatmentId,
      quantity,
    });
  }
  
  /**
   * Update the quantity of a treatment in the quote
   */
  async updateTreatmentQuantity(
    treatmentId: string, 
    quantity: number
  ): Promise<QuoteResponse> {
    return this.makeRequest<QuoteResponse>('/update-treatment-quantity', 'POST', {
      treatmentId,
      quantity,
    });
  }
  
  /**
   * Remove a treatment from the quote
   */
  async removeTreatment(treatmentId: string): Promise<QuoteResponse> {
    return this.makeRequest<QuoteResponse>('/remove-treatment', 'POST', {
      treatmentId,
    });
  }
  
  /**
   * Apply a promo code to the quote
   */
  async applyPromoCode(promoCode: string): Promise<QuoteResponse> {
    try {
      return await this.makeRequest<QuoteResponse>('/apply-promo', 'POST', {
        promoCode,
      });
    } catch (error) {
      // For better error handling, wrap the error in a standardized format
      throw new Error(error.message || 'Failed to apply promo code');
    }
  }
  
  /**
   * Clear the applied promo code
   */
  async clearPromoCode(): Promise<QuoteResponse> {
    return this.makeRequest<QuoteResponse>('/clear-promo', 'POST');
  }
  
  /**
   * Process a special offer selection
   */
  async processSpecialOffer(offerId: string): Promise<QuoteResponse> {
    return this.makeRequest<QuoteResponse>('/process-offer', 'POST', {
      offerId,
    });
  }
  
  /**
   * Save the quote for later reference
   */
  async saveQuote(patientData: {
    name: string;
    email: string;
    phone?: string;
    notes?: string;
  }): Promise<{ quoteId: string; pdfUrl?: string }> {
    return this.makeRequest<{ quoteId: string; pdfUrl?: string }>(
      '/save-quote', 
      'POST', 
      patientData
    );
  }
  
  /**
   * Get available treatments for the quote builder
   */
  async getAvailableTreatments(
    categoryId?: string,
    clinicId?: string
  ): Promise<{ treatments: Treatment[] }> {
    let endpoint = '/treatments';
    const params = new URLSearchParams();
    
    if (categoryId) {
      params.append('category', categoryId);
    }
    
    if (clinicId) {
      params.append('clinic', clinicId);
    }
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return this.makeRequest<{ treatments: Treatment[] }>(endpoint);
  }
  
  /**
   * Get active special offers
   */
  async getSpecialOffers(): Promise<{ 
    offers: Array<{
      id: string;
      title: string;
      description: string;
      discountType: 'percentage' | 'fixed_amount';
      discountValue: number;
      promoCode: string;
      bannerImage?: string;
    }> 
  }> {
    return this.makeRequest<{ offers: any[] }>('/special-offers');
  }
}

// Create a singleton instance with the default endpoint
export const quoteIntegrationService = new QuoteIntegrationService();

// Export the class for potential custom instantiations
export default QuoteIntegrationService;