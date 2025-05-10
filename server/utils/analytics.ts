/**
 * Analytics utilities for tracking user actions
 */

import axios from 'axios';
import log from './logger';

// You might have Mixpanel or similar analytics service key
const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN;
const ANALYTICS_ENABLED = !!MIXPANEL_TOKEN;

interface AnalyticsEvent {
  event: string;
  properties: {
    distinct_id: string;
    [key: string]: any;
  };
}

/**
 * Track an event in the analytics system
 * @param event The event name
 * @param userId The user ID
 * @param properties Additional properties to track
 * @returns Promise resolving to true if tracking was successful
 */
export async function trackEvent(
  event: string, 
  userId: string | number, 
  properties: Record<string, any> = {}
): Promise<boolean> {
  // Skip if analytics is disabled
  if (!ANALYTICS_ENABLED) {
    log.debug(`Analytics disabled, would have tracked: ${event} for user ${userId}`);
    return true;
  }

  try {
    // Format the event data
    const eventData: AnalyticsEvent = {
      event,
      properties: {
        distinct_id: userId.toString(),
        time: Date.now(),
        ...properties,
      },
    };

    // When using Mixpanel, you'd send something like this:
    if (MIXPANEL_TOKEN) {
      const response = await axios.post(
        'https://api.mixpanel.com/track',
        {
          data: Buffer.from(JSON.stringify([eventData])).toString('base64'),
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/plain',
          },
          params: {
            verbose: 1,
          },
          auth: {
            username: MIXPANEL_TOKEN,
            password: '',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(`Mixpanel API responded with status ${response.status}`);
      }

      return true;
    }

    // Default mock implementation for development
    log.info(`[ANALYTICS] Tracked event: ${event}`, { userId, ...properties });
    return true;
  } catch (err) {
    log.error(`Error tracking analytics event: ${event}`, err);
    return false;
  }
}

/**
 * Track a promo code application event
 * @param userId The user ID
 * @param promoId The promo ID
 * @param quoteId The quote ID
 * @param discountAmount The discount amount applied
 * @param success Whether the application was successful
 * @returns Promise resolving to true if tracking was successful
 */
export async function trackPromoCodeApplication(
  userId: string | number,
  promoId: string,
  quoteId: string,
  discountAmount: number,
  success: boolean
): Promise<boolean> {
  const event = success ? 'promo_code_applied' : 'promo_code_invalid';
  
  return trackEvent(event, userId, {
    promo_id: promoId,
    quote_id: quoteId,
    discount_amount: discountAmount,
    success,
  });
}

/**
 * Track a special offer selection event
 * @param userId The user ID
 * @param promoId The promo ID
 * @param source The source of the selection (e.g., 'homepage', 'email')
 * @returns Promise resolving to true if tracking was successful
 */
export async function trackSpecialOfferSelection(
  userId: string | number,
  promoId: string,
  source: string = 'homepage'
): Promise<boolean> {
  return trackEvent('special_offer_selected', userId, {
    promo_id: promoId,
    source,
  });
}