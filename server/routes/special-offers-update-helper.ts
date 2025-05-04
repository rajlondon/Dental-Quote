/**
 * Helper module for updating special offers in memory
 * This is required because we're using an in-memory Map for special offers,
 * but we need to access it from different modules.
 */

import { SpecialOffer } from '@shared/specialOffers';
import { getWebSocketService } from '../services/websocketService';

// Singleton pattern for global access to special offers map
class SpecialOffersStore {
  private static instance: SpecialOffersStore;
  private offersMap: Map<string, SpecialOffer[]>;

  private constructor() {
    this.offersMap = new Map<string, SpecialOffer[]>();
  }

  public static getInstance(): SpecialOffersStore {
    if (!SpecialOffersStore.instance) {
      SpecialOffersStore.instance = new SpecialOffersStore();
    }
    return SpecialOffersStore.instance;
  }

  public getMap(): Map<string, SpecialOffer[]> {
    return this.offersMap;
  }

  public setMap(map: Map<string, SpecialOffer[]>): void {
    this.offersMap = map;
    console.log('Special offers map has been set in the store');
  }
}

// Get the singleton instance
const specialOffersStore = SpecialOffersStore.getInstance();

/**
 * Set the reference to the specialOffers Map
 * This should be called from special-offers-routes.ts when the module is initialized
 */
export function setSpecialOffersMap(map: Map<string, SpecialOffer[]>) {
  specialOffersStore.setMap(map);
  console.log('Special offers map has been set in update-helper');
}

/**
 * Get the special offers map
 */
export function getSpecialOffersMap(): Map<string, SpecialOffer[]> {
  return specialOffersStore.getMap();
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
  const specialOffersMap = specialOffersStore.getMap();

  if (!specialOffersMap) {
    console.error('Special offers map not initialized');
    return false;
  }

  // Debug: Log the map contents
  console.log(`Special offers map contains ${specialOffersMap.size} entries`);
  specialOffersMap.forEach((offers, clinicId) => {
    console.log(`Clinic ${clinicId} has ${offers.length} offers`);
    console.log(`Offer IDs: ${offers.map(o => o.id).join(', ')}`);
  });

  let found = false;
  let updatedOffer: SpecialOffer | null = null;
  let clinicId: string | null = null;

  // Search through all clinic offers to find the matching ID
  specialOffersMap.forEach((offers, cid) => {
    const index = offers.findIndex(offer => offer.id === offerId);
    if (index !== -1) {
      console.log(`Found offer with ID ${offerId} for clinic ${cid}`);
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
    console.log(`Successfully updated offer with ID ${offerId}`);
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

  console.error(`Special offer with ID ${offerId} not found`);
  return false;
}