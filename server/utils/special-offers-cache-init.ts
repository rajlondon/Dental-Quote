/**
 * Special Offers Image Cache Initialization Utility
 * 
 * This module initializes the image cache for special offers when the server starts.
 * It goes through all special offers and ensures their banner images are cached.
 */

import { specialOffers } from '../routes/special-offers-routes-fixed';
import { ImageCacheService } from './image-cache-service';
import path from 'path';
import fs from 'fs';

// Type definition for special offer
interface SpecialOffer {
  id: string;
  title: string;
  banner_image?: string;
  [key: string]: any; // Allow other properties
}

/**
 * Initialize the cache for all special offer banner images
 * This ensures all images are available in our cache
 */
export async function initializeSpecialOfferImageCache(): Promise<void> {
  console.log('Initializing special offers image cache...');
  
  // Make sure the cache directory exists
  const cacheDir = path.join(process.cwd(), 'public', 'cached-images');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log(`Created cache directory: ${cacheDir}`);
  }
  
  // Track statistics
  let totalOffers = 0;
  let cachedImages = 0;
  let failedImages = 0;
  let alreadyCached = 0;
  
  // Process all special offers
  const allPromises: Promise<void>[] = [];
  
  specialOffers.forEach((clinicOffers, clinicId) => {
    clinicOffers.forEach((offer: SpecialOffer, index) => {
      totalOffers++;
      
      // Skip if the offer doesn't have a banner image
      if (!offer.banner_image) {
        return;
      }
      
      // Skip if the image is already cached
      if (offer.banner_image.includes('/cached-images/')) {
        alreadyCached++;
        return;
      }
      
      // Queue the cache operation
      const cachePromise = (async () => {
        try {
          // Handle both relative paths and absolute URLs
          let imageUrl = offer.banner_image;
          
          // Skip if no image URL is available
          if (!imageUrl) {
            console.warn(`⚠️ No banner image for offer "${offer.title}"`);
            return;
          }
          
          // If it's a relative path, convert to absolute URL for the current environment
          if (imageUrl.startsWith('/')) {
            // For local development or when running in Replit
            const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
            imageUrl = `${baseUrl}${imageUrl}`;
          }
          
          // Cache the image
          console.log(`Caching image for offer "${offer.title}": ${imageUrl}`);
          const cachedUrl = await ImageCacheService.cacheImage(imageUrl);
          
          if (cachedUrl) {
            // Update the offer with the cached URL
            clinicOffers[index].banner_image = cachedUrl;
            cachedImages++;
            console.log(`✅ Successfully cached image for "${offer.title}": ${cachedUrl}`);
          } else {
            failedImages++;
            console.error(`❌ Failed to cache image for "${offer.title}"`);
          }
        } catch (error) {
          failedImages++;
          console.error(`❌ Error caching image for offer "${offer.title}":`, error);
        }
      })();
      
      allPromises.push(cachePromise);
    });
  });
  
  // Wait for all cache operations to complete
  await Promise.all(allPromises);
  
  // Log the results
  console.log(`
Special offers image cache initialization complete:
- Total offers: ${totalOffers}
- Already cached: ${alreadyCached}
- Newly cached: ${cachedImages}
- Failed: ${failedImages}
  `);
  
  // Update the special offers map
  specialOffers.forEach((clinicOffers, clinicId) => {
    specialOffers.set(clinicId, clinicOffers);
  });
}

/**
 * Check if a URL is already cached in our system
 */
export function isImageUrlCached(url: string): boolean {
  return url.includes('/cached-images/');
}

/**
 * Get a list of all offers with non-cached images
 */
export function getOffersWithNonCachedImages(): { clinicId: string, offerId: string, title: string, imageUrl: string }[] {
  const results: { clinicId: string, offerId: string, title: string, imageUrl: string }[] = [];
  
  specialOffers.forEach((clinicOffers, clinicId) => {
    clinicOffers.forEach(offer => {
      if (offer.banner_image && !isImageUrlCached(offer.banner_image)) {
        results.push({
          clinicId,
          offerId: offer.id,
          title: offer.title,
          imageUrl: offer.banner_image
        });
      }
    });
  });
  
  return results;
}