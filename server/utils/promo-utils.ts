import { promos, promoClinics, quotes } from '@shared/schema';
import { db } from '../db';
import { and, eq, or, isNull, gte } from 'drizzle-orm';
import logger from './logger';
import { BadRequestError, NotFoundError } from '../models/custom-errors';

export interface PromoCodeInfo {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: string;
  discountValue: number;
  isActive: boolean;
  startDate: Date;
  endDate?: Date | null;
  maxUses?: number | null;
  currentUses: number;
}

export interface PromoValidationResult {
  isValid: boolean;
  message?: string;
  promo?: PromoCodeInfo;
}

export interface PromoDataInput {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  expiryDate?: string | null;
  maxUses?: number | null;
  clinicId?: string | null;
  status: 'active' | 'inactive';
}

// Interface for canApplyPromoToQuote result
export interface CanApplyResult {
  canApply: boolean;
  message: string;
  promo?: PromoCodeInfo;
}

// Interface for applyPromoToQuote result
export interface ApplyPromoResult {
  success: boolean;
  message: string;
  quote?: any;  // Using any for now since we don't have the full Quote type
  promoDetails?: PromoCodeInfo;
}

// Interface for removePromoFromQuote result
export interface RemovePromoResult {
  success: boolean;
  message: string;
  quote?: any;  // Using any for now since we don't have the full Quote type
}

/**
 * Validate a promo code data object
 */
export function validatePromoData(data: PromoDataInput): PromoValidationResult {
  // Check required fields
  if (!data.code || data.code.trim() === '') {
    return { isValid: false, message: 'Promotion code is required' };
  }
  
  if (!data.type || !['percentage', 'fixed'].includes(data.type)) {
    return { isValid: false, message: 'Invalid discount type. Must be "percentage" or "fixed"' };
  }
  
  if (data.value === undefined || data.value === null || isNaN(Number(data.value))) {
    return { isValid: false, message: 'Valid discount value is required' };
  }
  
  // Validate discount value based on type
  if (data.type === 'percentage' && (data.value <= 0 || data.value > 100)) {
    return { isValid: false, message: 'Percentage discount must be between 1 and 100' };
  }
  
  if (data.type === 'fixed' && data.value <= 0) {
    return { isValid: false, message: 'Fixed discount amount must be greater than 0' };
  }
  
  // Validate expiry date if provided
  if (data.expiryDate) {
    const expiryDate = new Date(data.expiryDate);
    if (isNaN(expiryDate.getTime())) {
      return { isValid: false, message: 'Invalid expiry date format' };
    }
    
    if (expiryDate < new Date()) {
      return { isValid: false, message: 'Expiry date cannot be in the past' };
    }
  }
  
  // Validate max uses if provided
  if (data.maxUses !== undefined && data.maxUses !== null) {
    if (isNaN(Number(data.maxUses)) || Number(data.maxUses) <= 0) {
      return { isValid: false, message: 'Max uses must be a positive number' };
    }
  }
  
  return { isValid: true };
}

/**
 * Validate a promo code and return its information if valid
 */
export async function validatePromoCode(code: string): Promise<PromoValidationResult> {
  try {
    logger.info(`Validating promo code: ${code}`);
    
    if (!code || code.trim() === "") {
      return { isValid: false, message: "Promo code is required" };
    }
    
    // Find the promo in the database
    const currentDate = new Date();
    const allPromos = await db.select()
      .from(promos)
      .where(and(
        eq(promos.code, code),
        or(
          isNull(promos.endDate),
          promos.endDate.gte(currentDate)
        ),
        promos.startDate.lte(currentDate),
        or(
          isNull(promos.maxUses),
          promos.currentUses.lt(promos.maxUses)
        ),
        eq(promos.isActive, true)
      ));
    
    if (allPromos.length === 0) {
      logger.info(`No valid promo found for code: ${code}`);
      return { isValid: false, message: "Invalid or expired promo code" };
    }
    
    const promo = allPromos[0];
    logger.info(`Found valid promo: ${promo.title} (ID: ${promo.id})`);
    
    // Get applicable treatments and clinics for advanced validation if needed
    // This could be expanded for more complex validation rules
    
    return { 
      isValid: true, 
      promo: {
        id: promo.id,
        code: promo.code,
        title: promo.title,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: Number(promo.discountValue),
        isActive: promo.isActive,
        startDate: promo.startDate,
        endDate: promo.endDate,
        maxUses: promo.maxUses,
        currentUses: promo.currentUses
      }
    };
  } catch (error) {
    logger.error(`Error validating promo code ${code}:`, error);
    return { isValid: false, message: "Error validating promotion code" };
  }
}

/**
 * Find a promo by its code
 */
export async function findPromoByCode(code: string): Promise<PromoCodeInfo | null> {
  try {
    const validationResult = await validatePromoCode(code);
    
    if (!validationResult.isValid || !validationResult.promo) {
      return null;
    }
    
    return validationResult.promo;
  } catch (error) {
    logger.error(`Error finding promo by code ${code}:`, error);
    return null;
  }
}

/**
 * Find a promo by its ID
 */
export async function findPromoById(id: string): Promise<PromoCodeInfo | null> {
  try {
    const [promo] = await db.select()
      .from(promos)
      .where(eq(promos.id, id));
    
    if (!promo) {
      return null;
    }
    
    return {
      id: promo.id,
      code: promo.code,
      title: promo.title,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: Number(promo.discountValue),
      isActive: promo.isActive,
      startDate: promo.startDate,
      endDate: promo.endDate,
      maxUses: promo.maxUses,
      currentUses: promo.currentUses
    };
  } catch (error) {
    logger.error(`Error finding promo by ID ${id}:`, error);
    return null;
  }
}

/**
 * Check if a promo code can be applied to a specific quote
 */
export async function canApplyPromoToQuote(code: string, quoteId: number): Promise<CanApplyResult> {
  try {
    // First validate the promo code
    const validationResult = await validatePromoCode(code);
    
    if (!validationResult.isValid || !validationResult.promo) {
      return {
        canApply: false,
        message: validationResult.message || 'Invalid promotion code'
      };
    }
    
    // Check if the quote exists
    const [quote] = await db.select()
      .from(quotes)
      .where(eq(quotes.id, String(quoteId)));
    
    if (!quote) {
      return {
        canApply: false,
        message: 'Quote not found'
      };
    }
    
    // Check if quote already has a promo applied
    if (quote.promoId) {
      return {
        canApply: false,
        message: 'A promotion code is already applied to this quote'
      };
    }
    
    // Add any additional validation logic here
    // For example, check if promo is valid for the specific treatments in the quote
    
    return {
      canApply: true,
      message: 'Promotion code can be applied to this quote',
      promo: validationResult.promo
    };
  } catch (error) {
    logger.error(`Error checking if promo ${code} can be applied to quote ${quoteId}:`, error);
    return {
      canApply: false,
      message: 'Error checking promotion compatibility'
    };
  }
}

/**
 * Apply a promo code to a quote
 */
export async function applyPromoToQuote(code: string, quoteId: number, calculatedDiscount?: any): Promise<ApplyPromoResult> {
  try {
    // First check if the promo can be applied
    const canApplyResult = await canApplyPromoToQuote(code, quoteId);
    
    if (!canApplyResult.canApply || !canApplyResult.promo) {
      return {
        success: false,
        message: canApplyResult.message
      };
    }
    
    const promo = canApplyResult.promo;
    
    // Get the quote
    const [quote] = await db.select()
      .from(quotes)
      .where(eq(quotes.id, String(quoteId)));
    
    if (!quote) {
      return {
        success: false,
        message: 'Quote not found'
      };
    }
    
    // Calculate discount if not provided
    let discount = 0;
    if (calculatedDiscount && calculatedDiscount.discountAmount) {
      discount = Number(calculatedDiscount.discountAmount);
    } else {
      if (promo.discountType === 'percentage') {
        discount = (Number(quote.subtotal) * promo.discountValue) / 100;
      } else {
        discount = promo.discountValue > Number(quote.subtotal) ? Number(quote.subtotal) : promo.discountValue;
      }
    }
    
    // Update quote with promo information
    await db.update(quotes)
      .set({
        promoId: promo.id,
        promoCode: promo.code,
        promoType: promo.discountType,
        promoValue: promo.discountValue,
        promoAppliedAt: new Date(),
        discount: discount,
        total: Number(quote.subtotal) - discount
      })
      .where(eq(quotes.id, String(quoteId)));
    
    // Increment the promo usage count
    await db.update(promos)
      .set({
        currentUses: promo.currentUses + 1
      })
      .where(eq(promos.id, promo.id));
    
    // Get the updated quote
    const [updatedQuote] = await db.select()
      .from(quotes)
      .where(eq(quotes.id, String(quoteId)));
    
    return {
      success: true,
      message: `Successfully applied "${promo.title}" promotion with ${discount} discount`,
      quote: updatedQuote,
      promoDetails: promo
    };
  } catch (error) {
    logger.error(`Error applying promo code ${code} to quote ${quoteId}:`, error);
    return {
      success: false,
      message: 'Error applying promotion code'
    };
  }
}

/**
 * Remove a promo code from a quote
 */
export async function removePromoFromQuote(quoteId: number): Promise<RemovePromoResult> {
  try {
    // Check if quote exists
    const [quote] = await db.select()
      .from(quotes)
      .where(eq(quotes.id, String(quoteId)));
    
    if (!quote) {
      return {
        success: false,
        message: 'Quote not found'
      };
    }
    
    // Check if quote has a promo applied
    if (!quote.promoId) {
      return {
        success: false,
        message: 'No promotion code has been applied to this quote'
      };
    }
    
    // Update quote to remove promo information
    await db.update(quotes)
      .set({
        promoId: null,
        promoCode: null,
        promoType: null, 
        promoValue: null,
        promoAppliedAt: null,
        discount: 0,
        total: Number(quote.subtotal)
      })
      .where(eq(quotes.id, String(quoteId)));
    
    // Get the updated quote
    const [updatedQuote] = await db.select()
      .from(quotes)
      .where(eq(quotes.id, String(quoteId)));
    
    return { 
      success: true, 
      message: 'Successfully removed promotion code from quote',
      quote: updatedQuote
    };
  } catch (error) {
    logger.error(`Error removing promo code from quote ${quoteId}:`, error);
    return {
      success: false,
      message: 'Error removing promotion code'
    };
  }
}

/**
 * Apply a promo code to a quote
 * @deprecated Use applyPromoToQuote instead
 */
export async function applyPromoCodeToQuote(quoteId: string, code: string): Promise<{ success: boolean; message: string; discount?: number }> {
  try {
    // Validate the promo code
    const validationResult = await validatePromoCode(code);
    
    if (!validationResult.isValid) {
      return { success: false, message: validationResult.message || 'Invalid promo code' };
    }
    
    const promo = validationResult.promo!;
    
    // Check if quote exists
    const [quote] = await db.select()
      .from(quotes)
      .where(eq(quotes.id, quoteId));
    
    if (!quote) {
      return { success: false, message: 'Quote not found' };
    }
    
    // Check if quote already has a promo applied
    if (quote.promoId) {
      return { success: false, message: 'A promotion code is already applied to this quote' };
    }
    
    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'percentage') {
      // Apply percentage discount
      discount = (Number(quote.subtotal) * promo.discountValue) / 100;
    } else {
      // Apply fixed discount
      discount = promo.discountValue > Number(quote.subtotal) ? Number(quote.subtotal) : promo.discountValue;
    }
    
    // Update quote with promo information
    await db.update(quotes)
      .set({
        promoId: promo.id,
        promoCode: promo.code,
        promoType: promo.discountType,
        promoValue: promo.discountValue,
        promoAppliedAt: new Date(),
        discount: discount,
        total: Number(quote.subtotal) - discount
      })
      .where(eq(quotes.id, quoteId));
    
    // Increment the promo usage count
    await db.update(promos)
      .set({
        currentUses: promo.currentUses + 1
      })
      .where(eq(promos.id, promo.id));
    
    return { 
      success: true, 
      message: `Successfully applied ${promo.title} promotion`,
      discount: discount
    };
  } catch (error) {
    logger.error(`Error applying promo code to quote ${quoteId}:`, error);
    return { success: false, message: 'Error applying promo code' };
  }
}

/**
 * Remove a promo code from a quote
 * @deprecated Use removePromoFromQuote instead
 */
export async function removePromoCodeFromQuote(quoteId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if quote exists
    const [quote] = await db.select()
      .from(quotes)
      .where(eq(quotes.id, quoteId));
    
    if (!quote) {
      return { success: false, message: 'Quote not found' };
    }
    
    // Check if quote has a promo applied
    if (!quote.promoId) {
      return { success: false, message: 'No promotion code has been applied to this quote' };
    }
    
    // Update quote to remove promo information
    await db.update(quotes)
      .set({
        promoId: null,
        promoCode: null,
        promoType: null, 
        promoValue: null,
        promoAppliedAt: null,
        discount: 0,
        total: Number(quote.subtotal)
      })
      .where(eq(quotes.id, quoteId));
    
    return { 
      success: true, 
      message: 'Successfully removed promotion code from quote'
    };
  } catch (error) {
    logger.error(`Error removing promo code from quote ${quoteId}:`, error);
    return { success: false, message: 'Error removing promo code' };
  }
}