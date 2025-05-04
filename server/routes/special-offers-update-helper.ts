/**
 * Helper module for updating special offers in memory
 * This is required because we're using an in-memory Map for special offers,
 * but we need to access it from different modules.
 */

import { SpecialOffer } from '@shared/specialOffers';
import { getWebSocketService } from '../services/websocketService';

// Reference to the specialOffers Map from special-offers-routes.ts
let specialOffersMap: Map<string, SpecialOffer[]> | null = null;

/**
 * Set the reference to the specialOffers Map
 * This should be called from special-offers-routes.ts when the module is initialized
 */
export function setSpecialOffersMap(map: Map<string, SpecialOffer[]>) {
  specialOffersMap = map;
  console.log('Special offers map has been set in update-helper');
}

/**
 * Update an offer's image URL in memory
 * @param offerId The ID of the offer to update
 * @param imageUrl The new image URL
 * @returns true if the offer was found and updated, false otherwise
 */
export async function updateSpecialOfferImageInMemory(
  offerId: string,
  imageUrl: string
): Promise<boolean> {
  if (!specialOffersMap) {
    console.error('Special offers map not initialized');
    return false;
  }

  let found = false;
  let updatedOffer: SpecialOffer | null = null;
  let clinicId: string | null = null;

  // Search through all clinic offers to find the matching ID
  specialOffersMap.forEach((offers, cid) => {
    const index = offers.findIndex(offer => offer.id === offerId);
    if (index !== -1) {
      // Update the offer in the array
      offers[index] = {
        ...offers[index],
        banner_image: imageUrl,
        updated_at: new Date().toISOString()
      };
      found = true;
      updatedOffer = offers[index];
      clinicId = cid;
    }
  });

  if (found && updatedOffer && clinicId) {
    // Notify clients about the update via WebSocket
    const webSocketService = getWebSocketService();
    if (webSocketService) {
      webSocketService.broadcast(
        {
          type: 'special_offer_updated',
          payload: {
            offer: updatedOffer,
            clinicId
          },
          sender: {
            id: 'system',
            type: 'admin'
          }
        },
        'clinic'
      );
    }
    
    return true;
  }

  return false;
}