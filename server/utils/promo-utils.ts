import { db } from "../db";
import { promos, promoItems, promoClinics, DiscountType, PromoType } from "@shared/schema";
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