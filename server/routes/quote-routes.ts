import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Promo code validation schema
const PromoCodeSchema = z.object({
  code: z.string().min(3).max(20)
});

// Quote submission schema
const TreatmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
  category: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional()
});

const PatientInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  preferredDate: z.string().optional(),
  notes: z.string().optional()
});

const QuoteSubmissionSchema = z.object({
  patientInfo: PatientInfoSchema,
  treatments: z.array(TreatmentSchema),
  promoCode: z.string().nullable(),
  discountPercent: z.number(),
  subtotal: z.number(),
  total: z.number()
});

// Known promo codes with their discount percentages
const promoCodes: Record<string, { discountPercentage: number, description: string }> = {
  'SUMMER15': { discountPercentage: 15, description: 'Summer Special Offer' },
  'DENTAL25': { discountPercentage: 25, description: 'Premium Dental Discount' },
  'NEWPATIENT': { discountPercentage: 20, description: 'New Patient Welcome Discount' },
  'TEST10': { discountPercentage: 10, description: 'Test Discount' }
};

// Validate promo code endpoint
router.post('/promo-codes/validate', (req, res) => {
  try {
    const { code } = PromoCodeSchema.parse(req.body);
    const promoCode = code.toUpperCase();
    
    // Check if promo code exists
    if (promoCodes[promoCode]) {
      return res.json({
        valid: true,
        discountPercentage: promoCodes[promoCode].discountPercentage,
        description: promoCodes[promoCode].description
      });
    }
    
    return res.json({
      valid: false,
      message: 'Invalid promo code'
    });
  } catch (error) {
    console.error('Promo code validation error:', error);
    res.status(400).json({ 
      valid: false,
      message: 'Invalid request format'
    });
  }
});

// Save quote endpoint
router.post('/save', (req, res) => {
  try {
    const quoteData = QuoteSubmissionSchema.parse(req.body);
    
    // Generate a quote ID
    const quoteId = `quote-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // In a real implementation, we would save the quote to a database
    console.log(`[QUOTE SYSTEM] Saved quote ${quoteId}:`, quoteData);
    
    res.status(200).json({
      success: true,
      quoteId,
      message: 'Quote saved successfully'
    });
  } catch (error) {
    console.error('Quote save error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid quote data'
    });
  }
});

// Retrieve quote by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  // In a real implementation, we would fetch the quote from a database
  // For now, we'll return a not found response
  res.status(404).json({
    success: false,
    message: 'Quote not found'
  });
});

export default router;