import { Router } from 'express';
import { z } from 'zod';
import { promoService } from '../../../../services/promo-service';
import { DiscountType, PromoType } from '@shared/schema';

const router = Router();

// Schema for validation request
const validationSchema = z.object({
  promoSlug: z.string(),
  treatments: z.array(
    z.object({
      code: z.string(),
      qty: z.number().int().positive()
    })
  ),
  clinicId: z.string().optional()
});

/**
 * Validate a promo and calculate discount
 * POST /api/v1/promos/validate
 * Public access for quote builder
 */
router.post('/', async (req, res) => {
  try {
    // Validate the request body
    const validation = validationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.format()
      });
    }

    const { promoSlug, treatments, clinicId } = validation.data;

    // Get the promo by slug
    const promo = await promoService.getPromoBySlug(promoSlug);
    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Check if promo is active
    const now = new Date();
    if (!promo.isActive || promo.startDate > now || promo.endDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Promotion is not active or has expired',
        data: {
          isValid: false,
          validationErrors: ['Promotion is not active or has expired'],
          discountAmount: 0,
          subtotal: calculateSubtotal(treatments),
          total: calculateSubtotal(treatments)
        }
      });
    }

    // If clinicId is provided, check if the clinic is eligible for this promo
    const validationErrors: string[] = [];
    if (clinicId) {
      const isClinicEligible = await promoService.isClinicEligibleForPromo(promo.id, clinicId);
      if (!isClinicEligible) {
        validationErrors.push('Selected clinic is not eligible for this promotion');
      }
    }

    // Calculate subtotal and discount
    const subtotal = calculateSubtotal(treatments);
    let discountAmount = 0;

    // Apply discount based on type
    if (promo.discountType === DiscountType.PERCENT) {
      discountAmount = (subtotal * Number(promo.discountValue)) / 100;
    } else if (promo.discountType === DiscountType.FIXED) {
      discountAmount = Math.min(subtotal, Number(promo.discountValue));
    }

    // Calculate total
    const total = Math.max(0, subtotal - discountAmount);

    // Return the validation result
    return res.json({
      success: true,
      data: {
        isValid: validationErrors.length === 0,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
        discountAmount,
        subtotal,
        total
      }
    });
  } catch (error) {
    console.error('Error validating promo:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to validate promotion'
    });
  }
});

// Helper function to calculate subtotal from treatments
function calculateSubtotal(treatments: { code: string; qty: number }[]): number {
  // In a real implementation, this would fetch prices from a database
  // For now, we'll use a simple mapping of treatment codes to prices
  const mockPrices: Record<string, number> = {
    'IMPLANT': 800,
    'CROWN': 500,
    'VENEER': 600,
    'CLEANING': 120,
    'WHITENING': 300,
    'EXTRACTION': 200,
    'ROOTCANAL': 700,
    'FILLING': 150,
    'BRIDGE': 1200,
    'DENTURE': 1500
  };

  return treatments.reduce((total, { code, qty }) => {
    const price = mockPrices[code] || 0;
    return total + (price * qty);
  }, 0);
}

export default router;