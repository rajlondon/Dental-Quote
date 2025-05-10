import { db } from "../db";
import { promos, promoItems, promoClinics, quoteRequests, DiscountType, PromoType } from "@shared/schema";
import { eq, and, or, inArray, isNull, isNotNull } from "drizzle-orm";
import { z } from "zod";
import logger from "./logger";

export interface PromoCodeInfo {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  endDate: Date | null;
  type: PromoType;
  maxUses: number | null;
  currentUses: number;
  applicableTreatments: string[];
  applicableClinics: number[];
  isActive: boolean;
}

export interface PromoValidationResult {
  isValid: boolean;
  message: string;
  promo?: PromoCodeInfo;
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
    logger.info(`Found valid promo: ${promo.name} (ID: ${promo.id})`);
    
    // Get applicable treatments
    const promoItemsData = await db.select()
      .from(promoItems)
      .where(eq(promoItems.promoId, promo.id));
    
    const applicableTreatments = promoItemsData.map(item => item.itemId);
    
    // Get applicable clinics
    const promoClinicsData = await db.select()
      .from(promoClinics)
      .where(eq(promoClinics.promoId, promo.id));
    
    const applicableClinics = promoClinicsData.map(clinic => clinic.clinicId);
    
    // Return formatted promo info
    const promoInfo: PromoCodeInfo = {
      id: promo.id,
      code: promo.code,
      name: promo.name,
      description: promo.description || "",
      discountType: promo.discountType as DiscountType,
      discountValue: Number(promo.discountValue),
      startDate: promo.startDate,
      endDate: promo.endDate,
      type: promo.type as PromoType,
      maxUses: promo.maxUses,
      currentUses: promo.currentUses,
      applicableTreatments,
      applicableClinics,
      isActive: promo.isActive
    };
    
    return {
      isValid: true,
      message: "Promo code is valid",
      promo: promoInfo
    };
  } catch (error) {
    logger.error("Error validating promo code:", error);
    return { isValid: false, message: "Error validating promo code" };
  }
}

/**
 * Increment the usage count for a promo code
 */
export async function incrementPromoCodeUsage(promoId: string): Promise<boolean> {
  try {
    logger.info(`Incrementing usage count for promo ID: ${promoId}`);
    
    await db.update(promos)
      .set({ 
        currentUses: promos.currentUses + 1,
        updatedAt: new Date()
      })
      .where(eq(promos.id, promoId));
    
    logger.info(`Successfully incremented usage count for promo ID: ${promoId}`);
    return true;
  } catch (error) {
    logger.error(`Error incrementing promo usage for ID ${promoId}:`, error);
    return false;
  }
}

/**
 * Calculate the discount amount based on promo type and original price
 */
export function calculateDiscount(
  originalPrice: number, 
  discountType: DiscountType, 
  discountValue: number
): { discountAmount: number, finalPrice: number } {
  
  // Ensure inputs are valid numbers
  originalPrice = Number(originalPrice);
  discountValue = Number(discountValue);
  
  if (isNaN(originalPrice) || isNaN(discountValue) || originalPrice < 0 || discountValue < 0) {
    logger.warn(`Invalid discount calculation parameters: originalPrice=${originalPrice}, discountValue=${discountValue}`);
    return { discountAmount: 0, finalPrice: originalPrice };
  }
  
  let discountAmount = 0;
  
  if (discountType === DiscountType.PERCENT) {
    // Cap percentage at 100%
    const cappedPercentage = Math.min(discountValue, 100);
    discountAmount = originalPrice * (cappedPercentage / 100);
  } else if (discountType === DiscountType.FIXED) {
    // Fixed amount discount can't exceed original price
    discountAmount = Math.min(discountValue, originalPrice);
  }
  
  // Round to 2 decimal places
  discountAmount = Math.round(discountAmount * 100) / 100;
  const finalPrice = Math.round((originalPrice - discountAmount) * 100) / 100;
  
  return { discountAmount, finalPrice };
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
export async function findPromoById(promoId: string): Promise<PromoCodeInfo | null> {
  try {
    logger.info(`Finding promo by ID: ${promoId}`);
    
    // Find the promo in the database
    const promoData = await db.select()
      .from(promos)
      .where(eq(promos.id, promoId));
    
    if (promoData.length === 0) {
      logger.info(`No promo found with ID: ${promoId}`);
      return null;
    }
    
    const promo = promoData[0];
    
    // Get applicable treatments
    const promoItemsData = await db.select()
      .from(promoItems)
      .where(eq(promoItems.promoId, promo.id));
    
    const applicableTreatments = promoItemsData.map(item => item.itemCode);
    
    // Get applicable clinics
    const promoClinicsData = await db.select()
      .from(promoClinics)
      .where(eq(promoClinics.promoId, promo.id));
    
    const applicableClinics = promoClinicsData.map(clinic => clinic.clinicId);
    
    // Format the info
    const promoInfo: PromoCodeInfo = {
      id: promo.id,
      code: promo.code || "",
      name: promo.title || "",
      description: promo.description || "",
      discountType: promo.discountType as DiscountType,
      discountValue: Number(promo.discountValue),
      startDate: promo.startDate,
      endDate: promo.endDate,
      type: promo.promoType as PromoType,
      maxUses: promo.maxUses,
      currentUses: promo.currentUses || 0,
      applicableTreatments,
      applicableClinics,
      isActive: promo.isActive
    };
    
    return promoInfo;
  } catch (error) {
    logger.error(`Error finding promo by ID ${promoId}:`, error);
    return null;
  }
}

/**
 * Check if a promo can be applied to a quote
 */
export async function canApplyPromoToQuote(
  promoCode: string, 
  quoteId: number
): Promise<{ canApply: boolean; message: string; promo?: PromoCodeInfo }> {
  try {
    logger.info(`Checking if promo code ${promoCode} can be applied to quote ${quoteId}`);
    
    // Validate the promo code first
    const validationResult = await validatePromoCode(promoCode);
    
    if (!validationResult.isValid || !validationResult.promo) {
      return { 
        canApply: false, 
        message: validationResult.message || "Invalid promo code" 
      };
    }
    
    // Get the quote
    const quote = await db.select()
      .from(quoteRequests)
      .where(eq(quoteRequests.id, quoteId));
    
    if (quote.length === 0) {
      return { 
        canApply: false, 
        message: "Quote not found" 
      };
    }
    
    // Check if quote already has a promo
    if (quote[0].promoCode) {
      return { 
        canApply: false, 
        message: `Quote already has promo code '${quote[0].promoCode}' applied` 
      };
    }
    
    // If the promo has applicableClinics, check if the quote's clinic is eligible
    if (validationResult.promo.applicableClinics.length > 0) {
      const quoteClinicId = quote[0].selectedClinicId;
      
      if (!quoteClinicId || !validationResult.promo.applicableClinics.includes(quoteClinicId)) {
        return { 
          canApply: false, 
          message: "This promo is not applicable to the selected clinic" 
        };
      }
    }
    
    // All checks passed
    return { 
      canApply: true, 
      message: "Promo can be applied to this quote", 
      promo: validationResult.promo 
    };
  } catch (error) {
    logger.error(`Error checking if promo can be applied: ${error}`);
    return { 
      canApply: false, 
      message: "Error checking promo eligibility" 
    };
  }
}

/**
 * Apply a promo code to a quote
 */
export async function applyPromoToQuote(
  promoCode: string, 
  quoteId: number,
  calculatedDiscount?: { subtotal: number; discountAmount: number; totalAfterDiscount: number }
): Promise<{
  success: boolean;
  message: string;
  quote?: any;
  promoDetails?: PromoCodeInfo;
}> {
  try {
    logger.info(`Applying promo code ${promoCode} to quote ${quoteId}`);
    
    // Check if promo can be applied
    const canApplyResult = await canApplyPromoToQuote(promoCode, quoteId);
    
    if (!canApplyResult.canApply || !canApplyResult.promo) {
      return {
        success: false,
        message: canApplyResult.message
      };
    }
    
    const promo = canApplyResult.promo;
    
    // Get current quote data to calculate discount amounts if not provided
    if (!calculatedDiscount) {
      const quoteData = await db.select()
        .from(quoteRequests)
        .where(eq(quoteRequests.id, quoteId));
      
      if (quoteData.length === 0) {
        return {
          success: false,
          message: "Quote not found"
        };
      }
      
      // Extract estimated price from quote data
      const quote = quoteData[0];
      let subtotal = 0;
      
      // Try to get the price from quoteData JSON field
      if (quote.quoteData) {
        try {
          const parsedData = typeof quote.quoteData === 'string' 
            ? JSON.parse(quote.quoteData) 
            : quote.quoteData;
            
          // Check if there's an estimated total price in the parsed data
          if (parsedData.totalPrice || parsedData.estimatedPrice) {
            subtotal = parsedData.totalPrice || parsedData.estimatedPrice;
          } else if (Array.isArray(parsedData.treatments)) {
            // Calculate from treatments
            subtotal = parsedData.treatments.reduce(
              (sum: number, t: any) => sum + (t.price || 0) * (t.quantity || 1), 
              0
            );
          }
        } catch (error) {
          logger.error(`Error parsing quoteData JSON: ${error}`);
        }
      }
      
      // If we still don't have a subtotal, use estimatedPrice or default
      if (subtotal <= 0) {
        subtotal = Number(quote.estimatedPrice) || 0;
      }
      
      // Calculate discount
      const { discountAmount, finalPrice } = calculateDiscount(
        subtotal,
        promo.discountType,
        promo.discountValue
      );
      
      calculatedDiscount = {
        subtotal,
        discountAmount,
        totalAfterDiscount: finalPrice
      };
    }
    
    // Update the quote with promo details
    const updatedQuote = await db.update(quoteRequests)
      .set({
        promoId: promo.id,
        promoCode: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue.toString(),
        subtotal: calculatedDiscount.subtotal.toString(),
        totalAfterDiscount: calculatedDiscount.totalAfterDiscount.toString(),
        updatedAt: new Date()
      })
      .where(eq(quoteRequests.id, quoteId))
      .returning();
    
    // Increment the usage count for the promo
    await incrementPromoCodeUsage(promo.id);
    
    return {
      success: true,
      message: "Promo code applied successfully",
      quote: updatedQuote[0],
      promoDetails: promo
    };
  } catch (error) {
    logger.error(`Error applying promo to quote: ${error}`);
    return {
      success: false,
      message: `Error applying promo code: ${error}`
    };
  }
}

/**
 * Remove a promo code from a quote
 */
export async function removePromoFromQuote(
  quoteId: number
): Promise<{
  success: boolean;
  message: string;
  quote?: any;
}> {
  try {
    logger.info(`Removing promo from quote ${quoteId}`);
    
    // Get the quote to check if it has a promo
    const quoteData = await db.select()
      .from(quoteRequests)
      .where(eq(quoteRequests.id, quoteId));
    
    if (quoteData.length === 0) {
      return {
        success: false,
        message: "Quote not found"
      };
    }
    
    const quote = quoteData[0];
    
    // Check if the quote has a promo applied
    if (!quote.promoCode && !quote.promoId) {
      return {
        success: false,
        message: "No promo code is applied to this quote"
      };
    }
    
    // Remove the promo from the quote
    const updatedQuote = await db.update(quoteRequests)
      .set({
        promoId: null,
        promoCode: null,
        discountType: null,
        discountValue: null,
        subtotal: null,
        totalAfterDiscount: null,
        updatedAt: new Date()
      })
      .where(eq(quoteRequests.id, quoteId))
      .returning();
    
    return {
      success: true,
      message: "Promo code removed successfully",
      quote: updatedQuote[0]
    };
  } catch (error) {
    logger.error(`Error removing promo from quote: ${error}`);
    return {
      success: false,
      message: `Error removing promo code: ${error}`
    };
  }
}