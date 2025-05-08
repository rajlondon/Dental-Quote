import { SpecialOffer, TreatmentPlan } from "@shared/schema";

// Define the applied special offer type based on our database schema
export interface AppliedSpecialOffer {
  id: string;
  specialOfferId: string;
  treatmentPlanId: number;
  patientId: number;
  clinicId: number;
  discountType: string;
  discountValue: number | string;
  originalPrice: number;
  discountedPrice: number;
  currency: string;
  appliedToTreatments?: string[];
  originatingPage?: string;
  appliedAt: Date;
  usageStatus: string;
  convertedToBooking?: boolean;
  bookingId?: number;
  
  // Optional related entities
  offer?: SpecialOffer;
  patient?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  clinic?: {
    id: number;
    name?: string;
    city?: string;
  };
}
import { apiRequest } from "@/lib/queryClient";

// Service for handling applied special offers
export const appliedOfferService = {
  // Apply a special offer to a treatment plan
  async applyOffer(data: {
    specialOfferId: string;
    treatmentPlanId: number;
    patientId: number;
    clinicId: number;
    discountType: string;
    discountValue: number;
    originalPrice: number;
    discountedPrice: number;
    currency?: string;
    appliedToTreatments?: string[];
    originatingPage?: string;
  }): Promise<AppliedSpecialOffer> {
    const response = await apiRequest("POST", "/api/applied-offers", data);
    return await response.json();
  },

  // Get all applied offers for a treatment plan
  async getByTreatmentPlan(treatmentPlanId: number): Promise<AppliedSpecialOffer[]> {
    const response = await apiRequest("GET", `/api/applied-offers/treatment/${treatmentPlanId}`);
    return await response.json();
  },

  // Get a specific applied offer
  async getById(appliedOfferId: string): Promise<AppliedSpecialOffer> {
    const response = await apiRequest("GET", `/api/applied-offers/${appliedOfferId}`);
    return await response.json();
  },

  // Update the status of an applied offer
  async updateStatus(
    appliedOfferId: string, 
    usageStatus: string
  ): Promise<AppliedSpecialOffer> {
    const response = await apiRequest(
      "PATCH", 
      `/api/applied-offers/${appliedOfferId}/status`, 
      { usageStatus }
    );
    return await response.json();
  },

  // Mark an applied offer as converted to booking
  async markAsConverted(
    appliedOfferId: string, 
    bookingId: number
  ): Promise<AppliedSpecialOffer> {
    const response = await apiRequest(
      "PATCH", 
      `/api/applied-offers/${appliedOfferId}/convert`, 
      { bookingId, convertedToBooking: true }
    );
    return await response.json();
  },

  // Calculate discount for a treatment plan based on a special offer
  calculateDiscount(
    offer: SpecialOffer, 
    treatmentPlan: TreatmentPlan, 
    appliedToTreatments?: string[]
  ): {
    discountedPrice: number;
    originalPrice: number;
    discountAmount: number;
    discountType: string;
    discountValue: number;
  } {
    // Get the estimated total cost from the treatment plan
    let originalPrice = treatmentPlan.estimatedTotalCost ? 
      parseFloat(treatmentPlan.estimatedTotalCost.toString()) : 0;
    
    let discountAmount = 0;
    let discountType = offer.discountType || "percentage";
    // Handle discountValue that might be a string or number
    let discountValue = offer.discountValue ? 
      (typeof offer.discountValue === 'string' ? parseFloat(offer.discountValue) : offer.discountValue) : 0;
    
    // Handle specific treatments if that metadata is available from the offer
    // Check available metadata fields based on schema
    const applicableTreatments = offer.applicableTreatments || 
                               (offer.metadata && typeof offer.metadata === 'object' && 
                               'applicableTreatments' in offer.metadata ? 
                               offer.metadata.applicableTreatments : null);
    
    const appliesTo = applicableTreatments ? 'specific_treatments' : 'all';
    
    if (appliesTo === "specific_treatments" && appliedToTreatments && appliedToTreatments.length > 0) {
      // Calculate based only on applicable treatments
      // For now we'll use a simplified approach
      originalPrice = treatmentPlan.estimatedTotalCost ? 
        parseFloat(treatmentPlan.estimatedTotalCost.toString()) : 0;
    }

    if (discountType === "percentage") {
      discountAmount = (originalPrice * discountValue) / 100;
    } else if (discountType === "fixed_amount") {
      discountAmount = discountValue;
    }

    // Ensure discount doesn't exceed the original price
    discountAmount = Math.min(discountAmount, originalPrice);
    
    const discountedPrice = originalPrice - discountAmount;

    return {
      discountedPrice,
      originalPrice,
      discountAmount,
      discountType,
      discountValue: typeof discountValue === 'number' ? discountValue : parseFloat(discountValue) || 0
    };
  }
};