import { SpecialOffer } from '@shared/specialOffers';

// Singleton store to hold a reference to the special offers map
// This allows us to update offers from other modules without circular imports
let specialOffersMapRef: Map<string, SpecialOffer[]> | null = null;

/**
 * Set the reference to the special offers map
 * Called during server initialization
 */
export function setSpecialOffersMap(map: Map<string, SpecialOffer[]>): void {
  specialOffersMapRef = map;
  console.log(`SpecialOffersStore: Map set with ${map.size} entries`);
}

/**
 * Get the reference to the special offers map
 */
export function getSpecialOffersMap(): Map<string, SpecialOffer[]> {
  if (!specialOffersMapRef) {
    console.warn('Warning: Special offers map not initialized. Creating empty map.');
    specialOffersMapRef = new Map<string, SpecialOffer[]>();
  }
  return specialOffersMapRef;
}

/**
 * Update an offer's image URL in memory
 * @param offerId The ID of the offer to update
 * @param imageUrl The new image URL
 * @returns boolean indicating success
 */
export function updateSpecialOfferImageInMemory(offerId: string, imageUrl: string): boolean {
  try {
    if (!specialOffersMapRef) {
      console.error('Error: Cannot update offer image - special offers map not initialized');
      return false;
    }
    
    // Find the offer in the map
    let found = false;
    
    specialOffersMapRef.forEach((clinicOffers, clinicId) => {
      const offerIndex = clinicOffers.findIndex(o => o.id === offerId);
      
      if (offerIndex >= 0) {
        // Update the offer's image URL
        clinicOffers[offerIndex] = {
          ...clinicOffers[offerIndex],
          banner_image: imageUrl,
          updated_at: new Date().toISOString()
        };
        
        // Update the clinic's offers in the map
        specialOffersMapRef!.set(clinicId, clinicOffers);
        
        console.log(`Updated image for offer ${offerId} in clinic ${clinicId}`);
        found = true;
      }
    });
    
    return found;
  } catch (error) {
    console.error('Error updating special offer image:', error);
    return false;
  }
}