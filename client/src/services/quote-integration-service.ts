/**
 * Quote Integration Service
 * 
 * This service provides methods for interacting with the dental quote builder API
 * including treatment management, promo code application, and quote totals.
 */

import axios from 'axios';

// API endpoint for the quote integration
const QUOTE_API_BASE_URL = '/api/quote';

// Response interfaces
export interface Treatment {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  currency?: string;
  quantity: number;
  lineTotal: number;
}

export interface QuoteResponse {
  success: boolean;
  message?: string;
  treatments: Treatment[];
  subtotal?: number;
  discountAmount?: number;
  total?: number;
}

export interface ValidatePromoCodeResponse {
  isValid: boolean;
  code: string;
  message: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
}

// Service singleton
export const QuoteIntegrationService = {
  /**
   * Get all available treatments
   */
  async getTreatments(): Promise<Treatment[]> {
    try {
      // For demo purposes, return mock data
      return getMockTreatments();
    } catch (error) {
      console.error('Error fetching treatments:', error);
      throw new Error('Failed to fetch treatments');
    }
  },
  
  /**
   * Add a treatment to the quote
   */
  async addTreatment(treatmentId: string, quantity: number = 1): Promise<QuoteResponse> {
    try {
      // For demo purposes, simulate API call with mock data
      return {
        success: true,
        treatments: addTreatmentToMockQuote(treatmentId, quantity),
        subtotal: calculateMockSubtotal(),
        discountAmount: 0,
        total: calculateMockSubtotal()
      };
    } catch (error) {
      console.error('Error adding treatment:', error);
      throw new Error('Failed to add treatment');
    }
  },
  
  /**
   * Remove a treatment from the quote
   */
  async removeTreatment(treatmentId: string): Promise<QuoteResponse> {
    try {
      // For demo purposes, simulate API call with mock data
      return {
        success: true,
        treatments: removeTreatmentFromMockQuote(treatmentId),
        subtotal: calculateMockSubtotal(),
        discountAmount: 0,
        total: calculateMockSubtotal()
      };
    } catch (error) {
      console.error('Error removing treatment:', error);
      throw new Error('Failed to remove treatment');
    }
  },
  
  /**
   * Update treatment quantity
   */
  async updateTreatmentQuantity(treatmentId: string, quantity: number): Promise<QuoteResponse> {
    try {
      // For demo purposes, simulate API call with mock data
      return {
        success: true,
        treatments: updateTreatmentQuantityInMockQuote(treatmentId, quantity),
        subtotal: calculateMockSubtotal(),
        discountAmount: 0,
        total: calculateMockSubtotal()
      };
    } catch (error) {
      console.error('Error updating treatment quantity:', error);
      throw new Error('Failed to update treatment quantity');
    }
  },
  
  /**
   * Apply a promo code
   */
  async applyPromoCode(code: string): Promise<ValidatePromoCodeResponse> {
    try {
      // For demo purposes, simulate API call with mock validation
      return validateMockPromoCode(code);
    } catch (error) {
      console.error('Error applying promo code:', error);
      throw new Error('Failed to apply promo code');
    }
  },
  
  /**
   * Clear the applied promo code
   */
  async clearPromoCode(): Promise<QuoteResponse> {
    try {
      // For demo purposes, simulate API call with mock data
      return {
        success: true,
        treatments: getCurrentMockTreatments(),
        subtotal: calculateMockSubtotal(),
        discountAmount: 0,
        total: calculateMockSubtotal()
      };
    } catch (error) {
      console.error('Error clearing promo code:', error);
      throw new Error('Failed to clear promo code');
    }
  },
  
  /**
   * Reset the entire quote
   */
  async resetQuote(): Promise<QuoteResponse> {
    try {
      // For demo purposes, simulate API call with mock data
      resetMockQuote();
      return {
        success: true,
        treatments: [],
        subtotal: 0,
        discountAmount: 0,
        total: 0
      };
    } catch (error) {
      console.error('Error resetting quote:', error);
      throw new Error('Failed to reset quote');
    }
  },
  
  /**
   * Get quote details by ID - including promo code info
   */
  async getQuoteById(quoteId: string): Promise<any> {
    try {
      const response = await axios.get(`/api/patient/quotes/${quoteId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quote details:', error);
      throw new Error('Failed to fetch quote details');
    }
  },
  
  /**
   * Get all quotes for the current user
   */
  async getQuotes(portalType: 'patient' | 'clinic' | 'admin' = 'patient'): Promise<any> {
    try {
      const endpoint = portalType === 'patient' 
        ? '/api/patient/quotes' 
        : portalType === 'clinic' 
          ? '/api/clinic/quotes' 
          : '/api/admin/quotes';
      
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${portalType} quotes:`, error);
      throw new Error(`Failed to fetch ${portalType} quotes`);
    }
  },
  
  /**
   * Download quote PDF
   */
  async downloadQuotePdf(quoteId: string): Promise<Blob> {
    try {
      const response = await axios.get(`/api/quotes/${quoteId}/pdf`, { 
        responseType: 'blob' 
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading quote PDF:', error);
      throw new Error('Failed to download quote PDF');
    }
  }
};

// Mock data storage for demo purposes
let mockTreatments: Treatment[] = [];
let currentMockQuote: Treatment[] = [];

// Mock treatments data
function getMockTreatments(): Treatment[] {
  if (mockTreatments.length === 0) {
    mockTreatments = [
      {
        id: 'dental-implant',
        name: 'Dental Implant',
        description: 'Titanium post surgically placed into the jawbone',
        price: 850,
        category: 'implants',
        currency: 'USD',
        quantity: 0,
        lineTotal: 0
      },
      {
        id: 'porcelain-crown',
        name: 'Porcelain Crown',
        description: 'Tooth-shaped cap placed over a damaged tooth',
        price: 450,
        category: 'crowns',
        currency: 'USD',
        quantity: 0,
        lineTotal: 0
      },
      {
        id: 'teeth-whitening',
        name: 'Professional Teeth Whitening',
        description: 'In-office bleaching procedure',
        price: 275,
        category: 'cosmetic',
        currency: 'USD',
        quantity: 0,
        lineTotal: 0
      },
      {
        id: 'root-canal',
        name: 'Root Canal Treatment',
        description: 'Procedure to treat infected tooth pulp',
        price: 375,
        category: 'endodontics',
        currency: 'USD',
        quantity: 0,
        lineTotal: 0
      },
      {
        id: 'extraction',
        name: 'Tooth Extraction',
        description: 'Removal of damaged or problematic tooth',
        price: 120,
        category: 'oral-surgery',
        currency: 'USD',
        quantity: 0,
        lineTotal: 0
      },
      {
        id: 'dental-bridge',
        name: 'Dental Bridge (3 units)',
        description: 'Fixed prosthetic device to replace missing teeth',
        price: 1200,
        category: 'prosthetics',
        currency: 'USD',
        quantity: 0,
        lineTotal: 0
      },
      {
        id: 'dental-veneers',
        name: 'Porcelain Veneer (per tooth)',
        description: 'Thin shells of porcelain bonded to front of teeth',
        price: 525,
        category: 'cosmetic',
        currency: 'USD',
        quantity: 0,
        lineTotal: 0
      },
      {
        id: 'dental-cleaning',
        name: 'Professional Dental Cleaning',
        description: 'Removal of plaque and tartar',
        price: 85,
        category: 'prevention',
        currency: 'USD',
        quantity: 0,
        lineTotal: 0
      }
    ];
  }
  
  return mockTreatments;
}

// Get current mock treatments in the quote
function getCurrentMockTreatments(): Treatment[] {
  return currentMockQuote;
}

// Add a treatment to the mock quote
function addTreatmentToMockQuote(treatmentId: string, quantity: number): Treatment[] {
  // Ensure mock treatments are loaded
  getMockTreatments();
  
  // Find the treatment
  const treatmentToAdd = mockTreatments.find(t => t.id === treatmentId);
  
  if (!treatmentToAdd) {
    throw new Error(`Treatment with ID ${treatmentId} not found`);
  }
  
  // Check if the treatment is already in the quote
  const existingIndex = currentMockQuote.findIndex(t => t.id === treatmentId);
  
  if (existingIndex >= 0) {
    // Update quantity if already in the quote
    currentMockQuote[existingIndex].quantity += quantity;
    currentMockQuote[existingIndex].lineTotal = 
      currentMockQuote[existingIndex].price * currentMockQuote[existingIndex].quantity;
  } else {
    // Add to the quote if not already there
    currentMockQuote.push({
      ...treatmentToAdd,
      quantity: quantity,
      lineTotal: treatmentToAdd.price * quantity
    });
  }
  
  return [...currentMockQuote];
}

// Remove a treatment from the mock quote
function removeTreatmentFromMockQuote(treatmentId: string): Treatment[] {
  // Filter out the treatment
  currentMockQuote = currentMockQuote.filter(t => t.id !== treatmentId);
  
  return [...currentMockQuote];
}

// Update treatment quantity in the mock quote
function updateTreatmentQuantityInMockQuote(treatmentId: string, quantity: number): Treatment[] {
  // Find the treatment in the quote
  const treatmentIndex = currentMockQuote.findIndex(t => t.id === treatmentId);
  
  if (treatmentIndex < 0) {
    throw new Error(`Treatment with ID ${treatmentId} not found in quote`);
  }
  
  // Update the quantity
  currentMockQuote[treatmentIndex].quantity = quantity;
  currentMockQuote[treatmentIndex].lineTotal = 
    currentMockQuote[treatmentIndex].price * quantity;
  
  return [...currentMockQuote];
}

// Calculate the subtotal of the mock quote
function calculateMockSubtotal(): number {
  return currentMockQuote.reduce((sum, treatment) => sum + treatment.lineTotal, 0);
}

// Validate a mock promo code
function validateMockPromoCode(code: string): ValidatePromoCodeResponse {
  // Valid promo codes for testing
  const validPromoCodes: Record<string, ValidatePromoCodeResponse> = {
    'SUMMER15': {
      isValid: true,
      code: 'SUMMER15',
      message: 'Summer special discount: 15% off your treatment',
      discountType: 'percentage',
      discountValue: 15
    },
    'DENTAL25': {
      isValid: true,
      code: 'DENTAL25',
      message: 'Premium dental care discount: 25% off your treatment',
      discountType: 'percentage',
      discountValue: 25
    },
    'NEWPATIENT': {
      isValid: true,
      code: 'NEWPATIENT',
      message: 'New patient welcome discount: 20% off your first treatment',
      discountType: 'percentage',
      discountValue: 20
    },
    'TEST10': {
      isValid: true,
      code: 'TEST10',
      message: 'Test discount: 10% off your treatment',
      discountType: 'percentage',
      discountValue: 10
    },
    'FREECONSULT': {
      isValid: true,
      code: 'FREECONSULT',
      message: 'Free consultation with any treatment package',
      discountType: 'fixed_amount',
      discountValue: 85 // Price of a consultation
    },
    'LUXHOTEL20': {
      isValid: true,
      code: 'LUXHOTEL20',
      message: 'Luxury hotel partner discount: 20% off your treatment',
      discountType: 'percentage',
      discountValue: 20
    },
    'IMPLANTCROWN30': {
      isValid: true,
      code: 'IMPLANTCROWN30',
      message: 'Special offer: 30% off implant and crown packages',
      discountType: 'percentage',
      discountValue: 30
    },
    'FREEWHITE': {
      isValid: true,
      code: 'FREEWHITE',
      message: 'Free teeth whitening with any treatment over $1000',
      discountType: 'fixed_amount',
      discountValue: 275 // Price of whitening
    },
    'LUXTRAVEL': {
      isValid: true,
      code: 'LUXTRAVEL',
      message: 'Includes premium transportation and 5-star hotel stay',
      discountType: 'fixed_amount',
      discountValue: 300
    }
  };
  
  // Check if the code is valid
  if (validPromoCodes[code.toUpperCase()]) {
    return validPromoCodes[code.toUpperCase()];
  }
  
  // Return invalid response if not found
  return {
    isValid: false,
    code: code,
    message: 'Invalid promo code. Please try again with a valid code.'
  };
}

// Reset the mock quote
function resetMockQuote(): void {
  currentMockQuote = [];
}