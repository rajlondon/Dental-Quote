import logger from './logger';

/**
 * Interface for tracking promo code application events
 */
interface PromoCodeAppliedEvent {
  promoId: string;
  promoCode: string;
  quoteId: number;
  userId?: number;
  clinicId?: number;
  discountAmount?: number;
  discountType?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface for tracking promo code removal events
 */
interface PromoCodeRemovedEvent {
  promoId: string;
  promoCode: string;
  quoteId: number;
  userId?: number;
  clinicId?: number;
  referrer?: string;
  metadata?: Record<string, any>;
}

/**
 * Track when a promo code is applied to a quote
 */
export function trackPromoCodeApplied(event: PromoCodeAppliedEvent): void {
  try {
    logger.info({
      event: 'promo_code_applied',
      timestamp: new Date().toISOString(),
      ...event
    });

    // In a real implementation, you might send this to an analytics service
    // such as Mixpanel, Google Analytics, or a custom analytics endpoint
  } catch (error) {
    logger.error('Error tracking promo code application:', error);
  }
}

/**
 * Track when a promo code is removed from a quote
 */
export function trackPromoCodeRemoved(event: PromoCodeRemovedEvent): void {
  try {
    logger.info({
      event: 'promo_code_removed',
      timestamp: new Date().toISOString(),
      ...event
    });

    // In a real implementation, you might send this to an analytics service
  } catch (error) {
    logger.error('Error tracking promo code removal:', error);
  }
}

/**
 * Track when a special offer is viewed
 */
export function trackSpecialOfferViewed(
  offerId: string,
  userId?: number,
  metadata?: Record<string, any>
): void {
  try {
    logger.info({
      event: 'special_offer_viewed',
      timestamp: new Date().toISOString(),
      offerId,
      userId,
      ...metadata
    });
  } catch (error) {
    logger.error('Error tracking special offer view:', error);
  }
}

/**
 * Track when a special offer is clicked
 */
export function trackSpecialOfferClicked(
  offerId: string,
  userId?: number,
  metadata?: Record<string, any>
): void {
  try {
    logger.info({
      event: 'special_offer_clicked',
      timestamp: new Date().toISOString(),
      offerId,
      userId,
      ...metadata
    });
  } catch (error) {
    logger.error('Error tracking special offer click:', error);
  }
}

/**
 * Track when a user starts a quote from a special offer
 */
export function trackQuoteStartedFromOffer(
  offerId: string,
  quoteId: number,
  userId?: number,
  metadata?: Record<string, any>
): void {
  try {
    logger.info({
      event: 'quote_started_from_offer',
      timestamp: new Date().toISOString(),
      offerId,
      quoteId,
      userId,
      ...metadata
    });
  } catch (error) {
    logger.error('Error tracking quote started from offer:', error);
  }
}

/**
 * Track when a quote with a promo code is completed
 */
export function trackQuoteCompletedWithPromo(
  promoId: string,
  promoCode: string,
  quoteId: number,
  userId?: number,
  clinicId?: number,
  metadata?: Record<string, any>
): void {
  try {
    logger.info({
      event: 'quote_completed_with_promo',
      timestamp: new Date().toISOString(),
      promoId,
      promoCode,
      quoteId,
      userId,
      clinicId,
      ...metadata
    });
  } catch (error) {
    logger.error('Error tracking quote completed with promo:', error);
  }
}

export default {
  trackPromoCodeApplied,
  trackPromoCodeRemoved,
  trackSpecialOfferViewed,
  trackSpecialOfferClicked,
  trackQuoteStartedFromOffer,
  trackQuoteCompletedWithPromo
};