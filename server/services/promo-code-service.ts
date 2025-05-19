/**
 * Promo Code Service
 * Handles validation and application of promo codes
 */
import { treatmentPackages } from '../routes/treatment-package-routes';
import { specialOffers } from '../routes/special-offers-routes-fixed';

interface ValidationResult {
  valid: boolean;
  code?: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  error?: string;
  appliedTo?: 'special_offer' | 'treatment_package';
  itemId?: string;
  title?: string;
}

interface DiscountCalculation {
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  treatmentIds: string[];
}

interface DiscountResult {
  discountAmount: number;
  originalTotal: number;
  newTotal: number;
}

export const promoCodeService = {
  // Validate a promo code
  async validateCode(code: string): Promise<ValidationResult> {
    // Normalize code to uppercase for case-insensitive comparison
    const normalizedCode = code.toUpperCase();
    
    try {
      // First check special offers
      for (const [clinicId, offers] of specialOffers.entries()) {
        for (const offer of offers) {
          if (offer.promo_code && offer.promo_code.toUpperCase() === normalizedCode) {
            // Check if the offer is still active
            if (!offer.is_active) {
              return {
                valid: false,
                error: 'This promo code has expired'
              };
            }

            return {
              valid: true,
              code: offer.promo_code,
              discountType: offer.discount_type,
              discountValue: offer.discount_value,
              appliedTo: 'special_offer',
              itemId: offer.id,
              title: offer.title
            };
          }
        }
      }
      
      // Then check treatment packages
      for (const pkg of treatmentPackages) {
        if (pkg.promoCode && pkg.promoCode.toUpperCase() === normalizedCode) {
          // Check if the package is still active
          if (!pkg.isActive) {
            return {
              valid: false,
              error: 'This promo code has expired'
            };
          }

          return {
            valid: true,
            code: pkg.promoCode,
            discountType: pkg.discountType,
            discountValue: pkg.discountValue,
            appliedTo: 'treatment_package',
            itemId: pkg.id,
            title: pkg.title
          };
        }
      }
      
      // Hard-coded test promo codes
      if (normalizedCode === 'TEST50') {
        return {
          valid: true,
          code: 'TEST50',
          discountType: 'percentage',
          discountValue: 50,
          title: 'Test 50% Off'
        };
      }
      
      if (normalizedCode === 'SAVE100') {
        return {
          valid: true,
          code: 'SAVE100',
          discountType: 'fixed_amount',
          discountValue: 100,
          title: '£100 Off Any Treatment'
        };
      }
      
      // No matching promo code found
      return {
        valid: false,
        error: 'Invalid promo code'
      };
    } catch (error) {
      console.error('Error validating promo code:', error);
      return {
        valid: false,
        error: 'An error occurred while validating the promo code'
      };
    }
  },
  
  // Calculate discount for a valid promo code
  async calculateDiscount({ code, discountType, discountValue, treatmentIds }: DiscountCalculation): Promise<DiscountResult> {
    try {
      // For this implementation, we'll use a simplified version
      // In a real implementation, you would fetch treatment details from the database
      
      // Placeholder for treatment prices (replace with actual data in production)
      const treatments = await this.getMockTreatments(treatmentIds);
      
      // Calculate original total
      const originalTotal = treatments.reduce((sum, t) => sum + t.price, 0);
      
      // Calculate discount amount based on discount type
      let discountAmount = 0;
      
      if (discountType === 'percentage') {
        // For percentage discount, calculate percentage of original total
        discountAmount = (originalTotal * (discountValue / 100));
      } else if (discountType === 'fixed_amount') {
        // For fixed amount, use the discount value directly
        discountAmount = discountValue;
      }
      
      // Ensure discount doesn't exceed original total
      discountAmount = Math.min(discountAmount, originalTotal);
      
      // Calculate new total after discount
      const newTotal = Math.max(0, originalTotal - discountAmount);
      
      return {
        discountAmount,
        originalTotal,
        newTotal
      };
    } catch (error) {
      console.error('Error calculating discount:', error);
      throw new Error('Failed to calculate discount');
    }
  },
  
  // Mock function to simulate fetching treatments
  // In a real implementation, you would replace this with a database query
  async getMockTreatments(treatmentIds: string[]) {
    // This is a temporary mock implementation
    // In production, you should fetch real treatment data from your database
    const mockPrices = {
      'dental-implants': 650,
      'veneers': 300,
      'crowns': 200,
      'whitening': 150,
      'cleaning': 80,
      'root-canal': 250,
      'dentures': 400,
      'orthodontics': 500,
      'checkup': 50,
      'test': 100
    };
    
    return treatmentIds.map(id => ({
      id,
      name: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      price: mockPrices[id] || 100 // Default price if not found
    }));
  }
};

export default promoCodeService;