import logger from './logger';

/**
 * Track promo code application
 */
export interface PromoAppliedData {
  promoId: string;
  promoCode: string;
  quoteId: number | string;
  userId?: number;
  discountAmount?: number;
  discountType?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

export function trackPromoCodeApplied(data: PromoAppliedData): void {
  try {
    // Log the event
    logger.info('Promo code applied', {
      event: 'promo_applied',
      ...data,
      timestamp: new Date().toISOString()
    });
    
    // In a real implementation, this would send analytics data
    // to a tracking service like Google Analytics or an internal
    // analytics database
  } catch (error) {
    logger.error('Error tracking promo code application:', error);
  }
}

/**
 * Track promo code removal
 */
export interface PromoRemovedData {
  promoId: string;
  promoCode: string;
  quoteId: number | string;
  userId?: number;
  referrer?: string;
  metadata?: Record<string, any>;
}

export function trackPromoCodeRemoved(data: PromoRemovedData): void {
  try {
    // Log the event
    logger.info('Promo code removed', {
      event: 'promo_removed',
      ...data,
      timestamp: new Date().toISOString()
    });
    
    // In a real implementation, this would send analytics data
    // to a tracking service like Google Analytics or an internal
    // analytics database
  } catch (error) {
    logger.error('Error tracking promo code removal:', error);
  }
}

/**
 * Track promo code view/impression
 */
export interface PromoViewData {
  promoId: string;
  promoCode: string;
  userId?: number;
  context: string; // e.g., 'checkout', 'quote_page', 'admin_panel'
  referrer?: string;
  metadata?: Record<string, any>;
}

export function trackPromoCodeViewed(data: PromoViewData): void {
  try {
    // Log the event
    logger.info('Promo code viewed', {
      event: 'promo_viewed',
      ...data,
      timestamp: new Date().toISOString()
    });
    
    // In a real implementation, this would send analytics data
    // to a tracking service like Google Analytics or an internal
    // analytics database
  } catch (error) {
    logger.error('Error tracking promo code view:', error);
  }
}