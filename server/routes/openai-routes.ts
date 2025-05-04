import express, { Request, Response } from 'express';
import { 
  generateImage, 
  generateDentalTreatmentImage, 
  generateSpecialOfferImage,
  isOpenAIConfigured 
} from '../services/openai-service';
import { storage } from '../storage';
import multer from 'multer';
import { isAuthenticated, ensureRole } from '../middleware/auth';
import { upload } from '../file-upload';
import { catchAsync, AppError } from '../middleware/error-handler';
import { getWebSocketService } from '../services/websocketService';

const router = express.Router();

// Get reference to the existing WebSocket service to emit updates
// This doesn't create a new WebSocket server, just gets a reference to the existing one

/**
 * Check if OpenAI API is configured
 * GET /api/openai/status
 */
router.get('/status', (req: Request, res: Response) => {
  const configured = isOpenAIConfigured();
  
  res.json({
    success: true,
    configured,
    message: configured 
      ? 'OpenAI API is properly configured' 
      : 'OpenAI API is not configured. Set the OPENAI_API_KEY environment variable.'
  });
});

/**
 * Generate an image using DALL-E
 * POST /api/openai/generate-image
 */
router.post('/generate-image', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { prompt, size } = req.body;
  
  if (!prompt) {
    throw new AppError('Prompt is required', 400);
  }
  
  if (!isOpenAIConfigured()) {
    throw new AppError('OpenAI API is not configured', 503);
  }
  
  const result = await generateImage(prompt, size);
  
  res.json({
    success: true,
    data: result
  });
}));

/**
 * Generate a special offer image and save it to S3
 * POST /api/openai/special-offer-image
 */
router.post('/special-offer-image', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { offerId, offerTitle, offerType } = req.body;
  
  if (!offerId || !offerTitle) {
    throw new AppError('Offer ID and title are required', 400);
  }
  
  if (!isOpenAIConfigured()) {
    throw new AppError('OpenAI API is not configured', 503);
  }
  
  try {
    // Generate image using OpenAI
    console.log(`Generating special offer image for: ${offerTitle} (type: ${offerType || 'premium'})`);
    
    let imageUrl = '';
    
    try {
      // First try to generate with OpenAI
      const result = await generateSpecialOfferImage(offerTitle, offerType);
      
      if (!result.url) {
        throw new Error('No image URL returned from OpenAI');
      }
      
      imageUrl = result.url;
      console.log('Successfully generated image with OpenAI');
    } catch (aiError) {
      // If OpenAI fails (due to rate limits or any other reason), use static fallbacks
      console.warn(`OpenAI image generation failed, using fallback image: ${aiError instanceof Error ? aiError.message : String(aiError)}`);
      
      // Identify fallback image based on offer type/title
      let fallbackOptions = [];
      
      if (offerTitle.toLowerCase().includes('consultation')) {
        fallbackOptions = [
          '/images/offers/free-consultation.jpg',
          '/images/offers/consultation-clinic.jpg',
          '/images/offers/dental-consultation.jpg'
        ];
      } else if (offerTitle.toLowerCase().includes('implant')) {
        fallbackOptions = [
          '/images/offers/dental-implant-crown-bundle.jpg',
          '/images/offers/implant-treatment.jpg',
          '/images/treatments/illustrations/dental-implants1.png'
        ];
      } else if (offerTitle.toLowerCase().includes('airport') || offerTitle.toLowerCase().includes('transfer')) {
        fallbackOptions = [
          '/images/offers/luxury-airport-transfer.jpg',
          '/images/offers/vip-transfer.jpg',
          '/images/transportation/luxury-car.jpg'
        ];
      } else if (offerTitle.toLowerCase().includes('hotel')) {
        fallbackOptions = [
          '/images/offers/premium-hotel-deal.jpg',
          '/images/offers/premium-hotel-new.png',
          '/images/accommodations/premium-hotel.jpg'
        ];
      } else {
        // Generic special offer fallbacks
        fallbackOptions = [
          '/images/offers/premium-hotel-deal.jpg',
          '/images/offers/dental-special.jpg',
          '/images/clinics/modern-clinic.jpg'
        ];
      }
      
      // Select a fallback image based on a deterministic hash of the offer ID to ensure consistent images
      const hash = offerTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const fallbackPath = fallbackOptions[hash % fallbackOptions.length];
      
      // Add timestamp and random value to bust cache
      const timestamp = Date.now();
      const randomValue = Math.random().toString(36).substring(2, 10);
      imageUrl = `${fallbackPath}?t=${timestamp}&r=${randomValue}`;
      
      console.log(`Using fallback image: ${fallbackPath} for offer "${offerTitle}"`);
      console.log(`Cache-busting parameters added: ${imageUrl}`);
    }
    
    // Update the special offer image in memory
    const { updateSpecialOfferImageInMemory } = await import('./special-offers-update-helper');
    console.log('Updating special offer image for offer ID:', offerId);
    
    const updateResult = await updateSpecialOfferImageInMemory(offerId, imageUrl);
    
    if (!updateResult) {
      throw new AppError('Failed to update special offer image in database', 500);
    }
    
    console.log('Image updated successfully for offer ID:', offerId);
    
    // Send multiple WebSocket notifications to ensure clients refresh properly
    const wss = getWebSocketService();
    if (wss) {
      // First notification with cache invalidation command
      wss.broadcast(JSON.stringify({
        type: 'special_offer_updated',
        offerId,
        imageUrl,
        timestamp: Date.now(),
        command: 'invalidate_cache',
        forceReload: true
      }));
      
      // Second notification after a delay to ensure refresh
      setTimeout(() => {
        wss.broadcast(JSON.stringify({
          type: 'special_offer_updated',
          offerId,
          imageUrl,
          timestamp: Date.now() + 1000, // Ensure unique timestamp
          command: 'invalidate_cache',
          forceReload: true
        }));
        
        console.log('Sent second WebSocket notification to ensure client refresh');
      }, 2000);
      
      // Third notification with longer delay for clients that might have missed earlier ones
      setTimeout(() => {
        wss.broadcast(JSON.stringify({
          type: 'special_offer_updated',
          offerId,
          imageUrl,
          timestamp: Date.now() + 2000, // Another unique timestamp
          command: 'force_reload',
          forceReload: true
        }));
        
        console.log('Sent third WebSocket notification with force_reload command');
      }, 4000);
    }
    
    // Check if the image URL is from OpenAI (starts with https:// and contains openai)
    // Need to handle both blob.core.windows.net URLs and any future URL formats from OpenAI
    const isOpenAIUrl = imageUrl.startsWith('https://') && 
                        (imageUrl.includes('openai') || 
                         imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net'));
    
    // Add cache-busting timestamp to OpenAI URLs to ensure browsers reload the image
    if (isOpenAIUrl && !imageUrl.includes('?')) {
      const timestamp = Date.now();
      imageUrl = `${imageUrl}?t=${timestamp}`;
      console.log(`Added cache-busting to OpenAI URL: ${imageUrl}`);
    }
    
    console.log(`Image URL analysis for offer ${offerId}:`);
    console.log(` - Is recognized as OpenAI URL: ${isOpenAIUrl}`);
    console.log(` - Full URL starts with https://: ${imageUrl.startsWith('https://')}`);
    console.log(` - Contains 'openai': ${imageUrl.includes('openai')}`);
    console.log(` - Contains 'oaidalleapiprodscus.blob.core.windows.net': ${imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')}`);
    console.log(` - FULL URL for verification: ${imageUrl}`);
    
    try {
      // Enhanced image caching approach
      // Import the image caching service
      const { ImageCacheService } = await import('../utils/image-cache-service');
      
      // Timestamp to force unique cache identifier
      const uniqueTimestamp = Date.now();
      
      // For OpenAI generated images that would expire, use our aggressive caching system
      if (isOpenAIUrl) {
        console.log(`🔄 Aggressive caching for OpenAI image (offer ${offerId})`);
        
        try {
          // First, cache the image using our service
          await ImageCacheService.cacheImage(imageUrl);
          
          // Then get the versioned URL which will completely bypass browser cache
          const versionedUrl = ImageCacheService.getVersionedUrl(imageUrl);
          
          if (!versionedUrl) {
            throw new Error('Failed to get versioned URL after caching');
          }
          
          console.log(`✅ Image successfully cached, versioned URL: ${versionedUrl}`);
          
          // Update the special offer with the versioned URL to ensure cache busting
          await updateSpecialOfferImageInMemory(offerId, versionedUrl);
          
          // Return the versioned URL which completely bypasses browser cache
          res.json({
            success: true,
            data: {
              url: versionedUrl,
              originalUrl: imageUrl,
              offerId,
              cached: true,
              timestamp: Date.now(),
              fromVersioned: true
            }
          });
          
          // Send an additional WebSocket notification with the versioned URL
          const wss = getWebSocketService();
          if (wss) {
            setTimeout(() => {
              wss.broadcast(JSON.stringify({
                type: 'special_offer_image_refresh',
                payload: {
                  offerId,
                  imageUrl: versionedUrl,
                  timestamp: Date.now() + 3000,
                  versioned: true
                }
              }));
              console.log('Sent additional WebSocket notification with versioned URL');
            }, 5000);
          }
          
        } catch (innerCacheError) {
          console.error('Image caching failed:', innerCacheError);
          
          // If caching fails, fallback to the original URL
          res.json({
            success: true,
            data: {
              url: `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${uniqueTimestamp}&nocache=true`,
              offerId,
              cached: false,
              cacheError: true,
              errorMessage: innerCacheError instanceof Error ? innerCacheError.message : 'Unknown caching error',
              fromFallback: false
            }
          });
        }
      } else {
        // For non-OpenAI URLs, return as before with cache busting parameters
        const forcedUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${uniqueTimestamp}&nocache=true&version=${Math.random().toString(36).substring(2,10)}`;
        
        res.json({
          success: true,
          data: {
            url: forcedUrl,
            offerId,
            timestamp: uniqueTimestamp,
            fromFallback: !isOpenAIUrl
          }
        });
      }
    } catch (cacheError) {
      console.error('Error caching image:', cacheError);
      
      // If caching fails, return the original URL
      res.json({
        success: true,
        data: {
          url: imageUrl,
          offerId,
          fromFallback: !isOpenAIUrl,
          cacheError: true
        }
      });
    }
  } catch (error) {
    console.error('Error handling special offer image update:', error);
    throw new AppError(`Failed to update special offer image: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
  }
}));

/**
 * Generate images for dental treatments
 * POST /api/openai/treatment-image
 */
router.post('/treatment-image', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { treatmentType } = req.body;
  
  if (!treatmentType) {
    throw new AppError('Treatment type is required', 400);
  }
  
  if (!isOpenAIConfigured()) {
    throw new AppError('OpenAI API is not configured', 503);
  }
  
  const result = await generateDentalTreatmentImage(treatmentType);
  
  res.json({
    success: true,
    data: result
  });
}));

export default router;