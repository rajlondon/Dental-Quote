import logger from './logger';

// Enum for event types to ensure consistency
export enum AnalyticsEventType {
  PROMO_CODE_APPLIED = 'promo_code_applied',
  PROMO_CODE_REMOVED = 'promo_code_removed',
  QUOTE_CREATED = 'quote_created',
  QUOTE_VIEWED = 'quote_viewed',
  BOOKING_CREATED = 'booking_created',
  OFFER_CLICKED = 'offer_clicked',
  PACKAGE_VIEWED = 'package_viewed',
}

export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  userId?: number;
  userType?: 'anonymous' | 'authenticated';
  promoId?: string;
  promoCode?: string;
  quoteId?: number;
  bookingId?: number;
  offerId?: string;
  packageId?: string;
  discountAmount?: number;
  discountType?: string;
  referrer?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Track an analytics event
 * In a production environment, this would send data to an analytics service
 * like Mixpanel, Segment, or Google Analytics
 */
export function trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): void {
  try {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date()
    };
    
    // Log the event for now - in production this would send to an analytics service
    logger.info(`[ANALYTICS] ${event.eventType}`, { event: fullEvent });
    
    // In production environment, integrate with Mixpanel, Segment, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example integration with a hypothetical analytics service
      sendToAnalyticsService(fullEvent);
    }
  } catch (error) {
    logger.error('[ANALYTICS] Failed to track event:', error);
  }
}

/**
 * Track when a promo code is applied
 */
export function trackPromoCodeApplied(params: {
  promoId: string;
  promoCode: string;
  userId?: number;
  quoteId?: number;
  discountAmount?: number;
  discountType?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}): void {
  trackEvent({
    eventType: AnalyticsEventType.PROMO_CODE_APPLIED,
    userType: params.userId ? 'authenticated' : 'anonymous',
    ...params
  });
}

/**
 * Track when a promo code is removed
 */
export function trackPromoCodeRemoved(params: {
  promoId: string;
  promoCode: string;
  userId?: number;
  quoteId?: number;
  referrer?: string;
  metadata?: Record<string, any>;
}): void {
  trackEvent({
    eventType: AnalyticsEventType.PROMO_CODE_REMOVED,
    userType: params.userId ? 'authenticated' : 'anonymous',
    ...params
  });
}

/**
 * Track when a special offer is clicked
 */
export function trackOfferClicked(params: {
  offerId: string;
  userId?: number;
  referrer?: string;
  metadata?: Record<string, any>;
}): void {
  trackEvent({
    eventType: AnalyticsEventType.OFFER_CLICKED,
    userType: params.userId ? 'authenticated' : 'anonymous',
    ...params
  });
}

/**
 * Placeholder function for production analytics integration
 * Would be replaced with actual API calls to analytics services
 */
function sendToAnalyticsService(event: AnalyticsEvent): void {
  // This is where we'd integrate with an analytics service
  try {
    // Example: 
    // if (process.env.MIXPANEL_TOKEN) {
    //   const mixpanel = require('mixpanel').init(process.env.MIXPANEL_TOKEN);
    //   mixpanel.track(event.eventType, {
    //     distinct_id: event.userId || 'anonymous',
    //     ...event
    //   });
    // }
    
    logger.debug('[ANALYTICS] Event sent to analytics service', { event });
  } catch (error) {
    logger.error('[ANALYTICS] Failed to send to analytics service:', error);
  }
}