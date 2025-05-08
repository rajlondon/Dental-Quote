import { apiRequest } from "@/lib/queryClient";

export interface TreatmentItem {
  id?: string;
  name: string;
  category?: string;
  quantity?: number;
  priceGBP: number;
  priceUSD?: number;
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  clinicId: number | string; // Support both number and string IDs for clinics
  discountValue: number;
  discountType: 'percentage' | 'fixed_amount';
  imageUrl?: string;
  validUntil?: string;
  expiryDate?: string; // Alternative name for validUntil
  isActive: boolean;
  isMatched?: boolean;
  displayText?: string;
  applicableTreatment?: string;
  applicableTreatments?: string[]; // Support arrays of treatment IDs
  termsAndConditions?: string;
}

export interface MatchedOffersResponse {
  success: boolean;
  data: {
    matchedOffers: SpecialOffer[];
    clinic: {
      id: number;
      name: string;
    };
    message: string;
  };
}

export interface ApplyOfferResponse {
  success: boolean;
  data: {
    discountedTreatments: Array<TreatmentItem & {
      originalPriceGBP: number;
      specialOfferApplied: boolean;
      specialOfferId: string;
      specialOfferTitle: string;
      discountAmount: number;
    }>;
    totalSavings: number;
    message: string;
  };
}

/**
 * Get all special offers for a specific clinic
 */
export const getClinicSpecialOffers = async (clinicId: number): Promise<SpecialOffer[]> => {
  try {
    const response = await apiRequest('GET', `/api/special-offers/clinic/${clinicId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch special offers');
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching special offers:', error);
    return [];
  }
};

/**
 * Match treatments to special offers for a clinic
 */
export const matchTreatmentsToOffers = async (
  clinicId: number, 
  treatments: TreatmentItem[]
): Promise<MatchedOffersResponse> => {
  try {
    const response = await apiRequest('POST', '/api/special-offers/match-treatments', {
      clinicId,
      treatments
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to match treatments to offers');
    }
    
    return data;
  } catch (error) {
    console.error('Error matching treatments to offers:', error);
    throw error;
  }
};

/**
 * Apply a special offer to treatments
 */
export const applySpecialOffer = async (
  specialOfferId: string,
  treatments: TreatmentItem[],
  patientId?: number,
  treatmentPlanId?: string
): Promise<ApplyOfferResponse> => {
  try {
    const response = await apiRequest('POST', '/api/special-offers/apply', {
      specialOfferId,
      treatments,
      patientId,
      treatmentPlanId
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to apply special offer');
    }
    
    return data;
  } catch (error) {
    console.error('Error applying special offer:', error);
    throw error;
  }
};