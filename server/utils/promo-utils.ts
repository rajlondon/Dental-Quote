/**
 * Utility functions for handling promotions and coupon codes
 */
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { promos, quotes, promoClinics } from '@shared/schema';
import { calculateDiscountedPrice } from './discount-calculator';
import { logger } from './logger';

/**
 * Apply a promotion to a quote
 * @param quote The quote to apply the promotion to
 * @param promo The promotion to apply
 * @returns The updated quote
 */
export async function applyPromoToQuote(quote: any, promo: any) {
  // Validate quote exists
  if (!quote) {
    throw new Error('Quote not found');
  }

  // Validate promo is active
  if (!promo.isActive) {
    throw new Error('Promotion is not active');
  }

  // Validate promo is valid for this clinic
  const validForClinic = await db.query.promoClinics.findFirst({
    where: (promoClinic, { and, eq }) => and(
      eq(promoClinic.promoId, promo.id),
      eq(promoClinic.clinicId, quote.clinicId)
    )
  });

  if (!validForClinic) {
    throw new Error('Promotion is not valid for this clinic');
  }

  // Validate city matching if city-specific promo
  if (promo.cityCode && quote.cityCode && promo.cityCode !== quote.cityCode) {
    throw new Error('Promotion is not valid for this city');
  }

  // Calculate discount based on promo type and quote subtotal
  let discount = 0;
  if (promo.discountType === 'PERCENT') {
    // Percentage discount
    const discountPercentage = parseFloat(promo.discountValue);
    const newTotal = calculateDiscountedPrice(quote.subtotal, discountPercentage);
    discount = quote.subtotal - newTotal;
  } else if (promo.discountType === 'FIXED') {
    // Fixed amount discount
    const discountAmount = parseFloat(promo.discountValue);
    discount = Math.min(discountAmount, quote.subtotal); // Don't discount more than the subtotal
  }

  // Round to 2 decimal places
  discount = parseFloat(discount.toFixed(2));

  // Update quote with new discount and total
  const updatedQuote = await db.update(quotes)
    .set({
      discount: discount.toString(),
      total: (quote.subtotal - discount).toString(),
      promoId: promo.id,
      updatedAt: new Date()
    })
    .where(eq(quotes.id, quote.id))
    .returning();

  // Log the application of the promo
  logger.info(`Applied promo ${promo.id} to quote ${quote.id}: £${discount} discount`);

  return updatedQuote[0];
}