/**
 * Utility functions for handling promotions and coupon codes
 */
import { pool } from '../db';
import log from './logger';

interface Promo {
  id: string;
  title: string;
  code: string;
  discount_type: 'PERCENT' | 'AMOUNT';
  discount_value: number;
  is_active: boolean;
  start_date: Date;
  end_date: Date;
  [key: string]: any;
}

interface Quote {
  id: string;
  subtotal: number;
  discount?: number;
  total_price: number;
  promo_id?: string;
  [key: string]: any;
}

/**
 * Find a promo by its code
 * @param code The promo code to search for
 * @returns The promo object if found, otherwise null
 */
export async function findPromoByCode(code: string): Promise<Promo | null> {
  try {
    if (!code?.trim()) return null;

    const query = `
      SELECT p.* FROM promos p
      WHERE p.code = $1 
      AND p.is_active = true
      AND p.start_date <= NOW() 
      AND p.end_date >= NOW()
    `;
    
    const result = await pool.query(query, [code.trim().toUpperCase()]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as Promo;
  } catch (err) {
    log.error('Error finding promo by code:', err);
    return null;
  }
}

/**
 * Find a promo by its ID
 * @param id The promo ID to search for
 * @returns The promo object if found, otherwise null
 */
export async function findPromoById(id: string): Promise<Promo | null> {
  try {
    if (!id) return null;

    const query = `
      SELECT p.* FROM promos p
      WHERE p.id = $1 
      AND p.is_active = true
      AND p.start_date <= NOW() 
      AND p.end_date >= NOW()
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as Promo;
  } catch (err) {
    log.error('Error finding promo by ID:', err);
    return null;
  }
}

/**
 * Check if a promo can be applied to a specific quote
 * @param promo The promo to check
 * @param quoteId The quote ID
 * @returns Boolean indicating if the promo can be applied
 */
export async function canApplyPromoToQuote(promo: Promo, quoteId: string): Promise<boolean> {
  try {
    if (!promo || !quoteId) return false;
    
    // Get the quote details to check clinic association
    const quoteQuery = `
      SELECT q.clinic_id FROM quotes q
      WHERE q.id = $1
    `;
    
    const quoteResult = await pool.query(quoteQuery, [quoteId]);
    
    if (quoteResult.rows.length === 0) {
      return false;
    }
    
    const clinicId = quoteResult.rows[0].clinic_id;
    
    // Check if the promo is associated with this clinic
    const promoClinicQuery = `
      SELECT * FROM promo_clinics pc
      WHERE pc.promo_id = $1 AND pc.clinic_id = $2
    `;
    
    const promoClinicResult = await pool.query(promoClinicQuery, [promo.id, clinicId]);
    
    return promoClinicResult.rows.length > 0;
  } catch (err) {
    log.error('Error checking if promo can be applied to quote:', err);
    return false;
  }
}

/**
 * Calculate discount amount based on promo and quote total
 * @param promo The promo to apply
 * @param subtotal The quote subtotal
 * @returns The discount amount
 */
export function calculateDiscountAmount(promo: Promo, subtotal: number): number {
  if (!promo || subtotal <= 0) return 0;
  
  if (promo.discount_type === 'PERCENT') {
    // Calculate percentage discount
    return Math.round((subtotal * (promo.discount_value / 100)) * 100) / 100;
  } else {
    // Fixed amount discount, cannot exceed subtotal
    return Math.min(promo.discount_value, subtotal);
  }
}

/**
 * Apply a promotion to a quote
 * @param quoteId The quote ID to apply the promotion to
 * @param promo The promotion to apply
 * @returns The updated quote or null if application failed
 */
export async function applyPromoToQuote(quoteId: string, promo: Promo): Promise<Quote | null> {
  try {
    if (!quoteId || !promo) return null;
    
    // Get the current quote
    const quoteQuery = `
      SELECT * FROM quotes
      WHERE id = $1
    `;
    
    const quoteResult = await pool.query(quoteQuery, [quoteId]);
    
    if (quoteResult.rows.length === 0) {
      return null;
    }
    
    const quote = quoteResult.rows[0] as Quote;
    
    // Calculate discount
    const subtotal = Number(quote.subtotal) || 0;
    const discountAmount = calculateDiscountAmount(promo, subtotal);
    const finalPrice = Math.max(0, subtotal - discountAmount);
    
    // Update the quote with discount details
    const updateQuery = `
      UPDATE quotes
      SET 
        subtotal = $1,
        discount = $2,
        total_price = $3,
        promo_id = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    
    const updateResult = await pool.query(updateQuery, [
      subtotal, 
      discountAmount, 
      finalPrice, 
      promo.id, 
      quoteId
    ]);
    
    if (updateResult.rows.length === 0) {
      return null;
    }
    
    return updateResult.rows[0] as Quote;
  } catch (err) {
    log.error('Error applying promo to quote:', err);
    return null;
  }
}

/**
 * Remove a promotion from a quote
 * @param quoteId The quote ID to remove the promotion from
 * @returns The updated quote or null if the operation failed
 */
export async function removePromoFromQuote(quoteId: string): Promise<Quote | null> {
  try {
    if (!quoteId) return null;
    
    // Get the current quote
    const quoteQuery = `
      SELECT * FROM quotes
      WHERE id = $1
    `;
    
    const quoteResult = await pool.query(quoteQuery, [quoteId]);
    
    if (quoteResult.rows.length === 0) {
      return null;
    }
    
    const quote = quoteResult.rows[0] as Quote;
    
    // Update the quote, removing discount details
    const updateQuery = `
      UPDATE quotes
      SET 
        discount = 0,
        total_price = subtotal,
        promo_id = NULL,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const updateResult = await pool.query(updateQuery, [quoteId]);
    
    if (updateResult.rows.length === 0) {
      return null;
    }
    
    return updateResult.rows[0] as Quote;
  } catch (err) {
    log.error('Error removing promo from quote:', err);
    return null;
  }
}