/**
 * Promo Code Service
 * Handles validation and application of promo codes
 */
import { treatmentPackages } from '../routes/treatment-package-routes';
import { specialOffers } from '../routes/special-offers-routes-fixed';
import { PackageTreatment, PromoCode, PackageData } from '../models/promo-code';

interface ValidationResult {
  valid: boolean;
  code?: string;
  type?: 'discount' | 'package';
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  error?: string;
  appliedTo?: 'special_offer' | 'treatment_package';
  itemId?: string;
  title?: string;
  clinicId?: string;
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

// Sample package codes for testing
const packagePromoCodes: PromoCode[] = [
  {
    id: 'pkg001',
    code: 'IMPLANT2023',
    type: 'package',
    isActive: true,
    packageData: {
      name: 'Premium Implant Package',
      description: 'Complete implant treatment with consultation and aftercare',
      treatments: [
        { id: 'dental-implants', quantity: 2 },
        { id: 'crowns', quantity: 2 },
        { id: 'cleaning', quantity: 1 }
      ],
      originalPrice: 1700,
      packagePrice: 1400
    },
    clinicId: '1' // Associated with clinic ID 1
  },
  {
    id: 'pkg002',
    code: 'SMILE2023',
    type: 'package',
    isActive: true,
    packageData: {
      name: 'Smile Makeover Package',
      description: 'Transform your smile with our complete cosmetic package',
      treatments: [
        { id: 'veneers', quantity: 4 },
        { id: 'whitening', quantity: 1 },
        { id: 'cleaning', quantity: 1 }
      ],
      originalPrice: 1350,
      packagePrice: 1100
    },
    clinicId: '2' // Associated with clinic ID 2
  }
];

export const promoCodeService = {
  // Validate a promo code
  async validateCode(code: string): Promise<ValidationResult> {
    // Normalize code to uppercase for case-insensitive comparison
    const normalizedCode = code.toUpperCase();
    
    try {
      // Check for package promo codes first
      const packagePromo = this.findPackagePromoCode(normalizedCode);
      if (packagePromo) {
        return {
          valid: true,
          code: packagePromo.code,
          type: 'package',
          title: packagePromo.packageData?.name || 'Treatment Package',
          clinicId: packagePromo.clinicId
        };
      }
      
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
              type: 'discount',
              discountType: offer.discount_type,
              discountValue: offer.discount_value,
              appliedTo: 'special_offer',
              itemId: offer.id,
              title: offer.title,
              clinicId: clinicId
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
            type: 'discount',
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
          type: 'discount',
          discountType: 'percentage',
          discountValue: 50,
          title: 'Test 50% Off'
        };
      }
      
      if (normalizedCode === 'SAVE100') {
        return {
          valid: true,
          code: 'SAVE100',
          type: 'discount',
          discountType: 'fixed_amount',
          discountValue: 100,
          title: '£100 Off Any Treatment'
        };
      }
      
      // Special package test code
      if (normalizedCode === 'PACKAGE') {
        return {
          valid: true,
          code: 'PACKAGE',
          type: 'package',
          title: 'Test Package'
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
  
  // Find a package promo code by code
  findPackagePromoCode(code: string): PromoCode | null {
    const normalizedCode = code.toUpperCase();
    return packagePromoCodes.find(promo => 
      promo.type === 'package' && 
      promo.code.toUpperCase() === normalizedCode &&
      promo.isActive
    ) || null;
  },
  
  // Get package promo code by code
  async getPackagePromoCode(code: string): Promise<PromoCode | null> {
    return this.findPackagePromoCode(code);
  },
  
  // Get treatments for a package
  async getPackageTreatments(packageTreatments: PackageTreatment[]): Promise<any[]> {
    try {
      // Get treatment details for each package treatment
      const treatments = [];
      
      for (const item of packageTreatments) {
        const treatmentDetails = await this.getMockTreatment(item.id);
        if (treatmentDetails) {
          treatments.push({
            ...treatmentDetails,
            quantity: item.quantity || 1
          });
        }
      }
      
      return treatments;
    } catch (error) {
      console.error('Error getting package treatments:', error);
      throw new Error('Failed to get package treatments');
    }
  },
  
  // Get a single mock treatment by ID
  async getMockTreatment(treatmentId: string) {
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
    
    if (!mockPrices[treatmentId]) {
      return null;
    }
    
    return {
      id: treatmentId,
      name: treatmentId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      price: mockPrices[treatmentId]
    };
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