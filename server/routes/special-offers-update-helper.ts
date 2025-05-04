// This file exists to provide helper methods for updating special offers image URLs
// Direct implementation to avoid circular dependencies
import { SpecialOffer } from '@shared/specialOffers';

// Create a singleton to store the map reference
class SpecialOffersStore {
  private static instance: SpecialOffersStore;
  private offersMap: Map<string, SpecialOffer[]> | null = null;

  private constructor() {}

  public static getInstance(): SpecialOffersStore {
    if (!SpecialOffersStore.instance) {
      SpecialOffersStore.instance = new SpecialOffersStore();
    }
    return SpecialOffersStore.instance;
  }

  public setMap(map: Map<string, SpecialOffer[]>): void {
    this.offersMap = map;
    console.log(`SpecialOffersStore: Map set with ${this.offersMap.size} entries`);
  }

  public getMap(): Map<string, SpecialOffer[]> | null {
    if (!this.offersMap) {
      console.log('SpecialOffersStore: WARNING - Map accessed before being set');
      return null;
    }
    return this.offersMap;
  }
}

// Export getter and setter for the map
export function setSpecialOffersMap(map: Map<string, SpecialOffer[]>): void {
  const store = SpecialOffersStore.getInstance();
  store.setMap(map);
}

export function getSpecialOffersMap(): Map<string, SpecialOffer[]> {
  const store = SpecialOffersStore.getInstance();
  const map = store.getMap();
  return map || new Map<string, SpecialOffer[]>();
}

export function updateSpecialOfferImageInMemory(offerId: string, imageUrl: string): boolean {
  try {
    const specialOffers = getSpecialOffersMap();
    
    console.log(`Special offers map contains ${specialOffers.size} entries`);
    
    let found = false;
    
    // Search for the offer in all clinics
    specialOffers.forEach((clinicOffers, clinicId) => {
      const offerIndex = clinicOffers.findIndex(o => o.id === offerId);
      if (offerIndex >= 0) {
        console.log(`Found offer with ID ${offerId} in clinic ${clinicId} at index ${offerIndex}`);
        // Update the offer's image URL
        clinicOffers[offerIndex] = {
          ...clinicOffers[offerIndex],
          banner_image: imageUrl,
          updated_at: new Date().toISOString()
        };
        specialOffers.set(clinicId, clinicOffers);
        found = true;
      }
    });
    
    if (!found) {
      console.error(`Special offer with ID ${offerId} not found`);
      return false;
    }
    
    console.log(`Successfully updated image URL for offer ID ${offerId}`);
    return true;
  } catch (error) {
    console.error('Error updating special offer image in memory:', error);
    return false;
  }
}