import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import logger from './logger';
import { promos, quotes, promoClinics, DiscountType, PromoType } from '@shared/schema';
import { eq, and, gt, lte, sql, isNull, or, count } from 'drizzle-orm';
import slugify from 'slugify';
import { BadRequestError, NotFoundError, ConflictError } from '../models/custom-errors';
import { trackPromoCodeApplied, trackPromoCodeRemoved } from './analytics';

/**
 * Find a promo by its ID
 */
export async function findPromoById(promoId: string) {
  try {
    const [promo] = await db.select().from(promos).where(eq(promos.id, promoId));
    return promo;
  } catch (error) {
    logger.error('Error finding promo by ID:', error);
    throw error;
  }
}

/**
 * Find a promo by its code
 */
export async function findPromoByCode(code: string) {
  try {
    const [promo] = await db.select().from(promos).where(eq(promos.code, code));
    return promo;
  } catch (error) {
    logger.error('Error finding promo by code:', error);
    throw error;
  }
}

/**
 * Validate if a promo code is valid and can be used
 */
export async function validatePromoCode(code: string) {
  try {
    const promo = await findPromoByCode(code);
    
    if (!promo) {
      return {
        valid: false,
        message: 'Invalid promo code',
        promo: null
      };
    }
    
    const now = new Date();
    
    // Check if promo is active
    if (promo.status !== 'active') {
      return {
        valid: false,
        message: 'This promo code is no longer active',
        promo
      };
    }
    
    // Check if promo is within valid date range
    if (promo.startDate && promo.startDate > now) {
      return {
        valid: false,
        message: 'This promo code is not yet active',
        promo
      };
    }
    
    if (promo.endDate && promo.endDate < now) {
      return {
        valid: false,
        message: 'This promo code has expired',
        promo
      };
    }
    
    // Check if promo has reached max usage limit (if set)
    if (promo.maxUses !== null && promo.uses >= promo.maxUses) {
      return {
        valid: false,
        message: 'This promo code has reached its usage limit',
        promo
      };
    }
    
    return {
      valid: true,
      message: 'Valid promo code',
      promo
    };
  } catch (error) {
    logger.error('Error validating promo code:', error);
    throw error;
  }
}

/**
 * Check if a promo can be applied to a specific quote
 */
export async function canApplyPromoToQuote(quoteId: number, promoId: string) {
  try {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId));
    
    if (!quote) {
      return {
        canApply: false,
        message: 'Quote not found'
      };
    }
    
    // Check if quote already has a promo applied
    if (quote.promoId && quote.promoId !== promoId) {
      return {
        canApply: false,
        message: 'Quote already has a different promo code applied'
      };
    }
    
    const promo = await findPromoById(promoId);
    if (!promo) {
      return {
        canApply: false,
        message: 'Promo not found'
      };
    }
    
    // If the promo is clinic-specific, check if it applies to this quote's clinic
    if (promo.promoType === 'clinic-specific') {
      // Get the clinic IDs this promo applies to
      const clinicRelations = await db
        .select()
        .from(promo_clinics)
        .where(eq(promo_clinics.promoId, promoId));
      
      const validClinicIds = clinicRelations.map(rel => rel.clinicId);
      
      if (!validClinicIds.includes(quote.clinicId)) {
        return {
          canApply: false,
          message: 'This promo code is not valid for the clinic in this quote'
        };
      }
    }
    
    // If we get here, the promo can be applied
    return {
      canApply: true,
      message: 'Promo can be applied to this quote'
    };
  } catch (error) {
    logger.error('Error checking if promo can be applied to quote:', error);
    throw error;
  }
}

/**
 * Apply a promo to a quote
 */
export async function applyPromoToQuote(quoteId: number, promoId: string, userId?: number) {
  try {
    // First, check if the promo can be applied
    const { canApply, message } = await canApplyPromoToQuote(quoteId, promoId);
    
    if (!canApply) {
      throw new BadRequestError(message);
    }
    
    const promo = await findPromoById(promoId);
    if (!promo) {
      throw new NotFoundError('Promo not found');
    }
    
    // Get quote details
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId));
    
    // Calculate discount amount
    let discountAmount = 0;
    let discountType = promo.discountType;
    let originalTotal = parseFloat(quote.totalAmount);
    
    if (promo.discountType === 'percentage') {
      // Calculate percentage discount
      const discountPercentage = parseFloat(promo.discountValue);
      discountAmount = (originalTotal * discountPercentage) / 100;
    } else {
      // Fixed amount discount
      discountAmount = parseFloat(promo.discountValue);
      
      // Make sure discount doesn't exceed total
      if (discountAmount > originalTotal) {
        discountAmount = originalTotal;
      }
    }
    
    const discountedTotal = originalTotal - discountAmount;
    
    // Update the quote with promo details
    await db
      .update(quotes)
      .set({
        promoId: promoId,
        promoCode: promo.code,
        discountAmount: discountAmount.toString(),
        discountType: discountType,
        discountedTotal: discountedTotal.toString()
      })
      .where(eq(quotes.id, quoteId));
    
    // Increment the promo usage count
    await db
      .update(promos)
      .set({
        uses: promo.uses + 1,
        updatedAt: new Date()
      })
      .where(eq(promos.id, promoId));
    
    // Track the promo application in analytics
    trackPromoCodeApplied({
      promoId,
      promoCode: promo.code,
      quoteId,
      userId,
      discountAmount,
      discountType,
    });
    
    return {
      success: true,
      message: 'Promo code applied successfully',
      discountAmount,
      discountType,
      discountedTotal
    };
  } catch (error) {
    logger.error('Error applying promo to quote:', error);
    throw error;
  }
}

/**
 * Apply a promo code to a quote (uses code lookup)
 */
export async function applyPromoCodeToQuote(quoteId: number, code: string, userId?: number) {
  try {
    // Validate the promo code first
    const { valid, message, promo } = await validatePromoCode(code);
    
    if (!valid || !promo) {
      throw new BadRequestError(message);
    }
    
    // Now apply the promo to the quote
    return await applyPromoToQuote(quoteId, promo.id, userId);
  } catch (error) {
    logger.error('Error applying promo code to quote:', error);
    throw error;
  }
}

/**
 * Remove a promo from a quote
 */
export async function removePromoFromQuote(quoteId: number, userId?: number) {
  try {
    // Get current quote details
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId));
    
    if (!quote) {
      throw new NotFoundError('Quote not found');
    }
    
    if (!quote.promoId) {
      return {
        success: false,
        message: 'No promo code applied to this quote'
      };
    }
    
    // Store for analytics
    const promoId = quote.promoId;
    const promoCode = quote.promoCode;
    
    // Reset promo fields in the quote
    await db
      .update(quotes)
      .set({
        promoId: null,
        promoCode: null,
        discountAmount: null,
        discountType: null,
        discountedTotal: null
      })
      .where(eq(quotes.id, quoteId));
    
    // Track removal in analytics
    trackPromoCodeRemoved({
      promoId,
      promoCode,
      quoteId,
      userId
    });
    
    return {
      success: true,
      message: 'Promo code removed successfully',
      originalTotal: quote.totalAmount
    };
  } catch (error) {
    logger.error('Error removing promo from quote:', error);
    throw error;
  }
}

/**
 * Remove promo code from quote (alias for removePromoFromQuote)
 */
export async function removePromoCodeFromQuote(quoteId: number, userId?: number) {
  return removePromoFromQuote(quoteId, userId);
}

/**
 * Generate a unique slug for a promo
 */
export async function generatePromoSlug(title: string) {
  const baseSlug = slugify(title, { lower: true, strict: true });
  
  // Check if there's any promo with this slug
  const existingPromos = await db
    .select()
    .from(promos)
    .where(eq(promos.slug, baseSlug));
  
  if (existingPromos.length === 0) {
    return baseSlug;
  }
  
  // Add a unique identifier
  return `${baseSlug}-${Date.now().toString().slice(-4)}`;
}

/**
 * Generate a unique promo code
 */
export async function generatePromoCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // removed confusing characters
  let code = '';
  let isUnique = false;
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if code already exists
    const existingPromo = await findPromoByCode(code);
    isUnique = !existingPromo;
  }
  
  return code;
}

/**
 * Calculate the discount for a quote based on a promo
 */
export function calculateDiscount(totalAmount: number, promo: { discountType: DiscountType, discountValue: string }) {
  let discountAmount = 0;
  
  if (promo.discountType === 'percentage') {
    const discountPercentage = parseFloat(promo.discountValue);
    discountAmount = (totalAmount * discountPercentage) / 100;
  } else {
    // Fixed amount discount
    discountAmount = parseFloat(promo.discountValue);
    
    // Make sure discount doesn't exceed total
    if (discountAmount > totalAmount) {
      discountAmount = totalAmount;
    }
  }
  
  return {
    discountAmount,
    discountedTotal: totalAmount - discountAmount
  };
}